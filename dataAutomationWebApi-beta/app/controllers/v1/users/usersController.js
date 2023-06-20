/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

/**
 *@openapi
 * definitions:
 *   users:
 *     properties:
 *       id:
 *        type: string
 *       userName:
 *        type: string
 *       firstName:
 *        type: string
 *       lastName:
 *        type: string
 *       role:
 *        type: string
 *       gmailId:
 *        type: string
 *
 * /users:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getUser
 *     tags:
 *       - Users
 *     description: This is user list route which fetch the user list
 *     parameters:
 *     - in: query
 *       name: role
 *       type: string
 *       description: user role
 *     - in: query
 *       name: download
 *       type: boolean
 *       description: get user list or download user data
 *     - in: query
 *       name: pageNo
 *       type: integer
 *       description: page number
 *     - in: query
 *       name: pageSize
 *       type: integer
 *       description: page sizes
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the user list array
 *         schema:
 *            $ref: '#/definitions/users'
 *       '500':
 *         description: if something fails internally then send error
 */

function UserController() {
  const UserCRUDService = require('../../../services/users/userService');
  const PaginationService = require('../../../services/helpers/paginationService');
  const FileStreamService = require('../../../services/stream/fileStreamService');

  this.userCRUDService = new UserCRUDService();
  this.paginationService = new PaginationService();
  this.fileStreamService = new FileStreamService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const role = req.query.role || '';
  const download = req.query.download || false;

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};

  inputs.role = role;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  try {
    if (download) {
      logger.info(
        `[USER-CONTROLLER] :: START :: Download User data {userId : ${userId}}`,
      );

      const writeStream = self.fileStreamService.getWriteStream(
        self.userCRUDService.convertToCSVFormat,
      );
      writeStream.on('end', () => {
        logger.info(
          `[USER-CONTROLLER] :: SUCCESS :: Download User data {userId : ${userId}}`,
        );
        res.end();
      });
      res.set('Content-Type', 'text/csv');
      writeStream.pipe(res);
      return self.userCRUDService.downloadAllUser(inputs, writeStream);
    }
    logger.info(
      `[USER-CONTROLLER] :: START :: Fetch all User {userId : ${userId}}`,
    );

    const userList = await self.userCRUDService.getAllUser(inputs);

    logger.info(
      `[USER-CONTROLLER] :: SUCCESS :: Fetch all User {userId : ${userId}}`,
    );

    return res.status(200).send(userList);
  } catch (err) {
    logger.error(
      `[USER-CONTROLLER] :: ERROR :: Fetch all User {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Users',
    });
  }
}
UserController.prototype = {
  get,
};

const userController = new UserController();

module.exports = userController;
