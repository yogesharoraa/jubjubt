// src/redux/slices/musicSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface MusicUpdatedata {
  status: boolean;
  data: Data;
  message: string;
  toast: boolean;
}

export interface Data {
  Records: Record[];
  Pagination: Pagination;
}

export interface Pagination {
  total_pages: number;
  total_records: number;
  current_page: number;
  records_per_page: number;
}

export interface Record {
  music_thumbnail: string;
  music_url: string;
  music_id: number;
  music_desc: string;
  music_title: string;
  owner: string;
  status: boolean;
  admin_status: boolean;
  total_use: number;
  total_saves: number;
  total_shares: number;
  createdAt: string;  
  updatedAt: string;
  uploader_id: number;
}

const initialState: MusicUpdatedata = {
  status: false,
  data: {
    Records: [],
    Pagination: {
      total_pages: 0,
      total_records: 0,
      current_page: 1,
      records_per_page: 10,
    },
  },
  message: '',
  toast: false,
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setMusicData(state, action: PayloadAction<MusicUpdatedata>) {
      return action.payload;
    },
    resetMusicData() {
      return initialState;
    },
  },
});

export const { setMusicData, resetMusicData } = musicSlice.actions;
export default musicSlice.reducer;
