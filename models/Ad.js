// models/ad.js
module.exports = (sequelize, DataTypes) => {
  const Ad = sequelize.define('Ad', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uploader_type: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
    },
    uploader_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sub_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    target_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // action_button: {
    //   type: DataTypes.ENUM(
    //     'stream_now',
    //     'book_now',
    //     'learn_more',
    //     'get_tickets',
    //     'watch_now',
    //     'shop_now',
    //     'sign_up'
    //   ),
    //   allowNull: false,
    //   defaultValue: 'learn_more',
    // },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    frequency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    is_active: {
      type: DataTypes.BOOLEAN, // maps to TINYINT(1)
      allowNull: false,
      defaultValue: true,
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
  }, {
    tableName: 'ads',
    underscored: true,    // maps createdAt -> created_at, etc.
    timestamps: true,     // enables createdAt/updatedAt
    paranoid: true,       // uses deleted_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  Ad.associate = (models) => {
    // If you want the uploader relationship:
    // Ad.belongsTo(models.User, { foreignKey: 'uploader_id', as: 'uploader' });
  };

  return Ad;
};
