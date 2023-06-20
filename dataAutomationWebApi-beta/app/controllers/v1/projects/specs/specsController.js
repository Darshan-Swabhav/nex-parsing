/* eslint-disable global-require */
const _ = require('lodash');
const { uuid } = require('uuidv4');
const errors = require('throw.js');
const errorMessages = require('../../../../config/error.config.json');

/**
 * @openapi
 *definitions:
 *   ProjectSpec:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       name:
 *         type: string
 *       values:
 *         type: object
 *       comments:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 *       ProjectId:
 *         type: string
 *       createdBy:
 *         type: string
 *       updatedBy:
 *         type: string
 *   ProjectSpecPost:
 *     type: object
 *     properties:
 *       projectSpec:
 *         type: object
 *         properties:
 *            name:
 *              type: string
 *            values:
 *              type: object
 *            comments:
 *              type: string
 *
 * tags:
 *   - name: PROJECT spec
 *
 * /project/{project_id}/specs:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getSpec
 *     tags:
 *     - PROJECT spec
 *     description: This project spec route returns specs of project
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       required: true
 *       description: Project id
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Returns the project spcs list of a project
 *         schema:
 *           $ref: "#/definitions/ProjectSpec"
 *       '400':
 *         description: If required parameters not passes then sends the params error
 *       '403':
 *         description: If user is not authenticate then sends the user authentication error
 *       '500':
 *         description: if something fails internally then send error
 *
 *   post:
 *     operationId: postSpec
 *     security:
 *        - auth0_jwk: []
 *     tags:
 *     - PROJECT spec
 *     description: This project spec route adds specs of a project
 *     produces:
 *     - application/json
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       required: true
 *       description: Project id
 *     - in: body
 *       name: body
 *       schema:
 *          $ref: '#/definitions/ProjectSpecPost'
 *       required: true
 *       description: Project body
 *     responses:
 *       '200':
 *         description: Updates a project spec object with id
 *         schema:
 *           $ref: "#/definitions/ProjectSpec"
 *       '400':
 *         description: If required parameters not passes then sends the params error
 *       '403':
 *         description: If user is not authenticate then sends the user authentication error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{project_id}/specs/{specs_id}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getOneSpec
 *     tags:
 *     - PROJECT spec
 *     description: This project spec route returns a spec of project using project spec id
 *     produces:
 *     - application/json
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       required: true
 *       description: Project id
 *     - in: path
 *       name: specs_id
 *       type: string
 *       required: true
 *       description: Project spec id
 *     responses:
 *       '200':
 *         description: Returns a project spc of a project
 *         schema:
 *           $ref: '#/definitions/ProjectSpec'
 *       '400':
 *         description: If required parameters not passes then sends the params error
 *       '403':
 *         description: If user is not authenticate then sends the user authentication error
 *       '500':
 *         description: if something fails internally then send error
 *
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: putSpecRoute
 *     tags:
 *     - PROJECT spec
 *     description: This project spec route adds specs of a project
 *     produces:
 *     - application/json
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       required: true
 *       description: Project id
 *     - in: path
 *       name: specs_id
 *       type: string
 *       required: true
 *       description: Project spec id
 *     - in: body
 *       name: body
 *       schema:
 *          $ref: '#/definitions/ProjectSpecPost'
 *       required: true
 *       description: Project body
 *     responses:
 *       '200':
 *         description: Updates a project spec object with id
 *         schema:
 *           $ref: '#/definitions/ProjectSpec'
 *       '400':
 *         description: If required parameters not passes then sends the params error
 *       '403':
 *         description: If user is not authenticate then sends the user authentication error
 *       '500':
 *         description: if something fails internally then send error
 *
 *   delete:
 *     security:
 *        - auth0_jwk: []
 *     operationId: deleteSpecRoute
 *     tags:
 *     - PROJECT spec
 *     description: This project spec route deletes a spec of project using project spec id
 *     produces:
 *     - application/json
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       required: true
 *       description: Project id
 *     - in: path
 *       name: specs_id
 *       type: string
 *       required: true
 *       description: Project spec id
 *     responses:
 *       '201':
 *         description: Deletes a project spc of a project
 *       '400':
 *         description: If required parameters not passes then sends the params error
 *       '403':
 *         description: If user is not authenticate then sends the user authentication error
 *       '500':
 *         description: if something fails internally then send error
 *
 */

function ProjectspecsController() {
  const ProjectspecCRUDService = require('../../../../services/projects/specs/specsService');
  const ValidationService = require('../../../../services/helpers/validationService');
  const PaginationService = require('../../../../services/helpers/paginationService');

  this.validationService = new ValidationService();
  this.projectspecCrudService = new ProjectspecCRUDService();
  this.paginationService = new PaginationService();
}

