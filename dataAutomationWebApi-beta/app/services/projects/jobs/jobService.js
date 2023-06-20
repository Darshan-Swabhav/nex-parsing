const _ = require('lodash');
const {
  Job,
  File,
  SharedFile,
  Project,
  JobError,
  Sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');
const {
  JOB_OPERATION_NAME,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const {
  generateV4UploadSignedUrl,
} = require('@nexsalesdev/da-download-service-repository');
const { CloudTasksClient } = require('@google-cloud/tasks');
const {
  FILE_TYPES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');

const taskQueueClient = new CloudTasksClient();

const { Op } = Sequelize;
const settingsConfig = require('../../../config/settings/settings-config');

const UPLOAD_FILE_OPERATION_NAMES = [
  'accountSuppression',
  'contactSuppression',
  'accountInclusion',
  'contactInclusion',
  'accountImport',
  'contactImport',
  'taskImport',
  'acccountInProgress', // TODO: correct typo here and in web api as well
  'contactInProgress',
  'masterAccountImport',
];
const ASYNC_DOWNLOAD_FILE_OPERATION_NAMES = [
  'asyncAccountExport',
  'asyncContactExport',
  'asyncTaskExport',
];
const TASK_ALLOCATION_FILE_OPERATION_NAMES = ['taskAllocation'];
const ALL_FILE_OPERATION_NAMES = Object.values(JOB_OPERATION_NAME);

function JobCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function buildOrderClause(sort, order) {
  if (
    sort.createdAt &&
    (sort.createdAt.toLowerCase() === 'asc' ||
      sort.createdAt.toLowerCase() === 'desc')
  ) {
    order.push(['createdAt', sort.createdAt]);
  }
  return order;
}

async function getAllJobs(inputs, sort) {
  const { limit, offset, projectId, fileStatus, userId } = inputs;
  const fileOperations = [];
  const where = {
    [Op.or]: {
      '$File.ProjectId$': projectId,
      '$SharedFile->Projects->SharedFileProject.ProjectId$': projectId,
    },
  };

  if (fileStatus.length) {
    // List Import/Inclusion/Suppression Jobs
    if (fileStatus.includes('upload')) {
      fileOperations.push(UPLOAD_FILE_OPERATION_NAMES);
    }
    // List Task jobs
    if (fileStatus.includes('taskAllocation')) {
      fileOperations.push(TASK_ALLOCATION_FILE_OPERATION_NAMES);
    }
    // List Async Export Jobs
    if (fileStatus.includes('download')) {
      fileOperations.push(ASYNC_DOWNLOAD_FILE_OPERATION_NAMES);

      where['$Job.createdBy$'] = {
        [Op.eq]: userId,
      };
    }
  }
  // List All Types Of Jobs
  else {
    fileOperations.push(ALL_FILE_OPERATION_NAMES);
  }

  where['$Job.operation_name$'] = {
    [Op.or]: fileOperations,
  };

  let order = [];
  order = buildOrderClause(sort, order);

  const result = await Job.findAndCountAll({
    where: [where],
    attributes: [
      ['id', 'jobId'],
      'status',
      'operation_name',
      'result_processed',
      'result_imported',
      'result_errored',
      'dupSupCheckSuccessCount',
      'dupSupCheckErrorCount',
      'createdAt',
      'updatedAt',
      'row_count',
      'chunks',
      [Sequelize.col('File.id'), 'fileId'],
      [Sequelize.col('File.name'), 'fileName'],
      [Sequelize.col('SharedFile.id'), 'sharedFileId'],
      [Sequelize.col('SharedFile.name'), 'sharedFileName'],
    ],
    include: [
      {
        model: File,
        attributes: [],
      },
      {
        model: SharedFile,
        attributes: [],
        include: {
          model: Project,
          attributes: [],
          through: {
            attributes: [],
          },
        },
      },
    ],
    order,
    subQuery: false,
    raw: true,
    limit,
    offset,
  });

  const jobList = result.rows;
  for (let index = 0; index < jobList.length; index += 1) {
    let element = jobList[index];
    if (!element.fileId) {
      element.fileId = element.sharedFileId;
      element.fileName = element.sharedFileName;
    }
    element = _.omit(element, ['sharedFileId', 'sharedFileName']);
    jobList[index] = element;
  }

  const jobs = {};
  jobs.totalCount = result.count;
  jobs.docs = jobList;
  return jobs;
}

async function getActiveTaskAllocationLabel(projectId) {
  const workingStatusOfTaskAllocationJob = [
    'Queued',
    'Preparing',
    'Verifying',
    'Verified',
    'Processing',
  ];

  const jobsDetail = await Job.findAll({
    attributes: [['id', 'jobId'], 'status'],
    where: {
      operation_name: JOB_OPERATION_NAME.TASK_ALLOCATION,
      status: workingStatusOfTaskAllocationJob,
    },
    include: [
      {
        model: File,
        attributes: [],
        where: {
          ProjectId: projectId,
        },
      },
    ],
    raw: true,
  });

  let result = [
    {
      jobId: '',
      label: 'Assign Task',
    },
  ];

  if (!jobsDetail.length) return result;
  if (jobsDetail.length > 1)
    this.logger.error(
      `[ACCOUNT_SERVICE] : There is more than one task allocation process in this project{ projectId: ${projectId}}`,
    );

  result = [];
  for (let index = 0; index < jobsDetail.length; index += 1) {
    const jobDetail = jobsDetail[index];

    let label = '';
    const { jobId } = jobDetail;
    switch (jobDetail.status) {
      case 'Queued':
      case 'Preparing':
        label = 'Assigning Task';
        break;
      case 'Verifying':
        label = 'Verify Assignment';
        break;
      case 'Verified':
      case 'Processing':
        label = 'Creating Task';
        break;
      default:
        label = 'Assign Task';
        break;
    }
    result.push({ label, jobId });
  }
  return result;
}

async function getJobStatusOfContactInject({ projectId, accountId }) {
  if (!projectId) throw new Error('ProjectId is Empty');
  if (!accountId) throw new Error('AccountId is Empty');

  const referenceId = `project_${projectId}_account_${accountId}`;

  const job = await Job.findOne({
    where: {
      operation_name: JOB_OPERATION_NAME.MASTER_CONTACT_IMPORT,
      referenceId,
    },
    order: [['createdAt', 'desc']],
    raw: true,
  });

  if (!job) return job;

  const statusResult = {
    status: job.status,
    processed: job.result_processed,
    imported: job.result_imported,
    errored: job.result_errored,
  };
  return statusResult;
}

async function getJobById(inputs) {
  const { jobId } = inputs;
  const { projectId } = inputs;

  const result = await Job.findOne({
    where: {
      id: jobId,
      [Op.or]: {
        '$File.ProjectId$': projectId,
        '$SharedFile->Projects->SharedFileProject.ProjectId$': projectId,
      },
    },
    attributes: [
      ['id', 'jobId'],
      'status',
      'operation_name',
      'result_processed',
      'result_imported',
      'result_errored',
      'createdAt',
      'updatedAt',
      'row_count',
      'chunks',
      [Sequelize.col('File.id'), 'fileId'],
      [Sequelize.col('File.name'), 'fileName'],
      [Sequelize.col('File.location'), 'fileLocation'],
      [Sequelize.col('File.type'), 'fileType'],
      [Sequelize.col('SharedFile.id'), 'sharedFileId'],
      [Sequelize.col('SharedFile.name'), 'sharedFileName'],
      [Sequelize.col('SharedFile.location'), 'sharedFileLocation'],
      [Sequelize.col('SharedFile.type'), 'sharedFileType'],
    ],
    include: [
      {
        model: File,
        attributes: [],
      },
      {
        model: SharedFile,
        attributes: [],
        include: {
          model: Project,
          attributes: [],
          through: {
            attributes: [],
          },
        },
      },
    ],
    raw: true,
  });

  if (!result.fileId) {
    result.fileId = result.sharedFileId;
    result.fileName = result.sharedFileName;
    result.fileLocation = result.sharedFileLocation;
    result.fileType = result.sharedFileType;
  }
  delete result.sharedFileId;
  delete result.sharedFileName;
  delete result.sharedFileLocation;
  delete result.sharedFileType;

  return result;
}

async function enqueue(payload, serviceEndpointUrl) {
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: serviceEndpointUrl,
    },
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

function validateUpdateJobData(data) {
  const { status } = data || {};
  const VALID_JOB_STATUS = ['Cancelled', 'Verified'];

  if (!VALID_JOB_STATUS.includes(status))
    throw new Error(`Received Unknown status`);
}

async function updateJobById(inputs) {
  const { status, jobId, projectId, userId } = inputs;

  const jobInstance = await Job.findOne({
    attributes: ['id', 'status'],
    where: { id: jobId, operation_name: JOB_OPERATION_NAME.TASK_ALLOCATION },
    include: [
      {
        attributes: [],
        model: File,
        where: {
          ProjectId: projectId,
        },
      },
    ],
  });
  if (!jobInstance) throw new Error(`Could not find job for taskAllocation`);
  jobInstance.status = status;
  jobInstance.save();

  const payload = {
    jobId,
    projectId,
    userId,
  };

  return this.enqueue(payload, this.config.ALLOCATION_CONFIRMATION_ENDPOINT);
}

async function getJobErrors(inputs) {
  const { jobId } = inputs;

  const result = await JobError.findAll({
    where: {
      JobId: jobId,
    },
  });
  return result;
}

async function downloadJobError(jobId) {
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
  if (row.id) {
    delete row.id;
  }
  if (row.JobId) {
    delete row.JobId;
  }
  if (row.error_count) {
    delete row.error_count;
  }
  if (row.chunk_index) {
    delete row.chunk_index;
  }
  if (row.createdAt) {
    delete row.createdAt;
  }
  if (row.updatedAt) {
    delete row.updatedAt;
  }

  if (row.row_content && typeof row.row_content === 'object') {
    row.row_content = JSON.stringify(row.row_content);
  }

  return row;
}

async function generateSignedURL(jobId, projectId) {
  const jobData = await this.getJobById({ jobId, projectId });
  const { fileLocation, fileType } = jobData;

  let downloadFilesBucketName;
  switch (fileType) {
    case FILE_TYPES.IMPORT:
    case FILE_TYPES.INCLUSION:
    case FILE_TYPES.IN_PROGRESS:
    case FILE_TYPES.SUPPRESSION:
    case FILE_TYPES.TASK_ALLOCATION:
    case FILE_TYPES.MASTER_IMPORT:
      downloadFilesBucketName =
        process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET || 'da-local-files';
      break;
    case FILE_TYPES.SUPPORTING_DOCUMENT:
      downloadFilesBucketName =
        process.env.GCLOUD_STORAGE_SUPPORT_FILE_BUCKET || 'da-local-files';
      break;
    case FILE_TYPES.EXPORT:
      downloadFilesBucketName =
        process.env.GCLOUD_STORAGE_DOWNLOAD_FILE_BUCKET || 'da-local-files';
      break;
    default:
      downloadFilesBucketName = 'da-local-files';
      break;
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

JobCRUDService.prototype = {
  getAllJobs,
  getActiveTaskAllocationLabel,
  getJobStatusOfContactInject,
  getJobById,
  enqueue,
  validateUpdateJobData,
  updateJobById,
  getJobErrors,
  downloadJobError,
  convertToCSVFormat,
  generateSignedURL,
};

module.exports = JobCRUDService;
