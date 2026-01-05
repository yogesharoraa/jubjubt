import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AddPostStateType {
    cover_image?: string;
}

const initialState: AddPostStateType = {
    cover_image: "",
};

const AddGiftImageSlice = createSlice({
    name: "AddGiftImageSlice",
    initialState,
    reducers: {
        // upload cover image
        AddGiftImageSliceImage(state, action: PayloadAction<string>) {
            state.cover_image = action.payload;
        },
        clearAvatarImage(state) {
            state.cover_image = "";
        },
    },
});

export default AddGiftImageSlice.reducer;
export const { AddGiftImageSliceImage, clearAvatarImage } = AddGiftImageSlice.actions;
