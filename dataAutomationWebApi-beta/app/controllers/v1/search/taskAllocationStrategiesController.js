/* eslint-disable global-require */
const errors = require('throw.js');
const {
  TASK_ALLOCATION_STRATEGIES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const errorMessages = require('../../../config/error.config.json');

/**
 *@openapi
 * /taskAllocationStrategies:
 *  get:
 *    operationId: getTaskAllocationStrategies
 *    security:
 *        - auth0_jwk: []
 *    tags:
 *       - "Search"
 *    description: "This is taskAllocationStrategies list route"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           description: "taskAllocationStrategy param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the Task Allocation Strategies"
 *        500:
 *          description: "if something fails internally then send error"
 */

function TaskAllocationStrategies() {
  const AutoCompleteService = require('../../../services/search/autoCompleteService');
  this.autoCompleteService = new AutoCompleteService();
}

async function get(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const taskAllocationStrategyParam = req.query.param || '';

  logger.info(
    `[TASK-ALLOCATION-STRATEGIES-CONTROLLER] :: START :: Fetch Task Allocation Strategies {userId : ${userId}}`,
  );

  try {
    const filteredTaskAllocationStrategies =
      await this.autoCompleteService.search(
        taskAllocationStrategyParam,
        Object.values(TASK_ALLOCATION_STRATEGIES),
      );

    logger.info(
      `[TASK-ALLOCATION-STRATEGIES-CONTROLLER] :: SUCCESS :: Fetch Task Allocation Strategies {userId : ${userId}}`,
    );

    return res.status(200).send(filteredTaskAllocationStrategies);
  } catch (err) {
    logger.error(
      `[TASK-ALLOCATION-STRATEGIES-CONTROLLER] :: ERROR :: Fetch Task Allocation Strategies {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Task Allocation Strategies',
    });
  }
}

TaskAllocationStrategies.prototype = {
  get,
};

const taskAllocationStrategies = new TaskAllocationStrategies();

module.exports = taskAllocationStrategies;
