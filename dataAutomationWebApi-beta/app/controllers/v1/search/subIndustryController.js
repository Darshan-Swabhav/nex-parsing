/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');
/* GET Sub-Industry listing. */
/**
 *@openapi
 * /subIndustry:
 *  get:
 *    operationId: getSub-IndustrySearch
 *    security:
 *        - auth0_jwk: []
 *    tags:
 *       - "Search"
 *    description: "This is Sub-Industry list route which search the Sub-Industry list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "subIndustry param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the Sub-Industry name list"
 *        500:
 *          description: "if something fails internally then send error"
 */

function SubIndustryController() {
  this.industrySubIndustryMapping = require('./industrySubIndustryMapping.json');
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

  const subIndustryParam = req.query.param || '';
  let industrys = req.query.industrys || [];

  if (typeof industrys === 'string') {
    try {
      industrys = JSON.parse(industrys);
    } catch (err) {
      logger.error(
        `[SUB-INDUSTRY-CONTROLLER] :: ERROR :: Fetch Sub-Industry {userId : ${userId}, error : Industry Can Not Be Parse }`,
      );
    }
  }

  if (!industrys || !Array.isArray(industrys)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Industrys is required',
    });
  }

  logger.info(
    `[SUB-INDUSTRY-CONTROLLER] :: START :: Fetch Sub-Industry {userId : ${userId}}`,
  );

  try {
    const filteredSubindustry =
      await self.autoCompleteService.filterDataDictionary(
        subIndustryParam,
        industrys,
        this.industrySubIndustryMapping,
      );

    logger.info(
      `[SUB-INDUSTRY-CONTROLLER] :: SUCCESS :: Fetch Sub-Industry {userId : ${userId}}`,
    );

    return res.status(200).send(filteredSubindustry);
  } catch (err) {
    logger.error(
      `[SUB-INDUSTRY-CONTROLLER] :: ERROR :: Fetch Sub-Industry {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Sub-Industry',
    });
  }
}

SubIndustryController.prototype = {
  get,
};

const subIndustryController = new SubIndustryController();

module.exports = subIndustryController;
