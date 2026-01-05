// models/auto_poster.js - Update the model
module.exports = (sequelize, DataTypes) => {
  const AutoPoster = sequelize.define(
    "AutoPoster",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      files: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      master_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      times: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      users: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
     /*  user_assignments: {
        type: DataTypes.TEXT("long"), // Add this column
        allowNull: true,
      }, */
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "auto_poster",
      underscored: true,
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  return AutoPoster;
};