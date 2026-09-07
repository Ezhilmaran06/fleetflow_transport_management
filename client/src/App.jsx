import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

// Auth Pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

// Dashboard Pages
import DashboardPage from './features/dashboard/DashboardPage';
import LiveOperationsPage from './features/dashboard/LiveOperationsPage';
import LiveTrackingPage from './features/dashboard/LiveTrackingPage';
import OperationsCenterPage from './features/dashboard/OperationsCenterPage';

// Fleet Pages
import VehiclesPage from './features/fleet/VehiclesPage';
import VehicleDetailPage from './features/fleet/VehicleDetailPage';
import VehicleGroupsPage from './features/fleet/VehicleGroupsPage';
import DriversPage from './features/fleet/DriversPage';
import DriverDetailPage from './features/fleet/DriverDetailPage';
import DriverPerformancePage from './features/fleet/DriverPerformancePage';
import DocumentsPage from './features/fleet/DocumentsPage';

// Dispatch Pages
import TripsPage from './features/dispatch/TripsPage';
import TripDetailPage from './features/dispatch/TripDetailPage';
import DispatchBoardPage from './features/dispatch/DispatchBoardPage';
import DeliveriesPage from './features/dispatch/DeliveriesPage';
import DeliveryDetailPage from './features/dispatch/DeliveryDetailPage';
import RoutesPage from './features/dispatch/RoutesPage';
import CustomersPage from './features/dispatch/CustomersPage';

// Maintenance Pages
import MaintenancePage from './features/maintenance/MaintenancePage';
import ServiceSchedulePage from './features/maintenance/ServiceSchedulePage';

// Finance Pages
import FuelPage from './features/finance/FuelPage';
import ExpensesPage from './features/finance/ExpensesPage';
import BudgetsPage from './features/finance/BudgetsPage';
import CostAnalysisPage from './features/finance/CostAnalysisPage';

// Safety Pages
import IncidentsPage from './features/safety/IncidentsPage';
import IncidentDetailPage from './features/safety/IncidentDetailPage';
import CompliancePage from './features/safety/CompliancePage';
import DriverSafetyPage from './features/safety/DriverSafetyPage';

// Analytics & Reports
import AnalyticsHubPage from './features/analytics/AnalyticsHubPage';
import ReportBuilderPage from './features/reports/ReportBuilderPage';
import SavedReportsPage from './features/reports/SavedReportsPage';

// Communication Pages
import NotificationsPage from './features/communication/NotificationsPage';
import MessagesPage from './features/communication/MessagesPage';
import AnnouncementsPage from './features/communication/AnnouncementsPage';

// Admin Pages
import UsersPage from './features/admin/UsersPage';
import RolesPermissionsPage from './features/admin/RolesPermissionsPage';
import AuditLogsPage from './features/admin/AuditLogsPage';
import IntegrationsPage from './features/admin/IntegrationsPage';
import SettingsPage from './features/admin/SettingsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard & Operations */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dashboard/live-ops" element={<LiveOperationsPage />} />
        <Route path="live-operations" element={<LiveOperationsPage />} />
        <Route path="dashboard/tracking" element={<LiveTrackingPage />} />
        <Route path="live-tracking" element={<LiveTrackingPage />} />
        <Route path="dashboard/operations-center" element={<OperationsCenterPage />} />
        <Route path="operations-center" element={<OperationsCenterPage />} />

        {/* Fleet */}
        <Route path="fleet/vehicles" element={<VehiclesPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="fleet/vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="fleet/groups" element={<VehicleGroupsPage />} />
        <Route path="vehicle-groups" element={<VehicleGroupsPage />} />
        <Route path="fleet/drivers" element={<DriversPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="fleet/drivers/:id" element={<DriverDetailPage />} />
        <Route path="drivers/:id" element={<DriverDetailPage />} />
        <Route path="fleet/performance" element={<DriverPerformancePage />} />
        <Route path="driver-performance" element={<DriverPerformancePage />} />
        <Route path="fleet/documents" element={<DocumentsPage />} />
        <Route path="documents" element={<DocumentsPage />} />

        {/* Dispatch */}
        <Route path="dispatch/trips" element={<TripsPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="dispatch/trips/:id" element={<TripDetailPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="dispatch/board" element={<DispatchBoardPage />} />
        <Route path="dispatch-board" element={<DispatchBoardPage />} />
        <Route path="dispatch/deliveries" element={<DeliveriesPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="dispatch/deliveries/:id" element={<DeliveryDetailPage />} />
        <Route path="deliveries/:id" element={<DeliveryDetailPage />} />
        <Route path="dispatch/routes" element={<RoutesPage />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="dispatch/customers" element={<CustomersPage />} />
        <Route path="customers" element={<CustomersPage />} />

        {/* Maintenance */}
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="maintenance/work-orders" element={<MaintenancePage />} />
        <Route path="maintenance/schedule" element={<ServiceSchedulePage />} />
        <Route path="service-schedule" element={<ServiceSchedulePage />} />

        {/* Finance */}
        <Route path="finance/fuel" element={<FuelPage />} />
        <Route path="fuel" element={<FuelPage />} />
        <Route path="finance/expenses" element={<ExpensesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="finance/budgets" element={<BudgetsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="finance/costs" element={<CostAnalysisPage />} />
        <Route path="cost-analysis" element={<CostAnalysisPage />} />

        {/* Safety */}
        <Route path="safety/incidents" element={<IncidentsPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="safety/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="incidents/:id" element={<IncidentDetailPage />} />
        <Route path="safety/compliance" element={<CompliancePage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="safety/scores" element={<DriverSafetyPage />} />
        <Route path="driver-safety" element={<DriverSafetyPage />} />

        {/* Analytics & Reports */}
        <Route path="analytics" element={<AnalyticsHubPage />} />
        <Route path="analytics/hub" element={<AnalyticsHubPage />} />
        <Route path="reports" element={<ReportBuilderPage />} />
        <Route path="reports/builder" element={<ReportBuilderPage />} />
        <Route path="reports/saved" element={<SavedReportsPage />} />

        {/* Communication */}
        <Route path="communication/notifications" element={<NotificationsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="communication/messages" element={<MessagesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="communication/announcements" element={<AnnouncementsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />

        {/* Administration */}
        <Route path="admin/users" element={<UsersPage />} />
        <Route path="admin/roles" element={<RolesPermissionsPage />} />
        <Route path="admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="admin/integrations" element={<IntegrationsPage />} />
        <Route path="admin/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
