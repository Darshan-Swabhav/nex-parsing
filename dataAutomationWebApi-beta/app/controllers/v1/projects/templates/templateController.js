/* eslint-disable global-require */
const { serializeError } = require('serialize-error');
const errors = require('throw.js');
const { uuid } = require('uuidv4');
const errorMessages = require('../../../../config/error.config.json');

/**
 * @openapi
 *
 * definitions:
 *   template:
 *     properties:
 *       id:
 *        type: string
 *        description: template id
 *       name:
 *        type: string
 *        description: template name
 *       config:
 *        type: object
 *        description: template configuration
 *
 * /projects/templates:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTemplates
 *     tags:
 *       - TEMPLATE
 *     description: This is template list route which fetch the all the template
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the template array
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/template'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: createTemplate
 *     tags:
 *       - TEMPLATE
 *     description: This is template list route which create the new template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: templateInput
 *         schema:
 *          type: object
 *          properties:
 *           name:
 *            type: string
 *           config:
 *            type: object
 *     responses:
 *       '201':
 *         description: creates the new template
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/template:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTemplateOfAProject
 *     tags:
 *       - TEMPLATE
 *     description: This is template route which fetch the the template of a project
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: projectId
 *         type: string
 *         required: true
 *         description: project id
 *     responses:
 *       '200':
 *         description: returns the template object
 *         schema:
 *            $ref: '#/definitions/template'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /projects/templates/{templateId}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTemplateById
 *     tags:
 *       - TEMPLATE
 *     description: This is template route which return the template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: templateId
 *         type: string
 *         required: true
 *         description: template id
 *     responses:
 *       '201':
 *         description: send the template
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: updateTemplate
 *     tags:
 *       - TEMPLATE
 *     description: This is template route which updates the template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: templateId
 *         type: string
 *         required: true
 *         description: template id
 *       - in: body
 *         name: templateInput
 *         schema:
 *          type: object
 *          properties:
 *           name:
 *            type: string
 *           config:
 *            type: object
 *     responses:
 *       '201':
 *         description: updates the templates
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /projects/templates/{templateId}/gridConfigs:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getGridConfigsOfTemplate
 *     tags:
 *       - TEMPLATE
 *     description: Return Grid Config JSON of Single Template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: templateId
 *         type: string
 *         required: true
 *         description: unique ID of Template
 *     responses:
 *       '200':
 *         description: Return Grid Configuration JSON
 *         schema:
 *           type: object
 *           properties:
 *            headers:
 *              type: array
 *              items:
 *               type: object
 *            footerProps:
 *              type: object
 *            gridOptions:
 *              type: object
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error Message.
 *             desc:
 *               type: string
 *               description: Error Description.
 *       '500':
 *         description: if something fails internally then send error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error Message.
 *             desc:
 *               type: string
 *               description: Error Description.
 */
function TemplateController() {
  const TemplateCRUDService = require('../../../../services/projects/templates/templateService');

  this.templateCrudService = new TemplateCRUDService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  logger.info(
    `[TEMPLATE-CONTROLLER] :: START ::Fetch All Template {userId : ${userId}}`,
  );

  try {
    const template = await self.templateCrudService.getAllTemplate();

    logger.info(
      `[TEMPLATE-CONTROLLER] :: SUCCESS :: Fetch All Template {userId : ${userId}`,
    );

    return res.status(200).send(template);
  } catch (err) {
    logger.error(
      `[TEMPLATE-CONTROLLER] :: ERROR :: Fetch All Template {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Template',
    });
  }
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { name, config } = req.body;

  const inputs = {};
  inputs.templateId = uuid();
  inputs.name = name;
  inputs.config = config;
  inputs.createdBy = userId;

  logger.info(
    `[TEMPLATE-CONTROLLER] :: START :: Create Template {userId : ${userId}}`,
  );

  try {
    const template = await self.templateCrudService.createTemplate(inputs);

    logger.info(
      `[TEMPLATE-CONTROLLER] :: SUCCESS :: Create Template {userId : ${userId}`,
    );

    return res.status(201).send(template);
  } catch (err) {
    logger.error(
      `[TEMPLATE-CONTROLLER] :: ERROR :: Create Template {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err: err.message || err,
      desc: 'Could Not Create Template',
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

  const { templateId } = req.params;
  if (!templateId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'templateId is required',
    });
  }

  const { name, config } = req.body;

  const inputs = {};
  inputs.templateId = templateId;
  inputs.name = name;
  inputs.config = config;
  inputs.updatedBy = userId;

  logger.info(
    `[TEMPLATE-CONTROLLER] :: START :: Update Template {userId : ${userId}}`,
  );

  try {
    const template = await self.templateCrudService.updateTemplate(inputs);

    logger.info(
      `[TEMPLATE-CONTROLLER] :: SUCCESS :: Update Template {userId : ${userId}`,
    );

    return res.status(201).send(template);
  } catch (err) {
    logger.error(
      `[TEMPLATE-CONTROLLER] :: ERROR :: Update Template {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Update Template',
    });
  }
}

async function getTemplateOfAProject(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
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

  const inputs = {};
  inputs.projectId = projectId;

  logger.info(
    `[TEMPLATE-CONTROLLER] :: START ::Fetch Template Of A Project {userId : ${userId}}`,
  );

  try {
    const template = await self.templateCrudService.getTemplateOfAProject(
      inputs,
    );

    logger.info(
      `[TEMPLATE-CONTROLLER] :: SUCCESS :: Fetch Template Of A Project {userId : ${userId}`,
    );

    return res.status(200).send(template);
  } catch (err) {
    logger.error(
      `[TEMPLATE-CONTROLLER] :: ERROR :: Fetch Template Of A Project {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Template',
    });
  }
}

async function getTemplateById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { templateId } = req.params;
  if (!templateId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'templateId is required',
    });
  }

  const inputs = {};
  inputs.templateId = templateId;

  logger.info(
    `[TEMPLATE-CONTROLLER] :: START ::Fetch Template Of By Id {userId : ${userId}}`,
  );

  try {
    const template = await self.templateCrudService.getTemplateById(inputs);

    logger.info(
      `[TEMPLATE-CONTROLLER] :: SUCCESS :: Fetch Template Of By Id {userId : ${userId}`,
    );

    return res.status(200).send(template);
  } catch (err) {
    logger.error(
      `[TEMPLATE-CONTROLLER] :: ERROR :: Fetch Template Of By Id {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Template',
    });
  }
}

async function getTemplateGridConfig(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { templateId } = req.params;
  if (!templateId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'templateId is required',
    });
  }

  logger.info(
    `[TEMPLATE-CONTROLLER] :: START ::Fetch Grid Config Of Template Of By Id {userId : ${userId}}`,
  );

  try {
    const template = await self.templateCrudService.getTemplateGridConfig(
      templateId,
    );
    logger.info(
      `[TEMPLATE-CONTROLLER] :: SUCCESS :: Fetch Grid Config Of Template Of By Id {userId : ${userId}`,
    );
    return res.status(200).send(template);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[TEMPLATE-CONTROLLER] :: ERROR :: Fetch Grid Config Of Template Of By Id {userId : ${userId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      error: error.message,
      desc: 'Could Not Get Grid Config',
    });
  }
}

TemplateController.prototype = {
  get,
  getTemplateById,
  post,
  put,
  getTemplateOfAProject,
  getTemplateGridConfig,
};

const projectTypeController = new TemplateController();

module.exports = projectTypeController;
