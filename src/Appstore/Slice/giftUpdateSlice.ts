import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GiftUpdate } from '../../Types/Types';

interface GiftState {
  gift: GiftUpdate | null;
}

const initialState: GiftState = {
  gift: null,
};

const giftSlice = createSlice({
  name: 'giftUpdate',
  initialState,
  reducers: {
    setGift: (state, action: PayloadAction<GiftUpdate>) => {
      state.gift = action.payload;
    },
    clearGift: (state) => {
      state.gift = null;
    },
  },
});

export const { setGift, clearGift } = giftSlice.actions;
export default giftSlice.reducer;
