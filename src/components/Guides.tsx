import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, Dumbbell, Apple } from 'lucide-react';

export default function Guides() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors pb-24">
      <header className="bg-white dark:bg-zinc-800 border-b-2 border-zinc-200 dark:border-zinc-700 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-sm dark:shadow-sm transition-colors">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Health Guides</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8 mt-4">
        <div className="bg-indigo-100 dark:bg-indigo-900/40 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-md dark:shadow-md">
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">Ways to Lose Weight</h2>
          <p className="text-indigo-800 dark:text-indigo-200 font-medium">Explore holistic, physical, and nutritional approaches to achieving your weight goals sustainably.</p>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-zinc-200 dark:border-zinc-700 pb-2">
            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Ayurveda & Natural Remedies</h3>
          </div>
          
          <div className="grid gap-4">
            <GuideCard 
              title="Triphala Churna" 
              desc="An ancient herbal preparation consisting of three fruits. It helps in digestion and detoxification, which can support healthy weight loss when taken with warm water before bed."
            />
            <GuideCard 
              title="Warm Lemon & Honey Water" 
              desc="Starting your day with a glass of warm water, fresh lemon juice, and a spoonful of honey can boost metabolism and aid in fat burning."
            />
            <GuideCard 
              title="Guggul (Commiphora Mukul)" 
              desc="A well-known Ayurvedic resin that contains guggulsterone, which is believed to stimulate the thyroid gland and enhance metabolic rate."
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-zinc-200 dark:border-zinc-700 pb-2">
            <Dumbbell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Effective Exercises</h3>
          </div>
          
          <div className="grid gap-4">
            <GuideCard 
              title="High-Intensity Interval Training (HIIT)" 
              desc="Short bursts of intense exercise alternated with low-intensity recovery periods. Excellent for burning maximum calories in a minimal amount of time."
            />
            <GuideCard 
              title="Strength Training" 
              desc="Building muscle increases your resting metabolic rate, meaning you'll burn more calories even when you're not working out. Try weight lifting or bodyweight exercises like squats and push-ups."
            />
            <GuideCard 
              title="Yoga (Surya Namaskar)" 
              desc="Sun Salutations offer a full-body workout that improves flexibility, builds core strength, and aids in mindful weight management."
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-zinc-200 dark:border-zinc-700 pb-2">
            <Apple className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Dietary Strategies</h3>
          </div>
          
          <div className="grid gap-4">
            <GuideCard 
              title="Intermittent Fasting" 
              desc="An eating pattern that cycles between periods of fasting and eating (like the 16/8 method). It can help reduce calorie intake and optimize hormones for weight loss."
            />
            <GuideCard 
              title="High-Protein Diet" 
              desc="Protein reduces appetite and boosts metabolism. Include lean meats, eggs, legumes, or plant-based proteins in every meal."
            />
            <GuideCard 
              title="Mindful Eating" 
              desc="Pay attention to what you eat, savor each bite, and eat slowly. This helps recognize fullness cues and prevents overeating."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function GuideCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm dark:shadow-sm hover:translate-y-[2px] hover:shadow-sm dark:hover:shadow-sm transition-all">
      <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{title}</h4>
      <p className="text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
