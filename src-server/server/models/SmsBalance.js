module.exports = (sequelize, DataTypes) => {
  const SmsBalance = sequelize.define('SmsBalance', {
    smsBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    timeCreated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return SmsBalance;
};
