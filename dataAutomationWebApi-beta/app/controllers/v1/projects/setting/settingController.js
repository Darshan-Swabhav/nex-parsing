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
 * definitions:
 *   Projectsettings:
 *     properties:
 *        id:
 *         type: string
 *        target:
 *         type: object
 *        deliveryFileMapping:
 *         type: object
 *        contactsPerAccount:
 *         type: string
 *        clientPoc:
 *         type: string
 *        priority:
 *         type: string
 *        status:
 *         type: string
 *        createdAt:
 *         type: string
 *        updatedAt:
 *         type: string
 *        ProjectId:
 *         type: string
 *        createdBy:
 *         type: string
 *        updatedBy:
 *         type: string
 *
 *   ProjectsettingsPost:
 *     properties:
 *        id:
 *         type: string
 *        target:
 *         type: object
 *        contactsPerAccount:
 *         type: string
 *        clientPoc:
 *         type: string
 *        deliveryFileMapping:
 *         type: object
 *        priority:
 *         type: string
 *        status:
 *         type: string
 * /project/{project_id}/setting:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getProjectSettings
 *     tags:
 *      - PROJECTSetting
 *     description: Fetch PROJECT Setting
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: PROJECT Id
 *       required: true
 *     produces:
 *     - application/json
 *     responses:
 *       '200':
 *         description: OK, Successfully Fetched PROJECT Settings
 *         schema:
 *            $ref: '#/definitions/Projectsettings'
 *       '400':
 *         description: Bad Request, Missing Required Parameters in Request
 *       '401':
 *         description: Unauthorized, Missing Or Invalid Token
 *       '500':
 *         description: Internal Error, Unexpected Error
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: putProjectSetting
 *     tags:
 *      - PROJECTSetting
 *     description: Fetch PROJECT Setting
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: PROJECT Id
 *       required: true
 *     - in: body
 *       name: projectSettings
 *       schema:
 *         type: object
 *         properties:
 *          projectSetting:
 *            type: object
 *            properties:
 *              target:
 *               type: object
 *              contactsPerAccount:
 *               type: object
 *              clientPoc:
 *               type: string
 *              priority:
 *               type: string
 *              status:
 *               type: string
 *              users:
 *               type: object
 *              name:
 *               type: string
 *              clientId:
 *               type: string
 *              projectTypeId:
 *               type: string
 *              receivedDate:
 *               type: object
 *              dueDate:
 *               type: object
 *              deliveryFileMapping:
 *               type: object
 *              contactExpiry:
 *               type: string
 *     produces:
 *     - application/json
 *     responses:
 *       '200':
 *         description: OK, Successfully return updated project setting
 *         schema:
 *            $ref: '#/definitions/Projectsettings'
 *       '400':
 *         description: Bad Request, Missing Required Parameters in Request
 *       '401':
 *         description: Unauthorized, Missing Or Invalid Token
 *       '500':
 *         description: Internal Error, Unexpected Error
 *
 * /projects/{project_id}/editSettings:
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: editProjectSetting
 *     tags:
 *      - PROJECTSetting
 *     description: Edit PROJECT Setting
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: PROJECT Id
 *       required: true
 *     - in: body
 *       name: projectSettings
 *       schema:
 *         type: object
 *         properties:
 *          projectSetting:
 *            type: object
 *            properties:
 *              target:
 *               type: object
 *              contactsPerAccount:
 *               type: object
 *              clientPoc:
 *               type: string
 *              priority:
 *               type: string
 *              status:
 *               type: string
 *     produces:
 *     - application/json
 *     responses:
 *       '200':
 *         description: OK, Successfully return updated project setting
 *       '400':
 *         description: Bad Request, Missing Required Parameters in Request
 *       '401':
 *         description: Unauthorized, Missing Or Invalid Token
 *       '500':
 *         description: Internal Error, Unexpected Error
 */

