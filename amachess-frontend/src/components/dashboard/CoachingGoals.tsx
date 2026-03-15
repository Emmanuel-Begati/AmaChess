import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserGoals {
  chessGoal: string;
  focusAreas: string[];
  targetRating: string | number;
}

const AVAILABLE_FOCUS_AREAS = [
  'Tactics & Calculation',
  'Positional Play',
  'Opening Repertoire',
  'Endgame Technique',
  'Time Management',
  'Minimizing Blunders',
  'Attacking Chess',
  'Defensive Resilience'
];

const CoachingGoals: React.FC = () => {
  const [goals, setGoals] = useState<UserGoals>({ chessGoal: '', focusAreas: [], targetRating: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get('/goals');
        if (response.data.success) {
          setGoals(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch coaching goals', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put('/goals', goals);
      if (response.data.success) {
        setGoals(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save coaching goals', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFocusArea = (area: string) => {
    setGoals(prev => {
      if (prev.focusAreas.includes(area)) {
        return { ...prev, focusAreas: prev.focusAreas.filter(a => a !== area) };
      }
      if (prev.focusAreas.length >= 3) return prev; // Max 3 focus areas
      return { ...prev, focusAreas: [...prev.focusAreas, area] };
    });
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-700 rounded mb-4"></div>
        <div className="h-20 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span> Improvement Goals
        </h3>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            isEditing 
              ? 'bg-[#115fd4] hover:bg-blue-600 text-white shadow-lg shadow-[#115fd4]/20' 
              : 'bg-slate-700/50 hover:bg-slate-700 text-gray-300'
          }`}
        >
          {isSaving ? 'Saving...' : isEditing ? 'Save Goals' : 'Edit Goals'}
        </button>
      </div>

      {!isEditing && !goals.chessGoal && goals.focusAreas.length === 0 ? (
        <div className="text-center py-6 bg-slate-800/30 rounded-xl border border-dashed border-slate-600">
          <p className="text-gray-400 mb-2">Tell Coach B what you want to achieve.</p>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[#115fd4] hover:text-blue-400 font-medium text-sm transition-colors"
          >
            Set your first coaching goal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Goal */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Primary Goal</label>
            {isEditing ? (
              <input
                type="text"
                value={goals.chessGoal}
                onChange={e => setGoals({ ...goals, chessGoal: e.target.value })}
                placeholder="e.g., Reach 1600 rating, Win Local Tournament..."
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] transition-all outline-none"
              />
            ) : (
              <p className="text-white text-lg bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50">
                {goals.chessGoal || <span className="text-gray-500 italic">No primary goal set</span>}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Rating</label>
              {isEditing ? (
                <input
                  type="number"
                  value={goals.targetRating}
                  onChange={e => setGoals({ ...goals, targetRating: e.target.value })}
                  placeholder="e.g., 1800"
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] transition-all outline-none"
                />
              ) : (
                <p className="text-white bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50 inline-block font-mono">
                  {goals.targetRating || <span className="text-gray-500 italic">None</span>}
                </p>
              )}
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Focus Areas {isEditing && <span className="text-gray-500 lowercase normal-case ml-1">(select up to 3)</span>}
              </label>
              
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FOCUS_AREAS.map(area => {
                    const isSelected = goals.focusAreas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => toggleFocusArea(area)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isSelected 
                            ? 'bg-[#115fd4]/20 border border-[#115fd4] text-blue-300' 
                            : 'bg-slate-800 border border-slate-700 text-gray-400 hover:border-slate-500'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {goals.focusAreas.length > 0 ? (
                    goals.focusAreas.map(area => (
                      <span key={area} className="px-3 py-1.5 bg-[#115fd4]/10 border border-[#115fd4]/30 text-blue-300 rounded-lg text-sm">
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-sm mt-2">No focus areas selected</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingGoals;
