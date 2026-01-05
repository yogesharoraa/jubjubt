// PaginationValues.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface PaginationState {
  total_pages: number;
  total_records: number;
  current_page: number;
  records_per_page: number;
}

type PaginationPayload = {
  key: string;
  data: PaginationState;
};

type PaginationSliceState = {
  [key: string]: PaginationState;
};

const initialState: PaginationSliceState = {};

const PaginationValues = createSlice({
  name: 'PaginationValues',
  initialState,
  reducers: {
    setPaginationValues: (state, action: PayloadAction<PaginationPayload>) => {
      const { key, data } = action.payload;
      state[key] = data;
    },
    resetPaginationValues: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { setPaginationValues, resetPaginationValues } = PaginationValues.actions;
export default PaginationValues.reducer;
