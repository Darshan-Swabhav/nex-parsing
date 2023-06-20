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
 *   verifyAccounts:
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
 *   verifyAccountListResponse:
 *     properties:
 *       totalCount:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *         description: total number of verifyAccounts
 *       docs:
 *         type: array
 *         items:
 *           $ref: '#/definitions/verifyAccounts'
 *
 * /master/verifyAccounts:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getVerifyMasterAccount
 *     tags:
 *       - Accounts
 *     description: This is account list route which fetch data from Master DB
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
 *         description: returns the verifyAccounts list array for that given list
 *         schema:
 *            $ref: '#/definitions/verifyAccountListResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postVerifyMasterAccount
 *     tags:
 *       - Save to Verify Account
 *     description: Save Account to Master DB in VerifyAccounts DB
 *     parameters:
 *       - in: body
 *         name: account
 *         schema:
 *          type: object
 *          description: account data
 *     produces:
 *       - application/json
 *     responses:
 *       '201':
 *         description: returns the saved result in json format
 *         schema:
 *            items:
 *              $ref: '#/definitions/verifyAccounts'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function VerifyAccountController() {
  const VerifyAccountCRUDService = require('../../../../services/master/verifyAccounts/verifyAccountsService');
  const PaginationService = require('../../../../services/helpers/paginationService');

  this.verifyAccountCRUDService = new VerifyAccountCRUDService();
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
    `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: START :: Fetch all Account for Master {userEmail : ${userEmail}}`,
  );

  const downloadInputs = {};
  try {
    if (download) {
      downloadInputs.fileId = uuid();
      downloadInputs.jobId = uuid();
      downloadInputs.userEmail = userEmail;
      downloadInputs.userProvidedFileName = userProvidedFileName;

      logger.info(
        `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: VerifyAccountDownload Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );

      logger.info(
        '[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: Async VerifyAccountDownload Job Creation Started',
      );
      const result = await self.verifyAccountCRUDService.downloadAllAccount(
        downloadInputs,
      );
      logger.info(
        `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: Async VerifyAccountDownload Job Creation Success, ${JSON.stringify(
          result,
        )}`,
      );
      return res.status(200).send('Job Submitted Successfully');
    }
  } catch (error) {
    const serializedDownloadError = serializeError(error);
    logger.error(
      `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: ERROR :: Could Not Download Account {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedDownloadError,
      )}}`,
    );
    await self.verifyAccountCRUDService.updateJobStatus(
      downloadInputs.jobId,
      JOB_STATUS.FAILED,
    );

    return res.status(500).send({
      error: serializedDownloadError.message,
      desc: 'Could Not Download Verify Account',
    });
  }

  try {
    const verifyAccountList = await self.verifyAccountCRUDService.getAllAccount(
      inputs,
    );

    logger.info(
      `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: SUCCESS :: Fetch all Account for Master {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(verifyAccountList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: ERROR :: Fetch all Account for Master {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Master Verify Accounts',
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

  if (roles.indexOf(USER_ROLES.AGENT) < 0) {
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  }

  const { account, changedAccountData } = req.body;

  if (!account || !Object.keys(account).length) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Account object in body not Found',
    });
  }

  if (_.isEmpty(changedAccountData)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Account changed object not found In body',
    });
  }

  const { domain } = account;
  // Generate Domain if empty
  if (!_.get(account, 'domain', null))
    account.domain = getDomain(account.website);

  if (!account.domain) {
    // domain
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'domain is required',
    });
  }

  const inputs = {};
  inputs.account = account;
  inputs.changedAccountData = changedAccountData;
  inputs.userEmail = userEmail;

  logger.info(
    `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: START :: Save to Verify Account  {userEmail : ${userEmail}, AccountDomain : ${domain}}`,
  );

  try {
    const result = await self.verifyAccountCRUDService.saveAccount(inputs);

    logger.info(
      `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: SUCCESS :: Save to Verify Account  {userEmail : ${userEmail}, AccountDomain : ${domain}}`,
    );

    return res.status(201).send(result);
  } catch (error) {
    const serializedAccountVerifyPostError = serializeError(error);
    logger.error(
      `[MASTER-VERIFY-ACCOUNT-CONTROLLER] :: ERROR :: Save to Verify Account  {userEmail : ${userEmail}, AccountDomain : ${domain}, error: ${JSON.stringify(
        serializedAccountVerifyPostError,
      )}}`,
    );
    return res.status(500).send({
      err: serializedAccountVerifyPostError.message,
      desc: 'Could Not Create Master Verify Account',
    });
  }
}

VerifyAccountController.prototype = {
  get,
  post,
};

const verifyAccountController = new VerifyAccountController();

module.exports = verifyAccountController;
