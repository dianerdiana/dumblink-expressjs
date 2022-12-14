'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class linktrees extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      linktrees.hasMany(models.links, {
        as: 'links',
        foreignKey: {
          name: 'linktree_id',
        },
      });

      linktrees.belongsTo(models.templates, {
        as: 'template',
        foreignKey: {
          name: 'template_id',
        },
      });
    }
  }
  linktrees.init(
    {
      id_linktree: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      unique_link: DataTypes.STRING,
      view_count: DataTypes.INTEGER,
      template_id: DataTypes.INTEGER,
      image: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      link_id: DataTypes.STRING,
    },
    {
      sequelize,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'linktrees',
    }
  );
  return linktrees;
};
