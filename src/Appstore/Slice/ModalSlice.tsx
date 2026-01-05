import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
    Admin_Block_Modal: boolean;
    Gift_Image_Modal: boolean;
    Add_Gift_Modal: boolean;
    Update_Gift_Modal: boolean;
    Log_Out_Modal: boolean;
    ReelDetail_Modal?: boolean;
    CommentLike_List_Modal?: boolean;
    Following_Modal?: boolean;
    Follower_Modal?: boolean;
    AvatarUpload_Modal?: boolean;
    AvatarUpdate_Modal: boolean;
    UpdateLanguage_Modal: boolean;
    AddLanguage_Modal: boolean;
    AddGiftCategory: boolean;
    MusicDelete_Modal: boolean;
    MusicUpdate_Modal: boolean;
    MusicAdd_Modal: boolean;
    MusicShow_Modal?: boolean;
    UploadMusicModalWithS3: boolean;
    AvataDeleteModal: boolean;
    AddGiftCategoryUpdateModal: boolean;
    DeleteGiftCategoryModal: boolean;
    AddHashtagModal: boolean;
    AddRechargeModal: boolean;
    AddRechargeUpdateModal: boolean;
    AddNotificationModal: boolean;
    DeletePurchasecode: boolean;
    Add_Gift_ModalUploadS3: boolean;
    Update_Gift_ModalS3: boolean;
    MusicUpdate_ModalS3: boolean;
    Add_user: boolean



}

const initialState: ModalState = {
    Admin_Block_Modal: false,
    Gift_Image_Modal: false,
    Add_Gift_Modal: false,
    Update_Gift_Modal: false,
    Log_Out_Modal: false,
    ReelDetail_Modal: false,
    CommentLike_List_Modal: false,
    Following_Modal: false,
    Follower_Modal: false,
    AvatarUpload_Modal: false,
    AvatarUpdate_Modal: false,
    UpdateLanguage_Modal: false,
    AddLanguage_Modal: false,
    AddGiftCategory: false,
    MusicDelete_Modal: false,
    MusicUpdate_Modal: false,
    MusicAdd_Modal: false,
    MusicShow_Modal: false,
    UploadMusicModalWithS3: false,
    AvataDeleteModal: false,
    AddGiftCategoryUpdateModal: false,
    DeleteGiftCategoryModal: false,
    AddHashtagModal: false,
    AddRechargeModal: false,
    AddRechargeUpdateModal: false,
    AddNotificationModal: false,
    DeletePurchasecode: false,
    Add_Gift_ModalUploadS3: false,
    Update_Gift_ModalS3: false,
    MusicUpdate_ModalS3: false,
    Add_user: false,
};

const ModalSlice = createSlice({
    name: "modals",
    initialState,
    reducers: {
        showModal: (state, action: PayloadAction<keyof ModalState>) => {
            state[action.payload] = true;
        },
        hideModal: (state, action: PayloadAction<keyof ModalState>) => {
            state[action.payload] = false;
        },
    },
});

export const { showModal, hideModal } = ModalSlice.actions;

// cheack any modal opne and close

export const selectAnyModalOpen = (state: { modals: ModalState }) => {
    return Object.values(state.modals).includes(true);
};
export default ModalSlice.reducer;
