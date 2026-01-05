const { Ad } = require("../../../models");
const { Op } = require("sequelize");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { generalResponse } = require("../../helper/response.helper");

const {
  getAds,
  getAd,
  createAd,
  updateAd,
  toggleAdStatus,
  deleteAd,
} = require("../../service/repository/ad.service");


async function get_AdsList(req, res) {
  try {
    console.log("🟢 get_AdsList called (User Ads Manager)");

    const { page = 1, limit = 10, q = "", type, userId } = req.body;

    const offset = (page - 1) * limit;
    const now = new Date();

    let where = {
      uploader_id: userId,  // ✔ user ke ads hi
    };

    // 👉 Show only active ads:
    // deleted_at IS NULL  OR  deleted_at > now()
    where.deleted_at = {
      [Op.or]: [
        { [Op.is]: null },
        { [Op.gt]: now }
      ]
    };

    // 🔍 Search filter
    if (q.trim()) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { sub_description: { [Op.iLike]: `%${q}%` } },
        { target_url: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // 🎞 Type filter
    if (type) {
      where.type = type;
    }

    const { count, rows } = await Ad.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
paranoid: false,
    });

    return res.json({
      success: true,
      data: {
        ads: rows,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error("❌ Error fetching ads:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching ads.",
    });
  }
}


async function createAd_user(req, res) {
  try {
    const { target_url, type, title, description, sub_description, position, priority, uploader_id } = req.body;
    
    console.log("req.file:", req.file); // Debug
    console.log("req.body.media_url:", req.body.media_url);

    let media_url = null;
    if (req.file) {
      const fileType = req.file.mimetype.includes('image') ? 'images' : 'videos';
      media_url = `${req.protocol}://${req.get("host")}/uploads/ads/${fileType}/${req.file.filename}`;
    } else if (req.body.media_url?.trim()) {
      media_url = req.body.media_url.trim();
    } else {
      return generalResponse(res, {}, "Please upload file or provide media_url", false, true, 400);
    }
    let deleted_at_value = null;
    if (req.body.deleted_at) {
      deleted_at_value = new Date(req.body.deleted_at);
    }

    const adData = {
      target_url,
      type,
      media_url,
      title,
      description,
      sub_description,
      position: Number(position),
      priority: Number(priority),
      is_active: false,
      deleted_at: deleted_at_value,
      uploader_type: "user",
      uploader_id:Number(uploader_id)
    };

    const newAd = await createAd(adData);
    return generalResponse(res, { id: newAd.id, ...adData }, "Ad created successfully", true, false);
  } catch (error) {
    console.error("createAd_Admin error:", error);
    return generalResponse(res, {}, error.message || "Failed to create ad", false, true);
  }
}

async function deleteAd_User(req, res) {
  console.log("🟢 [deleteAd_User] Request:", req.body);
  
  try {
    const { id } = req.body;
    
    // Validate ID
    if (!id) {
      return generalResponse(res, {}, "Ad ID is required", false, true, 400);
    }

    const adId = Number(id);
    if (isNaN(adId)) {
      return generalResponse(res, {}, "Valid Ad ID is required", false, true, 400);
    }

    // Check if ad exists
    const existingAd = await getAd({ id: adId });
    if (!existingAd) {
      return generalResponse(res, {}, "Ad not found", false, true, 404);
    }

    console.log("🗑️ DELETING AD:", {
      id: adId,
      title: existingAd.title,
      is_active: existingAd.is_active,
      deleted_at: existingAd.deleted_at,
    });

    // Delete the ad
    const result = await deleteAd({ id: adId });
    console.log("✅ DELETE RESULT:", result);

    if (result > 0) {
      return generalResponse(res, { id: adId }, "Ad deleted successfully", true, false, 200);
    } else {
      return generalResponse(res, {}, "Failed to delete ad", false, true, 500);
    }
  } catch (err) {
    console.error("❌ ERROR IN deleteAd_User:", err);
    return generalResponse(res, {}, err.message || "Internal server error while deleting ad", false, true, 500);
  }
}
async function updateAd_User(req, res) {
  console.log("🧾 RAW BODY:", req.body);
  console.log("🧾 RAW FILE:", req.file);
  
  try {
    
    const { id } = req.body;
    console.log("🔍 Updating Ad ID:", id);
    
    if (!id) return generalResponse(res, {}, "Ad id is required", false, true);

    const { Ad, sequelize } = require("../../../models");

    // DEBUG: Check what happens with different query methods
    console.log("🔎 Checking ad with different methods:");
    
    // Method 1: Regular findByPk (respects paranoid)
    const ad1 = await Ad.findByPk(id);
    console.log("1. findByPk result:", ad1 ? "Found" : "Not found");
    
    // Method 2: findByPk with paranoid false
    const ad2 = await Ad.findByPk(id, { paranoid: false });
    console.log("2. findByPk (paranoid: false) result:", ad2 ? "Found" : "Not found");
    if (ad2) {
      console.log("   Ad data:", JSON.stringify(ad2.toJSON(), null, 2));
      console.log("   deleted_at value:", ad2.deleted_at);
    }
    
    // Method 3: Raw query to see what's really in DB
    const [rawAd] = await sequelize.query(
      'SELECT * FROM ads WHERE id = ?', 
      { replacements: [id] }
    );
    console.log("3. Raw SQL result:", rawAd.length > 0 ? "Found" : "Not found");
    if (rawAd.length > 0) {
      console.log("   Raw ad data:", rawAd[0]);
    }

    // Use the ad with paranoid disabled for update
    const existingAd = await Ad.findByPk(id, { paranoid: false });
    
    if (!existingAd) {
      console.log("❌ Ad not found with ID:", id);
      return generalResponse(res, {}, "Ad not found", false, false);
    }

    console.log("📋 Current ad data:", existingAd.toJSON());

    const patch = {};
    const fields = ["title", "description", "sub_description", "type", "media_url", "target_url", "position", "priority", "is_active"];
    
    let hasChanges = false;
    fields.forEach(f => { 
      if (req.body[f] !== undefined && req.body[f] !== existingAd[f]) {
        patch[f] = req.body[f];
        console.log(`📝 Field ${f} changed:`, existingAd[f], "→", req.body[f]);
        hasChanges = true;
      }
    });

    // Handle file upload
    if (req.file) {
      const fileType = req.file.mimetype.includes('image') ? 'images' : 'videos';
      patch.media_url = `${req.protocol}://${req.get("host")}/uploads/ads/${fileType}/${req.file.filename}`;
      console.log("📁 New media URL:", patch.media_url);
      hasChanges = true;
    }

    // Handle numeric fields
    ['position', 'priority'].forEach(k => { 
      if (patch[k] !== undefined) {
        patch[k] = Number(patch[k]);
        console.log(`🔢 Numeric field ${k}:`, patch[k]);
      }
    });
    
    // Handle boolean field
    if (patch.is_active !== undefined) {
      patch.is_active = String(patch.is_active).toLowerCase() === "true";
      console.log("🔘 is_active:", patch.is_active);
    }

    // Handle deletion - check current vs new deleted_at
    if (req.body.deleted_at !== undefined) {
      const currentDeletedAt = existingAd.deleted_at;
      const newDeletedAt = req.body.deleted_at === "" || req.body.deleted_at === null ? null : new Date(req.body.deleted_at);
      
      console.log("🗑️ Deletion check:");
      console.log("   Current deleted_at:", currentDeletedAt);
      console.log("   New deleted_at:", newDeletedAt);
      console.log("   Equal?", currentDeletedAt?.toISOString() === newDeletedAt?.toISOString());
      
      if (currentDeletedAt?.toISOString() !== newDeletedAt?.toISOString()) {
        patch.deleted_at = newDeletedAt;
        console.log("🗑️ deleted_at changed:", currentDeletedAt, "→", newDeletedAt);
        hasChanges = true;
      }
    }

    // If no changes, return early
    if (!hasChanges) {
      console.log("⚠️ No changes detected");
      return generalResponse(res, {}, "No changes to update", true, false);
    }

    console.log("🎯 Final patch object:", patch);

    // Update with paranoid disabled
    const updatedAd = await existingAd.update(patch);
    console.log("✅ Update successful:", updatedAd.toJSON());

    return generalResponse(res, updatedAd.toJSON(), "Ad Updated Successfully", true, false);
      
  } catch (error) {
    console.error("❌ Update Ad Error:", error);
    return generalResponse(res, {}, error.message || "Update failed", false, true);
  }
}
// Make sure to export both functions
module.exports = {
  get_AdsList,
  createAd_user,
  deleteAd_User,
  updateAd_User
};