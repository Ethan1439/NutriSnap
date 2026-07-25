import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getLogForDate, getDailyLogs, updateDailyWater, awardBadge, saveProfile } from '../lib/storage';
import { UserProfile, DailyLog } from '../types';
import { format, subDays } from 'date-fns';
import { Plus, Camera, Activity, Watch, Users, Calendar, X, Droplets, Minus, Moon, Sun, Medal, Star, Trophy, Settings, Github } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);

  useEffect(() => {
    const userProfile = getProfile();
    if (!userProfile) {
      navigate('/login');
      return;
    }
    if (!userProfile.isEmailVerified) {
      navigate('/login');
      return;
    }
    setProfile(userProfile);
    
    if (userProfile.themePreference === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    const today = format(new Date(), 'yyyy-MM-dd');
    setLog(getLogForDate(today));
  }, [navigate]);

  useEffect(() => {
    if (!profile || !log) return;
    
    // Evaluate badges
    const totalCals = log.meals.reduce((sum, m) => sum + m.calories, 0);
    const badgesToAward: string[] = [];
    
    if (log.meals.length > 0) badgesToAward.push('First Meal');
    if ((log.water || 0) >= 8) badgesToAward.push('Hydration Hero');
    if (totalCals > 0 && Math.abs(totalCals - profile.calorieTarget) <= 100) badgesToAward.push('Calorie Crusher');

    let earnedNew = false;
    badgesToAward.forEach(b => {
      if (awardBadge(b)) {
        setNewBadge(b);
        earnedNew = true;
        setTimeout(() => setNewBadge(null), 5000);
        // Refresh profile
        const updated = getProfile();
        if (updated) setProfile(updated);
      }
    });

    if (earnedNew) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
      });
    }
  }, [log, profile]);

  if (!profile || !log) return null;

  const totalCalories = log.meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = log.meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = log.meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = log.meals.reduce((sum, meal) => sum + meal.fat, 0);

  const caloriePercent = Math.min((totalCalories / profile.calorieTarget) * 100, 100);

  const generateWeeklyDigest = () => {
    const logs = getDailyLogs();
    let totalCal = 0;
    let totalDaysWithData = 0;
    const past7Days = Array.from({length: 7}, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    
    past7Days.forEach(date => {
      if (logs[date] && logs[date].meals.length > 0) {
        totalDaysWithData++;
        const dailyCal = logs[date].meals.reduce((sum, meal) => sum + meal.calories, 0);
        totalCal += dailyCal;
      }
    });

    const avgCalories = totalDaysWithData > 0 ? totalCal / totalDaysWithData : 0;

    return {
      avgCalories: Math.round(avgCalories),
      daysTracked: totalDaysWithData
    };
  };

  const digest = generateWeeklyDigest();

  const toggleTheme = () => {
    const newTheme = profile.themePreference === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    const updated = { ...profile, themePreference: newTheme as 'light' | 'dark' };
    setProfile(updated);
    saveProfile(updated);
  };

  const generateJourneyData = () => {
    const logs = getDailyLogs();
    const past14Days = Array.from({length: 14}, (_, i) => format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'));
    let lastKnownWeight = profile.weight;
    
    return past14Days.map(date => {
      if (logs[date] && logs[date].weight) {
        lastKnownWeight = logs[date].weight!;
      }
      return {
        date: format(new Date(date), 'MMM d'),
        weight: lastKnownWeight
      };
    });
  };

  const journeyData = generateJourneyData();
  const minWeight = Math.min(...journeyData.map(d => d.weight)) - 2;
  const maxWeight = Math.max(...journeyData.map(d => d.weight)) + 2;

  const addWater = (amount: number) => {
    const current = log.water || 0;
    const next = Math.max(0, current + amount);
    updateDailyWater(log.date, next);
    setLog({ ...log, water: next });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-stone-800 border-b-2 border-stone-200 dark:border-stone-700 shadow-[0_4px_0_0_#f5f5f4] dark:shadow-[0_4px_0_0_#1c1917] px-6 py-4 sticky top-0 z-10 transition-colors">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">FlashFeast</h1>
            <p className="text-sm font-bold text-stone-500 dark:text-stone-400">Hello, {profile.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors shadow-[0_2px_0_0_#e5e7eb] dark:shadow-[0_2px_0_0_#44403c] active:translate-y-[2px] active:shadow-none">
              {profile.themePreference === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <Link to="/settings" className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors shadow-[0_2px_0_0_#e5e7eb] dark:shadow-[0_2px_0_0_#44403c] active:translate-y-[2px] active:shadow-none">
              <Settings className="w-6 h-6" />
            </Link>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-100 font-black text-xl border-2 border-emerald-200 dark:border-emerald-700 shadow-[0_4px_0_0_#a7f3d0] dark:shadow-[0_4px_0_0_#065f46]">
              {profile.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        
        {/* Badge Notification */}
        {newBadge && (
          <div className="bg-yellow-400 rounded-3xl p-4 text-stone-900 shadow-[0_6px_0_0_#ca8a04] flex items-center gap-4 border-2 border-yellow-500 animate-in slide-in-from-top-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center shrink-0 border-2 border-yellow-300">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-black">New Badge Unlocked!</h3>
              <p className="font-bold text-sm text-yellow-900">{newBadge}</p>
            </div>
          </div>
        )}
        
        {/* Motivational Notification Mock */}
        <div className="bg-emerald-500 dark:bg-emerald-600 rounded-3xl p-6 text-white shadow-[0_8px_0_0_#047857] dark:shadow-[0_8px_0_0_#064e3b] flex items-start gap-4 border-2 border-emerald-600 dark:border-emerald-700">
          <Activity className="w-8 h-8 text-emerald-200 shrink-0" />
          <div>
            <h3 className="font-black text-xl">You're doing great!</h3>
            <p className="text-emerald-50 mt-1 font-medium">Consistency is the key to progress. Logging your meals today will keep you on track for your {profile.goal.toLowerCase()} weight goal.</p>
          </div>
        </div>

        {/* Calories Overview */}
        <section className="bg-white dark:bg-stone-800 rounded-3xl p-8 border-2 border-stone-200 dark:border-stone-700 shadow-[0_8px_0_0_#e5e7eb] dark:shadow-[0_8px_0_0_#1c1917] flex flex-col md:flex-row items-center gap-10 transition-colors">
          <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" className="stroke-stone-100 dark:stroke-stone-700" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke="#059669" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * caloriePercent) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-stone-900 dark:text-white">{profile.calorieTarget - totalCalories > 0 ? profile.calorieTarget - totalCalories : 0}</span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest mt-1">kcal left</span>
            </div>
          </div>
          <div className="w-full space-y-6">
            <MacroBar label="Protein" current={totalProtein} target={profile.proteinTarget} color="bg-[#3B82F6]" />
            <MacroBar label="Carbs" current={totalCarbs} target={profile.carbsTarget} color="bg-[#F59E0B]" />
            <MacroBar label="Fat" current={totalFat} target={profile.fatTarget} color="bg-[#F43F5E]" />
          </div>
        </section>

        {/* Macros Doughnut Chart */}
        <section className="bg-white dark:bg-stone-800 rounded-3xl p-8 border-2 border-stone-200 dark:border-stone-700 shadow-[0_8px_0_0_#e5e7eb] dark:shadow-[0_8px_0_0_#1c1917] transition-colors">
          <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-6">Macro Distribution</h2>
          <div className="h-64 w-full">
            {(totalProtein > 0 || totalCarbs > 0 || totalFat > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Protein', value: totalProtein, color: '#3B82F6' },
                      { name: 'Carbs', value: totalCarbs, color: '#F59E0B' },
                      { name: 'Fat', value: totalFat, color: '#F43F5E' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      { name: 'Protein', value: totalProtein, color: '#3B82F6' },
                      { name: 'Carbs', value: totalCarbs, color: '#F59E0B' },
                      { name: 'Fat', value: totalFat, color: '#F43F5E' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '2px solid #e5e7eb', boxShadow: '0 4px 0 0 #e5e7eb', fontWeight: 'bold' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 dark:text-stone-500 font-bold">
                Log meals to see your macro distribution.
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3B82F6]"></div>
              <span className="text-sm font-bold text-stone-600 dark:text-stone-300">Protein</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F59E0B]"></div>
              <span className="text-sm font-bold text-stone-600 dark:text-stone-300">Carbs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F43F5E]"></div>
              <span className="text-sm font-bold text-stone-600 dark:text-stone-300">Fat</span>
            </div>
          </div>
        </section>

        {/* Journey Map */}
        <section className="bg-white dark:bg-stone-800 rounded-3xl p-8 border-2 border-stone-200 dark:border-stone-700 shadow-[0_8px_0_0_#e5e7eb] dark:shadow-[0_8px_0_0_#1c1917] transition-colors">
          <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-6">Journey Map</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={journeyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[minWeight, maxWeight]} stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '2px solid #e5e7eb', boxShadow: '0 4px 0 0 #e5e7eb', fontWeight: 'bold' }}
                  itemStyle={{ fontWeight: 'bold', color: '#10b981' }}
                  labelStyle={{ color: '#57534e' }}
                  formatter={(value: number) => [`${value} kg`, 'Weight']}
                />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} dot={{ stroke: '#047857', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6, fill: '#10b981', stroke: '#047857', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Water Tracker & Badges Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Water Tracker */}
          <div className="bg-cyan-100 dark:bg-cyan-950 rounded-3xl p-6 border-2 border-cyan-200 dark:border-cyan-800 shadow-[0_6px_0_0_#a5f3fc] dark:shadow-[0_6px_0_0_#083344] transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-xl text-cyan-900 dark:text-cyan-100">Water Tracker</h3>
                <p className="text-cyan-700 dark:text-cyan-400 font-bold text-sm">Goal: 8 glasses</p>
              </div>
              <div className="w-12 h-12 bg-cyan-200 dark:bg-cyan-800 rounded-2xl flex items-center justify-center border-2 border-cyan-300 dark:border-cyan-700">
                <Droplets className="w-6 h-6 text-cyan-700 dark:text-cyan-300" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => addWater(-1)} className="w-12 h-12 bg-white dark:bg-stone-800 rounded-2xl flex items-center justify-center border-2 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400 shadow-[0_4px_0_0_#93c5fd] dark:shadow-[0_4px_0_0_#164e63] active:translate-y-[4px] active:shadow-none hover:bg-cyan-50 dark:hover:bg-stone-700 transition-all">
                <Minus className="w-6 h-6" />
              </button>
              <div className="text-center">
                <span className="text-4xl font-black text-cyan-900 dark:text-cyan-100">{log.water || 0}</span>
                <span className="text-cyan-700 dark:text-cyan-400 font-bold ml-1">/ 8</span>
              </div>
              <button onClick={() => addWater(1)} className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center border-2 border-cyan-600 text-white shadow-[0_4px_0_0_#0891b2] active:translate-y-[4px] active:shadow-none hover:bg-cyan-400 transition-all">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Badges Collection */}
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-3xl p-6 border-2 border-yellow-200 dark:border-yellow-900/50 shadow-[0_6px_0_0_#fef08a] dark:shadow-[0_6px_0_0_#422006] transition-colors">
            <h3 className="font-black text-xl text-yellow-900 dark:text-yellow-500 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6" /> Your Badges
            </h3>
            {(!profile.badges || profile.badges.length === 0) ? (
              <p className="text-yellow-700 dark:text-yellow-600 font-bold text-sm">Complete daily goals to earn badges!</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profile.badges.map(badge => (
                  <div key={badge} className="bg-white dark:bg-stone-800 px-3 py-2 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 flex items-center gap-2 shadow-[0_2px_0_0_#fde047] dark:shadow-[0_2px_0_0_#713f12]">
                    <Medal className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-sm text-stone-800 dark:text-stone-200">{badge}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/log" className="bg-emerald-500 text-white p-4 rounded-2xl flex flex-col items-center gap-2 border-b-4 border-emerald-700 hover:bg-emerald-400 active:translate-y-[4px] active:border-b-0 transition-all shadow-sm">
            <Camera className="w-6 h-6" />
            <span className="font-bold text-sm">Snap Meal</span>
          </Link>
          <button onClick={() => setShowWeeklyDigest(true)} className="bg-blue-500 text-white p-4 rounded-2xl flex flex-col items-center gap-2 border-b-4 border-blue-700 hover:bg-blue-400 active:translate-y-[4px] active:border-b-0 transition-all shadow-sm">
            <Calendar className="w-6 h-6" />
            <span className="font-bold text-sm">Digest</span>
          </button>
          <Link to="/reports" className="bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 p-4 rounded-2xl flex flex-col items-center gap-2 border-2 border-stone-200 dark:border-stone-700 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1c1917] hover:bg-stone-50 dark:hover:bg-stone-700 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] dark:hover:shadow-[0_2px_0_0_#1c1917] active:translate-y-[4px] active:shadow-none transition-all">
            <Activity className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-sm">Reports</span>
          </Link>
          <Link to="/wearables" className="bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 p-4 rounded-2xl flex flex-col items-center gap-2 border-2 border-stone-200 dark:border-stone-700 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1c1917] hover:bg-stone-50 dark:hover:bg-stone-700 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] dark:hover:shadow-[0_2px_0_0_#1c1917] active:translate-y-[4px] active:shadow-none transition-all">
            <Watch className="w-6 h-6 text-stone-800 dark:text-stone-400" />
            <span className="font-bold text-sm">Devices</span>
          </Link>
          <Link to="/community" className="bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 p-4 rounded-2xl flex flex-col items-center gap-2 border-2 border-stone-200 dark:border-stone-700 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1c1917] hover:bg-stone-50 dark:hover:bg-stone-700 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] dark:hover:shadow-[0_2px_0_0_#1c1917] active:translate-y-[4px] active:shadow-none transition-all">
            <Users className="w-6 h-6 text-rose-500" />
            <span className="font-bold text-sm">Community</span>
          </Link>
          <Link to="/guides" className="bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 p-4 rounded-2xl flex flex-col items-center gap-2 border-2 border-stone-200 dark:border-stone-700 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1c1917] hover:bg-stone-50 dark:hover:bg-stone-700 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] dark:hover:shadow-[0_2px_0_0_#1c1917] active:translate-y-[4px] active:shadow-none transition-all">
            <Star className="w-6 h-6 text-amber-500" />
            <span className="font-bold text-sm">Guides</span>
          </Link>
        </section>

        {/* Today's Meals */}
        <section>
          <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-6">Today's Log</h2>
          {log.meals.length === 0 ? (
            <div className="bg-stone-50 dark:bg-stone-800 border-4 border-dashed border-stone-200 dark:border-stone-700 rounded-3xl p-10 text-center flex flex-col items-center justify-center transition-colors">
              <Camera className="w-12 h-12 text-stone-400 dark:text-stone-500 mb-4" />
              <p className="text-stone-600 dark:text-stone-400 font-medium">No meals logged yet today.</p>
              <Link to="/log" className="mt-4 px-6 py-3 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 font-bold rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors">Snap a photo to start logging</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {log.meals.map(meal => (
                <div key={meal.id} className="bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-3xl p-4 flex items-center gap-4 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1c1917] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] dark:hover:shadow-[0_2px_0_0_#1c1917] transition-all">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="w-20 h-20 rounded-2xl object-cover shrink-0 border-2 border-stone-100 dark:border-stone-700" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-stone-100 dark:bg-stone-700 border-2 border-stone-200 dark:border-stone-600 flex items-center justify-center shrink-0">
                      <Plus className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-stone-900 dark:text-stone-100">{meal.name}</h4>
                    <p className="text-sm font-bold text-stone-500 dark:text-stone-400 mt-1">{meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F</p>
                  </div>
                  <div className="text-sm text-stone-400 dark:text-stone-500 font-bold whitespace-nowrap bg-stone-100 dark:bg-stone-700 px-3 py-1 rounded-lg">
                    {format(meal.timestamp, 'h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Weekly Digest Modal */}
      {showWeeklyDigest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/50 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-800 w-full max-w-sm rounded-3xl border-4 border-stone-800 shadow-[8px_8px_0_0_#292524] dark:shadow-[8px_8px_0_0_#000000] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-blue-300 dark:bg-blue-900 border-b-4 border-stone-800 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Weekly Digest</h3>
                <p className="text-stone-800 dark:text-blue-200 font-bold mt-1">Your past 7 days summary.</p>
              </div>
              <button 
                onClick={() => setShowWeeklyDigest(false)}
                className="w-10 h-10 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-xl flex items-center justify-center border-2 border-stone-800 shadow-[0_2px_0_0_#292524] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <X className="w-5 h-5 text-stone-900 dark:text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-stone-50 dark:bg-stone-700 border-2 border-stone-200 dark:border-stone-600 rounded-2xl p-4 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1c1917]">
                <p className="text-sm font-bold text-stone-500 dark:text-stone-300 uppercase tracking-widest mb-1">Average Daily Intake</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{digest.avgCalories}</span>
                  <span className="text-stone-500 dark:text-stone-400 font-bold">kcal / day</span>
                </div>
              </div>

              <div className="bg-stone-50 dark:bg-stone-700 border-2 border-stone-200 dark:border-stone-600 rounded-2xl p-4 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1c1917]">
                <p className="text-sm font-bold text-stone-500 dark:text-stone-300 uppercase tracking-widest mb-1">Tracking Consistency</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{digest.daysTracked}</span>
                  <span className="text-stone-500 dark:text-stone-400 font-bold">out of 7 days</span>
                </div>
              </div>
              
              <div className="p-4 bg-stone-800 dark:bg-stone-900 text-white rounded-2xl border-2 border-stone-900 dark:border-stone-950">
                <p className="font-bold text-sm leading-relaxed text-stone-100">
                  {digest.avgCalories > profile.calorieTarget + 100 ? "You've been slightly above your goal on average." :
                   digest.avgCalories < profile.calorieTarget - 100 ? "You're under your calorie goal. Make sure you're eating enough!" :
                   "Great job! You've been hitting your target perfectly."}
                </p>
              </div>

              <button 
                onClick={() => setShowWeeklyDigest(false)}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-black text-lg rounded-2xl transition-all shadow-[0_4px_0_0_#1d4ed8] border-2 border-blue-600 active:translate-y-[4px] active:shadow-none mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MacroBar({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
  const percent = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-2 font-bold uppercase tracking-wider">
        <span className="text-stone-700 dark:text-stone-300">{label}</span>
        <span className="text-stone-500 dark:text-stone-400">{Math.round(current)} / {target}g</span>
      </div>
      <div className="h-4 w-full bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden border-2 border-stone-200 dark:border-stone-600 shadow-inner">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out border-r-2 border-white/20", color)} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