async function get(settingsConfig, req, res, next) {
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

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.projectId = projectId;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  logger.info(
    `[PROJECTSPEC-CONTROLLER] :: START :: Fetch all ProjectSpec of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const projectSpecList = await self.projectspecCrudService.getAllProjectSpec(
      inputs,
    );

    logger.info(
      `[PROJECTSPEC-CONTROLLER] :: SUCCESS :: Fetch all ProjectSpec of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(projectSpecList);
  } catch (err) {
    logger.error(
      `[PROJECTSPEC-CONTROLLER] :: ERROR :: Fetch all ProjectSpec of Project {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get PROJECTSpecs',
    });
  }
}

async function getSpecById(settingsConfig, req, res, next) {
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

  const projectSpecId = req.params.id;
  if (!projectSpecId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectSpecId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.projectSpecId = projectSpecId;

  logger.info(
    `[PROJECTSPEC-CONTROLLER] :: START :: Fetch ProjectSpec by Id {userId : ${userId}, projectId : ${projectId}, projectSpecId : ${projectSpecId}}`,
  );

  try {
    const projectSpec = await self.projectspecCrudService.getProjectSpec(
      inputs,
    );

    logger.info(
      `[PROJECTSPEC-CONTROLLER] :: SUCCESS :: Fetch ProjectSpec by Id {userId : ${userId}, projectId : ${projectId}, projectSpecId : ${projectSpecId}}`,
    );

    return res.status(200).send(projectSpec);
  } catch (err) {
    logger.error(
      `[PROJECTSPEC-CONTROLLER] :: ERROR :: Fetch ProjectSpec by Id {userId : ${userId}, projectId : ${projectId}, projectSpecId : ${projectSpecId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get PROJECTSpec',
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

  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const { projectSpec } = req.body;
  if (!projectSpec) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in PROJECT Spec object not Found',
    });
  }

  const validProjectSpecObject =
    self.validationService.removeNullKeysInObj(projectSpec);
  const missingKeys = self.validationService.validateObj(
    validProjectSpecObject,
    ['name', 'values'],
  );

  if (!_.isEmpty(missingKeys)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${missingKeys.join(', ')} is required`,
    });
  }

  const inputs = {};
  inputs.projectSpecId = uuid();
  inputs.projectId = projectId;
  inputs.name = validProjectSpecObject.name;
  inputs.values = validProjectSpecObject.values;
  // inputs.comments  = validProjectSpecObject.comments;
  inputs.createdAt = new Date();
  inputs.createdBy = userId;

  logger.info(
    `[PROJECTSPEC-CONTROLLER] :: START :: Add ProjectSpec {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const result = await self.projectspecCrudService.addProjectSpec(inputs);

    logger.info(
      `[PROJECTSPEC-CONTROLLER] :: SUCCESS :: Add ProjectSpec {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(201).send(result);
  } catch (err) {
    logger.error(
      `[PROJECTSPEC-CONTROLLER] :: ERROR :: Add ProjectSpec {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Create PROJECT Spec',
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

  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const projectSpecId = req.params.id;
  if (!projectSpecId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectSpecId is required',
    });
  }

  const { projectSpec } = req.body;
  if (!projectSpec) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in PROJECT Spec object not Found',
    });
  }

  const validProjectSpecObject =
    this.validationService.removeNullKeysInObj(projectSpec);
  const missingKeys = this.validationService.validateObj(
    validProjectSpecObject,
    ['name', 'values'],
  );

  if (!_.isEmpty(missingKeys)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${missingKeys.join(', ')} is required`,
    });
  }

  const inputs = {};
  inputs.projectSpecId = projectSpecId;
  inputs.projectId = projectId;
  inputs.name = validProjectSpecObject.name;
  inputs.values = validProjectSpecObject.values;
  inputs.updatedAt = new Date();
  inputs.updatedBy = userId;

  logger.info(
    `[PROJECTSPEC-CONTROLLER] :: START :: Update ProjectSpec {userId : ${userId}, projectId : ${projectId},  projectSpecId : ${projectSpecId}}`,
  );

  try {
    const result = await self.projectspecCrudService.editProjectSpec(inputs);

    logger.info(
      `[PROJECTSPEC-CONTROLLER] :: SUCCESS :: Update ProjectSpec {userId : ${userId}, projectId : ${projectId},  projectSpecId : ${projectSpecId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    logger.error(
      `[PROJECTSPEC-CONTROLLER] :: ERROR :: Update ProjectSpec {userId : ${userId}, projectId : ${projectId},  projectSpecId : ${projectSpecId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Update PROJECTSpec',
    });
  }
}

async function deleteSpec(settingsConfig, req, res, next) {
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

  const projectSpecId = req.params.id;
  if (!projectSpecId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectSpecId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.projectSpecId = projectSpecId;

  logger.info(
    `[PROJECTSPEC-CONTROLLER] :: START :: Delete ProjectSpec by Id {userId : ${userId}, projectId : ${projectId}, projectSpecId : ${projectSpecId}}`,
  );

  try {
    const projectSpec = await self.projectspecCrudService.deleteProjectSpec(
      inputs,
    );

    logger.info(
      `[PROJECTSPEC-CONTROLLER] :: SUCCESS :: Delete ProjectSpec by Id {userId : ${userId}, projectId : ${projectId}, projectSpecId : ${projectSpecId}}`,
    );

    return res.sendStatus(201).send(projectSpec);
  } catch (err) {
    logger.error(
      `[PROJECTSPEC-CONTROLLER] :: ERROR :: Delete ProjectSpec by Id {userId : ${userId}, projectId : ${projectId}, projectSpecId : ${projectSpecId}, error : ${err.message}}`,
    );

    return res.sendStatus(500).send({
      err,
      desc: 'Could Not Delete PROJECTSpec',
    });
  }
}

ProjectspecsController.prototype = {
  get,
  getSpecById,
  post,
  put,
  delete: deleteSpec,
};

const projectspecsController = new ProjectspecsController();

module.exports = projectspecsController;
