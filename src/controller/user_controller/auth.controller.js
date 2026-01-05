const { createUser, getUser, updateUser } = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const AuthService = require("../../service/common/auth.service");
const { sendEmailOTP, sendVerifyEmailTemplate, sendResetPasswordEmail, generateOTP, verifyOtp, sendTwilioOTP, sendMesg91TP } = require("../../service/common/otp.service");
const { generateToken , verifyToken } = require("../../service/common/token.service");
const filterData = require("../../helper/filter.helper");
const { gettransaction_conf } = require("../../service/repository/Transactions/transaction_conf.service");


// Send Password Reset Link
async function requestPasswordReset(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return generalResponse(res, {}, "Email is required", false, true, 400);
        }

        const user = await getUser({ email });
        if (!user) {
            return generalResponse(res, {}, "User not found", false, true, 404);
        }

        // Create JWT token (expires in 1 hour)
        const token = await generateToken(
            { user_id: user.user_id, email: user.email },
            { expiresIn: "1h" }
        );

        // Update user record with token (optional, can be used for verification)
        //await updateUser({ reset_token: token }, { user_id: user.user_id });

        // Send email with link
        const resetLink = `${process.env.FRONTEND_URL}/forgot-password?token=${token}`;
        const emailSent = await sendResetPasswordEmail(user.email, resetLink);

        if (!emailSent) {
            return generalResponse(res, {}, "Failed to send reset link", false, true);
        }

        return generalResponse(
            res,
            {},
            "Password reset link sent successfully",
            true,
            true
        );

    } catch (error) {
        console.error("Password Reset Request Error:", error);
        return generalResponse(res, {}, "Something went wrong", false, true, 500);
    }
}

