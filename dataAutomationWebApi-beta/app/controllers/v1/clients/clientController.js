/* eslint-disable global-require */
const _ = require('lodash');
const { uuid } = require('uuidv4');
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

/**
 *
 * @openapi
 *
 * definitions:
 *   client:
 *     properties:
 *       id:
 *        type: string
 *       name:
 *        type: string
 *       pseudonym:
 *        type: string
 *       createdAt:
 *        type: string
 *       updatedAt:
 *        type: string
 *       createdBy:
 *        type: string
 *       updatedBy:
 *        type: string
 *
 * /client:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getClient
 *     tags:
 *       - Client
 *     description: This is client list route which fetch the all the project type
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the client array
 *         schema:
 *            $ref: '#/definitions/client'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: postClient
 *     tags:
 *       - Client
 *     description: This is client create route
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: client
 *         schema:
 *          type: object
 *          properties:
 *           client:
 *            type: object
 *            properties:
 *             name:
 *               type: string
 *               description: name of client
 *             pseudonym:
 *               type: string
 *               description: sudo name of client
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the client object which is created
 *         schema:
 *            $ref: '#/definitions/client'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /client/{clientId}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getClientById
 *     tags:
 *       - Client
 *     description: This is client route returns the single object of client
 *     parameters:
 *       - in: path
 *         name: clientId
 *         type: string
 *         description: Client Id
 *         required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the client
 *         schema:
 *            $ref: '#/definitions/client'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: putClient
 *     tags:
 *     - Client
 *     description: This is client update route
 *     produces:
 *     - application/json
 *     parameters:
 *       - in: path
 *         name: clientId
 *         type: string
 *         description: Client Id
 *         required: true
 *       - in: body
 *         name: client
 *         schema:
 *          type: object
 *          properties:
 *           client:
 *            type: object
 *            properties:
 *             name:
 *               type: string
 *               description: name of client
 *             pseudonym:
 *               type: string
 *               description: sudo name of client
 *     responses:
 *       '200':
 *         description: Update a client
 *       '400':
 *         description: If required parameters not passes then sends the params error
 *       '403':
 *         description: If user is not authenticate then sends the user authentication error
 *       '500':
 *         description: if something fails internally then send error
 */

function ClientController() {
  const ClientCRUDService = require('../../../services/clients/clientService');
  const ValidationService = require('../../../services/helpers/validationService');
  const PaginationService = require('../../../services/helpers/paginationService');
  this.clientCrudService = new ClientCRUDService();
  this.validationService = new ValidationService();
  this.paginationService = new PaginationService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const details = req.query.details || false;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  logger.info(
    `[CLIENT_CONTROLLER] :: START :: Fetch all Client {userId : ${userId}}`,
  );

  try {
    let clientList;

    if (details) {
      clientList = await self.clientCrudService.getAllClientDetails(inputs);
    } else {
      clientList = await self.clientCrudService.getAllClient(inputs);
    }

    logger.info(
      `[CLIENT_CONTROLLER] :: SUCCESS :: Fetch all Client {userId : ${userId}}`,
    );

    return res.status(200).send(clientList);
  } catch (err) {
    logger.error(
      `[CLIENT_CONTROLLER] :: ERROR :: Fetch all Client {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Clients',
    });
  }
}

async function getClientById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const clientId = req.params.id;

  if (!clientId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'clientId is required',
    });
  }

  const inputs = {};
  inputs.clientId = clientId;

  logger.info(
    `[CLIENT_CONTROLLER] :: START :: Fetch Client by Id {userId : ${userId}, clientId : ${clientId}}`,
  );

  try {
    const client = await self.clientCrudService.getClient(inputs);

    logger.info(
      `[CLIENT_CONTROLLER] :: SUCCESS :: Fetch Client by Id {userId : ${userId}, clientId : ${clientId}}`,
    );

    return res.status(200).send(client);
  } catch (err) {
    logger.error(
      `[CLIENT_CONTROLLER] :: ERROR :: Fetch Client by Id {userId : ${userId}, clientId : ${clientId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Client',
    });
  }
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { client } = req.body;

  if (!client) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in Client object not Found',
    });
  }

  const validClientObject = self.validationService.removeNullKeysInObj(client);
  const missingKeys = self.validationService.validateObj(validClientObject, [
    'name',
    'pseudonym',
  ]);

  if (!_.isEmpty(missingKeys)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${missingKeys.join(', ')} is required`,
    });
  }

  const inputs = {};
  inputs.clientId = uuid();
  inputs.name = validClientObject.name;
  inputs.pseudonym = validClientObject.pseudonym;
  inputs.createdBy = userId;
  inputs.createdAt = new Date();

  logger.info(
    `[CLIENT_CONTROLLER] :: START :: Add Client {userId : ${userId}}`,
  );

  try {
    const result = await self.clientCrudService.addClient(inputs);

    logger.info(
      `[CLIENT_CONTROLLER] :: SUCCESS :: Add Client {userId : ${userId}}`,
    );

    return res.status(201).send(result);
  } catch (err) {
    logger.error(
      `[CLIENT_CONTROLLER] :: ERROR :: Add Client {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Create Client',
    });
  }
}

async function put(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const clientId = req.params.id;

  if (!clientId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'clientId is required',
    });
  }
  const { client } = req.body;

  if (!client) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in Client object not Found',
    });
  }

  const validClientObject = self.validationService.removeNullKeysInObj(client);
  const missingKeys = self.validationService.validateObj(validClientObject, [
    'name',
    'pseudonym',
  ]);

  if (!_.isEmpty(missingKeys)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${missingKeys.join(', ')} is required`,
    });
  }

  const inputs = {};
  inputs.clientId = clientId;
  inputs.name = validClientObject.name;
  inputs.pseudonym = validClientObject.pseudonym;
  inputs.updatedBy = userId;

  logger.info(
    `[CLIENT_CONTROLLER] :: START :: Edit Client {userId : ${userId}}`,
  );

  try {
    const result = await self.clientCrudService.editClient(inputs);

    logger.info(
      `[CLIENT_CONTROLLER] :: SUCCESS :: Edit Client {userId : ${userId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    logger.error(
      `[CLIENT_CONTROLLER] :: ERROR :: Edit Client {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Update Client',
    });
  }
}

ClientController.prototype = {
  get,
  getClientById,
  post,
  put,
};

const clientController = new ClientController();

module.exports = clientController;
