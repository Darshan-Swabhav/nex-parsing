/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const errorMessages = require('../../../config/error.config.json');
/**
 * @openapi
 *
 * /master/rawQueries:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postMasterRawQueries
 *     tags:
 *       - MASTER_RAW_QUERIES
 *     description: This is raw queries route for master DB
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: rawQueriesInput
 *         schema:
 *          type: object
 *          properties:
 *           sql:
 *            type: string
 *           replacements:
 *            type: object
 *     responses:
 *       '201':
 *         description: returns the raw queries result
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '401':
 *         description: if user authentication fails then send error
 *       '403':
 *         description: if user is unauthorized then send error
 *       '500':
 *         description: if something fails internally then send error
 */

function MasterRawQueriesController() {
  const MasterRawQueriesService = require('../../../services/master/masterRawQueriesService');

  this.masterRawQueriesService = new MasterRawQueriesService();
}

async function postMasterRawQueries(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { sql } = req.body;
  const { replacements } = req.body;

  if (!sql) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'sql is required',
    });
  }

  if (!replacements) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'replacements is required',
    });
  }

  if (
    _.get(replacements, 'allowAllQueries', 'false') === 'false' &&
    sql.toLocaleLowerCase().indexOf('select') !== 0
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Only select queries are allowed',
    });
  }

  const inputs = {};
  inputs.sql = sql;
  inputs.replacements = replacements;

  logger.info(
    `[MASTER-RAW-QUERIES-CONTROLLER] :: START :: Executing Master Raw Queries {userEmail : ${userEmail}}`,
  );

  try {
    const startTime = new Date();

    const rawQueriesResult =
      await self.masterRawQueriesService.postMasterRawQueries(inputs);

    logger.info(
      `[MASTER-RAW-QUERIES-CONTROLLER] :: SUCCESS :: Execution Of Master Raw Queries Completed {userEmail : ${userEmail}}`,
    );

    const endTime = new Date();

    const timeTaken = endTime - startTime;

    logger.info(
      `[MASTER-RAW-QUERIES-CONTROLLER] :: SUCCESS :: Execution Of Master Raw Queries Completed in Time ${timeTaken} by {userEmail : ${userEmail}}`,
    );

    return res.status(201).send(rawQueriesResult);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER-RAW-QUERIES-CONTROLLER] :: ERROR :: Execution Of Master Raw Queries Failed {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Execute Raw Queries',
    });
  }
}

MasterRawQueriesController.prototype = {
  postMasterRawQueries,
};

const rawQueriesResultController = new MasterRawQueriesController();

module.exports = rawQueriesResultController;
