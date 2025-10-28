import React, { useEffect, useState } from "react";
import api from "./api";

function NoteItem({ note, onToggleComplete, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex justify-between items-center mb-2">
      <div>
        <h3 className={`${note.completed ? "line-through text-gray-400" : "text-gray-800"} font-semibold`}>
          {note.title}
        </h3>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onMoveUp(note.id)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          ↑
        </button>
        <button
          onClick={() => onMoveDown(note.id)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          ↓
        </button>
        <button
          onClick={() => onToggleComplete(note.id)}
          className={`px-3 py-1 rounded text-white text-sm ${note.completed ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}`}
        >
          {note.completed ? "Undo" : "Done"}
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Delete
        </button>
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

const moveNote = async (id, direction, completed) => {
  const sectionNotes = notes.filter((n) => n.completed === completed);
  const index = sectionNotes.findIndex((n) => n.id === id);
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= sectionNotes.length) return;

  // Create a new array with swapped positions
  const newSection = [...sectionNotes];
  [newSection[index], newSection[newIndex]] = [newSection[newIndex], newSection[index]];

  // Update positions in backend
  await Promise.all(
    newSection.map((note, i) =>
      api.patch(`notes/${note.id}/`, { position: i })
    )
  );

  // Update local state with new positions
  const updatedSection = newSection.map((note, i) => ({
    ...note,
    position: i,
  }));

  // Merge with other section and ensure correct sorting
  const otherSection = notes.filter((n) => n.completed !== completed);
  const updatedNotes = [...otherSection, ...updatedSection].sort((a, b) => a.position - b.position);

  // Force state update to trigger re-render
  setNotes([...updatedNotes]);
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
        <p className="text-gray-500">Your elegant personal notetaker ✨</p>
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

      {/* To-Do Section */}
      <div className="w-full max-w-5xl mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">To-Do</h2>
        {activeNotes.length === 0 ? (
          <p className="text-gray-400 italic text-center">
            No tasks yet — add one above!
          </p>
        ) : (
          activeNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onToggleComplete={toggleComplete}
              onDelete={deleteNote}
              onMoveUp={(id) => moveNote(id, -1, false)}
              onMoveDown={(id) => moveNote(id, 1, false)}
            />
          ))
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
              onMoveUp={(id) => moveNote(id, -1, true)}
              onMoveDown={(id) => moveNote(id, 1, true)}
            />
          ))
        )}
      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        Built with 💜 using React + Django + Tailwind
      </footer>
    </div>
  );
}

export default App;
