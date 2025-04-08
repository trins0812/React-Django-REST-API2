import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:8000/api/tasks/';

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL);
        setTodos(response.data);
      } catch (err) {
        setError('Error fetching tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddTodo = async () => {
    if (inputValue.trim() === '') return;

    const newTodo = {
      title: inputValue,
      completed: false,
    };

    try {
      if (editingIndex !== null) {
        const updatedTodo = { ...todos[editingIndex], title: inputValue };
        await axios.put(`${API_URL}${todos[editingIndex].id}/`, updatedTodo);
        const updatedTodos = todos.map((todo, index) =>
          index === editingIndex ? updatedTodo : todo
        );
        setTodos(updatedTodos);
        setEditingIndex(null);
      } else {
        const response = await axios.post(API_URL, newTodo);
        setTodos([...todos, response.data]);
      }
      setInputValue('');
    } catch (err) {
      setError('Error adding/updating task');
    }
  };

  const handleEditTodo = (index) => {
    setInputValue(todos[index].title);
    setEditingIndex(index);
  };

  const handleDeleteTodo = async (index) => {
    try {
      await axios.delete(`${API_URL}${todos[index].id}/`);
      const updatedTodos = todos.filter((_, i) => i !== index);
      setTodos(updatedTodos);
    } catch (err) {
      setError('Error deleting task');
    }
  };

  const toggleCompletion = async (index) => {
    const updatedTodo = { ...todos[index], completed: !todos[index].completed };
    try {
      await axios.put(`${API_URL}${todos[index].id}/`, updatedTodo);
      const updatedTodos = todos.map((todo, i) =>
        i === index ? updatedTodo : todo
      );
      setTodos(updatedTodos);
    } catch (err) {
      setError('Error toggling task completion');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'Completed') return todo.completed;
    if (filter === 'Pending') return !todo.completed;
    return true; // For 'All'
  });

  return (
    <div className={`App ${isDarkMode ? 'dark' : ''}`}>
      <h1>To-Do List</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      
      <div className="controls">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add a new task..."
          aria-label="Task input"
        />
        <button onClick={handleAddTodo}>
          {editingIndex !== null ? 'Update' : 'Add'}
        </button>
      </div>
  
      <div className="filter-buttons">
        <button 
          className={filter === 'All' ? 'active' : ''} 
          onClick={() => setFilter('All')}
        >
          All
        </button>
        <button 
          className={filter === 'Completed' ? 'active' : ''} 
          onClick={() => setFilter('Completed')}
        >
          Completed
        </button>
        <button 
          className={filter === 'Pending' ? 'active' : ''} 
          onClick={() => setFilter('Pending')}
        >
          Pending
        </button>
      </div>
  
      <ul>
        {filteredTodos.length === 0 ? (
          <li>No tasks available</li>
        ) : (
          filteredTodos.map((todo, index) => (
            <li key={todo.id}>
              <span
                style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                onClick={() => toggleCompletion(index)}
              >
                {todo.title}
              </span>
              <button onClick={() => handleEditTodo(index)}>Edit</button>
              <button onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  handleDeleteTodo(index);
                }
              }}>Delete</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;