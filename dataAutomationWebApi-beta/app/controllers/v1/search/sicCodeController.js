/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');
/* GET Job Function listing. */
/**
 *@openapi
 * /sicCode:
 *  get:
 *    operationId: getSicCodeSerach
 *    tags:
 *       - "Search"
 *    security:
 *        - auth0_jwk: []
 *    description: "This is Sic Code list route which search the Sic Code list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "Sic Code param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the Sic code list"
 *        500:
 *          description: "if something fails internally then send error"
 */

function SicCodeController() {
  this.sicCode = require('./sicCode.json');
  const AutoCompleteService = require('../../../services/search/autoCompleteService');
  this.autoCompleteService = new AutoCompleteService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;
  const comparisonKey = 'fullTitle';

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const sicCodeParam = req.query.param || '';

  logger.info(
    `[SIC-CODE-CONTROLLER] :: START :: Fetch Sic Code {userId : ${userId}}`,
  );

  try {
    const filteredSicCode = await self.autoCompleteService.search(
      sicCodeParam,
      self.sicCode,
      comparisonKey,
    );

    logger.info(
      `[SIC-CODE-CONTROLLER] :: SUCCESS :: Fetch SIC CODE {userId : ${userId}}`,
    );

    return res.status(200).send(filteredSicCode);
  } catch (err) {
    logger.error(
      `[SIC-CODE-CONTROLLER] :: ERROR :: Fetch SIC CODE {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get SIC-CODE',
    });
  }
}

SicCodeController.prototype = {
  get,
};

const sicCodeController = new SicCodeController();

module.exports = sicCodeController;
