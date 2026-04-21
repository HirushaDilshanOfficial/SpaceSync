import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { NewBookingPage } from './pages/NewBookingPage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import FacilitiesPage from './components/facilities/FacilitiesPage';
import FacilitiesUserPage from './components/facilities/FacilitiesUserPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<MyBookingsPage />} />
          <Route path="new-booking" element={<NewBookingPage />} />
          <Route path="admin" element={<AdminBookingsPage />} />
          <Route path="facilities" element={<FacilitiesPage />} />
          <Route path="facilities/user" element={<FacilitiesUserPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
