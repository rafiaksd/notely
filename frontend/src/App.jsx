import { useEffect, useState } from "react";
import api from "./api";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

function NoteItem({
  note,
  onToggleComplete,
  onDelete,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);

  const saveEdit = () => {
    if (editTitle.trim() && editTitle !== note.title) {
      onUpdate(note.id, editTitle);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex justify-between items-center mb-2">
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
            autoFocus
            className="w-full px-2 py-1 border rounded text-gray-700"
          />
        ) : (
          <>
            <h3
              className={`${
                note.completed ? "line-through text-gray-400" : "text-gray-800"
              } font-semibold`}
            >
              {note.title}
            </h3>

            {note.completed && note.completed_at && (
              <p className="text-xs text-gray-400 mt-1">
                Completed{" "}
                {new Date(note.completed_at).toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex space-x-2">
        {isEditing ? (
          <button
            onClick={saveEdit}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Save
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onToggleComplete(note.id)}
              className={`px-3 py-1 rounded text-white text-sm ${
                note.completed
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {note.completed ? "Undo" : "Done"}
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await api.get("notes/");
    setNotes(res.data.sort((a, b) => a.position - b.position));
  };

  const createNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await api.post("notes/", { title, position: notes.length });
    setTitle("");
    setNotes((prev) =>
      [...prev, res.data].sort((a, b) => a.position - b.position)
    );
  };

  const deleteNote = async (id) => {
    await api.delete(`notes/${id}/`);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const updateNote = async (id, newTitle) => {
    await api.patch(`notes/${id}/`, { title: newTitle });
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title: newTitle } : n))
    );
  };

  const toggleComplete = async (id) => {
    const note = notes.find((n) => n.id === id);
    const completed = !note.completed;
    const completed_at = completed ? new Date().toISOString() : null;

    await api.patch(`notes/${id}/`, { completed, completed_at });
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, completed, completed_at } : n
      )
    );
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const reordered = Array.from(activeNotes);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    setNotes((prev) => {
      const finished = prev.filter((n) => n.completed);
      return [...finished, ...reordered];
    });

    await Promise.all(
      reordered.map((note, i) => api.patch(`notes/${note.id}/`, { position: i }))
    );

    fetchNotes();
  };

  const activeNotes = notes
    .filter((n) => !n.completed)
    .sort((a, b) => a.position - b.position);

  const finishedNotes = notes
    .filter((n) => n.completed)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex flex-col items-center py-10 px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-indigo-600 drop-shadow-sm mb-2">
          Notely
        </h1>
        <p className="text-gray-500">Your elegant personal notetaker</p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={createNote}
        className="w-full max-w-lg bg-white shadow-md rounded-xl p-4 flex items-center space-x-3 mb-10 border border-gray-100"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Write a new note..."
          className="flex-1 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-lg border border-gray-200"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-500 text-white font-medium rounded-lg shadow hover:bg-indigo-600 transition"
        >
          Add
        </button>
      </form>

      {/* To-Do Section – Drag & Drop Only */}
      <div className="w-full max-w-5xl mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">To-Do</h2>

        {activeNotes.length === 0 ? (
          <p className="text-gray-400 italic text-center">
            No tasks yet — add one above!
          </p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todo">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {activeNotes.map((note, index) => (
                    <Draggable
                      key={note.id}
                      draggableId={`todo-${note.id}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={provided.draggableProps.style}
                          className={`custom-drag-cursor ${snapshot.isDragging ? "shadow-lg" : ""}`}
                        >
                          <NoteItem
                            note={note}
                            onToggleComplete={toggleComplete}
                            onDelete={deleteNote}
                            onUpdate={updateNote}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Finished Section */}
      <div className="w-full max-w-5xl mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Finished</h2>
        {finishedNotes.length === 0 ? (
          <p className="text-gray-400 italic text-center">
            No finished tasks yet!
          </p>
        ) : (
          finishedNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onToggleComplete={toggleComplete}
              onDelete={deleteNote}
              onUpdate={updateNote}
            />
          ))
        )}
      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        Built with React + Django + Tailwind
      </footer>
    </div>
  );
}

export default App;