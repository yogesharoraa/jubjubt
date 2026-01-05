// AddImageSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AddPostStateType {
  cover_image: File | null;
}

const initialState: AddPostStateType = {
  cover_image: null,
};

const AddImageSliceGift = createSlice({
  name: "AddImageSliceGift",
  initialState,
  reducers: {
    updateCoverImageGift(state, action: PayloadAction<File | null>) {
      state.cover_image = action.payload;
    },
    clearCoverImagegift(state) {
      state.cover_image = null;
    },
  },
});

export const { updateCoverImageGift, clearCoverImagegift } = AddImageSliceGift.actions;
export default AddImageSliceGift.reducer;
