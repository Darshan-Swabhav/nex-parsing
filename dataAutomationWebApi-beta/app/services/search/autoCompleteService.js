const _ = require('lodash');
const settingsConfig = require('../../config/settings/settings-config');

function AutoCompleteService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function search(param, array, comparisionKey) {
  const filteredArray = [];
  let regexTestResult;
  const regex = new RegExp(`.*${param}.*`, 'i');
  _.each(array, (element) => {
    if (comparisionKey) {
      regexTestResult = regex.test(element.comparisionKey);
    } else {
      regexTestResult = regex.test(element);
    }
    if (regexTestResult) {
      filteredArray.push(element);
    }
  });

  return filteredArray;
}

function filterDataDictionary(param, data, filterBy) {
  let filteredData = [];

  if (data.length === 0) {
    Object.keys(filterBy).forEach((key) => {
      filteredData = filteredData.concat(filterBy[key]);
    });
  } else {
    for (let index = 0; index < data.length; index += 1) {
      const filter = data[index];

      if (filterBy[filter]) {
        filteredData = filteredData.concat(filterBy[filter]);
      }
    }
  }

  filteredData = [...new Set(filteredData)];
  const result = search(param, filteredData);

  return result;
}
AutoCompleteService.prototype = {
  search,
  filterDataDictionary,
};

module.exports = AutoCompleteService;
