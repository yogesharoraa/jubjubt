// // controllers/admin/ads.controller.js

// const updateFieldsFilter = require("../../helper/updateField.helper");
// const { generalResponse } = require("../../helper/response.helper");
// const { Op } = require("sequelize");

// const {
//   getAds,
//   getAd,
//   createAd,
//   updateAd,
//   toggleAdStatus,
//   deleteAd,
// } = require("../../service/repository/ad.service");
// const { getGlobalFrequency, updateGlobalFrequency } = require("../../service/repository/adFrequency.service");

// async function listAds_Admin(req, res) {
//   try {
//     const page = Number(req.body.page) || 1;
//     const limit = Number(req.body.pageSize) || 10;
//     const q = (req.body.q || "").trim();

//     const where = {
//       deleted_at: {
//         [Op.or]: [
//           { [Op.is]: null },
//           { [Op.gt]: new Date() }
//         ]
//       }
//     };

//     if (q) {
//       where[Op.or] = [
//         { title: { [Op.iLike]: `%${q}%` } },
//         { description: { [Op.iLike]: `%${q}%` } },
//         { sub_description: { [Op.iLike]: `%${q}%` } },
//         { target_url: { [Op.iLike]: `%${q}%` } },
//       ];
//     }
 
//     if (req.body.is_active !== undefined) {

//       where.is_active =
//         req.body.is_active === "1" ||
//         req.body.is_active === 1 ||
//         req.body.is_active === true ||
//         req.body.is_active === "true";
//     }
//     if (req.body.type) where.type = req.body.type;

//     const data = await getAds(where, { page, pageSize: limit });
//     return generalResponse(res, data, "Ads fetched successfully", true, false);
//   } catch (err) {
//     console.error("listAds_Admin error:", err);
//     return generalResponse(res, {}, "Error fetching ads", false, true, 500);
//   }
// }

// // controllers/admin/ads.controller.js

// async function createAd_Admin(req, res) {
//   try {
//     const { target_url, type, title, description, sub_description, position, priority } = req.body;

//     const { Ad, sequelize } = require("../../../models");

//     console.log("req.file:", req.file);
//     console.log("req.body.media_url:", req.body.media_url);

//     let media_url = null;

//     // File upload
//     if (req.file) {
//       const fileType = req.file.mimetype.includes("image") ? "images" : "videos";
//       media_url = `${req.protocol}://${req.get("host")}/uploads/ads/${fileType}/${req.file.filename}`;
//     }
//     // Manual media URL
//     else if (req.body.media_url?.trim()) {
//       media_url = req.body.media_url.trim();
//     } 
//     else {
//       return generalResponse(res, {}, "Please upload file or provide media_url", false, true, 400);
//     }

//     // deleted_at
//     let deleted_at_value = null;
//     if (req.body.deleted_at) {
//       deleted_at_value = new Date(req.body.deleted_at);
//     }

//     // const newPosition = Number(position);

//     // // -----------------------------------------
//     // // 🚀 AUTO SHIFT POSITION LOGIC ON CREATE
//     // // -----------------------------------------
//     // if (newPosition) {
//     //   console.log("📌 Creating new ad at position:", newPosition);

//     //   // Shift all ads DOWN by +1 starting from this position
//     //   // old: 3,4,5 → new: 4,5,6
//     //   await Ad.update(
//     //     { position: sequelize.literal("position + 1") },
//     //     {
//     //       where: {
//     //         position: { [Op.gte]: newPosition }
//     //       },
//     //       paranoid: false
//     //     }
//     //   );
//     // }
// const newPosition =
//   position !== undefined && position !== null && position !== ""
//     ? Number(position)
//     : null;

// // -----------------------------------------
// // 🚀 AUTO SHIFT POSITION LOGIC ON CREATE
// // (SHIFT ONLY IF POSITION IS EXPLICIT)
// // -----------------------------------------
// if (newPosition !== null) {
//   await Ad.update(
//     { position: sequelize.literal("position + 1") },
//     {
//       where: {
//         position: { [Op.gte]: newPosition }
//       },
//       paranoid: false
//     }
//   );
// }

