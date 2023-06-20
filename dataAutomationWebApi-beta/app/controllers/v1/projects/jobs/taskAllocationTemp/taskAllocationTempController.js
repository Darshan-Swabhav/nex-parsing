/* eslint-disable global-require */
const errors = require('throw.js');
const { isEmpty, isObject, isString } = require('lodash');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const errorMessages = require('../../../../../config/error.config.json');

/**
 *
 *@openapi
 *
 * definitions:
 *   taskAllocationTempData:
 *    properties:
 *      id:
 *        type: string
 *      accountName:
 *        type: string
 *      accountWebsite:
 *        type: string
 *      accountDomain:
 *        type: string
 *      agentName:
 *        type: string
 *   getAllTaskAllocationTempDataResponse:
 *     properties:
 *       count:
 *        type: number
 *       rows:
 *        type: array
 *        items:
 *          $ref: '#/definitions/taskAllocationTempData'
 *
 * /projects/{projectId}/jobs/{jobId}/taskAllocationTemps:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAllTaskAllocationTempData
 *     tags:
 *       - Task Allocation Temp
 *     description: This is task allocation temp data list route which fetch the all task allocation temp data of taskAllocation job
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: projectId
 *         type: string
 *         description: project id
 *         required: true
 *       - in: path
 *         name: jobId
 *         type: string
 *         description: job id
 *         required: true
 *       - in: query
 *         name: pageNo
 *         type: integer
 *         description: The number of page
 *       - in: query
 *         name: pageSize
 *         type: integer
 *         description: The numbers of items to return
 *     responses:
 *       '200':
 *         description: returns the agent preview data
 *         schema:
 *            $ref: '#/definitions/getAllTaskAllocationTempDataResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /projects/{projectId}/jobs/{jobId}/taskAllocationTemps/{taskAllocationTempId}:
 *   delete:
 *     security:
 *        - auth0_jwk: []
 *     operationId: deleteTaskAllocationTempById
 *     tags:
 *       - Task Allocation Temp
 *     description: Route to delete taskAllocationTemp Data By Id
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: projectId
 *         type: string
 *         description: project id
 *         required: true
 *       - in: path
 *         name: jobId
 *         type: string
 *         description: job id
 *         required: true
 *       - in: path
 *         name: taskAllocationTempId
 *         type: string
 *         description: taskAllocationTemp Data id
 *         required: true
 *     responses:
 *       '200':
 *         description: delete operation success
 *       '400':
 *         description: bad Request, missing required parameters
 *       '500':
 *         description: Internal Error, Unexpected Server Error
 *   put:
 *     security:
 *        - auth0_jwk: []
 *     operationId: editTaskAllocationTempById
 *     tags:
 *       - Task Allocation Temp
 *     description: Route to edit taskAllocationTemp Data By Id
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: projectId
 *         type: string
 *         description: project id
 *         required: true
 *       - in: path
 *         name: jobId
 *         type: string
 *         description: job id
 *         required: true
 *       - in: path
 *         name: taskAllocationTempId
 *         type: string
 *         description: taskAllocationTemp Data id
 *         required: true
 *     responses:
 *       '200':
 *         description: edit operation success
 *       '400':
 *         description: bad Request, missing required parameters
 *       '500':
 *         description: Internal Error, Unexpected Server Error
 */

function TaskAllocationTempController() {
  const TaskAllocationTempService = require('../../../../../services/projects/jobs/taskAllocationTemp/taskAllocationTempService');
  const PaginationService = require('../../../../../services/helpers/paginationService');

  this.taskAllocationTempService = new TaskAllocationTempService();
  this.paginationService = new PaginationService();
}

