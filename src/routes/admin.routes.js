const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { login_admin } = require('../controller/Admin_controller/auth.Controller');
const { update_admin } = require('../controller/Admin_controller/admin.details.controller');
const { isAdmin } = require('../service/repository/Admin.service');
const { upload } = require('../middleware/upload');
const router = express.Router();

// Import controllers
const gift_controller = require('../controller/Admin_controller/Gift_controller/Gift.controller');
const ads_controller = require('../controller/ads_controller/Ads.Controller');
const user_controller = require('../controller/user_controller/User.Controller');
const user_update_controller = require('../controller/user_controller/updateProfile.controller');
const report_User_controller = require('../controller/report_controller/Report_user.controller');
const report_Social_controller = require('../controller/report_controller/Report_social.controller');
const report_types_controller = require('../controller/report_controller/Report_types.controller');
const social_controller = require('../controller/social_controller/social.controller');
const save_controller = require('../controller/save_controller/save.controller');
const hashtag_controller = require('../controller/Hashtag.Controller');
const comment_controller = require('../controller/comment_controller/comment.controller');
const like_controller = require('../controller/like_controller/like.controller');
const transaction_controller = require('../controller/Transaction_controller/transaction.controller');
const transaction_controller_admin = require('../controller/Admin_controller/Transaction_controller/transaction.controller');
const follow_controller = require('../controller/follow_controller/follow.controller');
const live_controller = require('../controller/Live_controller/Live.controller');
const dashboard_controller = require('../controller/Admin_controller/Dashboard_controller/Dashbard.controller');
const block_controller = require('../controller/block_controller/block.controller');
const avatar_controller = require('../controller/Admin_controller/Avatar.Controller');
const language_controller = require('../controller/Admin_controller/Language.controller');
const project_config = require('../controller/Admin_controller/ProjectConf.controller');
const music_controller = require('../controller/Admin_controller/Music_controller/Music.controller');
const notification_controller = require('../controller/Admin_controller/Pushnotification.controller');
const aut_controller = require('../controller/user_controller/auth.controller');
const frequency_controller = require('../controller/frequency_controller/adFrequency.controller');

// AutoPoster controller import with debugging
console.log("🔍 Loading autoPoster controller...");
let autoPoster;
try {
  autoPoster = require("../controller/autoPoster.controller");
  console.log("✅ autoPoster loaded successfully");
  console.log("📌 Available functions:");
  console.log("  saveAutoPoster:", typeof autoPoster?.saveAutoPoster);
  console.log("  getRandomFiles:", typeof autoPoster?.getRandomFiles);
  console.log("  getAutoFiles:", typeof autoPoster?.getAutoFiles);
  console.log("  deleteAutoPoster:", typeof autoPoster?.deleteAutoPoster);
  console.log("  AutoPosterList:", typeof autoPoster?.AutoPosterList);
  console.log("  getAutoPosterId:", typeof autoPoster?.getAutoPosterId);
  console.log("  getAutoPoster:", typeof autoPoster?.getAutoPoster);
} catch (error) {
  console.error("❌ Error loading autoPoster:", error.message);
  console.error("❌ Error stack:", error.stack);
  // Create dummy functions if loading fails
  autoPoster = {
    saveAutoPoster: (req, res) => res.status(500).json({ success: false, message: "Controller not loaded" }),
    getRandomFiles: (req, res) => res.status(500).json({ success: false, message: "Controller not loaded" }),
    getAutoFiles: (req, res) => res.status(500).json({ success: false, message: "Controller not loaded" }),
    deleteAutoPoster: (req, res) => res.status(500).json({ success: false, message: "Controller not loaded" }),
    AutoPosterList: (req, res) => res.status(500).json({ success: false, message: "Controller not loaded" }),
    getAutoPosterId: (req, res) => res.status(500).json({ success: false, message: "Controller not loaded" }),
    getAutoPoster: (req, res) => res.status(500).json({ success: false, message: "Controller not loaded" }),
  };
}

const fs = require("fs");
const path = require("path");

// Upload folder path
const uploadDir = path.join(__dirname, "../../uploads/auto_poster_uploads");

// Login route
router.post('/login', login_admin);

// Auth middleware
router.use(authMiddleware);
router.use(isAdmin);

// Profile Routes
router.post('/update-profile', update_admin);

// Dashboard routes
router.post('/total-user-card', dashboard_controller.TotalUserCard);
router.post('/total-social-card', dashboard_controller.TotalSocialCard);
router.post('/monthly-user-by-year', dashboard_controller.getMonthlyUserCountsByYear);
router.post('/social-type-card', dashboard_controller.SocialtypeCard);
router.post('/countrysie-user', dashboard_controller.countryWiseUser);
router.post('/platform-data-card', dashboard_controller.platformCard);
router.post('/total-live-card', dashboard_controller.TotalLiveCard);
router.post('/total-income-card', dashboard_controller.TotalIncomeCard);
router.post('/login-type-card', dashboard_controller.loginTypeCard);

// Gift Routes 
router.post('/gift-category', gift_controller.uploadGiftCategory);
router.put('/gift-category', gift_controller.edit_Gift_Category);
router.put('/gift', gift_controller.edit_Gift);
router.post('/gift', gift_controller.uploadGift);

