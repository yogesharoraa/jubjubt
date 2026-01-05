// redux/slices/userSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ReelDetailState {
  reel: any; // Replace `any` with a proper type if available
}

const initialState: ReelDetailState = {
  reel: null,
};

const ReelDetailSlice = createSlice({
  name: 'ReelDetailSlice',
  initialState,
  reducers: {
    setReel(state, action: PayloadAction<any>) {
      state.reel = action.payload;
    },
    clearReel(state) {
      state.reel = null;
    },
  },
});

export const { setReel, clearReel } = ReelDetailSlice.actions;
export default ReelDetailSlice.reducer;