//     // Create new ad after shifting others
//     const adData = {
//       target_url,
//       type,
//       media_url,
//       title,
//       description,
//       sub_description,
//       position: newPosition,
//       priority: Number(priority),
//       is_active: true,
//       deleted_at: deleted_at_value,
//       uploader_type: "admin"
//     };

//     const newAd = await Ad.create(adData);

//     return generalResponse(
//       res,
//       newAd,
//       "Ad created successfully",
//       true,
//       false
//     );
//   } catch (error) {
//     console.error("createAd_Admin error:", error);
//     return generalResponse(res, {}, error.message || "Failed to create ad", false, true);
//   }
// }



// async function updateAd_Admin(req, res) {
//   console.log("🧾 RAW BODY:", req.body);
//   console.log("🧾 RAW FILE:", req.file);

//   try {
//     if (!req?.authData?.admin_id)
//       return generalResponse(res, {}, "Forbidden", false, true, 401);

//     const { id } = req.body;
//     console.log("🔍 Updating Ad ID:", id);

//     if (!id) return generalResponse(res, {}, "Ad id is required", false, true);

//     const { Ad, sequelize } = require("../../../models");

//     // Fetch existing ad
//     const existingAd = await Ad.findByPk(id, { paranoid: false });
//     if (!existingAd) {
//       console.log("❌ Ad not found with ID:", id);
//       return generalResponse(res, {}, "Ad not found", false, false);
//     }

//     console.log("📋 Current ad data:", existingAd.toJSON());

//     const patch = {};
//     const fields = [
//       "title",
//       "description",
//       "sub_description",
//       "type",
//       "media_url",
//       "target_url",
//       "position",
//       "priority",
//       "is_active"
//     ];

//     let hasChanges = false;

//     fields.forEach(f => {
//       if (req.body[f] !== undefined && req.body[f] !== existingAd[f]) {
//         patch[f] = req.body[f];
//         console.log(`📝 Field ${f} changed:`, existingAd[f], "→", req.body[f]);
//         hasChanges = true;
//       }
//     });

//     // Handle file upload
//     if (req.file) {
//       const fileType = req.file.mimetype.includes("image") ? "images" : "videos";
//       patch.media_url = `${req.protocol}://${req.get(
//         "host"
//       )}/uploads/ads/${fileType}/${req.file.filename}`;
//       console.log("📁 New media URL:", patch.media_url);
//       hasChanges = true;
//     }

//     // Numeric fields
//     ["position", "priority"].forEach(k => {
//       if (patch[k] !== undefined) {
//         patch[k] = Number(patch[k]);
//         console.log(`🔢 Numeric field ${k}:`, patch[k]);
//       }
//     });

//     // Boolean field
//     if (patch.is_active !== undefined) {
//       patch.is_active = String(patch.is_active).toLowerCase() === "true";
//       console.log("🔘 is_active:", patch.is_active);
//     }

//     // Handle deleted_at
//     if (req.body.deleted_at !== undefined) {
//       const currentDeletedAt = existingAd.deleted_at;
//       const newDeletedAt =
//         req.body.deleted_at === "" || req.body.deleted_at === null
//           ? null
//           : new Date(req.body.deleted_at);

//       if (currentDeletedAt?.toISOString() !== newDeletedAt?.toISOString()) {
//         patch.deleted_at = newDeletedAt;
//         hasChanges = true;
//       }
//     }

//     // -----------------------------------------
//     // 🚀 AUTO SHIFT POSITION LOGIC
//     // -----------------------------------------
//     // if (req.body.position !== undefined) {
//     //   const newPosition = Number(req.body.position);
//     //   const oldPosition = existingAd.position;

//     //   console.log("📌 Position Change:", oldPosition, "→", newPosition);

//     //   if (newPosition !== oldPosition) {
//     //     // Shifting lower → higher (3 → 7)
//     //     if (newPosition > oldPosition) {
//     //       await Ad.update(
//     //         { position: sequelize.literal("position - 1") },
//     //         {
//     //           where: {
//     //             position: { [Op.gt]: oldPosition, [Op.lte]: newPosition },
//     //             id: { [Op.ne]: existingAd.id }
//     //           },
//     //           paranoid: false
//     //         }
//     //       );
//     //     }

