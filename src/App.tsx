import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { StationLayout } from './components/layout/StationLayout';
import { SubStationLayout } from './components/layout/SubStationLayout';
import { AuthPage } from './pages/auth/AuthPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { SealsPage } from './pages/seals/SealsPage';
import { StationsPage } from './pages/stations/StationsPage';
import { UsersPage } from './pages/users/UsersPage';
import { LogsPage } from './pages/logs/LogsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { StationDashboardPage } from './pages/station/DashboardPage';
import { StationSealsPage } from './pages/station/SealsPage';
import { SubStationDashboardPage } from './pages/substation/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Admin Portal */}
        <Route
          path="/"
          element={<Layout />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="seals" element={<SealsPage />} />
          <Route path="stations" element={<StationsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Station Portal */}
        <Route path="/station" element={<StationLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StationDashboardPage />} />
          <Route path="seals" element={<StationSealsPage />} />
          <Route path="location" element={<div>Location</div>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Sub-Station Portal */}
        <Route path="/substation" element={<SubStationLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SubStationDashboardPage />} />
          <Route path="seals" element={<StationSealsPage />} />
          <Route path="tracking" element={<div>Tracking</div>} />
          <Route path="damaged" element={<div>Damaged Seals</div>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all redirect to auth */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
