/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');
/* GET Job Title listing. */
/**
 *@openapi
 * /jobTitle:
 *  get:
 *    operationId: getJobTitleData
 *    tags:
 *       - "Search"
 *    security:
 *        - auth0_jwk: []
 *    description: "This Route returns the JobTitle related JobDepartment, JobLevel, and jobFunction"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "job title"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the JobDepartment, JobLevel, and jobFunction"
 *        400:
 *          description: if JobTitle not passes then sends the params error
 *        500:
 *          description: "if something fails internally then send error"
 */

function JobTitleController() {
  this.jobTitleData = require('./jobTitle.json');
}

async function get(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  let jobTitle = req.query.jobTitle || '';
  jobTitle = jobTitle.toLowerCase().trim();

  if (!jobTitle) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobTitle is required',
    });
  }

  logger.info(
    `[JOB-TITLE-CONTROLLER] :: START :: Fetch Job Title Data {userId : ${userId}}`,
  );

  try {
    const result = this.jobTitleData[jobTitle] || {};

    logger.info(
      `[JOB-TITLE-CONTROLLER] :: SUCCESS :: Fetch Job Title Data {userId : ${userId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    logger.error(
      `[JOB-TITLE-CONTROLLER] :: ERROR :: Fetch Job Title Data {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Job Function',
    });
  }
}

JobTitleController.prototype = {
  get,
};

const jobTitleController = new JobTitleController();

module.exports = jobTitleController;
