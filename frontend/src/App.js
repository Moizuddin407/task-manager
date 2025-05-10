import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error('Error fetching tasks:', err));
  }, []);

  const addTask = () => {
    if (!title) return;
    axios.post('http://localhost:5000/tasks', { title, completed: false })
      .then(res => {
        setTasks([...tasks, res.data]);
        setTitle('');
      })
      .catch(err => console.error('Error adding task:', err));
  };

  const toggleTask = (id, completed) => {
    axios.put(`http://localhost:5000/tasks/${id}`, { completed: !completed })
      .then(res => {
        setTasks(tasks.map(task => task._id === id ? res.data : task));
      })
      .catch(err => console.error('Error updating task:', err));
  };

  const deleteTask = (id) => {
    axios.delete(`http://localhost:5000/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter(task => task._id !== id));
      })
      .catch(err => console.error('Error deleting task:', err));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Task Manager</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter task title"
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={addTask} style={{ padding: '8px 16px' }}>
          Add Task
        </button>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task._id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task._id, task.completed)}
              style={{ marginRight: '10px' }}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none', flexGrow: 1 }}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task._id)}
              style={{ padding: '5px 10px', backgroundColor: '#ff4444', color: 'white', border: 'none' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;