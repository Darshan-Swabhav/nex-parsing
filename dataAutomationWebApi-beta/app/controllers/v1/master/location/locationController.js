const errors = require('throw.js');
const {
  USER_ROLES,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const countryRegion = require('@nexsalesdev/master-data-model/lib/dataFiles/countryRegion.json');
const errorMessages = require('../../../../config/error.config.json');

/* GET locations listing. */
/**
 *@openapi
 * /master/locations:
 *  get:
 *   operationId: getMasterLocations
 *   security:
 *      - auth0_jwk: []
 *   tags:
 *      - "MasterLocationList"
 *   description: "This is Master Locations list route which list the location for the user"
 *   produces:
 *      - application/json
 *   responses:
 *      '200':
 *        description: "returns the industry name list"
 *      '403':
 *       description: if user is unauthorized then send error
 *      '500':
 *        description: "if something fails internally then send error"
 */

function LocationController() {}

function formatRegionCountry(countryJSON) {
  const countries = Object.keys(countryJSON);
  const finalRegions = {};
  const result = [];

  countries.forEach((countryItem) => {
    if (!finalRegions[countryJSON[countryItem]]) {
      finalRegions[countryJSON[countryItem]] = [];
    }
    finalRegions[countryJSON[countryItem]].push(countryItem);
  });

  const finalRegionsKeys = Object.keys(finalRegions);
  finalRegionsKeys.forEach((region) => {
    const temp = {
      name: region,
    };
    temp.children = finalRegions[region].map((country) => ({
      name: country,
    }));
    result.push(temp);
  });

  return result;
}

async function get(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[MASTER-LOCATION-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  logger.info(
    `[MASTER-LOCATION-CONTROLLER] :: START :: Fetch Location {userEmail : ${userEmail}}`,
  );

  try {
    let structuredLocations = [];

    structuredLocations = await formatRegionCountry(countryRegion);

    logger.info(
      `[MASTER-LOCATION-CONTROLLER] :: SUCCESS :: Fetch Location {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(structuredLocations);
  } catch (err) {
    logger.error(
      `[MASTER-LOCATION-CONTROLLER] :: ERROR :: Fetch Location {userEmail : ${userEmail}, error: ${err}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Get Master Location',
    });
  }
}

LocationController.prototype = {
  get,
};

const locationController = new LocationController();

module.exports = locationController;
