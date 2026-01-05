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

const GiftCategorySlice = createSlice({
    name: 'GiftCategorySlice',
    initialState,
    reducers: {
        setPaginationCategoryList: (state, action: PayloadAction<PaginationState>) => {
            return { ...state, ...action.payload };
        },
        resetPagination: () => initialState,
    },
});

export const { setPaginationCategoryList, resetPagination } = GiftCategorySlice.actions;
export default GiftCategorySlice.reducer;