function ProjectSettingController() {
  const ProjectCRUDService = require('../../../../services/projects/projectService');
  const ProjectTypeCRUDService = require('../../../../services/projects/types/typeService');
  const ProjectSettingCRUDService = require('../../../../services/projects/setting/settingService');
  const ProjectUserCRUDService = require('../../../../services/projects/user/userService');
  const ValidationService = require('../../../../services/helpers/validationService');

  this.projectCrudService = new ProjectCRUDService();
  this.projectSettingCrudService = new ProjectSettingCRUDService();
  this.projectTypeCrudService = new ProjectTypeCRUDService();
  this.validationService = new ValidationService();
  this.projectUserCrudService = new ProjectUserCRUDService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const { roles } = req.user;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.userRoles = roles;

  logger.info(
    `[PROJECT-SETTINGS-CONTROLLER] :: START :: Fetch Project Setting {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const projectSetting =
      await self.projectSettingCrudService.getProjectSetting(inputs);

    logger.info(
      `[PROJECT-SETTINGS-CONTROLLER] :: SUCCESS :: Fetch Project Setting {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(projectSetting);
  } catch (err) {
    logger.error(
      `[PROJECT-SETTINGS-CONTROLLER] :: ERROR :: Fetch Project Setting {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get PROJECT Setting',
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

  const { projectSetting } = req.body;

  if (!projectSetting) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in PROJECT setting object not Found',
    });
  }
  const { contactExpiry } = projectSetting;
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
    const validProjectSettingObj =
      self.validationService.removeNullKeysInObj(projectSetting);
    const inputs = {};
    inputs.userRoles = roles;
    inputs.name = validProjectSettingObj.name;
    inputs.projectTypeId = validProjectSettingObj.projectTypeId;

    if (!validProjectSettingObj.receivedDate) {
      inputs.receivedDate = null;
    } else {
      inputs.receivedDate = validProjectSettingObj.receivedDate;
    }

    if (!validProjectSettingObj.dueDate) {
      inputs.dueDate = null;
    } else {
      inputs.dueDate = validProjectSettingObj.dueDate;
    }

    inputs.aliasName = projectSetting.aliasName;
    inputs.description = projectSetting.description;
    inputs.clientId = validProjectSettingObj.clientId;
    inputs.target = validProjectSettingObj.target;
    inputs.contactsPerAccount = validProjectSettingObj.contactsPerAccount;
    inputs.clientPoc = validProjectSettingObj.clientPoc;
    inputs.priority = validProjectSettingObj.priority;
    inputs.status = validProjectSettingObj.status;
    inputs.updatedAt = new Date(Date.now());
    inputs.updatedBy = userId;
    inputs.projectId = projectId;
    inputs.templateId = validProjectSettingObj.templateId;
    inputs.users = validProjectSettingObj.users;
    inputs.contactExpiry = contactExpiry;

    if (inputs.status) {
      const statusList = await self.projectSettingCrudService.getStatusEnums();
      const statusIndex = _.indexOf(statusList, validProjectSettingObj.status);

      if (statusIndex < 0) {
        return res.status(400).send({
          err: 'Bad Request',
          desc: 'Invalid value of status',
        });
      }
    }
    if (inputs.priority) {
      const priorityList =
        await self.projectSettingCrudService.getPriorityEnums();
      const priorityIndex = _.indexOf(
        priorityList,
        validProjectSettingObj.priority,
      );

      if (priorityIndex < 0) {
        return res.status(400).send({
          err: 'Bad Request',
          desc: 'Invalid value of priority',
        });
      }
    }

    logger.info(
      `[PROJECT-SETTINGS-CONTROLLER] :: START :: Update Project Setting {userId : ${userId}, projectId : ${projectId}}`,
    );
    // Note: In case of failure delete all created entries
    const project = await self.projectCrudService.editProject(inputs);
    const projectSettings =
      await self.projectSettingCrudService.editProjectSetting(inputs);
    const userCreatedArray = {};
    if (inputs.users) {
      const typesOfUsers = Object.keys(inputs.users);
      await self.projectUserCrudService.deleteProjectUser(inputs);
      for (let i = 0; i < typesOfUsers.length; i += 1) {
        const userTypeValue = typesOfUsers[i];
        userCreatedArray[userTypeValue] = [];
        const array = inputs.users[userTypeValue] || [];
        for (let index = 0; index < array.length; index += 1) {
          const element = array[index];
          element.createdAt = new Date(Date.now());
          element.createdBy = userId;
          element.projectUserId = element.id;
          element.userLevel = userTypeValue;
          element.projectId = projectId;
          element.userRoles = roles;

          const projectUserCreated =
            // eslint-disable-next-line no-await-in-loop
            await self.projectUserCrudService.createProjectUser(element);
          if (projectUserCreated) {
            userCreatedArray[userTypeValue].push(projectUserCreated);
          }
        }
      }
    }

    logger.info(
      `[PROJECT-SETTINGS-CONTROLLER] :: SUCCESS :: Update Project Setting {userId : ${userId}, projectId : ${projectId}}`,
    );

    const projectDetail = {};
    projectDetail.project = project;
    projectDetail.projectSetting = projectSettings;
    projectDetail.userCreatedArray = userCreatedArray;

    return res.status(200).send(projectDetail);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[PROJECT-SETTINGS-CONTROLLER] :: ERROR :: Update Project Setting {userId : ${userId}, projectId : ${projectId}, error: ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Could Not Update PROJECT Setting',
    });
  }
}

async function getStatus(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  logger.info(
    `[PROJECT-SETTINGS-CONTROLLER] :: START :: Fetch Status {userId : ${userId}`,
  );

  try {
    const status = await self.projectSettingCrudService.getStatusEnums();

    if (status) {
      logger.info(
        `[PROJECT-SETTINGS-CONTROLLER] :: SUCCESS :: Fetch Status {userId : ${userId}`,
      );

      return res.status(200).send({
        status,
      });
    }

    return res.status(204).send({
      err: 'No Content',
      desc: 'There is no values set for status',
    });
  } catch (err) {
    logger.error(
      `[PROJECT-SETTINGS-CONTROLLER] :: ERROR :: Fetch Status {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(400).send({
      err,
      desc: 'Could Not Fetch PROJECT Status',
    });
  }
}

async function getPriority(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  logger.info(
    `[PROJECT-SETTINGS-CONTROLLER] :: START :: Fetch Priority {userId : ${userId}`,
  );

  try {
    const priority = await self.projectSettingCrudService.getPriorityEnums();
    if (priority) {
      logger.info(
        `[PROJECT-SETTINGS-CONTROLLER] :: SUCCESS :: Fetch Priority {userId : ${userId}`,
      );

      return res.status(200).send({
        priority,
      });
    }

    return res.status(204).send({
      err: 'No Content',
      desc: 'There is no values set for getPriority',
    });
  } catch (err) {
    logger.error(
      `[PROJECT-SETTINGS-CONTROLLER] :: ERROR :: Fetch Priority {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(400).send({
      err,
      desc: 'Could Not Fetch PROJECT priority',
    });
  }
}

async function editSettings(settingsConfig, req, res, next) {
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

  const { projectSetting } = req.body;

  if (!projectSetting) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Body in PROJECT setting object not Found',
    });
  }

  const validProjectSettingObj =
    self.validationService.removeNullKeysInObj(projectSetting);
  const missingKeys = self.validationService.validateObj(
    validProjectSettingObj,
    ['target'],
  );

  if (!_.isEmpty(missingKeys)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${missingKeys.join(', ')} is required`,
    });
  }

  const inputs = {};
  inputs.target = validProjectSettingObj.target;
  inputs.contactsPerAccount = validProjectSettingObj.contactsPerAccount;
  inputs.clientPoc = validProjectSettingObj.clientPoc;
  inputs.priority = validProjectSettingObj.priority;
  inputs.status = validProjectSettingObj.status;
  inputs.updatedAt = new Date();
  inputs.updatedBy = userId;
  inputs.projectId = projectId;

  logger.info(
    `[PROJECT-SETTINGS-CONTROLLER] :: START :: Update Project Setting {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    // Note: In case of failure delete all created entries
    await self.projectSettingCrudService.editProjectSetting(inputs);

    logger.info(
      `[PROJECT-SETTINGS-CONTROLLER] :: SUCCESS :: Update Project Setting {userId : ${userId}, projectId : ${projectId}}`,
    );

    const projectDetail = {};
    projectDetail.projectSetting = projectSetting;
    return res.status(200).send(projectDetail);
  } catch (err) {
    logger.error(
      `[PROJECT-SETTINGS-CONTROLLER] :: ERROR :: Update Project Setting {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(400).send({
      err,
      desc: 'Could Not Update PROJECT Setting',
    });
  }
}

ProjectSettingController.prototype = {
  get,
  put,
  getStatus,
  getPriority,
  editSettings,
};

const projectSettingController = new ProjectSettingController();

module.exports = projectSettingController;
