/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');
/* GET Job Level listing. */
/**
 *
 *@openapi
 *
 * /jobLevel:
 *  get:
 *    operationId: getJoblevelSerch
 *    tags:
 *       - "Search"
 *    security:
 *        - auth0_jwk: []
 *    description: "This is Job Level list route which search the job level list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "job level param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the job level list"
 *        500:
 *          description: "if something fails internally then send error"
 */

function JobLevelController() {
  this.jobLevel = require('./jobLevel.json');
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

  const jobLevelParam = req.query.param || '';

  logger.info(
    `[JOB-LEVEL-CONTROLLER] :: START :: Fetch Job Levels {userId : ${userId}}`,
  );

  try {
    const filteredjobLevel = await self.autoCompleteService.search(
      jobLevelParam,
      self.jobLevel,
    );

    logger.info(
      `[JOB-LEVEL-CONTROLLER] :: SUCCESS :: Fetch Job Levels {userId : ${userId}}`,
    );

    return res.status(200).send(filteredjobLevel);
  } catch (err) {
    logger.error(
      `[JOB-LEVEL-CONTROLLER] :: ERROR :: Fetch Job Levels {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Job Levels',
    });
  }
}

JobLevelController.prototype = {
  get,
};

const jobLevelController = new JobLevelController();

module.exports = jobLevelController;
