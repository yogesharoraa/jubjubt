import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCategory: null, // Store only a single selected category
};

const CategorySelectedIDandValues = createSlice({
  name: "category",
  initialState,
  reducers: {
    toggleCategorySelection: (state, action) => {
      // If a category is already selected, remove it (set to null)
      if (state.selectedCategory?.id === action.payload.id) {
        state.selectedCategory = null;
      } else {
        state.selectedCategory = action.payload; // Store the new selected category
      }
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null; // Clear the selected category
    },
  },
});

export const {
  toggleCategorySelection,
  clearSelectedCategory,
} = CategorySelectedIDandValues.actions;

export default CategorySelectedIDandValues.reducer;
