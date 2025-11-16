// src/NoteItem.jsx
import React, { useState } from "react";

export default function NoteItem({ note, onToggleComplete, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);

  const handleUpdate = () => {
    onUpdate(note.id, title);
    setIsEditing(false);
  };

  return (
    <div
      className={`p-4 rounded-lg shadow ${
        note.completed ? "bg-gray-300 line-through" : "bg-white"
      }`}
    >
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-2 py-1 flex-1 rounded"
          />
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span>{note.title}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-400 px-2 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => onToggleComplete(note.id)}
              className={`px-2 py-1 rounded ${
                note.completed ? "bg-gray-500 text-white" : "bg-green-500 text-white"
              }`}
            >
              {note.completed ? "Undo" : "Done"}
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
