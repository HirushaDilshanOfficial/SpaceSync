import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { NewBookingPage } from './pages/NewBookingPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<MyBookingsPage />} />
          <Route path="new-booking" element={<NewBookingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
