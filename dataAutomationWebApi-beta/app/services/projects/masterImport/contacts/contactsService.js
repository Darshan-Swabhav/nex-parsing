const _ = require('lodash');
const { serializeError } = require('serialize-error');
const { uuid } = require('uuidv4');
const { CloudTasksClient } = require('@google-cloud/tasks');

const {
  ProjectSetting,
  sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');
const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

const { File, Job, Project } = require('@nexsalesdev/dataautomation-datamodel');

const {
  FILE_TYPES,
  JOB_OPERATION_NAME,
  JOB_STATUS,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const {
  mapContactMasterToGoldMine,
} = require('@nexsalesdev/master-data-model/lib/services/fetchContactByDomain');
const JobCRUDService = require('../../jobs/jobService');
const settingsConfig = require('../../../../config/settings/settings-config');
const Sanitizer = require('../../../commonServices/sanitizer');

const {
  generateMasterImportFile,
} = require('../accounts/createMasterImportFile');

const ContactCRUDService = require('../../contacts/contactsService');

const taskQueueClient = new CloudTasksClient();

function ContactService() {
  const config = settingsConfig.settings || {};
  this.logger = settingsConfig.logger || console;
  this.config = config;

  this.sanitizer = new Sanitizer();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
  this.contactCrudService = new ContactCRUDService();
  this.jobService = new JobCRUDService();
}

async function fetchMasterImportOperationParamFromProjectSetting(
  projectId,
  transaction,
) {
  const projectSetting = await ProjectSetting.findOne(
    {
      attributes: ['masterImportOperationParam'],
      where: {
        ProjectId: projectId,
      },
      raw: true,
    },
    {
      transaction,
    },
  );

  const masterImportOperationParam = _.get(
    projectSetting,
    'masterImportOperationParam',
    {},
  );

  return masterImportOperationParam;
}

async function fetchContactExpiryFromProject(projectId, transaction) {
  const projectContactExpiry = await Project.findOne(
    {
      attributes: ['contactExpiry'],
      where: {
        id: projectId,
      },
      raw: true,
    },
    {
      transaction,
    },
  );

  return _.get(projectContactExpiry, 'contactExpiry', 0);
}

async function updateProjectSettings(inputs) {
  const { projectId, contactMasterImportOperationParam, transaction } =
    inputs || {};

  let masterImportOperationParam =
    await fetchMasterImportOperationParamFromProjectSetting(
      projectId,
      transaction,
    );
  masterImportOperationParam = masterImportOperationParam || {};
  const projectSettingData = {
    masterImportOperationParam,
  };
  projectSettingData.masterImportOperationParam.contact =
    contactMasterImportOperationParam;

  await ProjectSetting.update(
    projectSettingData,
    {
      where: {
        ProjectId: projectId,
      },
    },
    {
      transaction,
    },
  );
}

async function removeTemporaryMasterContactData(tableName, transaction) {
  if (!tableName) {
    return;
  }

  await sequelize.query(
    `DELETE FROM "${tableName}" WHERE flag != 'added' OR flag is null;`,
    {
      transaction,
    },
  );
}

async function saveContactIntegrationFilter(inputs) {
  const { filter, sort, limit, projectId, userId } = inputs || {};
  const logger = settingsConfig.logger || console;
  const transaction = await sequelize.transaction();

  const contactMasterImportOperationParam = {
    filter,
    sort,
    limit,
  };

  const tableName = `${projectId.replaceAll('-', '_')}_master_contacts`;

  try {
    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: START :: Update ProjectSetting to add masterImportOperationParam {userId : ${userId}, projectId : ${projectId}}`,
    );

    await updateProjectSettings({
      projectId,
      contactMasterImportOperationParam,
      transaction,
    });

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: COMPLETED :: Update ProjectSetting to add masterImportOperationParam {userId : ${userId}, projectId : ${projectId}}`,
    );

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: START :: Delete Unused contacts from the table ${tableName} {userId : ${userId}, projectId : ${projectId}}`,
    );

    await removeTemporaryMasterContactData(tableName, transaction);

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: COMPLETED :: Deleted Unused contacts from the table ${tableName} {userId : ${userId}, projectId : ${projectId}}`,
    );

    await transaction.commit();
    return 'Saved Successfully';
  } catch (error) {
    const serializedError = serializeError(error);

    logger.error(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: ERROR :: Can Not Save the projectSetting  {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    await transaction.rollback();
    throw error;
  }
}

/**
 *
 * @param {Object} inputs - file column details
 * @returns
 */
async function createFile(inputs) {
  const { projectId, userId, fileId, transaction } = inputs || {};

  const name = `${FILE_TYPES.MASTER_IMPORT}_${new Date()}`;
  const type = FILE_TYPES.MASTER_IMPORT;
  const format = '.csv';
  const location = `files/${projectId}/${FILE_TYPES.MASTER_IMPORT}/${fileId}${format}`;

  // create file
  await File.create(
    {
      id: fileId,
      name,
      type,
      format,
      location,
      createdBy: userId,
      updatedBy: userId,
      ProjectId: projectId,
    },
    {
      transaction,
    },
  );

  return { format, location };
}

/**
 *
 * @param {Object} inputs - Job Details
 */
async function createJob(inputs) {
  const {
    fileId,
    jobId,
    userId,
    masterImportOperationParam,
    referenceId,
    transaction,
  } = inputs || {};

  const status = JOB_STATUS.QUEUED;

  await Job.create(
    {
      id: jobId,
      status,
      operation_name: JOB_OPERATION_NAME.MASTER_CONTACT_IMPORT,
      operation_param: { masterContactImport: masterImportOperationParam },
      createdBy: userId,
      updatedBy: userId,
      FileId: fileId,
      referenceId,
    },
    {
      transaction,
    },
  );
}

async function enqueue(jobId) {
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: this.config.DATA_INJECTOR_ENDPOINT,
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
    this.logger.error('>>>>>>>> :/ Cloud Not Create Task');
    this.logger.error(error);
    throw error;
  }
}

/**
 * @param {Object} param0
 * @returns
 */
async function injectContactInDA(inputs) {
  const { filter, projectId, userId, accountId, accountDomain } = inputs || {};
  const logger = settingsConfig.logger || console;

  const jobStatus = await this.jobService.getJobStatusOfContactInject({
    projectId,
    accountId,
  });

  if (
    jobStatus &&
    ![JOB_STATUS.COMPLETED, JOB_STATUS.FAILED].includes(jobStatus.status)
  ) {
    throw new Error(`Already one job in process for account: ${accountId}`);
  }

  const transaction = await sequelize.transaction();

  const fileId = uuid();
  const jobId = uuid();
  const referenceId = `project_${projectId}_account_${accountId}`;

  let masterImportOperationParamProjectSetting =
    await fetchMasterImportOperationParamFromProjectSetting(
      projectId,
      transaction,
    );

  masterImportOperationParamProjectSetting = _.get(
    masterImportOperationParamProjectSetting,
    'contact',
    {},
  );

  const contactExpiry = await fetchContactExpiryFromProject(
    projectId,
    transaction,
  );

  _.set(
    masterImportOperationParamProjectSetting,
    'filter.jobLevel.value',
    filter.jobLevel.value,
  );

  const masterImportOperationParam = {
    filter: masterImportOperationParamProjectSetting.filter,
    sort: masterImportOperationParamProjectSetting.sort,
    limit: masterImportOperationParamProjectSetting.limit,
    contactExpiry,
    accountDomain,
  };

  try {
    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: START :: Create a new File for {userId : ${userId}, projectId : ${projectId}, fileId : ${fileId}}`,
    );

    const { location } = await createFile({
      projectId,
      userId,
      fileId,
      transaction,
    });

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: COMPLETED :: Created a new File for {userId : ${userId}, projectId : ${projectId}, fileId : ${fileId}}`,
    );

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: START :: Create a new Job for {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
    );

    await createJob({
      fileId,
      jobId,
      userId,
      masterImportOperationParam,
      referenceId,
      transaction,
    });

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: COMPLETED :: Created a new Job for {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
    );

    const fileData = {
      filter,
      sort: masterImportOperationParamProjectSetting.sort,
      limit: masterImportOperationParamProjectSetting.limit,
    };
    await generateMasterImportFile({
      jobId,
      location,
      fileData,
      logger,
    });

    await this.enqueue(jobId);
    await transaction.commit();
  } catch (error) {
    const serializedError = serializeError(error);

    logger.error(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: ERROR :: Can Not Save the projectSetting  {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    await transaction.rollback();
    throw error;
  }
}

/**
 * @param {Object} inputs - filter,sort,pagination and tableName
 * @returns {Array}
 */
async function getContacts(inputs) {
  const { tableName, filter, sort, pagination, accountDomain } = inputs;

  let selectQuery = '';
  const result = {
    contacts: [],
    totalCount: 0,
  };

  const attributes = [
    'id',
    'flag',
    'firstName',
    'middleName',
    'lastName',
    'accountName',
    'workEmail',
    'zbStatus',
    'jobTitle',
    'jobLevel',
    'linkedinHandle',
    'otherSourceLink',
    'updatedAt',
  ];

  const filterColumnName = Object.keys(filter).toString();
  const filterValue = filter[filterColumnName].value[0];

  attributes.forEach((column) => {
    selectQuery += `"${column}",`;
  });

  if (selectQuery.charAt(selectQuery.length - 1) === ',') {
    selectQuery = selectQuery.substring(0, selectQuery.length - 1);
  }

  let whereClause = `"AccountDomain" = '${accountDomain}' AND `;
  whereClause += `"${Object.keys(filter)}" = '${filterValue}'`;

  const orderByClause = `"${Object.keys(sort).toString()}" ${Object.values(
    sort,
  ).toString()}`;

  const contactsData = await sequelize.query(
    `SELECT ${selectQuery} FROM "${tableName}" WHERE ${whereClause} ORDER BY ${orderByClause} OFFSET ${pagination.offset} LIMIT ${pagination.limit};`,
  );

  const totalCount = await sequelize.query(
    `SELECT COUNT(*) FROM "${tableName}" WHERE ${whereClause};`,
  );

  if (contactsData) {
    result.contacts = contactsData[0].map((_contact) => {
      let contact = _.cloneDeep(_contact);

      contact.name = `${contact.firstName} ${contact.middleName} ${contact.lastName}`;

      contact.name = contact.name.replaceAll('null', '');

      contact.googleSearchContact = `${contact.name} ${contact.jobTitle} ${contact.accountName}`;

      contact.googleSearchContact = contact.googleSearchContact.replaceAll(
        'null',
        '',
      );

      contact = _.omit(contact, ['firstName', 'middleName', 'lastName']);

      return contact;
    });
  }

  if (totalCount) {
    const res = totalCount[0];

    result.totalCount = res.count;
  }

  return result;
}

/**
 *
 * @param {String} tableName
 * @param {String} contactId
 * @param {*} transaction - sequelize
 * @returns {Object} - updated Temporary master contact
 */
async function setFlagInContactMaster(
  tableName,
  contactId,
  _flag,
  transaction,
) {
  let flag = _flag;

  if (flag === 'undo') {
    flag = null;

    const updatedContact = await sequelize.query(
      `UPDATE "${tableName}" SET flag = ${flag} WHERE id = '${contactId}' RETURNING *;`,
      {
        transaction,
      },
    );
    return updatedContact;
  }
  const updatedContact = await sequelize.query(
    `UPDATE "${tableName}" SET flag = '${flag}' WHERE id = '${contactId}' RETURNING *;`,
    {
      transaction,
    },
  );
  return updatedContact;
}

/**
 *
 * @param {Object} inputs - tableName(String),contactId(String),flag(String),inputDTO(Object),transaction(sequelize)
 * @returns {Object} - GoldMine Contact
 */
async function insertTemporaryMasterContactToGoldMine(inputs) {
  const { tableName, contactId, flag, inputDTO, transaction } = inputs;
  const { userId, projectId } = inputDTO;

  const logger = settingsConfig.logger || console;

  logger.info(
    `[MASTER_IMPORT_CONTACT_SERVICE] :: START :: Inserting Contact From ${tableName} To Add Goldmine {UserId : ${userId}, ProjectId : ${projectId}}`,
  );

  logger.info(
    `[MASTER_IMPORT_CONTACT_SERVICE] :: START :: Set Flag For Contact with id ${contactId} In Table ${tableName} {userId : ${userId}, projectId : ${projectId}}`,
  );

  const tempContact = await setFlagInContactMaster(
    tableName,
    contactId,
    flag,
    transaction,
  );

  const flagSettedContact = _.get(tempContact, '[0][0]', {});

  logger.info(
    `[MASTER_IMPORT_CONTACT_SERVICE] :: COMPLETED :: Setted Flag For Contact ${JSON.stringify(
      flagSettedContact,
    )} In Table ${tableName} {userId : ${userId}, projectId : ${projectId}}`,
  );

  if (flag === 'added') {
    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: START :: Map The Temporary_master_contact with GoldMine Contact {tempContact : ( ${JSON.stringify(
        flagSettedContact,
      )}) userId : ${userId}, projectId : ${projectId}}`,
    );

    const mappedContact = mapContactMasterToGoldMine(flagSettedContact);

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: COMPLETED :: Mapped The Temporary_master_contact {mappedContact : ${JSON.stringify(
        mappedContact,
      )} userId : ${userId}, projectId : ${projectId}}`,
    );

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: START :: Save Contact In The GoldMine Contact ${JSON.stringify(
        mappedContact,
      )} {userId : ${userId}, projectId : ${projectId}}`,
    );

    const savedContact = await this.contactCrudService.saveContact(
      mappedContact,
      inputDTO,
      {},
    );

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: COMPLETED :: Saved Contact In The GoldMine Contact Id ${savedContact.id} {userId : ${userId}, projectId : ${projectId}}`,
    );

    logger.info(
      `[MASTER_IMPORT_CONTACT_SERVICE] :: COMPLETED :: Inserted Contact From ${tableName} To Add Goldmine {UserId : ${userId}, ProjectId : ${projectId}}`,
    );

    return savedContact;
  }

  return tempContact;
}

ContactService.prototype = {
  saveContactIntegrationFilter,
  injectContactInDA,
  enqueue,
  getContacts,
  insertTemporaryMasterContactToGoldMine,
};

module.exports = ContactService;
