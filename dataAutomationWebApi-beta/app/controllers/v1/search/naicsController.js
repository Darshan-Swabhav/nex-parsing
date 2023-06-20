/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');
/* GET Job Function listing. */
/**
 *@openapi
 * /naicsCode:
 *  get:
 *    operationId: getNaicsCodeSerach
 *    tags:
 *       - "Search"
 *    security:
 *        - auth0_jwk: []
 *    description: "This is naics Code list route which search the naics Code list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "naics Code param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the naics code list"
 *        500:
 *          description: "if something fails internally then send error"
 */

function NaicsCodeController() {
  this.naicsCode = require('./naicsCode.json');
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

  const naicsCodeParam = req.query.param || '';

  logger.info(
    `[NAICS-CODE-CONTROLLER] :: START :: Fetch Naics Code {userId : ${userId}}`,
  );

  try {
    const filteredNaicsCode = await self.autoCompleteService.search(
      naicsCodeParam,
      self.naicsCode,
      comparisonKey,
    );

    logger.info(
      `[NAICS-CODE-CONTROLLER] :: SUCCESS :: Fetch NAICS CODE {userId : ${userId}}`,
    );

    return res.status(200).send(filteredNaicsCode);
  } catch (err) {
    logger.error(
      `[NAICS-CODE-CONTROLLER] :: ERROR :: Fetch NAICS CODE {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get NAICS-CODE',
    });
  }
}

NaicsCodeController.prototype = {
  get,
};

const naicsCodeController = new NaicsCodeController();

module.exports = naicsCodeController;
