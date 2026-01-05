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

const WithdrawalPaginationSlice = createSlice({
    name: 'WithdrawalPaginationSlice',
    initialState,
    reducers: {
        setPaginationWithdrawallList: (state, action: PayloadAction<PaginationState>) => {
            return { ...state, ...action.payload };
        },
        resetPagination: () => initialState,
    },
});

export const { setPaginationWithdrawallList, resetPagination } = WithdrawalPaginationSlice.actions;
export default WithdrawalPaginationSlice.reducer;
