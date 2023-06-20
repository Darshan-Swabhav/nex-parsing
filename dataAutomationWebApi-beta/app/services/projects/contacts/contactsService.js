/* eslint-disable global-require */
const _ = require('lodash');
const { serializeError } = require('serialize-error');
const {
  Contact,
  User,
  Account,
  Project,
  File,
  Job,
  sequelize,
  Sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');
const { CloudTasksClient } = require('@google-cloud/tasks');

const taskQueueClient = new CloudTasksClient();
const {
  contactExporter,
} = require('@nexsalesdev/da-download-service-repository');
const {
  JOB_STATUS,
  JOB_OPERATION_NAME,
  FILE_TYPES,
  LABELS,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;

function ContactCRUDService() {
  const config = settingsConfig.settings || {};

  const TaskLinkCRUDService = require('../tasks/taskLinkService');
  const Sanitizer = require('../../commonServices/sanitizer');
  const AccountFinder = require('../../commonServices/accountFinder');
  const ContactCheckService = require('../../commonServices/checkContact');
  const ContactSaveService = require('../../commonServices/saveContact');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');
  const ProjectService = require('../projectService');
  const ContactService = require('../../clients/contacts/contactsService');

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
  this.taskLinkCrudService = new TaskLinkCRUDService();
  this.sanitizer = new Sanitizer();
  this.contactCheckService = new ContactCheckService();
  this.accountFinder = new AccountFinder();
  this.contactSaveService = new ContactSaveService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
  this.projectService = new ProjectService();
  this.contactService = new ContactService();
}

function isDataChanged(oldData, newData) {
  const result = {
    aynChange: false,
    all: false,
    email: false,
    phone: false,
    company: false,
  };
  if (oldData.firstName !== newData.firstName) {
    this.logger.info(
      `[CREATE_CONTACT] :: Existing firstName : ${oldData.firstName} New firstName : ${newData.firstName}`,
    );
    result.aynChange = true;
    result.all = true;
    return result;
  }
  if (oldData.lastName !== newData.lastName) {
    this.logger.info(
      `[CREATE_CONTACT] :: Existing lastName : ${oldData.lastName} New lastName : ${newData.lastName}`,
    );
    result.aynChange = true;
    result.all = true;
    return result;
  }
  if (oldData.phone !== newData.phone) {
    this.logger.info(
      `[CREATE_CONTACT] :: Existing lastName : ${oldData.phone} New lastName : ${newData.phone}`,
    );
    result.phone = true;
    result.aynChange = true;
  }
  if (oldData.email !== newData.email) {
    this.logger.info(
      `[CREATE_CONTACT] :: Existing lastName : ${oldData.email} New lastName : ${newData.email}`,
    );
    result.email = true;
    result.aynChange = true;
  }
  if (oldData.Account.name !== newData.Account.name) {
    this.logger.info(
      `[CREATE_CONTACT] :: Existing companyName : ${oldData.Account.name} New companyName : ${newData.Account.name}`,
    );
    result.company = true;
    result.aynChange = true;
  }
  return result;
}

function filterArrayValue(columnName, filterValues) {
  const conditions = [];
  for (let index = 0; index < filterValues.length; index += 1) {
    const element = filterValues[index];
    const value = element.toLowerCase();
    conditions.push(
      Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col(columnName)),
        'LIKE',
        `%${value}%`,
      ),
    );
  }
  return {
    [Op.or]: conditions,
  };
}

