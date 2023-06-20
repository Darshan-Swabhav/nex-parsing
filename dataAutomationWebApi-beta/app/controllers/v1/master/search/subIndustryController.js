/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');

/* GET Sub-Industry listing. */
/**
 *@openapi
 * /master/subIndustry:
 *  get:
 *    operationId: getMasterSub-Industry
 *    security:
 *      - auth0_jwk: []
 *    tags:
 *      - "MasterSearch"
 *    description: "This is Master Sub-Industry list route which search the Sub-Industry list for that user"
 *    parameters:
 *      - in : query
 *        name: param
 *        type: string
 *        required: true
 *        description: "subIndustry param"
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: "returns the Sub-Industry name list"
 *      '400':
 *       description: if required parameters not passes then sends the params error
 *      '401':
 *       description: if user authentication fails then send error
 *      '403':
 *       description: if user is unauthorized then send error
 *      '500':
 *        description: "if something fails internally then send error"
 */

function SubIndustryController() {
  this.industrySubIndustryMapping = require('@nexsalesdev/master-data-model/lib/dataFiles/industrySubIndustryMapping.json');
  const AutoCompleteService = require('../../../../services/master/search/autoCompleteService');
  this.autoCompleteService = new AutoCompleteService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  // TODO :: Correct the User Roles path
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[MASTER-SUB-INDUSTRY-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const subIndustryParam = req.query.param || '';
  let industrys = req.query.industrys || [];

  if (typeof industrys === 'string') {
    try {
      industrys = JSON.parse(industrys);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[MASTER-SUB-INDUSTRY-CONTROLLER] :: ERROR :: Could not parse industrys in Json format {userEmail : ${userEmail}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The industrys value type is not an object',
      });
    }
  }

  if (!industrys.length || !Array.isArray(industrys)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Industrys is required',
    });
  }

  logger.info(
    `[MASTER-SUB-INDUSTRY-CONTROLLER] :: START :: Fetch Sub-Industry {userEmail : ${userEmail}}`,
  );

  try {
    const filteredSubindustry =
      await self.autoCompleteService.filterDataDictionary(
        subIndustryParam,
        industrys,
        this.industrySubIndustryMapping,
      );

    logger.info(
      `[MASTER-SUB-INDUSTRY-CONTROLLER] :: SUCCESS :: Fetch Sub-Industry {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(filteredSubindustry);
  } catch (err) {
    const subIndustryListError = serializeError(err);
    logger.error(
      `[MASTER-SUB-INDUSTRY-CONTROLLER] :: ERROR :: Fetch Sub-Industry {userEmail : ${userEmail}, error: ${JSON.stringify(
        subIndustryListError,
      )}}`,
    );

    return res.status(500).send({
      err: subIndustryListError.message,
      desc: 'Could Not Get Master Sub Industry',
    });
  }
}

SubIndustryController.prototype = {
  get,
};

const subIndustryController = new SubIndustryController();

module.exports = subIndustryController;
