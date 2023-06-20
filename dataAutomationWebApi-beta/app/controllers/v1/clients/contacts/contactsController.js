/* eslint-disable global-require */
const _ = require('lodash');
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');

/**
 *
 * @openapi
 *
 * definitions:
 *   checkReuseResponse:
 *     properties:
 *       matchType:
 *        type: string
 *       matchWith:
 *        type: object
 *
 * /clients/{clientId}/contacts/checkReuse:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: checkContactReuse
 *     tags:
 *       - Contacts
 *     description: Search for reusable contacts across Client
 *     parameters:
 *     - in: path
 *       name: clientId
 *       type: string
 *       description: client id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the result in json format for reusable contact
 *         schema:
 *            $ref: '#/definitions/checkReuseResponse'
 *       '400':
 *         description: if Required Data is not passed in request body
 *       '401':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function ContactsController() {
  const ContactService = require('../../../../services/clients/contacts/contactsService');

  this.contactService = new ContactService();
}

function validateDataForDedupeKeys(contact) {
  if (contact.email) {
    return;
  }
  if (contact.firstName && contact.lastName && contact.companyName) {
    return;
  }
  if (contact.firstName && contact.lastName && contact.companyDomain) {
    return;
  }
  throw new Error(
    'Required Contact Fields (firstName, lastName, email, companyName, companyDomain)',
  );
}

async function checkContactReuse(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (roles.indexOf(USER_ROLES.AGENT) < 0) {
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  }

  const { clientId } = req.params;
  const contact = req.body || {};

  if (!clientId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Client Id is Required',
    });
  }

  if (_.isEmpty(contact)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Expected Contact Details in Request Body',
    });
  }

  const { projectId, templateId, contactExpiry } = contact;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Project Id is Required',
    });
  }

  if (!templateId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Template Id is Required',
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

  try {
    this.validateDataForDedupeKeys(contact);
  } catch (error) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: error.message,
    });
  }

  const inputs = {
    clientId,
    projectId,
    contactExpiry,
    templateId,
  };
  const getMatchedContact = true;
  logger.info(
    `[CONTACT-CONTROLLER] :: START :: Check Contact Re-Use { userId : ${userId}, clientId : ${clientId}, contact: ${JSON.stringify(
      contact,
    )}}`,
  );

  try {
    const contactCheckResult = await self.contactService.checkContactReuse(
      contact,
      inputs,
      getMatchedContact,
    );
    logger.info(
      `[CONTACT-CONTROLLER] :: SUCCESS :: Check Contact Reuse { userId : ${userId}, clientId : ${clientId}, Result: ${contactCheckResult} }`,
    );

    return res.status(200).send(contactCheckResult);
  } catch (err) {
    const serializedError = serializeError(err);

    logger.error(
      `[CONTACT-CONTROLLER] :: ERROR :: Check Contact Reuse { userId : ${userId}, clientId : ${clientId}, contact: ${JSON.stringify(
        contact,
      )}, error: ${JSON.stringify(serializedError)}}`,
    );
    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Check Reusable',
    });
  }
}

ContactsController.prototype = {
  validateDataForDedupeKeys,
  checkContactReuse,
};

const contactsController = new ContactsController();

module.exports = contactsController;
