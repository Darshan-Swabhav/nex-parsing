/* eslint-disable global-require */
const _ = require('lodash');
const dedupeKeysGenerator = require('@nexsalesdev/da-dedupekeys-generator');
const {
  User,
  Project,
  Task,
  Account,
  TaskLink,
  File,
  Job,
  Sequelize,
  sequelize,
  Disposition,
} = require('@nexsalesdev/dataautomation-datamodel');
const {
  FILE_TYPES,
  JOB_OPERATION_NAME,
  JOB_STATUS,
  LABELS,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const { CloudTasksClient } = require('@google-cloud/tasks');

const taskQueueClient = new CloudTasksClient();
const {
  accountExporter,
} = require('@nexsalesdev/da-download-service-repository');
const { serializeError } = require('serialize-error');

const { Op } = Sequelize;
const settingsConfig = require('../../../config/settings/settings-config');

function AccountCRUDService() {
  const config = settingsConfig.settings || {};
  this.config = config;
  this.logger = settingsConfig.logger || console;

  const Sanitizer = require('../../commonServices/sanitizer');
  const AccountFinder = require('../../commonServices/accountFinder');
  const CheckAccountService = require('../../commonServices/checkAccount');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  this.sanitizer = new Sanitizer();
  this.accountFinder = new AccountFinder();
  this.accountCheckService = new CheckAccountService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

async function getAllAccount(inputs, _filter, _sort) {
  const filter = _filter ? _.cloneDeep(_filter) : {};
  const sort = _.cloneDeep(_sort);
  const { projectId, limit, offset } = inputs;

  const accountsWhere = [];
  let where = {};
  where.ProjectId = projectId;

  if (filter.isAssigned) {
    accountsWhere.push(
      Sequelize.where(
        sequelize.literal(
          `CASE WHEN "Tasks"."UserId" IS NULL THEN FALSE ELSE TRUE END`,
        ),
        'IS',
        JSON.parse(filter.isAssigned.value.toString()),
      ),
    );
    delete filter.isAssigned;
  }

  const filterColumnsMapping = {};
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  accountsWhere.push(where);

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

  const result = await Account.findAll({
    attributes: [
      'name',
      'domain',
      'industry',
      'masterDisposition',
      'masterComments',
      'disposition',
      'researchStatus',
      'stage',
      'complianceStatus',
      'label',
      'duplicateOf',
      'createdAt',
      'updatedAt',
      'potential',
      [
        sequelize.literal(
          `CASE WHEN "Tasks"."UserId" IS NULL THEN FALSE ELSE TRUE END`,
        ),
        'isAssigned',
      ],
    ],
    where: accountsWhere,
    include: [
      {
        model: Task,
        where: {
          status: {
            [Op.ne]: 'In-Active',
          },
          ProjectId: projectId,
        },
        required: false,
        attributes: [],
        through: {
          attributes: [],
        },
      },
    ],
    order,
    offset,
    limit,
    group: ['Account.id', 'isAssigned'],
    raw: true,
    subQuery: false,
  });

  const count = await Account.count({
    where: accountsWhere,
    include: [
      {
        model: Task,
        where: {
          status: {
            [Op.ne]: 'In-Active',
          },
          ProjectId: projectId,
        },
        required: false,
        attributes: [],
        through: {
          attributes: [],
        },
      },
    ],
    order,
    group: ['Account.id'],
    raw: true,
    subQuery: false,
  });

  const accounts = {};
  accounts.totalCount = count.length;
  accounts.docs = result;
  return accounts;
}

async function getProjectName(projectId) {
  const result = await Project.findOne({
    attributes: ['aliasName'],
    where: [
      {
        id: projectId,
      },
    ],
  });

  return result.aliasName;
}

function generateFileNameBasedOnFilter(_projectName, filter) {
  let projectName = _projectName;
  projectName = projectName.trim().replace(' ', '_');

  let fileName = `${projectName}_account_compliance_${new Date(
    Date.now(),
  )}.csv`;

  if (filter.stage === 'Ready') {
    fileName = `${projectName}_account_deliverable_${new Date(Date.now())}.csv`;
  } else if (filter.stage === 'In Progress') {
    fileName = `${projectName}_account_in_progress_${new Date(Date.now())}.csv`;
  }

  return fileName;
}

async function addFile(fileData, isAsyncDownload = false) {
  const { fileId, projectId, createdBy, jobId } = fileData;
  const projectName = await this.getProjectName(projectId);
  const fileName = this.generateFileNameBasedOnFilter(
    projectName,
    fileData.filter,
  );
  const fileType = FILE_TYPES.EXPORT;
  const format = '.csv';
  const mapping = {};
  const updatedBy = fileData.updatedBy || createdBy;
  const jobStatus = isAsyncDownload ? JOB_STATUS.QUEUED : JOB_STATUS.PROCESSING;
  const operationName = isAsyncDownload
    ? JOB_OPERATION_NAME.ASYNC_ACCOUNT_EXPORT
    : JOB_OPERATION_NAME.SYNC_ACCOUNT_EXPORT;
  const operationParam = {};
  const resultProcessed = 0;
  const resultImported = 0;
  const resultErrored = 0;
  const rowCount = 0;
  const location = isAsyncDownload
    ? `files/${projectId}/${fileType}/${fileName}`
    : '';

  return File.create(
    {
      id: fileId,
      name: fileName,
      type: fileType,
      format,
      location,
      mapping,
      ProjectId: projectId,
      createdBy,
      updatedBy,
      Job: {
        id: jobId,
        status: jobStatus,
        operation_name: operationName,
        operation_param: operationParam,
        result_processed: resultProcessed,
        result_imported: resultImported,
        result_errored: resultErrored,
        createdBy,
        updatedBy,
        row_count: rowCount,
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

async function enqueue(jobId, projectId, filter) {
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: this.config.FILE_DOWNLOAD_ENDPOINT,
    },
  };

  const payload = {
    jobId,
    projectId,
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
    this.logger.error('>>>>>>>> :/ Cloud Not Create Task');
    this.logger.error(error);
    throw error;
  }
}

async function downloadAllAccount(
  _inputs,
  filter,
  writableStream,
  isAsyncDownload = false,
) {
  const inputs = _.cloneDeep(_inputs);
  const fileData = {
    fileId: inputs.fileId,
    jobId: inputs.jobId,
    projectId: inputs.projectId,
    filter,
    createdBy: inputs.userId,
    updatedBy: inputs.userId,
  };

  await this.addFile(fileData, isAsyncDownload);

  if (isAsyncDownload) {
    // Async Download Procedure
    return this.enqueue(fileData.jobId, fileData.projectId, filter);
  }
  // sync Download Procedure
  const dbParam = {
    jobId: inputs.jobId,
    projectId: inputs.projectId,
    filter,
  };
  return accountExporter(writableStream, dbParam);
}

async function getFileIsLarger(projectId, _filter, maximumRecords = 0) {
  const filter = _filter ? _.cloneDeep(_filter) : {};
  const accountsWhere = [];
  let where = {};
  where.ProjectId = projectId;

  if (filter.isAssigned) {
    accountsWhere.push(
      Sequelize.where(
        sequelize.literal(
          `CASE WHEN "Tasks"."UserId" IS NULL THEN FALSE ELSE TRUE END`,
        ),
        'IS',
        JSON.parse(filter.isAssigned.value.toString()),
      ),
    );
    delete filter.isAssigned;
  }

  const filterColumnsMapping = {};
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  accountsWhere.push(where);

  const count = await Account.count({
    where: accountsWhere,
    include: [
      {
        model: Task,
        where: {
          status: {
            [Op.ne]: 'In-Active',
          },
          ProjectId: projectId,
        },
        required: false,
        attributes: [],
        through: {
          attributes: [],
        },
      },
    ],
    group: ['Account.id'],
    raw: true,
    subQuery: false,
  });

  return count.length > maximumRecords;
}

async function getAllAccountOfAUser(inputs) {
  const { projectId, userId, limit, offset } = inputs;

  const result = await Account.findAll({
    where: [
      {
        ProjectId: projectId,
      },
    ],
    include: [
      {
        model: User,
        where: [
          {
            id: userId,
          },
        ],
      },
    ],
    offset,
    limit,
  });

  return result;
}

async function getAllAccountDispositions(inputs, _filter) {
  const filter = _filter ? _.cloneDeep(_filter) : {};
  const { projectId } = inputs;

  const accountsWhere = [];
  let where = {};
  where.ProjectId = projectId;

  if (filter.isAssigned) {
    accountsWhere.push(
      Sequelize.where(
        sequelize.literal(
          `CASE WHEN "Tasks"."UserId" IS NULL THEN FALSE ELSE TRUE END`,
        ),
        'IS',
        JSON.parse(filter.isAssigned.value.toString()),
      ),
    );
  }
  delete filter.isAssigned;
  delete filter.disposition;

  const filterColumnsMapping = {};
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  accountsWhere.push(where);

  let result = await Account.findAll({
    attributes: [
      'disposition',
      [sequelize.literal(`count(DISTINCT("Account"."id"))`), 'count'],
    ],
    include: [
      {
        model: Task,
        where: {
          status: {
            [Op.ne]: 'In-Active',
          },
          ProjectId: projectId,
        },
        required: false,
        attributes: [],
        through: {
          attributes: [],
        },
      },
    ],
    group: ['Account.disposition'],
    where: accountsWhere,
    raw: true,
    subQuery: false,
  });

  let totalCount = 0;
  result = result.map((_dispositionData) => {
    const dispositionData = _.cloneDeep(_dispositionData);
    totalCount += Number(dispositionData.count);

    return dispositionData;
  });

  return { data: result, totalCount };
}

async function getAllAccountStages(inputs, _filter) {
  const filter = _filter ? _.cloneDeep(_filter) : {};
  const { projectId } = inputs;

  const accountsWhere = [];
  let where = {};

  where.ProjectId = projectId;

  if (filter.isAssigned) {
    accountsWhere.push(
      Sequelize.where(
        sequelize.literal(
          `CASE WHEN "Tasks"."UserId" IS NULL THEN FALSE ELSE TRUE END`,
        ),
        'IS',
        JSON.parse(filter.isAssigned.value.toString()),
      ),
    );
  }
  delete filter.isAssigned;
  delete filter.stage;

  const filterColumnsMapping = {};
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  accountsWhere.push(where);

  let result = await Account.findAll({
    attributes: [
      'stage',
      [sequelize.literal(`count(DISTINCT("Account"."id"))`), 'count'],
    ],
    include: [
      {
        model: Task,
        where: {
          status: {
            [Op.ne]: 'In-Active',
          },
          ProjectId: projectId,
        },
        required: false,
        attributes: [],
        through: {
          attributes: [],
        },
      },
    ],
    group: ['Account.stage'],
    where: accountsWhere,
    raw: true,
    subQuery: false,
  });

  let totalCount = 0;
  result = result.map((_stageData) => {
    const stageData = _.cloneDeep(_stageData);
    totalCount += Number(stageData.count);

    return stageData;
  });

  return { data: result, totalCount };
}

async function getAccountStats(inputs, filter) {
  const stats = {};
  const dispositions = await this.getAllAccountDispositions(inputs, filter);
  const stages = await this.getAllAccountStages(inputs, filter);
  stats.dispositions = dispositions;
  stats.stages = stages;
  return stats;
}

async function getAccountById(inputs) {
  const { projectId, accountId } = inputs;

  const result = await Account.findOne({
    where: {
      [Op.and]: [
        {
          id: accountId,
        },
        {
          ProjectId: projectId,
        },
      ],
    },
  });

  return result;
}

/**
 * Get All Output Objects of Given Task.
 * @param {string} taskId - Id of Task.
 */
async function getOutputObjects(taskId) {
  const outputObjects = await TaskLink.findAll({
    where: {
      TaskId: taskId,
      linkType: 'output',
    },
  });
  const result = {
    count: outputObjects.length,
    outputObject: outputObjects,
  };
  return result;
}

/**
 * Check if Given Disposition is Positive.
 * @param {string} disposition - disposition.
 */
async function isDispositionIsPositive(disposition) {
  if (!disposition) {
    return false;
  }

  // Ignore Disposition Pending
  if (disposition.toLowerCase() === 'pending') {
    return false;
  }

  const response = await Disposition.findOne({
    where: {
      dispositionType: disposition,
    },
  });
  if (!response) {
    const error = new Error(`Invalid Disposition : ${disposition}`);
    error.code = `INVALID_DISPOSITION`;
    throw error;
  }
  const isPositiveDisposition = response.dispositionCategory === 'Positive';
  return isPositiveDisposition;
}

/**
 * Find Account.
 * @param {string} accountId - Id of Account.
 */
async function findAccount(accountId) {
  const AccountInstance = await Account.findOne({ where: { id: accountId } });
  if (AccountInstance == null) {
    const error = new Error();
    error.message = `Could Not Find Account With Id: ${accountId}`;
    error.code = `BAD_ACCOUNT_ID`;
    throw error;
  }
  return AccountInstance;
}

/**
 * Check if Account is Disposed Positive.
 * @param {string} accountId - Id of Account.
 */
async function isAccountDisposedPositive(accountId) {
  const AccountInstance = await findAccount(accountId);
  return isDispositionIsPositive(AccountInstance.disposition);
}

/**
 * Check if Any Output Object Has Positive Disposition.
 * @param {Object[]} outputObjects - List of output Objects.
 */
async function isAnyOutputObjectDisposedPositive(outputObjects) {
  const promises = [];
  for (
    let outputObjectIndex = 0;
    outputObjectIndex < outputObjects.length;
    outputObjectIndex += 1
  ) {
    const outputObject = outputObjects[outputObjectIndex];
    promises.push(isDispositionIsPositive(outputObject.disposition));
  }
  const result = await Promise.all(promises);
  return result.includes(true);
}

/**
 * Save TaskLink.
 * @param {Object} taskLink - taskLink Object.
 */
async function writeTaskHistory(_taskLink) {
  let taskLink = _taskLink;

  taskLink = this.sanitizer.sanitize(taskLink);

  // Build Object From Data
  taskLink = TaskLink.build(taskLink);

  // Get Existing TaskLink Object
  const TaskLinkInstance = await TaskLink.findOne({
    where: { TaskId: taskLink.TaskId, ObjectId: taskLink.ObjectId },
  });

  if (TaskLinkInstance === null) {
    const error = new Error();
    error.message = `Could Not Find TaskLink With TaskId: ${taskLink.TaskId} & ObjectId: ${taskLink.ObjectId}`;
    error.code = `TASK_LINK_NOT_FOUND`;
    throw error;
  }

  // Merge Objects
  Object.keys(TaskLinkInstance.dataValues).forEach((key) => {
    TaskLinkInstance[key] = taskLink[key];
  });

  TaskLinkInstance.set('updatedAt', new Date());
  TaskLinkInstance.changed('updatedAt', true);

  return TaskLinkInstance.save();
}

/**
 * save Account disposition.
 * @param {Object} account - Account Object.
 * @param {string} account.id - Disposition.
 * @param {string} account.researchStatus - Research Status.
 * @param {string} account.callingStatus - Calling Status.
 * @param {string} account.complianceStatus - Compliance Status.
 * @param {string} account.stage - Stage.
 * @param {string} account.comments - Comments.
 * @param {string} account.source - Source.
 * @param {string} account.updatedBy - Updated By
 */
async function saveAccount(account) {
  let AccountInstance = await findAccount(account.id);

  Object.keys(account).forEach((key) => {
    AccountInstance[key] = account[key];
  });

  AccountInstance = this.sanitizer.sanitize(AccountInstance);
  return AccountInstance.save();
}

/**
 * Set Task Status To Complete.
 * @param {string} taskId - Id of Task.
 */
async function completeTask(taskId, userId) {
  const TaskInstance = await Task.findOne({ where: { id: taskId } });
  if (TaskInstance == null) {
    const error = new Error();
    error.message = `Could Not Find Task With Id: ${taskId}`;
    error.code = `BAD_TASK_ID`;
    throw error;
  }
  TaskInstance.status = 'Completed';
  TaskInstance.updatedBy = userId;
  TaskInstance.completedDate = new Date();
  return TaskInstance.save();
}

/**
 * Dispose The Account.
 * @param {Object} inputs - input data object.
 * @param {string} inputs.userId - Id of User.
 * @param {Object} inputs.account - Account Object.
 * @param {string} inputs.taskLink - TaskLink Object.
 */
async function dispose(inputs) {
  /*
  * BUSINESS RULES NEED TO BE IMPLEMENTED
  1. Check if Account have positive disposition
    1.1 Check if task has not output objects
      throw error `Task Does Not Have Any Positive Disposed outcomes`

    1.2 Check if task has output objects
      1.2.1 If output objects have positive disposition (Eg:- Contact Built)
        Set Account Disposition in Account Table
          Add a Task Link with the disposed Account
          Add Disposition with Username in Task Link
        Update Task Status to 'Completed'

      1.2.2 If output objects have negative disposition (Eg:- Title not found, Email Bad, etc)
        throw error `Task Does Not Have Any Positive Disposed outcomes`

  2. Check if Account have negative disposition
    2.1 If Account already has positive disposition
      Don't change Disposition
      Add a Task Link with the disposed Account
      Update Task Status to 'Completed'
    2.2 If Account already has negative or empty disposition
      Set Account Disposition in Account Table
      Add a Task Link with the disposed Account
      Add Disposition with Username in Task Link
      Update Task Status to 'Completed'
  */

  const { TaskId, userId } = inputs || {};
  let { account, taskLink } = inputs || {};

  account = this.sanitizer.sanitize(account);
  taskLink = this.sanitizer.sanitize(taskLink);

  const {
    id,
    disposition,
    parentDomain,
    researchStatus,
    callingStatus,
    complianceStatus,
    stage,
    comments,
    updatedBy,
    source,
  } = account;

  const isPositiveDisposition = await isDispositionIsPositive(
    account.disposition,
  );

  // 1. Check if Account have positive disposition
  if (isPositiveDisposition) {
    const getOutputObjectsResult = await getOutputObjects(TaskId);
    const outputObjects = await getOutputObjectsResult.outputObject;

    // 1.1 Check if task has not output objects
    if (getOutputObjectsResult.count === 0) {
      const error = new Error(
        `Account Does Not Have Contacts, So Can't Dispose The Account With Positive Disposition`,
      );
      error.code = `NO_CONTACTS_IN_ACCOUNT`;
      throw error;
    }
    // 1.2 If task has output objects
    // 1.2.1 If output objects have positive disposition (Eg:- Contact Built)
    const hasPositiveDisposedContact = await isAnyOutputObjectDisposedPositive(
      outputObjects,
    );
    if (hasPositiveDisposedContact) {
      return Promise.all([
        this.saveAccount({
          id,
          disposition,
          researchStatus,
          callingStatus,
          complianceStatus,
          stage,
          comments,
          updatedBy,
          source,
        }),
        this.writeTaskHistory(taskLink),
        this.completeTask(TaskId, userId),
      ]);
    }
    // 1.2.2 If output objects have negative disposition (Eg:- Title not found, Email Bad, etc)
    const error = new Error(
      `Account Does Not Have Any Positive Disposed Contacts, So Can't Dispose The Account With Positive Disposition`,
    );
    error.code = `NO_POSITIVE_DISPOSED_CONTACT`;
    throw error;
  }

  // 2. If Account have negative disposition
  const isAccountPreDisposedPositive = await isAccountDisposedPositive(
    account.id,
  );

  // 2.1 If Account already has positive disposition
  if (isAccountPreDisposedPositive) {
    return Promise.all([
      this.saveAccount({ id, source }), // Source
      this.writeTaskHistory(taskLink),
      this.completeTask(TaskId, userId),
    ]);
  }
  // 2.2 If Account already has negative or empty disposition
  return Promise.all([
    this.saveAccount({
      id,
      disposition,
      parentDomain,
      researchStatus,
      callingStatus,
      complianceStatus,
      stage,
      comments,
      updatedBy,
      source,
    }),
    this.writeTaskHistory(taskLink),
    this.completeTask(TaskId, userId),
  ]);
}

/**
 * Object Fields Validator.
 * @param {Object} object - target Object.
 * @param {Array} requiredFields - List of Mandatory Filed.
 */
function validateFields(object, requiredFields) {
  const missingFields = [];
  requiredFields.forEach((field) => {
    if (object[field] === 'undefined' || !object[field]) {
      missingFields.push(field);
    }
  });
  return missingFields;
}

async function updateAccount(_account) {
  const account = _.cloneDeep(_account);

  if (!account) {
    const error = new Error();
    error.desc = `Could Not Update Account,Account Is Missing`;
    error.code = `BAD_ACCOUNT_DATA`;
    const serializedError = serializeError(error);
    console.error(
      `[UPDATE_ACCOUNT] :: ERROR : Invalid Account Data :  ${JSON.stringify(
        serializedError,
      )}`,
    );
    throw error;
  }

  const accountInstance = await this.accountFinder.findAccount(account.id);

  if (accountInstance == null) {
    const error = new Error();
    error.desc = `Could Not Find Account With ID ${account.id}`;
    error.code = `BAD_ACCOUNT_ID`;
    const serializedError = serializeError(error);
    console.error(
      `[UPDATE_ACCOUNT] :: ERROR : Account Reference Dose Not Exist :  ${JSON.stringify(
        serializedError,
      )}`,
    );
    throw error;
  }
  account.createdBy = accountInstance.createdBy;

  const sanitizedAccount = this.sanitizer.sanitize(account);
  const sanitizedAccountInstance = this.sanitizer.sanitize(accountInstance);

  Object.keys(sanitizedAccountInstance.dataValues).forEach((key) => {
    sanitizedAccountInstance[key] = sanitizedAccount[key];
  });

  const updatedAccountInstance = _.cloneDeep(sanitizedAccountInstance);

  // postgres Model.save() not able to detect change in JSON fields
  // Github ISsue Link : https://github.com/sequelize/sequelize/issues/2862
  // https://sequelize.org/master/manual/upgrade-to-v6.html#-code-model-changed----code-
  if (account.addressHQ) {
    updatedAccountInstance.changed('addressHQ', true);
  }
  if (account.segment_technology) {
    updatedAccountInstance.changed('segment_technology', true);
  }

  return updatedAccountInstance.save();
}

/**
 * Update The Account.
 * @param {Object} inputs input data object.
 * @param {string} inputs.projectId - id of Project.
 * @param {string} inputs.accountId - Id of Account.
 * @param {string} inputs.userId - Id of User.
 * @param {Object} inputs.account - Account Object.
 */
async function editAccount(inputs) {
  let { account } = inputs;
  const { accountId, projectId, userId } = inputs;
  account.id = accountId;
  account.updatedBy = userId;
  account.ProjectId = projectId;

  account = this.sanitizer.sanitize(account);

  const dedupeGeneratorInput = {
    dataType: 'account',
    data: {
      companyName: account.name || '',
      website: account.website || '',
    },
  };
  const accountDedupeKeys = dedupeKeysGenerator(dedupeGeneratorInput);

  if (accountDedupeKeys) {
    account.scrubbedName = accountDedupeKeys.scrubbedCompanyName;
    account.domain = accountDedupeKeys.domain;
    account.aliasName = accountDedupeKeys.aliases;
    account.tokens = accountDedupeKeys.tokens;
  }

  if (!account.emailDomain) {
    account.emailDomain = account.domain;
  }

  // call check service, it will return a labeled account
  const { labeledAccount, duplicateCheckResult, suppressionCheckResult } =
    await this.accountCheckService.check(account);

  // update Account
  const updatedAccount = await this.updateAccount(labeledAccount);

  console.info(
    `[EDIT_ACCOUNT] :: Account Updated,  accountId : ${updatedAccount.id}`,
  );

  // reEvaluate all references
  // get all Duplicates of current Account
  const duplicateAccounts = await Account.findAll({
    where: {
      duplicateOf: labeledAccount.id,
      ProjectId: labeledAccount.ProjectId,
    },
  });

  // re-check and update all duplicate references
  const duplicateReferenceCount = duplicateAccounts.length;
  if (duplicateReferenceCount) {
    for (let counter = 0; counter < duplicateReferenceCount; counter += 1) {
      const duplicateAccountReference = duplicateAccounts[counter];
      const { labeledAccount: reEvaluatedAccountReference } =
        // eslint-disable-next-line no-await-in-loop
        await this.accountCheckService.check(duplicateAccountReference);
      // eslint-disable-next-line no-await-in-loop
      await this.updateAccount(reEvaluatedAccountReference);
    }
  }

  const accountDupSupResult = {};
  if (duplicateCheckResult.isDuplicate) {
    accountDupSupResult.matchType = LABELS.DUPLICATE;
    accountDupSupResult.matchCase = duplicateCheckResult.duplicateMatchCase;
    accountDupSupResult.matchWith = duplicateCheckResult.duplicateWith;
  } else if (suppressionCheckResult.isSuppressed) {
    accountDupSupResult.matchType = LABELS.SUPPRESSED;
    accountDupSupResult.matchCase = suppressionCheckResult.suppressionMatchCase;
    accountDupSupResult.matchWith = suppressionCheckResult.suppressedWith;
    await this.updateAccountSuppressionReason(accountId, accountDupSupResult);
  }
  return { account: updatedAccount, checkResult: accountDupSupResult };
}

async function updateAccountSuppressionReason(accountId, suppressionResult) {
  const reasonMapping = {
    WEBSITE_DOMAIN: 'domain',
    SCRUBBED_COMPANY_NAME: 'scrubbedName',
    COMPANY_ALIAS_NAME: 'aliasName',
    TOKENS: 'tokens',
  };
  const reason = reasonMapping[suppressionResult.matchCase];
  if (!reason) {
    return;
  }

  const reasonPayload = `${reason}: ${suppressionResult.matchWith[reason]}`;
  const contactPayload = {
    id: accountId,
    duplicateOf: reasonPayload,
  };
  await this.updateAccount(contactPayload);
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

async function checkAccountSuppressionAndDuplicate(_account, inputs) {
  let account = _.cloneDeep(_account);
  account = this.sanitizer.sanitize(account);
  const logger = this.logger || console;
  const { checkSuppression, checkDuplicate } = inputs;
  const result = {};

  // call Account Check Common Service
  const { duplicateCheckResult, suppressionCheckResult } =
    await this.accountCheckService.check(account, {
      checkSuppression,
      checkDuplicate,
    });

  if (duplicateCheckResult.isDuplicate) {
    result.matchType = LABELS.DUPLICATE;
    result.matchCase = duplicateCheckResult.duplicateMatchCase;
    result.matchWith = duplicateCheckResult.duplicateWith;
  } else if (suppressionCheckResult.isSuppressed) {
    result.matchType = LABELS.SUPPRESSED;
    result.matchCase = suppressionCheckResult.suppressionMatchCase;
    result.matchWith = suppressionCheckResult.suppressedWith;
    await this.updateAccountSuppressionReason(account.id, result);
  }

  logger.info(`[ACCOUNT_CHECK] : Check Result : ${JSON.stringify(result)}`);
  return result;
}

async function getAccountDispositions(inputs) {
  const { projectId } = inputs;

  const where = {};
  where.ProjectId = projectId;

  const result = await Account.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('disposition')), 'disposition'],
    ],
    where,
  });

  const accountDispositions = result.map((item) => item.disposition);
  return accountDispositions;
}

