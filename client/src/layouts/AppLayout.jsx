import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import CommandPalette from './CommandPalette';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('fleetflow_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('fleetflow_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: 40, height: 40, marginBottom: 16 }}
          />
          <div>Initializing FleetFlow OS...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapsed={toggleCollapsed}
        isMobileOpen={isMobileOpen}
        closeMobile={closeMobile}
      />

      {/* Main Container */}
      <div className="main-content">
        <Navbar
          toggleMobileSidebar={toggleMobileSidebar}
          openCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav toggleMobileSidebar={toggleMobileSidebar} />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
