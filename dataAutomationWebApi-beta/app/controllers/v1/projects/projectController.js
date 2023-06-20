/* eslint-disable global-require */
const _ = require('lodash');
const { uuid } = require('uuidv4');
const { serializeError } = require('serialize-error');
const errors = require('throw.js');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const { sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const errorMessages = require('../../../config/error.config.json');

/**
 * @openapi
 * definitions:
 *  Project:
 *    properties:
 *       id:
 *         type: string
 *         description: project id
 *       name:
 *         type: string
 *         description: name of project
 *       ClientId:
 *          type: string
 *          description: client id
 *       receivedDate:
 *          type: string
 *          description: date of recived
 *       startDate:
 *          type: string
 *          description: start date
 *       deliveryDate:
 *          type: string
 *          description: delivery date
 *       description:
 *          type: string
 *       dueDate:
 *          type: string
 *          description: due date
 *       projectTypeId:
 *         type: string
 *         description: project type id
 *       templateId:
 *         type: string
 *         description: template id
 *       createdBy:
 *          type: string
 *          description: created by which user
 *       updatedBy:
 *          type: string
 *          description: updated by which user
 *       createdAt:
 *          type: string
 *          description: created at what time
 *       updatedAt:
 *          type: string
 *          description: updated at what time
 *       fieldLabelProject:
 *          type: string
 *       fieldLabelAccount:
 *          type: string
 *       fieldLabelContact:
 *          type: string
 *       fieldLabelUser:
 *          type: string
 *       ProjectSetting:
 *          $ref: '#/definitions/Projectsettings'
 *       Client:
 *          $ref: '#/definitions/client'
 *       Users:
 *          $ref: '#/definitions/Users'
 *
 *  ProjectUser:
 *    properties:
 *       ProjectId:
 *         type: string
 *         description: project id
 *       UserId:
 *         type: string
 *         description: user id
 *       userLevel:
 *         type: string
 *         description: level of user
 *       createdBy:
 *         type: string
 *         description: created by which user
 *       updatedBy:
 *         type: string
 *         description: updated by which user
 *       createdAt:
 *         type: string
 *         description: created at what time
 *       updatedAt:
 *         type: string
 *         description: updated at what time
 *
 *  Users:
 *    properties:
 *       ProjectUser:
 *         $ref: '#/definitions/ProjectUser'
 *       id:
 *         type: string
 *         description: user id
 *       firstName:
 *          type: string
 *          description: user first name
 *       lastName:
 *          type: string
 *          description: user last name
 *       role:
 *          type: string
 *          description: role of user
 *       gmailId:
 *          type: string
 *       userName:
 *          type: string
 *          description: username of user
 *       createdBy:
 *          type: string
 *          description: created by which user
 *       updatedBy:
 *          type: string
 *          description: updated by which user
 *       createdAt:
 *          type: string
 *          description: created at what time
 *       updatedAt:
 *          type: string
 *          description: updated at what time
 *       custom1:
 *          type: string
 *       custom2:
 *          type: string
 *       custom3:
 *          type: string
 *       custom4:
 *          type: string
 *       custom5:
 *          type: string
 *       custom6:
 *          type: string
 *       custom7:
 *          type: string
 *       custom8:
 *          type: string
 *       custom9:
 *          type: string
 *       custom10:
 *          type: string
 *       custom11:
 *          type: string
 *       custom12:
 *          type: string
 *       custom13:
 *          type: string
 *       custom14:
 *          type: string
 *       custom15:
 *          type: string
 *
 *  ProjectGet:
 *    properties:
 *       projectId:
 *         type: string
 *         description: project id
 *       projectName:
 *         type: string
 *         description: name of project
 *       clientId:
 *         type: string
 *         description: client id
 *       client:
 *         type: string
 *         description: name of client
 *       createdAt:
 *         type: string
 *         description: created at
 *       dueDate:
 *         type: string
 *         description: due date
 *       updatedAt:
 *         type: string
 *         description: updated at
 *       status:
 *         type: string
 *         description: project status
 *       targetAccount:
 *         type: string
 *         description: number of target accounts
 *       targetContact:
 *         type: string
 *         description: number of target contacts
 *
 *  ProjectGetAll:
 *    properties:
 *       totalCount:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *         description: total number of projects
 *       docs:
 *         type: array
 *         items:
 *           $ref: '#/definitions/ProjectGet'
 *
 *  ProjectPost:
 *    properties:
 *       id:
 *         type: string
 *         description: project id
 *       name:
 *         type: string
 *         description: name of project
 *       ClientId:
 *          type: string
 *          description: client id
 *       receivedDate:
 *          type: string
 *          description: date of recived
 *       startDate:
 *          type: string
 *          description: start date
 *       deliveryDate:
 *          type: string
 *          description: delivery date
 *       description:
 *          type: string
 *       dueDate:
 *          type: string
 *          description: due date
 *       ProjectSetting:
 *          $ref: '#/definitions/ProjectsettingsPost'
 *       ProjectType:
 *          $ref: '#/definitions/projectType'
 *
 *    required:
 *      - id
 *      - name
 *      - ClientId
 *      - dueDate
 * /project:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAllProjects
 *     tags:
 *       - PROJECT
 *     description: This is project list route which fetch the project list for that user
 *     parameters:
 *     - in: query
 *       name: pageNo
 *       type: integer
 *       description: page number
 *     - in: query
 *       name: pageSize
 *       type: integer
 *       description: page size
 *     - in: query
 *       name: filter
 *       type: string
 *       description: Create an object of the column on which the filter is to be applied and send it by stringify (Like- {columnName- filterValue})
 *     - in: query
 *       name: sort
 *       type: string
 *       description: Create an object of the column on which the sort is to be applied and send it by stringify (Like- {columnName- sortValue})
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the project list array for that given list
 *         schema:
 *            $ref: '#/definitions/ProjectGetAll'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   post:
 *     operationId: postProject
 *     security:
 *        - auth0_jwk: []
 *     tags:
 *       - PROJECT
 *     description: Create project route
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: projectPostObject
 *         schema:
 *           $ref: '#/definitions/ProjectPost'
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the project which created
 *         schema:
 *            $ref: '#/definitions/Project'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{project_id}:
 *  get:
 *    security:
 *       - auth0_jwk: []
 *    operationId: getProjectById
 *    consumes:
 *      - application/json
 *    parameters:
 *       - in: path
 *         name: project_id
 *         type: string
 *         description: PROJECT Id
 *         required: true
 *    tags:
 *      - PROJECT
 *    description: This is project list route which fetch the project list for that user
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: returns the project list array for that given list
 *        schema:
 *           $ref: '#/definitions/Project'
 *      '400':
 *        description: if required parameters not passes then sends the params error
 *      '500':
 *        description: if something fails internally then send error
 *  put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: putProject
 *     tags:
 *       - PROJECT
 *     description: Create project route
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: project_id
 *         type: string
 *         description: PROJECT Id
 *         required: true
 *       - in: body
 *         name: projectPostObject
 *         schema:
 *          $ref: '#/definitions/ProjectPost'
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the project which updated
 *         schema:
 *            $ref: '#/definitions/Project'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 *  delete:
 *    security:
 *       - auth0_jwk: []
 *    operationId: deleteProjectById
 *    consumes:
 *      - application/json
 *    parameters:
 *       - in: path
 *         name: project_id
 *         type: string
 *         description: PROJECT Id
 *         required: true
 *    tags:
 *      - PROJECT
 *    description: This is project delete route
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: returns the project deleted successfully
 *      '400':
 *        description: if required parameters not passes then sends the params error
 *      '403':
 *        description: if user do not have deleting permission
 *      '500':
 *        description: if something fails internally then send error
 */

function ProjectsController() {
  const ProjectCRUDService = require('../../../services/projects/projectService');
  const ProjectSettingCRUDService = require('../../../services/projects/setting/settingService');
  const ValidationService = require('../../../services/helpers/validationService');
  const PaginationService = require('../../../services/helpers/paginationService');
  const ProjectUserCRUDService = require('../../../services/projects/user/userService');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  this.validationService = new ValidationService();
  this.projectCrudService = new ProjectCRUDService();
  this.projectSettingCrudService = new ProjectSettingCRUDService();
  this.paginationService = new PaginationService();
  this.projectUserCrudService = new ProjectUserCRUDService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

// aliasName
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

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);
  const searchColumn = req.query.searchColumn || null;
  const searchValue = req.query.searchValue || null;

  if (searchValue && !searchColumn) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Could not search value without passing a column name',
    });
  }
  const allowedSearchColumnForAutoComplete = ['project', 'aliasName'];
  if (
    searchValue &&
    !allowedSearchColumnForAutoComplete.includes(searchColumn)
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `Could not Allowed search on Column: ${searchColumn}`,
    });
  }

  let filter = req.query.filter || '{}';
  let sort = req.query.sort || '{}';

  const inputs = {};
  inputs.limit = page.limit;
  inputs.offset = page.offset;
  inputs.userId = userId;
  inputs.searchColumn = searchColumn;
  inputs.searchValue = searchValue;
  inputs.userRoles = roles;

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const filterErr = serializeError(error);
      logger.error(
        `[PROJECT-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          filterErr,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  const filterColumns = {
    dueDate: { type: 'array', operator: ['between'] },
    updatedAt: { type: 'array', operator: ['between'] },
    status: { type: 'string', operator: ['='] },
    client: { type: 'string', operator: ['='] },
    project: { type: 'string', operator: ['='] },
    aliasName: { type: 'string', operator: ['='] },
  };

  try {
    self.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const filterValidateErr = serializeError(error);
    logger.error(
      `[PROJECT-CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        filterValidateErr,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: filterValidateErr.message,
    });
  }

  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      const sortErr = serializeError(error);
      logger.error(
        `[PROJECT-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          sortErr,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The sort value type is not an object',
      });
    }
  }

  const sortableColumns = ['dueDate', 'client'];
  const multipleSort = false;

  try {
    self.sortHandler.validate(sortableColumns, sort, multipleSort);
  } catch (error) {
    const sortValidateErr = serializeError(error);
    logger.error(
      `[PROJECT-CONTROLLER] :: The value of sort is not correct {userId : ${userId}, error: ${JSON.stringify(
        sortValidateErr,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: sortValidateErr.message,
    });
  }

  logger.info(
    `[PROJECT-CONTROLLER] :: START :: Fetch all Project {userId : ${userId}}`,
  );

  try {
    const projectLists =
      await self.projectCrudService.getAllProjectWithSettings(
        inputs,
        filter,
        sort,
      );

    logger.info(
      `[PROJECT-CONTROLLER] :: SUCCESS :: Fetch all Project {userId : ${userId}}`,
    );

    return res.status(200).send(projectLists);
  } catch (error) {
    const err = serializeError(error);
    logger.error(
      `[PROJECT-CONTROLLER] :: ERROR :: Fetch all Project {userId : ${userId}, error: ${JSON.stringify(
        err,
      )}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Get PROJECTs',
    });
  }
}

async function getProjectById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const projectId = req.params.id;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }
  const { roles } = req.user;

  const inputs = {};
  inputs.projectId = projectId;
  inputs.userId = userId;
  inputs.userRoles = roles;

  logger.info(
    `[PROJECT-CONTROLLER] :: START :: Fetch Project by Id {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const project = await self.projectCrudService.getDetailedProject(inputs);

    logger.info(
      `[PROJECT-CONTROLLER] :: SUCCESS :: Fetch Project by Id {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(project);
  } catch (err) {
    logger.error(
      `[PROJECT-CONTROLLER] :: ERROR :: Fetch Project by Id {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get PROJECT',
    });
  }
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  const { roles } = req.user;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { project } = req.body;

  if (!project) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in PROJECT object not Found',
    });
  }

  const validProjectObject =
    self.validationService.removeNullKeysInObj(project);
  const missingKeys = self.validationService.validateObj(validProjectObject, [
    'name',
    'clientId',
    'projectTypeId',
  ]);

  if (!_.isEmpty(missingKeys)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${missingKeys.join(', ')} is required`,
    });
  }

  const inputs = {};
  const element = {};

  inputs.projectId = uuid();
  inputs.name = validProjectObject.name;
  inputs.aliasName = validProjectObject.aliasName;
  inputs.receivedDate = validProjectObject.receivedDate || project.receivedDate;
  inputs.dueDate = validProjectObject.dueDate || project.dueDate;
  inputs.description = validProjectObject.description;
  inputs.createdAt = new Date();
  inputs.clientId = validProjectObject.clientId;
  inputs.createdBy = userId;
  inputs.settingId = uuid();
  inputs.target = validProjectObject.target;
  inputs.contactsPerAccount = validProjectObject.contactsPerAccount;
  inputs.clientPoc = validProjectObject.clientPoc;
  inputs.priority = validProjectObject.priority || 'Medium';
  inputs.status = validProjectObject.status || 'Yet to Start';
  inputs.projectTypeId = validProjectObject.projectTypeId;
  inputs.templateId = validProjectObject.templateId || '01';
  inputs.userRoles = roles;

  element.userLevel = 'owner_main';
  element.createdAt = new Date();
  element.projectId = inputs.projectId;
  element.projectUserId = userId;
  element.createdBy = userId;
  element.userRoles = roles;

  logger.info(
    `[PROJECT-CONTROLLER] :: START :: Add Project {userId : ${userId}}`,
  );

  const transaction = await sequelize.transaction();

  try {
    // Note: In case of failure delete all created entries

    const newAddedProject = await self.projectCrudService.addProject(
      inputs,
      transaction,
    );
    const projectSetting =
      await self.projectSettingCrudService.addProjectSetting(
        inputs,
        transaction,
      );

    const projectUserCreated =
      await self.projectUserCrudService.createProjectUser(element, transaction);

    logger.info(
      `[PROJECT-CONTROLLER] :: SUCCESS :: Add Project {userId : ${userId}}`,
    );

    const projectDetail = {};
    projectDetail.project = newAddedProject;
    projectDetail.projectSetting = projectSetting;
    projectDetail.projectUserCreated = projectUserCreated;

    await transaction.commit();

    return res.status(201).send(projectDetail);
  } catch (err) {
    logger.error(
      `[PROJECT-CONTROLLER] :: ERROR :: Add Project {userId : ${userId}, error : ${err.message}}`,
    );

    await transaction.rollback();

    return res.status(500).send({
      err,
      desc: 'Could Not Create PROJECT',
    });
  }
}

async function deleteProject(settingsConfig, req, res, next) {
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

  const projectId = req.params.id;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const { projectName } = req.query;
  if (!projectName) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectName is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.userId = userId;
  inputs.projectName = projectName;
  inputs.operation = 'DELETE';

  logger.info(
    `[PROJECT-CONTROLLER] :: START :: Delete Project by Id {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    logger.info(
      `[PROJECT-CONTROLLER] :: Checking Project Deletion Permission for an User {userId : ${userId}, projectId : ${projectId}}`,
    );

    const hasPermission = await self.projectCrudService.checkUserPermission(
      inputs,
    );
    if (!hasPermission) {
      return res.status(403).send({
        err: 'NO_PROJECT_DELETE_PERMISSION',
        desc: 'Could Not Delete PROJECT',
      });
    }

    logger.info(
      `[PROJECT-CONTROLLER] :: User has Project Deletion Permission {userId : ${userId}, projectId : ${projectId}}`,
    );

    const project = await self.projectCrudService.deleteProject(inputs);

    logger.info(
      `[PROJECT-CONTROLLER] :: SUCCESS :: Delete Project by Id {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send({
      project,
    });
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[PROJECT-CONTROLLER] :: ERROR :: Delete Project by Id {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Could Not Delete PROJECT',
    });
  }
}

ProjectsController.prototype = {
  get,
  getProjectById,
  post,
  delete: deleteProject,
};

const projectsController = new ProjectsController();

module.exports = projectsController;
