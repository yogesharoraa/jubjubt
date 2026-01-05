const cron = require("node-cron");
const moment = require("moment-timezone");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");

ffmpeg.setFfmpegPath(ffmpegPath);

const { AutoPoster, sequelize, Ad } = require("../../models");
const { createMedia } = require("../service/repository/Media.service");
const { createSocial } = require("../service/repository/SocialMedia.service");
const { getUser, updateUser } = require("../service/repository/user.service");
const { uploadFileToS3 } = require("../utils/s3"); 

// ------------------------ CRON START ------------------------
cron.schedule("* * * * *", async () => {
  console.log("⏳ Cron Running:", moment().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss"));

  try {
    const uploadDir = path.join(__dirname, "../../uploads/auto_poster_uploads");

    if (!fs.existsSync(uploadDir)) {
      console.log("❌ Upload folder not found.");
      return;
    }

    const videoExts = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv", ".m4v", ".3gp"];

    // Read all files safely
    let fileList = fs.readdirSync(uploadDir)
      .filter(f => videoExts.includes(path.extname(f).toLowerCase()))
      .map(f => path.join(uploadDir, f));

    if (fileList.length <= 0) {
      console.log("❌ No video files found.");
      return;
    }

    const poster = await AutoPoster.findOne({ order: [["id", "DESC"]], raw: true });

    if (!poster) {
      console.log("❌ No Autoposter Found");
      return;
    }

    const times = JSON.parse(poster.times);
    const users = JSON.parse(poster.users);
    const masterNumber = poster.master_number;

    if (fileList.length < users.length * masterNumber) {
      console.log("❌ Total video files not enough.");
      return;
    }

    const currentTime = moment().tz("America/New_York").format("HH:mm");

    if (!times.includes(currentTime)) return;

    console.log("⏰ MATCHED TIME:", currentTime);

    // ------------------------ MAIN LOOP ------------------------
    for (let user_id of users) {
      const user = await getUser({ user_id });
      if (!user) continue;

      console.log(`👤 Processing User: ${user_id}`);

      for (let i = 0; i < masterNumber; i++) {
        // Reload fresh files every loop
        let freshFiles = fs.readdirSync(uploadDir)
          .filter(f => videoExts.includes(path.extname(f).toLowerCase()))
          .map(file => path.join(uploadDir, file));

        if (freshFiles.length <= 0) {
          console.log("🚫 No videos left inside folder.");
          return;
        }

        const selectedFile = freshFiles[Math.floor(Math.random() * freshFiles.length)];
        const fileName = path.basename(selectedFile);

        console.log(`🎬 Selected Video: ${fileName}`);

        // ------------------ Check if File is CORRUPT ------------------
        try {
          fs.readFileSync(selectedFile); // If corrupt → will throw error
        } catch (err) {
          console.log(`❌ CORRUPTED FILE → ${fileName}. Skipping...`);
          continue; // Go to next file
        }

        // ------------------ CREATE THUMBNAIL ------------------
        let thumbName = `thumb_${Date.now()}.jpg`;
        let thumbDir = path.join(__dirname, "../../uploads/other");
        let thumbPath = path.join(thumbDir, thumbName);

        if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

        try {
          await new Promise((resolve, reject) => {
            ffmpeg(selectedFile)
              .on("end", resolve)
              .on("error", (err) => {
                console.log(`❌ Thumbnail FFmpeg Failed (${fileName}). Skipping...`);
                reject(err);
              })
              .screenshots({
                timestamps: ["00:00:01"],
                filename: thumbName,
                folder: thumbDir,
                size: "540x960"
              });
          });
        } catch (err) {
          continue; // Skip corrupted/invalid video
        }

        // ------------------ UPLOAD BOTH TO S3 (SAFE MODE) ------------------
        let videoUrl = null;
        let thumbnailUrl = null;

        try {
          videoUrl = await uploadFileToS3(selectedFile, "reelboost/reels");
        } catch (err) {
          console.log(`❌ S3 Upload Failed (Video) → ${fileName}. Skipping...`);
          continue;
        }

        try {
          thumbnailUrl = await uploadFileToS3(thumbPath, "auto_poster/thumbnails");
        } catch (err) {
          console.log(`❌ S3 Upload Failed (Thumbnail). Skipping video...`);
          continue;
        }

        console.log("🟢 Uploaded to S3:", videoUrl);

        // ------------------ DELETE LOCAL FILES ------------------
        try { fs.unlinkSync(selectedFile); } catch (e) {}
        try { fs.unlinkSync(thumbPath); } catch (e) {}

        // ------------------ CREATE SOCIAL DB ENTRY ------------------
        const socialData = {
          social_desc: "",
          social_type: "reel",
          user_id,
          country: user.country,
          hashtag: [],
          reel_thumbnail: thumbnailUrl,
          aspect_ratio: "9:16",
          video_hight: 1080,
          music_id: null,
        };

        const reel = await createSocial(socialData);
        if (!reel) {
          console.log("❌ Social creation failed");
          continue;
        }

        await createMedia({
          social_id: reel.social_id,
          media_location: videoUrl
        });

        await updateUser(
          { total_socials: user.total_socials + 1 },
          { user_id }
        );

        console.log(`🎉 Reel Created for User ${user_id}`);
      }
    }

  } catch (error) {
    console.error("❌ Cron Error:", error);
  }
});
