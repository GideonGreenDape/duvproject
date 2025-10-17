// import { RATINGS } from '../constant';
const {RATINGS} = require('../constant')

module.exports = function (sequelize, DataTypes) {
  var Rating = sequelize.define(
    'Rating',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      entertainerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      eventEntertainerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      professionalism: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        defaultValue: null,
        validate: {
          max: RATINGS.UPPER_BOUND,
          min: RATINGS.LOWER_BOUND,
        },
      },
      accommodating: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        defaultValue: null,
        validate: {
          max: RATINGS.UPPER_BOUND,
          min: RATINGS.LOWER_BOUND,
        },
      },
      overallTalent: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        defaultValue: null,
        validate: {
          max: RATINGS.UPPER_BOUND,
          min: RATINGS.LOWER_BOUND,
        },
      },
      recommend: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        defaultValue: null,
        validate: {
          max: RATINGS.UPPER_BOUND,
          min: RATINGS.LOWER_BOUND,
        },
      },
      review: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      classMethods: {
        associate: function (models) {
          // associations can be defined here
          // Rating.belongsTo(models.User);
        },
      },
    }
  );
  return Rating;
};