function buildWhereClause(filter, _where) {
  const where = _where;
  if (filter.stage) {
    if (filter.stage.toLowerCase() === 'ready') {
      where.stage = Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('Contact.stage')),
        '=',
        'ready',
      );
    } else {
      where.stage = Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('Contact.stage')),
        '=',
        filter.stage.toLowerCase(),
      );
    }
  }
  if (filter.jobLevel && _.isArray(filter.jobLevel)) {
    where.jobLevel = filterArrayValue('jobLevel', filter.jobLevel);
  }
  if (filter.jobTitle && _.isArray(filter.jobTitle)) {
    where.jobTitle = filterArrayValue('jobTitle', filter.jobTitle);
  }
  if (filter.jobDepartment && _.isArray(filter.jobDepartment)) {
    where.jobDepartment = filterArrayValue(
      'jobDepartment',
      filter.jobDepartment,
    );
  }
  if (Array.isArray(filter.dispositions) && filter.dispositions.length) {
    const disposiionConditions = [];
    for (let index = 0; index < filter.dispositions.length; index += 1) {
      let disposition = filter.dispositions[index];
      disposition = disposition.trim().toLowerCase();
      if (disposition === 'pending') {
        disposiionConditions.push(
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('Contact.disposition')),
            {
              [Op.eq]: null,
            },
          ),
        );
      }
      disposiionConditions.push(
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('Contact.disposition')),
          {
            [Op.eq]: disposition,
          },
        ),
      );
    }
    where.disposition = {
      [Op.or]: disposiionConditions,
    };
  }
  if (Array.isArray(filter.researchStatus) && filter.researchStatus.length) {
    const statusConditions = [];
    for (let index = 0; index < filter.researchStatus.length; index += 1) {
      let status = filter.researchStatus[index];
      status = status.trim().toLowerCase();
      if (status === 'pending') {
        statusConditions.push(
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('Contact.researchStatus')),
            {
              [Op.eq]: null,
            },
          ),
        );
      }
      statusConditions.push(
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('Contact.researchStatus')),
          {
            [Op.eq]: status,
          },
        ),
      );
    }
    where.researchStatus = {
      [Op.or]: statusConditions,
    };
  }
  return where;
}

function buildOrderClause(sort, order) {
  if (
    sort.firstName &&
    (sort.firstName.toLowerCase() === 'asc' ||
      sort.firstName.toLowerCase() === 'desc')
  ) {
    order.push(['firstName', sort.firstName]);
  }
  if (sort.createdAt) {
    order.push(['createdAt', sort.createdAt]);
  }
  if (sort.updatedAt) {
    order.push(['updatedAt', sort.updatedAt]);
  }
  return order;
}

async function getAllContact(inputs, _filter, _sort) {
  const filter = _.cloneDeep(_filter);
  const sort = _.cloneDeep(_sort);
  this.logger.debug(
    `[getAllContact] : Received Filter: ${JSON.stringify(filter)}`,
  );
  const { projectId, limit, offset } = inputs;

  let where = {};
  where[`$Account.ProjectId$`] = projectId;

  const filterColumnsMapping = {
    companyName: `$Account.name$`,
    domain: `$Account.domain$`,
    accountLabel: `$Account.label$`,
    contactLabel: `$Contact.label$`,
    updatedBy: `$contactUpdater.userName$`,
  };
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  const sortColumnsMapping = {
    companyName: `"Account"."name"`,
    domain: `"Account"."domain"`,
  };
  const customSortColumn = {};
  let order = [];
  order = this.sortHandler.buildOrderClause(
    sortColumnsMapping,
    customSortColumn,
    sort,
    order,
  );

  if (!order.length) order = [['updatedAt', 'desc']];

  const result = await Contact.findAndCountAll({
    attributes: [
      'firstName',
      'lastName',
      'jobTitle',
      'disposition',
      'researchStatus',
      'stage',
      'complianceStatus',
      'updatedAt',
      ['label', 'contactLabel'],
      [Sequelize.col('Account.name'), 'companyName'],
      [Sequelize.col('Account.domain'), 'domain'],
      [Sequelize.col('Account.label'), 'accountLabel'],
      [Sequelize.col('contactUpdater.userName'), 'updatedBy'],
    ],
    where,
    order,
    include: [
      {
        model: Account,
        attributes: [],
        required: true,
      },
      {
        model: User,
        as: 'contactUpdater',
        attributes: [],
      },
    ],
    offset,
    limit,
    raw: true,
    subQuery: false,
  });

  const contacts = {};
  contacts.totalCount = result.count;

  contacts.docs = result.rows.map((_contact) => {
    let contact = _contact;

    contact.contactFullName = _.join(
      [contact.firstName, contact.lastName],
      ' ',
    ).trim();

    contact = _.omit(contact, ['firstName', 'lastName']);

    return contact;
  });

  return contacts;
}

