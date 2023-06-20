const { DateTime } = require('luxon');
const settingsConfig = require('../../config/settings/settings-config');

function DateFormatterService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function convertDateToHumanReadableString(_date, getTime = false) {
  let date = _date;
  if (!date) {
    return date;
  }
  date = new Date(date).toISOString();
  date = DateTime.fromISO(date);
  date = date.setZone('Asia/Kolkata');
  let humanReadableDate = date.toFormat('LL/dd/yyyy');
  if (getTime) {
    humanReadableDate = {
      date: humanReadableDate,
      time: date.toFormat('T'),
    };
  }
  return humanReadableDate;
}

DateFormatterService.prototype = {
  convertDateToHumanReadableString,
};

module.exports = DateFormatterService;