//     //     // Shifting higher → lower (7 → 3)
//     //     else {
//     //       await Ad.update(
//     //         { position: sequelize.literal("position + 1") },
//     //         {
//     //           where: {
//     //             position: { [Op.gte]: newPosition, [Op.lt]: oldPosition },
//     //             id: { [Op.ne]: existingAd.id }
//     //           },
//     //           paranoid: false
//     //         }
//     //       );
//     //     }

//     //     patch.position = newPosition;
//     //     hasChanges = true;
//     //   }
//     // }
// // -----------------------------------------
// // 🚀 AUTO SHIFT POSITION LOGIC
// // (ONLY IF POSITION ACTUALLY CHANGED)
// // -----------------------------------------
// if (
//   req.body.position !== undefined &&
//   req.body.position !== null &&
//   req.body.position !== "" &&
//   Number(req.body.position) !== existingAd.position
// ) {
//   const newPosition = Number(req.body.position);
//   const oldPosition = existingAd.position;

//   if (newPosition > oldPosition) {
//     await Ad.update(
//       { position: sequelize.literal("position - 1") },
//       {
//         where: {
//           position: { [Op.gt]: oldPosition, [Op.lte]: newPosition },
//           id: { [Op.ne]: existingAd.id }
//         },
//         paranoid: false
//       }
//     );
//   } else {
//     await Ad.update(
//       { position: sequelize.literal("position + 1") },
//       {
//         where: {
//           position: { [Op.gte]: newPosition, [Op.lt]: oldPosition },
//           id: { [Op.ne]: existingAd.id }
//         },
//         paranoid: false
//       }
//     );
//   }

//   patch.position = newPosition;
//   hasChanges = true;
// }

//     // If no changes
//     if (!hasChanges) {
//       console.log("⚠️ No changes detected");
//       return generalResponse(res, {}, "No changes to update", true, false);
//     }

//     console.log("🎯 Final patch object:", patch);

//     // Update ad
//     const updatedAd = await existingAd.update(patch);
//     console.log("✅ Update successful:", updatedAd.toJSON());

//     return generalResponse(
//       res,
//       updatedAd.toJSON(),
//       "Ad Updated Successfully",
//       true,
//       false
//     );
//   } catch (error) {
//     console.error("❌ Update Ad Error:", error);
//     return generalResponse(
//       res,
//       {},
//       error.message || "Update failed",
//       false,
//       true
//     );
//   }
// }


// async function toggleAd_Admin(req, res) {
//   try {
//     if (!req?.authData?.admin_id) return generalResponse(res, {}, "Forbidden", false, true, 401);
    
//     const { id, is_active } = req.body;
//     console.log("🔘 Toggle Ad - ID:", id, "is_active:", is_active);
    
//     if (!id || typeof is_active === "undefined") return generalResponse(res, {}, "id and is_active are required", false, true);

//     const { Ad, sequelize } = require("../../../models");

//     // Find ad including soft-deleted ones (paranoid: false)
//     const existingAd = await Ad.findByPk(id, { paranoid: false });
    
//     if (!existingAd) {
//       console.log("❌ Ad not found with ID:", id);
//       return generalResponse(res, {}, "Ad not found", false, false);
//     }

//     console.log("📋 Current ad status:", existingAd.is_active);
    
//     // Convert to boolean - handle different input formats
//     const boolActive = String(is_active).toLowerCase() === 'true';
//     console.log("🔄 New status:", boolActive);

//     // Update using Sequelize
//     await existingAd.update({ is_active: boolActive });
    
//     console.log("✅ Status updated successfully");
    
//     return generalResponse(res, { 
//       id, 
//       is_active: boolActive,
//       title: existingAd.title
//     }, "Ad Status Updated", true, false);
    
//   } catch (error) {
//     console.error("❌ Error in toggleAd_Admin:", error);
//     return generalResponse(res, {}, error.message || "Something went wrong while toggling Ad!", false, true);
//   }
// }

