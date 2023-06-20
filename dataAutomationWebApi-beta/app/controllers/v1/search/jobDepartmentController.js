/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');
/* GET Job Department listing. */
/**
 *@openapi
 * /jobDepartment:
 *  get:
 *    operationId: getJobDepartMentSerach
 *    tags:
 *       - "Search"
 *    security:
 *        - auth0_jwk: []
 *    description: "This is Job Department list route which search the job department list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "job department param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the job department list"
 *        500:
 *          description: "if something fails internally then send error"
 */

function JobDepartmentController() {
  this.jobDepartment = require('./jobDepartment.json');
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

  const jobDepartmentParam = req.query.param || '';

  logger.info(
    `[JOB-DEPARTMENT-CONTROLLER] :: START :: Fetch Job Departments {userId : ${userId}}`,
  );

  try {
    const filteredjobDepartment = await self.autoCompleteService.search(
      jobDepartmentParam,
      self.jobDepartment,
    );

    logger.info(
      `[JOB-DEPARTMENT-CONTROLLER] :: SUCCESS :: Fetch Job Departments {userId : ${userId}}`,
    );

    return res.status(200).send(filteredjobDepartment);
  } catch (err) {
    logger.error(
      `[JOB-DEPARTMENT-CONTROLLER] :: ERROR :: Fetch Job Departments {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Job Departments',
    });
  }
}

JobDepartmentController.prototype = {
  get,
};

const jobDepartmentController = new JobDepartmentController();

module.exports = jobDepartmentController;
