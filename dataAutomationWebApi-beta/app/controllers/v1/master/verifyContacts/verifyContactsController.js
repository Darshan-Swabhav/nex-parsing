/* eslint-disable global-require */
const _ = require('lodash');
const errors = require('throw.js');
const { uuid } = require('uuidv4');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
  JOB_STATUS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const {
  getDomain,
} = require('@nexsalesdev/da-dedupekeys-generator/lib/getDomain');
const errorMessages = require('../../../../config/error.config.json');

/**
 *@openapi
 * definitions:
 *   verifyContacts:
 *     properties:
 *       name:
 *         type: string
 *       website:
 *         type: string
 *       domain:
 *         type: string
 *       tokens:
 *         type: string
 *       type:
 *         type: string
 *       aliasName:
 *         type: object
 *       email:
 *         type: string
 *       industry:
 *         type: string
 *       subIndustry:
 *         type: string
 *       sicCode:
 *         type: number
 *       sicDescription:
 *         type: string
 *       naicsCode:
 *         type: number
 *       naicsDescription:
 *         type: string
 *       employeeRange:
 *         type: string
 *       employeeSize:
 *         type: number
 *       employeeSizeLI:
 *         type: number
 *       employeeSizeZPlus:
 *         type: number
 *       employeeSizeOthers:
 *         type: number
 *       revenue:
 *         type: number
 *       revenueRange:
 *         type: string
 *       totalFunding:
 *         type: number
 *       itSpend:
 *         type: number
 *       liUrl:
 *         type: string
 *       description:
 *         type: string
 *       duns:
 *         type: number
 *       technology:
 *         type: string
 *       tags:
 *         type: string
 *       location:
 *         type: object
 *
 *   verifyContactListResponse:
 *     properties:
 *       totalCount:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *         description: total number of verifyContacts
 *       docs:
 *         type: array
 *         items:
 *           $ref: '#/definitions/verifyContacts'
 *
 * /master/verifyContacts:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getVerifyMasterContacts
 *     tags:
 *       - Contacts
 *     description: This is contact list route which fetch data from Master DB
 *     parameters:
 *     - in: query
 *       name: pageNo
 *       type: integer
 *       description: page number
 *     - in: query
 *       name: pageSize
 *       type: integer
 *       description: page sizes
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the verifyContacts list array for that given list
 *         schema:
 *            $ref: '#/definitions/verifyContactListResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postVerifyMasterContact
 *     tags:
 *       - Save to Verify Contact
 *     description: Save Contact to Master DB in VerifyContacts DB
 *     parameters:
 *       - in: body
 *         name: contact
 *         schema:
 *          type: object
 *          description: contact data
 *     produces:
 *       - application/json
 *     responses:
 *       '201':
 *         description: returns the saved result in json format
 *         schema:
 *            items:
 *              $ref: '#/definitions/verifyContacts'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function VerifyContactController() {
  const VerifyContactCRUDService = require('../../../../services/master/verifyContacts/verifyContactsService');
  const PaginationService = require('../../../../services/helpers/paginationService');

  this.verifyContactCRUDService = new VerifyContactCRUDService();
  this.paginationService = new PaginationService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (roles.indexOf(USER_ROLES.COMPLIANCE) < 0) {
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  }

  const download = req.query.download || false;
  const userProvidedFileName = req.query.userProvidedFileName || '';
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.userEmail = userEmail;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  logger.info(
    `[MASTER_VERIFY_CONTACT_CONTROLLER] :: START :: Fetch all Contact for Master {userEmail : ${userEmail}}`,
  );

  const downloadInputs = {};
  try {
    if (download) {
      downloadInputs.fileId = uuid();
      downloadInputs.jobId = uuid();
      downloadInputs.userEmail = userEmail;
      downloadInputs.userProvidedFileName = userProvidedFileName;

      logger.info(
        `[MASTER_VERIFY_CONTACT_CONTROLLER] :: VerifyContactDownload Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );

      logger.info(
        '[MASTER_VERIFY_CONTACT_CONTROLLER] :: Async VerifyContactDownload Job Creation Started',
      );
      const result = await self.verifyContactCRUDService.downloadAllContact(
        downloadInputs,
      );
      logger.info(
        `[MASTER_VERIFY_CONTACT_CONTROLLER] :: Async VerifyContactDownload Job Creation Success, ${JSON.stringify(
          result,
        )}`,
      );
      return res.status(200).send('Job Submitted Successfully');
    }
  } catch (error) {
    const serializedDownloadError = serializeError(error);
    logger.error(
      `[MASTER_VERIFY_CONTACT_CONTROLLER] :: ERROR :: Could Not Download Contact {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedDownloadError,
      )}}`,
    );
    await self.verifyContactCRUDService.updateJobStatus(
      downloadInputs.jobId,
      JOB_STATUS.FAILED,
    );

    return res.status(500).send({
      error: serializedDownloadError.message,
      desc: 'Could Not Download Verify Contact',
    });
  }

  try {
    const verifyContactList = await self.verifyContactCRUDService.getAllContact(
      inputs,
    );

    logger.info(
      `[MASTER_VERIFY_CONTACT_CONTROLLER] :: SUCCESS :: Fetch all Contact for Master {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(verifyContactList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER_VERIFY_CONTACT_CONTROLLER] :: ERROR :: Fetch all Contact for Master {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Master Verify Contacts',
    });
  }
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (roles.indexOf(USER_ROLES.AGENT) < -1) {
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  }

  const { contact, changedContactData } = req.body;
  let { accountDomain } = req.body;

  if (_.isEmpty(contact) || !Object.keys(contact).length) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Contact not Found',
    });
  }

  if (
    _.isEmpty(changedContactData) ||
    !Object.keys(changedContactData).length
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Changed Contact not Found',
    });
  }

  if (accountDomain) accountDomain = getDomain(accountDomain);

  if (_.isEmpty(accountDomain) || !_.isString(accountDomain)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountDomain not Found',
    });
  }

  const inputs = {};
  inputs.contact = contact;
  inputs.changedContactData = changedContactData;
  inputs.accountDomain = accountDomain;
  inputs.userEmail = userEmail;

  logger.info(
    `[MASTER_VERIFY_CONTACT_CONTROLLER] :: START :: Save to Verify Contact  {userEmail : ${userEmail}, ContactDomain : ${accountDomain}}`,
  );

  try {
    const result = await self.verifyContactCRUDService.saveContact(inputs);

    logger.info(
      `[MASTER_VERIFY_CONTACT_CONTROLLER] :: SUCCESS :: Save to Verify Contact  {userEmail : ${userEmail}, ContactDomain : ${accountDomain}}`,
    );

    return res.status(201).send(result);
  } catch (error) {
    const serializedContactVerifyPostError = serializeError(error);
    logger.error(
      `[MASTER_VERIFY_CONTACT_CONTROLLER] :: ERROR :: Save to Verify Contact  {userEmail : ${userEmail}, ContactDomain : ${accountDomain}, error: ${JSON.stringify(
        serializedContactVerifyPostError,
      )}}`,
    );
    return res.status(500).send({
      err: serializedContactVerifyPostError.message,
      desc: 'Could Not Create Master Verify Contact',
    });
  }
}

VerifyContactController.prototype = {
  get,
  post,
};

const verifyContactController = new VerifyContactController();

module.exports = verifyContactController;
