/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../config/error.config.json');

/**
 * @openapi
 *
 * /rawQueries:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postRawQueries
 *     tags:
 *       - RAWQUERIES
 *     description: This is raw queries route
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
 *       '200':
 *         description: returns the raw queries result
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function RawQueriesController() {
  const RawQueriesService = require('../../services/rawQueriesService');

  this.rawQueriesService = new RawQueriesService();
}

async function postRawQueries(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
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

  const inputs = {};
  inputs.sql = sql;
  inputs.replacements = replacements;

  logger.info(
    `[RAWQUERIES-CONTROLLER] :: START :: Executing Raw Queries {userId : ${userId}}`,
  );

  try {
    const startTime = new Date();

    const rawQueriesResult = await self.rawQueriesService.postRawQueries(
      inputs,
    );

    logger.info(
      `[RAWQUERIES-CONTROLLER] :: SUCCESS :: Execution Of Raw Queries Completed {userId : ${userId}}`,
    );

    const endTime = new Date();

    const timeTaken = endTime - startTime;

    logger.info(
      `[RAWQUERIES-CONTROLLER] :: SUCCESS :: Execution Of Raw Queries Completed in Time ${timeTaken} by {userId : ${userId}}`,
    );

    return res.status(200).send(rawQueriesResult);
  } catch (err) {
    logger.error(
      `[RAWQUERIES-CONTROLLER] :: ERROR :: Execution Of Raw Queries Failed {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Execute Raw Queries',
    });
  }
}

RawQueriesController.prototype = {
  postRawQueries,
};

const rawQueriesResultController = new RawQueriesController();

module.exports = rawQueriesResultController;
