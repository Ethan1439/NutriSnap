/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import LogMeal from './components/LogMeal';
import Community from './components/Community';
import Wearables from './components/Wearables';
import DailyReports from './components/DailyReports';
import { getProfile } from './lib/storage';
import Settings from './components/Settings';
import Guides from './components/Guides';

import Login from './components/Login';

export default function App() {
  useEffect(() => {
    const profile = getProfile();
    if (profile?.themePreference === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/log" element={<LogMeal />} />
        <Route path="/community" element={<Community />} />
        <Route path="/wearables" element={<Wearables />} />
        <Route path="/reports" element={<DailyReports />} />
        <Route path="/guides" element={<Guides />} />
      </Routes>
    </Router>
  );
}
