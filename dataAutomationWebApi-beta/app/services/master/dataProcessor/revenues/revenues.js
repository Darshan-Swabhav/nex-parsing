/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
const {
  Revenue,
  Sequelize,
  EmployeeRangeRevenueMap,
} = require('@nexsalesdev/master-data-model');
const settingsConfig = require('../../../../config/settings/settings-config');

const { Op } = Sequelize;

function RevenuesService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getRevenues(revenues) {
  try {
    this.logger.info(`[DATA_PROCESSOR_REVENUE_SERVICE] :: Get Revenues`);

    const res = await Revenue.findAll({
      attributes: ['revenue', 'revenueNx'],
      where: { revenue: { [Op.in]: revenues } },
      raw: true,
    });

    const revenuesResult = revenues.reduce((result, current) => {
      const found = res.find((item) => item.revenue === current);

      if (found) {
        result.push(found);
      } else {
        result.push({
          revenue: current,
          revenueNx: '',
        });
      }
      return result;
    }, []);

    this.logger.info(`[DATA_PROCESSOR_REVENUE_SERVICE] :: Fetched Revenues`);
    return revenuesResult;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_REVENUE_SERVICE] :: Error In Fetching Revenues error :: {${error}}`,
    );
    throw Error(error);
  }
}

function formatRevenues(data) {
  const res = {};

  res.revenue = data.revenue;
  res.revenueNx = data.revenueNx;

  return res;
}

async function findOrCreateRevenues(data) {
  const revenue = await Revenue.findOrCreate({
    where: { revenue: data.revenue },
    raw: true,
    defaults: {
      revenue: data.revenue,
      revenueNx: data.revenueNx,
    },
  });

  const [revenueData, isCreated] = revenue;

  const result = {};

  result.processedRevenue = formatRevenues(revenueData);
  result.isCreated = isCreated;
  return result;
}

async function updateRevenue(revenueToSearch, data) {
  const res = await Revenue.update(data, {
    where: {
      revenue: revenueToSearch,
    },
    returning: true,
    plain: true,
    raw: true,
  });

  const [, revenue] = res;

  const processedRevenue = formatRevenues(revenue);
  return processedRevenue;
}

async function postRevenues(revenues) {
  const revenuesResult = {
    failedRecords: {
      data: [],
      counts: 0,
    },
    existingMappingRecords: {
      data: [],
      counts: 0,
    },
    newMappingRecords: {
      data: [],
      counts: 0,
    },
  };

  try {
    this.logger.info(
      `[DATA_PROCESSOR_REVENUE_SERVICE] :: START :: Post revenues`,
    );

    let index;

    for (index = 0; index < revenues.length; index += 1) {
      if (!revenues[index].revenue || !revenues[index].revenueNx) {
        revenues[index].errMsg = 'Revenue & RevenueNx Must Be Specified';
        revenuesResult.failedRecords.data.push(revenues[index]);
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      const findOrCreateResult = await findOrCreateRevenues(revenues[index]);

      const { processedRevenue: findOrCreateResultRevenue, isCreated } =
        findOrCreateResult;

      if (isCreated) {
        revenuesResult.newMappingRecords.data.push(findOrCreateResultRevenue);
        continue;
      }

      // update revenue
      else {
        const { revenue } = findOrCreateResultRevenue;

        // eslint-disable-next-line no-await-in-loop
        const updatedRevenueResult = await updateRevenue(
          revenue,
          revenues[index],
        );

        revenuesResult.existingMappingRecords.data.push(updatedRevenueResult);
        continue;
      }
    }

    this.logger.info(
      `[DATA_PROCESSOR_REVENUE_SERVICE] :: COMPLETED :: POST revenues`,
    );

    revenuesResult.failedRecords.counts =
      revenuesResult.failedRecords.data.length;

    revenuesResult.existingMappingRecords.counts =
      revenuesResult.existingMappingRecords.data.length;

    revenuesResult.newMappingRecords.counts =
      revenuesResult.newMappingRecords.data.length;

    return revenuesResult;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_REVENUE_SERVICE] :: Error In Updating/Creating Revenues error :: {${error}}`,
    );
    throw Error(error);
  }
}

async function getEmployeeRangeRevenueMapping() {
  const employeeRangeRevenueMapping = await EmployeeRangeRevenueMap.findAll({
    attributes: ['employeeRange', 'revenue'],
  });

  return employeeRangeRevenueMapping;
}

RevenuesService.prototype = {
  getRevenues,
  postRevenues,
  getEmployeeRangeRevenueMapping,
};

module.exports = RevenuesService;
