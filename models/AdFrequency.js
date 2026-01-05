

'use strict';

module.exports = (sequelize, DataTypes) => {
  const AdFrequency = sequelize.define(
    "AdFrequency",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      frequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
          min: 1,
          isInt: true
        }
      },
    },
    {
      tableName: "ad_frequencies",
      timestamps: true, // Adds createdAt and updatedAt
      underscored: false, // Use camelCase for timestamps
    }
  );

  // Log when model is loaded
  console.log("✅ AdFrequency model defined successfully");
  
  return AdFrequency;
};