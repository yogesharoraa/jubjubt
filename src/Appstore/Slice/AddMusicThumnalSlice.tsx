import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AddPostStateType {
    cover_image?: string;
}

const initialState: AddPostStateType = {
    cover_image: "",
};

const AddMusicThumnalSlice = createSlice({
    name: "AddMusicThumnalSlice",
    initialState,
    reducers: {
        // upload cover image
        updateMusicthumnalImage(state, action: PayloadAction<string>) {
            state.cover_image = action.payload;
        },
        clearAvatarImage(state) {
            state.cover_image = "";
        },
    },
});

export default AddMusicThumnalSlice.reducer;
export const { updateMusicthumnalImage, clearAvatarImage } = AddMusicThumnalSlice.actions;
