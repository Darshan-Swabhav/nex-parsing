/* eslint-disable global-require */
const { cloneDeep, trim } = require('lodash');
const { serializeError } = require('serialize-error');
const { getDomain: getDomainTldJS } = require('tldjs');
const { CloudTasksClient } = require('@google-cloud/tasks');
const {
  Account,
  File,
  Job,
  GenericDomain,
  Sequelize,
} = require('@nexsalesdev/master-data-model');
const {
  getAccountAndLocationByDomain,
} = require('@nexsalesdev/master-data-model/lib/services/fetchAccountByDomain');
const {
  accountMasterExporter,
} = require('@nexsalesdev/da-download-service-repository');
const {
  FILE_TYPES,
  ASYNC_DOWNLOAD_FILE_OPERATIONS,
  SYNC_DOWNLOAD_FILE_OPERATIONS,
  JOB_STATUS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const { scrub } = require('@nexsalesdev/da-dedupekeys-generator');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;

const taskQueueClient = new CloudTasksClient();

function AccountCRUDService() {
  const config = settingsConfig.settings || {};
  this.config = config;
  this.logger = settingsConfig.logger || console;

  const FilterHandler = require('@nexsalesdev/master-data-model/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/master-data-model/lib/services/sortHandler');

  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

async function getAccountCounts() {
  const count = await Account.count({
    raw: true,
    subQuery: false,
  });
  return count;
}

async function getAllAccount(inputs, _filter, _sort) {
  const filter = _filter ? cloneDeep(_filter) : {};
  const sort = cloneDeep(_sort);
  const { limit, offset } = inputs;

  let where = {};

  if (filter.name) {
    const companyNameScrubOptions = {
      alias: true,
      specialChars: true,
      removeJunk: true,
      websiteClean: true,
      separators: true,
      stopWords: true,
      cleanBlackSpace: true,
    };
    const companyNames = filter.name.value;
    const scrubbedCompanyNames = [];
    companyNames.forEach((companyName) => {
      const scrubbedCompanyName = scrub(companyName, companyNameScrubOptions);
      scrubbedCompanyNames.push(scrubbedCompanyName);
    });

    where.scrubbedAliasName = { [Op.overlap]: scrubbedCompanyNames };
    delete filter.name;
  }
  if (filter.website) {
    const websites = filter.website.value;
    const cleanWebsites = [];
    websites.forEach((website) => {
      const cleanWebsite = trim(website).toLowerCase();
      cleanWebsites.push(cleanWebsite);
    });

    where.website = cleanWebsites;
    delete filter.website;
  }
  if (filter.technology) {
    const technologies = filter.technology.value;
    const cleanTechnologies = [];
    technologies.forEach((technology) => {
      const cleanTechnology = trim(technology).toLowerCase();
      cleanTechnologies.push(cleanTechnology);
    });

    where.technology = { [Op.overlap]: cleanTechnologies };
    delete filter.technology;
  }
  if (filter.tags) {
    where.tags = { [Op.contains]: [filter.tags.value] };
    delete filter.tags;
  }

  const filterColumnsMapping = {};
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  const sortColumnsMapping = {};
  const customSortColumn = {};
  let order = [];
  order = this.sortHandler.buildOrderClause(
    sortColumnsMapping,
    customSortColumn,
    sort,
    order,
  );

  if (!order.length) order = [['name', 'asc']];

  const result = await Account.findAndCountAll({
    attributes: [
      'domain',
      'name',
      'employeeSize',
      'type',
      'industry',
      'updatedAt',
    ],
    where,
    order,
    offset,
    limit,
    raw: true,
    subQuery: false,
  });

  const accounts = {};
  accounts.totalCount = result.count;
  accounts.docs = result.rows;
  return accounts;
}

async function getFileIsLarger(_filter, maximumRecords = 0) {
  const filter = _filter ? cloneDeep(_filter) : {};
  let where = {};

  if (filter.name) {
    const companyNameScrubOptions = {
      alias: true,
      specialChars: true,
      removeJunk: true,
      websiteClean: true,
      separators: true,
      stopWords: true,
      cleanBlackSpace: true,
    };
    const companyNames = filter.name.value;
    const scrubbedCompanyNames = [];
    companyNames.forEach((companyName) => {
      const scrubbedCompanyName = scrub(companyName, companyNameScrubOptions);
      scrubbedCompanyNames.push(scrubbedCompanyName);
    });

    where.scrubbedAliasName = { [Op.overlap]: scrubbedCompanyNames };
    delete filter.name;
  }
  if (filter.website) {
    const websites = filter.website.value;
    const cleanWebsites = [];
    websites.forEach((website) => {
      const cleanWebsite = trim(website).toLowerCase();
      cleanWebsites.push(cleanWebsite);
    });

    where.website = cleanWebsites;
    delete filter.website;
  }
  if (filter.technology) {
    const technologies = filter.technology.value;
    const cleanTechnologies = [];
    technologies.forEach((technology) => {
      const cleanTechnology = trim(technology).toLowerCase();
      cleanTechnologies.push(cleanTechnology);
    });

    where.technology = { [Op.overlap]: cleanTechnologies };
    delete filter.technology;
  }
  if (filter.tags) {
    where.tags = { [Op.contains]: [filter.tags.value] };
    delete filter.tags;
  }

  const filterColumnsMapping = {};
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  const count = await Account.count({
    where,
    raw: true,
    subQuery: false,
  });
  return count > maximumRecords;
}

async function downloadAllAccount(
  _inputs,
  filter,
  writableStream,
  isAsyncDownload = false,
) {
  const inputs = cloneDeep(_inputs);

  const fileData = {
    fileId: inputs.fileId,
    jobId: inputs.jobId,
    filter,
    createdBy: inputs.userEmail,
    updatedBy: inputs.userEmail,
  };

  await this.addFile(fileData, isAsyncDownload);

  if (isAsyncDownload) {
    // Async Download Procedure
    return this.enqueue(fileData.jobId, filter);
  }
  // sync Download Procedure
  const dbParam = {
    jobId: inputs.jobId,
    filter,
  };
  return accountMasterExporter(writableStream, dbParam);
}

async function enqueue(jobId, filter) {
  // TODO :: Correct Service Endpoint URl
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: this.config.MASTER_FILE_DOWNLOAD_ENDPOINT,
    },
  };

  const payload = {
    jobId,
    filter,
  };

  if (payload) {
    task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );
    task.httpRequest.headers = {
      'Content-Type': 'application/json',
    };
  }

  task.httpRequest.oidcToken = {
    serviceAccountEmail: this.config.SERVICE_ACCOUNT_EMAIL,
  };

  // Send create task request.
  this.logger.info(`Sending task: ${JSON.stringify(task)}`);

  const request = {
    parent: this.config.TASK_QUEUE_PATH,
    task,
  };
  try {
    const [response] = await taskQueueClient.createTask(request);
    this.logger.info(`Created task ${response.name}`);
    return;
  } catch (error) {
    this.logger.error('>>>>>>>> :/ Could Not Create Task');
    this.logger.error(error);
    throw error;
  }
}

