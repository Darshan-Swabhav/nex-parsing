const { isBoolean, trim, isString } = require('lodash');
const errors = require('throw.js');
const { uuid } = require('uuidv4');
const { Transform } = require('stream');
const {
  USER_ROLES,
  JOB_STATUS,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');

const { serializeError } = require('serialize-error');
const FilterHandler = require('@nexsalesdev/master-data-model/lib/services/filterHandler');
const errorMessages = require('../../../../config/error.config.json');
const ContactCRUDService = require('../../../../services/master/contacts/contactsService');
const PaginationService = require('../../../../services/helpers/paginationService');

const { GENERALIZED_FILTERS_OPERATOR } = require('../../../../constant');

const MAX_FILE_SIZE = 100;

function ContactController() {
  this.contactCRUDService = new ContactCRUDService();
  this.paginationService = new PaginationService();
  this.filterHandler = new FilterHandler();
}

/**
 *@openapi
 * definitions:
 *   contact:
 *     properties:
 *       id :
 *        type : string
 *        format: uuid
 *       firstName:
 *        type: string
 *       lastName:
 *        type: string
 *       workEmail:
 *        type: string
 *       jobTitle:
 *        type: string
 *       jobLevel:
 *        type: string
 *       jobDepartment:
 *        type: string
 *       zbStatus:
 *        type: string
 *       disposition:
 *        type: string
 *       updatedAt:
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
 * /master/contacts:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getMasterContact
 *     tags:
 *       - MasterContacts
 *     description: This is contact list route which fetch data from Master DB
 *     parameters:
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
 *         description: returns the contacts list array
 *         schema:
 *            $ref: '#/definitions/contactListResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/contacts/{contactId}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getMasterContactById
 *     tags:
 *       - MasterContacts
 *     description: This is masterContact route returns the single object of master Contact
 *     parameters:
 *       - in: path
 *         name: contactId
 *         type: string
 *         description: Contact Id
 *         required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the contact
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 */

function getWriteStream(logger) {
  const writableStream = new Transform({
    transform: (chunk, encoding, callback) => {
      callback(null, chunk);
    },
    flush: (callback) => {
      callback();
    },
  }).on('error', (error) => {
    const serializedFilterError = serializeError(error);
    logger.error(
      `[MASTER_CONTACT_CONTROLLER] :: Could not Create a Write Stream {Error: ${JSON.stringify(
        serializedFilterError,
      )}}`,
    );
    throw error;
  });

  return writableStream;
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;
  // need to recheck filterColumns
  // updatedAt
  const filterColumns = {
    locationCountry: {
      type: 'string',
      operator: [
        GENERALIZED_FILTERS_OPERATOR.EQUAL,
        GENERALIZED_FILTERS_OPERATOR.ISNULL,
      ],
    },
    disposition: {
      type: 'string',
      operator: [
        GENERALIZED_FILTERS_OPERATOR.EQUAL,
        GENERALIZED_FILTERS_OPERATOR.ISNULL,
      ],
    },
    domainStatus: {
      type: 'array',
      operator: [
        GENERALIZED_FILTERS_OPERATOR.EQUAL,
        GENERALIZED_FILTERS_OPERATOR.ISNULL,
      ],
    },
    // GENERALIZED_FILTERS_OPERATOR.ISNULL,
    emailTags: {
      type: 'string',
      operator: [
        GENERALIZED_FILTERS_OPERATOR.EQUAL,
        GENERALIZED_FILTERS_OPERATOR.ISNULL,
      ],
    },
    // GENERALIZED_FILTERS_OPERATOR.ISNULL,
    emailOpen: {
      type: 'string',
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    emailClick: {
      type: 'string',
      operator: [
        GENERALIZED_FILTERS_OPERATOR.EQUAL,
        GENERALIZED_FILTERS_OPERATOR.ISNULL,
      ],
    },
    name: {
      type: 'array',
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    workEmail: {
      type: 'string',
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    jobTitle: {
      type: 'array',
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    jobLevel: {
      type: 'array',
      operator: [
        GENERALIZED_FILTERS_OPERATOR.EQUAL,
        GENERALIZED_FILTERS_OPERATOR.ISNULL,
      ],
    },
    jobDepartment: {
      type: 'array',
      operator: [
        GENERALIZED_FILTERS_OPERATOR.EQUAL,
        GENERALIZED_FILTERS_OPERATOR.ISNULL,
      ],
    },
    zbStatus: {
      type: 'array',
      operator: [
        GENERALIZED_FILTERS_OPERATOR.EQUAL,
        GENERALIZED_FILTERS_OPERATOR.ISNULL,
      ],
    },
    updatedAt: {
      type: 'array',
      operator: [GENERALIZED_FILTERS_OPERATOR.BETWEEN],
    },
    AccountDomain: {
      type: 'string',
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
  };

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  // manager role check
  if (roles.indexOf(USER_ROLES.MANAGER) < 0) {
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  }

  let isAsyncDownload = req.query.async || false;
  const download = req.query.download || false;
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.userEmail = userEmail;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  let filter = req.query.filter || '{}';

  // filter parse to object
  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[MASTER_CONTACT_CONTROLLER] :: Could not parse filter in Json format {userEmail : ${userEmail}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  // validate filter
  try {
    self.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[MASTER_CONTACT_CONTROLLER] :: The value of filter is not correct {userEmail : ${userEmail}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  logger.info(
    `[MASTER_CONTACT_CONTROLLER] :: START :: Fetch all Contact for Master {userEmail : ${userEmail}}`,
  );

  const downloadInputs = {};
  try {
    if (download) {
      downloadInputs.fileId = uuid();
      downloadInputs.jobId = uuid();
      downloadInputs.userEmail = userEmail;
      logger.info(
        `[MASTER_CONTACT_CONTROLLER] :: ContactDownload Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );

      isAsyncDownload = isAsyncDownload
        ? true
        : await self.contactCRUDService.getFileIsLarger(filter, MAX_FILE_SIZE);

      if (isAsyncDownload) {
        logger.info(
          '[MASTER_CONTACT_CONTROLLER] :: Async ContactDownload Job Creation Started',
        );
        const result = await self.contactCRUDService.downloadAllContact(
          downloadInputs,
          filter,
          null,
          isAsyncDownload,
        );
        logger.info(
          `[MASTER_CONTACT_CONTROLLER] :: Async ContactDownload Job Creation Success, ${JSON.stringify(
            result,
          )}`,
        );
        return res.status(200).send('Job Submitted Successfully');
      }
      const writableStream = getWriteStream(logger);

      writableStream.on('finish', async () => {
        logger.info('[MASTER_CONTACT_CONTROLLER] :: writableStream FINISH');
        await self.contactCRUDService.updateJobStatus(
          downloadInputs.jobId,
          JOB_STATUS.COMPLETED,
        );
        writableStream.destroy();
      });
      writableStream.on('close', () => {
        logger.info('[MASTER_CONTACT_CONTROLLER] :: WritableStream Closed');
      });

      res.setHeader('Content-type', 'application/csv');
      writableStream.pipe(res);
      return self.contactCRUDService.downloadAllContact(
        downloadInputs,
        filter,
        writableStream,
        isAsyncDownload,
      );
    }
  } catch (error) {
    const serializedDownloadError = serializeError(error);
    logger.error(
      `[MASTER_CONTACT_CONTROLLER] :: ERROR :: Could Not Download Account {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedDownloadError,
      )}}`,
    );
    await self.contactCRUDService.updateJobStatus(
      downloadInputs.jobId,
      JOB_STATUS.FAILED,
    );

    return res.status(500).send({
      error: serializedDownloadError.message,
      desc: 'Could Not Download Account',
    });
  }

  try {
    const contactList = await self.contactCRUDService.getAllContact(
      inputs,
      filter,
    );

    logger.info(
      `[MASTER_CONTACT_CONTROLLER] :: SUCCESS :: Fetch all Contact for Master {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(contactList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER_CONTACT_CONTROLLER] :: ERROR :: Fetch all Contact for Master {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Master Contacts',
    });
  }
}

async function getContactById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;
  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { contactId } = req.params;
  let { convertInToGmFormate = false } = req.query;

  if (!contactId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'contactId is required',
    });
  }

  if (isString(convertInToGmFormate)) {
    convertInToGmFormate = trim(convertInToGmFormate).toLowerCase();
    if (convertInToGmFormate === 'true' || convertInToGmFormate === 'false') {
      convertInToGmFormate = JSON.parse(convertInToGmFormate);
    }
  }

  if (convertInToGmFormate && !isBoolean(convertInToGmFormate)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'convertInToGmFormate is not a Boolean',
    });
  }

  const inputs = {};
  inputs.contactId = contactId;
  inputs.convertInToGmFormate = convertInToGmFormate;

  logger.info(
    `[MASTER_CONTACT_CONTROLLER] :: START :: Fetch Master Contact by Id {userEmail : ${userEmail}, contactId : ${contactId}}`,
  );

  try {
    const contact = await self.contactCRUDService.getContact(inputs);

    logger.info(
      `[MASTER_CONTACT_CONTROLLER] :: SUCCESS :: Fetch Master Contact by Id {userEmail : ${userEmail}, contactId : ${contactId}}`,
    );

    return res.status(200).send(contact);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER_CONTACT_CONTROLLER] :: ERROR :: Fetch Master Contact by Id {userEmail : ${userEmail}, contactId : ${contactId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Get Master Contact',
    });
  }
}

ContactController.prototype = {
  get,
  getContactById,
};

const contactController = new ContactController();

module.exports = contactController;
