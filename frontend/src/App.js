import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FacilitiesPage from './components/facilities/FacilitiesPage';
import FacilitiesUserPage from './components/facilities/FacilitiesUserPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FacilitiesPage />} />
          <Route path="/user" element={<FacilitiesUserPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;