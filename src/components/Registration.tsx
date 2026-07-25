import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityLevel, Goal, UserProfile } from '../types';
import { saveProfile } from '../lib/storage';
import { ShieldCheck } from 'lucide-react';

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    weight: '',
    height: '',
    activityLevel: 'Moderately Active' as ActivityLevel,
    goal: 'Maintain' as Goal,
  });

  const calculateTargets = (
    weight: number,
    height: number,
    age: number,
    gender: string,
    activity: ActivityLevel,
    goal: Goal
  ) => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === 'Female' ? -161 : 5;

    const activityMultipliers = {
      'Sedentary': 1.2,
      'Lightly Active': 1.375,
      'Moderately Active': 1.55,
      'Very Active': 1.725,
      'Super Active': 1.9,
    };

    let tdee = bmr * activityMultipliers[activity];

    if (goal === 'Lose') tdee -= 500;
    if (goal === 'Gain') tdee += 500;

    const calorieTarget = Math.round(tdee);
    
    // Macros: 30% Protein, 40% Carbs, 30% Fat
    const proteinTarget = Math.round((calorieTarget * 0.3) / 4);
    const carbsTarget = Math.round((calorieTarget * 0.4) / 4);
    const fatTarget = Math.round((calorieTarget * 0.3) / 9);

    return { calorieTarget, proteinTarget, carbsTarget, fatTarget };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);

    const targets = calculateTargets(weight, height, age, formData.gender, formData.activityLevel, formData.goal);

    const profile: UserProfile = {
      name: formData.name,
      email: formData.email,
      isEmailVerified: false,
      age,
      gender: formData.gender,
      weight,
      height,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      ...targets
    };

    saveProfile(profile);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-stone-800 shadow-[8px_8px_0_0_#292524] overflow-hidden">
        <div className="p-8 text-center border-b-4 border-stone-800 bg-emerald-300">
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Welcome to NutriSnap</h1>
          <p className="text-stone-800 font-bold mt-2">Let's set up your personalized fitness and diet goals.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">Email Address</label>
            <input required type="email" className="w-full p-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Name</label>
              <input required type="text" className="w-full p-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Age</label>
              <input required type="number" min="12" max="120" className="w-full p-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Height (cm)</label>
              <input required type="number" min="100" max="250" className="w-full p-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Weight (kg)</label>
              <input required type="number" step="0.1" min="30" max="300" className="w-full p-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">Gender</label>
            <select className="w-full p-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">Activity Level</label>
            <select className="w-full p-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" value={formData.activityLevel} onChange={(e) => setFormData({...formData, activityLevel: e.target.value as ActivityLevel})}>
              <option value="Sedentary">Sedentary (Office job, little exercise)</option>
              <option value="Lightly Active">Lightly Active (1-3 days/wk)</option>
              <option value="Moderately Active">Moderately Active (3-5 days/wk)</option>
              <option value="Very Active">Very Active (6-7 days/wk)</option>
              <option value="Super Active">Super Active (Physical job + training)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">Primary Goal</label>
            <select className="w-full p-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value as Goal})}>
              <option value="Lose">Lose Weight</option>
              <option value="Maintain">Maintain Weight</option>
              <option value="Gain">Gain Muscle / Weight</option>
            </select>
          </div>

          <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:translate-y-[4px] active:border-b-0 text-white font-black text-lg rounded-2xl transition-all border-b-4 border-emerald-700 shadow-sm mt-4">
            Calculate My Plan
          </button>
        </form>

        <div className="p-6 bg-stone-100 border-t-4 border-stone-800 text-center">
          <div className="flex items-center justify-center gap-2 text-stone-600 mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <p className="text-sm font-bold">Your data is safe and strictly private.</p>
          </div>
          <p className="text-xs font-medium text-stone-500 max-w-xs mx-auto">
            We securely encrypt your personal metrics and do not share your health data with any third-party advertisers.
          </p>
        </div>
      </div>
    </div>
  );
}
