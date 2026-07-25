/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import LogMeal from './components/LogMeal';
import Community from './components/Community';
import Wearables from './components/Wearables';
import DailyReports from './components/DailyReports';

import Login from './components/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/log" element={<LogMeal />} />
        <Route path="/community" element={<Community />} />
        <Route path="/wearables" element={<Wearables />} />
        <Route path="/reports" element={<DailyReports />} />
      </Routes>
    </BrowserRouter>
  );
}
