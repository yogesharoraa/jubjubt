import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AddPostStateType {
    cover_image?: string;
}

const initialState: AddPostStateType = {
    cover_image: "",
};

const AddMusicSlice = createSlice({
    name: "AddMusicSlice",
    initialState,
    reducers: {
        // upload cover image
        updateMusic(state, action: PayloadAction<string>) {
            state.cover_image = action.payload;
        },
        clearAvatarImage(state) {
            state.cover_image = "";
        },
    },
});

export default AddMusicSlice.reducer;
export const { updateMusic, clearAvatarImage } = AddMusicSlice.actions;
