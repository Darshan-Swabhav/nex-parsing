/* eslint-disable global-require */
const _ = require('lodash');
const errors = require('throw.js');
const { uuid } = require('uuidv4');
const { Transform } = require('stream');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');

const errorMessages = require('../../../../config/error.config.json');

const MAX_FILE_SIZE = 100;
const JOB_STATUS = {
  QUEUED: 'Queued',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

/**
 *
 *@openapi
 * definitions:
 *   contactCheckResponse:
 *     properties:
 *       isSuppressed:
 *        type: boolean
 *       suppressedWith:
 *        type: object
 *       suppressionMatchCase:
 *        type: string
 *       isDuplicate:
 *        type: boolean
 *       duplicateMatchCase:
 *        type: string
 *       duplicateWith:
 *        type: object
 *
 *   contactsStats:
 *     properties:
 *       researchStatus:
 *         type: object
 *         $ref: '#/definitions/contactResearchStatus'
 *       stage:
 *         type: object
 *         $ref: '#/definitions/contactStage'
 *
 *   contactResearchStatus:
 *     properties:
 *        data:
 *           type: array
 *           items:
 *              $ref: '#/definitions/contactResearchStatusData'
 *        totalCount:
 *           type: integer
 *
 *   contactStage:
 *     properties:
 *        data:
 *           type: array
 *           items:
 *              $ref: '#/definitions/contactStageData'
 *        totalCount:
 *           type: integer
 *
 *   contactResearchStatusData:
 *     properties:
 *       researchStatus:
 *        type: string
 *       count:
 *        type: integer
 *
 *   contactStageData:
 *     properties:
 *       stage:
 *        type: string
 *       count:
 *        type: integer
 *
 *   contact:
 *     properties:
 *       jobTitle:
 *        type: string
 *       disposition:
 *        type: string
 *       researchStatus:
 *        type: string
 *       stage:
 *        type: string
 *       complianceStatus:
 *        type: string
 *       companyName:
 *        type: string
 *       contactFullName:
 *        type: string
 *       updatedAt:
 *        type: string
 *       contactLabel:
 *        type: string
 *       domain:
 *        type: string
 *       accountLabel:
 *        type: string
 *       updatedBy:
 *        type: string
 *
 *   contactListResponse:
 *     properties:
 *       totalCount:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *         description: total number of contacts
 *       docs:
 *         type: array
 *         items:
 *           $ref: '#/definitions/contact'
 *
 *   contactFacetResponse:
 *     properties:
 *       disposition:
 *        type: array
 *       updatedBy:
 *        type: array
 *
 * /project/{projectId}/contacts:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getContact
 *     tags:
 *       - Contacts
 *     description: This is contact list route which fetch the contact list of the project
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
 *     - in: query
 *       name: download
 *       type: boolean
 *       description: for download file
 *     - in: query
 *       name: filter
 *       type: string
 *       description: Create an object of the column on which the filter is to be applied and send it by stringify
 *     - in: query
 *       name: sort
 *       type: string
 *       description: Create an object of the column on which the sort is to be applied and send it by stringify
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the contacts list array for that given list
 *         schema:
 *            $ref: '#/definitions/contactListResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /projects/{projectId}/contacts/stats:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getContactsStats
 *     tags:
 *       - Contacts Stats
 *     description: This is contact stats list route which fetch the distinct stats for that user
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: query
 *       name: filter
 *       type: string
 *       description: Create an object of the column on which the filter is to be applied and send it by stringify
 *     - in: query
 *       name: sort
 *       type: string
 *       description: Create an object of the column on which the sort is to be applied and send it by stringify
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the contacts stats for that given list
 *         schema:
 *            $ref: '#/definitions/contactsStats'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /projects/{project_id}/contacts/check:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: checkContactSuppression
 *     tags:
 *       - Contact Suppression Check
 *     description: Check if Contact is in Suppression Set or Not
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: query
 *       name: checkSuppression
 *       type: boolean
 *       description: flag for check suppression
 *     - in: query
 *       name: checkDuplicate
 *       type: boolean
 *       description: flag for check duplicate
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the result in json format with true false for suppression
 *         schema:
 *            items:
 *              $ref: '#/definitions/contactCheckResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/contacts/facets:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getContactUniqueFields
 *     tags:
 *       - Contacts Unique Facet fields
 *     description: This is contact facet route which fetch the unique value for given field
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the unique list of chosen contacts field
 *         schema:
 *            $ref: '#/definitions/contactFacetResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function ContactsController() {
  const ContactCRUDService = require('../../../../services/projects/contacts/contactsService');
  const PaginationService = require('../../../../services/helpers/paginationService');
  const FileStreamService = require('../../../../services/stream/fileStreamService');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  this.contactCrudService = new ContactCRUDService();
  this.paginationService = new PaginationService();
  this.requiredPermissions = ['read:user', 'write:user'];
  this.fileStreamService = new FileStreamService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

function getWriteStream() {
  const writableStream = new Transform({
    transform: (chunk, encoding, callback) => {
      callback(null, chunk);
    },
    flush: (callback) => {
      callback();
    },
  }).on('error', (error) => {
    console.log(`Could not Create a Write Stream {Error: ${error}}`);
    throw error;
  });

  return writableStream;
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (roles.indexOf(USER_ROLES.MANAGER) < 0) {
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  }

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  let isAsyncDownload = req.query.async || false;
  const download = req.query.download || false;
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.projectId = projectId;
  inputs.userId = userId;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  let filter = req.query.filter || '{}';
  let sort = req.query.sort || '{}';

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[CONTACT-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      const serializedSortError = serializeError(error);
      logger.error(
        `[CONTACT-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedSortError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The sort value type is not an object',
      });
    }
  }

  const filterColumns = {
    companyName: { type: 'string', operator: ['=', 'isNull'] },
    domain: { type: 'string', operator: ['=', 'isNull'] },
    accountLabel: { type: 'string', operator: ['='] },
    contactLabel: { type: 'string', operator: ['='] },
    stage: { type: 'string', operator: ['='] },
    researchStatus: { type: 'array', operator: ['='] },
    updatedBy: { type: 'array', operator: ['=', 'isNull'] },
    updatedAt: { type: 'array', operator: ['between'] },
  };
  try {
    self.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[CONTACT-CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  const sortableColumns = ['companyName', 'domain'];
  const multipleSort = true;
  try {
    self.sortHandler.validate(sortableColumns, sort, multipleSort);
  } catch (error) {
    const serializedSortValidateError = serializeError(error);
    logger.error(
      `[CONTACT-CONTROLLER] :: The value of sort is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedSortValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedSortValidateError.message,
    });
  }

  logger.info(
    `[CONTACT-CONTROLLER] :: START :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  const downloadInputs = {};
  try {
    if (download) {
      downloadInputs.fileId = uuid();
      downloadInputs.jobId = uuid();
      downloadInputs.projectId = projectId;
      downloadInputs.userId = userId;
      logger.info(
        `[CONTACT-CONTROLLER] :: ContactDownload Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );

      isAsyncDownload = isAsyncDownload
        ? true
        : await self.contactCrudService.getFileIsLarger(
            projectId,
            filter,
            MAX_FILE_SIZE,
          );

      if (isAsyncDownload) {
        logger.info(
          '[CONTACT-CONTROLLER] :: Async ContactDownload Job Creation Started',
        );
        const result = await self.contactCrudService.downloadAllContact(
          downloadInputs,
          filter,
          null,
          isAsyncDownload,
        );
        logger.info(
          `[CONTACT-CONTROLLER] :: Async ContactDownload Job Creation Success, ${JSON.stringify(
            result,
          )}`,
        );
        return res.status(200).send('Job Submitted Successfully');
      }
      const writableStream = getWriteStream();

      writableStream.on('finish', async () => {
        console.log('writableStream FINISH');
        await self.contactCrudService.updateJobStatus(
          downloadInputs.jobId,
          JOB_STATUS.COMPLETED,
        );
        writableStream.destroy();
      });
      writableStream.on('close', () => {
        console.log('WritableStream Closed');
      });

      res.setHeader('Content-type', 'application/csv');
      writableStream.pipe(res);
      return self.contactCrudService.downloadAllContact(
        downloadInputs,
        filter,
        writableStream,
        isAsyncDownload,
      );
    }
  } catch (error) {
    const serializedDownloadError = serializeError(error);
    logger.error(
      `[CONTACT-CONTROLLER] :: ERROR :: Could Not Download Contact {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedDownloadError,
      )}}`,
    );
    await self.contactCrudService.updateJobStatus(
      downloadInputs.jobId,
      JOB_STATUS.FAILED,
    );

    return res.status(500).send({
      error: serializedDownloadError.message,
      desc: 'Could Not Download Contact',
    });
  }
  try {
    const contactList = await self.contactCrudService.getAllContact(
      inputs,
      filter,
      sort,
    );

    logger.info(
      `[CONTACT-CONTROLLER] :: SUCCESS :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(contactList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[CONTACT-CONTROLLER] :: ERROR :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Contacts',
    });
  }
}

async function getAllContactStats(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[CONTACT-CONTROLLER] :: This user does not have access to the route {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;

  let filter = req.query.filter || '{}';

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[CONTACT-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  const filterColumns = {
    companyName: { type: 'string', operator: ['=', 'isNull'] },
    domain: { type: 'string', operator: ['=', 'isNull'] },
    accountLabel: { type: 'string', operator: ['='] },
    contactLabel: { type: 'string', operator: ['='] },
    stage: { type: 'string', operator: ['='] },
    researchStatus: { type: 'array', operator: ['='] },
    updatedBy: { type: 'array', operator: ['=', 'isNull'] },
    updatedAt: { type: 'array', operator: ['between'] },
  };
  try {
    self.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[CONTACT-CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  logger.info(
    `[CONTACT-CONTROLLER] :: START :: Fetch all Contact Stats of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const contactStats = await self.contactCrudService.getAllContactStats(
      inputs,
      filter,
    );

    logger.info(
      `[CONTACT-CONTROLLER] :: SUCCESS :: Fetch all Contact Stats of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(contactStats);
  } catch (err) {
    const serializedError = serializeError(err);

    logger.error(
      `[CONTACT-CONTROLLER] :: ERROR :: Fetch all Contact Stats of Project { userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Contacts Stats',
    });
  }
}

async function checkContactSuppressionOrDuplicate(
  settingsConfig,
  req,
  res,
  next,
) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const { contact } = req.body;

  const checkSuppression = req.query.checkSuppression || false;
  const checkDuplicate = req.query.checkDuplicate || false;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is Required',
    });
  }

  if (_.isEmpty(contact)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Expected Contact Details in Request Body',
    });
  }

  contact.ProjectId = projectId;

  logger.info(
    `[CONTACT-CONTROLLER] :: START :: Check Contact Suppression/Duplicate { userId : ${userId}, projectId : ${projectId}, contact: ${JSON.stringify(
      contact,
    )}}`,
  );

  try {
    const inputs = {
      checkSuppression,
      checkDuplicate,
    };
    const contactCheckResult =
      await self.contactCrudService.checkContactSuppressionAndDuplicate(
        contact,
        inputs,
      );

    logger.info(
      `[CONTACT-CONTROLLER] :: SUCCESS :: Check Contact Suppression/Duplicate { userId : ${userId}, projectId : ${projectId}, Result: ${contactCheckResult} }`,
    );

    return res.status(200).send(contactCheckResult);
  } catch (err) {
    const serializedError = serializeError(err);

    logger.error(
      `[CONTACT-CONTROLLER] :: ERROR :: Check Contact Suppression/Duplicate { userId : ${userId}, projectId : ${projectId}, contact: ${JSON.stringify(
        contact,
      )}, error: ${JSON.stringify(serializedError)}}`,
    );
    if (
      err.code === 'DEDUPE_CHECK_ERROR' ||
      err.code === 'SUPPRESSION_CHECK_ERROR'
    ) {
      return res.status(500).send({
        err: err.code,
        desc: err.desc,
      });
    }
    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Check Suppression',
    });
  }
}

async function getContactUniqueFields(settingsConfig, req, res, next) {
  const self = this;
  const { logger } = settingsConfig;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const { field } = req.query;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!field) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'field is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  let result;
  try {
    switch (field) {
      case 'updatedBy':
        result = await self.contactCrudService.getContactUpdatedBy(inputs);
        logger.info(
          `[CONTACT-CONTROLLER] :: SUCCESS :: Fetch all Contact Users for Project {userId : ${userId}, projectId : ${projectId}}`,
        );
        break;
      case 'disposition':
        result = await self.contactCrudService.getContactDispositions(inputs);
        logger.info(
          `[CONTACT-CONTROLLER] :: SUCCESS :: Fetch all Contact Disposition for Project {userId : ${userId}, projectId : ${projectId}}`,
        );
        break;
      default:
        break;
    }
    return res.status(200).send(result);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[CONTACT-CONTROLLER] :: ERROR :: Fetch all Contact Facets for Project {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Contacts Facets',
    });
  }
}

ContactsController.prototype = {
  get,
  getAllContactStats,
  checkContactSuppressionOrDuplicate,
  getContactUniqueFields,
};

const contactsController = new ContactsController();

module.exports = contactsController;
