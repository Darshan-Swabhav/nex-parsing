const db = require('@nexsalesdev/dataautomation-datamodel');

async function dropModels() {
  try {
    await db.sequelize.drop({
      cascade: true,
    });
    console.log('Drop Successful');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  try {
    await db.sequelize.query('DELETE FROM "SequelizeMeta";');
  } catch (error) {
    console.log('SequelizeMeta table does not exist');
  }
  try {
    await db.sequelize.query('DELETE FROM "SequelizeData";');
  } catch (error) {
    console.log('SequelizeData table does not exist');
  }
}

dropModels();
