import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { NewBookingPage } from './pages/NewBookingPage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import { ReportIncidentPage } from './pages/ReportIncidentPage';
import { IncidentDashboardPage } from './pages/IncidentDashboardPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { MaintenanceCalendarPage } from './pages/MaintenanceCalendarPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
          <Route path="report-incident" element={<ReportIncidentPage />} />
          <Route path="incidents" element={<IncidentDashboardPage />} />
          <Route path="incidents/:id" element={<IncidentDetailsPage />} />
          <Route path="maintenance-calendar" element={<MaintenanceCalendarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
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
