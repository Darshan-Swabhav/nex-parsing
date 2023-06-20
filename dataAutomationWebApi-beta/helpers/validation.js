const _ = require('lodash');
const permissions = require('../config/settings/permissions.json');

module.exports = {
  validateObj: (validationObj, arrayOfName) => {
    const notFoundKeys = [];
    arrayOfName.forEach((keyName) => {
      if (!_.has(validationObj, keyName)) {
        notFoundKeys.push(keyName);
      }
    });
    return notFoundKeys;
  },
  removeNullKeysInObj: (validationObj) => {
    const newObject = _.omitBy(validationObj, _.isNil);
    return newObject;
  },
  checkPermissions: (userPermission, type) => {
    const requiredPermission = [].concat(permissions[type]);
    if (
      !requiredPermission.every((elem) => userPermission.indexOf(elem) > -1)
    ) {
      return false;
    }
    return true;
  },
};
