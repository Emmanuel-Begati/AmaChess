import React from 'react';
import { Link } from 'react-router-dom';

interface ThemeRecommendation {
  theme: string;
  reason: string;
}

interface RecommendedPuzzlesProps {
  themes: ThemeRecommendation[];
}

// Map theme names to emojis and display names
const themeConfig: Record<string, { emoji: string; label: string; color: string }> = {
  fork:             { emoji: '⚔️', label: 'Fork',             color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
  pin:              { emoji: '📌', label: 'Pin',              color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20' },
  skewer:           { emoji: '🗡️', label: 'Skewer',           color: 'from-red-500/20 to-red-600/10 border-red-500/20' },
  discoveredAttack: { emoji: '💫', label: 'Discovered Attack', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
  doubleCheck:      { emoji: '✌️', label: 'Double Check',     color: 'from-orange-500/20 to-orange-600/10 border-orange-500/20' },
  hangingPiece:     { emoji: '🎯', label: 'Hanging Piece',    color: 'from-red-500/20 to-red-600/10 border-red-500/20' },
  trappedPiece:     { emoji: '🪤', label: 'Trapped Piece',    color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20' },
  backRankMate:     { emoji: '♚', label: 'Back Rank Mate',   color: 'from-rose-500/20 to-rose-600/10 border-rose-500/20' },
  sacrifice:        { emoji: '💎', label: 'Sacrifice',        color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20' },
  deflection:       { emoji: '↗️', label: 'Deflection',       color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20' },
  attraction:       { emoji: '🧲', label: 'Attraction',       color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/20' },
  endgame:          { emoji: '♔', label: 'Endgame',          color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20' },
  pawnEndgame:      { emoji: '♟️', label: 'Pawn Endgame',     color: 'from-lime-500/20 to-lime-600/10 border-lime-500/20' },
  rookEndgame:      { emoji: '♜', label: 'Rook Endgame',     color: 'from-sky-500/20 to-sky-600/10 border-sky-500/20' },
  knightEndgame:    { emoji: '♞', label: 'Knight Endgame',   color: 'from-teal-500/20 to-teal-600/10 border-teal-500/20' },
  bishopEndgame:    { emoji: '♝', label: 'Bishop Endgame',   color: 'from-green-500/20 to-green-600/10 border-green-500/20' },
  mate:             { emoji: '♛', label: 'Checkmate',        color: 'from-red-500/20 to-red-600/10 border-red-500/20' },
  mateIn1:          { emoji: '1️⃣', label: 'Mate in 1',       color: 'from-green-500/20 to-green-600/10 border-green-500/20' },
  mateIn2:          { emoji: '2️⃣', label: 'Mate in 2',       color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
  mateIn3:          { emoji: '3️⃣', label: 'Mate in 3',       color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20' },
  middlegame:       { emoji: '⚡', label: 'Middlegame',       color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
  opening:          { emoji: '📖', label: 'Opening',          color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
  promotion:        { emoji: '👑', label: 'Promotion',        color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20' },
  exposedKing:      { emoji: '🏰', label: 'Exposed King',     color: 'from-red-500/20 to-red-600/10 border-red-500/20' },
  kingsideAttack:   { emoji: '⚔️', label: 'Kingside Attack',  color: 'from-orange-500/20 to-orange-600/10 border-orange-500/20' },
  queensideAttack:  { emoji: '🛡️', label: 'Queenside Attack', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/20' },
  quietMove:        { emoji: '🤫', label: 'Quiet Move',       color: 'from-slate-500/20 to-slate-600/10 border-slate-500/20' },
  defensiveMove:    { emoji: '🛡️', label: 'Defensive Move',   color: 'from-green-500/20 to-green-600/10 border-green-500/20' },
  intermezzo:       { emoji: '⏸️', label: 'Intermezzo',       color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20' },
  zugzwang:         { emoji: '🔒', label: 'Zugzwang',         color: 'from-gray-500/20 to-gray-600/10 border-gray-500/20' },
  xRayAttack:       { emoji: '🔍', label: 'X-Ray Attack',     color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20' },
  capturingDefender:{ emoji: '🎪', label: 'Capturing Defender', color: 'from-pink-500/20 to-pink-600/10 border-pink-500/20' },
  interference:     { emoji: '🚧', label: 'Interference',     color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
  clearance:        { emoji: '🧹', label: 'Clearance',        color: 'from-teal-500/20 to-teal-600/10 border-teal-500/20' },
};

const getThemeDisplay = (theme: string) => {
  return themeConfig[theme] || {
    emoji: '🧩',
    label: theme.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    color: 'from-slate-500/20 to-slate-600/10 border-slate-500/20'
  };
};

const RecommendedPuzzles: React.FC<RecommendedPuzzlesProps> = ({ themes }) => {
  if (!themes || themes.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🧩</span>
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Recommended Practice</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themes.map((rec, i) => {
          const display = getThemeDisplay(rec.theme);
          return (
            <Link
              key={i}
              to={`/puzzle-solver?theme=${rec.theme}`}
              className={`group bg-gradient-to-br ${display.color} rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col h-full`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                <span className="text-lg sm:text-xl">{display.emoji}</span>
                <span className="text-white font-semibold text-xs sm:text-sm">{display.label}</span>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed mb-3 line-clamp-2 group-hover:line-clamp-none transition-all duration-300 flex-grow">
                {rec.reason}
              </p>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-blue-400 group-hover:text-blue-300 transition-colors mt-auto pt-2 border-t border-slate-700/30">
                <span>Practice now</span>
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedPuzzles;
