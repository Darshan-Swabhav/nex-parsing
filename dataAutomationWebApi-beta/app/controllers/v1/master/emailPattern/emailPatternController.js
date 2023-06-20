const errors = require('throw.js');
const validator = require('validator');
const { serializeError } = require('serialize-error');
const errorMessages = require('../../../../config/error.config.json');
const EmailPatternService = require('../../../../services/master/emailPattern/emailPatternService');

/**
 *
 * @openapi
 *
 * definitions:
 *
 *   postEmailPattern:
 *     properties:
 *       email:
 *        type: string
 *       firstName:
 *        type: string
 *       middleName:
 *        type: string
 *       lastName:
 *        type: string
 *       website:
 *        type: string
 *       verifiedData:
 *        type: object
 *
 *
 * /master/emailPattern:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: addMasterEmailPattern
 *     tags:
 *       - Master Email Pattern
 *     description: This is email pattern route which store master email pattern
 *     parameters:
 *          - in: body
 *            name: body
 *            schema:
 *               $ref: '#/definitions/postEmailPattern'
 *            required: true
 *            description: Email Pattern body
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

function EmailPatternController() {
  this.emailPatternService = new EmailPatternService();
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const emailData = req.body;

  if (!emailData.email || !emailData.email.trim()) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Email is required',
    });
  }

  if (!validator.isEmail(emailData.email)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Email is InValid',
    });
  }

  if (!emailData.firstName && !emailData.middleName && !emailData.lastName) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'First Name or Middle Name or Last Name is required',
    });
  }

  try {
    const inputs = {
      email: emailData.email,
      firstName: emailData.firstName || '',
      middleName: emailData.middleName || '',
      lastName: emailData.lastName || '',
      website: emailData.website || null,
      verifiedData: emailData.verifiedData || {},
    };

    logger.info(
      `[MASTER_EMAIL_PATTERN_CONTROLLER] :: START :: Add Master Email Pattern {userId : ${userId}, data: ${JSON.stringify(
        inputs,
      )}}`,
    );

    const result = await self.emailPatternService.addEmailPattern(inputs);

    logger.info(
      `[MASTER_EMAIL_PATTERN_CONTROLLER] :: SUCCESS :: Add Master Email Pattern {userId : ${userId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    logger.error(
      `[MASTER_EMAIL_PATTERN_CONTROLLER] :: ERROR :: Add Master Email Pattern {userId : ${userId}, error : ${JSON.stringify(
        serializeError(err),
      )}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Store Master Email Pattern',
    });
  }
}

EmailPatternController.prototype = {
  post,
};

const emailPatternController = new EmailPatternController();

module.exports = emailPatternController;