function getMandatoryFields(disposition) {
  const mandatoryFields = [
    {
      id: 'name',
      label: 'Company Name',
    },
    {
      id: 'website',
      label: 'Company Website',
    },
    {
      id: 'type',
      label: 'Company Type',
    },
  ];
  // NAS - TODO - Use Constants for Disposition later.
  switch (disposition) {
    case 'Acquired/Merged/Subsidiary':
    case 'Bankrupt/Shut Down':
    case 'Website Not Found':
      return mandatoryFields;
    default:
      return mandatoryFields.concat([
        {
          id: 'industry',
          label: 'Company Industry',
        },
        {
          id: 'addressHQ',
          subId: 'address1HQ',
          label: 'Company Address 1',
        },
        {
          id: 'addressHQ',
          subId: 'cityHQ',
          label: 'Company City',
        },
        {
          id: 'addressHQ',
          subId: 'countryHQ',
          label: 'Company Country',
        },
        {
          id: 'phoneHQ',
          label: 'Company Phone',
        },
      ]);
  }
}

function validateMandatoryFields(account) {
  const mandatoryFields = getMandatoryFields(account.disposition);
  const result = {
    valid: true,
    description: '',
  };

  for (let i = 0; i < mandatoryFields.length; i += 1) {
    if (!result.valid) return result;

    const field = mandatoryFields[i];
    let accountField = account[field.id];

    if (field.subId) {
      accountField = account[field.id][field.subId];
    }
    if (_.isEmpty(accountField)) {
      result.valid = false;
      result.description = `${field.label} is invalid`;
    }
  }

  return result;
}

AccountCRUDService.prototype = {
  getAllAccount,
  getAllAccountOfAUser,
  downloadAllAccount,
  getAccountById,
  dispose,
  validateFields,
  editAccount,
  saveAccount,
  writeTaskHistory,
  completeTask,
  updateAccount,
  getAccountStats,
  getFileIsLarger,
  enqueue,
  updateJobStatus,
  getAllAccountDispositions,
  getAllAccountStages,
  checkAccountSuppressionAndDuplicate,
  updateAccountSuppressionReason,
  getAccountDispositions,
  addFile,
  getProjectName,
  generateFileNameBasedOnFilter,
  getMandatoryFields,
  validateMandatoryFields,
};

module.exports = AccountCRUDService;
