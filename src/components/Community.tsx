import React from 'react';
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Community() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white border-b-2 border-stone-200 px-6 py-4 sticky top-0 z-10 flex items-center gap-4 shadow-[0_4px_0_0_#f5f5f4]">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border-2 border-transparent hover:border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-stone-900 tracking-tight">Community Support</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          <TopicCard title="Weight Loss Support" members="12k" color="bg-rose-100 text-rose-800 border-rose-200" />
          <TopicCard title="Healthy Recipes" members="45k" color="bg-emerald-100 text-emerald-800 border-emerald-200" />
          <TopicCard title="Running Beginners" members="8k" color="bg-blue-100 text-blue-800 border-blue-200" />
        </div>

        <div className="space-y-6 mt-4">
          <PostCard 
            author="Sarah M." 
            time="2h ago" 
            content="Just hit my goal weight after 6 months of tracking! Consistency is key, guys. Don't give up! 💪" 
            likes={234}
            comments={45}
          />
          <PostCard 
            author="David Chen" 
            time="5h ago" 
            content="What are your favorite high-protein snacks for work? I'm getting tired of just greek yogurt." 
            likes={89}
            comments={112}
          />
        </div>

      </main>
    </div>
  );
}

function TopicCard({ title, members, color }: { title: string, members: string, color: string }) {
  return (
    <div className={`shrink-0 w-48 p-5 rounded-3xl snap-start border-2 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.1)] transition-all cursor-pointer ${color}`}>
      <h3 className="font-black text-lg mb-1">{title}</h3>
      <p className="text-sm font-bold opacity-80">{members} members</p>
    </div>
  )
}

function PostCard({ author, time, content, likes, comments }: { author: string, time: string, content: string, likes: number, comments: number }) {
  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-[0_6px_0_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#e5e7eb] transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-stone-600 font-black text-lg shadow-[0_2px_0_0_#e5e7eb]">
            {author.charAt(0)}
          </div>
          <div>
            <h4 className="font-black text-stone-900 text-base">{author}</h4>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{time}</p>
          </div>
        </div>
      </div>
      <p className="text-stone-800 font-medium leading-relaxed text-base mb-6">
        {content}
      </p>
      <div className="flex items-center gap-6 text-stone-500 text-sm font-black border-t-2 border-stone-100 pt-4">
        <button className="flex items-center gap-2 hover:text-rose-600 transition-colors p-2 -ml-2 rounded-xl hover:bg-rose-50">
          <Heart className="w-5 h-5" />
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-emerald-600 transition-colors p-2 rounded-xl hover:bg-emerald-50">
          <MessageCircle className="w-5 h-5" />
          <span>{comments}</span>
        </button>
      </div>
    </div>
  )
}
