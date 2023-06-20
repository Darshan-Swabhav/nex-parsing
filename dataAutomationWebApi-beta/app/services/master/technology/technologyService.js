const _ = require('lodash');
const { Sequelize, Technology } = require('@nexsalesdev/master-data-model');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;

function TechnologyService() {
  const config = settingsConfig.settings || {};

  this.config = config;
  this.logger = settingsConfig.logger || console;
}

/**
 *
 * @param {string}  userParam - Search param
 * @param {integer} limit - Fetch "limit" instances/rows
 * @param {integer} data - Skip "offset" instances/rows
 * @returns
 */
async function getTechnologies(data) {
  const result = [];
  let where = {};
  const { limit, offset } = data;
  let { userParam } = data;

  userParam = userParam.trim();

  if (!_.isEmpty(userParam)) {
    userParam = userParam.toLowerCase();

    where = {
      name: {
        [Op.like]: `%${userParam}%`,
      },
    };
  }

  const technologies = await Technology.findAll({
    attributes: ['name'],
    where,
    limit,
    offset,
    raw: true,
  });

  if (technologies.length) {
    technologies.forEach((technology) => {
      result.push(technology.name);
    });
  }

  return result;
}

TechnologyService.prototype = {
  getTechnologies,
};

module.exports = TechnologyService;
