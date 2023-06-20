/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const errorMessages = require('../../../config/error.config.json');
/* GET User listing. */
/**
 * @openapi
 * tags:
 *   - name: "Search"
 *     description: "search value"
 *
 * /userSearch:
 *  get:
 *    tags:
 *       - "Search"
 *    operationId: getUserSearch
 *    security:
 *       - auth0_jwk: []
 *    description: "This is User list route which search the user name list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "user name param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the user name list"
 *        400:
 *          description: "if required parameters not passes then sends the params error"
 *        500:
 *          description: "if something fails internally then send error"
 */

function UserSearchController() {
  const UserSearchService = require('../../../services/search/userSearchService');
  this.userSearchService = new UserSearchService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const userParam = req.query.param;

  if (!userParam) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'param is required',
    });
  }

  const userRole = req.query.userRole || '';

  logger.debug(
    `[USER-SEARCH-CONTROLLER] :: START :: Fetch User {userId : ${userId}}`,
  );

  if (userRole) {
    try {
      await self.userSearchService.validateUserRole(userRole);
    } catch (err) {
      const validateUserRoleErr = serializeError(err);
      logger.error(
        `[USER-SEARCH-CONTROLLER] :: ERROR :: Invalid User Role {userId : ${userId}, error : ${JSON.stringify(
          validateUserRoleErr,
        )}}`,
      );

      return res.status(400).send({
        err: err.message,
        desc: 'Invalid User Role',
      });
    }
  }

  try {
    const filteredUser = await self.userSearchService.search(
      userParam,
      userRole,
    );

    logger.debug(
      `[USER-SEARCH-CONTROLLER] :: SUCCESS :: Fetch User {userId : ${userId}}`,
    );

    return res.status(200).send(filteredUser);
  } catch (err) {
    const userSearchErr = serializeError(err);
    logger.error(
      `[USER-SEARCH-CONTROLLER] :: ERROR :: Fetch User {userId : ${userId}, error : ${JSON.stringify(
        userSearchErr,
      )}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Get User',
    });
  }
}

UserSearchController.prototype = {
  get,
};

const userSearchController = new UserSearchController();

module.exports = userSearchController;
