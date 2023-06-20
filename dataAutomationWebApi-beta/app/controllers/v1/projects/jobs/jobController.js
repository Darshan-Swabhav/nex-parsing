/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const { isEmpty, cloneDeep } = require('lodash');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');
/**
 *
 * @openapi
 *
 * definitions:
 *   job:
 *     properties:
 *       jobId:
 *        type: string
 *       status:
 *        type: string
 *       operation_name:
 *        type: string
 *       result_processed:
 *        type: integer
 *       result_imported:
 *        type: integer
 *       result_errored:
 *        type: integer
 *       createdAt:
 *        type: string
 *       updatedAt:
 *        type: string
 *       fileId:
 *        type: string
 *       fileName:
 *        type: string
 *
 *   jobErrors:
 *     properties:
 *       id:
 *        type: string
 *       error_desc:
 *        type: string
 *       row_content:
 *        type: object
 *       error_count:
 *        type: integer
 *       type:
 *        type: string
 *       row_index:
 *        type: integer
 *       chunk_index:
 *        type: integer
 *       createdAt:
 *        type: string
 *       updatedAt:
 *        type: string
 *       JobId:
 *        type: string
 *
 *   signedURL:
 *     properties:
 *       url:
 *        type: string
 *
 * /project/{projectId}/jobs:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getJob
 *     tags:
 *       - Job
 *     description: This is job list route which fetch the all the job
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: query
 *       name: pageNo
 *       type: integer
 *       description: page number
 *     - in: query
 *       name: pageSize
 *       type: integer
 *       description: page sizes
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the job array
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/job'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/jobs/{jobId}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getJobById
 *     tags:
 *       - Job
 *     description: This is the Job route that returns Job data.
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: path
 *       name: jobId
 *       type: integer
 *       description: job id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the job
 *         schema:
 *            $ref: '#/definitions/job'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: updateJob
 *     tags:
 *       - Tasks
 *     description: This is job update route
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: string
 *       description: Project Id
 *       required: true
 *     - in: path
 *       name: jobId
 *       type: string
 *       description: Job Id
 *       required: true
 *     - in: body
 *       name: jobData
 *       schema:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: if job update successfully then Return 200 with a Success Message
 *       '403':
 *         description: If user does not have access to this route then send error
 *       '400':
 *         description: if required parameters not passes or parameters value is incorrect then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/jobs/{jobId}/jobErrors:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getJobErrorsByJobId
 *     tags:
 *       - Job Errors
 *     description: This is the Job Error route that returns Job Errors data.
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: path
 *       name: jobId
 *       type: integer
 *       description: job id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the job errors
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/jobErrors'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/jobs/{jobId}/getSignedURL:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getSignedURL
 *     tags:
 *       - Generate Signed URL
 *     description: it will generate the signed url for the given job's output file.
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: path
 *       name: jobId
 *       type: integer
 *       description: job id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the signed URL
 *         schema:
 *            $ref: '#/definitions/signedURL'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function JobsController() {
  const JobCRUDService = require('../../../../services/projects/jobs/jobService');
  const ValidationService = require('../../../../services/helpers/validationService');
  const PaginationService = require('../../../../services/helpers/paginationService');
  const FileStreamService = require('../../../../services/stream/fileStreamService');

  this.jobCrudService = new JobCRUDService();
  this.validationService = new ValidationService();
  this.paginationService = new PaginationService();
  this.fileStreamService = new FileStreamService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const fileStatus = req.query.fileStatus || [];
  const activeTaskAllocationLabel =
    req.query.activeTaskAllocationLabel || false;
  const activeMasterContactImport =
    req.query.activeMasterContactImport || false;
  const { accountId } = req.query;

  const inputs = {};
  inputs.limit = page.limit;
  inputs.offset = page.offset;
  inputs.projectId = projectId;
  inputs.fileStatus = fileStatus;
  inputs.userId = userId;
  let sort = req.query.sort || {};

  if (fileStatus.includes('download') && isEmpty(sort)) {
    sort = { createdAt: 'ASC' };
  }

  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[JOB_CONTROLLER] :: ERROR :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The sort value type is not an object',
      });
    }
  }

  if (activeTaskAllocationLabel) {
    logger.info(
      `[JOB_CONTROLLER] :: START :: Fetch Active Task allocation Label {userId : ${userId}}`,
    );

    try {
      const jobList = await self.jobCrudService.getActiveTaskAllocationLabel(
        projectId,
      );

      logger.info(
        `[JOB_CONTROLLER] :: SUCCESS :: Fetch Active Task allocation Label {userId : ${userId}}`,
      );

      return res.status(200).send(jobList);
    } catch (err) {
      logger.error(
        `[JOB_CONTROLLER] :: ERROR :: Fetch Active Task allocation Label {userId : ${userId}, error : ${err.message}}`,
      );

      return res.status(500).send({
        err,
        desc: 'Could Not Get Active Task allocation Label',
      });
    }
  }

  if (activeMasterContactImport) {
    if (!accountId) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'accountId is required',
      });
    }

    logger.info(
      `[JOB_CONTROLLER] :: START :: Fetch Job of Active Master Contact Import {userId : ${userId}}`,
    );

    try {
      const jobStatus = await self.jobCrudService.getJobStatusOfContactInject({
        projectId,
        accountId,
      });

      logger.info(
        `[JOB_CONTROLLER] :: SUCCESS :: Fetch Job of Active Master Contact Import {userId : ${userId}}`,
      );

      return res.status(200).send(jobStatus);
    } catch (err) {
      logger.error(
        `[JOB_CONTROLLER] :: ERROR :: Fetch Job of Active Master Contact Import {userId : ${userId}, error : ${err.message}}`,
      );

      return res.status(500).send({
        err,
        desc: 'Could Not Get Job of Active Master Contact Import',
      });
    }
  }

  logger.info(
    `[JOB_CONTROLLER] :: START :: Fetch all job {userId : ${userId}}`,
  );

  try {
    const jobList = await self.jobCrudService.getAllJobs(inputs, sort);

    logger.info(
      `[JOB_CONTROLLER] :: SUCCESS :: Fetch all job {userId : ${userId}}`,
    );

    return res.status(200).send(jobList);
  } catch (err) {
    logger.error(
      `[JOB_CONTROLLER] :: ERROR :: Fetch all job {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get JOBs',
    });
  }
}

async function getJobById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }
  const { projectId } = req.params;
  if (!projectId) {
    logger.error(
      `[JOB_CONTROLLER] :: ERROR :: Could not find projectId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const { jobId } = req.params;
  if (!jobId) {
    logger.error(
      `[JOB_CONTROLLER] :: ERROR :: Could not find jobId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.jobId = jobId;

  logger.info(
    `[JOB_CONTROLLER] :: START :: Fetch job by id {userId : ${userId}}`,
  );

  try {
    const job = await self.jobCrudService.getJobById(inputs);

    logger.info(
      `[JOB_CONTROLLER] :: SUCCESS :: Fetch job by id {userId : ${userId}}`,
    );

    return res.status(200).send(job);
  } catch (err) {
    logger.error(
      `[JOB_CONTROLLER] :: ERROR :: Fetch job by id {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get JOB',
    });
  }
}

async function put(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }
  const { roles } = req.user;
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[JOB_CONTROLLER] :: ERROR :: This user does not have access to the route {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { projectId } = req.params;
  if (!projectId) {
    logger.error(
      `[JOB_CONTROLLER] :: ERROR :: Could not find projectId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const { jobId } = req.params;
  if (!jobId) {
    logger.error(
      `[JOB_CONTROLLER] :: Could not find jobId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  const jobData = req.body;

  try {
    this.jobCrudService.validateUpdateJobData(jobData);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[JOB_CONTROLLER] :: The value of data is not correct {userId : ${userId}, error: ${JSON.stringify(
        error,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: error.message,
    });
  }

  const inputs = cloneDeep(jobData);
  inputs.projectId = projectId;
  inputs.jobId = jobId;
  inputs.userId = userId;

  logger.info(
    `[JOB_CONTROLLER] :: START :: Update job by id {userId : ${userId}}`,
  );

  try {
    const job = await self.jobCrudService.updateJobById(inputs);

    logger.info(
      `[JOB_CONTROLLER] :: SUCCESS :: Update job by id {userId : ${userId}}`,
    );

    return res.status(200).send(job);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[JOB_CONTROLLER] :: ERROR :: Update job by id {userId : ${userId}, error : ${JSON.stringify(
        error,
      )}}`,
    );
    return res.status(500).send({
      err: error.message,
      desc: 'Could Not Update JOB',
    });
  }
}

async function getJobErrors(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const download = req.query.download || false;

  const { jobId } = req.params;
  if (!jobId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  // const pageNo = req.query.pageNo || 0;
  // const pageSize = req.query.pageSize || 10;
  // const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  // inputs.limit = page.limit;
  // inputs.offset = page.offset;
  inputs.projectId = projectId;
  inputs.jobId = jobId;

  logger.info(
    `[JOB_CONTROLLER] :: START :: Fetch all errors of a job {userId : ${userId}}`,
  );

  try {
    if (download) {
      const signedUrl = await self.jobCrudService.downloadJobError(jobId);
      return res.status(200).send({
        signedUrl,
      });
    }
    const jobErrors = await self.jobCrudService.getJobErrors(inputs);

    logger.info(
      `[JOB_CONTROLLER] :: SUCCESS :: Fetch all errors of a job {userId : ${userId}}`,
    );

    return res.status(200).send(jobErrors);
  } catch (err) {
    logger.error(
      `[JOB_CONTROLLER] :: ERROR :: Fetch all errors of a job {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get JOBs Errors',
    });
  }
}

async function getSignedURL(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }
  const { projectId, jobId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!jobId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  try {
    logger.info(
      `[JOB_CONTROLLER] :: START :: Generate Signed URL For JOB: ${jobId} , { userId : ${userId}, projectId: ${projectId}}`,
    );

    const url = await this.jobCrudService.generateSignedURL(jobId, projectId);

    logger.info(
      `[JOB_CONTROLLER] :: SUCCESS :: Generated Signed URL URL: ${JSON.stringify(
        url,
      )} For JOB: ${jobId} , { userId : ${userId}, projectId: ${projectId}}`,
    );

    return res.status(200).send({
      url,
    });
  } catch (error) {
    logger.error(
      `[JOB_CONTROLLER] : ERROR : Could Not Generate Signed URL, error : ${error.message}, { userId : ${userId}, projectId: ${projectId}}`,
    );

    return res.status(500).send({
      error: error.message,
      desc: 'Could Not Generate Signed URLs',
    });
  }
}

JobsController.prototype = {
  get,
  getJobById,
  put,
  getJobErrors,
  getSignedURL,
};

const jobsController = new JobsController();

module.exports = jobsController;
