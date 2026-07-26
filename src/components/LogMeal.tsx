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
      
      const dishes = [
        { name: 'Chicken Tikka Masala', calories: 550, protein: 35, carbs: 15, fat: 40 },
        { name: 'Palak Paneer', calories: 350, protein: 18, carbs: 12, fat: 28 },
        { name: 'Dal Makhani', calories: 300, protein: 14, carbs: 40, fat: 12 },
        { name: 'Butter Naan', calories: 250, protein: 6, carbs: 45, fat: 8 },
        { name: 'Biryani', calories: 450, protein: 15, carbs: 65, fat: 15 },
        { name: 'Masala Dosa', calories: 350, protein: 8, carbs: 55, fat: 12 },
        { name: 'Samosa', calories: 260, protein: 4, carbs: 32, fat: 14 },
        { name: 'Chole Bhature', calories: 600, protein: 18, carbs: 75, fat: 25 },
        { name: 'Grilled Chicken Salad', calories: 320, protein: 35, carbs: 12, fat: 15 },
        { name: 'Avocado Toast', calories: 280, protein: 8, carbs: 30, fat: 14 },
        { name: text.length > 20 ? text.substring(0, 20) + '...' : text, calories: Math.floor(Math.random() * 500) + 200, protein: Math.floor(Math.random() * 30) + 10, carbs: Math.floor(Math.random() * 50) + 20, fat: Math.floor(Math.random() * 20) + 5 }
      ];
      
      const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
      
      const mockResult = {
        name: randomDish.name,
        calories: randomDish.calories,
        protein: randomDish.protein,
        carbs: randomDish.carbs,
        fat: randomDish.fat
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
    if (!imageFile && !spokenText) return;
    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (spokenText) {
        formData.append('spokenText', spokenText);
      }

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze meal');
      }

      const result = await response.json();
      
      setAnalysisResult({
        name: result.name || "Analyzed Meal",
        calories: result.calories || 0,
        protein: result.protein || 0,
        carbs: result.carbs || 0,
        fat: result.fat || 0
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not analyze the image. Please try again.');
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
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Error Toast Notification */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 w-full max-w-sm px-4">
          <div className="bg-red-100 text-red-800 px-4 py-4 rounded-lg shadow-xl border border-red-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
              <X className="w-5 h-5 text-red-700" />
            </div>
            <p className="font-bold flex-1 text-sm">{error}</p>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 bg-white/50 rounded-full p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b-2 border-zinc-200 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Log Meal</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        
        {!previewUrl && !isRecording && !analysisResult ? (
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-white border border-dashed border-indigo-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group"
            >
              <div className="w-16 h-16 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Camera className="w-8 h-8" />
              </div>
              <p className="font-bold text-zinc-700 text-lg">Tap to snap or upload</p>
              <p className="text-sm font-bold text-zinc-400 mt-1">Our AI will estimate your calories automatically</p>
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
              <div className="flex-grow border-t-2 border-zinc-200"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-400 font-bold">OR</span>
              <div className="flex-grow border-t-2 border-zinc-200"></div>
            </div>

            <button 
              onClick={toggleRecording}
              className="w-full aspect-video bg-white border border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <div className="w-16 h-16 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Mic className="w-8 h-8" />
              </div>
              <p className="font-bold text-zinc-700 text-lg">Describe with Voice</p>
              <p className="text-sm font-bold text-zinc-400 mt-1">Speak to log your meal</p>
            </button>
          </div>
        ) : isRecording ? (
          <div className="w-full aspect-square md:aspect-video bg-blue-50 border border-blue-400 rounded-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6 animate-pulse border border-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
              <Mic className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Listening...</h3>
            <p className="text-zinc-600 font-medium min-h-[3rem] italic">
              {spokenText || "Describe your meal..."}
            </p>
            <button 
              onClick={toggleRecording}
              className="mt-8 py-4 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 border border-blue-800 active:translate-y-[4px] active:border-b-0"
            >
              <Square className="w-5 h-5 fill-white" />
              Stop & Analyze
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden shadow-sm border border-zinc-200">
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

            {!analysisResult && !isAnalyzing && (
              <button 
                onClick={analyzeImage}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-lg rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 border border-indigo-700 active:translate-y-[4px] active:border-b-0"
              >
                <Upload className="w-5 h-5" />
                Analyze Meal
              </button>
            )}

            {isAnalyzing && (
              <div className="bg-white p-8 rounded-lg border border-zinc-200 text-center flex flex-col items-center shadow-sm">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <h3 className="font-bold text-zinc-900 text-lg">AI is analyzing your meal...</h3>
                <p className="text-zinc-500 mt-1">Estimating macros and calories.</p>
              </div>
            )}

            {analysisResult && (
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <p className="text-sm font-bold text-indigo-800 uppercase tracking-wider">Verify AI Analysis</p>
                  </div>
                  <p className="text-sm text-indigo-700 font-medium mb-4">Please verify if the AI identified your meal correctly. Edit the name if needed.</p>
                  
                  <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 block">Meal Name</label>
                  <input 
                    type="text" 
                    value={analysisResult.name} 
                    onChange={e => setAnalysisResult({...analysisResult, name: e.target.value})}
                    className="text-xl font-bold text-zinc-900 w-full bg-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 border border-indigo-200 transition-colors shadow-sm" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 shadow-sm">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 block">Calories</label>
                    <div className="flex items-baseline gap-1">
                      <input 
                        type="number" 
                        value={analysisResult.calories} 
                        onChange={e => setAnalysisResult({...analysisResult, calories: Number(e.target.value)})}
                        className="text-4xl font-bold text-indigo-700 w-20 bg-transparent focus:outline-none" 
                      />
                      <span className="text-sm font-bold text-indigo-600">kcal</span>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-2 shadow-sm">
                    <MacroInput label="Protein" value={analysisResult.protein} onChange={v => setAnalysisResult({...analysisResult, protein: v})} color="text-blue-600" />
                    <MacroInput label="Carbs" value={analysisResult.carbs} onChange={v => setAnalysisResult({...analysisResult, carbs: v})} color="text-orange-600" />
                    <MacroInput label="Fat" value={analysisResult.fat} onChange={v => setAnalysisResult({...analysisResult, fat: v})} color="text-red-600" />
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-lg rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 border border-indigo-700 active:translate-y-[4px] active:border-b-0 mt-4"
                >
                  Save to Daily Log
                </button>
              </div>
            )}
          </div>
        )}
        
        {historyMeals.length > 0 && !previewUrl && !isRecording && !analysisResult && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Meal History</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {historyMeals.map(meal => (
                <div 
                  key={meal.id} 
                  onClick={() => {
                    setAnalysisResult(meal);
                    setPreviewUrl(meal.imageUrl || null);
                  }}
                  className="flex-shrink-0 w-48 bg-white border border-zinc-200 rounded-xl p-3 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all snap-start"
                >
                  <div className="aspect-square bg-zinc-100 rounded-lg mb-3 overflow-hidden border border-zinc-100">
                    {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <Camera className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-zinc-900 truncate">{meal.name}</h3>
                  <p className="text-sm font-bold text-indigo-600">{meal.calories} kcal</p>
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
      <span className="font-medium text-zinc-600">{label}</span>
      <div className="flex items-center gap-1">
        <input 
          type="number" 
          value={value} 
          onChange={e => onChange(Number(e.target.value))}
          className={`w-10 text-right font-bold bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 ${color}`} 
        />
        <span className="text-zinc-400 font-medium">g</span>
      </div>
    </div>
  )
}
