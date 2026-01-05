import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AddPostStateType {
    cover_image?: string;
}

const initialState: AddPostStateType = {
    cover_image: "",
};

const MusicUpdateThumnalSlice = createSlice({
    name: "MusicUpdateThumnalSlice",
    initialState,
    reducers: {
        // upload cover image
        updateMusicthumnalImageUpdate(state, action: PayloadAction<string>) {
            state.cover_image = action.payload;
        },
        clearAvatarImage(state) {
            state.cover_image = "";
        },
    },
});

export default MusicUpdateThumnalSlice.reducer;
export const { updateMusicthumnalImageUpdate, clearAvatarImage } = MusicUpdateThumnalSlice.actions;
