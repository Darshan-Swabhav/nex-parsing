/* eslint-disable global-require */
const errors = require('throw.js');
const { uuid } = require('uuidv4');
const { isEmpty } = require('lodash');
const { Transform } = require('stream');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const { Sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const {
  getDomain,
} = require('@nexsalesdev/da-dedupekeys-generator/lib/getDomain');
const _ = require('lodash');
const errorMessages = require('../../../../config/error.config.json');

const MAX_FILE_SIZE = 100;
const JOB_STATUS = {
  QUEUED: 'Queued',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

/**
 *@openapi
 * definitions:
 *   accounts:
 *     properties:
 *       id:
 *        type: string
 *       name:
 *        type: string
 *       researchStatus:
 *        type: string
 *       callingStatus:
 *        type: string
 *       complianceStatus:
 *        type: string
 *       stage:
 *        type: string
 *       zoomInfoName:
 *        type: string
 *       domain:
 *        type: string
 *       website:
 *        type: string
 *       description:
 *        type: string
 *       segment_technology:
 *        type: string
 *       nsId:
 *        type: string
 *       zoomInfoContactId:
 *        type: string
 *       sicCode:
 *        type: string
 *       naicsCode:
 *        type: string
 *       sicDescription:
 *        type: string
 *       source:
 *        type: string
 *       employeeSourceLI:
 *        type: string
 *       employeeSourceZ_plus:
 *        type: string
 *       phoneHQ:
 *        type: string
 *       email:
 *        type: string
 *       industry:
 *        type: string
 *       subIndustry:
 *        type: string
 *       locationLI:
 *        type: string
 *       addressHQ:
 *        type: object
 *       linkedInUrl:
 *        type: string
 *       employeeSize:
 *        type: object
 *       employeeSizeLI:
 *        type: string
 *       employeeSizeZ_plus:
 *        type: string
 *       employeeSizeFinalBucket:
 *        type: string
 *       employeeSize_others:
 *        type: string
 *       employeeRangeLI:
 *        type: string
 *       disposition:
 *        type: string
 *       comments:
 *        type: string
 *       revenue:
 *        type: object
 *       revenue_M_B_K:
 *        type: string
 *       upperRevenue:
 *        type: string
 *       lowerRevenue:
 *        type: string
 *       upperEmployeeSize:
 *        type: string
 *       lowerEmployeeSize:
 *        type: string
 *       ProjectId:
 *        type: string
 *       updatedAt:
 *        type: string
 *       createdAt:
 *        type: string
 *       createdBy:
 *        type: string
 *       updatedBy:
 *        type: string
 *       custom1:
 *        type: string
 *       custom2:
 *        type: string
 *       custom3:
 *        type: string
 *       custom4:
 *        type: string
 *       custom5:
 *        type: string
 *       custom6:
 *        type: string
 *       custom7:
 *        type: string
 *       custom8:
 *        type: string
 *       custom9:
 *        type: string
 *       custom10:
 *        type: string
 *       custom11:
 *        type: string
 *       custom12:
 *        type: string
 *       custom13:
 *        type: string
 *       custom14:
 *        type: string
 *       custom15:
 *        type: string
 *
 *   accountDispositionResponse:
 *       properties:
 *         isDisposed:
 *          type: boolean
 *
 *   accountDisposition:
 *     properties:
 *        data:
 *           type: array
 *           items:
 *              $ref: '#/definitions/accountDispositionData'
 *        totalCount:
 *           type: integer
 *
 *   accountStage:
 *     properties:
 *        data:
 *           type: array
 *           items:
 *              $ref: '#/definitions/accountStageData'
 *        totalCount:
 *           type: integer
 *
 *   accountDispositionData:
 *     properties:
 *       disposition:
 *        type: string
 *       count:
 *        type: integer
 *
 *   accountStageData:
 *     properties:
 *       stage:
 *        type: string
 *       count:
 *        type: integer
 *
 *   accountStats:
 *     properties:
 *       dispositions:
 *         type: object
 *         $ref: '#/definitions/accountDisposition'
 *       stages:
 *         type: object
 *         $ref: '#/definitions/accountStage'
 *
 *   account:
 *     properties:
 *       name:
 *        type: string
 *       domain:
 *        type: string
 *       industry:
 *        type: string
 *       disposition:
 *        type: string
 *       researchStatus:
 *        type: string
 *       stage:
 *        type: string
 *       complianceStatus:
 *        type: string
 *       createdAt:
 *        type: string
 *       potential:
 *        type: string
 *       isAssigned:
 *        type: string
 *
 *   accountListResponse:
 *     properties:
 *       totalCount:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *         description: total number of accounts
 *       docs:
 *         type: array
 *         items:
 *           $ref: '#/definitions/account'
 *
 *   accountCheckResponse:
 *     properties:
 *       matchType:
 *        type: string
 *       matchCase:
 *        type: string
 *       matchWith:
 *        type: array
 *
 *   accountDispositionsResponse:
 *     properties:
 *       disposition:
 *        type: array
 *
 * /project/{project_id}/accounts:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAccount
 *     tags:
 *       - Accounts
 *     description: This is account list route which fetch the project list for that user
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: integer
 *       description: project id
 *       required: true
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
 *         description: returns the accounts list array for that given list
 *         schema:
 *            $ref: '#/definitions/accountListResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{project_id}/accounts/{account_id}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAccountById
 *     tags:
 *       - Accounts
 *     description: This is account by Id route which fetch the account for that project
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: project id
 *       required: true
 *     - in: path
 *       name: account_id
 *       type: string
 *       description: account id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the account
 *         schema:
 *            $ref: '#/definitions/accounts'
 *       '401':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: editAccount
 *     tags:
 *       - Accounts
 *     description: This is account edit route which edit the account for that project
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: project id
 *       required: true
 *     - in: path
 *       name: account_id
 *       type: string
 *       description: account id
 *       required: true
 *     - in: body
 *       name: account
 *       schema:
 *         $ref: '#/definitions/accounts'
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: update success
 *       '401':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{project_id}/account/dispose:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: disposeAccount
 *     tags:
 *       - Accounts
 *     description: Dispose The Account
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: project id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the result in json format with true/false for disposition
 *         schema:
 *            $ref: '#/definitions/accountDispositionResponse'
 *       '400':
 *         description: if Required Data is not passed in request body
 *       '401':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /projects/{project_id}/accounts/stats:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAccountStats
 *     tags:
 *       - Account Stats
 *     description: This is account stats list route which fetch the distinct stats for that user
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: integer
 *       description: project id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the account stats for that given list
 *         schema:
 *           $ref: '#/definitions/accountStats'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /projects/{project_id}/account/check:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: checkAccountSupDup
 *     tags:
 *       - Account Suppression and Duplicate Check
 *     description: Check if Account is in Suppression Set or Duplicate
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: query
 *       name: checkSuppression
 *       type: boolean
 *       description: flag for check suppression
 *     - in: query
 *       name: checkDuplicate
 *       type: boolean
 *       description: flag for check duplicate
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the result in json format with true false for suppression
 *         schema:
 *            items:
 *              $ref: '#/definitions/accountCheckResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/accounts/dispositions:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAccountDispositions
 *     tags:
 *       - Accounts Disposition
 *     description: This is account disposition list route which fetch the unique dispositions
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the unique list of accounts disposition
 *         schema:
 *            $ref: '#/definitions/accountDispositionsResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 */

function AccountController() {
  const AccountCRUDService = require('../../../../services/projects/accounts/accountsService');
  const PaginationService = require('../../../../services/helpers/paginationService');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  this.requiredPermissions = ['read:user', 'write:user'];
  this.accountCRUDService = new AccountCRUDService();
  this.paginationService = new PaginationService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

function getWriteStream() {
  const writableStream = new Transform({
    transform: (chunk, encoding, callback) => {
      callback(null, chunk);
    },
    flush: (callback) => {
      callback();
    },
  }).on('error', (error) => {
    console.log(`Could not Create a Write Stream {Error: ${error}}`);
    throw error;
  });

  return writableStream;
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (roles.indexOf(USER_ROLES.MANAGER) < 0) {
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  }

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  let isAsyncDownload = req.query.async || false;
  const download = req.query.download || false;
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.projectId = projectId;
  inputs.userId = userId;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  let filter = req.query.filter || '{}';
  let sort = req.query.sort || '{}';

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[ACCOUNT-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      const serializedSortError = serializeError(error);
      logger.error(
        `[ACCOUNT-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedSortError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The sort value type is not an object',
      });
    }
  }

  const filterColumns = {
    label: { type: 'string', operator: ['='] },
    createdAt: { type: 'array', operator: ['between'] },
    updatedAt: { type: 'array', operator: ['between'] },
    potential: { type: 'string', operator: ['=', '<', '>'] },
    disposition: { type: 'array', operator: ['='] },
    stage: { type: 'string', operator: ['='] },
    isAssigned: { type: 'string', operator: ['='] },
    masterDisposition: { type: 'string', operator: ['='] },
  };
  try {
    self.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[ACCOUNT-CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  const sortableColumns = ['name', 'domain'];
  const multipleSort = true;
  try {
    self.sortHandler.validate(sortableColumns, sort, multipleSort);
  } catch (error) {
    const serializedSortValidateError = serializeError(error);
    logger.error(
      `[ACCOUNT-CONTROLLER] :: The value of sort is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedSortValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedSortValidateError.message,
    });
  }

  logger.info(
    `[ACCOUNT-CONTROLLER] :: START :: Fetch all Account of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  const downloadInputs = {};
  try {
    if (download) {
      downloadInputs.fileId = uuid();
      downloadInputs.jobId = uuid();
      downloadInputs.projectId = projectId;
      downloadInputs.userId = userId;
      logger.info(
        `[ACCOUNT-CONTROLLER] :: AccountDownload Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );

      isAsyncDownload = isAsyncDownload
        ? true
        : await self.accountCRUDService.getFileIsLarger(
            projectId,
            filter,
            MAX_FILE_SIZE,
          );

      if (isAsyncDownload) {
        logger.info(
          '[ACCOUNT-CONTROLLER] :: Async AccountDownload Job Creation Started',
        );
        const result = await self.accountCRUDService.downloadAllAccount(
          downloadInputs,
          filter,
          null,
          isAsyncDownload,
        );
        logger.info(
          `[ACCOUNT-CONTROLLER] :: Async AccountDownload Job Creation Success, ${JSON.stringify(
            result,
          )}`,
        );
        return res.status(200).send('Job Submitted Successfully');
      }
      const writableStream = getWriteStream();

      writableStream.on('finish', async () => {
        console.log('writableStream FINISH');
        await self.accountCRUDService.updateJobStatus(
          downloadInputs.jobId,
          JOB_STATUS.COMPLETED,
        );
        writableStream.destroy();
      });
      writableStream.on('close', () => {
        console.log('WritableStream Closed');
      });

      res.setHeader('Content-type', 'application/csv');
      writableStream.pipe(res);
      return self.accountCRUDService.downloadAllAccount(
        downloadInputs,
        filter,
        writableStream,
        isAsyncDownload,
      );
    }
  } catch (error) {
    const serializedDownloadError = serializeError(error);
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Could Not Download Account {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedDownloadError,
      )}}`,
    );
    await self.accountCRUDService.updateJobStatus(
      downloadInputs.jobId,
      JOB_STATUS.FAILED,
    );

    return res.status(500).send({
      error: serializedDownloadError.message,
      desc: 'Could Not Download Account',
    });
  }
  try {
    const accountList = await self.accountCRUDService.getAllAccount(
      inputs,
      filter,
      sort,
    );

    logger.info(
      `[ACCOUNT-CONTROLLER] :: SUCCESS :: Fetch all Account of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(accountList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Fetch all Account of Project {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Accounts',
    });
  }
}

