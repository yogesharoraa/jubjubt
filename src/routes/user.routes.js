const express = require('express');
const { signupUser, OtpVerification,requestPasswordReset,resetPassword, createUserByAdmin ,singupUser , verifyEmail} = require('../controller/user_controller/auth.controller');
const { updateProfile } = require('../controller/user_controller/updateProfile.controller');

const { get_AdsList , createAd_user , deleteAd_User , updateAd_User } = require('../controller/user_controller/ads.controller');

const { authMiddleware } = require('../middleware/authMiddleware');
const { findUser, get_notificationList, update_notificationList, findUser_no_auth, findUser_not_following } = require('../controller/user_controller/User.Controller');
const router = express.Router();

// No Auth User Routes
router.post('/signup', signupUser);
router.post('/verfyOtp', OtpVerification);
router.post('/restPass', requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post('/register-user', createUserByAdmin);
router.post('/signup-user', singupUser);
router.post('/verify-email', verifyEmail);

router.post('/find-user-no-auth', findUser_no_auth);

router.use(authMiddleware)
// Auth User Routes
router.post('/updateUser', updateProfile);
router.post('/find-user', findUser);
router.post('/find-user-not-following', findUser_not_following);

// Notification List
router.post('/get-notification-list', get_notificationList);
router.post('/update-notification-list', update_notificationList);

// Ads List
router.post('/ads/fetch-ads', get_AdsList);
router.post('/ads/create', createAd_user);
router.post('/ads/delete-ad', deleteAd_User);
router.post('/ads/update', updateAd_User);
// Admin routes
router.post('')
module.exports = router;