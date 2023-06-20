/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
const {
  EmployeeSize,
  Sequelize,
  RevenueRangeEmployeeSizeMap,
} = require('@nexsalesdev/master-data-model');
const settingsConfig = require('../../../../config/settings/settings-config');

const { Op } = Sequelize;

function EmployeeSizesService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getEmployeeSizes(employeeSizes) {
  try {
    this.logger.info(`[DATA_PROCESSOR_SERVICE] :: Get EmployeeSizes`);

    const res = await EmployeeSize.findAll({
      attributes: ['employeeSize', 'employeeSizeNx'],
      where: { employeeSize: { [Op.in]: employeeSizes } },
      raw: true,
    });

    const employeeSizesResult = employeeSizes.reduce((acc, curr) => {
      const found = res.find((item) => item.employeeSize === curr);

      if (found) {
        acc.push(found);
      } else {
        acc.push({
          employeeSize: curr,
          employeeSizeNx: '',
        });
      }
      return acc;
    }, []);

    this.logger.info(`[DATA_PROCESSOR_SERVICE] :: Fetched EmployeeSizes`);
    return employeeSizesResult;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_SERVICE] :: Error In Fetching EmployeeSizes error :: {${error}}`,
    );
    throw Error(error);
  }
}

function formatEmployeeSizes(data) {
  const res = {};

  res.employeeSize = data.employeeSize;
  res.employeeSizeNx = data.employeeSizeNx;

  return res;
}

async function findOrCreateEmployeeSizes(data) {
  const employeeSize = await EmployeeSize.findOrCreate({
    where: { employeeSize: data.employeeSize },
    raw: true,
    defaults: {
      employeeSize: data.employeeSize,
      employeeSizeNx: data.employeeSizeNx,
    },
  });

  const [employeeSizeData, isCreated] = employeeSize;

  const result = {};

  result.processedEmployeeSize = formatEmployeeSizes(employeeSizeData);
  result.isCreated = isCreated;
  return result;
}

async function updateEmployeeSize(employeeSizeToSearch, data) {
  const res = await EmployeeSize.update(data, {
    where: {
      employeeSize: employeeSizeToSearch,
    },
    returning: true,
    plain: true,
    raw: true,
  });

  const [, employeeSize] = res;

  const processedIndustry = formatEmployeeSizes(employeeSize);
  return processedIndustry;
}

async function postEmployeeSizes(employeeSizes) {
  const employeeSizesResult = {
    failedRecords: {
      data: [],
    },
    existingMappingRecords: {
      data: [],
    },
    newMappingRecords: {
      data: [],
    },
  };

  try {
    this.logger.info(`[DATA_PROCESSOR_SERVICE] :: START :: Post employeeSizes`);

    let index;

    for (index = 0; index < employeeSizes.length; index += 1) {
      if (
        !employeeSizes[index].employeeSize ||
        !employeeSizes[index].employeeSizeNx
      ) {
        // employeeSizesResult.push(employeeSizes[index]);
        employeeSizes[index].errMsg =
          'EmployeeSize & EmployeeSizeNx Must Be Specified';
        employeeSizesResult.failedRecords.data.push(employeeSizes[index]);
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      const findOrCreateResult = await findOrCreateEmployeeSizes(
        employeeSizes[index],
      );

      const { processedEmployeeSize: findOrCreateResultIndustry, isCreated } =
        findOrCreateResult;

      if (isCreated) {
        employeeSizesResult.newMappingRecords.data.push(
          findOrCreateResultIndustry,
        );
        continue;
      }

      // update employeeSize
      else {
        const { employeeSize } = findOrCreateResultIndustry;

        // eslint-disable-next-line no-await-in-loop
        const updatedIndustryResult = await updateEmployeeSize(
          employeeSize,
          employeeSizes[index],
        );

        employeeSizesResult.existingMappingRecords.data.push(
          updatedIndustryResult,
        );
        continue;
      }
    }

    this.logger.info(
      `[DATA_PROCESSOR_SERVICE] :: COMPLETED :: POST employeeSizes`,
    );

    employeeSizesResult.failedRecords.counts =
      employeeSizesResult.failedRecords.data.length;

    employeeSizesResult.existingMappingRecords.counts =
      employeeSizesResult.existingMappingRecords.data.length;

    employeeSizesResult.newMappingRecords.counts =
      employeeSizesResult.newMappingRecords.data.length;

    return employeeSizesResult;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_SERVICE] :: Error In Updating/Creating EmployeeSizes error :: {${error}}`,
    );
    throw Error(error);
  }
}

async function getRevenueRangeEmployeeSizeMapping() {
  const revenueRangeEmployeeSizeMapping =
    await RevenueRangeEmployeeSizeMap.findAll({
      attributes: ['revenueRange', 'employeeSize'],
    });

  return revenueRangeEmployeeSizeMapping;
}

EmployeeSizesService.prototype = {
  getEmployeeSizes,
  postEmployeeSizes,
  getRevenueRangeEmployeeSizeMapping,
};

module.exports = EmployeeSizesService;
