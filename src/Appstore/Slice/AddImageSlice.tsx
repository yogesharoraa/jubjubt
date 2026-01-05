import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AddPostStateType {
    cover_image?: string;
}

const initialState: AddPostStateType = {
    cover_image: "",
};

const AddImageSlice = createSlice({
    name: "AddImageSlice",
    initialState,
    reducers: {
        // upload cover image
        updateCoverImage(state, action: PayloadAction<string>) {
            state.cover_image = action.payload;
        },
        clearCoverImage(state) {
            state.cover_image = "";
        },
    },
});

export default AddImageSlice.reducer;
export const { updateCoverImage, clearCoverImage } = AddImageSlice.actions;
