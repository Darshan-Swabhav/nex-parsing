const FilterHandler = require('@nexsalesdev/master-data-model/lib/services/filterHandler');
const SortHandler = require('@nexsalesdev/master-data-model/lib/services/sortHandler');
const { get, set } = require('lodash');

const {
  DataProcessorToolStats,
  Sequelize,
} = require('@nexsalesdev/master-data-model');

const settingsConfig = require('../../../../config/settings/settings-config');

function StatsService() {
  const config = settingsConfig.settings || {};

  this.config = config;
  this.logger = settingsConfig.logger || console.log;
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

async function postStats(stat) {
  try {
    this.logger.info(`[DATA_PROCESSOR_STATS_SERVICE] :: START :: Post Stat`);

    const result = await DataProcessorToolStats.create(stat);

    this.logger.info(
      `[DATA_PROCESSOR_STATS_SERVICE] :: COMPLETED :: POST Stat`,
    );
    return result;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_STATS_SERVICE] :: Error In Creating Stat error :: {${error}}`,
    );
    throw Error(error);
  }
}

async function getStats(inputs) {
  const { pagination, filter, sort } = inputs;

  const createdAtFilter = get(filter, 'createdAt.value', null);

  if (Array.isArray(createdAtFilter) && createdAtFilter.length === 1) {
    set(filter, 'createdAt.value', filter.createdAt.value[0]);
    const operator = get(filter, 'createdAt.operator', '');

    switch (operator) {
      case '>=':
        set(filter, 'createdAt.value', new Date(createdAtFilter));
        break;
      case '<=':
        set(
          filter,
          'createdAt.value',
          new Date(new Date(createdAtFilter).setHours(23, 59, 59, 999)),
        );
        break;
      default:
        break;
    }
  }

  // Pagination
  const { limit, offset } = pagination;

  // Where Clause
  let where = {};
  const filterColumnsMapping = {};
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  // Sort Clause
  const sortColumnsMapping = {};
  const customSortColumn = {};
  let order = [];
  order = this.sortHandler.buildOrderClause(
    sortColumnsMapping,
    customSortColumn,
    sort,
    order,
  );

  try {
    this.logger.info(`[DATA_PROCESSOR_STATS_SERVICE] :: START :: Get Stats`);

    const result = await DataProcessorToolStats.findAndCountAll({
      where,
      order,
      offset,
      limit,
      raw: true,
    });

    this.logger.info(
      `[DATA_PROCESSOR_STATS_SERVICE] :: COMPLETED :: get Stats`,
    );
    return result;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_STATS_SERVICE] :: Error In Get Stats :: {${error}}`,
    );
    throw Error(error);
  }
}

async function getStatUsers() {
  try {
    const result = [];
    this.logger.info(
      `[DATA_PROCESSOR_STATS_SERVICE] :: START :: Get Stat Users`,
    );

    const queryResponse = await DataProcessorToolStats.findAll({
      attributes: [
        Sequelize.fn('DISTINCT', Sequelize.col('createdBy')),
        'createdBy',
      ],
    });

    queryResponse.forEach((element) => {
      result.push(element.createdBy);
    });

    this.logger.info(
      `[DATA_PROCESSOR_STATS_SERVICE] :: COMPLETED :: Get Stat Users`,
    );
    return result;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_STATS_SERVICE] :: Error In Get Stat Users :: {${error}}`,
    );
    throw Error(error);
  }
}

StatsService.prototype = {
  postStats,
  getStats,
  getStatUsers,
};

module.exports = StatsService;
