const _ = require('lodash');
const axios = require('axios');
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');
const settingsConfig = require('../../../config/settings/settings-config');

const zbApiTmpl = settingsConfig.settings.integrations.zb.validateUrlTpl;
const zbApiKey = settingsConfig.settings.integrations.zb.apiKey;
/**
 *
 * @openapi
 *
 * definitions:
 *   zbValidationResponse:
 *     properties:
 *       address:
 *        type: string
 *       status:
 *        type: string
 *       sub_status:
 *        type: string
 *       free_email:
 *        type: string
 *       processed_at:
 *        type: string
 *
 * /integrations/zb:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: zbValidate
 *     tags:
 *       - ZB
 *     description: A route proxy to zb's validation route
 *     parameters:
 *     - in: query
 *       name: emailId
 *       type: string
 *       description: Email id to validate
 *       required: true
 *     - in: query
 *       name: taskId
 *       type: string
 *       description: Task Id for which this email is being created
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns a truncated version of the validation response
 *         schema:
 *            $ref: '#/definitions/zbValidationResponse'
 *       '400':
 *         description: when required parameters are not passed
 *       '500':
 *         description: when the route fails to execute
 *       '502':
 *         description: when zb returns an error in the response
 *       '504':
 *         description: when zb fails to response to a request
 */

function ZbController() {
  // initialize any needed services here
}

async function get(_settingsConfig, req, res, next) {
  const logger = _settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  logger.info(JSON.stringify(req.query));

  const { emailId } = req.query;

  if (!emailId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'emailId is required',
    });
  }

  // TODO: Check if it is a valid taskId assigned to this user
  const { taskId } = req.query;
  if (!taskId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'taskId is required',
    });
  }

  try {
    const zbApiUrl = _.template(zbApiTmpl)({
      apiKey: zbApiKey,
      email: emailId,
      ipAddress: '',
    });

    logger.debug(`[ZB-CONTROLLER] :: zb request ${zbApiUrl}`);

    const { data, status } = await axios.get(zbApiUrl);
    // TODO: save zbResponse to db

    // Zb returns error with a 200 status
    // an error property is returned which can be sent back to the client
    if (data.error) {
      logger.error(
        `[ZB-CONTROLLER] :: ERROR Zero Bounce returned an error
         { request code: ${status}, userId : ${userId}, email : ${emailId}, task : ${taskId},
          error : ${data.error}}`,
      );
      return res.status(502).send({
        err: 'Zero Bounce returned an error',
        desc: data.error,
      });
    }

    // convert processed_at to the correct format
    let { processed_at: processedAt } = data;
    processedAt = new Date(`${processedAt}Z`).toISOString();

    if (data.status && !processedAt) {
      logger.warn(
        `[ZB-CONTROLLER] :: WARNING response of Zero Bounce has status but don't have time
         {userId : ${userId}, email : ${emailId}, task : ${taskId},
          zb response : (${JSON.stringify(data)})}`,
      );
    }

    return res.json({
      address: data.address,
      status: data.status,
      sub_status: data.sub_status,
      free_email: data.free_email,
      processed_at: processedAt,
    });
  } catch (error) {
    // TODO: encapsulate this into a function
    // can be reused across the controllers ?
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(
        `[ZB-CONTROLLER] :: ERROR sending request to Zero Bounce
         {userId : ${userId}, email : ${emailId}, task : ${taskId},
          error : (${error.response.status}) ${error.response.data}}`,
      );
      return res.status(error.response.status).send({
        err: 'Error sending request to Zero Bounce',
        desc: error.response.data,
      });
    }
    if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      logger.error(
        `[ZB-CONTROLLER] :: ERROR sending request to Zero Bounce
         {userId : ${userId}, email : ${emailId}, task : ${taskId},
          error : ${error.request}}`,
      );
      return res.status(504).send({
        err: 'No response from Zero Bounce',
        desc: error.response.data,
      });
    }
    // Something happened in setting up the request that triggered an Error
    logger.error(
      `[ZB-CONTROLLER] :: ERROR sending request to Zero Bounce
         {userId : ${userId}, email : ${emailId}, task : ${taskId},
          error : ${error.message}}`,
    );
    return res.status(500).send({
      err: 'Error setting up request to Zero Bounce',
      desc: error.message,
    });
  }
}

ZbController.prototype = {
  get,
};

const zbController = new ZbController();

module.exports = zbController;
