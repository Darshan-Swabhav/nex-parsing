const _ = require('lodash');
const { CloudTasksClient } = require('@google-cloud/tasks');
const {
  Contact,
  File,
  Job,
  Sequelize,
  sequelize,
} = require('@nexsalesdev/master-data-model');
const {
  contactMasterExporter,
} = require('@nexsalesdev/da-download-service-repository');
const {
  mapContactMasterToGoldMine,
} = require('@nexsalesdev/master-data-model/lib/services/fetchContactByDomain');
const {
  FILE_TYPES,
  ASYNC_DOWNLOAD_FILE_OPERATIONS,
  SYNC_DOWNLOAD_FILE_OPERATIONS,
  JOB_STATUS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const FilterHandler = require('@nexsalesdev/master-data-model/lib/services/filterHandler');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;

const taskQueueClient = new CloudTasksClient();
function ContactCRUDService() {
  const config = settingsConfig.settings || {};
  this.config = config;
  this.logger = settingsConfig.logger || console;

  this.filterHandler = new FilterHandler();
}

async function getContactsCounts() {
  const count = await Contact.count({
    raw: true,
    subQuery: false,
  });
  return count;
}

function convertArrayToLowerCase(data) {
  const lowerCaseData = [];
  data.forEach((element) => {
    if (element) lowerCaseData.push(element.toLowerCase());
  });
  return lowerCaseData;
}

async function getAllContact(inputs, _filter) {
  const filter = _filter ? _.cloneDeep(_filter) : {};
  const { limit, offset } = inputs;

  const filterColumnsMapping = {};
  let where = {};
  let order = [];

  // To-Do :: code improvement (need to change the filter hardCode part or replace the else-if with switch)
  if (filter.name) {
    const nameTokens = convertArrayToLowerCase(filter.name.value);
    delete filter.name;
    if (nameTokens.length) where.nameTokens = { [Op.overlap]: nameTokens };
  }

  if (filter.jobTitle) {
    const jobTitleTokens = convertArrayToLowerCase(filter.jobTitle.value);
    delete filter.jobTitle;
    if (jobTitleTokens.length)
      where.jobTitleTokens = { [Op.overlap]: jobTitleTokens };
  }
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  if (!order.length) order = [['updatedAt', 'desc']];

  const result = await Contact.findAndCountAll({
    attributes: [
      'id',
      [sequelize.literal('"firstName" || \' \' || "lastName"'), 'name'],
      'workEmail',
      'jobTitle',
      'jobLevel',
      'jobDepartment',
      'disposition',
      'updatedAt',
      'locationCountry',
      'accountName',
    ],
    where,
    order,
    offset,
    limit,
    raw: true,
    subQuery: false,
  });

  const contacts = {};
  contacts.totalCount = result.count;
  contacts.docs = result.rows;
  return contacts;
}

async function getContact(inputs) {
  const { contactId, convertInToGmFormate } = inputs || {};

  if (!contactId) throw new Error('contactId is empty');
  if (convertInToGmFormate && !_.isBoolean(convertInToGmFormate))
    throw new Error('convertInToGmFormate is not a Boolean');

  let contact = await Contact.findOne({
    where: {
      id: contactId,
    },
    raw: true,
  });

  if (convertInToGmFormate) contact = mapContactMasterToGoldMine(contact);

  return contact;
}

async function getFileIsLarger(_filter, maximumRecords = 0) {
  const filter = _filter ? _.cloneDeep(_filter) : {};
  let where = {};

  const filterColumnsMapping = {};
  if (filter.name) {
    const nameTokens = convertArrayToLowerCase(filter.name.value);
    delete filter.name;
    if (nameTokens.length) where.nameTokens = { [Op.overlap]: nameTokens };
  }

  if (filter.jobTitle) {
    const jobTitleTokens = convertArrayToLowerCase(filter.jobTitle.value);
    delete filter.jobTitle;
    if (jobTitleTokens.length)
      where.jobTitleTokens = { [Op.overlap]: jobTitleTokens };
  }

  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  const count = await Contact.count({
    where,
    raw: true,
    subQuery: false,
  });
  return count > maximumRecords;
}

async function downloadAllContact(
  _inputs,
  filter,
  writableStream,
  isAsyncDownload = false,
) {
  const inputs = _.cloneDeep(_inputs);

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
  return contactMasterExporter(writableStream, dbParam);
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
  const fileName = `ContactMaster_${new Date(Date.now())}.csv`;
  const fileType = FILE_TYPES.EXPORT;
  const format = '.csv';
  const mapping = {};
  const jobStatus = isAsyncDownload ? JOB_STATUS.QUEUED : JOB_STATUS.PROCESSING;
  const operationName = isAsyncDownload
    ? ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_CONTACT_EXPORT
    : SYNC_DOWNLOAD_FILE_OPERATIONS.SYNC_CONTACT_EXPORT;
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
ContactCRUDService.prototype = {
  getAllContact,
  getContact,
  getFileIsLarger,
  downloadAllContact,
  addFile,
  enqueue,
  updateJobStatus,
  getContactsCounts,
};

module.exports = ContactCRUDService;
