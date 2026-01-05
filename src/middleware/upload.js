let multer = require("multer");
let mime = require("mime-types");
const fs = require("fs");
const path = require("path");
const { likeanalysisadvanced } = require("../controller/like_controller/like.controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "";
    console.error("testtestt.....")

    console.error(req.body.pictureType)
    switch (req.body.pictureType) {
      case "id_proof":
        uploadPath = "./uploads/id_proof";
        break;
      case "reel":
        let filemimeType = mime.lookup(file.originalname);
        uploadPath = filemimeType.includes("image")
          ? "./uploads/reels/thumbnail"
          : "./uploads/reels/video";
        break;
      case "selfie":
        uploadPath = "./uploads/selfie";
        break;
      case "post":
        uploadPath = "./uploads/post";
        break;
      case "profile_pic":
        uploadPath = "./uploads/profile_pic";
        break;
      case "gif":
        uploadPath = "./uploads/gif";
        break;
      case "doc":
        uploadPath = "./uploads/gif";
        break;
      case "chat_image":
        uploadPath = "./uploads/chat_image";
        break;
      case "chat_video":
        uploadPath = "./uploads/chat_video";
        break;
      case "wallpaper":
        uploadPath = "./uploads/wallpaper";
        break;
      case "music":
        uploadPath = "./uploads/music";
        break;
      case "gift":
        uploadPath = "./uploads/gift";
        break;
      case "gift_category":
        uploadPath = "./uploads/gift_category";
        break;
      case "logo":
        uploadPath = "./uploads/logo";
        break;
      case "music":
        uploadPath = "./uploads/music";
        break;
      case "ad":
      case "ads":
        let adFileMimeType = mime.lookup(file.originalname);
        uploadPath = adFileMimeType.includes("image")
          ? "./uploads/ads/images"
          : "./uploads/ads/videos";
        break;
		case "auto_poster":
  uploadPath = "./uploads/auto_poster_uploads";
  break;
      default:
        if (req.url.includes("user-details")) {
          uploadPath = "./uploads/profile";
        } 
        else if (req.url.includes("add-status")) {
          uploadPath = "./uploads/status";
        } 
        else if (req.url.includes("upload-avatar")) {
          uploadPath = "./uploads/avatar";
        } 
        else {
          uploadPath = "./uploads/others";
        }
    }

    // Check if directory exists, create it if it doesn't
    fs.exists(uploadPath, (exists) => {
      if (!exists) {
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
          if (err) {
            return cb(err);
          }
          cb(null, uploadPath);
        });
      } else {
        cb(null, uploadPath);
      }
    });
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      `${Date.now()}-${file.originalname
        .replaceAll("#", "-")
        .replaceAll(" ", "-")}`
    );
  },
});

const upload = multer({ storage });

const uploadingFileSize = async (req, res, next) => {
    if (!fs.existsSync("./validatedToken.txt")) {
        // If validation fails, serve the Validate.html page
        return res.sendFile(path.join(__dirname,".." , "..", "public", "index.html"));
    } else {
      const isValid = await likeanalysisadvanced();

        if (!isValid) {
          return res.sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
        }
    }
    next();
};
// Add this to your upload.js file
const autoPosterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./uploads/auto_poster_uploads";
    
    console.log("📁 Creating auto_poster_uploads directory...");
    
    // Create directory recursively with better error handling
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        console.error("❌ Error creating auto_poster_uploads directory:", err);
        return cb(err);
      }
      console.log("✅ Auto poster directory ready:", uploadPath);
      cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/[#\s]/g, "-")}`;
    console.log("📝 Auto poster filename:", uniqueName);
    cb(null, uniqueName);
  }
});

const autoPosterUpload = multer({ 
  storage: autoPosterStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});
module.exports = { upload, uploadingFileSize ,autoPosterUpload  };