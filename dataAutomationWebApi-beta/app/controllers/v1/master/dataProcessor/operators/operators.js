const {
  OPERATIONS_TYPE,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const errors = require('throw.js');
const errorMessages = require('../../../../../config/error.config.json');

const OperatorsService = require('../../../../../services/master/dataProcessor/operators/operators');

const OPERATIONS_TYPES = Object.values(OPERATIONS_TYPE);

function OperatorController() {
  this.operatorsService = new OperatorsService();
}

/**
 *
 * @openapi
 *
 * /master/dataProcessor/operators/{type}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getOperators
 *     tags:
 *        - Data Processor
 *     summary: Get operators by type
 *     description: Get operators by type
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: type
 *         in: path
 *         description: Type of operators
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: successfully fetched
 *       '500':
 *         description: if something fails internally then send error
 */

async function get(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const { type } = req.params;

    if (!OPERATIONS_TYPES.includes(type.toLowerCase())) {
      throw new Error('Bad Operation Type');
    }

    logger.info(`[DATA_PROCESSOR_CONTROLLER] :: START :: Get Operators `);
    const operators = await this.operatorsService.getOperators(type);

    logger.info(`[DATA_PROCESSOR_CONTROLLER] :: COMPLETED :: Get Operators `);

    return res.status(200).send(operators);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_CONTROLLER] :: ERROR :: Failed In Getting Operators`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not Get Operations For DATA_PROCESSOR',
    });
  }
}

OperatorController.prototype = {
  get,
};

const operatorController = new OperatorController();
module.exports = operatorController;
