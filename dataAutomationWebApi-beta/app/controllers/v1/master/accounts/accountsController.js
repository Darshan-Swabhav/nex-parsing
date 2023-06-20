/* eslint-disable global-require */
const errors = require('throw.js');
const { trim } = require('lodash');
const { uuid } = require('uuidv4');
const { serializeError } = require('serialize-error');
const { Transform } = require('stream');
const {
  USER_ROLES,
  JOB_STATUS,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');

const MAX_FILE_SIZE = 100;

/**
 *@openapi
 * definitions:
 *   accountByDomain:
 *     properties:
 *       id :
 *           type : string
 *           format: uuid
 *       name :
 *           type : string
 *       parentAccountName :
 *           type : string
 *       website :
 *           type : string
 *       domain :
 *           type : string
 *       type :
 *           type : string
 *       aliasName :
 *           type : object
 *       scrubbedAliasName :
 *           type : array
 *           items:
 *             type: string
 *       email :
 *           type : string
 *       industry :
 *           type : string
 *       subIndustry :
 *           type : string
 *       sicCode :
 *           type : string
 *       sicDescription :
 *           type : string
 *       naicsCode :
 *           type : integer
 *       naicsDescription :
 *           type : string
 *       employeeRange :
 *           type : string
 *       employeeSize :
 *           type : integer
 *       employeeSizeLI :
 *           type : integer
 *       employeeSizeZPlus :
 *           type : integer
 *       employeeSizeOthers :
 *           type : integer
 *       revenue :
 *           type : number
 *           format : float
 *       revenueRange :
 *           type : string
 *       totalFunding :
 *           type : number
 *           format : float
 *       latestFundingAmount :
 *           type : number
 *           format : float
 *       itSpend :
 *           type : number
 *           format : float
 *       liUrl :
 *           type : string
 *       description :
 *           type : string
 *       duns :
 *           type : integer
 *       technology :
 *           type : array
 *           items:
 *             type: string
 *       tags :
 *           type : array
 *           items:
 *             type: string
 *       state :
 *           type : string
 *       zipCode :
 *           type : string
 *       country :
 *           type : string
 *       disposition :
 *           type : string
 *       comments :
 *           type : string
 *       requestedBy :
 *           type : string
 *       foundedYear :
 *           type : integer
 *       lastRaisedAt :
 *           type : string
 *       seoDescription :
 *           type : string
 *       keywords :
 *           type : array
 *           items:
 *             type: string
 *       previousName :
 *           type : string
 *       previousWebsite :
 *           type : string
 *       previousType :
 *           type : string
 *       previousIndustry :
 *           type : string
 *       previousSubIndustry :
 *           type : string
 *       previousEmployeeSize :
 *           type : integer
 *       previousRevenue :
 *           type : number
 *           format : float
 *       previousTechnology :
 *           type : array
 *           items:
 *             type: string
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
 *   domainData:
 *     properties:
 *       domain :
 *           type : string
 *
 *   validateDomainData:
 *     properties:
 *       isValid:
 *         type: boolean
 *
 * /master/accounts:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getMasterAccount
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
 *         description: returns the accounts list array for that given list
 *         schema:
 *            $ref: '#/definitions/accountListResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/account/{domain}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getMasterAccountByDomain
 *     tags:
 *       - Account
 *     description: This Will Fetch Account By Domain.
 *     parameters:
 *     - in: path
 *       name: domain
 *       type: string
 *       description: domain
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the account
 *         schema:
 *            $ref: '#/definitions/accountByDomain'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '401':
 *         description: if user authentication fails then send error
 *       '403':
 *         description: if user is unauthorized then send error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/domain:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getDomain
 *     tags:
 *       - Account
 *     description: This Will Fetch Domain.
 *     parameters:
 *     - in: query
 *       name: companyName
 *       type: string
 *       description: Company Name
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the domainData
 *         schema:
 *            $ref: '#/definitions/domainData'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/domain/validate:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: validateDomain
 *     tags:
 *       - Account
 *     description: This Will Validate Domain.
 *     parameters:
 *       - in: query
 *         name: domain
 *         type: string
 *         description: Company Domain
 *         required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the validate domain data
 *         schema:
 *           $ref: '#/definitions/validateDomainData'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function AccountController() {
  const AccountCRUDService = require('../../../../services/master/accounts/accountsService');
  const PaginationService = require('../../../../services/helpers/paginationService');
  const FilterHandler = require('@nexsalesdev/master-data-model/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/master-data-model/lib/services/sortHandler');

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
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (roles.indexOf(USER_ROLES.MANAGER) < 0) {
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  }

  let isAsyncDownload = req.query.async || false;
  const download = req.query.download || false;
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.userEmail = userEmail;
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
        `[MASTER-ACCOUNT-CONTROLLER] :: Could not parse filter in Json format {userEmail : ${userEmail}, error: ${JSON.stringify(
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
        `[MASTER-ACCOUNT-CONTROLLER] :: Could not parse sort in Json format {userEmail : ${userEmail}, error: ${JSON.stringify(
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
    name: { type: 'array', operator: ['='] },
    website: { type: 'array', operator: ['='] },
    type: { type: 'array', operator: ['='] },
    industry: { type: 'array', operator: ['=', 'isNull'] },
    subIndustry: { type: 'array', operator: ['=', 'isNull'] },
    sicCode: { type: 'array', operator: ['=', 'isNull'] },
    sicDescription: { type: 'array', operator: ['=', 'isNull'] },
    naicsCode: { type: 'array', operator: ['=', 'isNull'] },
    naicsDescription: { type: 'array', operator: ['=', 'isNull'] },
    employeeSize: { type: 'string', operator: ['<', '>'] },
    employeeRange: { type: 'array', operator: ['='] },
    revenue: { type: 'string', operator: ['<', '>'] },
    revenueRange: { type: 'array', operator: ['='] },
    tags: { type: 'string', operator: ['='] },
    country: { type: 'string', operator: ['=', 'isNull'] },
    updatedAt: { type: 'array', operator: ['between'] },
    technology: { type: 'array', operator: ['='] },
  };
  try {
    self.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[MASTER-ACCOUNT-CONTROLLER] :: The value of filter is not correct {userEmail : ${userEmail}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  const sortableColumns = ['name', 'employeeSize', 'updatedAt'];
  const multipleSort = true;
  try {
    self.sortHandler.validate(sortableColumns, sort, multipleSort);
  } catch (error) {
    const serializedSortValidateError = serializeError(error);
    logger.error(
      `[MASTER-ACCOUNT-CONTROLLER] :: The value of sort is not correct {userEmail : ${userEmail}, error: ${JSON.stringify(
        serializedSortValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedSortValidateError.message,
    });
  }

  logger.info(
    `[MASTER-ACCOUNT-CONTROLLER] :: START :: Fetch all Account for Master {userEmail : ${userEmail}}`,
  );

  const downloadInputs = {};
  try {
    if (download) {
      downloadInputs.fileId = uuid();
      downloadInputs.jobId = uuid();
      downloadInputs.userEmail = userEmail;
      logger.info(
        `[MASTER-ACCOUNT-CONTROLLER] :: AccountDownload Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );

      isAsyncDownload = isAsyncDownload
        ? true
        : await self.accountCRUDService.getFileIsLarger(filter, MAX_FILE_SIZE);

      if (isAsyncDownload) {
        logger.info(
          '[MASTER-ACCOUNT-CONTROLLER] :: Async AccountDownload Job Creation Started',
        );
        const result = await self.accountCRUDService.downloadAllAccount(
          downloadInputs,
          filter,
          null,
          isAsyncDownload,
        );
        logger.info(
          `[MASTER-ACCOUNT-CONTROLLER] :: Async AccountDownload Job Creation Success, ${JSON.stringify(
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
      `[MASTER-ACCOUNT-CONTROLLER] :: ERROR :: Could Not Download Account {userEmail : ${userEmail}, error : ${JSON.stringify(
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
      `[MASTER-ACCOUNT-CONTROLLER] :: SUCCESS :: Fetch all Account for Master {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(accountList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER-ACCOUNT-CONTROLLER] :: ERROR :: Fetch all Account for Master {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Master Accounts',
    });
  }
}

async function getAccountAndLocationByDomain(settingsConfig, req, res, next) {
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
      desc: 'Access Denied :- User has no access this route',
    });
  }

  const { domain } = req.params;

  if (!domain) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Domain is required',
    });
  }

  logger.info(
    `[MASTER-ACCOUNT-CONTROLLER] :: START :: Fetch Master Account By Domain For {userEmail : ${userEmail}}`,
  );

  try {
    const account = await self.accountCRUDService.getAccountByDomain(domain);

    logger.info(
      `[MASTER-ACCOUNT-CONTROLLER] :: SUCCESS :: Fetched Master Account By Domain ${domain} for {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(account);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER-ACCOUNT-CONTROLLER] :: ERROR :: Fetch Master Account By Domain {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Master Account By Domain',
    });
  }
}

async function getDomain(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;

  logger.info(
    `[MASTER-ACCOUNT-CONTROLLER] :: START :: Fetch Domain of Account`,
  );
  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const { companyName } = req.query || {};
    if (!trim(companyName)) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'companyName is required',
      });
    }

    const domainData = await this.accountCRUDService.getDomain(companyName);
    logger.info(
      `[MASTER-ACCOUNT-CONTROLLER] :: SUCCESS :: Fetch Domain of Account`,
    );
    return res.status(200).send(domainData);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER-ACCOUNT-CONTROLLER] :: ERROR ::  Fetch Domain of Account {error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Domain of Account',
    });
  }
}

async function validateDomain(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;

  logger.info(`[MASTER-ACCOUNT-CONTROLLER] :: START :: Validate Domain`);

  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
    }

    const { domain } = req.query || {};
    if (!trim(domain)) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'domain is required',
      });
    }

    const validateDomainResult = await this.accountCRUDService.validateDomain(
      domain,
    );

    logger.info(`[MASTER-ACCOUNT-CONTROLLER] :: SUCCESS :: Validate Domain`);
    return res.status(200).send(validateDomainResult);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER-ACCOUNT-CONTROLLER] :: ERROR ::  Validate Domain {error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Validate Domain',
    });
  }
}

AccountController.prototype = {
  get,
  getAccountAndLocationByDomain,
  getDomain,
  validateDomain,
};

const accountController = new AccountController();

module.exports = accountController;
