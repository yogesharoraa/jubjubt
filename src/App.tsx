import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./routes/MainLayout";
import { useAppSelector } from "./Hooks/Hooks";
import Admin_Block_Modal from "./Componets/AllModals/Admin_Block_Modal";
import Gift_Image_Modal from "./Componets/AllModals/Gift_Image_Modal";
import Add_Gift_Modal from "./Componets/AllModals/Add_Gift_Modal";
import Update_Gift_Modal from "./Componets/AllModals/Update_Gift_Modal/Update_Gift_Modal";
import Log_Out_Modal from "./Componets/AllModals/Log_Out_Modal";
import { ThemeContextProvider } from "./Context/ThemeContext";
import ReelDetail_Modal from "./Componets/AllModals/ReelDetail_Modal/ReelDetail_Modal";
import Following_Modal from "./Componets/AllModals/Following_Modal";
import Follower_Modal from "./Componets/AllModals/Follower_Modal";
import AvatarUpload_Modal from "./Componets/AllModals/AvatarUpload_Modal/AvatarUpload_Modal";
import AvatarUpdate_Modal from "./Componets/AllModals/AvatarUpdate_Modal/AvatarUpdate_Modal";
import UpdateLanguage_Modal from "./Componets/AllModals/UpdateLanguage_Modal/UpdateLanguage_Modal";
import AddLanguage_Modal from "./Componets/AllModals/AddLanguage_Modal/AddLanguage_Modal";
import AddGiftCategory from "./Componets/AllModals/AddGiftCategory/AddGiftCategory";
import MusicDelete_Modal from "./Componets/AllModals/MusicDelete_Modal/MusicDelete_Modal";
import MusicAdd_Modal from "./Componets/AllModals/MusicAdd_Modal/MusicAdd_Modal";
import MusicShow_Modal from "./Componets/AllModals/MusicShow_Modal/MusicShow_Modal";
import MusicUpdate_Modal from "./Componets/AllModals/MusicUpdate_Modal/MusicUpdate_Modal";
import UploadMusicModalWithS3 from "./Componets/AllModals/UploadMusicModalWithS3/UploadMusicModalWithS3";
import AvataDeleteModal from "./Componets/AllModals/AvataDeleteModal/AvataDeleteModal";
import AddGiftCategoryUpdateModal from "./Componets/AllModals/AddGiftCategoryUpdateModal/AddGiftCategoryUpdateModal";
import DeleteGiftCategoryModal from "./Componets/AllModals/DeleteGiftCategoryModal/DeleteGiftCategoryModal";
import AddHashtagModal from "./Componets/AllModals/AddHashtagModal/AddHashtagModal";
import AddRechargeModal from "./Componets/AllModals/AddRechargeModal/AddRechargeModal";
import AddRechargeUpdateModal from "./Componets/AllModals/AddRechargeUpdateModal/AddRechargeUpdateModal";
import AddNotificationModal from "./Componets/AllModals/AddNotificationModal/AddNotificationModal";
import DeletePurchasecode from "./Componets/AllModals/DeletePurchasecode";
import Add_Gift_ModalUploadS3 from "./Componets/AllModals/Add_Gift_ModalUploadS3/Add_Gift_ModalUploadS3";
import Update_Gift_ModalS3 from "./Componets/AllModals/Update_Gift_ModalS3/Update_Gift_ModalS3";
import MusicUpdate_ModalS3 from "./Componets/AllModals/MusicUpdate_ModalS3/MusicUpdate_ModalS3";
import Add_user from "./Componets/AllModals/Add_user/Add_user";

