/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');

/* GET NAICS Code listing. */
/**
 *@openapi
 * /master/naicsCode:
 *  get:
 *   operationId: getMasterNaicsCode
 *   tags:
 *      - "MasterSearch"
 *   security:
 *      - auth0_jwk: []
 *   description: "This is Master Naics Code list route which search the Sic Code list for that user"
 *   parameters:
 *      - in : query
 *        name: param
 *        type: string
 *        required: true
 *        description: "Naics Code param"
 *   produces:
 *      - application/json
 *   responses:
 *      '200':
 *        description: "returns the Naics code list"
 *      '400':
 *       description: if required parameters not passes then sends the params error
 *      '401':
 *       description: if user authentication fails then send error
 *      '403':
 *       description: if user is unauthorized then send error
 *      '500':
 *        description: "if something fails internally then send error"
 */

function NaicsCodeController() {
  this.naicsCode = require('@nexsalesdev/master-data-model/lib/dataFiles/naicsCode.json');
  const AutoCompleteService = require('../../../../services/master/search/autoCompleteService');
  this.autoCompleteService = new AutoCompleteService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userEmail = req.user.email;
  const comparisonKey = 'fullTitle';

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  // TODO :: Correct the User Roles path
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[MASTER-NAICS-CODE-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const naicsCodeParam = req.query.values || '';

  logger.info(
    `[MASTER-NAICS-CODE-CONTROLLER] :: START :: Fetch Naics Code {userEmail : ${userEmail}}`,
  );

  try {
    const filteredNaicsCode = await self.autoCompleteService.search(
      naicsCodeParam,
      self.naicsCode,
      comparisonKey,
    );

    logger.info(
      `[MASTER-NAICS-CODE-CONTROLLER] :: SUCCESS :: Fetch Naics Code {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(filteredNaicsCode);
  } catch (err) {
    const naicsCodeListError = serializeError(err);
    logger.error(
      `[MASTER-NAICS-CODE-CONTROLLER] :: ERROR :: Fetch Naics Code {userEmail : ${userEmail}, error : ${JSON.stringify(
        naicsCodeListError,
      )}}`,
    );

    return res.status(500).send({
      err: naicsCodeListError.message,
      desc: 'Could Not Get Master NAICS Code',
    });
  }
}

NaicsCodeController.prototype = {
  get,
};

const naicsCodeController = new NaicsCodeController();

module.exports = naicsCodeController;
