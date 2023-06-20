/* eslint-disable global-require */
const { concat, get } = require('lodash');
const { Storage } = require('@google-cloud/storage');

const {
  File,
  Job,
  JobError,
  AccountSuppression,
  ContactSuppression,
  FileChunk,
  SharedFile,
  SharedFileProject,
  Client,
  User,
  Project,
  Sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');

const { Op } = Sequelize;

const {
  generateV4UploadSignedUrl,
} = require('@nexsalesdev/da-download-service-repository');
const {
  FILE_TYPES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const settingsConfig = require('../../../config/settings/settings-config');

let storage = new Storage();

if (process.env.GCLOUD_STORAGE_EMAIL) {
  storage = new Storage({
    email: process.env.GCLOUD_STORAGE_EMAIL,
    projectId: process.env.PROJECT_ID,
  });
}

function FileCRUDService() {
  const config = settingsConfig.settings || {};
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

async function getAllFile(inputs) {
  const { projectId } = inputs;

  const individualFiles = await File.findAll({
    where: {
      ProjectId: projectId,
      type: {
        [Op.ne]: FILE_TYPES.SUPPRESSION,
      },
    },
    attributes: ['id', 'name', 'type', 'mapping'],
    raw: true,
  });

  const sharedFiles = await SharedFile.findAll({
    attributes: ['id', 'name', 'type', 'mapping'],
    include: [
      {
        model: Project,
        attributes: [],
        where: {
          id: projectId,
        },
        through: {
          attributes: [],
        },
      },
    ],
    raw: true,
  });

  const files = concat(individualFiles, sharedFiles);
  return files;
}

async function getFileById(fileId) {
  this.logger.debug('[GET-FILE-BY_ID] :: searching in individual files');

  let file = await File.findOne({
    where: {
      id: fileId,
    },
    raw: true,
  });

  if (!file) {
    this.logger.debug(
      '[GET-FILE-BY_ID] :: file not found in individual files, Searching in sharedFile',
    );
    file = await SharedFile.findOne({
      where: {
        id: fileId,
      },
      raw: true,
    });
  }
  return file;
}

async function getJobByFileId(fileId, isSharedFile) {
  const whereClause = {};
  if (isSharedFile) {
    whereClause.SharedFileId = fileId;
  } else {
    whereClause.FileId = fileId;
  }
  return Job.findOne({
    where: whereClause,
    raw: true,
  });
}

async function createFile(dto) {
  // default: bucket is process file bucket
  let bucket = storage.bucket(process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET);
  // default: job needs to be created
  let shouldCreateJob = true;
  const {
    fileId,
    fileName,
    fileType,
    format,
    fileContentType,
    mapping,
    projectId,
    createdBy,
    jobId,
    operationName,
    operationParam,
    rowCount,
  } = dto;

  const isSharedFile = fileType === FILE_TYPES.SUPPRESSION;
  const updatedBy = dto.updatedBy || createdBy;
  const jobStatus = dto.jobStatus || 'Queued';
  const resultProcessed = dto.resultProcessed || 0;
  const resultImported = dto.resultImported || 0;
  const resultErrored = dto.resultErrored || 0;
  const location = `files/${projectId}/${fileType}/${fileId}${format}`;

  // select bucket first
  if (fileType === FILE_TYPES.SUPPORTING_DOCUMENT) {
    bucket = storage.bucket(process.env.GCLOUD_STORAGE_SUPPORT_FILE_BUCKET);
    shouldCreateJob = false;
  }

  // signedURL options
  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    contentType: fileContentType,
  };

  // Get a v4 signed URL for uploading file
  const [url] = await bucket.file(`${location}`).getSignedUrl(options);

  // database entry
  // 1. file entry
  if (isSharedFile) {
    const project = await Project.findOne({
      attributes: ['ClientId'],
      where: {
        id: projectId,
      },
      raw: true,
    });

    const clientId = get(project, 'ClientId', null);
    if (!clientId) throw new Error('Could Not Get Client Data');
    await SharedFile.create({
      id: fileId,
      name: fileName,
      type: fileType,
      format,
      location,
      mapping,
      createdBy,
      updatedBy,
      ClientId: clientId,
    });
    // create Link of project and sharedFile
    await SharedFileProject.create({
      ProjectId: projectId,
      SharedFileId: fileId,
      createdBy,
      updatedBy,
    });
  } else {
    await File.create({
      id: fileId,
      name: fileName,
      type: fileType,
      format,
      location,
      mapping,
      ProjectId: projectId,
      createdBy,
      updatedBy,
    });
  }
  // 2. job entry
  if (shouldCreateJob)
    await Job.create({
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
      FileId: isSharedFile ? null : fileId,
      SharedFileId: isSharedFile ? fileId : null,
    });

  // return signed URL
  return { uploadUrl: url, fileId };
}

async function generateFileDownloadURL(fileId) {
  const file = await this.getFileById(fileId);
  if (!file) {
    this.logger.error(
      'could not found file in individual files and sharedFile',
    );
    const error = new Error(`Could Not Find File With Id ${fileId}`);
    error.code = 'FILE_NOT_FOUND';
    throw error;
  }
  let bucketName;

  if (file.type === FILE_TYPES.SUPPORTING_DOCUMENT) {
    bucketName = process.env.GCLOUD_STORAGE_SUPPORT_FILE_BUCKET;
  } else {
    bucketName = process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET;
  }

  const signedUrl = await generateV4UploadSignedUrl(file.location, bucketName);

  return signedUrl;
}

async function deleteFile(fileId, isSharedFile = false) {
  if (isSharedFile) {
    return SharedFile.destroy({
      where: [
        {
          id: fileId,
        },
      ],
    });
  }
  return File.destroy({
    where: [
      {
        id: fileId,
      },
    ],
  });
}

async function deleteSuppressionFileJob(fileId, isSharedFile = false) {
  const whereClause = {};
  if (isSharedFile) {
    whereClause.SharedFileId = fileId;
  } else {
    whereClause.FileId = fileId;
  }
  return Job.destroy({
    where: [whereClause],
  });
}

async function deleteSuppressionFileChunks(fileId, isSharedFile = false) {
  const whereClause = {};
  if (isSharedFile) {
    whereClause.SharedFileId = fileId;
  } else {
    whereClause.FileId = fileId;
  }
  return FileChunk.destroy({
    where: [whereClause],
  });
}

async function deleteSuppressionJobErrors(jobId) {
  return JobError.destroy({
    where: [
      {
        JobId: jobId,
      },
    ],
  });
}

async function deleteSuppressionRecords(fileId, isSharedFile = false) {
  const job = await this.getJobByFileId(fileId, isSharedFile);
  if (job.status === 'Processing') {
    const error = new Error(`File is Being Currently under Processing`);
    error.code = 'NOT_DELETED';
    throw error;
  }
  await this.deleteSuppressionJobErrors(job.id);
  const whereClause = {};
  whereClause.SharedFileId = fileId;

  switch (job.operation_name) {
    case 'accountSuppression':
      return AccountSuppression.destroy({
        where: whereClause,
      });
    case 'contactSuppression':
      return ContactSuppression.destroy({
        where: whereClause,
      });
    default:
      throw new Error(
        `delete for operation ${job.operation_name} Not implemented`,
      );
  }
}

async function deleteFileById(inputs) {
  const { fileId, userId } = inputs;
  // rename this Fn
  const file = await this.getFileById(fileId);

  if (!file) {
    this.logger.error(
      `[DELETE-FILE-BY-ID] : Could Not Find File With Id ${fileId}`,
    );
    throw new Error(`File With Id ${fileId} Does not Exist`);
  }

  let bucketName = process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET;

  if (file.type === FILE_TYPES.SUPPORTING_DOCUMENT)
    bucketName = process.env.GCLOUD_STORAGE_SUPPORT_FILE_BUCKET;

  const bucket = storage.bucket(bucketName);
  const [isFileExists] = await bucket.file(file.location).exists();
  this.logger.error(
    `[DELETE-FILE-BY-ID] : Is File Exist in GCP ?  ${isFileExists}`,
  );

  if (isFileExists) {
    await bucket.file(file.location).delete();
  }
  let isSharedFile = false;
  switch (file.type) {
    case FILE_TYPES.SUPPORTING_DOCUMENT:
      await this.deleteFile(fileId, isSharedFile);
      break;
    case FILE_TYPES.SUPPRESSION:
      isSharedFile = true;
      await this.deleteSuppressionRecords(fileId, isSharedFile);
      await this.deleteSuppressionFileJob(fileId, isSharedFile);
      await this.deleteSuppressionFileChunks(fileId, isSharedFile);
      await this.deleteFile(fileId, isSharedFile);
      this.logger.info(
        `[Suppression Update] : Delete Action File Data: { userId: ${userId}, fileName: ${file.name}}`,
      );
      break;
    default:
      throw new Error(`Unknown File Type ${file.type}`);
  }
}

async function deleteAllFilesOfAProject(inputs) {
  const { projectId } = inputs;

  const files = await File.findAll({
    where: {
      ProjectId: projectId,
    },
  });
  let bucketName;
  for (let i = 0; i < files.length; i += 1) {
    const fileLocation = files[i].location;
    const fileType = files[i].type;
    const fileName = files[i].name;
    if (fileType === FILE_TYPES.SUPPORTING_DOCUMENT) {
      bucketName = storage.bucket(
        process.env.GCLOUD_STORAGE_SUPPORT_FILE_BUCKET,
      );
    } else {
      bucketName = storage.bucket(
        process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET,
      );
    }
    // var gcpFile = await storage.bucket(bucketName.name).file(`${fileLocation}`).getMetadata();
    try {
      // eslint-disable-next-line no-await-in-loop
      await storage.bucket(bucketName.name).file(`${fileLocation}`).delete();
      this.logger.info(`[FILE-SERVICE] :: ${fileName} deleted successfully`);
    } catch (error) {
      this.logger.error(
        `[FILE-SERVICE] :: ${fileName} does not exists in GCP or deletion failed with error ${error}`,
      );
    }
  }
  this.logger.info(
    `[FILE-SERVICE] :: GCP files deletion operation completed successfully`,
  );
}

async function getAllSharedFile(inputs) {
  let where = {};
  const filter = inputs.filter || {};

  const filterColumnsMapping = {
    fileName: `$SharedFile.name$`,
    client: `$Client.name$`,
    createdBy: `$sharedFileCreator.userName$`,
    createdAt: `$SharedFile.createdAt$`,
    projectName: `$Projects.name$`,
  };
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  const sortColumnsMapping = {
    fileName: `"SharedFile"."name"`,
    createdBy: `"sharedFileCreator"."userName"`,
    createdAt: `"SharedFile"."createdAt"`,
  };
  const customSortColumn = {};
  let order = [];
  const sort = inputs.sort || {};
  order = this.sortHandler.buildOrderClause(
    sortColumnsMapping,
    customSortColumn,
    sort,
    order,
  );

  const sharedFiles = {};

  sharedFiles.totalCount = await SharedFile.count({
    include: [
      {
        model: Project,
        attributes: [],
        through: {
          attributes: [],
        },
      },
      {
        model: Client,
        attributes: [],
        required: true,
      },
      {
        model: User,
        as: 'sharedFileCreator',
        attributes: [],
        required: true,
      },
    ],
    where,
    distinct: true,
    col: 'id',
    subQuery: false,
  });

  sharedFiles.docs = await SharedFile.findAll({
    attributes: [
      ['id', 'sharedFileId'],
      ['name', 'fileName'],
      'createdAt',
      [Sequelize.col('Client.name'), 'client'],
      [Sequelize.col('sharedFileCreator.userName'), 'createdBy'],
      [
        Sequelize.literal(`ARRAY_REMOVE(ARRAY_AGG("Projects"."name"),null)`),
        'linkedProjects',
      ],
      [Sequelize.literal(`COUNT("Projects"."name")`), 'linkedProjectCount'],
    ],
    include: [
      {
        model: Project,
        attributes: [],
        through: {
          attributes: [],
        },
      },
      {
        model: Client,
        attributes: [],
        required: true,
      },
      {
        model: User,
        as: 'sharedFileCreator',
        attributes: [],
        required: true,
      },
    ],
    group: ['sharedFileId', 'Client.id', 'sharedFileCreator.id'],
    where,
    order,
    limit: inputs.limit,
    offset: inputs.offset,
    subQuery: false,
  });

  return sharedFiles;
}

async function getCreatedBy() {
  const result = await SharedFile.findAll({
    attributes: [[Sequelize.col('sharedFileCreator.userName'), 'createdBy']],
    include: [
      {
        model: User,
        as: 'sharedFileCreator',
        attributes: [],
        required: true,
      },
    ],
    group: ['sharedFileCreator.id'],
    raw: true,
    subQuery: false,
  });

  const uniqueValues = result.map((item) => item.createdBy);
  return uniqueValues;
}

async function getClients() {
  const result = await SharedFile.findAll({
    attributes: [[Sequelize.col('Client.name'), 'client']],
    include: [
      {
        model: Client,
        attributes: [],
        required: true,
      },
    ],
    group: ['Client.id'],
    raw: true,
    subQuery: false,
  });

  const uniqueValues = result.map((item) => item.client);
  return uniqueValues;
}

FileCRUDService.prototype = {
  getAllFile,
  getFileById,
  createFile,
  generateFileDownloadURL,
  deleteFileById,
  deleteAllFilesOfAProject,
  getJobByFileId,
  deleteFile,
  deleteSuppressionRecords,
  deleteSuppressionFileJob,
  deleteSuppressionFileChunks,
  deleteSuppressionJobErrors,
  getAllSharedFile,
  getCreatedBy,
  getClients,
};

module.exports = FileCRUDService;
