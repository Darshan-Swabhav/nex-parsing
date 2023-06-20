/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

/* GET EmployeeCount listing. */
/**
 *@openapi
 * /employeeCount:
 *  get:
 *    operationId: getEmployeeCountSerach
 *    security:
 *        - auth0_jwk: []
 *    tags:
 *       - "Search"
 *    description: "This is employeeCount list route which search the employeeCount list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "employee count param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the employeeCount name list"
 *        400:
 *          description: "if required parameters not passes then sends the params error"
 *        500:
 *          description: "if something fails internally then send error"
 */

function EmployeeCountController() {
  this.employeeCount = require('./employeeCount.json');
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

  const employeeCountParam = req.query.param || '';

  logger.info(
    `[EMPLOYEECOUNT-CONTROLLER] :: START :: Fetch EmployeeCount {userId : ${userId}}`,
  );

  try {
    const filteredEmployeeCount = await self.autoCompleteService.search(
      employeeCountParam,
      self.employeeCount,
    );

    logger.info(
      `[EMPLOYEECOUNT-CONTROLLER] :: SUCCESS :: Fetch EmployeeCount {userId : ${userId}}`,
    );

    return res.status(200).send(filteredEmployeeCount);
  } catch (err) {
    logger.error(
      `[EMPLOYEECOUNT-CONTROLLER] :: ERROR :: Fetch EmployeeCount {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get EmployeeCount',
    });
  }
}

EmployeeCountController.prototype = {
  get,
};

const employeeCountController = new EmployeeCountController();

module.exports = employeeCountController;
