import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getLogForDate, getDailyLogs } from '../lib/storage';
import { UserProfile, DailyLog } from '../types';
import { format, subDays } from 'date-fns';
import { Plus, Camera, Activity, Watch, Users, Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false);

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
    
    const today = format(new Date(), 'yyyy-MM-dd');
    setLog(getLogForDate(today));
  }, [navigate]);

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

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b-2 border-stone-200 shadow-[0_4px_0_0_#f5f5f4] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">{format(new Date(), 'EEEE, MMM d')}</p>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Hello, {profile.name}</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-xl border-2 border-emerald-200 shadow-[0_4px_0_0_#a7f3d0]">
            {profile.name.charAt(0)}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        
        {/* Motivational Notification Mock */}
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-[0_8px_0_0_#047857] flex items-start gap-4 border-2 border-emerald-600">
          <Activity className="w-8 h-8 text-emerald-200 shrink-0" />
          <div>
            <h3 className="font-black text-xl">You're doing great!</h3>
            <p className="text-emerald-50 mt-1 font-medium">Consistency is the key to progress. Logging your meals today will keep you on track for your {profile.goal.toLowerCase()} weight goal.</p>
          </div>
        </div>

        {/* Calories Overview */}
        <section className="bg-white rounded-3xl p-8 border-2 border-stone-200 shadow-[0_8px_0_0_#e5e7eb] flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f5f5f4" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke="#059669" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * caloriePercent) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-stone-900">{profile.calorieTarget - totalCalories > 0 ? profile.calorieTarget - totalCalories : 0}</span>
              <span className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1">kcal left</span>
            </div>
          </div>
          <div className="w-full space-y-6">
            <MacroBar label="Protein" current={totalProtein} target={profile.proteinTarget} color="bg-[#3B82F6]" />
            <MacroBar label="Carbs" current={totalCarbs} target={profile.carbsTarget} color="bg-[#F59E0B]" />
            <MacroBar label="Fat" current={totalFat} target={profile.fatTarget} color="bg-[#F43F5E]" />
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link to="/log" className="bg-emerald-500 text-white p-4 rounded-2xl flex flex-col items-center gap-2 border-b-4 border-emerald-700 hover:bg-emerald-400 active:translate-y-[4px] active:border-b-0 transition-all">
            <Camera className="w-6 h-6" />
            <span className="font-bold text-sm">Snap Meal</span>
          </Link>
          <button onClick={() => setShowWeeklyDigest(true)} className="bg-blue-500 text-white p-4 rounded-2xl flex flex-col items-center gap-2 border-b-4 border-blue-700 hover:bg-blue-400 active:translate-y-[4px] active:border-b-0 transition-all">
            <Calendar className="w-6 h-6" />
            <span className="font-bold text-sm">Digest</span>
          </button>
          <Link to="/reports" className="bg-white text-stone-700 p-4 rounded-2xl flex flex-col items-center gap-2 border-2 border-stone-200 shadow-[0_4px_0_0_#e5e7eb] hover:bg-stone-50 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] active:translate-y-[4px] active:shadow-none transition-all">
            <Activity className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-sm">Reports</span>
          </Link>
          <Link to="/wearables" className="bg-white text-stone-700 p-4 rounded-2xl flex flex-col items-center gap-2 border-2 border-stone-200 shadow-[0_4px_0_0_#e5e7eb] hover:bg-stone-50 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] active:translate-y-[4px] active:shadow-none transition-all">
            <Watch className="w-6 h-6 text-stone-800" />
            <span className="font-bold text-sm">Devices</span>
          </Link>
          <Link to="/community" className="bg-white text-stone-700 p-4 rounded-2xl flex flex-col items-center gap-2 border-2 border-stone-200 shadow-[0_4px_0_0_#e5e7eb] hover:bg-stone-50 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] active:translate-y-[4px] active:shadow-none transition-all">
            <Users className="w-6 h-6 text-rose-500" />
            <span className="font-bold text-sm">Community</span>
          </Link>
        </section>

        {/* Today's Meals */}
        <section>
          <h2 className="text-2xl font-black text-stone-900 mb-6">Today's Log</h2>
          {log.meals.length === 0 ? (
            <div className="bg-stone-50 border-4 border-dashed border-stone-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
              <Camera className="w-12 h-12 text-stone-400 mb-4" />
              <p className="text-stone-600 font-medium">No meals logged yet today.</p>
              <Link to="/log" className="mt-4 px-6 py-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl hover:bg-emerald-200 transition-colors">Snap a photo to start logging</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {log.meals.map(meal => (
                <div key={meal.id} className="bg-white border-2 border-stone-200 rounded-3xl p-4 flex items-center gap-4 shadow-[0_4px_0_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] transition-all">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="w-20 h-20 rounded-2xl object-cover shrink-0 border-2 border-stone-100" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-stone-100 border-2 border-stone-200 flex items-center justify-center shrink-0">
                      <Plus className="w-8 h-8 text-stone-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-stone-900">{meal.name}</h4>
                    <p className="text-sm font-bold text-stone-500 mt-1">{meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F</p>
                  </div>
                  <div className="text-sm text-stone-400 font-bold whitespace-nowrap bg-stone-100 px-3 py-1 rounded-lg">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl border-4 border-stone-800 shadow-[8px_8px_0_0_#292524] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-blue-300 border-b-4 border-stone-800 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-stone-900 tracking-tight">Weekly Digest</h3>
                <p className="text-stone-800 font-bold mt-1">Your past 7 days summary.</p>
              </div>
              <button 
                onClick={() => setShowWeeklyDigest(false)}
                className="w-10 h-10 bg-white/50 hover:bg-white rounded-xl flex items-center justify-center border-2 border-stone-800 shadow-[0_2px_0_0_#292524] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <X className="w-5 h-5 text-stone-900" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 shadow-[0_4px_0_0_#e5e7eb]">
                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Average Daily Intake</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-blue-600">{digest.avgCalories}</span>
                  <span className="text-stone-500 font-bold">kcal / day</span>
                </div>
              </div>

              <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 shadow-[0_4px_0_0_#e5e7eb]">
                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Tracking Consistency</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-600">{digest.daysTracked}</span>
                  <span className="text-stone-500 font-bold">out of 7 days</span>
                </div>
              </div>
              
              <div className="p-4 bg-stone-800 text-white rounded-2xl border-2 border-stone-900">
                <p className="font-bold text-sm leading-relaxed">
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
        <span className="text-stone-700">{label}</span>
        <span className="text-stone-500">{Math.round(current)} / {target}g</span>
      </div>
      <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden border-2 border-stone-200 shadow-inner">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out border-r-2 border-white/20", color)} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
