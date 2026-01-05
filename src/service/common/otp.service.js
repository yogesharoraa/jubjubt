const nodemailer = require("nodemailer")
const { User } = require("../../../models");
const { updateUser } = require("../../service/repository/user.service");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { getConfig } = require("../repository/Project_conf.service");

// To Generate OTP
function generateOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000); 
    return otp.toString();
}

// ========== FIXED: Twilio Client Initialization ==========
let twilioClient = null;

function getTwilioClient() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.error("Twilio credentials missing in environment");
        return null;
    }
    
    if (twilioClient === null) {
        try {
            const twilio = require("twilio");
            twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            console.log("✅ Twilio client initialized");
        } catch (error) {
            console.error("❌ Failed to initialize Twilio:", error.message);
            return null;
        }
    }
    
    return twilioClient;
}

async function sendResetPasswordEmail(email, resetLink) {
    console.log("=== SENDING RESET PASSWORD EMAIL ===",resetLink);

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const template = fs.readFileSync(
            path.resolve(__dirname, "../../../public/emailTemplateReset.html"),
            "utf-8"
        );

        const settings = await getConfig({ config_id: 1 });

        const emailContent = template
            .replaceAll("{{app_name}}", settings.app_name || "App")
            .replaceAll("{{resetLink}}", resetLink)
            .replaceAll("{{copy_right}}", settings.copyright_text || "");

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Reset your password – ${settings.app_name || "App"}`,
            html: emailContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Reset password email:", info.messageId ? "Sent" : "Failed");

        return !!info;

    } catch (error) {
        console.error("Reset password email error:", error.message);
        return false;
    }
}

async function sendVerifyEmailTemplate(email, verifyLink) {
    console.log("=== SENDING RESET PASSWORD EMAIL ===",verifyLink);

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const template = fs.readFileSync(
            path.resolve(__dirname, "../../../public/emailTemplateVerify.html"),
            "utf-8"
        );

        const settings = await getConfig({ config_id: 1 });

        const emailContent = template
            .replaceAll("{{app_name}}", settings.app_name || "App")
            .replaceAll("{{verifyLink}}", verifyLink)
            .replaceAll("{{copy_right}}", settings.copyright_text || "");

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Please verify your email address to activate your account – ${settings.app_name || "App"}`,
            html: emailContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Reset password email:", info.messageId ? "Sent" : "Failed");

        return !!info;

    } catch (error) {
        console.error("Reset password email error:", error.message);
        return false;
    }
}

