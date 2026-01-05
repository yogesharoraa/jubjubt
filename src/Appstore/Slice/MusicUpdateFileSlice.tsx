import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AddPostStateType {
    cover_image?: string;
}

const initialState: AddPostStateType = {
    cover_image: "",
};

const MusicUpdateFileSlice = createSlice({
    name: "MusicUpdateFileSlice",
    initialState,
    reducers: {
        // upload cover image
        updateMusicthumnalImageFile(state, action: PayloadAction<string>) {
            state.cover_image = action.payload;
        },
        clearAvatarImage(state) {
            state.cover_image = "";
        },
    },
});

export default MusicUpdateFileSlice.reducer;
export const { updateMusicthumnalImageFile, clearAvatarImage } = MusicUpdateFileSlice.actions;
