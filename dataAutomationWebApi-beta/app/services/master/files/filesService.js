/* eslint-disable no-param-reassign */
const {
  File,
  Job,
  FileChunk,
  sequelize,
} = require('@nexsalesdev/master-data-model');
const { Storage } = require('@google-cloud/storage');
const {
  FILE_TYPES,
  INCLUSION_EXPORT_FILE_OPERATIONS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const _ = require('lodash');
const settingsConfig = require('../../../config/settings/settings-config');
const AccountService = require('../accounts/accountsService');
const ContactService = require('../contacts/contactsService');
const LocationService = require('../location/locationsService');

let storage = new Storage();

if (process.env.GCLOUD_STORAGE_EMAIL) {
  storage = new Storage({
    email: process.env.GCLOUD_STORAGE_EMAIL,
    projectId: process.env.PROJECT_ID,
  });
}

function FileCRUDService() {
  const config = settingsConfig.settings || {};
  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;

  this.accountService = new AccountService();
  this.contactService = new ContactService();
  this.locationService = new LocationService();
}

async function getMasterFileById(fileId) {
  this.logger.debug('[GET-MASTER-FILE-BY_ID] :: searching in individual files');

  const file = await File.findOne({
    where: {
      id: fileId,
    },
    raw: true,
  });

  return file;
}

async function deleteMasterFilesInfoFromDB(inputs) {
  // Delete Job Errors Of A File
  let sql = ` DELETE FROM "JobErrors" AS "JobError" `;
  sql += ` USING "Jobs" AS "Job" , "Files" AS "Job->File" `;
  sql += ` WHERE "JobError"."JobId" = "Job"."id" `;
  sql += ` AND "Job"."FileId" = "Job->File"."id" `;
  sql += ` AND "Job->File"."id" = :fileId `;

  const replacements = {
    fileId: inputs.fileId,
  };

  await sequelize.query(sql, {
    replacements,
    type: sequelize.QueryTypes.DELETE,
    transaction: inputs.transaction,
  });

  // Delete Jobs Of A File
  await Job.destroy({
    where: {
      FileId: inputs.fileId,
    },
    transaction: inputs.transaction,
  });

  // Delete File Chunks Of A File
  await FileChunk.destroy({
    where: {
      FileId: inputs.fileId,
    },
    transaction: inputs.transaction,
  });

  // Delete A File
  await File.destroy({
    where: {
      id: inputs.fileId,
    },
    transaction: inputs.transaction,
  });
}

async function deleteMasterFileById(inputs) {
  const { fileId } = inputs;

  const file = await this.getMasterFileById(fileId);

  if (!file) {
    this.logger.error(
      `[DELETE-MASTER-FILE-BY-ID] : Could Not Find File With Id ${fileId}`,
    );
    throw new Error(`File With Id ${fileId} Does not Exist`);
  }

  const deleteMasterFilesInfoFromDBDTO = {
    fileId,
    transaction: inputs.transaction,
  };
  await this.deleteMasterFilesInfoFromDB(deleteMasterFilesInfoFromDBDTO);

  const bucketName =
    process.env.MASTER_GCLOUD_STORAGE_PROCESS_FILE_BUCKET || 'da-local-files';

  const bucket = storage.bucket(bucketName);
  const [isFileExists] = await bucket.file(file.location).exists();
  this.logger.error(
    `[DELETE-MASTER-FILE-BY-ID] : Check File Exist in GCP ${isFileExists}`,
  );

  if (isFileExists) {
    await bucket.file(file.location).delete();
  }

  return fileId;
}

async function createMasterFileInDB(inputs) {
  await File.create(
    {
      id: inputs.id,
      name: inputs.name,
      type: inputs.type,
      format: inputs.format,
      location: inputs.location,
      mapping: inputs.mapping,
      headers: inputs.headers,
      source: inputs.source,
      createdBy: inputs.createdBy,
    },
    {
      transaction: inputs.transaction,
    },
  );
}

async function createMasterJobInDB(inputs) {
  await Job.create(
    {
      id: inputs.id,
      status: inputs.status,
      chunks: inputs.chunks,
      operationName: inputs.operationName,
      operationParam: inputs.operationParam,
      processed: inputs.processed,
      imported: inputs.imported,
      errored: inputs.errored,
      createdBy: inputs.createdBy,
      FileId: inputs.fileId,
    },
    {
      transaction: inputs.transaction,
    },
  );
}

async function createMasterFile(inputs) {
  let bucketName =
    process.env.MASTER_GCLOUD_STORAGE_PROCESS_FILE_BUCKET || 'da-local-files';
  let fileDownloadLocation = '';
  let fileUploadLocation = `files/${inputs.fileType}/${inputs.fileId}${inputs.format}`;

  if (inputs.fileType === FILE_TYPES.INCLUSION_EXPORT) {
    bucketName =
      process.env.INCLUSION_EXPORT_BUCKET || 'dev-da-inclusion-import-files';
    fileUploadLocation = `files/${inputs.fileType}/jobs/${inputs.jobId}/${inputs.fileId}${inputs.format}`;
    let downloadFileName = '';
    switch (inputs.operationName) {
      case INCLUSION_EXPORT_FILE_OPERATIONS.ACCOUNT_INCLUSION_EXPORT:
        downloadFileName = `AccountMaster_${new Date(Date.now())}.csv`;
        break;
      case INCLUSION_EXPORT_FILE_OPERATIONS.CONTACT_INCLUSION_EXPORT:
        downloadFileName = `ContactMaster_${new Date(Date.now())}.csv`;
        break;
      default:
        throw new Error(`Invalid Operation Name : ${inputs.operationNam}`);
    }
    fileDownloadLocation = `files/master/${inputs.fileType}/${downloadFileName}`;
  }

  const jobStatus = inputs.jobStatus || 'Queued';
  const processed = inputs.processed || 0;
  const imported = inputs.imported || 0;
  const errored = inputs.errored || 0;

  const jobOperationParams = inputs.operationParam || {};

  if (_.has(jobOperationParams, 'account')) {
    jobOperationParams.beforeUploadAccountCounts =
      await this.accountService.getAccountCounts();

    jobOperationParams.beforeUploadLocationCounts =
      await this.locationService.getLocationCounts();
  } else if (_.has(jobOperationParams, 'contact')) {
    jobOperationParams.beforeUploadContactCounts =
      await this.contactService.getContactsCounts();
  }

  if (fileDownloadLocation)
    jobOperationParams.inclusionExportUploadedFileLocation = fileUploadLocation;

  if (
    _.get(jobOperationParams, 'account', '') === 'Overwrite If Not Verified'
  ) {
    jobOperationParams.account = 'Overwrite';
    jobOperationParams.isNotVerifiedWithOverwrite = true;
  } else if (
    _.get(jobOperationParams, 'contact', '') === 'Overwrite If Not Verified'
  ) {
    jobOperationParams.contact = 'Overwrite';
    jobOperationParams.isNotVerifiedWithOverwrite = true;
  }

  // signedURL options
  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    contentType: inputs.fileContentType,
  };

  const bucket = storage.bucket(bucketName);
  // Get a v4 signed URL for uploading file
  const [url] = await bucket
    .file(`${fileUploadLocation}`)
    .getSignedUrl(options);

  let fileHeaders = Object.values(inputs.mapping);
  if (Array.isArray(fileHeaders) && fileHeaders.length) {
    const data = [...new Set(fileHeaders)];

    fileHeaders = data.filter((element) => {
      element = _.trim(element);
      return !(
        element === '' ||
        element.toLowerCase() === 'null' ||
        element.toLowerCase() === 'undefined'
      );
    });
  }

  // database entry
  // 1. file entry
  const createMasterFileDTO = {
    id: inputs.fileId,
    name: inputs.fileName,
    type: inputs.fileType,
    format: inputs.format,
    location: fileDownloadLocation || fileUploadLocation,
    mapping: inputs.mapping,
    headers: fileHeaders,
    source: inputs.source,
    createdBy: inputs.createdBy,
    transaction: inputs.transaction,
  };
  await this.createMasterFileInDB(createMasterFileDTO);

  // 2. job entry
  const createMasterJobDTO = {
    id: inputs.jobId,
    status: jobStatus,
    chunks: inputs.chunks,
    operationName: inputs.operationName,
    operationParam: jobOperationParams,
    processed,
    imported,
    errored,
    createdBy: inputs.createdBy,
    fileId: inputs.fileId,
    transaction: inputs.transaction,
  };
  await this.createMasterJobInDB(createMasterJobDTO);

  // return signed URL
  return { uploadUrl: url, fileId: inputs.fileId };
}

FileCRUDService.prototype = {
  deleteMasterFileById,
  getMasterFileById,
  createMasterFile,
  createMasterFileInDB,
  createMasterJobInDB,
  deleteMasterFilesInfoFromDB,
};

module.exports = FileCRUDService;
