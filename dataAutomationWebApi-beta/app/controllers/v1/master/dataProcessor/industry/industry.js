const errors = require('throw.js');
const IndustryService = require('../../../../../services/master/dataProcessor/industry/industry');
const errorMessages = require('../../../../../config/error.config.json');

function IndustryController() {
  this.industryService = new IndustryService();
}

/**
 * @openapi
 *
 * /master/dataProcessor/industriesMapping:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getIndustries
 *     tags:
 *        - Data Processor
 *     description: This is industries route which maps the industryNx and subIndustryNx
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Industry body
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
 *
 * /master/dataProcessor/industries:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postIndustries
 *     tags:
 *        - Data Processor
 *     description: This is industries route which create/update the industry, industryNx and subIndustryNx
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Industry body
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
 */

async function getIndustriesMapping(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const industries = req.body.data;

    if (!Array.isArray(industries) || !industries.length) {
      throw new Error('Data is Required');
    }

    logger.info(`[DATA_PROCESSOR_CONTROLLER] :: START :: Get Industries `);
    const industriesMapping = await this.industryService.getIndustries(
      industries,
    );

    logger.info(
      `[DATA_PROCESSOR_CONTROLLER] :: COMPLETED :: Fetched Industries `,
    );

    return res.status(200).send(industriesMapping);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_CONTROLLER] :: ERROR :: Failed In Getting Industries`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not Get Industries For DATA_PROCESSOR',
    });
  }
}

async function postIndustries(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const industries = req.body.data || [];

    if (!Array.isArray(industries) || !industries.length) {
      throw new Error('Data is Required');
    }

    logger.info(`[DATA_PROCESSOR_CONTROLLER] :: START :: POST Industries `);

    const industriesResult = await this.industryService.postIndustries(
      industries,
    );
    logger.info(`[DATA_PROCESSOR_CONTROLLER] :: COMPLETED :: POST Industries `);

    return res.status(200).send(industriesResult);
  } catch (error) {
    logger.error(
      `[DATA_PROCESSOR_CONTROLLER] :: ERROR :: Failed In Post Industries`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Can Not POST Industries For DATA_PROCESSOR',
    });
  }
}

IndustryController.prototype = {
  getIndustriesMapping,
  postIndustries,
};

const employeeSizesController = new IndustryController();
module.exports = employeeSizesController;
