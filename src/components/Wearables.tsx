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
    <div className="min-h-screen bg-zinc-50 pb-24">
      <header className="bg-white border-b-2 border-zinc-200 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Connected Devices</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        <p className="text-zinc-500">Sync your daily steps, active calories, and workouts automatically.</p>

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
            icon={<Watch className="w-6 h-6 text-zinc-800" />}
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
    <div onClick={onClick} className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:translate-y-[2px] hover:shadow-sm transition-all cursor-pointer">
      <div className="w-16 h-16 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg text-zinc-900">{name}</h3>
        <p className="text-sm font-bold text-zinc-500 mt-1">{status}</p>
      </div>
      <button className={`px-5 py-2.5 text-sm font-bold rounded-xl border transition-colors active:translate-y-[2px] active:shadow-none ${connected ? 'text-zinc-500 bg-zinc-100 border-zinc-200 shadow-sm' : 'text-indigo-800 bg-indigo-100 border-indigo-200 hover:bg-indigo-200 hover:border-indigo-300 shadow-sm'}`}>
        {connected ? 'Manage' : 'Connect'}
      </button>
    </div>
  )
}
