import { createSlice } from '@reduxjs/toolkit';

interface ToggleState {
  value: boolean;
}

const initialState: ToggleState = {
  value: false,
};

const toggleSlice = createSlice({
  name: 'toggle',
  initialState,
  reducers: {
    setTrue: (state) => {
      state.value = true;
    },
    reset: () => initialState,

  },
});

export const { setTrue, reset } = toggleSlice.actions;
export default toggleSlice.reducer;
