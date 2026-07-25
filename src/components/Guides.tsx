import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, Dumbbell, Apple } from 'lucide-react';

export default function Guides() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors pb-24">
      <header className="bg-white dark:bg-stone-800 border-b-2 border-stone-200 dark:border-stone-700 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-[0_4px_0_0_#f5f5f4] dark:shadow-[0_4px_0_0_#1c1917] transition-colors">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border-2 border-transparent hover:border-stone-200 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Health Guides</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8 mt-4">
        <div className="bg-emerald-100 dark:bg-emerald-900/40 p-6 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-[0_6px_0_0_#a7f3d0] dark:shadow-[0_6px_0_0_#065f46]">
          <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mb-2">Ways to Lose Weight</h2>
          <p className="text-emerald-800 dark:text-emerald-200 font-medium">Explore holistic, physical, and nutritional approaches to achieving your weight goals sustainably.</p>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-stone-200 dark:border-stone-700 pb-2">
            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-black text-stone-900 dark:text-white">Ayurveda & Natural Remedies</h3>
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
          <div className="flex items-center gap-3 border-b-2 border-stone-200 dark:border-stone-700 pb-2">
            <Dumbbell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-black text-stone-900 dark:text-white">Effective Exercises</h3>
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
          <div className="flex items-center gap-3 border-b-2 border-stone-200 dark:border-stone-700 pb-2">
            <Apple className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h3 className="text-xl font-black text-stone-900 dark:text-white">Dietary Strategies</h3>
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
    <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border-2 border-stone-200 dark:border-stone-700 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1c1917] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] dark:hover:shadow-[0_2px_0_0_#1c1917] transition-all">
      <h4 className="font-black text-lg text-stone-900 dark:text-white mb-2">{title}</h4>
      <p className="text-stone-600 dark:text-stone-300 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
