const _ = require('lodash');
const { User } = require('@nexsalesdev/dataautomation-datamodel');
const { Sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const settingsConfig = require('../../config/settings/settings-config');

const { Op } = Sequelize;

function UserSearchService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function search(_param, _userRole) {
  let param = _param;
  param = param.toLowerCase();

  const where = {
    [Op.or]: {
      firstName: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('firstName')),
        'LIKE',
        `%${param}%`,
      ),
      lastName: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('lastName')),
        'LIKE',
        `%${param}%`,
      ),
    },
  };

  if (_userRole) {
    where.role = {
      [Op.contains]: [_userRole],
    };
  }

  const result = await User.findAll({
    attributes: ['id', 'firstName', 'lastName', 'userName'],
    where: [where],
    order: [['firstName', 'ASC']],
  });

  return result;
}

async function validateUserRole(_userRole) {
  const validRoles = Object.values(USER_ROLES);
  const roleIndex = _.indexOf(validRoles, _userRole);
  if (roleIndex < 0) {
    throw new Error('Invalid User Role');
  }
}

UserSearchService.prototype = {
  search,
  validateUserRole,
};

module.exports = UserSearchService;
