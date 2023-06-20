const validator = require('validator');
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

/**
 *
 * @openapi
 *
 * definitions:
 *   patterns:
 *     properties:
 *       contacts:
 *        type: integer
 *       occurance:
 *        type: number
 *       pattern:
 *        type: string
 *
 *   emailPattern:
 *     properties:
 *       contacts:
 *        type: integer
 *       occurance:
 *        type: number
 *       pattern:
 *        type: string
 *       source:
 *        type: string
 *       totalContact:
 *        type: integer
 *
 *   postEmailPattern:
 *     properties:
 *       totalContact:
 *        type: integer
 *       patterns:
 *         type: array
 *         items:
 *           $ref: '#/definitions/patterns'
 *
 *   dynamicEmailPattern:
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
 * /emailPattern:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getEmailPatterns
 *     tags:
 *       - Email Pattern
 *     description: This is email pattern route which fetch the all type pattern of email
 *     parameters:
 *          - in : query
 *            name: firstName
 *            type: string
 *            required: true
 *            description: "first name"
 *          - in : query
 *            name: lastName
 *            type: string
 *            required: true
 *            description: "last name"
 *          - in : query
 *            name: middleName
 *            type: string
 *            required: false
 *            description: "middle name"
 *          - in : query
 *            name: domain
 *            type: string
 *            required: true
 *            description: "domain"
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: a list of emailPatterns
 *         schema:
 *          type: array
 *          items:
 *            type: object
 *            $ref: '#/definitions/emailPattern'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: addEmailPatterns
 *     tags:
 *       - Email Pattern
 *     description: This is email pattern route which get all pattern and store
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
 *
 * /dynamicEmailPattern:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: addDynamicEmailPatterns
 *     tags:
 *       - Email Pattern
 *     description: This is email pattern route which store dynamic email pattern
 *     parameters:
 *          - in: body
 *            name: body
 *            schema:
 *               $ref: '#/definitions/dynamicEmailPattern'
 *            required: true
 *            description: Email Pattern body
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: successfuly created
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function EmailPatternController() {
  // eslint-disable-next-line global-require
  const EmailPatternService = require('../../../services/emailPattern/emailPatternService');

  this.emailPatternService = new EmailPatternService();
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { emailPatterns } = req.body;
  if (!emailPatterns) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'emailPatterns is required',
    });
  }

  try {
    const result = await self.emailPatternService.addEmailPatterns(
      emailPatterns,
    );

    return res.status(200).send(result);
  } catch (err) {
    logger.error(
      `[EMAIL-PATTERN-CONTROLLER] :: ERROR :: File Processing Fail {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Store Data',
    });
  }
}

async function addDynamicEmailPattern(settingsConfig, req, res, next) {
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
      createdBy: userId,
      updatedBy: userId,
    };

    const result = await self.emailPatternService.addDynamicEmail(inputs);

    logger.info(
      `[PROJECT-CONTROLLER] :: SUCCESS :: Add Dynamic Email Pattern {userId : ${userId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    logger.error(
      `[EMAIL-PATTERN-CONTROLLER] :: ERROR :: Add Dynamic Email Pattern {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Store Dynamic Email Pattern',
    });
  }
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { domain, firstName, lastName, middleName } = req.query;

  if (!domain) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'domain is required',
    });
  }

  if (!firstName && !lastName && !middleName) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Any one of this is required, firstName/lastName/middleName',
    });
  }

  const inputs = {
    firstName,
    lastName,
    middleName,
    domain,
  };

  try {
    const result = await self.emailPatternService.getPatterns(inputs);

    logger.info(
      `[EMAIL-PATTERN-CONTROLLER] :: SUCCESS :: Get Email Patterns {userId : ${userId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    logger.error(
      `[EMAIL-PATTERN-CONTROLLER] :: ERROR :: Get Email Patterns {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not get email Patterns',
    });
  }
}

EmailPatternController.prototype = {
  post,
  addDynamicEmailPattern,
  get,
};

const emailPatternController = new EmailPatternController();

module.exports = emailPatternController;
