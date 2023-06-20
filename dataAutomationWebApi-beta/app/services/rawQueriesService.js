const { sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../config/settings/settings-config');

function RawQueriesService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function postRawQueries(inputs) {
  const { sql } = inputs;
  const { replacements } = inputs;

  // Query and relpacement for indexes

  // var sql = ' SELECT tablename, indexname, indexdef FROM '
  // sql += ' pg_indexes WHERE schemaname = :schemaName '
  // sql += ' ORDER BY tablename, indexname ';

  // var replacements = {
  //     schemaName: 'public'
  // };

  const result = await sequelize.query(sql, {
    replacements,
  });

  return result;
}

RawQueriesService.prototype = {
  postRawQueries,
};

module.exports = RawQueriesService;
