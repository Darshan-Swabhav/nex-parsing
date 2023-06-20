/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../../config/error.config.json');

/**
 * @openapi
 *
 * definitions:
 *   taskType:
 *     properties:
 *       id:
 *        type: string
 *        description: task type id
 *       type:
 *        type: string
 *        description: task type name
 *
 *   taskTypeOfAProject:
 *     properties:
 *       id:
 *        type: string
 *        description: task type id
 *
 * /projects/taskTypes:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTaskTypes
 *     tags:
 *       - TASK Type
 *     description: This is task type list route which fetch the all the task type
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the task type array
 *         schema:
 *            $ref: '#/definitions/taskType'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/taskType:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTaskTypeOfAProject
 *     tags:
 *       - TASK Type
 *     description: This is task type route which fetch the the task type of a project
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
 *         description: returns the task type id
 *         schema:
 *            $ref: '#/definitions/taskTypeOfAProject'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */
function TaskTypeController() {
  const TaskTypeCRUDService = require('../../../../services/projects/taskTypes/taskTypeService');

  this.taskTypeCrudService = new TaskTypeCRUDService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  logger.info(
    `[TASK-TYPE-CONTROLLER] :: START ::Fetch All Task Type {userId : ${userId}}`,
  );

  try {
    const taskType = await self.taskTypeCrudService.getAllTaskType();

    logger.info(
      `[TASK-TYPE-CONTROLLER] :: SUCCESS :: Fetch All Task Type {userId : ${userId}`,
    );

    return res.status(200).send(taskType);
  } catch (err) {
    logger.error(
      `[TASK-TYPE-CONTROLLER] :: ERROR :: Fetch All Task Type {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get TaskType',
    });
  }
}

async function getTaskTypeOfAProject(settingsConfig, req, res, next) {
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
    `[TASK-TYPE-CONTROLLER] :: START ::Fetch Task Type Of A Project {userId : ${userId}}`,
  );

  try {
    const taskType = await self.taskTypeCrudService.getTaskTypeOfAProject(
      inputs,
    );

    logger.info(
      `[TASK-TYPE-CONTROLLER] :: SUCCESS :: Fetch Task Type Of A Project {userId : ${userId}`,
    );

    return res.status(200).send(taskType);
  } catch (err) {
    logger.error(
      `[TASK-TYPE-CONTROLLER] :: ERROR :: Fetch Task Type Of A Project {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get TaskType',
    });
  }
}

TaskTypeController.prototype = {
  get,
  getTaskTypeOfAProject,
};

const projectTypeController = new TaskTypeController();

module.exports = projectTypeController;
