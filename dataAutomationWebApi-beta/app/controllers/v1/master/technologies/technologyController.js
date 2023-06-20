const _ = require('lodash');
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const errorMessages = require('../../../../config/error.config.json');
const TechnologyService = require('../../../../services/master/technology/technologyService');

/* GET \technology listing. */
/**
 * @openapi
 * definitions:
 *   technologies:
 *        type: array
 *        items:
 *           type: string
 *
 * /master/technology:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTechnologies
 *     tags:
 *       - Technology
 *     description: This is technology list route which fetch the technology list
 *     parameters:
 *     - in: query
 *       name: param
 *       type: string
 *       description: user searched param
 *     - in: query
 *       name: limit
 *       type: integer
 *       description: fetch limit instances/rows
 *     - in: query
 *       name: offset
 *       type: integer
 *       description: skip offset instances/rows
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the technologies list array
 *         schema:
 *            $ref: '#/definitions/technologies'
 *       '500':
 *         description: if something fails internally then send error
 */

function TechnologyController() {
  this.technologyService = new TechnologyService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const userParam = req.query.param || '';
  if (!_.isString(userParam)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Bad dataType for param',
    });
  }

  const limit = req.query.limit || '10';
  if (!_.isString(limit)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Bad dataType for limit',
    });
  }

  const offset = req.query.offset || '0';
  if (!_.isString(offset)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Bad dataType for offset',
    });
  }

  logger.debug(
    `[TECHNOLOGY_CONTROLLER] :: START :: Fetch Technologies {userId : ${userId}}`,
  );

  try {
    const filteredTechnology = await self.technologyService.getTechnologies({
      userParam,
      limit,
      offset,
    });

    logger.debug(
      `[TECHNOLOGY_CONTROLLER] :: SUCCESS :: Fetch Technologies {userId : ${userId}}`,
    );

    return res.status(200).send(filteredTechnology);
  } catch (err) {
    const technologySearchErr = serializeError(err);
    logger.error(
      `[TECHNOLOGY_CONTROLLER] :: ERROR :: Fetch Technologies {userId : ${userId}, error : ${JSON.stringify(
        technologySearchErr,
      )}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Get Technology',
    });
  }
}

TechnologyController.prototype = {
  get,
};

const technologySearchController = new TechnologyController();

module.exports = technologySearchController;
