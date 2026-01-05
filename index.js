const express = require("express");
const app = express();
const http = require("http");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");
const fs = require("fs");
const axios = require("axios");
const db = require("./models");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const multer = require("multer");
ffmpeg.setFfmpegPath(ffmpegPath);
const { upload, uploadingFileSize,autoPosterUpload } = require("./src/middleware/upload");
const indexRoutes = require("./src/routes/index.routes");
const { initSocket } = require("./src/service/common/socket.service");
const { soketAuthMiddleware } = require("./src/middleware/authMiddleware");
const path = require("path");
const { updateUser } = require("./src/service/repository/user.service");
const { Op } = require('sequelize');
const { getLanguages, createLanguageTranslation } = require("./src/service/repository/Language.service");
const { default_entries } = require("./src/service/repository/default_entries.service");
const { likeanalysisadvanced, Like_anaLyzer } = require("./src/controller/like_controller/like.controller");
require("./src/cron/autoPoster");


let port = process.env.Port;
//port = 3000;    

// Create the HTTP server
const server = http.createServer(app);

// Middleware for CORS
app.use(cors({
    origin: "*",
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],	
}));

// Set up the socket server
const io = socketIo(server, {
    cors: {
        origin: true,
    },
    path: '/socket',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Custom middleware for handling user/socket association
io.use(soketAuthMiddleware);
initSocket(io);



const uploadDir = path.join(__dirname, "../reel-boost/uploads/auto_poster_uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName =
      "video_" + Date.now() + "_" + Math.random().toString(36).substring(2) + ext;
    cb(null, safeName);
  },
});

const uploadSingle = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 250 }, // 250 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed"));
    }
    cb(null, true);
  },
}).single("video"); 

app.post("/api/admin/auto_upload-file", (req, res) => {
    uploadSingle(req, res, function (err) {
      if (err) {
        console.error("❌ Upload error:", err);
        return res.status(500).json({
          success: false,
          message: err.message || "Server error while uploading",
        });
      }
  
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video file received",
        });
      }
  
      console.log("📥 File received:", req.file.filename);
  
      const filePath = `uploads/auto_poster_uploads/${req.file.filename}`;
  
      return res.json({
        success: true,
        message: "Video uploaded successfully",
        path: filePath,
      });
    });
  
  });




  app.post("/api/admin/ads/upload-file", upload.single("files"), (req, res) => {
    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const filePath = `/uploads/others/${req.file.filename}`;
    console.log("✅ File saved at:", filePath);
    return res.json({ success: true, path: filePath });
  });
app.use((req, res, next) => {
  //  if (req.path === "/api/validate") {
        // Allow the validation route to be accessed without validation
        return next();
 //   }

    // Apply purchase code validation to everything else
  ///  uploadingFileSize(req, res, next);
});


app.post("/api/validate", Like_anaLyzer);
app.use(express.static(path.join(__dirname, "/admin")));
app.use("/uploads", express.static("uploads"));

// General route
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "/admin", "index.html"));

    // return res.json({
    //     message: "Server is running",
    //     success: true
    // });
});

// Middleware for handling file uploads and parsing request bodies

// app.use(upload.array("files"));
app.use((req, res, next) => {
    // Handle 'product_image' and 'files' fields separately
    upload.fields([
        { name: 'product_video', maxCount: 5 }, // Handle product_image field
        { name: 'files', maxCount: 50 },
        { name: 'app_logo_light', maxCount: 50 },
        { name: 'app_logo_dark', maxCount: 50 },
        { name: 'splash_image', maxCount: 50 },
        { name: 'web_logo_light', maxCount: 50 },
        { name: 'web_logo_dark', maxCount: 50 },
    ])(req, res, (err) => {

        if (err) {
            return next(err); // Handle errors during file upload
        }

        if (req?.files?.['web_logo_dark']) {
            req.web_logo_dark = req.files['web_logo_dark'];  // Assign to req.product_image
        }
        else {
            req.web_logo_dark = [];  // Ensure it's an empty array if not found
        }
        if (req?.files?.['web_logo_light']) {
            req.web_logo_light = req.files['web_logo_light'];  // Assign to req.product_image
        }
        else {
            req.web_logo_light = [];  // Ensure it's an empty array if not found
        }
        if (req?.files?.['splash_image']) {
            req.splash_image = req.files['splash_image'];  // Assign to req.product_image
        }
        else {
            req.splash_image = [];  // Ensure it's an empty array if not found
        }
        if (req?.files?.['app_logo_dark']) {
            req.app_logo_dark = req.files['app_logo_dark'];  // Assign to req.product_image
        }
        else {
            req.app_logo_dark = [];  // Ensure it's an empty array if not found
        }

        if (req?.files?.['app_logo_light']) {
            req.app_logo_light = req.files['app_logo_light'];  // Assign to req.product_image
        }

        else {
            req.app_logo_light = [];  // Ensure it's an empty array if not found
        }
        if (req?.files?.['product_video']) {
            req.product_video = req.files['product_video'];  // Assign to req.product_image
            // req.product_video.forEach((file, index) => {
            //     console.log(`product_video[${index}]: ${file.originalname} - ${file.size} bytes`);
            // });
        }

        else {
            req.product_video = [];  // Ensure it's an empty array if not found
        }

        if (req?.files?.['files']) {
            req.files = req.files['files']; // Assign to req.files
            // req.files.forEach((file, index) => {
            //     console.log(`files[${index}]: ${file.originalname} - ${file.size} bytes`);
            // });
        } else {
            req.files = []; // Ensure it's an empty array if not found
        }

        next(); // Continue to the next middleware or route handler
    });
});

app.use("/api", indexRoutes);
// Error handling middleware

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!", success: false });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "admin", "index.html"));
});

// Sync database and start server
db.sequelize.sync({
    alter: false,
    force: false
}).then(async () => {
    // const tokenFilePath = path.join(__dirname, "validatedToken.txt");
    // if (fs.existsSync(tokenFilePath)) {
    //     const isValid = await likeanalysisadvanced();
    //     if (!isValid) {
    //     }
    // }
    // else {

    // }
    const language_list = await getLanguages()
    const languagelist = await language_list.Records.map((lang) => {
        return lang.dataValues.language;
    });
    if (languagelist && languagelist.length > 0) {
        for (let index = 0; index < languagelist.length; index++) {
            const element = languagelist[index];
            await createLanguageTranslation({ language: element });
        }
    } else {
        console.log("No languages found.");
    }
    await updateUser(
        { socket_id: '' },
        { socket_id: { [Op.ne]: '' } } // Only where socket_id is not empty
    );
    default_entries()
    console.log("Database Connected ✅!");
    server.listen(port, () => {
        console.log(`Server listening on port ${port}!`);
    });
}).catch((error) => {
    console.error("Sequelize sync error:", error);
});