async function signupUser(req, res) {
    try {
        console.log("=== SIGNUP REQUEST STARTED ===");
        console.log("Request Body:", req.body);
        
        const type = req.body.login_type;
        let isdemo = false;
        let allowedUpdateFields = [];
        let filteredData;
        let isUser;
        
        if (!req.body.platform) {
            return generalResponse(
                res,
                {},
                "Platform is required",
                false,
                true,
                400
            );
        }

        let otp = await generateOTP();
        console.log("Generated OTP:", otp);

        if (type == 'email') {
            allowedUpdateFields = ['email', 'login_type'];
            try {
                filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
                console.log("Filtered Email Data:", filteredData);
            } catch (err) {
                console.log(err);
                return generalResponse(
                    res,
                    {},
                    "Data is Missing",
                    false,
                    true
                );
            }
            
            if (filteredData.email == 'demo@reelboost.com' && process.env.ISDEMO == 'true') {
                isdemo = true;
                console.log("Demo mode activated for email");
            }

            isUser = await getUser({ email: filteredData.email });
            console.log("Found User (Email):", isUser ? "Yes - User ID: " + isUser.user_id : "No");

        } else if (type == 'phone') {
            allowedUpdateFields = ['mobile_num', 'country_code', 'login_type', 'country_short_name', 'country'];
            try {
                filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
                console.log("Filtered Phone Data:", filteredData);
            } catch (err) {
                console.log(err);
                return generalResponse(
                    res,
                    {},
                    "Phone data is missing",
                    false,
                    true
                );
            }
            
            // Demo check
            if (filteredData.mobile_num == '1234567890' && filteredData.country_code == '+1' && process.env.ISDEMO == 'true') {
                isdemo = true;
                console.log("Demo mode activated for phone");
            }

            // Find existing user
            isUser = await getUser({ 
                mobile_num: filteredData.mobile_num, 
                country_code: filteredData.country_code 
            });
            
            console.log("Found User (Phone):", isUser ? "Yes - User ID: " + isUser.user_id : "No");
            
            if (isUser) {
                console.log("User Details:", {
                    user_id: isUser.user_id,
                    mobile_num: isUser.mobile_num,
                    country_code: isUser.country_code,
                    login_verification_status: isUser.login_verification_status
                });
            }

        } else if (type == 'social') {
            req.body.login_verification_status = true;
            allowedUpdateFields = ['email', 'login_type', 'device_token', 'first_name', 'last_name'];
            
            try {
                filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
            } catch (err) {
                console.log(err);
                return generalResponse(
                    res,
                    {},
                    "Data is Missing",
                    false,
                    true
                );
            }

            isUser = await getUser(filteredData);
            
        } else if (type == 'manual') {
            req.body.login_verification_status = true;
            allowedUpdateFields = ['input', 'login_type', 'password', 'platform'];
            
            try {
                filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
            } catch (err) {
                console.log(err);
                return generalResponse(
                    res,
                    {},
                    "Data is Missing",
                    false,
                    true
                );
            }
            
            const inputValue = filteredData.input;
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);

            if (isEmail) {
                console.log("Input is an email:", inputValue);
                filteredData.email = filteredData.input;
                delete filteredData.input;
                isUser = await getUser({ email: filteredData.email });
            } else {
                console.log("Input is not an email (maybe phone or username):", inputValue);
                filteredData.user_name = filteredData.input;
                delete filteredData.input;
                isUser = await getUser({ user_name: filteredData.user_name }, false, false, true);
            }
            console.log("isuser", isUser);
        }

        // Check if user is blocked
        if (isUser?.blocked_by_admin == true) {
            return generalResponse(
                res,
                {},
                "User Blocked by Admin",
                false,
                true,
                400
            );
        }
        
        // ================ MAIN LOGIC ================
        // If user doesn't exist, create new user
        if (isUser == null) {
            console.log("Creating NEW user...");
            
            const transaction_conf_data = await gettransaction_conf({
                transaction_type: 'withdrawal',
            });
            
            filteredData.available_coins = transaction_conf_data.Records[0].welcome_bonus;
            filteredData.otp = isdemo ? '1234' : otp;
            filteredData.platforms = [req.body.platform];
            
            const newUser = await createUser(filteredData);
            console.log("New User Created ID:", newUser.user_id);

            // Send OTP based on type
            if (type == 'email') {
                const sendOtp = isdemo ? true : await sendEmailOTP(req.body.email, otp);
                console.log("Email OTP Send Result:", sendOtp);
                
                if (sendOtp) {
                    return generalResponse(
                        res,
                        { 
                            newUser: true,
                            user_id: newUser.user_id 
                        },
                        "OTP sent successfully",
                        true,
                        true
                    );
                }
                return generalResponse(res, {}, "Failed to send OTP", false, true);
                
            } else if (type == "phone") {
                console.log("Sending OTP to NEW phone user...");
                let sendOtp = false;

                if (newUser.dataValues.country_code == "+91") {
                    console.log("Using MSG91 for Indian number");
                    sendOtp = isdemo ? true : await sendMesg91TP(
                        newUser.dataValues.country_code, 
                        newUser.dataValues.mobile_num, 
                        otp
                    );
                } else {
                    console.log("Using Twilio for international number");
                    sendOtp = isdemo ? true : await sendTwilioOTP(
                        newUser.dataValues.country_code, 
                        newUser.dataValues.mobile_num, 
                        otp
                    );
                }
                
                console.log("Phone OTP Send Result:", sendOtp);
                
                if (sendOtp) {
                    return generalResponse(
                        res, 
                        { 
                            newUser: true,
                            user_id: newUser.user_id 
                        }, 
                        "OTP sent successfully", 
                        true, 
                        true
                    );
                } else {
                    return generalResponse(
                        res, 
                        { newUser: true }, 
                        "Failed to send OTP", 
                        false, 
                        true
                    );
                }
            }
            
            // For social and manual login (no OTP needed)
            if (type == 'social' || type == 'manual') {
                const token = await generateToken({
                    user_id: newUser.user_id,
                    email: newUser.email,
                    user_name: newUser.user_name,
                    login_type: newUser.login_type
                });
                
                return generalResponse(
                    res,
                    {
                        token: token,
                        user: newUser,
                        newUser: true
                    },
                    "User signed up successfully",
                    true,
                    true
                );
            }
            
        } else {
            // ================ EXISTING USER LOGIC ================
            console.log("User already exists, sending OTP...");
            
            if (type == 'social') {
                // Social login - no OTP needed
                let existingPlatform = isUser.platforms || [];
                if (!existingPlatform.includes(req.body.platform)) {
                    existingPlatform.push(req.body.platform);
                    await updateUser({ platforms: existingPlatform }, {
                        user_id: isUser.user_id,
                    });
                }
                
                const token = await generateToken({
                    user_id: isUser.user_id,
                    email: isUser.email,
                    user_name: isUser.user_name,
                    login_type: isUser.login_type
                });
                
                return generalResponse(
                    res,
                    {
                        token: token,
                        user: isUser,
                        newUser: false
                    },
                    "Login successful",
                    true,
                    true
                );
                
            } else if (type == 'manual') {
                // Manual login with password
                const isAuthentic = await AuthService.comparePassword(req.body.password, isUser.password);
                if (!isAuthentic) {
                    return generalResponse(
                        res,
                        {},
                        "Invalid credentials",
                        false,
                        true,
                        401
                    );
                }
                
                let existingPlatform = isUser.platforms || [];
                if (!existingPlatform.includes(req.body.platform)) {
                    existingPlatform.push(req.body.platform);
                    await updateUser({ platforms: existingPlatform }, {
                        user_id: isUser.user_id,
                    });
                }
                
                const token = await generateToken({
                    user_id: isUser.user_id,
                    email: isUser.email,
                    user_name: isUser.user_name,
                    login_type: isUser.login_type
                });
                
                return generalResponse(
                    res,
                    {
                        token: token,
                        user: isUser,
                        newUser: false
                    },
                    "Login successful",
                    true,
                    true
                );
                
            } else if (type == 'email') {
                // Email OTP for existing user
                if (filteredData.email == 'demo@reelboost.com' && process.env.ISDEMO == 'true') {
                    isdemo = true;
                    otp = '1234';
                }

                const sendOtp = isdemo ? true : await sendEmailOTP(req.body.email, otp);
                let existingPlatform = isUser.platforms || [];
                
                if (!existingPlatform.includes(req.body.platform)) {
                    existingPlatform.push(req.body.platform);
                }

                let updated = isdemo ? true : await updateUser({ 
                    otp: isdemo ? 1234 : parseInt(otp, 10),
                    platforms: existingPlatform 
                }, {
                    user_id: isUser.user_id,
                });
                
                if (sendOtp && updated) {
                    return generalResponse(
                        res,
                        { 
                            newUser: false,
                            user_id: isUser.user_id 
                        },
                        "OTP sent successfully",
                        true,
                        true
                    );
                }
                return generalResponse(res, {}, "Failed to send OTP", false, true);
                
            } else if (type == "phone") {
                // Phone OTP for existing user
                console.log("Resending OTP for EXISTING phone user...");
                
                if (req.body.mobile_num == '1234567890' && req.body.country_code == '+1' && process.env.ISDEMO == 'true') {
                    isdemo = true;
                    otp = '1234';
                }
                
                let sendOtp = false;
                let updated = false;
                
                // Update platforms
                let existingPlatform = isUser.platforms || [];
                if (!existingPlatform.includes(req.body.platform)) {
                    existingPlatform.push(req.body.platform);
                }

                if (isUser.country_code == "+91") {
                    console.log("Resending via MSG91");
                    sendOtp = isdemo ? true : await sendMesg91TP(
                        isUser.country_code, 
                        isUser.mobile_num, 
                        otp
                    );
                    
                    updated = isdemo ? true : await updateUser({ 
                        otp: isdemo ? 1234 : parseInt(otp, 10),
                        platforms: existingPlatform 
                    }, {
                        user_id: isUser.user_id,
                    });
                } else {
                    console.log("Resending via Twilio");
                    sendOtp = isdemo ? true : await sendTwilioOTP(
                        isUser.country_code, 
                        isUser.mobile_num, 
                        otp
                    );
                    
                    updated = isdemo ? true : await updateUser({ 
                        otp: isdemo ? 1234 : parseInt(otp, 10),
                        platforms: existingPlatform 
                    }, {
                        user_id: isUser.user_id,
                    });
                }
                
                console.log("Resend OTP Result - Send:", sendOtp, "Updated:", updated);
                
                if (sendOtp && updated) {
                    return generalResponse(
                        res, 
                        { 
                            newUser: false,
                            user_id: isUser.user_id 
                        }, 
                        "OTP sent successfully", 
                        true, 
                        true
                    );
                } else {
                    return generalResponse(
                        res, 
                        { newUser: false }, 
                        "Failed to send OTP", 
                        false, 
                        true
                    );
                }
            }
        }
        
    } catch (error) {
        console.error("Error in SignUp:", error);
        console.error("Error Stack:", error.stack);
        
        return generalResponse(
            res,
            { error: error.message },
            "Something went wrong",
            false,
            true
        );
    }
}

