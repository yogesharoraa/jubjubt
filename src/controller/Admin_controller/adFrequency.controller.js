// src/controller/Admin_controller/adFrequency.controller.js
const {
  getGlobalFrequency,
  updateGlobalFrequency,
} = require("../../service/repository/adFrequency.service");

// GET – Fetch global frequency
const getFrequency_Admin = async (req, res) => {
  try {
    const result = await getGlobalFrequency();
    return res.json({
      success: true,
      data: result, // { frequency: 5 }
    });
  } catch (error) {
    console.error("getFrequency_Admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch frequency",
    });
  }
};

// POST – Update global frequency
const updateFrequency_Admin = async (req, res) => {
  try {
    const { frequency } = req.body;

    if (!frequency || isNaN(frequency) || frequency < 1) {
      return res.status(400).json({
        success: false,
        message: "Frequency must be a number ≥ 1",
      });
    }

    const result = await updateGlobalFrequency(parseInt(frequency));
    return res.json({
      success: true,
      message: "Frequency updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("updateFrequency_Admin error:", error);
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