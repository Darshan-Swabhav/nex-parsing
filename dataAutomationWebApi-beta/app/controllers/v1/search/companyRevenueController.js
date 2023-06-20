/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

/* GET CompanyRevenue listing. */
/**
 *@openapi
 * /companyRevenue:
 *  get:
 *    operationId: getCompanyRevenueSearch
 *    security:
 *        - auth0_jwk: []
 *    tags:
 *       - "Search"
 *    description: "This is CompanyRevenue list route which search the companyRevenue list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "company revenue param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the companyRevenue name list"
 *        400:
 *          description: "if required parameters not passes then sends the params error"
 *        500:
 *          description: "if something fails internally then send error"
 */

function CompanyRevenueController() {
  this.companyRevenue = require('./companyRevenue.json');
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

  const companyRevenueParam = req.query.param || '';

  logger.info(
    `[COMPANYREVENUE-CONTROLLER] :: START :: Fetch CompanyRevenue {userId : ${userId}}`,
  );

  try {
    const filteredCompanyRevenue = await self.autoCompleteService.search(
      companyRevenueParam,
      self.companyRevenue,
    );

    logger.info(
      `[COMPANYREVENUE-CONTROLLER] :: SUCCESS :: Fetch CompanyRevenue {userId : ${userId}}`,
    );

    return res.status(200).send(filteredCompanyRevenue);
  } catch (err) {
    logger.error(
      `[COMPANYREVENUE-CONTROLLER] :: ERROR :: Fetch CompanyRevenue {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get CompanyRevenue',
    });
  }
}

CompanyRevenueController.prototype = {
  get,
};

const companyRevenueController = new CompanyRevenueController();

module.exports = companyRevenueController;

// [
//     "0-1M",
//     "1M-10M",
//     "10M-50M",
//     "50M-100M",
//     "100M-250M",
//     "250M-500M",
//     "500M-1B",
//     "1B-10B",
//     "10B-1T"
// ]
