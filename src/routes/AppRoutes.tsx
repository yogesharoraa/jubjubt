import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../Pages/Admin_Login/Bothleftandright";
import Dashboard from "../Pages/Dashboard/Dashboard";
import UserList from "../Pages/UserList/UserList";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Profile from "../Pages/Admin_Profile/Profile";
import Gift from "../Pages/Gift/Gift";
import ReelList from "../Pages/ReelList/ReelList";
import PostList from "../Pages/PostList/PostList";
import AdminAdsManager from "../Pages/ReelList/AdminAdsManager";
import AutoPoster from "../Pages/ReelList/AutoPoster";
import AutoPosterList from "../Pages/ReelList/AutoPosterList";
import User_ReportList from "../Pages/User_ReportList/User_ReportList";
import Post_ReportList from "../Pages/Post_ReportList/Post_ReportList";
import ReelReportList from "../Pages/ReelReportList/ReelReportList";
import Recharge from "../Pages/Recharge/Recharge";
import Withdrawal from "../Pages/withdrawal/Withdrawal";
import Livelist from "../Pages/Livelist/Livelist";
import UsersByCountry from "../Pages/UsersByCountry/UsersByCountry";
import HashtagList from "../Pages/HashtagList/HashtagList";
import UserProfile from "../Pages/UserProfile/UserProfile";
import BlockList from "../Pages/BlockList/BlockList";
import AvatarList from "../Pages/AvatarList/AvatarList";
import LanguageList from "../Pages/LanguageList/LanguageList";
import LanguageTranslate from "../Pages/LanguageList/LanguageTranslate";
import CMS_Page from "../Pages/CMS_Page/CMS_Page";
import Setting from "../Pages/Setting/Setting";
import GiftCategoryList from "../Pages/GiftCategoryList/GiftCategoryList";
import Music from "../Pages/Music/Music";
import RechargePlaneLIst from "../Pages/RechargePlaneLIst/RechargePlaneLIst";
import Notification from "../Pages/Notification/Notification";
import PrivacyPolicyNewpage from "../Pages/CMS_Page/PrivacyPolicyNewpage";
import Termsandconditions from "../Pages/CMS_Page/Termsandconditions";
import ThemeCompo from "../Componets/ThemeCompo";

const AppRoutes: React.FC = () => {
  return (


    <>

      <ThemeCompo />
      <Routes>

        {/* Public */}
        <Route element={<PublicRoute />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/terms-and-conditions" element={<Termsandconditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyNewpage />} />
        </Route>

        {/* Private */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-list" element={<UserList />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/gift-list" element={<Gift />} />
          <Route path="/reel-list" element={<ReelList />} />
          <Route path="/post-list" element={<PostList />} />
          <Route path="/ads-manager" element={<AdminAdsManager />} />
          <Route path="/user-report-list" element={<User_ReportList />} />
          <Route path="/post-report-list" element={<Post_ReportList />} />
          <Route path="/reel-report-list" element={<ReelReportList />} />
          <Route path="/recharge-list" element={<Recharge />} />
          <Route path="/withrawal-list" element={<Withdrawal />} />
          <Route path="/live-list" element={<Livelist />} />
          <Route path="/country-wise-users" element={<UsersByCountry />} />
          <Route path="/hashtag-list" element={<HashtagList />} />
          <Route path="/:source/user-profile" element={<UserProfile />} />
          <Route path="/block-list" element={<BlockList />} />
          <Route path="/avatar-list" element={<AvatarList />} />
          <Route path="/language-list" element={<LanguageList />} />
          <Route path="/language-list/:statusId" element={<LanguageTranslate />} />
          <Route path="/cms" element={<CMS_Page />} />

          <Route path="/settings" element={<Setting />} />
          <Route path="/gift-category" element={<GiftCategoryList />} />
          <Route path="/music-list" element={<Music />} />
          <Route path="/rechargeplan-list" element={<RechargePlaneLIst />} />
          <Route path="/push-notification" element={<Notification />} />
          <Route path="/auto-poster" element={<AutoPoster />} />
          <Route path="/auto-posterList" element={<AutoPosterList />} />


        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;

