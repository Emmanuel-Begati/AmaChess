import { useState, useEffect } from 'react';
import axios from 'axios';

interface UserGoals {
  chessGoal: string;
  focusAreas: string[];
  targetRating: string | number;
  customGoals: string[];
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
  const [goals, setGoals] = useState<UserGoals>({
    chessGoal: '',
    focusAreas: [],
    targetRating: '',
    customGoals: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Custom goal input
  const [newGoalText, setNewGoalText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get('/goals');
        if (response.data.success) {
          setGoals({
            ...response.data.data,
            customGoals: response.data.data.customGoals || []
          });
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
        setGoals({
          ...response.data.data,
          customGoals: response.data.data.customGoals || []
        });
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
      if (prev.focusAreas.length >= 3) return prev;
      return { ...prev, focusAreas: [...prev.focusAreas, area] };
    });
  };

  const handleAddCustomGoal = async () => {
    const trimmed = newGoalText.trim();
    if (!trimmed) return;
    if (goals.customGoals.length >= 5) {
      setValidationError('Maximum 5 custom goals allowed.');
      return;
    }
    if (goals.customGoals.some(g => g.toLowerCase() === trimmed.toLowerCase())) {
      setValidationError('This goal already exists.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await axios.post('/goals/validate', { goal: trimmed });

      if (response.data.isChessRelated) {
        const updatedGoals = [...goals.customGoals, trimmed];
        setGoals(prev => ({ ...prev, customGoals: updatedGoals }));
        setNewGoalText('');
        setValidationError(null);

        // Auto-save the new goal
        try {
          await axios.put('/goals', { ...goals, customGoals: updatedGoals });
        } catch {
          console.error('Failed to auto-save custom goal');
        }
      } else {
        setValidationError(response.data.reason || 'This doesn\'t appear to be a chess-related goal.');
      }
    } catch (error) {
      console.error('Failed to validate goal:', error);
      setValidationError('Could not validate goal. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCustomGoal = async (index: number) => {
    const updatedGoals = goals.customGoals.filter((_, i) => i !== index);
    setGoals(prev => ({ ...prev, customGoals: updatedGoals }));

    // Auto-save
    try {
      await axios.put('/goals', { ...goals, customGoals: updatedGoals });
    } catch {
      console.error('Failed to auto-save after removing goal');
    }
  };

  const handleGoalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      e.preventDefault();
      handleAddCustomGoal();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-700 rounded mb-4"></div>
        <div className="h-20 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6 backdrop-blur-sm mt-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-xl font-bold font-outfit text-white flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🎯</span> Improvement Goals
        </h3>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
            isEditing 
              ? 'bg-[#115fd4] hover:bg-blue-600 text-white shadow-lg shadow-[#115fd4]/20' 
              : 'bg-slate-700/50 hover:bg-slate-700 text-gray-300'
          }`}
        >
          {isSaving ? 'Saving...' : isEditing ? 'Save Goals' : 'Edit Goals'}
        </button>
      </div>

      {!isEditing && !goals.chessGoal && goals.focusAreas.length === 0 && goals.customGoals.length === 0 ? (
        <div className="text-center py-6 bg-slate-800/30 rounded-xl border border-dashed border-slate-600">
          <p className="text-gray-400 text-sm mb-2">Tell Coach B what you want to achieve.</p>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[#115fd4] hover:text-blue-400 font-medium text-sm transition-colors"
          >
            Set your first coaching goal
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Goal */}
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">Primary Goal</label>
            {isEditing ? (
              <input
                type="text"
                value={goals.chessGoal}
                onChange={e => setGoals({ ...goals, chessGoal: e.target.value })}
                placeholder="e.g., Reach 1600 rating, Win Local Tournament..."
                className="w-full bg-slate-800 text-white text-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-600 focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] transition-all outline-none"
              />
            ) : (
              <p className="text-white text-sm sm:text-lg bg-slate-800/50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-700/50">
                {goals.chessGoal || <span className="text-gray-500 italic">No primary goal set</span>}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Target Rating */}
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">Target Rating</label>
              {isEditing ? (
                <input
                  type="number"
                  value={goals.targetRating}
                  onChange={e => setGoals({ ...goals, targetRating: e.target.value })}
                  placeholder="e.g., 1800"
                  className="w-full bg-slate-800 text-white text-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-600 focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] transition-all outline-none"
                />
              ) : (
                <p className="text-white bg-slate-800/50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-700/50 inline-block font-mono text-sm">
                  {goals.targetRating || <span className="text-gray-500 italic">None</span>}
                </p>
              )}
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                Focus Areas {isEditing && <span className="text-gray-500 lowercase normal-case ml-1">(select up to 3)</span>}
              </label>
              
              {isEditing ? (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {AVAILABLE_FOCUS_AREAS.map(area => {
                    const isSelected = goals.focusAreas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => toggleFocusArea(area)}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
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
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {goals.focusAreas.length > 0 ? (
                    goals.focusAreas.map(area => (
                      <span key={area} className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#115fd4]/10 border border-[#115fd4]/30 text-blue-300 rounded-lg text-xs sm:text-sm">
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-xs sm:text-sm mt-2">No focus areas selected</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Custom Goals Section */}
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">
              Custom Goals
              <span className="text-gray-500 lowercase normal-case ml-1">({goals.customGoals.length}/5)</span>
            </label>

            {/* Existing custom goals */}
            {goals.customGoals.length > 0 && (
              <div className="space-y-2 mb-3">
                {goals.customGoals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-800/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-700/50 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-green-400 text-xs shrink-0">✓</span>
                      <span className="text-white text-xs sm:text-sm truncate">{goal}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomGoal(index)}
                      className="text-gray-500 hover:text-red-400 transition-colors text-xs sm:text-sm ml-2 shrink-0 opacity-0 group-hover:opacity-100"
                      title="Remove goal"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new custom goal input */}
            {goals.customGoals.length < 5 && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGoalText}
                    onChange={e => {
                      setNewGoalText(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    onKeyDown={handleGoalKeyDown}
                    placeholder="e.g., Learn the King's Indian Defense..."
                    maxLength={200}
                    disabled={isValidating}
                    className="flex-1 bg-slate-800 text-white text-xs sm:text-sm rounded-lg px-3 py-2 sm:py-2.5 border border-slate-600 focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] transition-all outline-none placeholder-gray-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleAddCustomGoal}
                    disabled={isValidating || !newGoalText.trim()}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#115fd4] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Checking...</span>
                      </>
                    ) : (
                      <>
                        <span>+</span>
                        <span className="hidden sm:inline">Add</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Validation error message */}
                {validationError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm rounded-lg px-3 py-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>{validationError}</span>
                  </div>
                )}

                <p className="text-gray-500 text-[10px] sm:text-xs">
                  Only chess-related goals are accepted. Coach B will verify your goal.
                </p>
              </div>
            )}

            {goals.customGoals.length === 0 && (
              <p className="text-gray-500 text-xs italic mt-1">No custom goals set yet. Add your first one above!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingGoals;