async function OtpVerification(req, res) {
    try {
        console.log("=== OTP VERIFICATION REQUEST ===");
        console.log("Request Body:", req.body);

        const type = req.body.login_type;
        const otp = req.body.otp;
        
        if (!otp || otp == 0 || otp == "0") {
            return generalResponse(
                res,
                {},
                "Please enter OTP",
                false,
                true,
                400
            );
        }
        
        let isdemo = false;
        let allowedUpdateFields = [];
        let filteredData;
        
        if (type == 'email') {
            if (req.body.email == 'demo@reelboost.com' && process.env.ISDEMO == 'true') {
                isdemo = true;
            }
            allowedUpdateFields = ['email', 'otp'];
            
        } else if (type == 'phone') {
            if (req.body.mobile_num == '1234567890' && req.body.country_code == '+1' && process.env.ISDEMO == 'true') {
                isdemo = true;
            }
            allowedUpdateFields = ['mobile_num', 'otp', 'country_code'];
        } else {
            return generalResponse(
                res,
                {},
                "Invalid login type",
                false,
                true,
                400
            );
        }
        
        console.log("Is Demo:", isdemo);

        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
            console.log("Filtered OTP Data:", filteredData);
        } catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                "Missing required data",
                false,
                true
            );
        }

        // Verify OTP
        const isVerified = await verifyOtp(filteredData, isdemo);
        console.log("OTP Verification Result:", isVerified);
        
        if (isVerified) {
            // Generate JWT token
            const tokenPayload = {
                user_id: isVerified.user_id,
                login_type: type
            };
            
            // Add email or phone to token based on login type
            if (type == 'email') {
                tokenPayload.email = isVerified.email;
            } else if (type == 'phone') {
                tokenPayload.mobile_num = isVerified.mobile_num;
                tokenPayload.country_code = isVerified.country_code;
            }
            
            const token = await generateToken(tokenPayload);
            
            console.log("Token generated for user:", isVerified.user_id);
            
            // Prepare user response data
            const userResponse = {
                user_id: isVerified.user_id,
                email: isVerified.email,
                mobile_num: isVerified.mobile_num,
                country_code: isVerified.country_code,
                user_name: isVerified.user_name,
                first_name: isVerified.first_name,
                last_name: isVerified.last_name,
                login_verification_status: isVerified.login_verification_status,
                available_coins: isVerified.available_coins,
                created_at: isVerified.created_at
            };
            
            return generalResponse(
                res,
                {
                    token: token,
                    user: userResponse,
                    newUser: !isVerified.login_verification_status
                },
                "OTP verified successfully",
                true,
                false
            );
        } else {
            return generalResponse(
                res,
                { success: false },
                "Invalid OTP",
                false,
                true
            );
        }

    } catch (err) {
        console.log("OTP Verification Error:", err);
        console.log("Error Stack:", err.stack);
        
        return generalResponse(
            res,
            { error: err.message },
            "Something went wrong",
            false,
            true
        );
    }
}

