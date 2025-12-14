export interface WordDefinition {
  word: string;
  pinyin: string;
  basicMeaning: string;
  detailedMeaning: string;
  nuanceMeaning: string; // The specific focus or connotation of the word
  examples: string[];
  etymology?: string; // Origin of the word
}

export interface FavoriteItem extends WordDefinition {
  savedAt: number;
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';