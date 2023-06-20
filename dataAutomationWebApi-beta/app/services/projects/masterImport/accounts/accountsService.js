const { uuid } = require('uuidv4');
const { serializeError } = require('serialize-error');
const { CloudTasksClient } = require('@google-cloud/tasks');

const {
  ProjectSetting,
  File,
  Job,
  sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');
const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');
const {
  FILE_TYPES,
  JOB_OPERATION_NAME,
  JOB_STATUS,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');

const settingsConfig = require('../../../../config/settings/settings-config');
const Sanitizer = require('../../../commonServices/sanitizer');
const { generateMasterImportFile } = require('./createMasterImportFile');

const taskQueueClient = new CloudTasksClient();

function AccountService() {
  const config = settingsConfig.settings || {};
  this.logger = settingsConfig.logger || console;
  this.config = config;

  this.sanitizer = new Sanitizer();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

/**
 *
 * @param {String} ProjectId
 * @param {Object} masterImportOperationParam
 */
async function updateProjectSettings(inputs) {
  const { projectId, masterImportOperationParam, transaction } = inputs || {};

  const projectSettingData = {
    masterImportOperationParam: { account: masterImportOperationParam },
  };

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

/**
 *
 * @param {Object} param0
 */
async function createJob(inputs) {
  const { fileId, jobId, userId, masterImportOperationParam, transaction } =
    inputs || {};

  const status = JOB_STATUS.QUEUED;

  await Job.create(
    {
      id: jobId,
      status,
      operation_name: JOB_OPERATION_NAME.MASTER_ACCOUNT_IMPORT,
      operation_param: { masterAccountImport: masterImportOperationParam },
      createdBy: userId,
      updatedBy: userId,
      FileId: fileId,
    },
    {
      transaction,
    },
  );
}

/**
 *
 * @param {Object} param0
 * @returns
 */
async function createFile(inputs) {
  const { projectId, userId, fileId, transaction, fileName } = inputs || {};

  const name = fileName || `${FILE_TYPES.MASTER_IMPORT}_${new Date()}`;
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
async function injectAccountInDA(inputs) {
  const { filter, sort, limit, projectId, userId, fileName } = inputs || {};
  const logger = settingsConfig.logger || console;
  const transaction = await sequelize.transaction();

  const fileId = uuid();
  const jobId = uuid();

  const masterImportOperationParam = {
    filter,
    sort,
    limit,
  };

  try {
    logger.info(
      `[MASTER_IMPORT_ACCOUNT_SERVICE] :: START :: Update ProjectSetting to add masterImportOperationParam {userId : ${userId}, projectId : ${projectId}}`,
    );

    await updateProjectSettings({
      projectId,
      masterImportOperationParam,
      transaction,
    });

    logger.info(
      `[MASTER_IMPORT_ACCOUNT_SERVICE] :: COMPLETED :: Update ProjectSetting to add masterImportOperationParam {userId : ${userId}, projectId : ${projectId}}`,
    );

    logger.info(
      `[MASTER_IMPORT_ACCOUNT_SERVICE] :: START :: Create a new File for {userId : ${userId}, projectId : ${projectId}, fileId : ${fileId}}`,
    );

    const { location } = await createFile({
      projectId,
      userId,
      fileId,
      transaction,
      fileName,
    });

    logger.info(
      `[MASTER_IMPORT_ACCOUNT_SERVICE] :: COMPLETED :: Created a new File for {userId : ${userId}, projectId : ${projectId}, fileId : ${fileId}}`,
    );

    logger.info(
      `[MASTER_IMPORT_ACCOUNT_SERVICE] :: START :: Create a new Job for {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
    );

    await createJob({
      fileId,
      jobId,
      userId,
      masterImportOperationParam,
      transaction,
    });

    logger.info(
      `[MASTER_IMPORT_ACCOUNT_SERVICE] :: COMPLETED :: Created a new Job for {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
    );

    const fileData = {
      filter: JSON.stringify(filter),
      sort: JSON.stringify(sort),
      limit,
    };
    await generateMasterImportFile({
      jobId,
      location,
      fileData,
      logger,
    });

    await transaction.commit();
  } catch (error) {
    const serializedError = serializeError(error);

    logger.error(
      `[MASTER_IMPORT_ACCOUNT_SERVICE] :: ERROR :: Can Not Save the projectSetting  {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    await transaction.rollback();
    throw error;
  }

  this.enqueue(jobId);
}

AccountService.prototype = {
  injectAccountInDA,
  enqueue,
};

module.exports = AccountService;
