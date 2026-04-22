import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4fa' }}>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
        <Outlet />
      </main>
    </div>
  );
}
