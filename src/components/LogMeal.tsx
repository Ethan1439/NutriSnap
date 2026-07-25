import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Loader2, ArrowLeft, Mic, Square } from 'lucide-react';
import { addMealToLog, getAllLoggedMeals } from '../lib/storage';
import { format } from 'date-fns';
import { Meal } from '../types';

export default function LogMeal() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Partial<Meal> | null>(null);
  const [error, setError] = useState('');
  const [historyMeals, setHistoryMeals] = useState<Meal[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistoryMeals(getAllLoggedMeals());
  }, []);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setSpokenText(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (spokenText) {
        analyzeText(spokenText);
      }
    } else {
      setSpokenText('');
      setAnalysisResult(null);
      setError('');
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Speech recognition error", e);
        setError("Microphone access denied or not supported.");
      }
    }
  };

  const analyzeText = async (text: string) => {
    if (!text) return;
    setIsAnalyzing(true);
    setError('');

    try {
      // Simulate network delay for GitHub pages
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult = {
        name: text.length > 20 ? text.substring(0, 20) + '...' : text,
        calories: Math.floor(Math.random() * 500) + 200,
        protein: Math.floor(Math.random() * 30) + 10,
        carbs: Math.floor(Math.random() * 50) + 20,
        fat: Math.floor(Math.random() * 20) + 5
      };

      setAnalysisResult(mockResult);
    } catch (err) {
      console.error(err);
      setError('Could not analyze the description. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError('');
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);
    setError('');

    try {
      // Simulate network delay for GitHub pages
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult = {
        name: 'Analyzed Meal',
        calories: Math.floor(Math.random() * 500) + 200,
        protein: Math.floor(Math.random() * 30) + 10,
        carbs: Math.floor(Math.random() * 50) + 20,
        fat: Math.floor(Math.random() * 20) + 5
      };

      setAnalysisResult(mockResult);
    } catch (err) {
      console.error(err);
      setError('Could not analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!analysisResult) return;

    const meal: Meal = {
      id: Math.random().toString(36).substring(7),
      name: analysisResult.name || 'Unknown Meal',
      calories: analysisResult.calories || 0,
      protein: analysisResult.protein || 0,
      carbs: analysisResult.carbs || 0,
      fat: analysisResult.fat || 0,
      timestamp: Date.now(),
      imageUrl: previewUrl || undefined, // Saving blob URL temporarily for current session viewing
    };

    const today = format(new Date(), 'yyyy-MM-dd');
    addMealToLog(today, meal);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white border-b-2 border-stone-200 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-[0_4px_0_0_#f5f5f4]">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border-2 border-transparent hover:border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-stone-900 tracking-tight">Log Meal</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        
        {!previewUrl && !isRecording && !analysisResult ? (
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-white border-4 border-dashed border-emerald-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_0_0_#a7f3d0]">
                <Camera className="w-8 h-8" />
              </div>
              <p className="font-black text-stone-700 text-lg">Tap to snap or upload</p>
              <p className="text-sm font-bold text-stone-400 mt-1">Our AI will estimate your calories automatically</p>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t-2 border-stone-200"></div>
              <span className="flex-shrink-0 mx-4 text-stone-400 font-black">OR</span>
              <div className="flex-grow border-t-2 border-stone-200"></div>
            </div>

            <button 
              onClick={toggleRecording}
              className="w-full aspect-video bg-white border-4 border-dashed border-blue-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_0_0_#bfdbfe]">
                <Mic className="w-8 h-8" />
              </div>
              <p className="font-black text-stone-700 text-lg">Describe with Voice</p>
              <p className="text-sm font-bold text-stone-400 mt-1">Speak to log your meal</p>
            </button>
          </div>
        ) : isRecording ? (
          <div className="w-full aspect-square md:aspect-video bg-blue-50 border-4 border-blue-400 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6 animate-pulse border-4 border-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
              <Mic className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-2">Listening...</h3>
            <p className="text-stone-600 font-medium min-h-[3rem] italic">
              {spokenText || "Describe your meal..."}
            </p>
            <button 
              onClick={toggleRecording}
              className="mt-8 py-4 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 border-b-4 border-blue-800 active:translate-y-[4px] active:border-b-0"
            >
              <Square className="w-5 h-5 fill-white" />
              Stop & Analyze
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200">
              <img src={previewUrl} alt="Meal preview" className="w-full h-64 object-cover" />
              {!isAnalyzing && !analysisResult && (
                <button 
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm font-medium border border-rose-100">
                {error}
              </div>
            )}

            {!analysisResult && !isAnalyzing && (
              <button 
                onClick={analyzeImage}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:translate-y-[4px] active:border-b-0"
              >
                <Upload className="w-5 h-5" />
                Analyze Meal
              </button>
            )}

            {isAnalyzing && (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center flex flex-col items-center shadow-sm">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <h3 className="font-bold text-stone-900 text-lg">AI is analyzing your meal...</h3>
                <p className="text-stone-500 mt-1">Estimating macros and calories.</p>
              </div>
            )}

            {analysisResult && (
              <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-[0_8px_0_0_#e5e7eb] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b-2 border-stone-100 pb-4">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1 block">Identified Meal</label>
                  <input 
                    type="text" 
                    value={analysisResult.name} 
                    onChange={e => setAnalysisResult({...analysisResult, name: e.target.value})}
                    className="text-2xl font-black text-stone-900 w-full focus:outline-none focus:border-emerald-500 border-b-2 border-transparent transition-colors" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200 shadow-[0_4px_0_0_#a7f3d0]">
                    <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 block">Calories</label>
                    <div className="flex items-baseline gap-1">
                      <input 
                        type="number" 
                        value={analysisResult.calories} 
                        onChange={e => setAnalysisResult({...analysisResult, calories: Number(e.target.value)})}
                        className="text-4xl font-black text-emerald-700 w-20 bg-transparent focus:outline-none" 
                      />
                      <span className="text-sm font-bold text-emerald-600">kcal</span>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 space-y-2 shadow-[0_4px_0_0_#e5e7eb]">
                    <MacroInput label="Protein" value={analysisResult.protein} onChange={v => setAnalysisResult({...analysisResult, protein: v})} color="text-blue-600" />
                    <MacroInput label="Carbs" value={analysisResult.carbs} onChange={v => setAnalysisResult({...analysisResult, carbs: v})} color="text-amber-600" />
                    <MacroInput label="Fat" value={analysisResult.fat} onChange={v => setAnalysisResult({...analysisResult, fat: v})} color="text-rose-600" />
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:translate-y-[4px] active:border-b-0 mt-4"
                >
                  Save to Daily Log
                </button>
              </div>
            )}
          </div>
        )}
        
        {historyMeals.length > 0 && !previewUrl && !isRecording && !analysisResult && (
          <div className="mt-8">
            <h2 className="text-lg font-black text-stone-900 mb-4">Meal History</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {historyMeals.map(meal => (
                <div 
                  key={meal.id} 
                  onClick={() => {
                    setAnalysisResult(meal);
                    setPreviewUrl(meal.imageUrl || null);
                  }}
                  className="flex-shrink-0 w-48 bg-white border-2 border-stone-200 rounded-3xl p-3 shadow-sm cursor-pointer hover:border-emerald-300 hover:shadow-[0_4px_0_0_#a7f3d0] transition-all snap-start"
                >
                  <div className="aspect-square bg-stone-100 rounded-2xl mb-3 overflow-hidden border-2 border-stone-100">
                    {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <Camera className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-900 truncate">{meal.name}</h3>
                  <p className="text-sm font-bold text-emerald-600">{meal.calories} kcal</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MacroInput({ label, value, onChange, color }: { label: string, value: number | undefined, onChange: (v: number) => void, color: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="font-medium text-stone-600">{label}</span>
      <div className="flex items-center gap-1">
        <input 
          type="number" 
          value={value} 
          onChange={e => onChange(Number(e.target.value))}
          className={`w-10 text-right font-bold bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 ${color}`} 
        />
        <span className="text-stone-400 font-medium">g</span>
      </div>
    </div>
  )
}