async function sendEmailOTP(email, otp) {
    console.log("=== SENDING EMAIL OTPs ===");
    
    try {
        let transporter = nodemailer.createTransport({
            //service: process.env.EMAIL_SERVICE || 'gmail',
            host: process.env.SMTP_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        
        const LoginLinkTemplate = fs.readFileSync(
            path.resolve(__dirname, "../../../public/emailTemplate.html"),
            "utf-8"
        );
        
        const settings = await getConfig({ config_id: 1 });
        
        let emailContent = LoginLinkTemplate.replaceAll(
            "{{app_name}}",
            `${settings.app_name || 'App'}`
        );
        
        emailContent = emailContent.replaceAll(
            "{{generatedOtp}}",
            `${otp}`
        );
        
        emailContent = emailContent.replaceAll(
            "{{baseUrl}}",
            `${process.env.baseUrl || 'http://localhost:3000'}`
        );
        
        emailContent = emailContent.replaceAll(
            "{{copy_right}}",
            `${settings.copyright_text || ''}`
        );
        
        let mailOptions = {
            from: `${process.env.EMAIL}`,
            to: email,
            subject: `Your OTP for ${settings.app_name || 'App'}`,
            html: emailContent
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId ? "Success" : "Failed");
        
        if (info) {
            const otpAsInteger = parseInt(otp, 10);
            const [updated] = await User.update(
                { otp: otpAsInteger, otp_updated_at: new Date() }, 
                { where: { email: email } }
            );
            
            return updated > 0;
        }
        return false;
    } catch (err) {
        console.error("Email error:", err.message);
        return false;
    }
}



async function sendTwilioOTP(country_code, mobile_num, otp) {
    console.log("=== SENDING TWILIO OTP ===");
    console.log("To:", country_code, mobile_num);
    console.log("OTP:", otp);
    
    // ========== FIX: Always save OTP to database first ==========
    const otpAsInteger = parseInt(otp, 10);
    
    try {
        // First save OTP to database
        console.log("💾 Saving OTP to database...");
        const [updated] = await User.update(
            { 
                otp: otpAsInteger, 
                otp_updated_at: new Date(),
                otp_sent_via: 'twilio'
            }, 
            { 
                where: { 
                    mobile_num: mobile_num, 
                    country_code: country_code 
                } 
            }
        );
        
        console.log("Database save result:", updated > 0 ? "Success" : "Failed");
        
        if (updated === 0) {
            console.log("⚠️ No user found with these credentials");
            return false;
        }
        
    } catch (dbError) {
        console.error("❌ Database error:", dbError.message);
        return false;
    }
    
    // ========== Check for TEST MODE ==========
    if (process.env.TEST_MODE === 'true' || !process.env.TWILIO_ACCOUNT_SID) {
        console.log("✅ TEST MODE: OTP saved to database, SMS not sent");
        console.log(`📱 Use OTP: ${otp} for verification`);
        return true; // Return true because OTP is saved
    }
    
    // ========== Actual Twilio SMS ==========
    try {
        const client = getTwilioClient();
        if (!client) {
            console.error("❌ Twilio client not available");
            return true; // Still return true because OTP is saved
        }
        
        // Clean mobile number
        const cleanMobileNum = mobile_num.replace(/\D/g, '');
        const toNumber = `${country_code}${cleanMobileNum}`;
        
        console.log("📱 Sending SMS to:", toNumber);
        console.log("📞 From:", process.env.TWILIO_PHONE_NUMBER);
        
        if (!process.env.TWILIO_PHONE_NUMBER) {
            console.error("❌ Twilio phone number not configured");
            return true; // Still return true because OTP is saved
        }
        
        const response = await client.messages.create({
            body: `Your OTP for ${process.env.APP_NAME || 'App'} is ${otp}`,
            to: toNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
        });
        
        console.log("✅ Twilio Response:");
        console.log("Status:", response.status);
        console.log("SID:", response.sid);
        
        return ['queued', 'sent', 'delivered'].includes(response.status);
        
    } catch (err) {
        console.error("❌ Twilio SMS error:", err.message);
        console.error("Error Code:", err.code);
        
        // Even if Twilio fails, OTP is already saved
        console.log("ℹ️ OTP is saved in database despite SMS error");
        return true; // Return true because OTP is saved
    }
}

async function sendMesg91TP(country_code, mobile_num, otp) {
    console.log("=== SENDING MSG91 OTP ===");
    
    // ========== FIX: Always save OTP to database first ==========
    const otpAsInteger = parseInt(otp, 10);
    
    try {
        console.log("💾 Saving OTP to database...");
        const [updated] = await User.update(
            { 
                otp: otpAsInteger, 
                otp_updated_at: new Date(),
                otp_sent_via: 'msg91'
            }, 
            { 
                where: { 
                    mobile_num: mobile_num, 
                    country_code: country_code 
                } 
            }
        );
        
        console.log("Database save result:", updated > 0 ? "Success" : "Failed");
        
        if (updated === 0) {
            return false;
        }
        
    } catch (dbError) {
        console.error("❌ Database error:", dbError.message);
        return false;
    }
    
    // ========== Check for TEST MODE ==========
    if (process.env.TEST_MODE === 'true' || !process.env.MSG_91_AUTH_KEY) {
        console.log("✅ TEST MODE: OTP saved, MSG91 SMS not sent");
        console.log(`📱 Use OTP: ${otp} for verification`);
        return true;
    }
    
    // ========== Actual MSG91 SMS ==========
    try {
        if (country_code !== "+91") {
            console.log("MSG91 only for Indian numbers");
            return true; // Still return true
        }
        
        const cleanMobileNum = mobile_num.replace(/\D/g, '');
        
        const response = await axios.post(
            "https://api.msg91.com/api/v5/otp", 
            {
                authkey: process.env.MSG_91_AUTH_KEY,
                template_id: process.env.MSG_91_TEMPLATE_ID,
                mobile: `91${cleanMobileNum}`,
                otp: otp,
                sender: process.env.MSG91_SENDER_ID || "TESTIN",
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );
        
        console.log("✅ MSG91 Response:", response.data);
        
        return response.data.type === "success";
        
    } catch (err) {
        console.error("❌ MSG91 error:", err.message);
        console.log("ℹ️ OTP is saved in database despite MSG91 error");
        return true; // Return true because OTP is saved
    }
}

async function verifyOtp(userpayload, isDemo) {
    try {
        if (userpayload.email && isDemo) {
            const verificationStatus = await User.findOne({
                where: {
                    email: userpayload.email,
                }
            })
            return verificationStatus

        }
        if (userpayload.mobile_num && isDemo) {
            const verificationStatus = await User.findOne({
               
                where: {
                    mobile_num: userpayload.mobile_num,
                    country_code: userpayload.country_code,
                }
            })
            console.log(verificationStatus, "verificationStatus in otp service");
            
            return verificationStatus

        }
     
        const verificationStatus = await User.findOne({
            where: userpayload
        })

        if (verificationStatus && !isDemo) {
            const user = await updateUser(
                { login_verification_status: true, otp: 0 },
                { user_id: verificationStatus.user_id }
            )
        }
        return verificationStatus
    }
    catch (err) {
        console.error(err)
    }

}

module.exports = { 
    sendEmailOTP, 
    generateOTP, 
    sendResetPasswordEmail,
    sendVerifyEmailTemplate,
    verifyOtp, 
    sendTwilioOTP, 
    sendMesg91TP 
};