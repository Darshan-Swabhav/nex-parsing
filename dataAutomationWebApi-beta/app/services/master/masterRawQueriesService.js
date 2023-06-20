const { sequelize } = require('@nexsalesdev/master-data-model');
const settingsConfig = require('../../config/settings/settings-config');

function MasterRawQueriesService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function postMasterRawQueries(inputs) {
  const { sql } = inputs;
  const { replacements } = inputs;

  const result = await sequelize.query(sql, {
    replacements,
  });

  return result;
}

MasterRawQueriesService.prototype = {
  postMasterRawQueries,
};

module.exports = MasterRawQueriesService;