const App: React.FC = () => {
  const isAdminBlockModalVisible = useAppSelector(
    (state) => state.modals.Admin_Block_Modal
  );

  const isGiftModalVisible = useAppSelector(
    (state) => state.modals.Gift_Image_Modal
  )

  const isAddGiftModalVisible = useAppSelector(
    (state) => state.modals.Add_Gift_Modal
  )

  const isUpdateModalVisible = useAppSelector(
    (state) => state.modals.Update_Gift_Modal
  )

  const isLogOutModalVisible = useAppSelector(
    (state) => state.modals.Log_Out_Modal
  )


  const isReelDetailModalVisible = useAppSelector(
    (state) => state.modals.ReelDetail_Modal
  )


  const isFollowing_ModalVisible = useAppSelector(
    (state) => state.modals.Following_Modal
  )
  const isFollower_ModalVisible = useAppSelector(
    (state) => state.modals.Follower_Modal
  )


  const isAvatarUpload_ModalVisible = useAppSelector(
    (state) => state.modals.AvatarUpload_Modal
  )


  const isAvatarUpdate_ModalVisible = useAppSelector(
    (state) => state.modals.AvatarUpdate_Modal
  )


  const isUpdateLanguage_ModalVisible = useAppSelector(
    (state) => state.modals.UpdateLanguage_Modal
  )


  const isAddLanguage_ModalVisible = useAppSelector(
    (state) => state.modals.AddLanguage_Modal
  )


  const isAddGiftCategoryVisible = useAppSelector((state) => state.modals.AddGiftCategory)



  const isMusicDelete_ModalVisible = useAppSelector(
    (state) => state.modals.MusicDelete_Modal
  );


  const isMusicAdd_ModalVisible = useAppSelector(
    (state) => state.modals.MusicAdd_Modal
  );


  const isMusicShow_ModalVisible = useAppSelector(
    (state) => state.modals.MusicShow_Modal
  );


  const isMusicUpdate_ModalVisible = useAppSelector(
    (state) => state.modals.MusicUpdate_Modal
  );


  const isUploadMusicModalWithS3Visible = useAppSelector((state) => state.modals.UploadMusicModalWithS3)

  const isAvataDeleteModalVisible = useAppSelector((state) => state.modals.AvataDeleteModal);


  const isAddGiftCategoryUpdateModal = useAppSelector((state) => state.modals.AddGiftCategoryUpdateModal)


  const isDeleteGiftCategoryModalVisible = useAppSelector((state) => state.modals.DeleteGiftCategoryModal)

  const isAddHashtagModalVisible = useAppSelector((state) => state.modals.AddHashtagModal);


  const isAddRechargeModalVisible = useAppSelector((state) => state.modals.AddRechargeModal)


  const isAddRechargeUpdateModalVisible = useAppSelector((state) => state.modals.AddRechargeUpdateModal)



  const isAddNotificationModalVisible = useAppSelector((state) => state.modals.AddNotificationModal)


  const isDeletePurchasecodeVisible = useAppSelector((state) => state.modals.DeletePurchasecode)


  const isAdd_Gift_ModalUploadS3Visible = useAppSelector((state) => state.modals.Add_Gift_ModalUploadS3)

  const isUpdate_Gift_ModalS3Visible = useAppSelector((state) => state.modals.Update_Gift_ModalS3)



  const isMusicUpdate_ModalS3Visible  = useAppSelector((state) => state.modals.MusicUpdate_ModalS3)


  const Add_userVisible = useAppSelector((state) => state.modals.Add_user)

  return (
    <>

      <div className="w-full h-screen ">
        <BrowserRouter>
          <ThemeContextProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </ThemeContextProvider>
        </BrowserRouter>
      </div>

   {
    Add_userVisible &&  <Add_user/>
   }
      {isAdminBlockModalVisible && <Admin_Block_Modal />}
      {isGiftModalVisible && <Gift_Image_Modal />}
      {isAddGiftModalVisible && <Add_Gift_Modal />}
      {isUpdateModalVisible && <Update_Gift_Modal />}
      {isLogOutModalVisible && <Log_Out_Modal />}
      {isReelDetailModalVisible && <ReelDetail_Modal />}
      {isFollowing_ModalVisible && <Following_Modal />}
      {isFollower_ModalVisible && <Follower_Modal />}
      {isAvatarUpload_ModalVisible && <AvatarUpload_Modal />}
      {isAvatarUpdate_ModalVisible && <AvatarUpdate_Modal />}
      {isUpdateLanguage_ModalVisible && <UpdateLanguage_Modal />}
      {isAddLanguage_ModalVisible && <AddLanguage_Modal />}

      {isAddGiftCategoryVisible && <AddGiftCategory />}

      {isMusicDelete_ModalVisible && <MusicDelete_Modal />}

      {isMusicAdd_ModalVisible && <MusicAdd_Modal />}

      {
        isMusicShow_ModalVisible && <MusicShow_Modal />
      }

      {isMusicUpdate_ModalVisible && <MusicUpdate_Modal />}
      {
        isUploadMusicModalWithS3Visible && <UploadMusicModalWithS3 />
      }

      {
        isAvataDeleteModalVisible && <AvataDeleteModal />
      }

      {
        isAddGiftCategoryUpdateModal && <AddGiftCategoryUpdateModal />
      }

      {
        isDeleteGiftCategoryModalVisible && <DeleteGiftCategoryModal />
      }

      {
        isAddHashtagModalVisible && <AddHashtagModal />
      }

      {
        isAddRechargeModalVisible && <AddRechargeModal />
      }

      {
        isAddRechargeUpdateModalVisible && <AddRechargeUpdateModal />
      }

      {
        isAddNotificationModalVisible && <AddNotificationModal />
      }


      {
        isDeletePurchasecodeVisible && <DeletePurchasecode />
      }

      {
        isAdd_Gift_ModalUploadS3Visible && <Add_Gift_ModalUploadS3 />
      }

      {
        isUpdate_Gift_ModalS3Visible && <Update_Gift_ModalS3 />
      }
      {
        isMusicUpdate_ModalS3Visible &&  <MusicUpdate_ModalS3/>
      }
    </>
  );
};

export default App;
