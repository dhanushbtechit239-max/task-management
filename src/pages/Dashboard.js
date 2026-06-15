import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

export default function Dashboard({ setToken }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const token = localStorage.getItem("token");

  const load = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    axios.get(`${apiUrl}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setTasks(r.data))
      .catch(err => {
        if (err.response?.status === 401) handleLogout();
      });
  };

  useEffect(() => {
    load();
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const socket = io(apiUrl);
    socket.on("taskUpdated", load);
    return () => socket.disconnect();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/tasks`, 
        { title, description, dueDate: date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDescription("");
      setDate("");
    } catch (err) {
      alert("Error adding task");
    }
  };

  const toggle = async (id) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.put(`${apiUrl}/api/tasks/toggle/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      alert("Error toggling task");
    }
  };

  const remove = async (id) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.delete(`${apiUrl}/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      alert("Error deleting task");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Task Manager</h2>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      <form className="task-form" onSubmit={add}>
        <div className="form-group">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task Title" required/>
        </div>
        <div className="form-group">
          <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)"/>
        </div>
        <div className="form-group">
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        </div>
        <button type="submit">Add Task</button>
      </form>

      <ul className="task-list">
        {tasks.map(t=>(
          <li key={t._id} className={`task-item ${t.completed ? 'completed' : ''}`}>
            <div className="task-info">
              <h4>{t.title}</h4>
              {t.description && <p>{t.description}</p>}
              {t.dueDate && <p>Due: {new Date(t.dueDate).toLocaleDateString()}</p>}
            </div>
            <div className="task-actions">
              <button className="btn-toggle" onClick={()=>toggle(t._id)}>{t.completed ? "Undo" : "Complete"}</button>
              <button className="btn-delete" onClick={()=>remove(t._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
