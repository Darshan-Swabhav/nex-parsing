const masterDB = require('@nexsalesdev/master-data-model');

async function dropModels() {
  try {
    await masterDB.sequelize.drop({
      cascade: true,
    });
    console.log('[MasterDB]: Drop Successful');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  try {
    await masterDB.sequelize.query('DELETE FROM "SequelizeMeta";');
  } catch (error) {
    console.log('[MasterDB]: SequelizeMeta table does not exist');
  }
  try {
    await masterDB.sequelize.query('DELETE FROM "SequelizeData";');
  } catch (error) {
    console.log('[MasterDB]: SequelizeData table does not exist');
  }
}

dropModels();
