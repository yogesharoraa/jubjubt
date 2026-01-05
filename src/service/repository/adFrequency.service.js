const { AdFrequency } = require("../../../models");

/**
 * GET Global Frequency (CREATE if not exists)
 */
const getGlobalFrequency = async () => {
  try {
    console.log("🔄 [Service] getGlobalFrequency called");

    let record = await AdFrequency.findByPk(1);
    console.log("🔍 [Service] findByPk(1) result:", record ? record.toJSON() : "No record");

    if (!record) {
      console.log("📝 [Service] Creating default AdFrequency record...");
      record = await AdFrequency.create({ id: 1, frequency: 5 });
      console.log("✅ [Service] CREATED default record:", record.toJSON());
    }

    return { frequency: record.frequency };
  } catch (error) {
    console.error("❌ [Service] Error in getGlobalFrequency:", error);
    throw error;
  }
};

/**
 * UPDATE Global Frequency
 */
const updateGlobalFrequency = async (frequency) => {
  try {
    console.log("🔄 [Service] updateGlobalFrequency called with:", frequency);

    const safeFrequency = Math.max(1, Math.floor(frequency));
    console.log("🧮 [Service] safeFrequency:", safeFrequency);

    // Find or create record
    let record = await AdFrequency.findByPk(1);

    if (record) {
      record.frequency = safeFrequency;
      await record.save();
      console.log("✅ [Service] Updated existing record:", record.toJSON());
    } else {
      record = await AdFrequency.create({ id: 1, frequency: safeFrequency });
      console.log("✅ [Service] Created new record:", record.toJSON());
    }

    return { frequency: record.frequency };
  } catch (error) {
    console.error("❌ [Service] Error in updateGlobalFrequency:", error);
    throw error;
  }
};


module.exports = {
  getGlobalFrequency,
  updateGlobalFrequency
};
