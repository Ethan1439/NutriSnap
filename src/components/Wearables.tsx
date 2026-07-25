import React, { useState, useEffect } from 'react';
import { ArrowLeft, Watch, Smartphone, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { googleSignIn, initAuth, logout } from '../lib/googleFit';

export default function Wearables() {
  const navigate = useNavigate();
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    initAuth(
      (user, token) => {
        setGoogleFitConnected(true);
        localStorage.setItem('googleFitConnected', 'true');
      },
      () => {
        setGoogleFitConnected(false);
        localStorage.removeItem('googleFitConnected');
      }
    );
  }, []);

  const handleAppleHealth = () => {
    alert("Apple Health sync requires our iOS companion app (Coming Soon). Please download the app from the App Store to enable this feature.");
  };

  const handleGoogleFit = async () => {
    if (googleFitConnected) {
      if (confirm("Disconnect Google Fit?")) {
        await logout();
        setGoogleFitConnected(false);
        localStorage.removeItem('googleFitConnected');
      }
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleFitConnected(true);
        localStorage.setItem('googleFitConnected', 'true');
        alert("Google Fit connected successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to start Google Fit connection.");
    } finally {
      setIsLoggingIn(false);
    }
  };

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
            status="Requires iOS App"
            onClick={handleAppleHealth}
            connected={false}
          />
          <DeviceCard 
            icon={<Activity className="w-6 h-6 text-green-500" />}
            name="Google Fit"
            status={googleFitConnected ? "Connected" : "Not Connected"}
            onClick={handleGoogleFit}
            connected={googleFitConnected}
          />
          <DeviceCard 
            icon={<Watch className="w-6 h-6 text-stone-800" />}
            name="Garmin Connect"
            status="Not Connected"
            onClick={() => alert("Garmin Connect integration coming soon.")}
            connected={false}
          />
        </div>
      </main>
    </div>
  );
}

function DeviceCard({ icon, name, status, onClick, connected }: { icon: React.ReactNode, name: string, status: string, onClick: () => void, connected: boolean }) {
  return (
    <div onClick={onClick} className="bg-white border-2 border-stone-200 rounded-3xl p-4 flex items-center gap-4 shadow-[0_4px_0_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5e7eb] transition-all cursor-pointer">
      <div className="w-16 h-16 rounded-2xl bg-stone-50 border-2 border-stone-200 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-black text-lg text-stone-900">{name}</h3>
        <p className="text-sm font-bold text-stone-500 mt-1">{status}</p>
      </div>
      <button className={`px-5 py-2.5 text-sm font-bold rounded-xl border-2 transition-colors active:translate-y-[2px] active:shadow-none ${connected ? 'text-stone-500 bg-stone-100 border-stone-200 shadow-[0_2px_0_0_#e5e7eb]' : 'text-emerald-800 bg-emerald-100 border-emerald-200 hover:bg-emerald-200 hover:border-emerald-300 shadow-[0_2px_0_0_#a7f3d0]'}`}>
        {connected ? 'Manage' : 'Connect'}
      </button>
    </div>
  )
}
