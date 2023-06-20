const _ = require('lodash');
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const industrySubIndustryMapping = require('@nexsalesdev/master-data-model/lib/dataFiles/industrySubIndustryMapping.json');
const errorMessages = require('../../../../config/error.config.json');
const AutoCompleteService = require('../../../../services/master/search/autoCompleteService');

/* GET Industry listing. */
/**
 *@openapi
 * /master/industry:
 *  get:
 *   operationId: getMasterIndustry
 *   security:
 *      - auth0_jwk: []
 *   tags:
 *      - "MasterSearch"
 *   description: "This is Master Industry list route which search the industry list for that user"
 *   parameters:
 *      - in : query
 *        name: param
 *        type: string
 *        required: true
 *        description: "industry param"
 *   produces:
 *      - application/json
 *   responses:
 *      '200':
 *        description: "returns the industry name list"
 *      '400':
 *       description: if required parameters not passes then sends the params error
 *      '401':
 *       description: if user authentication fails then send error
 *      '403':
 *       description: if user is unauthorized then send error
 *      '500':
 *        description: "if something fails internally then send error"
 */

function IndustryController() {
  this.industry = Object.keys(industrySubIndustryMapping);

  this.autoCompleteService = new AutoCompleteService();
}

function formatIndustry(industryJSON) {
  const industriesSubIndustries = Object.keys(industryJSON);
  const result = [];
  let temp = {};

  industriesSubIndustries.forEach((item) => {
    temp = {
      name: item,
    };
    temp.children = industryJSON[item].map((subIndustry) => ({
      name: subIndustry,
    }));
    result.push(temp);
  });
  return result;
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  // TODO :: Correct the User Roles path
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[MASTER-INDUSTRY-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const industryParam = req.query.param || '';
  if (!_.isString(industryParam)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'industryParam type is invalid',
    });
  }

  let isSubIndustry = req.query.isSubIndustry || 'false';

  if (_.isString(isSubIndustry)) {
    isSubIndustry = isSubIndustry.trim().toLowerCase();
  }

  if (
    !_.isString(isSubIndustry) ||
    (isSubIndustry !== 'true' && isSubIndustry !== 'false')
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'isSubIndustry type is invalid',
    });
  }

  logger.info(
    `[MASTER-INDUSTRY-CONTROLLER] :: START :: Fetch Industry {userEmail : ${userEmail}}`,
  );

  try {
    let filteredIndustry;

    if (isSubIndustry === 'true') {
      filteredIndustry = formatIndustry(industrySubIndustryMapping);
    } else {
      filteredIndustry = await self.autoCompleteService.search(
        industryParam,
        self.industry,
      );
    }

    logger.info(
      `[MASTER-INDUSTRY-CONTROLLER] :: SUCCESS :: Fetch Industry {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(filteredIndustry);
  } catch (err) {
    const industryListError = serializeError(err);
    logger.error(
      `[MASTER-INDUSTRY-CONTROLLER] :: ERROR :: Fetch Industry {userEmail : ${userEmail}, error: ${JSON.stringify(
        industryListError,
      )}}`,
    );

    return res.status(500).send({
      err: industryListError.message,
      desc: 'Could Not Get Master Industry',
    });
  }
}

IndustryController.prototype = {
  get,
};

const industryController = new IndustryController();

module.exports = industryController;
