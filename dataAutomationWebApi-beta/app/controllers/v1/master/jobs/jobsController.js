/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const { isEmpty } = require('lodash');
const {
  USER_ROLES,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');
/**
 *
 * @openapi
 *
 * definitions:
 *   masterJob:
 *     properties:
 *       fileName:
 *        type: string
 *       jobName:
 *        type: string
 *       fileType:
 *        type: string
 *       jobId:
 *        type: string
 *       status:
 *        type: string
 *       totalProcessed:
 *        type: string
 *       imported:
 *        type: string
 *       failed:
 *        type: string
 *       createdAt:
 *        type: string
 *       updatedAt:
 *        type: string
 *
 *   masterJobSignedURL:
 *     properties:
 *       url:
 *        type: string
 *
 *   masterJobErrors:
 *     properties:
 *       id:
 *        type: string
 *       errorDesc:
 *        type: string
 *       rowContent:
 *        type: object
 *       errorCount:
 *        type: integer
 *       type:
 *        type: string
 *       rowIndex:
 *        type: integer
 *       chunkIndex:
 *        type: integer
 *       createdAt:
 *        type: string
 *       updatedAt:
 *        type: string
 *       jobId:
 *        type: string
 *
 *   masterJobListResponse:
 *     properties:
 *       totalCount:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *         description: total number of jobs
 *       docs:
 *         type: array
 *         items:
 *           $ref: '#/definitions/masterJob'
 *
 * /master/jobs:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getMasterJobs
 *     tags:
 *       - MasterJob
 *     description: This is job list route which fetch the all the job from master
 *     parameters:
 *     - in: query
 *       name: pageNo
 *       type: integer
 *       description: page number
 *     - in: query
 *       name: pageSize
 *       type: integer
 *       description: page sizes
 *     - in: query
 *       name: sort
 *       type: string
 *       description: Create an object of the column on which the sort is to be applied and send it by stringify
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the job list with total jobs count
 *         schema:
 *             $ref: '#/definitions/masterJobListResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '401':
 *         description: if user authentication fails then send error
 *       '403':
 *         description: if user is unauthorized then send error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/jobs/{jobId}/getSignedURL:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getMasterJobSignedURL
 *     tags:
 *       - Generate Signed URL
 *     description: it will generate the signed url for the given job's output file.
 *     parameters:
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
 *            $ref: '#/definitions/masterJobSignedURL'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '401':
 *         description: if user authentication fails then send error
 *       '403':
 *         description: if user is unauthorized then send error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/jobs/{jobId}/jobErrors:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getMasterJobErrors
 *     tags:
 *       - MasterJobErrors
 *     description: This is job errors list route which fetch the all the job errors from the master
 *     parameters:
 *     - in: path
 *       name: jobId
 *       type: integer
 *       description: job id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the job errors from the master
 *         schema:
 *            type: array
 *            items:
 *              $ref: '#/definitions/masterJobErrors'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '401':
 *         description: if user authentication fails then send error
 *       '403':
 *         description: if user is unauthorized then send error
 *       '500':
 *         description: if something fails internally then send error
 */

function JobsController() {
  const JobCRUDService = require('../../../../services/master/jobs/jobsService');
  const PaginationService = require('../../../../services/helpers/paginationService');
  const SortHandler = require('@nexsalesdev/master-data-model/lib/services/sortHandler');
  const FileStreamService = require('../../../../services/stream/fileStreamService');

  this.jobCrudService = new JobCRUDService();
  this.paginationService = new PaginationService();
  this.sortHandler = new SortHandler();
  this.fileStreamService = new FileStreamService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[MASTER-JOB-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const jobType = req.query.jobType || [];
  const getDataCount = req.query.getDataCount || false;

  if (!jobType || !Array.isArray(jobType) || !jobType.length) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobType value is Incorrect',
    });
  }

  const inputs = {};
  inputs.limit = page.limit;
  inputs.offset = page.offset;
  inputs.jobType = jobType;
  inputs.userEmail = userEmail;
  inputs.userRoles = roles;
  inputs.getDataCount = getDataCount;
  let sort = req.query.sort || {};

  if (isEmpty(sort)) {
    sort = {
      createdAt: 'desc',
    };
  }

  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[MASTER-JOB-CONTROLLER] :: Could not parse sort in Json format {userEmail : ${userEmail}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The sort value type is not an object',
      });
    }
  }

  const sortableColumns = ['createdAt'];
  const multipleSort = false;
  try {
    self.sortHandler.validate(sortableColumns, sort, multipleSort);
  } catch (error) {
    const serializedSortValidateError = serializeError(error);
    logger.error(
      `[MASTER-JOB-CONTROLLER] :: The value of sort is not correct {userEmail : ${userEmail}, error: ${JSON.stringify(
        serializedSortValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedSortValidateError.message,
    });
  }

  logger.info(
    `[MASTER-JOB-CONTROLLER] :: START :: Fetch all master jobs {userEmail : ${userEmail}}`,
  );

  try {
    const jobList = await self.jobCrudService.getAllMasterJobs(inputs, sort);

    logger.info(
      `[MASTER-JOB-CONTROLLER] :: SUCCESS :: Fetch all master jobs {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(jobList);
  } catch (err) {
    const jobsListError = serializeError(err);
    logger.error(
      `[MASTER-JOB-CONTROLLER] :: ERROR :: Fetch all master jobs {userEmail : ${userEmail}, error: ${JSON.stringify(
        jobsListError,
      )}}`,
    );

    return res.status(500).send({
      err: jobsListError.message,
      desc: 'Could Not Get Master JOBs',
    });
  }
}

async function getSignedURL(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[MASTER-JOB-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  const inputs = {};
  inputs.userEmail = userEmail;
  inputs.jobId = jobId;

  logger.info(
    `[MASTER-JOB-CONTROLLER] :: START :: Generate Signed URL For master job {userEmail : ${userEmail}, jobId: ${jobId}}`,
  );

  try {
    const url = await self.jobCrudService.generateSignedURL(inputs);

    logger.info(
      `[MASTER-JOB-CONTROLLER] :: SUCCESS :: Generate Signed URL For master job {userEmail : ${userEmail}, jobId: ${jobId}}`,
    );

    return res.status(200).send({
      url,
    });
  } catch (err) {
    const generateSignedURLError = serializeError(err);
    logger.error(
      `[MASTER-JOB-CONTROLLER] :: ERROR :: Generate Signed URL For master job {userEmail : ${userEmail}, jobId: ${jobId}, error: ${JSON.stringify(
        generateSignedURLError,
      )}}`,
    );

    return res.status(500).send({
      err: generateSignedURLError.message,
      desc: 'Could Not Generate Signed URLs for Master Job',
    });
  }
}

async function getJobErrors(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[MASTER-JOB-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  const download = req.query.download || false;

  const inputs = {};
  inputs.userEmail = userEmail;
  inputs.jobId = jobId;

  logger.info(
    `[MASTER-JOB-CONTROLLER] :: START :: Fetch all errors of a master job {userEmail : ${userEmail}, jobId: ${jobId}}`,
  );

  try {
    if (download) {
      const signedUrl = await self.jobCrudService.downloadJobErrorsMaster(
        jobId,
      );
      return res.status(200).send({
        signedUrl,
      });
    }
    const jobErrors = await self.jobCrudService.getMasterJobErrors(inputs);

    logger.info(
      `[MASTER-JOB-CONTROLLER] :: SUCCESS :: Fetch all errors of a master job {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(jobErrors);
  } catch (err) {
    const masterJobErrorsError = serializeError(err);
    logger.error(
      `[MASTER-JOB-CONTROLLER] :: ERROR :: Fetch all errors of a master job {userEmail : ${userEmail}, jobId: ${jobId}, error: ${JSON.stringify(
        masterJobErrorsError,
      )}}`,
    );

    return res.status(500).send({
      err: masterJobErrorsError.message,
      desc: 'Could Not Get JOBs Errors For Master Job',
    });
  }
}

JobsController.prototype = {
  get,
  getSignedURL,
  getJobErrors,
};

const jobsController = new JobsController();

module.exports = jobsController;
