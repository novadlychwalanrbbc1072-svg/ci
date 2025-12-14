import React from 'react';
import { WordDefinition } from '../types.ts';
import { BookmarkIcon } from './Icons.tsx';

interface WordCardProps {
  data: WordDefinition;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({ data, isFavorite, onToggleFavorite }) => {
  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden relative animate-fade-in-up">
      {/* Header Section */}
      <div className="relative p-6 sm:p-8 bg-gradient-to-br from-stone-50 to-stone-100 border-b border-stone-200">
        
        {/* Absolute Favorite Button */}
        <button 
          onClick={onToggleFavorite}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-seal-red focus:ring-offset-2"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <BookmarkIcon className={`w-6 h-6 ${isFavorite ? 'text-seal-red fill-current' : 'text-stone-400'}`} solid={isFavorite} />
        </button>

        <div className="flex flex-col items-center justify-center space-y-2">
           {/* Pinyin */}
           <span className="text-xl text-stone-500 font-serif tracking-widest">{data.pinyin}</span>
           
           {/* Word - Main Display */}
           <h1 className="text-6xl sm:text-7xl font-serif text-ink-900 font-bold tracking-tight py-2">
             {data.word}
           </h1>
           
           {/* Basic Definition */}
           <p className="text-lg sm:text-xl text-stone-600 font-medium text-center max-w-md mt-2">
             {data.basicMeaning}
           </p>
        </div>

        {/* Decorative Seal */}
        <div className="absolute top-4 left-4 opacity-10 pointer-events-none">
           <div className="w-16 h-16 border-2 border-seal-red rounded-sm flex items-center justify-center rotate-12">
             <span className="text-seal-red font-calligraphy text-2xl">汉韵</span>
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Nuance / Focus - Highlighted in Red */}
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="text-6xl font-calligraphy text-seal-red">侧重</span>
           </div>
           <h3 className="text-base uppercase tracking-wider text-seal-red font-bold mb-3 flex items-center">
             <span className="w-1.5 h-1.5 rounded-full bg-seal-red mr-2"></span>
             词语侧重 Nuance & Focus
           </h3>
           <p className="text-xl font-serif text-seal-red leading-relaxed font-medium">
             {data.nuanceMeaning}
           </p>
        </div>

        {/* Detailed Explanation */}
        <div>
           <h3 className="text-lg font-bold text-ink-800 mb-3 border-b border-stone-200 pb-2">详细释义 Detailed Explanation</h3>
           <p className="text-stone-700 leading-relaxed whitespace-pre-line">
             {data.detailedMeaning}
           </p>
           {data.etymology && (
             <p className="mt-3 text-stone-500 text-sm italic">
               <span className="font-semibold">字源 Etymology:</span> {data.etymology}
             </p>
           )}
        </div>

        {/* Examples */}
        <div>
          <h3 className="text-lg font-bold text-ink-800 mb-3 border-b border-stone-200 pb-2">例句 Examples</h3>
          <ul className="space-y-4">
            {data.examples.map((ex, idx) => (
              <li key={idx} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-stone-700 italic">{ex}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};