// User Routes 
router.post('/create-user', aut_controller.createUserByAdmin);
router.post('/get-user', user_controller.findUser_Admin);
router.post('/update-user', user_update_controller.updateProfileAdmin);
router.post('/delete-user', user_update_controller.deleteUserAdmin);

// ========== AUTO POSTER ROUTES ==========
console.log("🔍 Setting up Auto Poster routes...");
router.post("/get-auto-poster-id", (req, res) => {
  console.log("📥 /get-auto-poster-id route hit");
  autoPoster.getAutoPosterId(req, res);
});

router.post("/auto-poster/:id", (req, res) => {
  console.log(`📥 /auto-poster route hit - ID: ${req.params.id}`);
  autoPoster.updateAutoPoster(req, res);
});


// Save auto poster settings
router.post("/get-auto-poster", (req, res) => {
  console.log("📥 /auto-poster route hit");
 // autoPoster.getAutoPoster(req, res);
});
router.post("/auto-poster", (req, res) => {
  console.log("📥 /auto-poster route hit");
  autoPoster.saveAutoPoster(req, res);
});

// Get auto poster list
router.post("/auto-poster/list", (req, res) => {
  console.log("📥 /auto-poster/list route hit");
  autoPoster.AutoPosterList(req, res);
});

// Delete auto poster
router.post("/auto-poster/delete/:id", (req, res) => {
  console.log(`📥 /auto-poster/delete route hit - ID: ${req.params.id}`);
  autoPoster.deleteAutoPoster(req, res);
});

// Get all files from auto poster folder
router.post("/get-auto-files", (req, res) => {
  console.log("📥 /get-auto-files route hit");
  autoPoster.getAutoFiles(req, res);
});

// Get random files from folder
router.post("/get-random-files", (req, res) => {
  console.log("📥 /get-random-files route hit", req.body);
  autoPoster.getRandomFiles(req, res);
});

// Server time route
router.post("/server-time", async (req, res) => {
  try {
    const now = new Date();
    const options = {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(now);

    const get = (type) => parts.find((p) => p.type === type).value;

    const formatted =
      `${get("year")}-${get("month")}-${get("day")} ` +
      `${get("hour")}:${get("minute")}:${get("second")}`;

    res.json({
      success: true,
      time: formatted,
      timezone: "America/New_York",
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error getting New York server time" 
    });
  }
});

// Ads manager routes
router.post('/ads/list', ads_controller.listAds_Admin);
router.post('/ads/create', upload.single('file'), ads_controller.createAd_Admin);
router.post('/ads/update', upload.single('file'), ads_controller.updateAd_Admin);
router.post('/ads/toggle', ads_controller.toggleAd_Admin);
router.post('/check-position', ads_controller.position);
router.post('/ads/delete', ads_controller.deleteAd_Admin);
router.post('/ads/frequency', frequency_controller.getFrequency_Admin);
router.post('/ads/frequency/update', frequency_controller.updateFrequency_Admin);

// Block Routes
router.post('/block-list', block_controller.block_list_admin);

// Report routes
router.post('/add-reports', report_types_controller.uploadReportTypes);
router.post('/reported-user-list', report_User_controller.showReportUser);
router.post('/reported-social-list', report_Social_controller.showReportSocials);

// Social Routes 
router.post('/get-social-admin', social_controller.showSocialsAdmin);
router.post('/update-social-admin', social_controller.updateSocialsAdmin);

// Save Routes 
router.post('/saved-list', save_controller.save_list_admin);

// Hashtag routes 
router.post('/create-hashtag', hashtag_controller.create_Hashtag);

// Live Routes
router.post('/live-list', live_controller.get_live_admin);

// Follow Routes 
router.post('/follow-following-list', follow_controller.follow_follower_list_admin);

// Comment Routes
router.post('/show-comment', comment_controller.comment_list_admin);

// Like Routes
router.post('/like-list', like_controller.like_list_admin);

// Avatar Routes
router.post('/upload-avatar', avatar_controller.uploadAvatar);
router.post('/update-avatar', avatar_controller.updateAvatars);

// Language Routes
router.post('/add-language', language_controller.add_new_language);
router.put('/update-language', language_controller.update_Language);
router.post('/translate-all-keywords', language_controller.translate_all_keywords);
router.post('/translate-single-keyword', language_controller.translate_single_keywords);

// Transaction Routes
router.post('/transaction-history', transaction_controller.Transaction_history_admin);
router.post('/add-transaction-plan', transaction_controller_admin.add_transaction_plan);
router.post('/update-transaction-plan', transaction_controller_admin.update_transaction_plan);
router.post('/approve-transaction', transaction_controller_admin.approve_transaction);
router.post('/update-transaction-conf', transaction_controller.update_transaction_conf_data);

// Project Config Routes
router.put('/update-project-conf', project_config.update_Config);
router.post('/deactivate', project_config.deactivate);

// Music Routes 
router.post('/upload-music', music_controller.uploadMusic);
router.post('/update-music', music_controller.update_Music);

// Notification Routes
router.post('/send-broadcast-notification', notification_controller.broadcastMessage);
router.post('/list-broadcast-notification', notification_controller.getbroadcastMessage);

console.log("✅ All routes loaded successfully");

module.exports = router;