async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        // 1️⃣ Validate input
        if (!token || !newPassword) {
            return generalResponse(
                res,
                {},
                "Token and new password are required",
                false,
                true,
                400
            );
        }

        // 2️⃣ Verify token (ALREADY PRESENT IN PROJECT)
        const decoded = await verifyToken(token);

        if (!decoded || !decoded.user_id) {
            return generalResponse(
                res,
                {},
                "Invalid or expired token",
                false,
                true,
                401
            );
        }

        // 3️⃣ Encrypt new password
        const hashedPassword = await AuthService.encryptPassword(newPassword);

        // 4️⃣ Update password
        await updateUser(
            { password: hashedPassword },
            { user_id: decoded.user_id }
        );

        return generalResponse(
            res,
            {},
            "Password reset successfully",
            true,
            true
        );

    } catch (error) {
        console.error("Reset Password Error:", error);
        return generalResponse(
            res,
            {},
            "Something went wrong",
            false,
            true,
            500
        );
    }
}
async function createUserByAdmin(req, res) {
    try {
        const type = req.body.login_type;
        let isdemo = false;
        let allowedUpdateFields = [];
        let filteredData;
        let isUser;

        if (req?.body?.password) {
            let hashedPassword = req.body.password;
            hashedPassword = await AuthService.encryptPassword(hashedPassword);
            req.body.password = hashedPassword;
        }

        let otp = await generateOTP();

        allowedUpdateFields = [
            'full_name',
            'first_name',
            'last_name',
            'user_name',
            'email',
            'country_code',
            'mobile_num',
            'country',
            'gender',
            'country_short_name',
            'password'
        ];
        
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
        } catch (err) {
            console.log(err);
            return generalResponse(
                res,
                {},
                err.message || "Data is Missing",
                false,
                true
            );
        }
        
        const transaction_conf_data = await gettransaction_conf({
            transaction_type: 'withdrawal',
        });
        
        filteredData.available_coins = transaction_conf_data.Records[0].welcome_bonus;
        filteredData.platforms = ["website"];
        filteredData.login_verification_status = true;
        filteredData.login_type = "manual";

        // Check if user already exists
        isUser = await getUser({
            email: filteredData.email,
            mobile_num: filteredData.mobile_num,
            country_code: filteredData.country_code,
            user_name: filteredData.user_name,
        }, false, false, true);

        if (isUser) {
            return generalResponse(
                res,
                {},
                "User already exists",
                false,
                true
            );
        }

        const newUser = await createUser(filteredData);

        const keysToRemove = [
            "password",
            "otp",
            "social_id",
            "id_proof",
            "selfie",
            "device_token"
        ];

        const user = filterData(newUser, keysToRemove, mode = "key");

        return generalResponse(
            res,
            user,
            "User registered successfully",
            true,
            true
        );

    } catch (error) {
        console.error("Error in user registration:", error);
        console.error("Error Stack:", error.stack);
        
        return generalResponse(
            res,
            { error: error.message },
            "Something went wrong",
            false,
            true
        );
    }
}

