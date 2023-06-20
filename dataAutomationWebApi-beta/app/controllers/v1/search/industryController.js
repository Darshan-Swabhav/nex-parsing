/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

/* GET Industry listing. */
/**
 *@openapi
 * /industry:
 *  get:
 *    operationId: getIndustrySearch
 *    security:
 *        - auth0_jwk: []
 *    tags:
 *       - "Search"
 *    description: "This is Industry list route which search the industry list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "industry param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the industry name list"
 *        500:
 *          description: "if something fails internally then send error"
 */

function IndustryController() {
  const industrySubIndustryMapping = require('./industrySubIndustryMapping.json');
  this.industry = Object.keys(industrySubIndustryMapping);

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

  const industryParam = req.query.param || '';

  logger.info(
    `[INDUSTRY-CONTROLLER] :: START :: Fetch Industry {userId : ${userId}}`,
  );

  try {
    const filteredIndustry = await self.autoCompleteService.search(
      industryParam,
      self.industry,
    );

    logger.info(
      `[INDUSTRY-CONTROLLER] :: SUCCESS :: Fetch Industry {userId : ${userId}}`,
    );

    return res.status(200).send(filteredIndustry);
  } catch (err) {
    logger.error(
      `[INDUSTRY-CONTROLLER] :: ERROR :: Fetch Industry {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Industry',
    });
  }
}

IndustryController.prototype = {
  get,
};

const industryController = new IndustryController();

module.exports = industryController;
