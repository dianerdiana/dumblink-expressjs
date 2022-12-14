'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class links extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      links.belongsTo(models.linktrees, {
        as: 'links',
        foreignKey: {
          name: 'linktree_id',
        },
      });
    }
  }
  links.init(
    {
      id_link: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: DataTypes.STRING,
      url: DataTypes.STRING,
      linktree_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'links',
    }
  );
  return links;
};
