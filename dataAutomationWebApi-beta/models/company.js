'use strict';
const {
  Model
} = require('sequelize');
const { v4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Company.init({
    name: DataTypes.STRING,
    website: DataTypes.STRING,
    industry: DataTypes.STRING,
    subIndustry: DataTypes.STRING,
    revenue: DataTypes.STRING,
    size: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Company',
  });
  Company.beforeCreate(company => company.id = v4());
  return Company;
};