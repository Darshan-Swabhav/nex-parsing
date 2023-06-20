const masterDb = require('@nexsalesdev/master-data-model');

async function syncModels() {
  try {
    await masterDb.sequelize.sync();
    console.log('[MasterDB]: Sync Successful');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

syncModels();
