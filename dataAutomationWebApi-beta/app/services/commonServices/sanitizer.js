/* eslint-disable global-require */
/* eslint-disable no-use-before-define */

const _ = require('lodash');
const settingsConfig = require('../../config/settings/settings-config');

function SanitizeObjects() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function sanitize(objectProps) {
  const object = objectProps;

  if (object && object.firstName) {
    object.firstName = object.firstName
      .toLowerCase()
      .replace(/\b(\w)/g, (s) => s.toUpperCase());
  }

  if (object && object.middleName) {
    object.middleName = object.middleName
      .toLowerCase()
      .replace(/\b(\w)/g, (s) => s.toUpperCase());
  }

  if (object && object.lastName) {
    object.lastName = object.lastName
      .toLowerCase()
      .replace(/\b(\w)/g, (s) => s.toUpperCase());
  }

  if (object && object.email) {
    object.email = object.email.toLowerCase();
  }

  if (object && object.genericEmail) {
    object.genericEmail = object.genericEmail.toLowerCase();
  }

  if (_.isString(object)) return sanitizeString(object);
  if (_.isArray(object)) return sanitizeArray(object);
  if (_.isPlainObject(object)) return sanitizeObject(object);

  return object;
}

// TODO: Remove isProvided Function
// eslint-disable-next-line no-unused-vars
function isProvided(_value) {
  // ************ For Removing Keys Having Null and Empty Values ************
  // const typeIsNotSupported =
  //   !_.isNull(value) &&
  //   !_.isString(value) &&
  //   !_.isArray(value) &&
  //   !_.isPlainObject(value);
  // return typeIsNotSupported || !_.isEmpty(value);
  // ************************************************************************
  return true;
}

function sanitizeString(string) {
  return _.isEmpty(string) ? null : string.trim();
}

function sanitizeArray(array) {
  return _.filter(_.map(array, sanitize), isProvided);
}

function sanitizeObject(object) {
  return _.pickBy(_.mapValues(object, sanitize), isProvided);
}

SanitizeObjects.prototype = {
  sanitize,
};

module.exports = SanitizeObjects;
