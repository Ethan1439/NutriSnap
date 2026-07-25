import { UserProfile, DailyLog, Meal } from '../types';

const PROFILE_KEY = 'nutrisnap_profile';
const LOGS_KEY = 'nutrisnap_logs';

export const getProfile = (): UserProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getDailyLogs = (): Record<string, DailyLog> => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : {};
};

export const getLogForDate = (date: string): DailyLog => {
  const logs = getDailyLogs();
  return logs[date] || { date, meals: [] };
};

export const addMealToLog = (date: string, meal: Meal) => {
  const logs = getDailyLogs();
  const currentLog = logs[date] || { date, meals: [] };
  currentLog.meals.push(meal);
  logs[date] = currentLog;
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const updateDailyWeight = (date: string, weight: number) => {
  const logs = getDailyLogs();
  const currentLog = logs[date] || { date, meals: [] };
  currentLog.weight = weight;
  logs[date] = currentLog;
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const clearData = () => {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(LOGS_KEY);
};