// async function deleteAd_Admin(req, res) {
//   console.log("[deleteAd_Admin] Request:", req.body);
//   try {
//     const id = Number(req.body.id);
//     if (!id || isNaN(id)) {
//       return generalResponse(res, { status: 400, message: "Valid Ad ID is required" });
//     }

//     const existing = await getAd({ id });
//     if (!existing) {
//       return generalResponse(res, { status: 404, message: "Ad not found in database!" });
//     }

//     console.log("DELETING AD:", {
//       id,
//       is_active: existing.is_active,
//       deleted_at: existing.deleted_at,
//     });

//     const result = await deleteAd({ id });
//     console.log("DELETE RESULT:", result);

//   if (result > 0) {
//   return generalResponse(res, {}, "Ad permanently deleted", true, false, 200);
// } else {
//   return generalResponse(res, {}, "Delete failed: No rows affected", false, true, 500);
// }
//   } catch (err) {
//     console.error("ERROR IN deleteAd_Admin:", err);
//     return generalResponse(res, { status: 500, message: "Error deleting ad", error: err.message });
//   }
// }

// async function getFrequency_Admin(req, res) {
//   try {
//     console.log("📩 [Controller] getFrequency_Admin called");
//     const frequency = await getGlobalFrequency();
//     console.log("📊 [Controller] Current frequency:", frequency);
//     return generalResponse(res, { frequency }, "Frequency loaded", true, false);
//   } catch (error) {
//     console.error("❌ [Controller] getFrequency_Admin error:", error);
//     return generalResponse(res, { frequency: 5 }, "Using default", true, false);
//   }
// }

// async function updateFrequency_Admin(req, res) {
//   try {
//     console.log("📩 [Controller] updateFrequency_Admin called → req.body:", req.body);

//     let frequency = req.body.frequency;
//     if (!frequency) {
//       const fd = req.body;
//       frequency = fd.frequency || fd.get?.("frequency");
//     }

//     frequency = Number(frequency);
//     console.log("🧮 [Controller] Parsed frequency:", frequency);

//     if (!frequency || frequency < 1) {
//       console.log("⚠️ [Controller] Invalid frequency input");
//       return generalResponse(res, {}, "Frequency must be ≥ 1", false, true, 400);
//     }

//     const result = await updateGlobalFrequency(frequency);
//     console.log("✅ [Controller] Frequency updated result:", result);

//     return generalResponse(res, { frequency: result.frequency }, "Frequency saved", true, false);
//   } catch (error) {
//     console.error("❌ [Controller] updateFrequency_Admin error:", error);
//     return generalResponse(res, {}, "Failed to save", false, true, 500);
//   }
// }
// async function position(req, res) {
//   try {
//     const { position } = req.body;

//     if (!position) {
//       return generalResponse(res, {}, "Position is required", false, true, 400);
//     }

//     const { Ad } = require("../../../models");

//     const existingAd = await Ad.findOne({
//       where: { position: Number(position) },
//       paranoid: false // include soft-deleted too
//     });

//     if (existingAd) {
//       return generalResponse(res, { exists: true }, "Position already taken", true, false);
//     }

//     return generalResponse(res, { exists: false }, "Position available", true, false);

//   } catch (err) {
//     console.error("❌ Position Check Error:", err);
//     return generalResponse(res, {}, "Server error", false, true, 500);
//   }
// }

// module.exports = {
//   listAds_Admin,
//   createAd_Admin,
//   updateAd_Admin,
//   toggleAd_Admin,
//   deleteAd_Admin,
//   getFrequency_Admin,
//   updateFrequency_Admin,
//   position
// };
// controllers/admin/ads.controller.js

const updateFieldsFilter = require("../../helper/updateField.helper");
const { generalResponse } = require("../../helper/response.helper");
const { Op } = require("sequelize");

const {
  getAds,
  getAd,
  createAd,
  updateAd,
  toggleAdStatus,
  deleteAd,
} = require("../../service/repository/ad.service");
const { getGlobalFrequency, updateGlobalFrequency } = require("../../service/repository/adFrequency.service");

