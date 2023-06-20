/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');

/* GET SIC Code listing. */
/**
 *@openapi
 * /master/sicCode:
 *  get:
 *   operationId: getMasterSicCode
 *   tags:
 *      - "MasterSearch"
 *   security:
 *      - auth0_jwk: []
 *   description: "This is Master Sic Code list route which search the Sic Code list for that user"
 *   parameters:
 *      - in : query
 *        name: param
 *        type: string
 *        required: true
 *        description: "Sic Code param"
 *   produces:
 *      - application/json
 *   responses:
 *      '200':
 *        description: "returns the Sic code list"
 *      '400':
 *       description: if required parameters not passes then sends the params error
 *      '401':
 *       description: if user authentication fails then send error
 *      '403':
 *       description: if user is unauthorized then send error
 *      '500':
 *        description: "if something fails internally then send error"
 */

function SicCodeController() {
  this.sicCode = require('@nexsalesdev/master-data-model/lib/dataFiles/sicCode.json');
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
      `[MASTER-SIC-CODE-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const sicCodeParam = req.query.values || '';

  logger.info(
    `[MASTER-SIC-CODE-CONTROLLER] :: START :: Fetch Sic Code {userEmail : ${userEmail}}`,
  );

  try {
    const filteredSicCode = await self.autoCompleteService.search(
      sicCodeParam,
      self.sicCode,
      comparisonKey,
    );

    logger.info(
      `[MASTER-SIC-CODE-CONTROLLER] :: SUCCESS :: Fetch SIC CODE {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(filteredSicCode);
  } catch (err) {
    const sicCodeListError = serializeError(err);
    logger.error(
      `[MASTER-SIC-CODE-CONTROLLER] :: ERROR :: Fetch SIC CODE {userEmail : ${userEmail}, error : ${JSON.stringify(
        sicCodeListError,
      )}}`,
    );

    return res.status(500).send({
      err: sicCodeListError.message,
      desc: 'Could Not Get Master SIC Code',
    });
  }
}

SicCodeController.prototype = {
  get,
};

const sicCodeController = new SicCodeController();

module.exports = sicCodeController;
