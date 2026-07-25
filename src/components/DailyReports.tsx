import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, CheckCircle, Scale, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProfile, getDailyLogs, updateDailyWeight } from '../lib/storage';
import { UserProfile, DailyLog } from '../types';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';

export default function DailyReports() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    const userProfile = getProfile();
    if (!userProfile) {
      navigate('/register');
      return;
    }
    setProfile(userProfile);
    setLogs(getDailyLogs());
  }, [navigate]);

  if (!profile) return null;

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const log = logs[dateKey] || { date: dateKey, meals: [] };

  const totalCalories = log.meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = log.meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = log.meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = log.meals.reduce((sum, meal) => sum + meal.fat, 0);

  const prevDateKey = format(subDays(currentDate, 1), 'yyyy-MM-dd');
  const prevLog = logs[prevDateKey];
  const weightChange = log.weight && prevLog?.weight ? (log.weight - prevLog.weight).toFixed(1) : null;

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightInput) {
      updateDailyWeight(dateKey, parseFloat(weightInput));
      setLogs(getDailyLogs());
      setWeightInput('');
    }
  };

  const getProgressMessage = () => {
    if (totalCalories === 0) return "No data for today. Log your meals!";
    const diff = totalCalories - profile.calorieTarget;
    if (Math.abs(diff) <= 100) return "Perfect! You hit your calorie target.";
    if (diff > 100) return `You are ${Math.round(diff)} kcal over your target.`;
    return `You have ${Math.round(Math.abs(diff))} kcal remaining to reach your target.`;
  };

  return (
    <div className="min-h-screen bg-stone-100 pb-24 font-sans">
      <header className="bg-white px-6 py-4 sticky top-0 z-10 flex items-center justify-between border-b-2 border-stone-200 shadow-[0_4px_0_0_#f5f5f4]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 -ml-2 rounded-xl bg-stone-50 border-2 border-stone-200 shadow-[0_2px_0_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-none active:bg-stone-100 transition-all text-stone-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">Daily Report</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-8">
        
        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-stone-200 shadow-[0_6px_0_0_#e5e7eb]">
          <button 
            onClick={() => setCurrentDate(subDays(currentDate, 1))}
            className="p-3 bg-stone-100 rounded-2xl border-2 border-stone-200 hover:bg-stone-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Date
            </span>
            <span className="text-xl font-black text-stone-800">{format(currentDate, 'MMM d, yyyy')}</span>
          </div>
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
            disabled={isSameDay(currentDate, new Date())}
            className="p-3 bg-stone-100 rounded-2xl border-2 border-stone-200 hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-stone-700" />
          </button>
        </div>

        {/* Weight Tracker */}
        <div className="bg-[#E0F2FE] p-6 rounded-3xl border-2 border-[#bae6fd] shadow-[0_8px_0_0_#bae6fd] relative overflow-hidden">
          <Scale className="absolute -bottom-6 -right-6 w-32 h-32 text-blue-200 opacity-50" />
          <h2 className="text-xl font-black text-blue-900 mb-4 relative z-10">Weight Logging</h2>
          <div className="flex items-end gap-4 relative z-10">
            <div className="flex-1">
              {log.weight ? (
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black text-blue-900">{log.weight}</span>
                  <span className="text-lg font-bold text-blue-700">kg</span>
                </div>
              ) : (
                <p className="text-blue-800 font-medium mb-4">No weight logged for this day.</p>
              )}
              {weightChange && (
                <div className={cn("flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl inline-flex", 
                  parseFloat(weightChange) > 0 ? "bg-rose-100 text-rose-700 border-2 border-rose-200" : "bg-emerald-100 text-emerald-700 border-2 border-emerald-200"
                )}>
                  {parseFloat(weightChange) > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(parseFloat(weightChange))} kg since last log
                </div>
              )}
            </div>
            <form onSubmit={handleWeightSubmit} className="flex-1 flex gap-2">
              <input 
                type="number" 
                step="0.1"
                placeholder="Log kg"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-400 font-bold text-blue-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
              />
              <button 
                type="submit"
                className="px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl border-b-4 border-blue-800 hover:bg-blue-500 active:translate-y-[4px] active:border-b-0 transition-all"
              >
                Save
              </button>
            </form>
          </div>
        </div>

        {/* Goal Summary */}
        <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-200 shadow-[0_8px_0_0_#a7f3d0]">
          <h2 className="text-xl font-black text-emerald-900 mb-2">Goal Progress</h2>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-200 border-2 border-emerald-300 flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#6ee7b7]">
              <CheckCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-emerald-800 font-medium leading-relaxed">{getProgressMessage()}</p>
              <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-emerald-100 flex items-center justify-between">
                 <span className="font-bold text-emerald-900">Total Goal</span>
                 <span className="font-black text-emerald-600 text-xl">{profile.calorieTarget} kcal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Overview */}
        <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-[0_8px_0_0_#e5e7eb]">
          <h2 className="text-xl font-black text-stone-800 mb-6">Nutrition Report</h2>
          
          <div className="flex justify-between items-end mb-8 border-b-2 border-stone-100 pb-6">
            <div>
              <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Calories Consumed</p>
              <p className="text-5xl font-black text-stone-900">{Math.round(totalCalories)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Net kcal</p>
              <p className={cn("text-2xl font-black", totalCalories > profile.calorieTarget ? "text-rose-500" : "text-emerald-500")}>
                {Math.round(profile.calorieTarget - totalCalories)}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <ReportMacroBar label="Protein" current={totalProtein} target={profile.proteinTarget} color="bg-[#3B82F6]" shadow="shadow-[0_4px_0_0_#2563EB]" />
            <ReportMacroBar label="Carbs" current={totalCarbs} target={profile.carbsTarget} color="bg-[#F59E0B]" shadow="shadow-[0_4px_0_0_#D97706]" />
            <ReportMacroBar label="Fat" current={totalFat} target={profile.fatTarget} color="bg-[#F43F5E]" shadow="shadow-[0_4px_0_0_#E11D48]" />
          </div>
        </div>

      </main>
    </div>
  );
}

function ReportMacroBar({ label, current, target, color, shadow }: { label: string, current: number, target: number, color: string, shadow: string }) {
  const percent = Math.min((current / target) * 100, 100);
  return (
    <div className="relative">
      <div className="flex justify-between text-sm mb-2 font-bold uppercase tracking-wider">
        <span className="text-stone-700">{label}</span>
        <span className="text-stone-500">{Math.round(current)} / {target}g</span>
      </div>
      <div className="h-6 w-full bg-stone-100 rounded-full overflow-hidden border-2 border-stone-200">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out border-r-2 border-white/20", color)} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
