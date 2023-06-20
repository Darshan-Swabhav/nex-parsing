/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

/* GET SegmentTechnology listing. */
/**
 *@openapi
 * /segmentTechnology:
 *  get:
 *    operationId: getSegmentTechnologySerach
 *    security:
 *        - auth0_jwk: []
 *    tags:
 *       - "Search"
 *    description: "This is segmentTechnology list route which search the segmentTechnology list for that user"
 *    parameters:
 *         - in : query
 *           name: param
 *           type: string
 *           required: true
 *           description: "segment technology param"
 *    produces:
 *        - application/json
 *    responses:
 *        200:
 *          description: "returns the segmentTechnology name list"
 *        400:
 *          description: "if required parameters not passes then sends the params error"
 *        500:
 *          description: "if something fails internally then send error"
 */

function SegmentTechnologyController() {
  this.segmentTechnology = require('./segmentTechnology.json');
  const AutoCompleteService = require('../../../services/search/autoCompleteService');
  this.autoCompleteService = new AutoCompleteService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const segmentTechnologyParam = req.query.param || '';

  logger.info(
    `[SEGMENTTECHNOLOGY-CONTROLLER] :: START :: Fetch SegmentTechnology {userId : ${userId}}`,
  );

  try {
    const filteredSegmentTechnology = await self.autoCompleteService.search(
      segmentTechnologyParam,
      self.segmentTechnology,
    );

    logger.info(
      `[SEGMENTTECHNOLOGY-CONTROLLER] :: SUCCESS :: Fetch SegmentTechnology {userId : ${userId}}`,
    );

    return res.status(200).send(filteredSegmentTechnology);
  } catch (err) {
    logger.error(
      `[SEGMENTTECHNOLOGY-CONTROLLER] :: ERROR :: Fetch SegmentTechnology {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get SegmentTechnology',
    });
  }
}

SegmentTechnologyController.prototype = {
  get,
};

const segmentTechnologyController = new SegmentTechnologyController();

module.exports = segmentTechnologyController;
