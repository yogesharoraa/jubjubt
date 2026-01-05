// src/redux/slices/paginationSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface PaginationState {
  total_pages: number;
  total_records: number;
  current_page: number;
  records_per_page: number;
}

const initialState: PaginationState = {
  total_pages: 0,
  total_records: 0,
  current_page: 1,
  records_per_page: 10,
};

const UserTransationDetailPaginationSlice = createSlice({
  name: 'UserTransationDetailPaginationSlice',
  initialState,
  reducers: {
    setPaginationUserTransationDetaillList: (state, action: PayloadAction<PaginationState>) => {
      return { ...state, ...action.payload };
    },
    resetPagination: () => initialState,
  },
});

export const { setPaginationUserTransationDetaillList, resetPagination } = UserTransationDetailPaginationSlice.actions;
export default UserTransationDetailPaginationSlice.reducer;
