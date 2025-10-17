'use strict';

const { Rating } = require('./');

module.exports = function (sequelize, DataTypes) {
  var EventEntertainer = sequelize.define(
    'EventEntertainer',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      entertainerType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        validate: { isIn: [['MC', 'DJ', 'Liveband', null]] },
      },
      placeOfEvent: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      genre: {
        type: DataTypes.STRING,
      },
      language: {
        type: DataTypes.STRING,
      },
      expectedAudienceSize: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ageGroup: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lowestBudget: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      highestBudget: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      specialRequest: {
        type: DataTypes.TEXT,
      },
      auctionStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      auctionEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      hireType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Auction',
        validate: { isIn: [['Search', 'Auction', 'Recommendation', null]] }, // null to be used for freestyle
      },
      hiredDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      hiredEntertainer: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cancelled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      cancelledDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelledReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      classMethods: {
        associate: function (models) {
          // associations can be defined here
          // models.EventEntertainer.belongsTo(models.User);
        },
      },
    }
  );
  return EventEntertainer;
};
