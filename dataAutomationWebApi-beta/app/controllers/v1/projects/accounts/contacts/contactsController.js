/* eslint-disable global-require */
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const errorMessages = require('../../../../../config/error.config.json');
/**
 *
 *@openapi
 * definitions:
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
 *   contactsPost:
 *     properties:
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
 *
 * /projects/{project_id}/accounts/{account_id}/contacts:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getContactOfAccount
 *     tags:
 *       - Contacts
 *     description: This is contact list route which fetch the project list for that user
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: project id
 *       required: true
 *     - in: path
 *       name: account_id
 *       type: string
 *       description: account id
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
 *         description: returns the contacts list array for that given list
 *         schema:
 *            $ref: '#/definitions/contacts'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: createContactOfAccount
 *     tags:
 *       - Contacts
 *     description: This is contact list route which fetch the project list for that user
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: project id
 *       required: true
 *     - in: path
 *       name: account_id
 *       type: string
 *       description: account id
 *       required: true
 *     - in: body
 *       name: body
 *       schema:
 *          $ref: '#/definitions/contactsPost'
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the contacts list array for that given list
 *         schema:
 *            $ref: '#/definitions/contacts'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 * /projects/{project_id}/accounts/{account_id}/contacts/{contact_id}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getContactById
 *     tags:
 *       - Contacts
 *     description: This is contact list route which fetch the project list for that user
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: project id
 *       required: true
 *     - in: path
 *       name: account_id
 *       type: string
 *       description: account id
 *       required: true
 *     - in: path
 *       name: contact_id
 *       type: string
 *       description: contact id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the contacts list array for that given list
 *         schema:
 *            $ref: '#/definitions/contacts'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: editContactById
 *     tags:
 *       - Contacts
 *     description: This is contact list route which fetch the project list for that user
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: project id
 *       required: true
 *     - in: path
 *       name: account_id
 *       type: string
 *       description: account id
 *       required: true
 *     - in: path
 *       name: contact_id
 *       type: string
 *       description: contact id
 *       required: true
 *     - in: body
 *       name: body
 *       schema:
 *          $ref: '#/definitions/contactsPost'
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the contacts list array for that given list
 *         schema:
 *            $ref: '#/definitions/contacts'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function ContactsController() {
  const ContactCRUDService = require('../../../../../services/projects/contacts/contactsService');
  const PaginationService = require('../../../../../services/helpers/paginationService');
  const FileStreamService = require('../../../../../services/stream/fileStreamService');

  this.contactCrudService = new ContactCRUDService();
  this.paginationService = new PaginationService();
  this.requiredPermissions = ['read:user', 'write:user'];
  this.fileStreamService = new FileStreamService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const { logger } = settingsConfig;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const { accountId } = req.params;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }
  if (!accountId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountId is required',
    });
  }

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  let filter = {};
  let sort = {};
  inputs.projectId = projectId;
  inputs.accountId = accountId;
  filter = req.query.filter || {};
  sort = req.query.sort || { updatedAt: 'desc' };
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      logger.error(
        `[CONTACT-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}}`,
      );
    }
  }
  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      logger.error(
        `[CONTACT-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}}`,
      );
    }
  }

  logger.info(
    `[CONTACT-CONTROLLER] :: START :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const contactList = await self.contactCrudService.getAllContactOfAccount(
      inputs,
      filter,
      sort,
    );

    logger.info(
      `[CONTACT-CONTROLLER] :: SUCCESS :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(contactList);
  } catch (err) {
    logger.error(
      `[CONTACT-CONTROLLER] :: ERROR :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Contacts',
    });
  }
}

async function getContactById(settingsConfig, req, res, next) {
  const self = this;
  const { logger } = settingsConfig;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const { accountId } = req.params;
  const { contactId } = req.params;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }
  if (!accountId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountId is required',
    });
  }
  if (!contactId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'contactId is required',
    });
  }

  const inputs = {};
  // const filter = {};
  // const sort = {};
  inputs.projectId = projectId;
  inputs.accountId = accountId;
  inputs.contactId = contactId;

  logger.info(
    `[CONTACT-CONTROLLER] :: START :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const contact = await self.contactCrudService.getContactById(inputs);

    logger.info(
      `[CONTACT-CONTROLLER] :: SUCCESS :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(contact);
  } catch (err) {
    logger.error(
      `[CONTACT-CONTROLLER] :: ERROR :: Fetch all Contact of Project {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Contacts',
    });
  }
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const { logger } = settingsConfig;
  const userId = req.user.sub;
  const { contact, disposeContact, taskLink, contactExpiry, clientId } =
    req.body;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  if (!contact) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'contact is required',
    });
  }

  const { projectId, accountId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }
  if (!accountId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'accountId is required',
    });
  }
  if (!clientId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'clientId is required',
    });
  }
  if (!contact.firstName || !contact.lastName) {
    return res.status(400).send({
      err: 'Required params not passed',
      desc: 'firstName,lastName   is required',
    });
  }
  if (disposeContact && !taskLink.TaskId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'TaskId is required',
    });
  }
  if (disposeContact && !contact.researchStatus) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'researchStatus is required',
    });
  }
  if (disposeContact && (!taskLink.disposition || !contact.disposition)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'disposition is required',
    });
  }
  if (
    !contactExpiry ||
    Number(contactExpiry).toString() === 'NaN' ||
    contactExpiry < 0 ||
    contactExpiry > 360 ||
    contactExpiry % 30 !== 0
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Contact Expiry value is InCorrect',
    });
  }

  const inputs = {};
  // const filter = {};
  // const sort = {};
  inputs.projectId = projectId;
  inputs.accountId = accountId;
  inputs.userId = userId;
  inputs.disposeContact = disposeContact;
  inputs.contactExpiry = contactExpiry;
  inputs.clientId = clientId;
  logger.info(
    `[CONTACT-CONTROLLER] :: START :: create contact {userId : ${userId}, projectId : ${projectId}, accountId: ${accountId}}`,
  );
  // createContact
  try {
    const result = await self.contactCrudService.saveContact(
      contact,
      inputs,
      taskLink,
    );
    return res.status(201).send(result);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[CONTACT-CONTROLLER] :: create contact error ${JSON.stringify(
        serializedError,
      )}`,
    );

    let errorResponse = {
      err: `UNEXPECTED_ERROR`,
      desc: err.message,
    };

    if (err.code) {
      errorResponse = {
        err: err.code,
        desc: err.desc,
      };
    }

    return res.status(500).send(errorResponse);
  }
}

// async function put(settingsConfig, req, res, next) {
//   const self = this;
//   const logger = settingsConfig.logger;
//   const userId = req.user.sub;
//   const contact = req.body.contact;

//   if (!userId) {
//     next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
//   }

//   if (!contact) {
//     return res.status(400).send({
//       err: 'Bad Request',
//       desc: 'contact is required'
//     });
//   }

//   const projectId = req.params.projectId;
//   const accountId = req.params.accountId;
//   const contactId = req.params.contactId;

//   if (!projectId) {
//     return res.status(400).send({
//       err: 'Bad Request',
//       desc: 'projectId is required'
//     });
//   }
//   if (!accountId) {
//     return res.status(400).send({
//       err: 'Bad Request',
//       desc: 'accountId is required'
//     });
//   }

//   if (!contactId) {
//     return res.status(400).send({
//       err: 'Bad Request',
//       desc: 'contactIdis required'
//     });
//   }
//   var inputs = {};
//   let filter = {};
//   let sort = {};
//   inputs.projectId = projectId;
//   inputs.accountId = accountId;
//   inputs.contactId = contactId;
//   inputs.userId = userId;
//   logger.info(
//     `[CONTACT-CONTROLLER] :: START :: update contact {userId : ${userId}, projectId : ${projectId}, accountId: ${accountId}}`
//   );
//   //createContact
//   try {
//     let updatedContact = await self.contactCrudService.updateContact(contact, inputs);
//     return res.status(201).send(updatedContact);
//   } catch (err) {
//     console.log(err);
//     logger.error(`[CONTACT-CONTROLLER] :: update contact error ${JSON.stringify(err)}`);
//     return res.status(500).send('Error While creating contact');
//   }
// }
ContactsController.prototype = {
  get,
  getContactById,
  post,
  // put: put
};

const contactsController = new ContactsController();

module.exports = contactsController;