async function listAds_Admin(req, res) {
  try {
    const page = Number(req.body.page) || 1;
    const limit = Number(req.body.pageSize) || 10;
    const q = (req.body.q || "").trim();

    const where = {
      deleted_at: {
        [Op.or]: [
          { [Op.is]: null },
          { [Op.gt]: new Date() }
        ]
      }
    };

    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { sub_description: { [Op.iLike]: `%${q}%` } },
        { target_url: { [Op.iLike]: `%${q}%` } },
      ];
    }
 
    if (req.body.is_active !== undefined) {

      where.is_active =
        req.body.is_active === "1" ||
        req.body.is_active === 1 ||
        req.body.is_active === true ||
        req.body.is_active === "true";
    }
    if (req.body.type) where.type = req.body.type;

    const data = await getAds(where, { page, pageSize: limit });
    return generalResponse(res, data, "Ads fetched successfully", true, false);
  } catch (err) {
    console.error("listAds_Admin error:", err);
    return generalResponse(res, {}, "Error fetching ads", false, true, 500);
  }
}

// controllers/admin/ads.controller.js

async function createAd_Admin(req, res) {
  try {
    const { target_url, type, title, description, sub_description, position, priority } = req.body;

    const { Ad, sequelize } = require("../../../models");

    console.log("req.file:", req.file);
    console.log("req.body.media_url:", req.body.media_url);

    let media_url = null;

    // File upload
    if (req.file) {
      const fileType = req.file.mimetype.includes("image") ? "images" : "videos";
      media_url = `${req.protocol}://${req.get("host")}/uploads/ads/${fileType}/${req.file.filename}`;
    }
    // Manual media URL
    else if (req.body.media_url?.trim()) {
      media_url = req.body.media_url.trim();
    } 
    else {
      return generalResponse(res, {}, "Please upload file or provide media_url", false, true, 400);
    }

    // deleted_at
    let deleted_at_value = null;
    if (req.body.deleted_at) {
      deleted_at_value = new Date(req.body.deleted_at);
    }

    const newPosition =
      position !== undefined && position !== null && position !== ""
        ? Number(position)
        : null;

    // -----------------------------------------
    // 🚀 AUTO SHIFT POSITION LOGIC ON CREATE
    // (SHIFT FORWARD: If position exists, push it to +1)
    // -----------------------------------------
    if (newPosition !== null) {
      // Check if this position is already taken
      const existingAtPosition = await Ad.findOne({
        where: { position: newPosition },
        paranoid: false
      });

      // Only shift if position is occupied - push existing ads forward
      if (existingAtPosition) {
        console.log(`📌 Position ${newPosition} is occupied, shifting existing ads forward (+1)`);
        await Ad.update(
          { position: sequelize.literal("position + 1") },
          {
            where: {
              position: { [Op.gte]: newPosition }
            },
            paranoid: false
          }
        );
      }
    }

    // Create new ad after shifting others
    const adData = {
      target_url,
      type,
      media_url,
      title,
      description,
      sub_description,
      position: newPosition,
      priority: Number(priority),
      is_active: true,
      deleted_at: deleted_at_value,
      uploader_type: "admin"
    };

    const newAd = await Ad.create(adData);

    return generalResponse(
      res,
      newAd,
      "Ad created successfully",
      true,
      false
    );
  } catch (error) {
    console.error("createAd_Admin error:", error);
    return generalResponse(res, {}, error.message || "Failed to create ad", false, true);
  }
}



