import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AddPostStateType {
    cover_image?: string;
}

const initialState: AddPostStateType = {
    cover_image: "",
};

const AddAvatarImageSlice = createSlice({
    name: "AddAvatarImageSlice",
    initialState,
    reducers: {
        // upload cover image
        updateAvatarImageImage(state, action: PayloadAction<string>) {
            state.cover_image = action.payload;
        },
        clearAvatarImage(state) {
            state.cover_image = "";
        },
    },
});

export default AddAvatarImageSlice.reducer;
export const { updateAvatarImageImage, clearAvatarImage } = AddAvatarImageSlice.actions;
