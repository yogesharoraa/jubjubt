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

const PostListPaginationSlice = createSlice({
    name: 'PostListPaginationSlice',
    initialState,
    reducers: {
        setPaginationPostlList: (state, action: PayloadAction<PaginationState>) => {
            return { ...state, ...action.payload };
        },
        resetPagination: () => initialState,
    },
});

export const { setPaginationPostlList, resetPagination } = PostListPaginationSlice.actions;
export default PostListPaginationSlice.reducer;
