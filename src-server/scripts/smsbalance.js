const db = require('../server/models');

(async () => {
  try {
    await db.SmsBalance.sync({ alter: true }); // creates table if missing
    console.log(' SmsBalance table is ready');
  } catch (err) {
    console.error('Failed to create DeliveryReport table:', err);
    process.exit(1);
  }
})();