async function addFile(fileData, isAsyncDownload = false) {
  const { fileId, createdBy, jobId } = fileData;
  const fileName = `AccountMaster_${new Date(Date.now())}.csv`;
  const fileType = FILE_TYPES.EXPORT;
  const format = '.csv';
  const mapping = {};
  const jobStatus = isAsyncDownload ? JOB_STATUS.QUEUED : JOB_STATUS.PROCESSING;
  const operationName = isAsyncDownload
    ? ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_ACCOUNT_EXPORT
    : SYNC_DOWNLOAD_FILE_OPERATIONS.SYNC_ACCOUNT_EXPORT;
  const operationParam = {};
  const resultProcessed = 0;
  const resultImported = 0;
  const resultErrored = 0;
  const rowCount = 0;
  const location = isAsyncDownload
    ? `files/master/${fileType}/${fileName}`
    : '';

  return File.create(
    {
      id: fileId,
      name: fileName,
      type: fileType,
      format,
      location,
      mapping,
      createdBy,
      Job: {
        id: jobId,
        status: jobStatus,
        chunks: fileData.chunks,
        operationName,
        operationParam,
        processed: resultProcessed,
        imported: resultImported,
        errored: resultErrored,
        createdBy,
        rowCount,
        FileId: fileId,
      },
    },
    {
      include: [
        {
          model: Job,
        },
      ],
    },
  );
}

async function updateJobStatus(jobId, status) {
  let result;
  try {
    result = await Job.update(
      {
        status,
      },
      {
        where: {
          id: jobId,
        },
      },
    );
  } catch (error) {
    console.log(
      `Could not update a Job Status: {JobId: ${jobId},Error: ${error}}`,
    );
  }
  return result;
}

async function getAccountByDomain(domain) {
  const data = getAccountAndLocationByDomain(domain);
  return data;
}

async function editAccount(payload) {
  const { domain, account } = payload;
  const accountInstance = await Account.findOne({
    where: { domain },
  });

  if (!accountInstance) {
    const error = new Error();
    error.desc = `Could Not Find Account With domain ${domain}`;
    error.code = `BAD_ACCOUNT_ID`;
    const serializedError = serializeError(error);
    console.error(
      `[MASTER_UPDATE_ACCOUNT] :: ERROR : Account reference doesn't exist :  ${JSON.stringify(
        serializedError,
      )}`,
    );
    throw error;
  }
  this.logger.info(
    `[FIND_ACCOUNT] :: Account found with Domain: ${accountInstance.domain}`,
  );
  if (account.requestedBy) {
    accountInstance.requestedBy = account.requestedBy;
  }
  if (account.updatedAt) {
    accountInstance.set('updatedAt', new Date());
    accountInstance.changed('updatedAt', true);
  }
  accountInstance.save();
  return accountInstance;
}

async function getDomain(companyName) {
  const companyNameScrubOptions = {
    alias: true,
    specialChars: true,
    removeJunk: true,
    websiteClean: true,
    separators: true,
    stopWords: true,
    cleanBlackSpace: true,
  };

  const scrubbedCompanyName = scrub(companyName, companyNameScrubOptions);

  const where = {};
  where.scrubbedAliasName = { [Op.contains]: [scrubbedCompanyName] };

  const domainData = await Account.findOne({ attributes: ['domain'], where });

  return domainData;
}

async function validateDomain(_domain) {
  const domain = trim(_domain).toLowerCase();

  const result = { isValid: false };

  if (domain !== getDomainTldJS(domain)) return result;

  const scrubbedDomain = domain.split('.')[0];
  const isGenericDomain = !!(await GenericDomain.findOne({
    attributes: ['keyword'],
    where: { keyword: scrubbedDomain },
  }));

  if (isGenericDomain) return result;

  result.isValid = true;
  return result;
}

AccountCRUDService.prototype = {
  getAllAccount,
  getFileIsLarger,
  downloadAllAccount,
  updateJobStatus,
  addFile,
  enqueue,
  getAccountByDomain,
  editAccount,
  getDomain,
  validateDomain,
  getAccountCounts,
};

module.exports = AccountCRUDService;
