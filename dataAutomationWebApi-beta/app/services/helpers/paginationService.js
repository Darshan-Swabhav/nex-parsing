const settingsConfig = require('../../config/settings/settings-config');

function PaginationService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function paginate(pageNo, pageSize) {
  const offset = pageNo * pageSize;
  const limit = pageSize;

  return {
    offset,
    limit,
  };
}

PaginationService.prototype = {
  paginate,
};

module.exports = PaginationService;
