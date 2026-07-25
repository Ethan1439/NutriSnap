import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityLevel, Goal, UserProfile } from '../types';
import { getProfile, saveProfile } from '../lib/storage';
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  useEffect(() => {
    const userProfile = getProfile();
    if (!userProfile) {
      navigate('/login');
      return;
    }
    setProfile(userProfile);
    setFormData({
      name: userProfile.name,
      email: userProfile.email,
      age: userProfile.age.toString(),
      gender: userProfile.gender,
      weight: userProfile.weight.toString(),
      height: userProfile.height.toString(),
      activityLevel: userProfile.activityLevel,
      goal: userProfile.goal,
    });
  }, [navigate]);

  const calculateTargets = (
    weight: number,
    height: number,
    age: number,
    gender: string,
    activity: ActivityLevel,
    goal: Goal
  ) => {
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
    const proteinTarget = Math.round((calorieTarget * 0.3) / 4);
    const carbsTarget = Math.round((calorieTarget * 0.4) / 4);
    const fatTarget = Math.round((calorieTarget * 0.3) / 9);

    return { calorieTarget, proteinTarget, carbsTarget, fatTarget };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);

    const targets = calculateTargets(weight, height, age, formData.gender, formData.activityLevel, formData.goal);

    const updatedProfile: UserProfile = {
      ...profile,
      name: formData.name,
      // Changing email resets verification? Let's assume yes if it's different.
      // But let's just keep email static or let them change it without reverifying for simplicity for now.
      email: formData.email,
      age,
      gender: formData.gender,
      weight,
      height,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      ...targets
    };

    saveProfile(updatedProfile);
    navigate('/');
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 pb-24 transition-colors">
      <header className="bg-white dark:bg-stone-800 border-b-2 border-stone-200 dark:border-stone-700 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-[0_4px_0_0_#f5f5f4] dark:shadow-[0_4px_0_0_#1c1917] transition-colors">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border-2 border-transparent hover:border-stone-200 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Settings</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6 mt-4">
        <div className="bg-white dark:bg-stone-800 w-full rounded-3xl border-4 border-stone-800 shadow-[8px_8px_0_0_#292524] overflow-hidden">
          <div className="p-6 text-center border-b-4 border-stone-800 bg-emerald-300 dark:bg-emerald-700">
            <div className="w-16 h-16 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-stone-900 shadow-[4px_4px_0_0_#292524]">
              <SettingsIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Update Profile</h1>
            <p className="text-stone-800 dark:text-stone-200 font-bold mt-2">Adjust your stats to recalculate targets.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Name</label>
                <input required type="text" className="w-full p-3 bg-stone-50 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 font-medium text-stone-900 dark:text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Email Address (Read Only)</label>
                <input disabled type="email" className="w-full p-3 bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl font-medium text-stone-500 dark:text-stone-500" value={formData.email} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Age</label>
                <input required type="number" className="w-full p-3 bg-stone-50 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 font-medium text-stone-900 dark:text-white" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Gender</label>
                <select className="w-full p-3 bg-stone-50 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 font-medium text-stone-900 dark:text-white" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Weight (kg)</label>
                <input required type="number" step="0.1" className="w-full p-3 bg-stone-50 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 font-medium text-stone-900 dark:text-white" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Height (cm)</label>
                <input required type="number" className="w-full p-3 bg-stone-50 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 font-medium text-stone-900 dark:text-white" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Activity Level</label>
              <select className="w-full p-3 bg-stone-50 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 font-medium text-stone-900 dark:text-white" value={formData.activityLevel} onChange={(e) => setFormData({...formData, activityLevel: e.target.value as ActivityLevel})}>
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Moderately Active</option>
                <option>Very Active</option>
                <option>Super Active</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Goal</label>
              <select className="w-full p-3 bg-stone-50 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 font-medium text-stone-900 dark:text-white" value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value as Goal})}>
                <option>Lose</option>
                <option>Maintain</option>
                <option>Gain</option>
              </select>
            </div>

            <button type="submit" className="w-full py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white active:translate-y-[4px] active:border-b-0 text-white dark:text-stone-900 font-black text-lg rounded-2xl transition-all border-b-4 border-stone-700 dark:border-stone-300 shadow-sm mt-4">
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
