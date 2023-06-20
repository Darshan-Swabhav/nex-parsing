const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const EmployeeSizesService = require('../../../../../services/master/dataProcessor/employeeSizes/employeeSizes');
const errorMessages = require('../../../../../config/error.config.json');

function EmployeeSizesController() {
  this.employeeSizesService = new EmployeeSizesService();
}
/**
 * @openapi
 *
 * definitions:
 *   revenueRangeEmployeeSizeMapping:
 *     properties:
 *       id:
 *        type: string
 *       revenueRange:
 *        type: string
 *       employeeSize:
 *        type: number
 *
 *   revenueRangeEmployeeSizeMappingResponse:
 *     items:
 *       $ref: '#/definitions/revenueRangeEmployeeSizeMapping'
 *
 * /master/dataProcessor/employeeSizesMapping:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getEmployeeSize
 *     tags:
 *        - Data Processor
 *     description: This is employeeSize route which maps the employeeSizeNx
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: employeeSize body
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
 * /master/dataProcessor/employeeSizes:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postEmployeeSize
 *     tags:
 *        - Data Processor
 *     description: This is employeeSize route which creates/updates the employeeSizeNx
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: employeeSize body
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
 * /master/dataProcessor/revenue-range-employee-size-mapping:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getRevenueRangeEmployeeSizeMapping
 *     tags:
 *        - Data Processor
 *     description: This route returns a mapping of revenueRange to employeeSize
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns a mapping of revenueRange to employeeSize
 *         schema:
 *            $ref: '#/definitions/revenueRangeEmployeeSizeMappingResponse'
 *       '500':
 *         description: if something fails internally then send error
 */

async function getEmployeeSizesMapping(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;

  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const findEmployeeSizes = req.body.data || [];
    if (!Array.isArray(findEmployeeSizes) || !findEmployeeSizes.length) {
      throw new Error('Data is Required');
    }

    logger.info(`[DATA_PROCESSOR_CONTROLLER] :: START :: Get EmployeeSizes `);
    const employeeSizeMapping =
      await this.employeeSizesService.getEmployeeSizes(findEmployeeSizes);

    logger.info(
      `[DATA_PROCESSOR_CONTROLLER] :: COMPLETED :: Get EmployeeSizes `,
    );

    return res.status(200).send(employeeSizeMapping);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_CONTROLLER] :: ERROR :: Failed In Getting EmployeeSizes`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not Get EmployeeSizeMapping For DATA_PROCESSOR',
    });
  }
}

async function postEmployeeSizes(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const employeeSizes = req.body.data || [];

    if (!Array.isArray(employeeSizes) || !employeeSizes.length) {
      throw new Error('Data is Required');
    }

    logger.info(`[DATA_PROCESSOR_CONTROLLER] :: START :: POST employeeSizes `);
    const employeeSizesResult =
      await this.employeeSizesService.postEmployeeSizes(employeeSizes);

    logger.info(
      `[DATA_PROCESSOR_CONTROLLER] :: COMPLETED :: POST employeeSizes `,
    );

    return res.status(200).send(employeeSizesResult);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_CONTROLLER] :: ERROR :: Failed In Post employeeSizes`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not POST employeeSizes For DATA_PROCESSOR',
    });
  }
}

async function getRevenueRangeEmployeeSizeMapping(
  settingsConfig,
  req,
  res,
  next,
) {
  const logger = settingsConfig.logger || console;

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    logger.info(
      `[DATA_PROCESSOR_EMPLOYEE_SIZE_CONTROLLER] :: START :: Get Mapping data of RevenueRange to EmployeeSize`,
    );
    const employeeSizeResult =
      await this.employeeSizesService.getRevenueRangeEmployeeSizeMapping();
    logger.info(
      `[DATA_PROCESSOR_EMPLOYEE_SIZE_CONTROLLER] :: COMPLETED :: Get Mapping data of RevenueRange to EmployeeSize`,
    );

    return res.status(200).send(employeeSizeResult);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[DATA_PROCESSOR_EMPLOYEE_SIZE_CONTROLLER] :: ERROR :: Could not Get Mapping data of RevenueRange to EmployeeSize {error: ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could not Get Mapping data of RevenueRange to EmployeeSize',
    });
  }
}

EmployeeSizesController.prototype = {
  getEmployeeSizesMapping,
  postEmployeeSizes,
  getRevenueRangeEmployeeSizeMapping,
};

const employeeSizesController = new EmployeeSizesController();
module.exports = employeeSizesController;