async function updateAd_Admin(req, res) {
  console.log("🧾 RAW BODY:", req.body);
  console.log("🧾 RAW FILE:", req.file);

  try {
    if (!req?.authData?.admin_id)
      return generalResponse(res, {}, "Forbidden", false, true, 401);

    const { id } = req.body;
    console.log("🔍 Updating Ad ID:", id);

    if (!id) return generalResponse(res, {}, "Ad id is required", false, true);

    const { Ad, sequelize } = require("../../../models");

    // Fetch existing ad
    const existingAd = await Ad.findByPk(id, { paranoid: false });
    if (!existingAd) {
      console.log("❌ Ad not found with ID:", id);
      return generalResponse(res, {}, "Ad not found", false, false);
    }

    console.log("📋 Current ad data:", existingAd.toJSON());

    const patch = {};
    const fields = [
      "title",
      "description",
      "sub_description",
      "type",
      "media_url",
      "target_url",
      "position",
      "priority",
      "is_active"
    ];

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
      const fileType = req.file.mimetype.includes("image") ? "images" : "videos";
      patch.media_url = `${req.protocol}://${req.get(
        "host"
      )}/uploads/ads/${fileType}/${req.file.filename}`;
      console.log("📁 New media URL:", patch.media_url);
      hasChanges = true;
    }

    // Numeric fields
    ["position", "priority"].forEach(k => {
      if (patch[k] !== undefined) {
        patch[k] = Number(patch[k]);
        console.log(`🔢 Numeric field ${k}:`, patch[k]);
      }
    });

    // Boolean field
    if (patch.is_active !== undefined) {
      patch.is_active = String(patch.is_active).toLowerCase() === "true";
      console.log("🔘 is_active:", patch.is_active);
    }

    // Handle deleted_at
    if (req.body.deleted_at !== undefined) {
      const currentDeletedAt = existingAd.deleted_at;
      const newDeletedAt =
        req.body.deleted_at === "" || req.body.deleted_at === null
          ? null
          : new Date(req.body.deleted_at);

      if (currentDeletedAt?.toISOString() !== newDeletedAt?.toISOString()) {
        patch.deleted_at = newDeletedAt;
        hasChanges = true;
      }
    }

    // -----------------------------------------
    // 🚀 AUTO SHIFT POSITION LOGIC ON UPDATE
    // (ONLY SHIFT IF MOVING TO AN OCCUPIED POSITION)
    // -----------------------------------------
    if (
      req.body.position !== undefined &&
      req.body.position !== null &&
      req.body.position !== "" &&
      Number(req.body.position) !== existingAd.position
    ) {
      const newPosition = Number(req.body.position);
      const oldPosition = existingAd.position;

      console.log("📌 Position Change:", oldPosition, "→", newPosition);

      // Check if new position is already occupied
      const existingAtNewPosition = await Ad.findOne({
        where: { 
          position: newPosition,
          id: { [Op.ne]: existingAd.id }
        },
        paranoid: false
      });

      // Only shift if new position is occupied - push existing ads forward
      if (existingAtNewPosition) {
        console.log(`📌 Position ${newPosition} is occupied, shifting existing ads forward (+1)`);
        await Ad.update(
          { position: sequelize.literal("position + 1") },
          {
            where: {
              position: { [Op.gte]: newPosition },
              id: { [Op.ne]: existingAd.id }
            },
            paranoid: false
          }
        );
      }
      // If moving away from old position, DO NOT shift anything back
      // Just leave the gap at old position

      patch.position = newPosition;
      hasChanges = true;
    }

    // If no changes
    if (!hasChanges) {
      console.log("⚠️ No changes detected");
      return generalResponse(res, {}, "No changes to update", true, false);
    }

    console.log("🎯 Final patch object:", patch);

    // Update ad
    const updatedAd = await existingAd.update(patch);
    console.log("✅ Update successful:", updatedAd.toJSON());

    return generalResponse(
      res,
      updatedAd.toJSON(),
      "Ad Updated Successfully",
      true,
      false
    );
  } catch (error) {
    console.error("❌ Update Ad Error:", error);
    return generalResponse(
      res,
      {},
      error.message || "Update failed",
      false,
      true
    );
  }
}


async function toggleAd_Admin(req, res) {
  try {
    if (!req?.authData?.admin_id) return generalResponse(res, {}, "Forbidden", false, true, 401);
    
    const { id, is_active } = req.body;
    console.log("🔘 Toggle Ad - ID:", id, "is_active:", is_active);
    
    if (!id || typeof is_active === "undefined") return generalResponse(res, {}, "id and is_active are required", false, true);

    const { Ad, sequelize } = require("../../../models");

    // Find ad including soft-deleted ones (paranoid: false)
    const existingAd = await Ad.findByPk(id, { paranoid: false });
    
    if (!existingAd) {
      console.log("❌ Ad not found with ID:", id);
      return generalResponse(res, {}, "Ad not found", false, false);
    }

    console.log("📋 Current ad status:", existingAd.is_active);
    
    // Convert to boolean - handle different input formats
    const boolActive = String(is_active).toLowerCase() === 'true';
    console.log("🔄 New status:", boolActive);

    // Update using Sequelize
    await existingAd.update({ is_active: boolActive });
    
    console.log("✅ Status updated successfully");
    
    return generalResponse(res, { 
      id, 
      is_active: boolActive,
      title: existingAd.title
    }, "Ad Status Updated", true, false);
    
  } catch (error) {
    console.error("❌ Error in toggleAd_Admin:", error);
    return generalResponse(res, {}, error.message || "Something went wrong while toggling Ad!", false, true);
  }
}

