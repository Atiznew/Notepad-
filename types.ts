export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string; // 'all', 'favorites', 'trash', or custom UUID
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  type: 'system' | 'custom';
}

export enum AIActionType {
  SUMMARIZE = 'SUMMARIZE',
  FIX_GRAMMAR = 'FIX_GRAMMAR',
  CONTINUE_WRITING = 'CONTINUE_WRITING',
  GENERATE_TITLE = 'GENERATE_TITLE',
  MAKE_LONGER = 'MAKE_LONGER',
}

export interface AIResponseState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}