async function getAllContactOfAccount(inputs, filter, sort) {
  const { projectId, accountId, limit, offset } = inputs;

  let where = {};
  let order = [];

  where = buildWhereClause(filter, where);
  order = buildOrderClause(sort, order);

  const result = await Contact.findAndCountAll({
    where: [where],
    order,
    include: [
      {
        model: User,
        where: {
          '$Contact.AccountId$': accountId,
          '$Contact.ProjectId$': projectId,
        },
        required: true,
        as: 'contactCreator',
        attributes: ['userName', 'firstName', 'lastName'],
      },
    ],
    offset,
    limit,
  });

  const contacts = {};
  contacts.totalCount = result.count;
  contacts.docs = result.rows;
  return contacts;
}

async function getContactById(inputs) {
  const { projectId, accountId, contactId } = inputs;

  const result = await Contact.findOne({
    where: [
      {
        id: contactId,
      },
    ],
    include: [
      {
        model: Account,
        where: [
          {
            id: accountId,
          },
          {
            ProjectId: projectId,
          },
        ],
      },
    ],
  });

  if (result && !result.stage) {
    result.stage = 'Pending';
  }
  if (result && !result.Account.stage) {
    result.Account.stage = 'Pending';
  }
  return result;
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

async function addFile(fileData, isAsyncDownload = false) {
  const { fileId, projectId, createdBy, jobId } = fileData;

  let projectName = await this.getProjectName(projectId);
  projectName = projectName.trim().replace(' ', '_');

  const fileName = `${projectName}_contact_compliance_${new Date(
    Date.now(),
  )}.csv`;
  const fileType = FILE_TYPES.EXPORT;
  const format = '.csv';
  const mapping = {};
  const updatedBy = fileData.updatedBy || createdBy;
  const jobStatus = isAsyncDownload ? JOB_STATUS.QUEUED : JOB_STATUS.PROCESSING;
  const operationName = isAsyncDownload
    ? JOB_OPERATION_NAME.ASYNC_CONTACT_EXPORT
    : JOB_OPERATION_NAME.SYNC_CONTACT_EXPORT;
  const operationParam = {};
  const resultProcessed = 0;
  const resultImported = 0;
  const resultErrored = 0;
  const rowCount = 0;
  const location = isAsyncDownload
    ? `files/${projectId}/${fileType}/${fileName}${format}`
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

async function downloadAllContact(
  _inputs,
  filter,
  writableStream,
  isAsyncDownload = false,
) {
  const inputs = _.cloneDeep(_inputs);
  // Check (File is big or not)
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
  return contactExporter(writableStream, dbParam);
}

async function getFileIsLarger(projectId, filter, maximumRecords = 0) {
  let where = {};
  where[`$Account.ProjectId$`] = projectId;

  const filterColumnsMapping = {
    companyName: `$Account.name$`,
    domain: `$Account.domain$`,
    accountLabel: `$Account.label$`,
    contactLabel: `$Contact.label$`,
    updatedBy: `$contactUpdater.userName$`,
  };

  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  const count = await Contact.count({
    where: [where],
    include: [
      {
        model: Account,
        required: true,
      },
      {
        model: User,
        as: 'contactUpdater',
      },
    ],
  });

  return count > maximumRecords;
}

async function getAllContactResearchStatus(inputs, _filter) {
  const filter = _filter ? _.cloneDeep(_filter) : {};
  const { projectId } = inputs;

  let where = {};
  where[`$Account.ProjectId$`] = projectId;

  delete filter.researchStatus;

  const filterColumnsMapping = {
    companyName: `$Account.name$`,
    domain: `$Account.domain$`,
    accountLabel: `$Account.label$`,
    contactLabel: `$Contact.label$`,
    updatedBy: `$contactUpdater.userName$`,
  };
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  let result = await Contact.findAll({
    attributes: ['researchStatus', [sequelize.fn('count', '*'), 'count']],
    group: ['Contact.researchStatus'],
    include: [
      {
        model: Account,
        attributes: [],
        required: true,
      },
      {
        model: User,
        as: 'contactUpdater',
        attributes: [],
      },
    ],
    where,
    raw: true,
    subQuery: false,
  });

  let totalCount = 0;
  result = result.map((_researchStatusData) => {
    const researchStatusData = _.cloneDeep(_researchStatusData);
    totalCount += Number(researchStatusData.count);

    return researchStatusData;
  });

  return { data: result, totalCount };
}

async function getAllContactStages(inputs, _filter) {
  const filter = _filter ? _.cloneDeep(_filter) : {};
  const { projectId } = inputs;

  let where = {};

  where[`$Account.ProjectId$`] = projectId;

  delete filter.stage;

  const filterColumnsMapping = {
    companyName: `$Account.name$`,
    domain: `$Account.domain$`,
    accountLabel: `$Account.label$`,
    contactLabel: `$Contact.label$`,
    updatedBy: `$contactUpdater.userName$`,
  };
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  let result = await Contact.findAll({
    attributes: ['stage', [sequelize.fn('count', '*'), 'count']],
    group: ['Contact.stage'],
    include: [
      {
        model: Account,
        attributes: [],
        required: true,
      },
      {
        model: User,
        as: 'contactUpdater',
        attributes: [],
      },
    ],
    where,
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

async function getAllContactStats(inputs, filter) {
  const stats = {};
  const researchStatus = await this.getAllContactResearchStatus(inputs, filter);
  const stage = await this.getAllContactStages(inputs, filter);
  stats.researchStatus = researchStatus;
  stats.stage = stage;
  return stats;
}

async function getAllContactOfAUser(inputs) {
  const { userId, projectId, limit, offset } = inputs;

  const result = await Contact.findAll({
    include: [
      {
        model: Account,
        where: [
          {
            ProjectId: projectId,
          },
        ],
      },
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

async function saveContact(_contact, inputs, taskLinkData) {
  let contact = _.cloneDeep(_contact);

  if (!contact) {
    const error = new Error();
    error.code = 'BAD_CONTACT';
    error.desc = 'Could Not Find Contact To Save';
    const serializedError = serializeError(error);
    this.logger.error(
      `[SAVE_CONTACT] :: Cloud Not Save Contact : ${JSON.stringify(
        serializedError,
      )}`,
    );
    throw error;
  }

  let taskLink = taskLinkData || {};
  contact.AccountId = inputs.accountId;
  contact.ProjectId = inputs.projectId;
  contact.createdBy = inputs.userId;
  contact.updatedBy = inputs.userId;
  contact.ClientId = await this.projectService.getClientId(inputs.projectId);

  contact = this.sanitizer.sanitize(contact);

  if (!contact.zbDateAndTime) {
    contact.zbDateAndTime = null;
  }
  if (!contact.gmailStatusDateAndTime) {
    contact.gmailStatusDateAndTime = null;
  }
  if (typeof contact.zbDateAndTime === 'string') {
    contact.zbDateAndTime = new Date(contact.zbDateAndTime);
  }
  if (typeof contact.gmailStatusDateAndTime === 'string') {
    contact.gmailStatusDateAndTime = new Date(contact.gmailStatusDateAndTime);
  }

  if (contact.zb && !contact.zbDateAndTime) {
    contact.zbDateAndTime = new Date();
    this.logger.warn(
      `[SAVE_CONTACT] :: WARNING : Contact Has ZB Status but Don't Have ZB Date and Time  :  ${JSON.stringify(
        contact,
      )}`,
    );
  }

  // Find Account Here
  const accountInstance = await this.accountFinder.findAccount(
    contact.AccountId,
  );
  if (accountInstance === null) {
    const error = new Error();
    error.message = `Could Not Find Account with ID: ${contact.AccountId}, Account Reference Dose Not Exist`;
    error.code = 'INVALID_ACCOUNT_ID';
    const serializedErr = serializeError(error);
    this.logger.error(
      `[SAVE_CONTACT] :: ERROR : Account Reference Dose Not Exist :  ${JSON.stringify(
        serializedErr,
      )}`,
    );
    throw error;
  }

  if (!contact.label) {
    contact.label = 'inclusion';
  }
  contact.companyName = this.sanitizer.sanitize(accountInstance.name);

  // Check Contact
  let contactId;
  const { labeledContact: reEvaluatedContact } =
    await this.contactCheckService.check(contact);

  // Check Reused Contact

  const contactCheckResult = await this.contactService.checkContactReuse(
    contact,
    inputs,
  );

  if (contactCheckResult.matchType) {
    if (!reEvaluatedContact.label || reEvaluatedContact.label === 'inclusion') {
      reEvaluatedContact.label = contactCheckResult.matchType;
    }
    if (reEvaluatedContact.disposition === 'Contact Built') {
      reEvaluatedContact.researchStatus = 'QR';
      reEvaluatedContact.disposition = 'Contact Built/Reuse';
      taskLink.researchStatus = 'QR';
      taskLink.disposition = 'Contact Built/Reuse';
    }
  }

  // Save Contact
  try {
    contactId = await this.contactSaveService.saveContact(reEvaluatedContact);
  } catch (error) {
    error.code = 'CONTACT_SAVE_ERROR';
    error.desc =
      'Could Not Save Contact, Something Went wrong while Contact Creation';
    throw error;
  }

  // Dispose Contact
  if (inputs.disposeContact) {
    try {
      taskLink = this.sanitizer.sanitize(taskLink);
      const disposeContactResult =
        await this.taskLinkCrudService.disposeContact(
          reEvaluatedContact,
          inputs,
          taskLink,
        );
      return {
        contactId,
        disposeContactResult,
      };
    } catch (error) {
      error.code = 'CONTACT_DISPOSITION_ERROR';
      error.desc =
        'Could Not Dispose Contact, Something Went wrong while Disposing Contact';
      throw error;
    }
  }
  return {
    contactId,
  };
}

async function checkContactSuppressionAndDuplicate(_contact, inputs) {
  let contact = _.cloneDeep(_contact);
  contact = this.sanitizer.sanitize(contact);
  const logger = this.logger || console;
  const { checkSuppression, checkDuplicate } = inputs;

  // call Contact Check Common Service
  const { duplicateCheckResult, suppressionCheckResult } =
    await this.contactCheckService.check(contact, {
      checkSuppression,
      checkDuplicate,
    });

  const contactDupSupResult = {};
  if (duplicateCheckResult.isDuplicate) {
    contactDupSupResult.matchType = LABELS.DUPLICATE;
    contactDupSupResult.matchCase = duplicateCheckResult.duplicateMatchCase;
    contactDupSupResult.matchWith = duplicateCheckResult.duplicateWith;
  } else if (suppressionCheckResult.isSuppressed) {
    contactDupSupResult.matchType = LABELS.EXACT_SUPPRESSED;
    contactDupSupResult.matchCase = suppressionCheckResult.suppressionMatchCase;
    contactDupSupResult.matchWith = suppressionCheckResult.suppressedWith;
  } else if (suppressionCheckResult.isFuzzySuppressed) {
    contactDupSupResult.matchType = LABELS.FUZZY_SUPPRESSED;
    contactDupSupResult.matchCase = suppressionCheckResult.fuzzyMatchCase;
    contactDupSupResult.matchWith = suppressionCheckResult.fuzzyMatches;
  }

  logger.info(
    `[CONTACT-SERVICE] : Check Result : ${JSON.stringify(contactDupSupResult)}`,
  );
  return contactDupSupResult;
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

async function getContactDispositions(inputs) {
  const { projectId } = inputs;
  const where = {};
  where[`$Account.ProjectId$`] = projectId;

  const result = await Contact.findAll({
    attributes: ['Contact.disposition'],
    group: ['Contact.disposition'],
    include: [
      {
        model: Account,
        attributes: [],
        required: true,
      },
    ],
    where,
    raw: true,
  });

  const uniqueValues = result.map((item) => item.disposition);
  return uniqueValues;
}

async function getContactUpdatedBy(inputs) {
  const { projectId } = inputs;
  const where = {};
  where[`$Account.ProjectId$`] = projectId;

  const result = await Contact.findAll({
    attributes: ['contactUpdater.userName'],
    group: ['contactUpdater.userName'],
    include: [
      {
        model: Account,
        attributes: [],
        required: true,
      },
      {
        model: User,
        as: 'contactUpdater',
        attributes: [],
      },
    ],
    where,
    raw: true,
  });

  const uniqueValues = result.map((item) => item.userName);
  return uniqueValues;
}

ContactCRUDService.prototype = {
  getAllContact,
  getAllContactOfAccount,
  getContactById,
  getAllContactOfAUser,
  downloadAllContact,
  getAllContactStats,
  saveContact,
  checkContactSuppressionAndDuplicate,
  isDataChanged,
  getFileIsLarger,
  enqueue,
  updateJobStatus,
  getContactDispositions,
  getAllContactResearchStatus,
  getAllContactStages,
  getContactUpdatedBy,
  addFile,
  getProjectName,
};
module.exports = ContactCRUDService;
