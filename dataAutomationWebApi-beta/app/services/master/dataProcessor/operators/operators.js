const _ = require('lodash');
const { Operation } = require('@nexsalesdev/master-data-model');

const settingsConfig = require('../../../../config/settings/settings-config');

function OperationsService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getOperators(type) {
  const result = {};

  try {
    this.logger.info(`[DATA_PROCESSOR_SERVICE] :: Get Operators`);

    const operators = await Operation.findAll({
      attributes: ['name', 'columnNames', 'processData', 'type'],
      where: { type },
      raw: true,
    });

    if (operators.length) {
      let processData = [];

      operators.forEach((operator) => {
        result[operator.name] = {};
        result[operator.name].columnNames = operator.columnNames;

        processData = operator.processData
          ? operator.processData
          : operator.name;

        processData = _.isString(processData)
          ? processData.split()
          : processData;

        result[operator.name].processColumns = processData;
      });
    }

    this.logger.info(`[DATA_PROCESSOR_SERVICE] :: Fetched Operators`);
    return result;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_SERVICE] :: Error In Fetching Operators error :: {${error}}`,
    );
    throw new Error(error);
  }
}

OperationsService.prototype = {
  getOperators,
};

module.exports = OperationsService;
