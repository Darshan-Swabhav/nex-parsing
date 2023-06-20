const errors = require('throw.js');
const _ = require('lodash');

const { serializeError } = require('serialize-error');

const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');
const { sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const {
  GENERALIZED_FILTERS_OPERATOR,
  GENERALIZED_FILTERS_TYPE,
} = require('../../../../../constant');
const ContactService = require('../../../../../services/projects/masterImport/contacts/contactsService');

const errorMessages = require('../../../../../config/error.config.json');
const PaginationService = require('../../../../../services/helpers/paginationService');

/**
 *@openapi
 * definitions:
 *   tempMasterContacts:
 *     properties:
 *       name:
 *        type: string
 *       accountName:
 *        type: string
 *       email:
 *        type: string
 *       emailStatus:
 *        type: string
 *       jobTitle:
 *        type: string
 *       jobLevel:
 *        type: string
 *       linkedInUrl:
 *        type: string
 *       otherSourceLink:
 *        type: string
 *   contacts:
 *     properties:
 *       id:
 *        type: string
 *       researchStatus:
 *        type: string
 *       callingStatus:
 *        type: string
 *       complianceStatus:
 *        type: string
 *       prefix:
 *        type: string
 *       firstName:
 *        type: string
 *       middleName:
 *        type: string
 *       lastName:
 *        type: string
 *       address:
 *        type: object
 *       email:
 *        type: string
 *       genericEmail:
 *        type: string
 *       phone:
 *        type: string
 *       directPhone:
 *        type: string
 *       jobTitle:
 *        type: string
 *       jobLevel:
 *        type: string
 *       jobDepartment:
 *        type: string
 *       linkedInUrl:
 *        type: string
 *       stage:
 *        type: string
 *       AccountId:
 *        type: string
 *       website:
 *        type: string
 *       comments:
 *        type: string
 *       source:
 *        type: string
 *       nsId:
 *        type: object
 *       zoomInfoContactId:
 *        type: string
 *       screenshot:
 *        type: string
 *       functions:
 *        type: string
 *       disposition:
 *        type: string
 *       zb:
 *        type: string
 *       gmailStatus:
 *        type: string
 *       mailTesterStatus:
 *        type: string
 *       handles:
 *        type: string
 *       updatedAt:
 *        type: string
 *       createdBy:
 *        type: string
 *       createdAt:
 *        type: string
 *       updatedBy:
 *        type: string
 *       custom1:
 *        type: string
 *       custom2:
 *        type: string
 *       custom3:
 *        type: string
 *       custom4:
 *        type: string
 *       custom5:
 *        type: string
 *       custom6:
 *        type: string
 *       custom7:
 *        type: string
 *       custom8:
 *        type: string
 *       custom9:
 *        type: string
 *       custom10:
 *        type: string
 *       custom11:
 *        type: string
 *       custom12:
 *        type: string
 *       custom13:
 *        type: string
 *       custom14:
 *        type: string
 *       custom15:
 *        type: string
 *
 * /project/{project_id}/masterImport/contact:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: masterImportContact
 *     tags:
 *       - MasterContacts
 *     description: Import Contact from Master
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: body
 *       name: masterImportBody
 *       schema:
 *         type: object
 *         required:
 *           - filter
 *           - limit
 *         properties:
 *           filter:
 *             type: object
 *           limit:
 *             type: string
 *           sort:
 *             type: object
 *           startImport:
 *             type: boolean
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the result message Saved Successfully
 *       '400':
 *         description: if Required Data is not passed in request body
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/masterContact:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getMasterContacts
 *     tags:
 *       - Master Contacts list
 *     description: gets the master contacts
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: query
 *       name: accountDomain
 *       type: string
 *       description: domain of account
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
 *         description: returns the contacts list of chosen filter field
 *         schema:
 *            $ref: '#/definitions/tempMasterContacts'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/masterContact/contacts/{contactId}:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: addTemporaryMasterContact
 *     tags:
 *       - Temporary Master Contact To GoldMine
 *     description: Add Temporary Master Contact To GoldMine
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: string
 *       description: project id
 *       required: true
 *     - in: path
 *       name: contactId
 *       type: string
 *       description: contactId of contact
 *       required: true
 *     - in: query
 *       name: flag
 *       type: string
 *       description: flag
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the inserted contact of GoldMine
 *         schema:
 *            $ref: '#/definitions/contact'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function ContactController() {
  this.contactService = new ContactService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
  this.paginationService = new PaginationService();
}

async function post(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { limit, accountId, accountDomain } = req.body;
  let { filter } = req.body;
  let sort = req.body.sort || { updatedAt: 'asc' };
  const startImport = req.body.startImport || false;

  const { projectId } = req.params;

  const sortableColumns = ['updatedAt'];
  const multipleSort = false;
  const MINIMUM_LIMIT = 1;
  const MAXIMUM_LIMIT = 500;

  const hasOnly = (obj, props) => {
    const objProps = Object.keys(obj);
    return (
      objProps.length === props.length &&
      props.every((p) => objProps.includes(p))
    );
  };

  const filterColumns = {
    jobTitle: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    jobLevel: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    jobDepartment: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    updatedAt: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.BETWEEN],
    },
    country: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
  };

  if (_.isEmpty(projectId) || !_.isString(projectId)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (
    startImport &&
    (_.isEmpty(accountId) || !_.isString(accountId)) &&
    (_.isEmpty(accountDomain) || !_.isString(accountDomain))
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountId and accountDomain is required',
    });
  }

  // validate filter is not empty
  if (!filter || _.isEmpty(filter)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Filter is required',
    });
  }

  // validate sort is not empty
  if (!sort || _.isEmpty(sort)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Sort is required',
    });
  }

  // limit validation>
  if (
    (!startImport && _.isEmpty(limit)) ||
    !(limit > MINIMUM_LIMIT - 1 && limit < MAXIMUM_LIMIT + 1)
  ) {
    const errMsg = 'Bad Limit,Limit out of range';
    logger.error(
      `[MASTER_IMPORT_CONTACT_CONTROLLER] :: The value of limit is not correct {userId : ${userId}, error: ${errMsg}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: errMsg,
    });
  }

  // parse filter(string to object)
  if (_.isString(filter)) {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[MASTER_IMPORT_CONTACT_CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The Filter type is invalid',
      });
    }
  }

  // parse filter(string to object)
  if (_.isString(sort)) {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[MASTER_IMPORT_CONTACT_CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The Sort value type is not an object',
      });
    }
  }

  // filter validation
  try {
    this.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_CONTACT_CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  if (startImport && !hasOnly(filter, ['jobLevel'])) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Bad Filter is applied',
    });
  }

  // sort validation
  try {
    this.sortHandler.validate(sortableColumns, sort, multipleSort);
  } catch (error) {
    const serializedSortValidateError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_CONTACT_CONTROLLER] :: The value of sort is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedSortValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedSortValidateError.message,
    });
  }

  try {
    let result;

    if (startImport) {
      result = await this.contactService.injectContactInDA({
        filter,
        projectId,
        userId,
        accountDomain,
        accountId,
      });
    } else {
      result = await this.contactService.saveContactIntegrationFilter({
        filter,
        sort,
        limit,
        projectId,
        userId,
      });
    }

    return res.status(200).send(result);
  } catch (error) {
    const serializedError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_CONTACT_CONTROLLER] :: ERROR :: Can Not Save the projectSetting  {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: 'Error can not save the Master Contact Filter',
      desc: serializedError.message,
    });
  }
}

async function get(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const { accountDomain } = req.query;
  const { projectId } = req.params;
  let { filter } = req.query;
  let sort = req.query.sort || { updatedAt: 'asc' };

  const filterColumns = {
    jobLevel: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
  };
  const sortableColumns = ['updatedAt'];
  const multipleSort = false;

  const pagination = this.paginationService.paginate(pageNo, pageSize);

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!accountDomain || _.isEmpty(accountDomain)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountDomain is required',
    });
  }

  if (!filter || _.isEmpty(filter)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Filter is required',
    });
  }

  if (!sort || _.isEmpty(sort)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Sort is required',
    });
  }

  if (_.isString(filter)) {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[MASTER_IMPORT_CONTACT_CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The Filter type is invalid',
      });
    }
  }

  if (_.isString(sort)) {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[MASTER_IMPORT_CONTACT_CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The Sort value type is not an object',
      });
    }
  }

  try {
    this.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_CONTACT_CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  try {
    this.sortHandler.validate(sortableColumns, sort, multipleSort);
  } catch (error) {
    const serializedSortValidateError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_CONTACT_CONTROLLER] :: The value of sort is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedSortValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedSortValidateError.message,
    });
  }

  const tableName = `${projectId.replaceAll('-', '_')}_master_contacts`;

  try {
    const result = await this.contactService.getContacts({
      tableName,
      accountDomain,
      filter,
      sort,
      pagination,
    });

    return res.status(200).send(result);
  } catch (error) {
    const serializedError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_CONTACT_CONTROLLER] :: ERROR :: Can Not get contacts from ${tableName}  {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: 'Error can not save the Master Contact Filter',
      desc: serializedError.message,
    });
  }
}

async function insertTemporaryMasterContactToGoldMine(
  settingsConfig,
  req,
  res,
  next,
) {
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId, contactId } = req.params;
  const { accountId, clientId, flag } = req.body;
  const flagsValue = ['added', 'removed', 'undo'];

  if (_.isEmpty(projectId) || !_.isString(projectId)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (_.isEmpty(contactId) || !_.isString(contactId)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'contactId is required',
    });
  }

  if (_.isEmpty(flag) || !_.isString(flag) || !flagsValue.includes(flag)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Flag value is either required or incorrect passed',
    });
  }

  if (_.isEmpty(accountId) || !_.isString(accountId)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountId is required',
    });
  }

  if (_.isEmpty(clientId) || !_.isString(clientId)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'clientId is required',
    });
  }

  const tableName = `${projectId.replaceAll('-', '_')}_master_contacts`;
  const transaction = await sequelize.transaction();
  const inputDTO = {
    projectId,
    accountId,
    clientId,
    userId,
  };

  try {
    const result =
      await this.contactService.insertTemporaryMasterContactToGoldMine({
        tableName,
        contactId,
        flag,
        inputDTO,
        transaction,
      });

    await transaction.commit();

    return res.status(200).send(result);
  } catch (error) {
    const serializedError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_CONTACT_CONTROLLER] :: ERROR :: Can Not Insert Temporary Master contact (tableName :: ${tableName}) to GoldMine {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    await transaction.rollback();

    return res.status(500).send({
      err: 'Error can not Insert Temporary Master Contact to GoldMine',
      desc: serializedError.message,
    });
  }
}

ContactController.prototype = {
  post,
  get,
  insertTemporaryMasterContactToGoldMine,
};

const contactController = new ContactController();

module.exports = contactController;
