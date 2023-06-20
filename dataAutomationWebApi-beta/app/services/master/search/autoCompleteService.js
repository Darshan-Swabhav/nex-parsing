const _ = require('lodash');
const settingsConfig = require('../../../config/settings/settings-config');

function AutoCompleteService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}
/**
 * search function takes array and string as input and returns all string of array which matches the given string
 * @param  {string} param - characters to search
 * @param  {[]} array - list of values to search characters in
 * @param  {string} comparisonKey - if the array contains object then the comparisonKey is the name of key in which the search will happen
 * @returns {[]} array of strings
 */
function search(param, array, comparisonKey) {
  const filteredArray = [];
  let regexTestResult;
  if (!param) {
    return array;
  }
  const regex = new RegExp(`.*${param}.*`, 'i');
  _.each(array, (element) => {
    if (comparisonKey) {
      regexTestResult = regex.test(element[comparisonKey]);
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
  const result = this.search(param, filteredData);

  return result;
}
AutoCompleteService.prototype = {
  search,
  filterDataDictionary,
};

module.exports = AutoCompleteService;
