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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-24 transition-colors">
      <header className="bg-white dark:bg-zinc-800 border-b-2 border-zinc-200 dark:border-zinc-700 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-sm dark:shadow-sm transition-colors">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Settings</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6 mt-4">
        <div className="bg-white dark:bg-zinc-800 w-full rounded-xl border border-zinc-800 shadow-xl overflow-hidden">
          <div className="p-6 text-center border border-zinc-800 bg-indigo-300 dark:bg-indigo-700">
            <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-900 shadow-[4px_4px_0_0_#292524]">
              <SettingsIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Update Profile</h1>
            <p className="text-zinc-800 dark:text-zinc-200 font-bold mt-2">Adjust your stats to recalculate targets.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Name</label>
                <input required type="text" className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 font-medium text-zinc-900 dark:text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Email Address (Read Only)</label>
                <input disabled type="email" className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium text-zinc-500 dark:text-zinc-500" value={formData.email} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Age</label>
                <input required type="number" className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 font-medium text-zinc-900 dark:text-white" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Gender</label>
                <select className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 font-medium text-zinc-900 dark:text-white" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Weight (kg)</label>
                <input required type="number" step="0.1" className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 font-medium text-zinc-900 dark:text-white" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Height (cm)</label>
                <input required type="number" className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 font-medium text-zinc-900 dark:text-white" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Activity Level</label>
              <select className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 font-medium text-zinc-900 dark:text-white" value={formData.activityLevel} onChange={(e) => setFormData({...formData, activityLevel: e.target.value as ActivityLevel})}>
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Moderately Active</option>
                <option>Very Active</option>
                <option>Super Active</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Goal</label>
              <select className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 font-medium text-zinc-900 dark:text-white" value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value as Goal})}>
                <option>Lose</option>
                <option>Maintain</option>
                <option>Gain</option>
              </select>
            </div>

            <button type="submit" className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white active:translate-y-[4px] active:border-b-0 text-white dark:text-zinc-900 font-bold text-lg rounded-lg transition-all border border-zinc-700 dark:border-zinc-300 shadow-sm mt-4">
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
