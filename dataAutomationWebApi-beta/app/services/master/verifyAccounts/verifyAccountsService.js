/* eslint-disable global-require */
const _ = require('lodash');
const moment = require('moment');
const { VerifyAccount, File, Job } = require('@nexsalesdev/master-data-model');
const { CloudTasksClient } = require('@google-cloud/tasks');
const {
  FILE_TYPES,
  ASYNC_DOWNLOAD_FILE_OPERATIONS,
  JOB_STATUS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const { serializeError } = require('serialize-error');
const {
  getDomain,
} = require('@nexsalesdev/da-dedupekeys-generator/lib/getDomain');
const settingsConfig = require('../../../config/settings/settings-config');

const taskQueueClient = new CloudTasksClient();

function VerifyAccountCRUDService() {
  const config = settingsConfig.settings || {};
  this.config = config;
  this.logger = settingsConfig.logger || console;

  const SortHandler = require('@nexsalesdev/master-data-model/lib/services/sortHandler');
  const Sanitizer = require('../../commonServices/sanitizer');
  const AccountCRUDService = require('../accounts/accountsService');

  this.sanitizer = new Sanitizer();
  this.sortHandler = new SortHandler();
  this.accountCRUDService = new AccountCRUDService();
}

async function getAllAccount(inputs) {
  const { limit, offset } = inputs;

  const result = await VerifyAccount.findAndCountAll({
    attributes: [
      'name',
      'website',
      'employeeSize',
      'type',
      'industry',
      'updatedAt',
      'createdUserEmail',
    ],
    order: [['name', 'ASC']],
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

async function downloadAllAccount(_inputs) {
  const inputs = _.cloneDeep(_inputs);
  const fileData = {
    fileId: inputs.fileId,
    fileName: inputs.userProvidedFileName,
    jobId: inputs.jobId,
    createdBy: inputs.userEmail,
    updatedBy: inputs.userEmail,
  };

  await this.addFile(fileData);
  // Async Download Procedure
  return this.enqueue(fileData.jobId);
}

async function enqueue(jobId) {
  // TODO :: Correct Service Endpoint URl
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: this.config.MASTER_FILE_DOWNLOAD_ENDPOINT,
    },
  };

  const payload = {
    jobId,
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

async function addFile(fileData) {
  const { fileId, createdBy, jobId } = fileData;
  const fileName = `${fileData.fileName}_${Date.now()}.csv`;
  const fileType = FILE_TYPES.EXPORT;
  const format = '.csv';
  const mapping = {};
  const jobStatus = JOB_STATUS.QUEUED;
  const operationName =
    ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_VERIFY_ACCOUNT_EXPORT;

  const operationParam = {};
  const resultProcessed = 0;
  const resultImported = 0;
  const resultErrored = 0;
  const rowCount = 0;
  const location = `files/master/${fileType}/${fileName}`;

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

function covertStringToNumber(string) {
  const number = parseInt(string, 10);
  if (number.toString() === 'NaN') return null;
  return number;
}

function convertFormatAccount(_account) {
  const goldMineAccount = _.cloneDeep(_account);
  const processedGoldMineAccount = {
    name: goldMineAccount.name,
    website: goldMineAccount.website,
    type: 'Head Office',
    domain: goldMineAccount.domain,
    email: goldMineAccount.email,
    sicDescription: goldMineAccount.sicDescription,
    naicsDescription: goldMineAccount.naicsDescription,
    industry: goldMineAccount.industry,
    subIndustry: goldMineAccount.subIndustry,
    description: goldMineAccount.description,
    liUrl: goldMineAccount.linkedInUrl,
    disposition: goldMineAccount.disposition,
    masterDisposition: goldMineAccount.masterDisposition,
    masterUpdatedAt: goldMineAccount.masterUpdatedAt,
    comments: goldMineAccount.comments,
    parentAccountDomain: getDomain(goldMineAccount.parentWebsite),
  };

  if (_.get(goldMineAccount, 'disposition', null)) {
    switch (goldMineAccount.disposition) {
      case 'Acquired/Merged/Subsidiary':
      case 'Bankrupt/Shut Down':
        break;
      default:
        processedGoldMineAccount.disposition = 'Active Account';
        break;
    }
  }

  const location = {};

  if (_.get(goldMineAccount, 'addressHQ', null)) {
    location.address1 = goldMineAccount.addressHQ.address1HQ;
    location.address2 = goldMineAccount.addressHQ.address2HQ;
    location.city = goldMineAccount.addressHQ.cityHQ;
    location.state = goldMineAccount.addressHQ.stateHQ;
    location.zipCode = goldMineAccount.addressHQ.zipCodeHQ;
    location.country = goldMineAccount.addressHQ.countryHQ;
  }

  if (_.get(goldMineAccount, 'phoneHQ', null)) {
    location.phone1 = goldMineAccount.phoneHQ;
  }
  processedGoldMineAccount.location = location;

  if (_.get(goldMineAccount, 'segment_technology', null)) {
    processedGoldMineAccount.technology = goldMineAccount.segment_technology;
  }

  if (_.get(goldMineAccount, 'employeeSize', null)) {
    try {
      processedGoldMineAccount.employeeSize = covertStringToNumber(
        goldMineAccount.employeeSize,
      );
    } catch (error) {
      console.error(
        `[VERIFY_ACCOUNT_SERVICE] :: Error in parsing 'employeeSize'`,
      );
    }
  }

  if (_.get(goldMineAccount, 'employeeSizeLI', null)) {
    try {
      processedGoldMineAccount.employeeSizeLI = covertStringToNumber(
        goldMineAccount.employeeSizeLI,
      );
    } catch (error) {
      console.error(
        `[VERIFY_ACCOUNT_SERVICE] :: Error in parsing 'employeeSizeLI'`,
      );
    }
  }

  if (_.get(goldMineAccount, 'employeeSizeZ_plus', null)) {
    try {
      processedGoldMineAccount.employeeSizeZPlus = covertStringToNumber(
        goldMineAccount.employeeSizeZ_plus,
      );
    } catch (error) {
      console.error(
        `[VERIFY_ACCOUNT_SERVICE] :: Error in parsing 'employeeSizeZ_plus'`,
      );
    }
  }

  if (_.get(goldMineAccount, 'employeeSize_others', null)) {
    try {
      processedGoldMineAccount.employeeSizeOthers = covertStringToNumber(
        goldMineAccount.employeeSize_others,
      );
    } catch (error) {
      console.error(
        `[VERIFY_ACCOUNT_SERVICE] :: Error in parsing 'employeeSize_others'`,
      );
    }
  }

  if (_.get(goldMineAccount, 'revenue', null)) {
    try {
      processedGoldMineAccount.revenue = covertStringToNumber(
        goldMineAccount.revenue,
      );
    } catch (error) {
      console.error(`[VERIFY_ACCOUNT_SERVICE] :: Error in parsing 'revenue'`);
    }
  }

  if (_.get(goldMineAccount, 'sicCode', null)) {
    try {
      processedGoldMineAccount.sicCode = covertStringToNumber(
        goldMineAccount.sicCode,
      );
    } catch (error) {
      console.error(`[VERIFY_ACCOUNT_SERVICE] :: Error in parsing 'sicCode'`);
    }
  }

  if (_.get(goldMineAccount, 'naicsCode', null)) {
    try {
      processedGoldMineAccount.naicsCode = covertStringToNumber(
        goldMineAccount.naicsCode,
      );
    } catch (error) {
      console.error(`[VERIFY_ACCOUNT_SERVICE] :: Error in parsing 'naicsCode'`);
    }
  }

  return processedGoldMineAccount;
}

async function saveAccount(inputs) {
  const { userEmail } = inputs;
  let { account, changedAccountData } = inputs;

  account = this.sanitizer.sanitize(account);
  changedAccountData = this.sanitizer.sanitize(changedAccountData);

  let formateChangedAccountData = this.convertFormatAccount(changedAccountData);

  const omitFields = ['type', 'name'];
  if (_.isEmpty(formateChangedAccountData.location)) {
    omitFields.push('location');
  }

  formateChangedAccountData = _.omit(formateChangedAccountData, omitFields);

  let formateChangedAccountDataString = Object.values(
    formateChangedAccountData,
  ).join('');

  const formateChangedAccountDataKeys = Object.keys(formateChangedAccountData);
  formateChangedAccountDataKeys.forEach((key) => {
    if (!formateChangedAccountData[key]) {
      formateChangedAccountDataString += null;
    }
  });

  let accountValueUpdated = true;

  if (formateChangedAccountDataString.length === 0) {
    accountValueUpdated = false;
  }

  account = this.convertFormatAccount(account);
  account.createdUserEmail = userEmail;

  /* Manage Disposition changes and update only if necessary */
  const keysAccounts = Object.keys(_.omit(changedAccountData, 'domain'));

  if (keysAccounts.length === 1 && keysAccounts.indexOf('disposition') > -1) {
    const { disposition } = formateChangedAccountData;
    const { masterDisposition } = account;
    if (masterDisposition === disposition) {
      console.info(
        `[VERIFY_ACCOUNT] :: Account Found with same disposition,  accountDomain : ${account.domain}`,
      );
      accountValueUpdated = false;
    } else {
      accountValueUpdated = true;
    }
  }

  if (accountValueUpdated) {
    const updatedAccount = await this.createAccount(account);
    return {
      account: updatedAccount,
      updateDate: false,
    };
  }

  const accountUpdatedDt = moment(account.masterUpdatedAt);
  const now = moment();
  const updateMasterDate = now.diff(accountUpdatedDt, 'years');
  if (updateMasterDate > 0) {
    const payload = {
      domain: account.domain,
      account: {
        updatedAt: new Date(),
        requestedBy: userEmail,
      },
    };
    const masterAccount = await this.accountCRUDService.editAccount(payload);
    console.info(
      `[VERIFY_ACCOUNT] :: Account updated with Latest date,  accountDomain : ${masterAccount.domain}`,
    );
    return {
      updateDate: true,
      account: masterAccount,
    };
  }

  return {
    account,
    updateDate: false,
  };
}

async function createAccount(_account) {
  const account = _.cloneDeep(_account);
  if (!account) {
    const error = new Error();
    error.message = `Could Not Create Account, Account Is Missing`;
    error.code = `BAD_ACCOUNT_DATA`;
    const serializedError = serializeError(error);
    console.error(
      `[CREATE_VERIFY_ACCOUNT] :: ERROR : Invalid Account Data :  ${JSON.stringify(
        serializedError.message,
      )}`,
    );
    throw error;
  }
  const accountInstance = await this.findAccount(account.domain);
  if (!accountInstance) {
    const createdAccount = await VerifyAccount.create(account);

    console.info(
      `[CREATE_VERIFY_ACCOUNT] :: Account Created,  accountDomain : ${createdAccount.domain}`,
    );

    return createdAccount;
  }

  const updatedAccountInstance = _.merge(accountInstance, account);
  if (account.location) {
    updatedAccountInstance.changed('location', true);
  }
  if (account.technology) {
    updatedAccountInstance.changed('technology', true);
  }

  console.info(
    `[CREATE_VERIFY_ACCOUNT] :: Account Updated,  accountDomain : ${updatedAccountInstance.domain}`,
  );
  return updatedAccountInstance.save();
}

async function findAccount(domain) {
  if (!domain) {
    const error = new Error();
    error.message = `domain is required`;
    error.code = `BAD_ACCOUNT_ID`;
    const serializedError = serializeError(error);
    this.logger.error(
      `[FIND_ACCOUNT] :: Could Not Find Reference domain to Find Account : ${JSON.stringify(
        serializedError.message,
      )}`,
    );
    throw serializedError;
  }

  // Find Account if Exist
  const accountInstance = await VerifyAccount.findOne({
    where: {
      domain,
    },
  });

  if (accountInstance) {
    this.logger.info(
      `[FIND_ACCOUNT] :: Account found with domain: ${accountInstance.domain}`,
    );
    return accountInstance;
  }
  return null;
}

VerifyAccountCRUDService.prototype = {
  getAllAccount,
  downloadAllAccount,
  updateJobStatus,
  addFile,
  enqueue,
  saveAccount,
  createAccount,
  convertFormatAccount,
  findAccount,
};

module.exports = VerifyAccountCRUDService;
