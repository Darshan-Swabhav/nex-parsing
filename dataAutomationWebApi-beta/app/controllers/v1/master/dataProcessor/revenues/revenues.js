const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const RevenuesService = require('../../../../../services/master/dataProcessor/revenues/revenues');
const errorMessages = require('../../../../../config/error.config.json');

function RevenuesController() {
  this.revenuesService = new RevenuesService();
}
/**
 * @openapi
 *
 * definitions:
 *   employeeRangeRevenueMapping:
 *     properties:
 *       id:
 *        type: string
 *       employeeRange:
 *        type: string
 *       revenue:
 *        type: number
 *
 *   employeeRangeRevenueMappingResponse:
 *     items:
 *       $ref: '#/definitions/employeeRangeRevenueMapping'
 *
 * /master/dataProcessor/revenueMapping:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getRevenues
 *     tags:
 *        - Data Processor
 *     description: This is revenue route which maps the revenueNx
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: revenue body
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 type: string
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: successfully created
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/dataProcessor/revenues:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postRevenue
 *     tags:
 *        - Data Processor
 *     description: This is revenue route which creates/updates the revenueNx
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: revenue body
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 type: string
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: successfully created
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/dataProcessor/employee-range-revenue-mapping:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getEmployeeRangeRevenueMapping
 *     tags:
 *        - Data Processor
 *     description: This route returns a mapping of employeeRange to revenue
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns a mapping of employeeRange to revenue
 *         schema:
 *            $ref: '#/definitions/employeeRangeRevenueMappingResponse'
 *       '500':
 *         description: if something fails internally then send error
 */

async function getRevenuesMapping(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;

  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const findRevenues = req.body.data || [];
    if (!Array.isArray(findRevenues) || !findRevenues.length) {
      throw new Error('Data is Required');
    }

    logger.info(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: START :: Get Revenues `,
    );

    const revenuesMapping = await this.revenuesService.getRevenues(
      findRevenues,
    );

    logger.info(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: COMPLETED :: Get Revenues `,
    );

    return res.status(200).send(revenuesMapping);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: ERROR :: Failed In Getting Revenues`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not Get RevenueMapping For DATA_PROCESSOR',
    });
  }
}

async function postRevenues(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const revenues = req.body.data || [];

    if (!Array.isArray(revenues) || !revenues.length) {
      throw new Error('Data is Required');
    }

    logger.info(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: START :: POST Revenues `,
    );
    const revenuesResult = await this.revenuesService.postRevenues(revenues);
    logger.info(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: COMPLETED :: POST Revenues `,
    );

    return res.status(200).send(revenuesResult);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: ERROR :: Failed In Post Revenues`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not POST Revenues For DATA_PROCESSOR',
    });
  }
}

async function getEmployeeRangeRevenueMapping(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    logger.info(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: START :: Get Mapping data of EmployeeRange to Revenue`,
    );
    const revenuesResult =
      await this.revenuesService.getEmployeeRangeRevenueMapping();
    logger.info(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: COMPLETED :: Get Mapping data of EmployeeRange to Revenue`,
    );

    return res.status(200).send(revenuesResult);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[DATA_PROCESSOR_REVENUE_CONTROLLER] :: ERROR :: Could not Get Mapping data of EmployeeRange to Revenue {error: ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could not Get Mapping data of EmployeeRange to Revenue',
    });
  }
}

RevenuesController.prototype = {
  getRevenuesMapping,
  postRevenues,
  getEmployeeRangeRevenueMapping,
};

const revenuesController = new RevenuesController();
module.exports = revenuesController;
