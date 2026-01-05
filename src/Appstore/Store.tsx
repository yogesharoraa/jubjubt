import { configureStore } from '@reduxjs/toolkit'

import sidebarReducer from '../Appstore/Slice/sidebarSlice'
import adminReducer from "./Slice/AdminDetail"
import modalReducer from "./Slice/ModalSlice";
import paginationSliceReducer from "./Slice/paginationSlice"
import UniqeUserDetailReducer from "./Slice/UniqeUserDetail"
import PaginationValuesReducer from "./Slice/PaginationValues"
import CategorySelectedIDandValuesReducer from "./Slice/CategorySelectedIDandValues"
import AddImageSliceReducer from "./Slice/AddImageSlice"
import toggleSliceReducer from "./Slice/toggleSlice"
import ReelListPaginationSliceReducer from "./Slice/PaginationSlice/ReelListPaginationSlice"
import PostListPaginationSliceReducer from "./Slice/PaginationSlice/PostListPaginationSlice"
import UserReportListPaginationSliceReducer from "./Slice/PaginationSlice/UserReportListPaginationSlice"
import PostReportListPaginationSliceReducer from "./Slice/PaginationSlice/PostReportListPaginationSlice"
import RechargePaginationSliceReducer from "./Slice/PaginationSlice/RechargePaginationSlice"
import WithdrawalPaginationSliceReducer from "./Slice/PaginationSlice/WithdrawalPaginationSlice"
import HashtagPaginationSliceReducer from "./Slice/PaginationSlice/HashtagPaginationSlice"
import giftUpdateReducer from "./Slice/giftUpdateSlice"
import RellReportListPaginationSliceReducer from "./Slice/PaginationSlice/RellReportListPaginationSlice"
import userSliceReducer from "./Slice/userSlice"
import UserGiftDetailPaginationSliceReducer from "./Slice/PaginationSlice/UserGiftDetailPaginationSlice"
import UserTransationDetailPaginationSliceReducer from "./Slice/PaginationSlice/UserTransationDetailPaginationSlice"
import ReelDetailSliceReducer from "./Slice/ReelDetailSlice"
import UsersByCountryPaginationSliceReducer from "./Slice/PaginationSlice/UsersByCountryPaginationSlice"
import BlockListPaginationSliceReducer from "./Slice/PaginationSlice/BlockListPaginationSlice"
import AvatarListPaginationSliceReducer from "./Slice/PaginationSlice/AvatarListPaginationSlice"
import AddAvatarImageSliceReducer from "./Slice/AddAvatarImageSlice"
import LanguageListPaginationSliceReducer from "./Slice/PaginationSlice/LanguageListPaginationSlice"
import LanguageTranslatePaginationSlicereducer from "./Slice/PaginationSlice/LanguageTranslatePaginationSlice"
import appConfigSliceReducer from "./Slice/appConfigSlice"
import GiftCategorySliceReducer from "./Slice/PaginationSlice/GiftCategorySlice"
import MusicListPaginationSliceReducer from "./Slice/PaginationSlice/MusicListPaginationSlice"
import AddMusicThumnalSliceReducer from "./Slice/AddMusicThumnalSlice"
import AddMusicSliceReducer from "./Slice/AddMusicSlice"
import musicSliceReducer from "./Slice/musicSlice"
import MusicUpdateThumnalSliceReducer from "./Slice/MusicUpdateThumnalSlice"
import MusicUpdateFileSliceReducer from "./Slice/MusicUpdateFileSlice"
import LiveListPaginationSliceReducer from "./Slice/PaginationSlice/LiveListPaginationSlice"
import AddGiftImageSliceReducer from "./Slice/AddGiftImageSlice"
import AddImageSliceGiftReducer from "./Slice/AddImageSliceGift"
import RechargeListPaginationSliceReducer from "./Slice/PaginationSlice/RechargeListPaginationSlice"
import RechargePlanListPaginationSliceReducer from "./Slice/PaginationSlice/RechargePlanListPaginationSlice"
import NotificationPaginationSliceReducer from "./Slice/PaginationSlice/NotificationPaginationSlice"
import planSliceReducer from "./Slice/planSlice"
import AddGiftCategorySliceReducer from "./Slice/AddGiftCategorySlice"
import AddVendorSliceReducer from "./Slice/addVendorSlice"


export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    admin: adminReducer,
    modals: modalReducer,
    pagination: paginationSliceReducer,
    UniqeUserDetail: UniqeUserDetailReducer,
    PaginationValues: PaginationValuesReducer,
    category: CategorySelectedIDandValuesReducer,
    AddImageSlice: AddImageSliceReducer,
    toggle: toggleSliceReducer,
    ReelListPaginationSlice: ReelListPaginationSliceReducer,
    PostListPaginationSlice: PostListPaginationSliceReducer,
    UserReportListPaginationSlice: UserReportListPaginationSliceReducer,
    PostReportListPaginationSlice: PostReportListPaginationSliceReducer,
    RechargePaginationSlice: RechargePaginationSliceReducer,
    WithdrawalPaginationSlice: WithdrawalPaginationSliceReducer,
    HashtagPaginationSlice: HashtagPaginationSliceReducer,
    giftUpdate: giftUpdateReducer,
    RellReportListPaginationSlice: RellReportListPaginationSliceReducer,
    user: userSliceReducer,
    UserGiftDetailPaginationSlice: UserGiftDetailPaginationSliceReducer,
    UserTransationDetailPaginationSlice: UserTransationDetailPaginationSliceReducer,
    ReelDetailSlice: ReelDetailSliceReducer,
    UsersByCountryPaginationSlice: UsersByCountryPaginationSliceReducer,
    BlockListPaginationSlice: BlockListPaginationSliceReducer,
    AvatarListPaginationSlice: AvatarListPaginationSliceReducer,
    AddAvatarImageSlice: AddAvatarImageSliceReducer,
    LanguageListPaginationSlice: LanguageListPaginationSliceReducer,
    LanguageTranslatePaginationSlice: LanguageTranslatePaginationSlicereducer,
    appConfig: appConfigSliceReducer,
    GiftCategorySlice: GiftCategorySliceReducer,
    MusicListPaginationSlice: MusicListPaginationSliceReducer,
    AddMusicThumnalSlice: AddMusicThumnalSliceReducer,
    AddMusicSlice: AddMusicSliceReducer,
    music: musicSliceReducer,
    MusicUpdateThumnalSlice: MusicUpdateThumnalSliceReducer,
    MusicUpdateFileSlice: MusicUpdateFileSliceReducer,
    LiveListPaginationSlice: LiveListPaginationSliceReducer,
    AddGiftImageSlice: AddGiftImageSliceReducer,
    AddImageSliceGift: AddImageSliceGiftReducer,
    RechargeListPaginationSlice: RechargeListPaginationSliceReducer,
    RechargePlanListPaginationSlice: RechargePlanListPaginationSliceReducer,
    plan: planSliceReducer,
    NotificationPaginationSlice: NotificationPaginationSliceReducer,
    AddGiftCategorySlice: AddGiftCategorySliceReducer,
    addVendor: AddVendorSliceReducer,

  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

// Types for use throughout the app
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
