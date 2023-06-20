const { isEmpty, trim, cloneDeep } = require('lodash');
const {
  generateV4UploadSignedUrl,
} = require('@nexsalesdev/da-download-service-repository');
const {
  Job,
  File,
  Account,
  JobError,
  Location,
  Contact,
  Sequelize,
} = require('@nexsalesdev/master-data-model');
const {
  FILE_TYPES,
  UPLOAD_FILE_OPERATIONS,
  ASYNC_DOWNLOAD_FILE_OPERATIONS,
  INCLUSION_EXPORT_FILE_OPERATIONS,
  USER_ROLES,
  JOB_STATUS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const SortHandler = require('@nexsalesdev/master-data-model/lib/services/sortHandler');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;
const UPLOAD_FILE_OPERATION_NAMES = Object.values(UPLOAD_FILE_OPERATIONS);

function JobCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
  this.sortHandler = new SortHandler();
}

async function getCountOfProcessingJob(_where) {
  const where = _where;
  where.status = JOB_STATUS.PROCESSING;
  const totalProcessingFile = await Job.count({
    where,
    attributes: [],
    subQuery: false,
    raw: true,
  });

  return totalProcessingFile;
}
async function getAllMasterJobs(inputs, sort) {
  const { limit, offset, jobType, userEmail, userRoles } = inputs;
  let where = [];
  const masterDataCount = {};

  if (jobType.includes('upload')) {
    const whereForUpload = {};
    whereForUpload.operationName = UPLOAD_FILE_OPERATION_NAMES;

    where.push(whereForUpload);
  }
  if (jobType.includes('uploadAccount')) {
    const whereForUpload = {};
    whereForUpload.operationName = UPLOAD_FILE_OPERATIONS.ACCOUNT_IMPORT;

    where.push(whereForUpload);
    if (trim(inputs.getDataCount).toLowerCase() === 'true') {
      masterDataCount.totalAccount = await Account.count();
      masterDataCount.totalLocationAccount = await Location.count();
      const whereForProcessingFileCount = cloneDeep(whereForUpload);
      masterDataCount.totalProcessingAccountFile =
        await getCountOfProcessingJob(whereForProcessingFileCount);
    }
  }
  if (jobType.includes('uploadContact')) {
    const whereForUpload = {};
    whereForUpload.operationName = UPLOAD_FILE_OPERATIONS.CONTACT_IMPORT;

    where.push(whereForUpload);
    if (trim(inputs.getDataCount).toLowerCase() === 'true') {
      masterDataCount.totalContact = await Contact.count();
      const whereForProcessingFileCount = cloneDeep(whereForUpload);
      masterDataCount.totalProcessingContactFile =
        await getCountOfProcessingJob(whereForProcessingFileCount);
    }
  }
  if (jobType.includes('download')) {
    let whereForDownload = {};
    whereForDownload.operationName = [
      ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_ACCOUNT_EXPORT,
      ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_CONTACT_EXPORT,
      ...Object.values(INCLUSION_EXPORT_FILE_OPERATIONS),
    ];
    whereForDownload.createdBy = userEmail;

    if (userRoles.includes(USER_ROLES.COMPLIANCE)) {
      whereForDownload = {
        [Op.or]: {
          [Op.and]: whereForDownload,
          operationName:
            ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_VERIFY_ACCOUNT_EXPORT,
        },
      };
    }

    where.push(whereForDownload);
  }

  if (jobType.includes('importAccountErrorDownload')) {
    const whereForUpload = {};
    whereForUpload.operationName =
      ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_ACCOUNT_IMPORT_ERROR_EXPORT;

    where.push(whereForUpload);
  }
  if (jobType.includes('importContactErrorDownload')) {
    const whereForUpload = {};
    whereForUpload.operationName =
      ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_CONTACT_IMPORT_ERROR_EXPORT;
    where.push(whereForUpload);
  }

  if (isEmpty(where)) where = null;

  const sortColumnsMapping = {
    createdAt: `"createdAt"`,
  };
  const customSortColumn = {};
  let order = [];
  order = this.sortHandler.buildOrderClause(
    sortColumnsMapping,
    customSortColumn,
    sort,
    order,
  );

  const result = await Job.findAndCountAll({
    where,
    attributes: [
      ['id', 'jobId'],
      'operationName',
      'status',
      'rowCount',
      'processed',
      'imported',
      'errored',
      'createdAt',
      'updatedAt',
      [Sequelize.col('File.name'), 'fileName'],
      [Sequelize.col('File.source'), 'fileSource'],
    ],
    include: [
      {
        model: File,
        attributes: [],
        required: true,
      },
    ],
    order,
    subQuery: false,
    raw: true,
    limit,
    offset,
  });

  const jobs = {
    totalCount: result.count,
    ...masterDataCount,
    docs: result.rows,
  };
  return jobs;
}

