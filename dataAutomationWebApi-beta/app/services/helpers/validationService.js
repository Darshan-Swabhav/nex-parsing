const _ = require('lodash');
const permissions = require('../../config/settings/permissions.json');
const settingsConfig = require('../../config/settings/settings-config');

function ValidationService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function validateObj(validationObj, requiredKeys) {
  const existingKeys = Object.keys(validationObj);
  return _.difference(requiredKeys, existingKeys);
}

function removeNullKeysInObj(validationObj) {
  const newObject = _.omitBy(validationObj, _.isNil);
  return newObject;
}

function checkPermissions(userPermission, type) {
  const requiredPermission = [].concat(permissions[type]);
  if (!requiredPermission.every((elem) => userPermission.indexOf(elem) > -1)) {
    return false;
  }
  return true;
}

ValidationService.prototype = {
  validateObj,
  removeNullKeysInObj,
  checkPermissions,
};

module.exports = ValidationService;
