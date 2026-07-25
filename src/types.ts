export type Goal = 'Lose' | 'Maintain' | 'Gain';
export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Super Active';

export interface UserProfile {
  name: string;
  email: string;
  isEmailVerified: boolean;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number; // in kg
  height: number; // in cm
  activityLevel: ActivityLevel;
  goal: Goal;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  badges?: string[];
  themePreference?: 'light' | 'dark';
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
  imageUrl?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  weight?: number;
  water?: number; // glasses
}
