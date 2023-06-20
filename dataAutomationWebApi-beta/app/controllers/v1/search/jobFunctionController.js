/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');
/* GET Job Function listing. */
/**
 *@openapi
 * /jobFunction:
 *  get:
 *    operationId: getJobFunctionSerach
 *    tags:
 *       - "Search"
 *    security:
 *        - auth0_jwk: []
 *    description: "This is Job Function list route which search the job function list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "job function param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the job function list"
 *        500:
 *          description: "if something fails internally then send error"
 */

function JobFunctionController() {
  this.jobFunction = require('./jobFunction.json');
  const AutoCompleteService = require('../../../services/search/autoCompleteService');
  this.autoCompleteService = new AutoCompleteService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const jobFunctionParam = req.query.param || '';
  let departments = req.query.departments || [];

  if (typeof departments === 'string') {
    try {
      departments = JSON.parse(departments);
    } catch (err) {
      logger.error(
        `[JOB-FUNCTION-CONTROLLER] :: ERROR :: Fetch Job Function {userId : ${userId}, error : Industry Can Not Be Parse }`,
      );
    }
  }

  if (!departments || !Array.isArray(departments)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Departments is required',
    });
  }

  logger.info(
    `[JOB-FUNCTION-CONTROLLER] :: START :: Fetch Job Function {userId : ${userId}}`,
  );

  try {
    const filteredjobFunction =
      await self.autoCompleteService.filterDataDictionary(
        jobFunctionParam,
        departments,
        self.jobFunction,
      );

    logger.info(
      `[JOB-FUNCTION-CONTROLLER] :: SUCCESS :: Fetch Job Function {userId : ${userId}}`,
    );

    return res.status(200).send(filteredjobFunction);
  } catch (err) {
    logger.error(
      `[JOB-FUNCTION-CONTROLLER] :: ERROR :: Fetch Job Function {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Job Function',
    });
  }
}

JobFunctionController.prototype = {
  get,
};

const jobFunctionController = new JobFunctionController();

module.exports = jobFunctionController;
