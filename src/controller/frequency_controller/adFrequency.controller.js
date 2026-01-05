// src/controller/Admin_controller/adFrequency.controller.js
const {
  getGlobalFrequency,
  updateGlobalFrequency,
} = require("../../service/repository/adFrequency.service");

// GET – Fetch global frequency
const getFrequency_Admin = async (req, res) => {
  try {
    console.log("📥 GET Frequency request received");
    
    const result = await getGlobalFrequency();
    
    console.log("✅ Frequency fetched successfully:", result);
    
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ getFrequency_Admin error:", error);
    
    // Fallback response
    return res.json({
      success: true,
      data: { frequency: 5 }, // Default value
    });
  }
};

// POST – Update global frequency
const updateFrequency_Admin = async (req, res) => {
  try {
    const { frequency } = req.body;
    
    console.log("📥 UPDATE Frequency request received:", { frequency });

    if (!frequency || isNaN(frequency) || frequency < 1) {
      return res.status(400).json({
        success: false,
        message: "Frequency must be a number ≥ 1",
      });
    }

    const result = await updateGlobalFrequency(parseInt(frequency));
    
    console.log("✅ Frequency updated successfully:", result);
    
    return res.json({
      success: true,
      message: "Frequency updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ updateFrequency_Admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update frequency",
    });
  }
};


module.exports = {
  getFrequency_Admin,
  updateFrequency_Admin,
};