async function getAccountById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const { accountId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!accountId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.accountId = accountId;

  logger.info(
    `[ACCOUNT-CONTROLLER] :: START :: Fetch Account By Id of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const account = await self.accountCRUDService.getAccountById(inputs);
    logger.info(
      `[ACCOUNT-CONTROLLER] :: SUCCESS :: Fetched Account By Id of Project {userId : ${userId}, projectId : ${projectId}}`,
    );
    return res.status(200).send(account);
  } catch (err) {
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Fetch Account By Id of Project {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Account',
    });
  }
}

async function put(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const { accountId } = req.params;
  const account = req.body;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!accountId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountId is required',
    });
  }

  if (!account || !Object.keys(account).length) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in Account object not Found',
    });
  }

  /* Mandatory Fields Validation */
  const { valid, description } =
    self.accountCRUDService.validateMandatoryFields(account);
  if (!valid) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: description,
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.accountId = accountId;
  inputs.account = account;
  inputs.userId = userId;

  logger.info(
    `[ACCOUNT-CONTROLLER] :: START :: Edit Account By Id of Project {userId : ${userId}, projectId : ${projectId}, accountId : ${accountId}}`,
  );

  try {
    const result = await self.accountCRUDService.editAccount(inputs);

    logger.info(
      `[ACCOUNT-CONTROLLER] :: SUCCESS :: Edit Account By Id of Project {userId : ${userId}, projectId : ${projectId}, accountId : ${accountId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Edit Account By Id of Project {userId : ${userId}, projectId : ${projectId}, accountId : ${accountId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Get Account',
    });
  }
}

async function disposeAccount(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(401).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const { account, taskLink } = req.body;

  if (isEmpty(account)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Could Not Find Account in Request Body',
    });
  }

  if (isEmpty(taskLink)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Could Not Find TaskLink in Request Body',
    });
  }

  if (_.isEmpty(account.type) || !_.isString(account.type)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Account Type is invalid',
    });
  }

  const { TaskId } = taskLink;
  const { disposition, parentWebsite } = account;
  // validate TaskLink Object
  const taskLinkRequiredFields = ['TaskId', 'ObjectId', 'disposition'];

  const taskLinkMissingFields = self.accountCRUDService.validateFields(
    taskLink,
    taskLinkRequiredFields,
  );

  if (taskLinkMissingFields.length) {
    const error = {
      err: `Could Not Find Required Fields in TaskLink Object`,
      desc: `Missing Fields ${taskLinkMissingFields.join(', ')}`,
    };
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Dispose Account { error : ${JSON.stringify(
        error,
      )}, userId : ${userId}, projectId : ${projectId} AccountId: ${
        account.id
      }, TaskId: ${TaskId} }`,
    );
    return res.status(400).send(error);
  }

  // validate Account Object

  const accountRequiredFields = ['id', 'disposition'];

  const accountMissingFields = self.accountCRUDService.validateFields(
    account,
    accountRequiredFields,
  );

  if (accountMissingFields.length) {
    const error = {
      err: `Could Not Find Required Fields in Account Object`,
      desc: `Missing Fields ${accountMissingFields.join(', ')}`,
    };
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Dispose Account { error : ${JSON.stringify(
        error,
      )}, userId : ${userId}, projectId : ${projectId} AccountId: ${
        account.id
      }, TaskId: ${TaskId} }`,
    );
    return res.status(400).send(error);
  }

  // parentWebsite is require for Acquired/Merged/Subsidiary disposition
  if (disposition === 'Acquired/Merged/Subsidiary' && !parentWebsite) {
    const error = {
      err: `Could Not Find Required Fields in Account Object`,
      desc: `Missing Field ParentWebsite `,
    };
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Dispose Account { error : ${JSON.stringify(
        error,
      )}, userId : ${userId}, projectId : ${projectId} AccountId: ${
        account.id
      }, TaskId: ${TaskId} }`,
    );
    return res.status(400).send(error);
  }

  account.parentDomain = getDomain(parentWebsite);
  delete account.parentWebsite;

  // TODO: Access Validation

  // TODO: Integrity Validation

  // Append Task Link Object Meta Field
  taskLink.updatedBy = userId;
  taskLink.UserId = userId;

  // Append Account Object Meta Field
  account.updatedBy = userId;

  const inputs = {};
  inputs.projectId = projectId;
  inputs.userId = userId;
  inputs.account = account;
  inputs.taskLink = taskLink;
  inputs.TaskId = TaskId;

  logger.info(
    `[ACCOUNT-CONTROLLER] :: START :: Dispose Account { userId : ${userId}, projectId : ${projectId}, AccountId: ${account.id}, TaskId: ${TaskId} }`,
  );

  try {
    await self.accountCRUDService.dispose(inputs);
    logger.info(
      `[ACCOUNT-CONTROLLER] :: SUCCESS :: Dispose Account { userId : ${userId}, projectId : ${projectId} AccountId: ${account.id}, TaskId: ${TaskId} }`,
    );
    return res.status(200).send({ isAccountDisposed: 'true' });
  } catch (error) {
    const serializedError = serializeError(error);
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Dispose Account { error : ${JSON.stringify(
        serializedError,
      )}, userId : ${userId}, projectId : ${projectId} AccountId: ${
        account.id
      }, TaskId: ${TaskId} }`,
    );

    if (error instanceof Sequelize.BaseError) {
      error.message = `DB_ERROR : ${error.message}`;
    }

    let statusCode = 500;
    if (error.code) {
      statusCode = 400;
    }
    return res.status(statusCode).send({
      err: error.message,
      desc: 'Could Not Dispose Account',
    });
  }
}

