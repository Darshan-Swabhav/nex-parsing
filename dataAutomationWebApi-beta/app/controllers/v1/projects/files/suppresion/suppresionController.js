/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../../../config/error.config.json');
/**
 *
 * @openapi
 * definitions:
 *   seqObjectParams:
 *     properties:
 *       model:
 *         type: string
 *       query:
 *         type: string
 *   seqObject:
 *     type: object
 *
 * /suppresion:
 *   post:
 *     security:
 *       - auth0_jwk: []
 *     operationId: findAndCountAllobjects
 *     description: object route
 *     produces:
 *        - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       schema:
 *          $ref: '#/definitions/seqObjectParams'
 *       required: true
 *     responses:
 *       '200':
 *         description: returns count and sample json
 *         schema:
 *           $ref: "#/definitions/seqObject"
 *       '400':
 *         description: If required parameters are not passed then sends the params error
 *       '403':
 *         description: If user is not authenticated then sends the user authentication error
 *       '500':
 *         description: if something fails internally then send error
 */
function ObjectController() {
  // app/services/projects/files/suppression/accountService.js
  const AccountSuppressionCRUDService = require('../../../../../services/projects/files/suppression/accountService');
  const ContactSuppressionCRUDService = require('../../../../../services/projects/files/suppression/contactService');
  const FileChunkCRUDService = require('../../../../../services/projects/files/suppression/chunkService');
  this.accountSuppressionCRUDService = new AccountSuppressionCRUDService();
  this.contactSuppressionCRUDService = new ContactSuppressionCRUDService();
  this.fileChunkCRUDService = new FileChunkCRUDService();
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const inputs = {};
  inputs.model = req.body.model;
  inputs.query = req.body.query;

  try {
    let dataList = [];
    switch (inputs.model) {
      case 'AccountSuppression':
        dataList =
          await self.accountSuppressionCRUDService.getAccountSuppression(
            inputs,
          );
        break;
      case 'ContactSuppression':
        dataList =
          await self.contactSuppressionCRUDService.getContactSuppression(
            inputs,
          );
        break;
      case 'FileChunk':
        dataList = await self.fileChunkCRUDService.getFileChunk(inputs);
        break;
      default:
        return res.status(400).send({
          err: 'Bad Request',
          desc: 'projectId is required',
        });
    }
    return res.status(200).send(dataList);
  } catch (error) {
    logger.error(
      `[OBJECTS-CONTROLLER] :: ERROR :: Fetch all objects of ${inputs.model} {userId : ${userId}, query : ${inputs.query}, error : ${error.message}}`,
    );
    return res.status(500).send({
      err: error,
      desc: 'Could Not Get requested object',
    });
  }
}

ObjectController.prototype = {
  post,
};

const objectController = new ObjectController();

module.exports = objectController;
