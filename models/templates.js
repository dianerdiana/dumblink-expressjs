'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class templates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  templates.init(
    {
      id_template: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      template_name: DataTypes.STRING,
    },
    {
      sequelize,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'templates',
    }
  );
  return templates;
};
