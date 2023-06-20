const db = require('@nexsalesdev/dataautomation-datamodel');

async function syncModels() {
  try {
    await db.sequelize.sync();
    console.log('Sync Successful');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

syncModels();
