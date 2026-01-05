const path = require("path");
const fs = require("fs");
const { AutoPoster, Ad } = require("../../models");
const { createMedia } = require("../service/repository/Media.service");
const { createSocial } = require("../service/repository/SocialMedia.service");
const { getUser, updateUser } = require("../service/repository/user.service");
const { 
  getHashTags, 
  createHashtag, 
  updateHashtag, 
  extractHashtags 
} = require("../service/repository/hashtag.service");

console.log("🔍 autoPoster.controller.js loading...");

// Function to delete files from storage
const deleteFilesFromStorage = (filePaths) => {
  filePaths.forEach(filePath => {
    try {
      const fullPath = path.join(__dirname, "../..", filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑 Deleted file: ${fullPath}`);
      }
    } catch (error) {
      console.error(`❌ Error deleting file ${filePath}:`, error);
    }
  });
};

// Ads create function (आपके Ads Manager के similar)
const createAd = async (adData) => {
  try {
    console.log("📝 Creating ad with data:", adData);

    // Prepare ad data exactly like your Ads Manager expects
    const adPayload = {
      target_url: adData.target_url || "#",
      type: adData.type || "image",
      media_url: adData.media_url || "",
      title: adData.title || `Auto Ad ${Date.now()}`,
      description: adData.description || "",
      sub_description: adData.sub_description || "",
      position: adData.position || 1,
      priority: adData.priority || 0,
      is_active: adData.is_active !== undefined ? adData.is_active : true,
      deleted_at: adData.deleted_at || null,
      uploader_type: "admin",
      uploader_name: "AutoPoster System",
      source_type: "auto_poster",
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log("📦 Ad payload for database:", adPayload);

    // Create ad in database (direct database insert)
    const createdAd = await Ad.create(adPayload);
    
    console.log(`✅ Ad created: ${createdAd.id}`);
    
    return {
      success: true,
      ad: createdAd
    };

  } catch (error) {
    console.error("❌ Create ad error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create ads from files
const createAdsFromFiles = async (files) => {
  try {
    console.log(`📱 Creating ads for ${files.length} files`);
    let createdAds = [];
	console.log("Ads model:", Ad);

    for (const filePath of files) {
      try {
        // Detect file type from extension
        let fileType = "image";
        const ext = path.extname(filePath).toLowerCase();
        
        const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.3gp'];
        if (videoExts.includes(ext)) {
          fileType = "video";
        }

        // Prepare ad data
        const adData = {
          target_url: "https://your-website.com", // Default URL
          type: fileType,
          media_url: filePath,
          title: `AutoPoster Ad ${new Date().toLocaleDateString()}`,
          description: "Created from AutoPoster system",
          position: 1,
          priority: 0,
          is_active: true
        };
      
      
        // Create ad
        const result = await createAd(adData);
   
        if (result.success) {
          createdAds.push({
            id: result.ad.id,
            filePath: filePath,
            type: fileType,
            media_url: filePath,
            title: adData.title
          });
          console.log(`✅ Ad created for: ${filePath}`);
        } else {
          console.log(`❌ Failed to create ad for: ${filePath}`, result.error);
        }

      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
      }
    }

    return {
      success: createdAds.length > 0,
      createdAds: createdAds,
      totalCreated: createdAds.length
    };

  } catch (error) {
    console.error("❌ Create Ads From Files Error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

exports.saveAutoPoster = async (req, res) => {
  try {
    console.log("📥 AUTO POSTER SAVE REQUEST:", req.body);


	
    const { files, master_number, times, users } = req.body;

    // Validate required fields
    if (!files || files.length === 0 || !master_number || !times || !users) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Calculate required files count
    const totalFilesNeeded = users.length * master_number;
    
  /*   if (files.length < totalFilesNeeded) {
      return res.status(400).json({
        success: false,
        message: `Not enough files. Required: ${totalFilesNeeded}, Available: ${files.length}`
      });
    } */

    // STEP 1: Randomly assign files to users
    const userFileAssignments = {};
    const shuffledFiles = [...files].sort(() => Math.random() - 0.5);
    
    let fileIndex = 0;
    users.forEach(userId => {
      userFileAssignments[userId] = shuffledFiles.slice(fileIndex, fileIndex + master_number);
      fileIndex += master_number;
    });

    console.log("📋 User File Assignments:", userFileAssignments);

    const autoPosterData = {
      files: JSON.stringify(files),
      master_number: parseInt(master_number),
      times: JSON.stringify(times),
      users: JSON.stringify(users),
      //status: "posted",
      //ads_created: adsCreated // Save ads count
    };

    const result = await AutoPoster.create(autoPosterData);

    res.json({
      success: true,
      message: "Auto Poster settings saved successfully",
      data: {
        id: result.id,
        total_files: files.length,
        total_users: users.length,
        master_number: autoPosterData.master_number,
        //posts_created: createdPosts.length,
      //  ads_created: adsCreated // Return ads count
      },
      assignments: userFileAssignments,
      //ads_created: adsCreated // Also in main response
    });

  } catch (error) {
    console.error("❌ Save Auto Poster Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Rest of your existing functions remain the same...
exports.getRandomFiles = async (req, res) => {
  try {
    console.log("📥 GET RANDOM FILES REQUEST:", req.body);
    
    const { count } = req.body;
    
    if (!count || count <= 0) {
      return res.status(400).json({
        success: false,
        message: "Count parameter is required and must be greater than 0"
      });
    }
    
    const uploadDir = path.join(__dirname, "../../uploads/auto_poster_uploads");
    
    if (!fs.existsSync(uploadDir)) {
      console.log("📁 Upload directory does not exist:", uploadDir);
      return res.json({
        success: true,
        files: [],
        message: "Upload folder empty"
      });
    }

    // Read all files
    const allFiles = fs.readdirSync(uploadDir);
    console.log(`📁 Found ${allFiles.length} files in directory`);
    
    if (allFiles.length === 0) {
      return res.json({
        success: true,
        files: [],
        message: "No files available"
      });
    }

    // Shuffle and select random files
    const shuffledFiles = [...allFiles].sort(() => Math.random() - 0.5);
    const selectedFiles = shuffledFiles.slice(0, Math.min(count, shuffledFiles.length));

    console.log(`🎲 Selected ${selectedFiles.length} random files`);

    // Create file objects with full URLs
    const fileList = selectedFiles.map(file => ({
      name: file,
      url: `/uploads/auto_poster_uploads/${file}`,
      path: `/uploads/auto_poster_uploads/${file}`
    }));

    return res.json({
      success: true,
      files: fileList,
      total_selected: fileList.length,
      total_available: allFiles.length
    });

  } catch (error) {
    console.error("❌ Random files error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching random files"
    });
  }
};

exports.getAutoFiles = async (req, res) => {
  try {
	  
    const uploadDir = path.join(__dirname, "../../uploads/auto_poster_uploads");
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        files: [],
        message: "Upload folder empty"
      });
    }

    const allFiles = fs.readdirSync(uploadDir);
    
    const fileList = allFiles.map(file => ({
      name: file,
      url: `/uploads/auto_poster_uploads/${file}`,
      path: `/uploads/auto_poster_uploads/${file}`
    }));

    return res.json({
      success: true,
      files: fileList,
      total: fileList.length
    });

  } catch (error) {
    console.error("Error fetching auto files:", error);
    res.status(500).json({
      success: false,
      message: "Error reading files"
    });
  }
};

exports.getAutoPoster = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const item = await AutoPoster.findOne({ where: { id } });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "AutoPoster item not found",
      });
    }

    await AutoPoster.destroy({
      where: { id },
    });

    console.log("✅ Deleted AutoPoster item:", id);

    res.json({
      success: true,
      message: "Auto Poster item get successfully",
      item: item,
    });

  } catch (error) {
    console.error("❌ Delete AutoPoster Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateAutoPoster = async (req, res) => {
  try {


    const { id } = req.params;
    const { files, master_number, times, users } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const item = await AutoPoster.findOne({ where: { id } });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "AutoPoster item not found",
      });
    }


	const totalFilesNeeded = users.length * master_number;
    
	const uploadDir = path.join(__dirname, "../../uploads/auto_poster_uploads");
    
    if (!fs.existsSync(uploadDir)) {
      console.log("📁 Upload directory does not exist:", uploadDir);
      return res.json({
        success: true,
        files: [],
        message: "Upload folder empty"
      });
    }
const allFiles = fs.readdirSync(uploadDir);
    // Read all files
/*     
	
	
    if (allFiles.length < totalFilesNeeded) {
      return res.status(400).json({
        success: false,
        message: `Not enough files. Required: ${totalFilesNeeded}, Available: ${files.length}`
      });
    } */

    // STEP 1: Randomly assign files to users
    const userFileAssignments = {};
    const shuffledFiles = [...files].sort(() => Math.random() - 0.5);
    
    let fileIndex = 0;
    users.forEach(userId => {
      userFileAssignments[userId] = shuffledFiles.slice(fileIndex, fileIndex + master_number);
      fileIndex += master_number;
    });
	
	

    await AutoPoster.update(
      {
      files: JSON.stringify(files),
      master_number: parseInt(master_number),
      times: JSON.stringify(times),
      users: JSON.stringify(users),
      },
      { where: { id } }
    );

   /*  return res.status(200).json({
      success: true,
      message: "AutoPoster updated successfully",
    }); */
	
	    res.json({
      success: true,
      message: "Auto Poster settings saved successfully",
      data: {
        id: id,
        total_files: files.length,
        total_users: users.length,
        master_number: parseInt(master_number),
		times: JSON.stringify(times),
      },
      assignments: userFileAssignments,
    });

  } catch (error) {
    console.error("❌ Delete AutoPoster Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteAutoPoster = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const item = await AutoPoster.findOne({ where: { id } });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "AutoPoster item not found",
      });
    }

    await AutoPoster.destroy({
      where: { id },
    });

    console.log("✅ Deleted AutoPoster item:", id);

    res.json({
      success: true,
      message: "Auto Poster item deleted successfully",
      deleted_id: id,
    });

  } catch (error) {
    console.error("❌ Delete AutoPoster Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAutoPosterId = async (req, res) => {
  try {
    console.log("📥 Fetching AutoPoster list...");

	const limit = req.body.limit ? parseInt(req.body.limit) : null;
	const sort_order = req.body.sort_order || "DESC";

	const list = await AutoPoster.findOne({
  order: [["id", "DESC"]],
  raw: true,
});
console.log("📊 Auto poster records:", JSON.stringify(list, null, 2));

    if (!list || list.length === 0) {
      console.log("📭 No auto poster records found");
      return res.json({
        success: true,
        message: "No auto poster items found",
        data: [],
        total: 0
      });
    }

		const item = list;

		let files = [];
		let times = [];
		let users = [];

		// Parse files
		try {
		  if (item.files) {
			files = JSON.parse(item.files);
			if (Array.isArray(files)) {
			  files = files.map((f) =>
				typeof f === "string" ? f.replace(/\/\//g, "/") : f
			  );
			}
		  }
		} catch (e) {
		  console.log("❌ Files parse error:", e);
		  files = [];
		}

		// Parse times
		try {
		  if (item.times) times = JSON.parse(item.times);
		} catch (e) {
		  console.log("❌ Times parse error:", e);
		  times = [];
		}

		// Parse users
		try {
		  if (item.users) users = JSON.parse(item.users);
		} catch (e) {
		  console.log("❌ Users parse error:", e);
		  users = [];
		}
console.log('itemid',item.id);
		// Prepare final formatted object
		const formatted = {
		  id: item.id,
		  files: files,
		  master_number: item.master_number || 1,
		  times: times,
		  users: users,
		  status: item.status || "pending",
		  created_at: item.created_at || item.createdAt,
		  updated_at: item.updated_at || item.updatedAt,
		};


    console.log("✅ Successfully formatted auto poster list");

    res.json({
      success: true,
      message: "Auto poster list retrieved successfully",
      data: formatted,
      total: formatted.length
    });

  } catch (error) {
    console.error("❌ AutoPosterList Error:", error);
    console.error("❌ Error details:", error.message);
    
    res.status(500).json({
      success: false,
      message: "Failed to fetch auto poster list",
      error: error.message,
      data: []
    });
  }
};


exports.AutoPosterList = async (req, res) => {
  try {
    console.log("📥 Fetching AutoPoster list...");

    // Find all records
    const list = await AutoPoster.findAll({
      order: [["id", "DESC"]],
      raw: true,
    });

    console.log(`📊 Found ${list.length} auto poster records`);

    if (!list || list.length === 0) {
      console.log("📭 No auto poster records found");
      return res.json({
        success: true,
        message: "No auto poster items found",
        data: [],
        total: 0
      });
    }

    // Format the data WITHOUT user_assignments
    const formattedList = list.map((item) => {
      console.log(`📌 Processing item ${item.id}`);
      
      let files = [];
      let times = [];
      let users = [];

      try {
        // Parse files
        if (item.files) {
          files = JSON.parse(item.files);
          if (Array.isArray(files)) {
            files = files.map((f) => 
              typeof f === 'string' ? f.replace(/\/\//g, "/") : f
            );
          }
        }
      } catch (e) {
        console.log(`❌ Files parse error:`, e);
        files = [];
      }

      try {
        // Parse times
        if (item.times) {
          times = JSON.parse(item.times);
        }
      } catch (e) {
        console.log(`❌ Times parse error:`, e);
        times = [];
      }

      try {
        // Parse users
        if (item.users) {
          users = JSON.parse(item.users);
        }
      } catch (e) {
        console.log(`❌ Users parse error:`, e);
        users = [];
      }

      // Return WITHOUT user_assignments
      return {
        id: item.id,
        files: files,
        master_number: item.master_number || 1,
        times: times,
        users: users,
        status: item.status || "pending",
        created_at: item.created_at || item.createdAt,
        updated_at: item.updated_at || item.updatedAt
      };
    });

    console.log("✅ Successfully formatted auto poster list");

    res.json({
      success: true,
      message: "Auto poster list retrieved successfully",
      data: formattedList,
      total: formattedList.length
    });

  } catch (error) {
    console.error("❌ AutoPosterList Error:", error);
    console.error("❌ Error details:", error.message);
    
    res.status(500).json({
      success: false,
      message: "Failed to fetch auto poster list",
      error: error.message,
      data: []
    });
  }
};

console.log("✅ autoPoster.controller.js loaded successfully");
console.log("📌 Exported functions:");
console.log("  saveAutoPoster:", typeof exports.saveAutoPoster);
console.log("  getRandomFiles:", typeof exports.getRandomFiles);
console.log("  getAutoFiles:", typeof exports.getAutoFiles);
console.log("  deleteAutoPoster:", typeof exports.deleteAutoPoster);
console.log("  AutoPosterList:", typeof exports.AutoPosterList);
console.log("  getAutoPosterId:", typeof exports.getAutoPosterId);