async function singupUser(req, res) {
    try {
        let allowedUpdateFields = [];
        let filteredData;
        let isUser;

        if (req?.body?.password) {
            let hashedPassword = req.body.password;
            hashedPassword = await AuthService.encryptPassword(hashedPassword);
            req.body.password = hashedPassword;
        }

        allowedUpdateFields = [
            'full_name',
            'first_name',
            'last_name',
            'user_name',
            'email',
            'country_code',
            'mobile_num',
            'country',
            'gender',
            'country_short_name',
            'password'
        ];
        
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
        } catch (err) {
            return generalResponse(res, {}, err.message || "Data is Missing", false, true);
        }
        
        const transaction_conf_data = await gettransaction_conf({
            transaction_type: 'withdrawal',
        });
        
        filteredData.available_coins = transaction_conf_data.Records[0].welcome_bonus;
        filteredData.platforms = ["website"];
        filteredData.login_verification_status = true;
        filteredData.login_type = "manual";

        // 🔍 Check if user already exists
        isUser = await getUser({
            email: filteredData.email,
            mobile_num: filteredData.mobile_num,
            country_code: filteredData.country_code,
            user_name: filteredData.user_name,
        }, false, false, true);

        if (isUser) {
            return generalResponse(res, {}, "User already exists", false, true);
        }

        // 🔒 Default: user inactive
        filteredData.blocked_by_admin = "1";

        // ✅ Create user
        const newUser = await createUser(filteredData);

        // 🔐 Generate email verification token (1 hour)
        const verifyToken = await generateToken(
            {
                user_id: newUser.user_id,
                email: newUser.email,
                type: "email_verify"
            },
            { expiresIn: "1h" }
        );

        // 🔗 Create verify link
        const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

        // 📧 Send verification email
        await sendVerifyEmailTemplate(newUser.email, verifyLink);

        const keysToRemove = [
            "password",
            "otp",
            "social_id",
            "id_proof",
            "selfie",
            "device_token"
        ];

        const user = filterData(newUser, keysToRemove, "key");

        return generalResponse(
            res,
            user,
            "Signup successful! Please verify your email to activate your account. Check your inbox.",
            true,
            true
        );

    } catch (error) {
        console.error("Error in user registration:", error);
        return generalResponse(res, {}, "Something went wrong", false, true);
    }
}

async function verifyEmail(req, res) {
    try {
        const { token } = req.body;

        console.log("verifyEmail token:", token);

        const decoded = await verifyToken(token);
        console.log("decoded:", decoded);

        if (!decoded || decoded.type !== "email_verify") {
            return generalResponse(res, {}, "Invalid token", false, true);
        }

        // ✅ Correct order: (updateData, whereCondition)
        await updateUser(
            {
                blocked_by_admin: "0",
                login_verification_status: true
            },
            {
                user_id: decoded.user_id
            }
        );

        return generalResponse(
            res,
            {},
            "Email verified successfully. You can now login.",
            true,
            true
        );

    } catch (error) {
        console.error("Verify Email Error:", error);
        return generalResponse(
            res,
            {},
            "Verification link expired or invalid",
            false,
            true
        );
    }
}

module.exports = {
    signupUser,
    OtpVerification,
    resetPassword,
    createUserByAdmin,
    singupUser,
    verifyEmail,
    requestPasswordReset
};

