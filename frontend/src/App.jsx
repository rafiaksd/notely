/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "./api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function NoteItem({ note, onToggleComplete, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editSection, setEditSection] = useState(note.section);
  const [editDeadline, setEditDeadline] = useState(
    note.deadline ? note.deadline.slice(0, 16) : ""
  );

  // Helper to determine background color
  const getBackgroundColor = () => {
    if (note.completed) {
      // If completed and has deadline → red
      if (note.deadline) return "bg-red-500";
      // Otherwise, keep original section color
      switch (note.sectionBeforeCompleted || note.section) {
        case "immediate":
          return "bg-lime-300";
        case "todo":
          return "bg-sky-100";
        case "later":
          return "bg-yellow-200";
        default:
          return "bg-gray-200";
      }
    } else {
      switch (note.section) {
        case "immediate":
          return "bg-lime-300";
        case "todo":
          return "bg-sky-100";
        case "later":
          return "bg-yellow-200";
        default:
          return "bg-gray-200";
      }
    }
  };

  const saveEdit = () => {
    const updatedData = {
      title: editTitle.trim() || note.title,
      section: editSection,
      deadline: editDeadline || null,
    };
    onUpdate(note.id, updatedData);
    setIsEditing(false);
  };

  return (
    <>
      <div
        className={`relative ${getBackgroundColor()} border-4 rounded-xl p-3 mb-5 shadow-[6px_6px_0_rgba(0,0,0,0.85)]`}
      >
        
        {/* Display Title */}
        <h3
          className={`font-bold text-lg whitespace-pre-wrap ${
            note.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {note.title}
        </h3>
        {note.completed && note.completed_at && (
          <div className="mt-4 inline-block bg-orange-400 text-black text-sm font-semibold px-2 py-1 rounded">
            {new Date(note.completed_at).toLocaleString("en-BD", {
              dateStyle: "short",
              timeStyle: "short",
              timeZone: "Asia/Dhaka",
            })}
          </div>
        )}

        {/* Deadline badge */}
        {note.deadline && !note.completed && (
          <div className="mt-2 inline-block bg-red-400 text-black text-sm font-bold px-2 py-1 rounded">
            {new Date(note.deadline).toLocaleString("en-BD", {
              dateStyle: "short",
              timeStyle: "short",
              timeZone: "Asia/Dhaka",
            })}
          </div>
        )}

        {/* ✏️ button */}
        <button
          onClick={() => setIsEditing(true)}
          className="relative ml-[90%] md:ml-[95%] bg-blue-900 text-white rounded-lg w-8 h-8 cursor-pointer font-extrabold select-none text-xl shadow-md hover:bg-sky-600"
        >
          ✏️
        </button>
      </div>

      {isEditing && (
        <div className="mt-3 p-3 bg-white border-2 border-sky-500 rounded-lg shadow-md">
          <button
              onClick={() => onToggleComplete(note.id)}
              className="top-2 right-16 bg-green-300 text-white
                    rounded-lg w-8 h-8 cursor-pointer font-extrabold 
                    shadow-md hover:bg-sky-300 mb-2"
            >
              ✔️
          </button>
          <textarea
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border-2 border-sky-500 rounded mb-2 resize-none"
            rows={3}
          ></textarea>

          {/* Character counter */}
          <div className="text-sm text-gray-500 mb-2 -mt-2">
            {editTitle.length}/2000
          </div>
          
          <input
            type="datetime-local"
            value={editDeadline}
            onChange={(e) => setEditDeadline(e.target.value)}
            className="w-full px-3 py-2 border-2 border-sky-500 rounded mb-2"
          />
          <select
            value={editSection}
            onChange={(e) => setEditSection(e.target.value)}
            className="w-full px-3 py-2 border-2 border-sky-500 rounded mb-2"
          >
            <option value="immediate">Immediate</option>
            <option value="todo">To-Do</option>
            <option value="later">Will Get Around To It</option>
          </select>

          <div className="flex justify-between mt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-300 rounded font-bold"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="px-3 py-1 bg-sky-500 text-white rounded font-bold"
            >
              Save
            </button>
            
            <button
              onClick={() => {
                onDelete(note.id);
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded font-bold"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// helper function
function roundToNearestMinute(date) {
  const ms = date.getTime();
  const minute = 60000;
  return new Date(Math.round(ms / minute) * minute);
}

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("todo");
  const [deadline, setDeadline] = useState("");
  
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState("");

  useEffect(() => {
    fetchNotes();
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await api.get("quotes/");
      setQuotes(res.data);
    } catch (err) {
      console.error("Failed to load quotes", err);
    }
  };

  const addQuote = async () => {
    if (!newQuote.trim()) return;

    const res = await api.post("quotes/", { text: newQuote });
    setQuotes(prev => [...prev, res.data]);
    setNewQuote("");
  };

  const deleteQuote = async (id) => {
    try {
      await api.delete(`quotes/${id}/`);
      setQuotes(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error("Failed to delete quote", err);
    }
  };

  const fetchNotes = async () => {
    const res = await api.get("notes/");
    setNotes(res.data);
  };

  const createNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await api.post("notes/", {
      title,
      section,
      deadline: deadline || null,
      position: notes.filter((n) => n.section === section).length,
    });

    setTitle("");
    setDeadline("");
    setNotes((prev) => [...prev, res.data]);
  };

  const deleteNote = async (id) => {
    await api.delete(`notes/${id}/`);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const updateNote = async (id, updatedData) => {
    await api.patch(`notes/${id}/`, updatedData);
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updatedData } : n))
    );
  };

  const toggleComplete = async (id) => {
    const note = notes.find((n) => n.id === id);
    const completed = !note.completed;
    const completed_at = completed ? new Date().toISOString() : null;

    await api.patch(`notes/${id}/`, { completed, completed_at });
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              completed,
              completed_at,
              sectionBeforeCompleted: completed ? n.section : undefined,
              section: completed ? "finished" : n.section,
            }
          : n
      )
    );
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Only reorder if index changed
    if (source.index === destination.index) return;

    const section = source.droppableId;

    // Filter notes in the same section
    const sectionNotes = notes
      .filter((n) => n.section === section && !n.completed)
      .sort((a, b) => a.position - b.position);

    // Reorder
    const reordered = Array.from(sectionNotes);
    const [movedNote] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, movedNote);

    // Update main notes array with new positions
    const updatedNotes = notes.map((n) => {
      const updated = reordered.find((r) => r.id === n.id);
      return updated ? { ...n, position: reordered.indexOf(updated) } : n;
    });

    setNotes(updatedNotes);

    // Update backend positions
    await Promise.all(
      reordered.map((note, i) => api.patch(`notes/${note.id}/`, { position: i }))
    );
  };

  const immediateNotes = notes
    .filter((n) => n.section === "immediate" && !n.completed)
    .sort((a, b) => a.position - b.position);

  const todoNotes = notes
    .filter((n) => n.section === "todo" && !n.completed)
    .sort((a, b) => a.position - b.position);

  const laterNotes = notes
    .filter((n) => n.section === "later" && !n.completed)
    .sort((a, b) => a.position - b.position);

  const completedNotes = notes
    .filter((n) => n.completed)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  const deadlineNotes = notes
    .filter((n) => n.deadline && !n.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <>
      {deadlineNotes.length > 0 && (
        <div className="absolute sticky top-4 left-[85vw] md:right-4 w-60 sm:w-68 md:w-84 bg-red-100 border-4 border-red-400 rounded-xl shadow-[8px_8px_0_rgba(0,0,0,0.25)] z-50 p-1">
          <h3 className="font-extrabold text-red-600 mb-3 text-lg tracking-wide drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
            🔔 Upcoming Deadlines
          </h3>
          {deadlineNotes.map((note) => (
            <div
              key={note.id}
              className="mb-3 p-2 rounded-lg bg-red-200 border-2 border-red-300 shadow-[4px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)] transition-shadow"
            >
              <p className="text-red-700 font-bold uppercase text-sm mb-1 whitespace-pre-wrap">{note.title}</p>
              <p className="text-xs text-gray-800">
                {new Date(note.deadline).toLocaleString("en-BD", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "Asia/Dhaka",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      

      <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col items-center py-10 px-6">

        {/* QUOTES */}
          {quotes.length > 0 && (
          <div className="max-w-[300px] sm:max-w-[50vw] 
                          mb-4 mr-auto 
                          lg:ml-[40px] xl:ml-[100px] 2xl:ml-[20vw]">

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="relative group
                            bg-yellow-100 border-2 border-black 
                            rounded-md px-2 py-1 
                            text-[9px] leading-tight text-gray-800
                            shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                            hover:scale-105 transition-transform"
                >
                  {quote.text}

                  {/* ❌ DELETE BUTTON (hover only) */}
                  <button
                    onClick={() => deleteQuote(quote.id)}
                    className="absolute top-[-6px] right-[-6px]
                              hidden group-hover:flex
                              items-center justify-center
                              w-4 h-4
                              bg-red-600 text-white
                              text-[10px] font-bold
                              border-2 border-black
                              rounded-full
                              shadow-[1px_1px_0_rgba(0,0,0,0.8)]
                              hover:bg-red-700"
                    title="Delete quote"
                  >
                    ×
                  </button>
                </div>

              ))}
            </div>
          </div>
        )}

        {/* INSERT QUOTE */}
        <div className="mt-2 flex">
          <input
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            placeholder="Add quote"
            className="text-[9px] px-1 py-[2px] border rounded w-full"
          />
          <button
            onClick={addQuote}
            className="text-[9px] mt-1 bg-black text-white px-2 rounded"
          >
            Add
          </button>
        </div>
        
        <h1 className="text-5xl font-extrabold text-sky-600 drop-shadow-[4px_4px_0_rgba(0,0,0,0.15)] mb-2 mr-auto lg:ml-[40px] xl:ml-[100px] 2xl:ml-[25vw]">
          Notely
        </h1>

        {/* FORM to CREATE TASK */}
        <form
          onSubmit={createNote}
          className="max-w-[300px] space-y-2 mb-6 mr-auto lg:ml-[40px] xl:ml-[100px] 2xl:ml-[20vw] mt-20"
        >
          <textarea
            placeholder="New note..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2 w-[220px] sm:w-[50vw] rounded border-4 border-sky-500 shadow-[4px_4px_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            rows={3} // Adjust how many lines you want visible initially
          ></textarea>

          {/* Character counter */}
          <div className="text-sm text-gray-500 -mt-2">
            {title.length}/2000
          </div>
          
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-[220px] px-4 py-2 border-4 border-sky-500 rounded shadow-[4px_4px_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="px-3 py-2 rounded border-4 border-sky-500 shadow-[4px_4px_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="immediate">Immediate</option>
            <option value="todo">To-Do</option>
            <option value="later">Will Get Around To It</option>
          </select>
          <br />
          <button className="px-5 py-2 bg-sky-500 text-white font-bold rounded shadow-[3px_3px_0_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-shadow">
            Add
          </button>
        </form>

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* IMMEDIATE NOTES */}
          {immediateNotes.length > 0 && (
            <div className="w-full max-w-5xl mb-6 bg-blue-300 p-12 rounded-2xl">
              <h2 className="text-4xl font-extrabold text-black mb-3">Immediate</h2>
              <Droppable droppableId="immediate">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {immediateNotes.map((note, index) => (
                      <Draggable key={note.id} draggableId={`immediate-${note.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
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
            </div>
          )}

          {/* TO-DO */}
          {todoNotes.length > 0 && (
            <div className="w-full max-w-5xl mb-6">
              <h2 className="text-2xl font-bold text-sky-600 mb-3 neobrutal-text-shadow">
                To-Do
              </h2>
              <Droppable droppableId="todo">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {todoNotes.map((note, index) => (
                      <Draggable key={note.id} draggableId={`todo-${note.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className={`custom-drag-cursor ${
                              snapshot.isDragging ? "shadow-lg transform scale-105" : ""
                            }`}
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
            </div>
          )}

          {/* WILL GET AROUND TO IT */}
          {laterNotes.length > 0 && (
            <div className="w-full max-w-5xl mb-6">
              <h2 className="text-2xl font-bold text-sky-600 mb-3 neobrutal-text-shadow">
                Will Get Around To It
              </h2>
              <Droppable droppableId="later">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {laterNotes.map((note, index) => (
                      <Draggable key={note.id} draggableId={`later-${note.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className={`custom-drag-cursor ${
                              snapshot.isDragging ? "shadow-lg transform scale-105" : ""
                            }`}
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
            </div>
          )}

          {/* COMPLETED */}
          {completedNotes.length > 0 && (
            <div className="w-full max-w-5xl mb-6">
              <h2 className="text-2xl font-bold text-sky-600 mb-3 neobrutal-text-shadow">
                Completed
              </h2>
              <div className="space-y-2">
                {completedNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    onToggleComplete={toggleComplete}
                    onDelete={deleteNote}
                    onUpdate={updateNote}
                  />
                ))}
              </div>
            </div>
          )}
        </DragDropContext>
      </div>
    </>
  );
}

export default App;
