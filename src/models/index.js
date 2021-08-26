'use strict';

require('dotenv').config();
const userModel = require('./users.js');
const clothesModel = require('./clothesModel.js')
const foodModel = require('./foodModel.js')
const { Sequelize, DataTypes } = require('sequelize');

const POSTGRES_URI = process.env.NODE_ENV === 'test' ? 'sqlite:memory' : process.env.DATABASE_URL;

let sequelizeOptions = process.env.NODE_ENV === 'production' ? {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
} : {};

const sequelize = new Sequelize(POSTGRES_URI, sequelizeOptions);

module.exports = {
  db: sequelize,
  users: userModel(sequelize, DataTypes),
  food: foodModel(sequelize, DataTypes),
  clothes: clothesModel(sequelize, DataTypes),
}
