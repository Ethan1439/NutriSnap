import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Trophy, Users, Plus, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Challenge = {
  id: string;
  title: string;
  description: string;
  participants: number;
  duration: string;
  isJoined: boolean;
  progress: number;
  leaderboard: { name: string; score: string }[];
};

const initialChallenges: Challenge[] = [
  {
    id: 'c1',
    title: '10k Steps Daily',
    description: 'Walk 10,000 steps every day for a month.',
    participants: 1245,
    duration: '30 days left',
    isJoined: false,
    progress: 0,
    leaderboard: [
      { name: 'Sarah M.', score: '240k steps' },
      { name: 'David C.', score: '235k steps' },
      { name: 'You', score: '0 steps' },
    ]
  },
  {
    id: 'c2',
    title: 'No Sugar Week',
    description: 'Avoid all added sugars for 7 straight days.',
    participants: 342,
    duration: '5 days left',
    isJoined: true,
    progress: 60,
    leaderboard: [
      { name: 'Emma W.', score: '5 days' },
      { name: 'You', score: '3 days' },
      { name: 'John D.', score: '2 days' },
    ]
  }
];

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'discussions' | 'challenges'>('challenges');
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);

  const toggleJoin = (id: string) => {
    setChallenges(challenges.map(c => c.id === id ? { ...c, isJoined: !c.isJoined } : c));
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white border-b-2 border-stone-200 px-6 py-4 sticky top-0 z-10 flex flex-col gap-4 shadow-[0_4px_0_0_#f5f5f4]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl border-2 border-transparent hover:border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-stone-900 tracking-tight">Community Support</h1>
        </div>
        
        <div className="flex bg-stone-100 p-1 rounded-2xl border-2 border-stone-200">
          <button 
            onClick={() => setActiveTab('discussions')}
            className={`flex-1 py-2 font-bold text-sm rounded-xl transition-all ${activeTab === 'discussions' ? 'bg-white text-stone-900 shadow-[0_2px_0_0_#e5e7eb] border-2 border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Discussions
          </button>
          <button 
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-2 font-bold text-sm rounded-xl transition-all ${activeTab === 'challenges' ? 'bg-white text-stone-900 shadow-[0_2px_0_0_#e5e7eb] border-2 border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Challenges
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        {activeTab === 'discussions' ? (
          <>
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
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-black text-stone-900">Active Challenges</h2>
              <button className="flex items-center gap-1 text-emerald-600 font-bold hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-xl border-2 border-emerald-200">
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
            </div>
            
            {challenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} onToggleJoin={() => toggleJoin(challenge.id)} />
            ))}
          </div>
        )}
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

const ChallengeCard: React.FC<{ challenge: Challenge, onToggleJoin: () => void }> = ({ challenge, onToggleJoin }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-[0_6px_0_0_#e5e7eb]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-black text-xl text-stone-900 mb-1">{challenge.title}</h3>
          <p className="text-stone-500 font-medium">{challenge.description}</p>
        </div>
        <div className="bg-blue-100 text-blue-800 p-2 rounded-2xl border-2 border-blue-200">
          <Target className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm font-bold text-stone-500 mb-6">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{challenge.participants.toLocaleString()} joined</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          <span>{challenge.duration}</span>
        </div>
      </div>

      {challenge.isJoined && (
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-stone-600">Your Progress</span>
            <span className="text-emerald-600">{challenge.progress}%</span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full border-2 border-stone-200 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full" 
              style={{ width: `${challenge.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button 
          onClick={onToggleJoin}
          className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm border-2 transition-all active:translate-y-[2px] active:shadow-none shadow-[0_4px_0_0_rgba(0,0,0,0.1)] ${
            challenge.isJoined 
              ? 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200 shadow-[0_4px_0_0_#d6d3d1]' 
              : 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-400 shadow-[0_4px_0_0_#047857]'
          }`}
        >
          {challenge.isJoined ? 'Leave Challenge' : 'Join Challenge'}
        </button>
        
        <button 
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="py-3 px-4 rounded-2xl font-black text-sm bg-white text-stone-700 border-2 border-stone-200 hover:bg-stone-50 transition-all active:translate-y-[2px] active:shadow-none shadow-[0_4px_0_0_#e5e7eb]"
        >
          Leaderboard
        </button>
      </div>

      {showLeaderboard && (
        <div className="mt-6 p-4 bg-stone-50 rounded-2xl border-2 border-stone-200">
          <h4 className="font-black text-stone-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Participants
          </h4>
          <div className="space-y-3">
            {challenge.leaderboard.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-stone-200">
                <div className="flex items-center gap-3">
                  <span className={`font-black w-6 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-stone-400' : idx === 2 ? 'text-amber-700' : 'text-stone-300'}`}>
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-stone-800">{entry.name}</span>
                </div>
                <span className="font-bold text-emerald-600">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

