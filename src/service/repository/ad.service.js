// services/admin/ads.service.js

const { Ad, sequelize } = require("../../../models");
const { Op } = require("sequelize");

/**
 * Normalize / coerce common filter fields coming in as strings
 */
function normalizeFilters(filterPayload = {}) {
  const f = { ...filterPayload };

  if (f.id != null) f.id = Number(f.id);
  if (f.uploader_id != null) f.uploader_id = Number(f.uploader_id);

  if (f.is_active !== undefined) {
    // handle true/false/"true"/"false"/1/0
    const v = String(f.is_active).toLowerCase();
    f.is_active = v === "true" || v === "1";
  }

  // allow simple "type" exact filter ('image'|'video') if given
  if (f.type && !["image", "video"].includes(String(f.type))) delete f.type;

  // build a LIKE search from q; we will remove q from where
  let searchWhere = undefined;
  if (f.q) {
    const q = String(f.q).trim();
    if (q) {
      searchWhere = {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { sub_description: { [Op.like]: `%${q}%` } },
          { target_url: { [Op.like]: `%${q}%` } },
        ],
      };
    }
    delete f.q;
  }

  return { where: f, searchWhere };
}

/**
 * Validate / coerce pagination
 */
function normalizePagination(pagination = {}) {
  const page = Math.max(1, Number(pagination.page || 1));
  const pageSize = Math.max(1, Number(pagination.pageSize || 10));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

/**
 * Safe order: only allow sorting by known columns (model field names)
 * Note: with Sequelize + underscored:true, the field names are JS-style (createdAt)
 */
function normalizeOrder(order = [['created_at','DESC']]) {
  const map = {
    created_at: 'created_at',
    updatedAt: 'updated_at',
    updated_at: 'updated_at',
    position: 'position',
    priority: 'priority',
    is_active: 'is_active',
    title: 'title',
  };
  const out = [];
  (order || []).forEach(([col, dir]) => {
    const c = map[String(col)] || 'created_at';
    const d = String(dir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    // use explicit SQL column to avoid alias/attribute confusion
    out.push([sequelize.col(`Ad.${c}`), d]);
  });
  return out.length ? out : [[sequelize.col('Ad.created_at'), 'DESC']];
}

/**
 * List ads with flexible filters, pagination, relations and ordering
 */
const getAds = async (
  filterPayload = {},
  pagination = { page: 1, pageSize: 10 },
  include = [],
  order = [["created_at", "DESC"]]
) => {
  try {
    console.log("🔄 getAds called with:", {
      filterPayload,
      pagination,
      order
    });

    const { where, searchWhere } = normalizeFilters(filterPayload);
    const { page, pageSize, offset } = normalizePagination(pagination);
    const safeOrder = normalizeOrder(order);

    const finalWhere = searchWhere ? { [Op.and]: [where, searchWhere] } : where;

    console.log("🔍 FINAL SQL WHERE CLAUSE:", JSON.stringify(finalWhere, null, 2));
    console.log("📄 PAGINATION:", { page, pageSize, offset });
    console.log("📊 ORDER:", safeOrder);

    const { rows, count } = await Ad.findAndCountAll({
      where: finalWhere,
      include: Array.isArray(include) ? include : [],
      offset,
      limit: pageSize,
      order: safeOrder,
      paranoid: false, // ✅ Temporary: Soft deleted bhi dikhaye
    });

    console.log("✅ DATABASE RESULT:", {
      totalCount: count,
      returnedRows: rows.length,
      firstRow: rows[0] ? {
        id: rows[0].id,
        title: rows[0].title,
        type: rows[0].type,
        is_active: rows[0].is_active,
        created_at: rows[0].created_at
      } : 'No rows'
    });

    return {
      Records: rows,
      Pagination: {
        total_pages: Math.ceil(count / pageSize),
        total_records: Number(count),
        current_page: Number(page),
        records_per_page: Number(pageSize),
      },
    };
  } catch (error) {
    console.error("❌ Could not retrieve ads:", {
      name: error?.name,
      message: error?.message,
      sql: error?.parent?.sql,
      sqlMessage: error?.parent?.sqlMessage,
    });
    throw new Error("Could not retrieve ads");
  }
};




/**
 * Get a single ad (by any condition)
 */
const getAd = async (condition = {}, include = []) => {
  try {
    const ad = await Ad.findOne({
      where: condition || {},
      include: Array.isArray(include) ? include : [],
      paranoid: false, // INCLUDE SOFT DELETED
    });
    return ad;
  } catch (error) {
    console.error("Could not retrieve ad:", error);
    throw error;
  }
};

/**
 * Create a new ad
 */
const createAd = async (payload) => {
  try {
    // Minimal coercion for numeric fields (optional)
    const toNum = (v, def) => (v === undefined ? def : Number(v));
    const normalized = {
      ...payload,
      position: toNum(payload.position, 1),
      priority: toNum(payload.priority, 0),
      frequency: toNum(payload.frequency, 5),
      is_active:
        payload.is_active !== undefined
          ? !!(String(payload.is_active).toLowerCase() === "true" || String(payload.is_active) === "1")
          : true,
    };

    const newAd = await Ad.create(normalized);
    return newAd;
  } catch (error) {
    console.error("Error creating ad:", error);
    throw error;
  }
};

/**
 * Update ad by condition
 * returns [affectedCount] just like Sequelize update
 */
const updateAd = async (patch, condition) => {
  try {
    const normalizedPatch = { ...patch };
    if (normalizedPatch.position !== undefined) normalizedPatch.position = Number(normalizedPatch.position);
    if (normalizedPatch.priority !== undefined) normalizedPatch.priority = Number(normalizedPatch.priority);
    if (normalizedPatch.frequency !== undefined) normalizedPatch.frequency = Number(normalizedPatch.frequency);
    if (normalizedPatch.is_active !== undefined) {
      normalizedPatch.is_active =
        String(normalizedPatch.is_active).toLowerCase() === "true" ||
        String(normalizedPatch.is_active) === "1";
    }

    const updated = await Ad.update(normalizedPatch, { where: condition });
    return updated; // [affectedRowCount]
  } catch (error) {
    console.error("Error updating ad:", error);
    throw error;
  }
};

/**
 * Toggle active status helper
 */
const toggleAdStatus = async (id, is_active) => {
  try {
    const updated = await Ad.update(
      {
        is_active:
          String(is_active).toLowerCase() === "true" || String(is_active) === "1",
      },
      { where: { id } }
    );
    return updated; // [affectedRowCount]
  } catch (error) {
    console.error("Error toggling ad status:", error);
    throw error;
  }
};

/**
 * Soft delete (paranoid:true model) or hard delete if model not paranoid
 * returns affected count
 */
const deleteAd = async (condition) => {
  try {
    // Ensure id is number
    if (condition.id != null) {
      condition.id = Number(condition.id);
    }

    const deleted = await Ad.destroy({
      where: condition,
      force: true, // PERMANENT DELETE
    });
    return deleted;
  } catch (error) {
    console.error("Error deleting ad:", error);
    throw error;
  }
};

module.exports = {
  getAds,
  getAd,
  createAd,
  updateAd,
  toggleAdStatus,
  deleteAd,
};
