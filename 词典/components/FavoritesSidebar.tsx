import React from 'react';
import { FavoriteItem } from '../types.ts';
import { XMarkIcon, ChevronRightIcon } from './Icons.tsx';

interface FavoritesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onSelect: (item: FavoriteItem) => void;
  onRemove: (word: string) => void;
}

export const FavoritesSidebar: React.FC<FavoritesSidebarProps> = ({ 
  isOpen, 
  onClose, 
  favorites, 
  onSelect, 
  onRemove 
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-paper shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-white">
            <h2 className="text-2xl font-serif text-ink-900 font-bold">生词本 Favorites</h2>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                 <p className="mb-2">暂无收藏</p>
                 <p className="text-sm">No favorites yet</p>
              </div>
            ) : (
              favorites.map((fav) => (
                <div 
                  key={fav.word} 
                  className="group flex items-center justify-between p-4 bg-white rounded-lg border border-stone-200 hover:shadow-md hover:border-seal-red/30 transition-all cursor-pointer"
                  onClick={() => onSelect(fav)}
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                       <span className="text-xl font-serif font-bold text-ink-900">{fav.word}</span>
                       <span className="text-sm text-stone-500">{fav.pinyin}</span>
                    </div>
                    <p className="text-sm text-stone-600 truncate mt-1">{fav.basicMeaning}</p>
                  </div>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(fav.word); }}
                        className="p-2 text-stone-400 hover:text-red-500"
                        title="Remove"
                      >
                         <XMarkIcon className="w-4 h-4" />
                      </button>
                      <ChevronRightIcon className="w-5 h-5 text-stone-300" />
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer stats */}
          <div className="p-4 border-t border-stone-200 bg-stone-50 text-center text-xs text-stone-500 uppercase tracking-widest">
            {favorites.length} Words Collected
          </div>
        </div>
      </div>
    </>
  );
};