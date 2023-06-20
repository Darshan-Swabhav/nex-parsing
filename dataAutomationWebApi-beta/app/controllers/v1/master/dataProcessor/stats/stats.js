const errors = require('throw.js');
const _ = require('lodash');
const { serializeError } = require('serialize-error');
const FilterHandler = require('@nexsalesdev/master-data-model/lib/services/filterHandler');
const SortHandler = require('@nexsalesdev/master-data-model/lib/services/sortHandler');
const StatsService = require('../../../../../services/master/dataProcessor/stats/stats');
const errorMessages = require('../../../../../config/error.config.json');
const PaginationService = require('../../../../../services/helpers/paginationService');
const {
  GENERALIZED_FILTERS_OPERATOR,
  GENERALIZED_FILTERS_TYPE,
} = require('../../../../../constant');

function StatsController() {
  this.statsService = new StatsService();
  this.paginationService = new PaginationService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

/**
 *
 * @openapi
 *
 * definitions:
 *   stat:
 *    properties:
 *      id:
 *        type : string
 *        format: uuid
 *      fileName:
 *        type: string
 *      category:
 *        type: string
 *      subCategory:
 *        type: string
 *      totalRecords:
 *        type: string
 *      successCounts:
 *        type: string
 *      failedCounts:
 *        type: string
 *      systemMappedCount:
 *        type: string
 *      newlyMappedCount:
 *        type: string
 *      missingRequiredColumnCount:
 *        type: string
 *      startTime:
 *        type: string
 *        format: date-time
 *      endTime:
 *        type: string
 *        format: date-time
 *      createdBy:
 *        type: string
 *      createdAt:
 *        type: string
 *        format: date-time
 *      updatedAt:
 *        type: string
 *        format: date-time
 *
 * /master/dataProcessor/stat:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postStat
 *     tags:
 *        - Data Processor
 *     description: This is stats route which creates the stat
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: stat
 *         required: true
 *         description: "stat body"
 *         schema:
 *            $ref: '#/definitions/stat'
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: successfully created
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/dataProcessor/stats:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getStats
 *     tags:
 *        - Data Processor
 *     description: This is stats route which fetches the stats
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: pageNumber
 *         in: query
 *         description: Page number
 *         required: false
 *         type: integer
 *       - name: pageSize
 *         in: query
 *         description: Page size
 *         required: false
 *         type: integer
 *       - name: filter
 *         in: query
 *         description: Filter by keyword
 *         required: false
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: successfully created
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/dataProcessor/stats/users:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getStatUsers
 *     tags:
 *        - Data Processor
 *     description: This is userStats route which fetches the user email address
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: successfully created
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function checkMandatoryKeys(data, mandatoryKeys) {
  const missingStatsKeys = [];
  mandatoryKeys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      missingStatsKeys.push(key);
    }
  });

  return missingStatsKeys;
}

async function postStats(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const { stat } = req.body;

    if (!stat || !_.isObject(stat)) {
      throw new Error('Stat Is Missing Or Bad DataType');
    }

    const mandatoryStatKeys = [
      'createdBy',
      'source',
      'category',
      'subCategory',
      'totalRecords',
      'successCounts',
      'failedCounts',
      'startTime',
      'endTime',
    ];

    const missingStatsKeys = checkMandatoryKeys(stat, mandatoryStatKeys);

    if (missingStatsKeys.length) {
      throw new Error(`Missing Stats Keys ${missingStatsKeys.join(', ')}`);
    }

    logger.info(`[DATA_PROCESSOR_STATS_CONTROLLER] :: START :: POST Stats `);
    await this.statsService.postStats(stat);
    logger.info(
      `[DATA_PROCESSOR_STATS_CONTROLLER] :: COMPLETED :: POST Stats `,
    );

    return res.status(200).send();
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_STATS_CONTROLLER] :: ERROR :: Failed In Post Stats`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not POST Stat For DATA_PROCESSOR',
    });
  }
}

async function getStats(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }
    const pageNumber = req.query.pageNumber || 0;
    const pageSize = req.query.pageSize || 10;

    const pagination = this.paginationService.paginate(pageNumber, pageSize);

    let filter = req.query.filters || '{}';
    if (typeof filter === 'string') {
      try {
        filter = JSON.parse(filter);
      } catch (error) {
        const serializedFilterError = serializeError(error);
        logger.error(
          `[DATA_PROCESSOR_STATS_CONTROLLER] :: Could not parse filter in Json format {error: ${JSON.stringify(
            serializedFilterError,
          )}}`,
        );
        return res.status(400).send({
          err: 'Bad Request',
          desc: 'Filter Type Is Incorrect',
        });
      }
    }

    const filterColumns = {
      category: {
        type: GENERALIZED_FILTERS_TYPE.STRING,
        operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
      },
      subCategory: {
        type: GENERALIZED_FILTERS_TYPE.ARRAY,
        operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
      },
      source: {
        type: GENERALIZED_FILTERS_TYPE.STRING,
        operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
      },
      createdBy: {
        type: GENERALIZED_FILTERS_TYPE.ARRAY,
        operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
      },
      createdAt: {
        type: GENERALIZED_FILTERS_TYPE.ARRAY,
        operator: [
          GENERALIZED_FILTERS_OPERATOR.BETWEEN,
          GENERALIZED_FILTERS_OPERATOR.LESS_THAN_EQUAL_TO,
          GENERALIZED_FILTERS_OPERATOR.GREATER_THAN_EQUAL_TO,
        ],
      },
    };

    try {
      this.filterHandler.validate(filterColumns, filter);
    } catch (error) {
      const serializedFilterValidateError = serializeError(error);
      logger.error(
        `[DATA_PROCESSOR_STATS_CONTROLLER] :: The value of filter is not correct {,error: ${JSON.stringify(
          serializedFilterValidateError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: serializedFilterValidateError.message,
      });
    }

    // add condition for category & subCategory

    let sort = req.query.sort || { createdAt: 'desc' };
    if (typeof sort === 'string') {
      try {
        sort = JSON.parse(sort);
      } catch (error) {
        const serializedSortError = serializeError(error);
        logger.error(
          `[DATA_PROCESSOR_STATS_CONTROLLER] :: Could not parse sort in Json format {, error: ${JSON.stringify(
            serializedSortError,
          )}}`,
        );
        return res.status(400).send({
          err: 'Bad Request',
          desc: 'The sort value type is not an object',
        });
      }
    }

    const sortableColumns = ['createdAt'];
    const multipleSort = false;
    try {
      this.sortHandler.validate(sortableColumns, sort, multipleSort);
    } catch (error) {
      const serializedSortValidateError = serializeError(error);
      logger.error(
        `[DATA_PROCESSOR_STATS_CONTROLLER] :: The value of sort is not correct {, error: ${JSON.stringify(
          serializedSortValidateError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: serializedSortValidateError.message,
      });
    }

    logger.info(`[DATA_PROCESSOR_STATS_CONTROLLER] :: START :: Get Stats `);
    const stats = await this.statsService.getStats({
      pagination,
      filter,
      sort,
    });
    logger.info(`[DATA_PROCESSOR_STATS_CONTROLLER] :: COMPLETED :: Get Stats `);

    return res.status(200).send(stats);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_STATS_CONTROLLER] :: ERROR :: Failed In Get Stats`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not Get Stats For DATA_PROCESSOR',
    });
  }
}

async function getStatUsers(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    logger.info(
      `[DATA_PROCESSOR_STATS_CONTROLLER] :: START :: Get Stat Users `,
    );
    const stats = await this.statsService.getStatUsers();
    logger.info(
      `[DATA_PROCESSOR_STATS_CONTROLLER] :: COMPLETED :: Get Stat Users `,
    );

    return res.status(200).send(stats);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_STATS_CONTROLLER] :: ERROR :: Failed In Get Stat Users`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not Get Stat Users For DATA_PROCESSOR',
    });
  }
}

StatsController.prototype = {
  postStats,
  getStats,
  getStatUsers,
};

const statsController = new StatsController();
module.exports = statsController;