async function getJobById(inputs) {
  const { jobId } = inputs;

  const result = await Job.findOne({
    where: {
      id: jobId,
    },
    attributes: [
      ['id', 'jobId'],
      [Sequelize.col('File.id'), 'fileId'],
      [Sequelize.col('File.name'), 'fileName'],
      [Sequelize.col('File.location'), 'fileLocation'],
      [Sequelize.col('File.type'), 'fileType'],
    ],
    include: [
      {
        model: File,
        attributes: [],
        required: true,
      },
    ],
    raw: true,
  });

  return result;
}

async function generateSignedURL(inputs) {
  const { jobId } = inputs;
  const jobData = await this.getJobById({ jobId });
  const { fileLocation, fileType } = jobData;

  let downloadFilesBucketName;
  switch (fileType) {
    case FILE_TYPES.IMPORT:
      downloadFilesBucketName =
        process.env.MASTER_GCLOUD_STORAGE_PROCESS_FILE_BUCKET;
      break;
    case FILE_TYPES.EXPORT:
    case FILE_TYPES.INCLUSION_EXPORT:
    case FILE_TYPES.IMPORT_ERROR_EXPORT:
      downloadFilesBucketName =
        process.env.MASTER_GCLOUD_STORAGE_DOWNLOAD_FILE_BUCKET;
      break;
    default:
      throw new Error(`Unknown file type for download: ${fileType}`);
  }

  if (!downloadFilesBucketName) {
    this.logger.error(
      `[GENERATE_SIGNED_URL] : Could not Found Bucket Name While Downloading file: ${fileLocation}`,
    );
    throw new Error(`Could not Found Bucket Name`);
  }

  this.logger.info(
    `[GENERATE_SIGNED_URL] : Generating SIgned URL for { file: ${fileLocation}, bucket: ${downloadFilesBucketName}`,
  );

  const singedURL = await generateV4UploadSignedUrl(
    fileLocation,
    downloadFilesBucketName,
  );
  this.logger.info(
    `[GENERATE_SIGNED_URL] : SIgned URL Generated  { file: ${fileLocation}, bucket: ${downloadFilesBucketName}`,
  );
  return singedURL;
}

async function getMasterJobErrors(inputs) {
  const { jobId } = inputs;

  const result = await JobError.findAll({
    where: {
      JobId: jobId,
    },
  });
  return result;
}

async function downloadJobErrorsMaster(jobId) {
  this.logger.info(
    `Generating Signed URL to download job Error report for ${jobId}`,
  );
  const downloadFilesBucketName = 'da-temp-files';
  const fileLocation = `files/jobErrorReports/${jobId}_error_report.csv`;
  const singedURL = await generateV4UploadSignedUrl(
    fileLocation,
    downloadFilesBucketName,
  );
  this.logger.info(
    `Signed URL to download job Error report for ${jobId} Generated`,
  );
  return singedURL;
}

function convertToCSVFormat(_row) {
  let row = _row;
  row = JSON.parse(JSON.stringify(row));
  delete row.id;
  delete row.jobId;
  delete row.errorCount;
  delete row.chunkIndex;
  delete row.createdAt;
  delete row.updatedAt;

  if (row.rowContent && typeof row.rowContent === 'object') {
    row.rowContent = JSON.stringify(row.rowContent);
  }

  return row;
}

JobCRUDService.prototype = {
  getAllMasterJobs,
  generateSignedURL,
  getJobById,
  convertToCSVFormat,
  downloadJobErrorsMaster,
  getMasterJobErrors,
};

module.exports = JobCRUDService;