async function getAccountStats(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[ACCOUNT-CONTROLLER] :: This user does not have access to the route {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;

  let filter = req.query.filter || '{}';

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[ACCOUNT-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  const filterColumns = {
    label: { type: 'string', operator: ['='] },
    createdAt: { type: 'array', operator: ['between'] },
    updatedAt: { type: 'array', operator: ['between'] },
    potential: { type: 'string', operator: ['=', '<', '>'] },
    disposition: { type: 'array', operator: ['='] },
    stage: { type: 'string', operator: ['='] },
    isAssigned: { type: 'string', operator: ['='] },
    masterDisposition: { type: 'string', operator: ['='] },
  };
  try {
    self.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[ACCOUNT-CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  logger.info(
    `[ACCOUNT-CONTROLLER] :: START :: Fetch all Account Stats of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const accountStats = await self.accountCRUDService.getAccountStats(
      inputs,
      filter,
    );
    logger.info(
      `[ACCOUNT-CONTROLLER] :: SUCCESS :: Fetch all Account Stats of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(accountStats);
  } catch (err) {
    const serializedError = serializeError(err);

    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Fetch all Account Stats of Project { userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Accounts Stats',
    });
  }
}

async function checkAccountSuppressionOrDuplicate(
  settingsConfig,
  req,
  res,
  next,
) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const account = req.body;

  const checkSuppression = req.query.checkSuppression || false;
  const checkDuplicate = req.query.checkDuplicate || false;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (isEmpty(account)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in Account object not Found',
    });
  }

  account.ProjectId = projectId;

  logger.info(
    `[ACCOUNT-CONTROLLER] :: START :: Check Account Suppression/Duplicate { userId : ${userId}, projectId : ${projectId}, account: ${JSON.stringify(
      account,
    )}}`,
  );

  try {
    const inputs = {
      checkSuppression,
      checkDuplicate,
    };
    const accountCheckResult =
      await self.accountCRUDService.checkAccountSuppressionAndDuplicate(
        account,
        inputs,
      );

    logger.info(
      `[ACCOUNT-CONTROLLER] :: SUCCESS :: Check Account Suppression/Duplicate { userId : ${userId}, projectId : ${projectId}, Result: ${accountCheckResult} }`,
    );

    return res.status(200).send(accountCheckResult);
  } catch (err) {
    const serializedError = serializeError(err);

    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Check Account Suppression/Duplicate { userId : ${userId}, projectId : ${projectId}, account: ${JSON.stringify(
        account,
      )}, error: ${JSON.stringify(serializedError)}}`,
    );
    if (
      err.code === 'DEDUPE_CHECK_ERROR' ||
      err.code === 'SUPPRESSION_CHECK_ERROR'
    ) {
      return res.status(500).send({
        err: err.code,
        desc: err.desc,
      });
    }
    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Check Suppression/Duplicate',
    });
  }
}

async function getAccountDispositions(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.userId = userId;

  logger.info(
    `[ACCOUNT-CONTROLLER] :: START :: Fetch all Account of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const accountDispositionsList =
      await self.accountCRUDService.getAccountDispositions(inputs);

    logger.info(
      `[ACCOUNT-CONTROLLER] :: SUCCESS :: Fetch Unique Dispositions of Account for Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(accountDispositionsList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[ACCOUNT-CONTROLLER] :: ERROR :: Fetch Unique Dispositions of Account for Project {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Account Dispositions',
    });
  }
}

AccountController.prototype = {
  get,
  getAccountById,
  put,
  disposeAccount,
  getAccountStats,
  checkAccountSuppressionOrDuplicate,
  getAccountDispositions,
};

const accountController = new AccountController();

module.exports = accountController;
