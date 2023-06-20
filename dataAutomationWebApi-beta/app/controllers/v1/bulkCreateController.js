/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const errorMessages = require('../../config/error.config.json');

/**
 * @openapi
 *
 * /bulkCreateDummyData:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postBulkCreateDummyData
 *     tags:
 *       - BULKCREATEDUMMYDATA
 *     description: This is route for creating bulk dummy data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: bulkCreateDataInput
 *         schema:
 *          type: object
 *          properties:
 *           projectId:
 *            type: string
 *           accountCount:
 *            type: integer
 *           contactCount:
 *            type: integer
 *     responses:
 *       '201':
 *         description: returns the result
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function BulkCreateDummyDataController() {
  const BulkCreateDummyDataService = require('../../services/bulkCreateService');

  this.bulkCreateDummyDataService = new BulkCreateDummyDataService();
}

async function bulkCreateDummyData(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const inputs = req.body;
  // dev.pmger1: auth0|6135a6be81c014006ab78c7f
  const allowedUsers = ['auth0|6135a6be81c014006ab78c7f'];

  if (!allowedUsers.includes(userId)) {
    logger.info(
      `[BULK-CREATE]: User ${userId} is Not Allowed To Run This Operation`,
    );
    return res.status(401).send({
      err: 'Unauthorized',
      desc: 'Access Denied',
    });
  }

  if (!inputs.projectId) {
    logger.info(`[BULK-CREATE]: Missing Project ID in Request`);
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  logger.info(
    `[BULK-CREATE]: Request Validated, Request Data : ${JSON.stringify(
      inputs,
    )}`,
  );
  // end the req res cycle and start generation script in background
  res.status(201).send('Data Generation Started');

  try {
    logger.info(`[BULK-CREATE]: Starting Data Generation...`);
    await self.bulkCreateDummyDataService.createBulkTasks(inputs);
    logger.info(
      `[BULK-CREATE]: Dummy data created successfully For Project : ${inputs.projectId}`,
    );
    return 'Done';
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[BULK-CREATE]: Dummy data creation failed For Project : ${
        inputs.projectId
      } with error  ${JSON.stringify(error)}`,
    );
    return 'error';
  }
}

BulkCreateDummyDataController.prototype = {
  bulkCreateDummyData,
};

const bulkCreateDummyDataController = new BulkCreateDummyDataController();

module.exports = bulkCreateDummyDataController;
