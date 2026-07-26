import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getLogForDate, getDailyLogs, updateDailyWater, awardBadge, saveProfile } from '../lib/storage';
import { UserProfile, DailyLog } from '../types';
import { format, subDays } from 'date-fns';
import { Plus, Camera, Activity, Watch, Users, Calendar, X, Droplets, Minus, Moon, Sun, Medal, Star, Trophy, Settings, Github, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';
import { FitnessModelsGroup } from './FitnessModels';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';

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
    const totalCals = log.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
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

  const totalCalories = log.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = log.meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = log.meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFat = log.meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

  const caloriePercent = Math.min((totalCalories / profile.calorieTarget) * 100, 100);

  const generateWeeklyDigest = () => {
    const logs = getDailyLogs();
    let totalCal = 0;
    let totalDaysWithData = 0;
    const past7Days = Array.from({length: 7}, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    
    past7Days.forEach(date => {
      if (logs[date] && logs[date].meals.length > 0) {
        totalDaysWithData++;
        const dailyCal = logs[date].meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
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

  const heightM = profile.height / 100;
  const bmiValue = parseFloat((profile.weight / (heightM * heightM)).toFixed(1));
  let bmiCategory = '';
  let bmiColor = '';
  
  if (bmiValue < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-blue-500 ';
  } else if (bmiValue >= 18.5 && bmiValue < 25) {
    bmiCategory = 'Normal Weight';
    bmiColor = 'text-indigo-500 ';
  } else if (bmiValue >= 25 && bmiValue < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-yellow-500 ';
  } else {
    bmiCategory = 'Obese';
    bmiColor = 'text-red-500 ';
  }

  const addWater = (amount: number) => {
    const current = log.water || 0;
    const next = Math.max(0, current + amount);
    updateDailyWater(log.date, next);
    setLog({ ...log, water: next });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2723] via-[#3a352d] to-[#1e1c18] text-[#f4efe6] font-sans transition-colors pb-24">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b-2 border-[#f4efe6]/10 shadow-sm  px-6 py-4 sticky top-0 z-10 transition-colors">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#f4efe6] tracking-tight">GramGlance</h1>
            <p className="text-sm font-bold text-[#f4efe6]/60">Hello, {profile.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="p-3 rounded-lg bg-white/10 text-[#f4efe6]/80 border border-[#f4efe6]/10 hover:bg-white/20 transition-colors shadow-sm active:translate-y-[2px] active:shadow-none" title="Exit to Home">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/settings" className="p-3 rounded-lg bg-white/10 text-[#f4efe6]/80 border border-[#f4efe6]/10 hover:bg-white/20 transition-colors shadow-sm active:translate-y-[2px] active:shadow-none">
              <Settings className="w-6 h-6" />
            </Link>
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-[#f4efe6] font-bold text-xl border border-[#f4efe6]/20 shadow-sm ">
              {profile.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        
        {/* 3D Hero Section */}
        <section className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-[#1a1815] border border-[#f4efe6]/10 shadow-lg">
          <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
              <ambientLight intensity={0.6} />
              <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} color="#fff1e6" />
              <spotLight position={[-10, -10, -10]} angle={0.2} penumbra={1} intensity={0.5} color="#e0e7ff" />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2.5}
                maxPolarAngle={Math.PI - Math.PI / 2.5}
              />
              <React.Suspense fallback={null}>
                <group rotation={[0.1, 0.3, 0]}>
                  <FitnessModelsGroup />
                </group>
                <Environment preset="city" />
              </React.Suspense>
            </Canvas>
          </div>
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-3xl md:text-4xl font-black text-[#f4efe6]" style={{ fontFamily: 'Georgia, serif' }}>YOUR PROGRESS</h2>
            <p className="text-[#f4efe6]/80 mt-1 max-w-md text-sm">Interact with your fitness journey. Keep pushing your limits.</p>
          </div>
        </section>

        {/* Badge Notification */}
        {newBadge && (
          <div className="bg-yellow-400 rounded-xl p-4 text-yellow-900 shadow-md flex items-center gap-4 border border-yellow-500 animate-in slide-in-from-top-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0 border border-yellow-300">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold">New Badge Unlocked!</h3>
              <p className="font-bold text-sm text-yellow-900">{newBadge}</p>
            </div>
          </div>
        )}
        
        {/* Motivational Notification Mock */}
        <div className="bg-indigo-500  rounded-xl p-6 text-white shadow-md  flex items-start gap-4 border border-indigo-600 ">
          <Activity className="w-8 h-8 text-indigo-200 shrink-0" />
          <div>
            <h3 className="font-bold text-xl">You're doing great!</h3>
            <p className="text-indigo-50 mt-1 font-medium">Consistency is the key to progress. Logging your meals today will keep you on track for your {profile.goal.toLowerCase()} weight goal.</p>
          </div>
        </div>

        {/* Calories Overview */}
        <section className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-[#f4efe6]/10 shadow-md  flex flex-col md:flex-row items-center gap-10 transition-colors">
          <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" className="stroke-white/10" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke="#059669" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * caloriePercent) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-[#f4efe6]">{profile.calorieTarget - totalCalories > 0 ? profile.calorieTarget - totalCalories : 0}</span>
              <span className="text-xs text-[#f4efe6]/60 font-bold uppercase tracking-widest mt-1">kcal left</span>
            </div>
          </div>
          <div className="w-full space-y-6">
            <MacroBar label="Protein" current={totalProtein} target={profile.proteinTarget} color="bg-[#3B82F6]" />
            <MacroBar label="Carbs" current={totalCarbs} target={profile.carbsTarget} color="bg-[#F59E0B]" />
            <MacroBar label="Fat" current={totalFat} target={profile.fatTarget} color="bg-[#F43F5E]" />
          </div>
        </section>

        {/* Macros Doughnut Chart */}
        <section className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-[#f4efe6]/10 shadow-md  transition-colors">
          <h2 className="text-2xl font-bold text-[#f4efe6] mb-6">Macro Distribution</h2>
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
              <div className="h-full flex items-center justify-center text-[#f4efe6]/40 font-bold">
                Log meals to see your macro distribution.
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3B82F6]"></div>
              <span className="text-sm font-bold text-[#f4efe6]/80">Protein</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F59E0B]"></div>
              <span className="text-sm font-bold text-[#f4efe6]/80">Carbs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F43F5E]"></div>
              <span className="text-sm font-bold text-[#f4efe6]/80">Fat</span>
            </div>
          </div>
        </section>

        {/* Journey Map */}
        <section className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-[#f4efe6]/10 shadow-md  transition-colors">
          <h2 className="text-2xl font-bold text-[#f4efe6] mb-6">Journey Map</h2>
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

        {/* BMI Calculator */}
        <section className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-[#f4efe6]/10 shadow-sm transition-colors flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#f4efe6]/60 uppercase tracking-widest mb-1">Your BMI</h3>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl font-bold ${bmiColor}`}>{bmiValue}</span>
              <span className={`font-bold text-lg ${bmiColor}`}>{bmiCategory}</span>
            </div>
            <p className="text-[#f4efe6]/60 text-sm mt-2 font-medium">
              Based on your height ({profile.height} cm) and weight ({profile.weight} kg).
            </p>
          </div>
          <div className="hidden md:flex w-24 h-24 rounded-full bg-black/20 items-center justify-center border border-[#f4efe6]/10 shadow-inner">
            <Activity className={`w-10 h-10 ${bmiColor}`} />
          </div>
        </section>

        {/* Water Tracker & Badges Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Water Tracker */}
          <div className="bg-cyan-100  rounded-xl p-6 border border-cyan-200  shadow-md  transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-xl text-cyan-900 ">Water Tracker</h3>
                <p className="text-cyan-700  font-bold text-sm">Goal: 8 glasses</p>
              </div>
              <div className="w-12 h-12 bg-cyan-200  rounded-lg flex items-center justify-center border border-cyan-300 ">
                <Droplets className="w-6 h-6 text-cyan-700 " />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => addWater(-1)} className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-lg flex items-center justify-center border border-cyan-300  text-cyan-700  shadow-sm  active:translate-y-[4px] active hover:bg-white/5 transition-all">
                <Minus className="w-6 h-6" />
              </button>
              <div className="text-center">
                <span className="text-4xl font-bold text-cyan-900 ">{log.water || 0}</span>
                <span className="text-cyan-700  font-bold ml-1">/ 8</span>
              </div>
              <button onClick={() => addWater(1)} className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center border border-cyan-600 text-white shadow-sm active:translate-y-[4px] active hover transition-all">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Badges Collection */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-[#f4efe6]/10 shadow-md transition-colors">
            <h3 className="font-bold text-xl text-[#f4efe6] mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" /> Your Badges
            </h3>
            {(!profile.badges || profile.badges.length === 0) ? (
              <p className="text-[#f4efe6]/60 font-bold text-sm">Complete daily goals to earn badges!</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profile.badges.map(badge => (
                  <div key={badge} className="bg-yellow-500/20 px-3 py-2 rounded-xl border border-yellow-500/50 flex items-center gap-2 shadow-sm">
                    <Medal className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-sm text-yellow-100">{badge}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/log" className="bg-indigo-500 text-white p-4 rounded-lg flex flex-col items-center gap-2 border-b border-indigo-700 hover:bg-indigo-400 active:translate-y-[4px] active:border-b-0 transition-all shadow-sm">
            <Camera className="w-6 h-6" />
            <span className="font-bold text-sm">Snap Meal</span>
          </Link>
          <button onClick={() => setShowWeeklyDigest(true)} className="bg-blue-500 text-white p-4 rounded-lg flex flex-col items-center gap-2 border-b border-blue-700 hover:bg-indigo-400 active:translate-y-[4px] active:border-b-0 transition-all shadow-sm">
            <Calendar className="w-6 h-6" />
            <span className="font-bold text-sm">Digest</span>
          </button>
          <Link to="/reports" className="bg-white/5 backdrop-blur-md text-[#f4efe6]/80 p-4 rounded-lg flex flex-col items-center gap-2 border border-[#f4efe6]/10 shadow-sm  hover:bg-white/5 hover:translate-y-[2px] hover:bg-white/10 active:translate-y-[4px] active transition-all">
            <Activity className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-sm">Reports</span>
          </Link>
          <Link to="/wearables" className="bg-white/5 backdrop-blur-md text-[#f4efe6]/80 p-4 rounded-lg flex flex-col items-center gap-2 border border-[#f4efe6]/10 shadow-sm  hover:bg-white/5 hover:translate-y-[2px] hover:bg-white/10 active:translate-y-[4px] active transition-all">
            <Watch className="w-6 h-6 text-[#f4efe6]/80 [#f4efe6]/80" />
            <span className="font-bold text-sm">Devices</span>
          </Link>
          <Link to="/community" className="bg-white/5 backdrop-blur-md text-[#f4efe6]/80 p-4 rounded-lg flex flex-col items-center gap-2 border border-[#f4efe6]/10 shadow-sm  hover:bg-white/5 hover:translate-y-[2px] hover:bg-white/10 active:translate-y-[4px] active transition-all">
            <Users className="w-6 h-6 text-red-500" />
            <span className="font-bold text-sm">Community</span>
          </Link>
          <Link to="/guides" className="bg-white/5 backdrop-blur-md text-[#f4efe6]/80 p-4 rounded-lg flex flex-col items-center gap-2 border border-[#f4efe6]/10 shadow-sm  hover:bg-white/5 hover:translate-y-[2px] hover:bg-white/10 active:translate-y-[4px] active transition-all">
            <Star className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-sm">Guides</span>
          </Link>
        </section>

        {/* Today's Meals */}
        <section>
          <h2 className="text-2xl font-bold text-[#f4efe6] mb-6">Today's Log</h2>
          {log.meals.length === 0 ? (
            <div className="bg-black/20 border border-dashed border-[#f4efe6]/10 rounded-xl p-10 text-center flex flex-col items-center justify-center transition-colors">
              <Camera className="w-12 h-12 text-[#f4efe6]/40 mb-4" />
              <p className="text-[#f4efe6]/80 [#f4efe6]/80 font-medium">No meals logged yet today.</p>
              <Link to="/log" className="mt-4 px-6 py-3 bg-white/10 text-[#f4efe6] font-bold rounded-xl hover:bg-white/20 transition-colors">Snap a photo to start logging</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {log.meals.map(meal => (
                <div key={meal.id} className="bg-white/5 backdrop-blur-md border border-[#f4efe6]/10 rounded-xl p-4 flex items-center gap-4 shadow-sm  hover:translate-y-[2px] hover:bg-white/5 transition-all">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="w-20 h-20 rounded-lg object-cover shrink-0 border border-[#f4efe6]/10" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-white/10 border border-[#f4efe6]/10 flex items-center justify-center shrink-0">
                      <Plus className="w-8 h-8 text-[#f4efe6]/40" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-[#f4efe6]">{meal.name}</h4>
                    <p className="text-sm font-bold text-[#f4efe6]/60 mt-1">{meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F</p>
                  </div>
                  <div className="text-sm text-[#f4efe6]/40 font-bold whitespace-nowrap bg-white/10 px-3 py-1 rounded-lg">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1a1815]/80 backdrop-blur-sm">
          <div className="bg-white/5 backdrop-blur-md w-full max-w-sm rounded-xl border border-white/10 shadow-xl  overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-blue-300  border-b border-white/10 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#f4efe6] tracking-tight">Weekly Digest</h3>
                <p className="text-[#f4efe6]/80  font-bold mt-1">Your past 7 days summary.</p>
              </div>
              <button 
                onClick={() => setShowWeeklyDigest(false)}
                className="w-10 h-10 bg-white/50 /20 hover:bg-black/40 rounded-xl flex items-center justify-center border border-white/10 shadow-sm active:translate-y-[2px] active transition-all"
              >
                <X className="w-5 h-5 text-[#f4efe6]" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-white/5 border border-[#f4efe6]/10 rounded-lg p-4 shadow-sm ">
                <p className="text-sm font-bold text-[#f4efe6]/80 [#f4efe6]/80 uppercase tracking-widest mb-1">Average Daily Intake</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600 ">{digest.avgCalories}</span>
                  <span className="text-[#f4efe6]/60 font-bold">kcal / day</span>
                </div>
              </div>

              <div className="bg-white/5 border border-[#f4efe6]/10 rounded-lg p-4 shadow-sm ">
                <p className="text-sm font-bold text-[#f4efe6]/80 [#f4efe6]/80 uppercase tracking-widest mb-1">Tracking Consistency</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-indigo-600 ">{digest.daysTracked}</span>
                  <span className="text-[#f4efe6]/60 font-bold">out of 7 days</span>
                </div>
              </div>
              
              <div className="p-4 bg-black/30 text-white rounded-lg border border-[#f4efe6]/10">
                <p className="font-bold text-sm leading-relaxed text-[#f4efe6]/80">
                  {digest.avgCalories > profile.calorieTarget + 100 ? "You've been slightly above your goal on average." :
                   digest.avgCalories < profile.calorieTarget - 100 ? "You're under your calorie goal. Make sure you're eating enough!" :
                   "Great job! You've been hitting your target perfectly."}
                </p>
              </div>

              <button 
                onClick={() => setShowWeeklyDigest(false)}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg rounded-lg transition-all shadow-sm border border-blue-600 active:translate-y-[4px] active mt-2"
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
        <span className="text-[#f4efe6]/80">{label}</span>
        <span className="text-[#f4efe6]/60">{Math.round(current)} / {target}g</span>
      </div>
      <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden border border-[#f4efe6]/10 shadow-inner">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out border-r-2 border-white/20", color)} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
