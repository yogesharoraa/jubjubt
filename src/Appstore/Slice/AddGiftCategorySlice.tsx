import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCategory: null, // Store only a single selected category
};

const AddGiftCategorySlice = createSlice({
  name: "AddGiftCategorySlice",
  initialState,
  reducers: {
    toggleCategorySelectionGift: (state, action) => {
      // If a category is already selected, remove it (set to null)
      if (state.selectedCategory?.id === action.payload.id) {
        state.selectedCategory = null;
      } else {
        state.selectedCategory = action.payload; // Store the new selected category
      }
    },
    clearSelectedCategoryGift: (state) => {
      state.selectedCategory = null; // Clear the selected category
    },
  },
});

export const {
  toggleCategorySelectionGift,
  clearSelectedCategoryGift,
} = AddGiftCategorySlice.actions;

export default AddGiftCategorySlice.reducer;
