import React from 'react';
import { ArrowLeft, Watch, Smartphone, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Wearables() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white border-b-2 border-stone-200 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-[0_4px_0_0_#f5f5f4]">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border-2 border-transparent hover:border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-stone-900 tracking-tight">Connected Devices</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        <p className="text-stone-500">Sync your daily steps, active calories, and workouts automatically.</p>

        <div className="space-y-4">
          <DeviceCard 
            icon={<Smartphone className="w-6 h-6 text-blue-500" />}
            name="Apple Health"
            status="Not Connected"
          />
          <DeviceCard 
            icon={<Activity className="w-6 h-6 text-green-500" />}
            name="Google Fit"
            status="Not Connected"
          />
          <DeviceCard 
            icon={<Watch className="w-6 h-6 text-stone-800" />}
            name="Garmin Connect"
            status="Not Connected"
          />
        </div>
      </main>
    </div>
  );
}

function DeviceCard({ icon, name, status }: { icon: React.ReactNode, name: string, status: string }) {
  return (
    <div className="bg-white border-2 border-stone-200 rounded-3xl p-4 flex items-center gap-4 shadow-[0_4px_0_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] transition-all cursor-pointer">
      <div className="w-16 h-16 rounded-2xl bg-stone-50 border-2 border-stone-200 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-black text-lg text-stone-900">{name}</h3>
        <p className="text-sm font-bold text-stone-500 mt-1">{status}</p>
      </div>
      <button className="px-5 py-2.5 text-sm font-bold text-emerald-800 bg-emerald-100 border-2 border-emerald-200 rounded-xl hover:bg-emerald-200 hover:border-emerald-300 transition-colors shadow-[0_2px_0_0_#a7f3d0] active:translate-y-[2px] active:shadow-none">
        Connect
      </button>
    </div>
  )
}
