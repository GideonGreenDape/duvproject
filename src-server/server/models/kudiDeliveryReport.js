'use strict';
module.exports = function (sequelize, DataTypes) {
  const DeliveryReport = sequelize.define(
    'DeliveryReport',
    {
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      api_reference: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
      },
      cost: {
        type: DataTypes.STRING,
      },
      recipient: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      time: {
        type: DataTypes.DATE,
      },
      network: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      vendor: {
        type: DataTypes.STRING,
      },
    },
    {
      classMethods: {
        associate: function (models) {
          // Example: if you have a Message or User model to relate it to
          // DeliveryReport.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        },
      },
    }
  );
  return DeliveryReport;
};