async function get(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: This user does not have access to the route {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { projectId } = req.params;
  if (!projectId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Could not find projectId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const { jobId } = req.params;
  if (!jobId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Could not find jobId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  logger.info(
    `[TASK-ALLOCATION-TEMP-CONTROLLER] :: START :: Get All Temp Data of Task Allocation {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
  );

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = this.paginationService.paginate(pageNo, pageSize);

  const inputs = {
    projectId,
    jobId,
    limit: page.limit,
    offset: page.offset,
  };
  try {
    const result =
      await this.taskAllocationTempService.getAllTaskAllocationTempData(inputs);

    logger.info(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: SUCCESS :: Get All Temp Data of Task Allocation {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: ERROR :: Get All Temp Data of Task Allocation {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Could Not Get Task Allocation Temp Data',
    });
  }
}

async function deleteTaskAllocationTempDataById(
  settingsConfig,
  req,
  res,
  next,
) {
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: user does not have access to do delete operation on TaskAllocationTemp Data {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { projectId, jobId, taskAllocationTempId } = req.params;

  if (!projectId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Could not find projectId while deleting taskAllocationTemp Data by Id {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!jobId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Could not find jobId while deleting taskAllocationTemp Data by Id {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  if (!taskAllocationTempId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Could not find taskAllocationTempId while deleting taskAllocationTemp Data by Id {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'taskAllocationTempId is required',
    });
  }

  logger.info(
    `[TASK-ALLOCATION-TEMP-CONTROLLER] :: START :: Delete TaskAllocationTemp Data By Id {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
  );

  const inputs = {
    projectId,
    jobId,
    taskAllocationTempId,
  };
  try {
    await this.taskAllocationTempService.deleteTaskAllocationTempDataById(
      inputs,
    );

    logger.info(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: SUCCESS :: Delete TaskAllocationTemp Data By Id {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
    );

    return res.status(200).send();
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: ERROR :: Delete TaskAllocationTemp Data By Id {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Could Not Delete Task Allocation Temp Data',
    });
  }
}

async function editTaskAllocationTempDataById(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: user does not have access to do Edit TaskAllocationTemp Data {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { projectId, jobId, taskAllocationTempId } = req.params;

  if (!projectId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Could not find projectId while Editing taskAllocationTemp Data by Id {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!jobId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Could not find jobId while Editing taskAllocationTemp Data by Id {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'jobId is required',
    });
  }

  if (!taskAllocationTempId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Could not find taskAllocationTempId while Editing taskAllocationTemp Data by Id {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'taskAllocationTempId is required',
    });
  }

  const taskAllocationTempData = req.body;

  if (isEmpty(taskAllocationTempData)) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Empty taskAllocationTempData Found in Request Body {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'taskAllocationTemp Data is required',
    });
  }

  if (!isObject(taskAllocationTempData)) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: taskAllocationTempData incorrect format in Request Body {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'incorrect format of taskAllocationTemp data in request body',
    });
  }

  const { agentId, agentName } = taskAllocationTempData;

  if (!agentId) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Missing agentId in  taskAllocationTempData {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Missing agentId in taskAllocationTempData in request body',
    });
  }

  if (!agentName) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Missing agentName in  taskAllocationTempData {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Missing agentName in taskAllocationTempData in request body',
    });
  }

  if (!isString(agentId)) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Expected agentName to be an string but got '${typeof agentId}' {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'incorrect format of agentId in request body',
    });
  }

  if (!isString(agentName)) {
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: Expected agentName to be an string but got '${typeof agentId}' {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'incorrect format of agentName in request body',
    });
  }

  logger.info(
    `[TASK-ALLOCATION-TEMP-CONTROLLER] :: START :: Edit TaskAllocationTemp Data By Id {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
  );

  const inputs = {
    projectId,
    jobId,
    taskAllocationTempId,
    agentId,
    agentName,
    logger,
  };

  try {
    await this.taskAllocationTempService.editTaskAllocationTempDataById(inputs);

    logger.info(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: SUCCESS :: Edit TaskAllocationTemp Data By Id {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}}`,
    );

    return res.status(200).send();
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[TASK-ALLOCATION-TEMP-CONTROLLER] :: ERROR :: Edit TaskAllocationTemp Data By Id {userId : ${userId}, projectId : ${projectId}, jobId : ${jobId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Could Not Edit Task Allocation Temp Data',
    });
  }
}

TaskAllocationTempController.prototype = {
  get,
  delete: deleteTaskAllocationTempDataById,
  put: editTaskAllocationTempDataById,
};

const taskAllocationTempController = new TaskAllocationTempController();

module.exports = taskAllocationTempController;
