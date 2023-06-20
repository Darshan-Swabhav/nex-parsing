/* eslint-disable prettier/prettier */
const { CloudTasksClient } = require('@google-cloud/tasks');
const {
  JobError,
  File,
  Job,
  Sequelize,
} = require('@nexsalesdev/master-data-model');

const {
  JOB_STATUS,
  FILE_TYPES,
  ASYNC_DOWNLOAD_FILE_OPERATIONS,
  IMPORT_RAW_ERROR_CATEGORY,
  UPLOAD_FILE_OPERATIONS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const FilterHandler = require('@nexsalesdev/master-data-model/lib/services/filterHandler');
const { isEmpty, cloneDeep, isString, isArray, isNaN, get } = require('lodash');
const settingsConfig = require('../../config/settings/settings-config');

const { Op } = Sequelize;

const taskQueueClient = new CloudTasksClient();

function ImportErrorCRUDService() {
  const config = settingsConfig.settings || {};
  this.config = config;
  this.logger = settingsConfig.logger || console;

  this.filterHandler = new FilterHandler();
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

async function downloadAllImportError(_inputs, filter, importType) {
  const inputs = cloneDeep(_inputs);

  const fileData = {
    fileId: inputs.fileId,
    jobId: inputs.jobId,
    filter,
    createdBy: inputs.userEmail,
    fileName: inputs.fileName,
  };

  await this.addDownloadImportErrorFile(fileData, importType);
  return this.enqueue(fileData.jobId, filter);
}

async function addDownloadImportErrorFile(fileData, importType) {
  const { fileId, createdBy, jobId } = fileData;
  const fileName = fileData.fileName? `${fileData.fileName}_${Date.now()}.csv`:
    `importError_${importType}_download_${Date.now()}.csv`;
  const fileType = FILE_TYPES.IMPORT_ERROR_EXPORT;
  const format = '.csv';
  const mapping = {};
  const jobStatus = JOB_STATUS.QUEUED;
  const operationName =
    importType === 'account'
      ? ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_ACCOUNT_IMPORT_ERROR_EXPORT
      : ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_CONTACT_IMPORT_ERROR_EXPORT;
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

function validateErrorImportdownloadExport(filter) {
  if (!isEmpty(filter.startDateTime)) {
    if (
      new Date(filter.startDateTime) === 'Invalid Date' &&
      isNaN(new Date(filter.startDateTime))
    ) {
      throw new Error(
        `The filter value startDateTime must be in date time format`,
      );
    }
  }

  if (!isEmpty(filter.endDateTime)) {
    if (
      new Date(filter.endDateTime) === 'Invalid Date' &&
      isNaN(new Date(filter.endDateTime))
    ) {
      throw new Error(
        `The filter value endDateTime must be in date time format`,
      );
    }
  }

  if (!isEmpty(filter.startDateTime) && !isEmpty(filter.endDateTime)) {
    if (new Date(filter.endDateTime) < new Date(filter.startDateTime)) {
      throw new Error(
        `The filter value startDateTime is greater than endDateTime`,
      );
    }
  }
  if(!isEmpty(filter.fileName)){
    if (!isString(filter.fileName)) {
      throw new Error(`The filter type fileName is not string`);
    }
  }

  if (isString(filter.category)) {
    if (!Object.values(IMPORT_RAW_ERROR_CATEGORY).includes(filter.category)) {
      throw new Error(`The filter type category is not exist`);
    }
  }

  if(isArray(filter.category)){
    for(let i = 0; i < filter.category.length; i += 1){
      if(!Object.values(IMPORT_RAW_ERROR_CATEGORY).includes(filter.category[i])){
        throw new Error(`The filter type array category is not exist`);
      }
    }
  }

  if(filter.source){
    if (!isString(filter.source)) {
      throw new Error(`The filter type source is not string`);
    }
  }
  
}

async function getAllImportError(inputs,_filter, importType) {

  const filter = _filter ? cloneDeep(_filter) : {};
  const { limit, offset } = inputs;
  const jobFilter = {}
  const operationName =
    importType === 'account'
      ? UPLOAD_FILE_OPERATIONS.ACCOUNT_IMPORT
      : UPLOAD_FILE_OPERATIONS.CONTACT_IMPORT;
  jobFilter.operationName = operationName
  const where = {};
  where.type = 'row'

  if (!isEmpty(filter.category)) where.category = filter.category;

  if (filter.startDateTime && filter.endDateTime)
  where.createdAt = {
    [Op.between]: [
      new Date(filter.startDateTime),
      new Date(filter.endDateTime),
    ],
  };

  if (filter.startDateTime && !filter.endDateTime)
  where.createdAt = { [Op.gte]: new Date(filter.startDateTime) };

  if (filter.endDateTime && !filter.startDateTime)
  where.createdAt = { [Op.lte]: new Date(filter.endDateTime) };

  const fileFilter = {}
  if (filter.fileName) {
    fileFilter.name = filter.fileName
  }

  if (filter.source) {
    fileFilter.source = filter.source
  }

  this.logger.info(`[IMPORT_ERROR_SERVICE] :: getAllImportError : whereCause: `, where);

  const result = await JobError.findAll({
    attributes: [
      'category',
      [Sequelize.fn('COUNT', 'id'), 'count'],
      [Sequelize.literal(`COUNT(*) OVER ()`), 'categoryCount'],
      [
        Sequelize.fn(
          'SUM',
          Sequelize.literal('CASE WHEN "isSolved" = false THEN 1 ELSE 0 END'),
        ),
        'unresolvedErrorCount',
      ],
    ],
    include: [
      {
        model: Job,
        attributes: [],
        required: true,
        where : jobFilter,
        include: [
          {
            model: File,
            attributes: [],
            required: true,
            where: fileFilter,
          },
        ],
      },
    ],
    where,
    limit,
    offset,
    group: ['category'],
    raw: true,
  })

  const jobErrors = {
    totalCount: get(result, `[0].categoryCount`, 0),
    docs: result,
  }

  return jobErrors;
}

async function getAllErrorFiles(inputs, _filter, importType) {

  const filter = _filter ? cloneDeep(_filter) : {};
  const { limit, offset } = inputs;
  const operationName =
    importType === 'account'
      ? UPLOAD_FILE_OPERATIONS.ACCOUNT_IMPORT
      : UPLOAD_FILE_OPERATIONS.CONTACT_IMPORT;

  const where = {};

  if (!isEmpty(filter.category)) where.category = filter.category;

  if (filter.startDateTime && filter.endDateTime)
  where.createdAt = {
    [Op.between]: [
      new Date(filter.startDateTime),
      new Date(filter.endDateTime),
    ],
  };

  if (filter.startDateTime && !filter.endDateTime)
  where.createdAt = { [Op.gte]: new Date(filter.startDateTime) };

  if (filter.endDateTime && !filter.startDateTime)
  where.createdAt = { [Op.lte]: new Date(filter.endDateTime) };

  const fileFilter = {}
  if (filter.fileName){
    fileFilter.name = filter.fileName
  } 

  if(filter.source) {
    fileFilter.source = filter.source
  }

  this.logger.info(`[IMPORT_ERROR_SERVICE] :: getAllErrorFiles : whereCause: `, where);
  const result = await JobError.findAll({
    attributes: [
      'category',
      'Job->File.id',
      'Job->File.name',
      'Job.operationName',
      [Sequelize.fn('COUNT', '*'), 'totalCount'],
      [Sequelize.literal(`COUNT(*) OVER ()`), 'fileCount'],
      [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "isSolved" = false THEN 1 ELSE 0 END')), 'unresolvedErrorCount'],
    ],
    include: {
      attributes: [],
      model: Job,
      require: true,
      where: {
        operationName,
      },
      include : {
        attributes: [],
        model: File,
        require: true,
        where : fileFilter,
      },
    },
    where,
    group: ['JobError.category', 'Job.operationName', 'Job->File.id'],
    offset,
    limit,
    subQuery: false,
    raw: true,
  });

  const categoryWiseFiles = {
    totalCount : get(result, `[0].filecount`, 0),
    rows : result,
  }

  return categoryWiseFiles;
}

ImportErrorCRUDService.prototype = {
  enqueue,
  updateJobStatus,
  downloadAllImportError,
  addDownloadImportErrorFile,
  validateErrorImportdownloadExport,
  getAllImportError,
  getAllErrorFiles,
};

module.exports = ImportErrorCRUDService;