async function deleteAd_Admin(req, res) {
  console.log("[deleteAd_Admin] Request:", req.body);
  try {
    const id = Number(req.body.id);
    if (!id || isNaN(id)) {
      return generalResponse(res, { status: 400, message: "Valid Ad ID is required" });
    }

    const existing = await getAd({ id });
    if (!existing) {
      return generalResponse(res, { status: 404, message: "Ad not found in database!" });
    }

    console.log("DELETING AD:", {
      id,
      position: existing.position,
      is_active: existing.is_active,
      deleted_at: existing.deleted_at,
    });

    const result = await deleteAd({ id });
    console.log("DELETE RESULT:", result);

    // DO NOT SHIFT POSITIONS AFTER DELETE
    // Leave the gap at the deleted position
    // Other ads will keep their current positions

    if (result > 0) {
      return generalResponse(res, {}, "Ad permanently deleted", true, false, 200);
    } else {
      return generalResponse(res, {}, "Delete failed: No rows affected", false, true, 500);
    }
  } catch (err) {
    console.error("ERROR IN deleteAd_Admin:", err);
    return generalResponse(res, { status: 500, message: "Error deleting ad", error: err.message });
  }
}

async function getFrequency_Admin(req, res) {
  try {
    console.log("📩 [Controller] getFrequency_Admin called");
    const frequency = await getGlobalFrequency();
    console.log("📊 [Controller] Current frequency:", frequency);
    return generalResponse(res, { frequency }, "Frequency loaded", true, false);
  } catch (error) {
    console.error("❌ [Controller] getFrequency_Admin error:", error);
    return generalResponse(res, { frequency: 5 }, "Using default", true, false);
  }
}

async function updateFrequency_Admin(req, res) {
  try {
    console.log("📩 [Controller] updateFrequency_Admin called → req.body:", req.body);

    let frequency = req.body.frequency;
    if (!frequency) {
      const fd = req.body;
      frequency = fd.frequency || fd.get?.("frequency");
    }

    frequency = Number(frequency);
    console.log("🧮 [Controller] Parsed frequency:", frequency);

    if (!frequency || frequency < 1) {
      console.log("⚠️ [Controller] Invalid frequency input");
      return generalResponse(res, {}, "Frequency must be ≥ 1", false, true, 400);
    }

    const result = await updateGlobalFrequency(frequency);
    console.log("✅ [Controller] Frequency updated result:", result);

    return generalResponse(res, { frequency: result.frequency }, "Frequency saved", true, false);
  } catch (error) {
    console.error("❌ [Controller] updateFrequency_Admin error:", error);
    return generalResponse(res, {}, "Failed to save", false, true, 500);
  }
}
async function position(req, res) {
  try {
    const { position } = req.body;

    if (!position) {
      return generalResponse(res, {}, "Position is required", false, true, 400);
    }

    const { Ad } = require("../../../models");

    const existingAd = await Ad.findOne({
      where: { position: Number(position) },
      paranoid: false // include soft-deleted too
    });

    if (existingAd) {
      return generalResponse(res, { exists: true }, "Position already taken", true, false);
    }

    return generalResponse(res, { exists: false }, "Position available", true, false);

  } catch (err) {
    console.error("❌ Position Check Error:", err);
    return generalResponse(res, {}, "Server error", false, true, 500);
  }
}

module.exports = {
  listAds_Admin,
  createAd_Admin,
  updateAd_Admin,
  toggleAd_Admin,
  deleteAd_Admin,
  getFrequency_Admin,
  updateFrequency_Admin,
  position
};