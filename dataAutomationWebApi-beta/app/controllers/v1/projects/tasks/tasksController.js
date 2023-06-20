/* eslint-disable global-require */
const { isEmpty, cloneDeep } = require('lodash');
const { serializeError } = require('serialize-error');
const errors = require('throw.js');
const generateUUID = require('uuidv4');
const { Transform } = require('stream');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');

const MAX_FILE_SIZE = 100;
const JOB_STATUS = {
  QUEUED: 'Queued',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

/**
 *@openapi
 * definitions:
 *   managerTask:
 *     properties:
 *       accountName:
 *        type: string
 *       website:
 *        type: string
 *       userName:
 *        type: string
 *       status:
 *        type: string
 *       priority:
 *        type: string
 *       accountDisposition:
 *        type: string
 *       contactDisposition:
 *        type: string
 *       accountFinalDisposition:
 *        type: string
 *       contactEmail:
 *        type: string
 *       activity:
 *        type: string
 *       potential:
 *        type: number
 *       taskCreatedDate:
 *        type: string
 *
 *   agentTask:
 *     properties:
 *       id:
 *        type: string
 *       description:
 *        type: string
 *       dueDate:
 *        type: string
 *       status:
 *        type: string
 *       priority:
 *        type: string
 *       completedDate:
 *        type: string
 *       TaskType:
 *        properties:
 *          id:
 *            type: string
 *          type:
 *            type: string
 *       Accounts:
 *        type: array
 *        items:
 *          $ref: '#/definitions/taskAccount'
 *       Contacts:
 *        type: array
 *        items:
 *          $ref: '#/definitions/taskContact'
 *       User:
 *        properties:
 *          id:
 *            type: string
 *          firstName:
 *            type: string
 *          lastName:
 *            type: string
 *          userName:
 *            type: string
 *
 *   taskAccount:
 *     properties:
 *       id:
 *        type: string
 *       name:
 *        type: string
 *
 *   taskContact:
 *     properties:
 *       id:
 *        type: string
 *       firstName:
 *        type: string
 *       middleName:
 *        type: string
 *       lastName:
 *        type: string
 *
 *   taskStats:
 *     properties:
 *       status:
 *        type: string
 *       count:
 *        type: number
 *
 *   managerTaskListResponse:
 *     description: "If the user is an manager then the object of this structure is sent in response"
 *     properties:
 *       totalCount:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *         description: total number of tasks
 *       docs:
 *         type: array
 *         items:
 *           $ref: '#/definitions/managerTask'
 *
 *   agentTaskList:
 *     description: If the user is an agent then the object of this structure is sent in response
 *     properties:
 *       totalCount:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *         description: total number of tasks
 *       docs:
 *         type: array
 *         items:
 *           $ref: '#/definitions/agentTask'
 *
 *   taskListResponse:
 *     properties:
 *       agent:
 *         $ref: '#/definitions/agentTaskList'
 *       manager:
 *         $ref: '#/definitions/managerTaskListResponse'
 *
 *   taskFacetResponse:
 *     properties:
 *       disposition:
 *        type: array
 *
 * /projects/{projectId}/tasks:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTasks
 *     tags:
 *       - Tasks
 *     description: This is task list route which fetch the task list
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: string
 *       description: project id
 *       required: true
 *     - in: query
 *       name: pageNo
 *       type: integer
 *       description: page number
 *     - in: query
 *       name: pageSize
 *       type: integer
 *       description: page sizes
 *     - in: query
 *       name: download
 *       type: boolean
 *       description: for download file
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the tasks list array for that given list
 *         schema:
 *            $ref: '#/definitions/taskListResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: assignTasks
 *     tags:
 *       - Tasks
 *     description: This is tasks create route which add job for tasks create
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: string
 *       description: Project Id
 *       required: true
 *     - in: query
 *       name: filter
 *       type: string
 *       description: Create an object of the column on which the filter is to be applied and send it by stringify
 *     - in: query
 *       name: sort
 *       type: string
 *       description: Create an object of the column on which the sort is to be applied and send it by stringify
 *     - in: body
 *       name: tasksAssignData
 *       schema:
 *         type: object
 *         properties:
 *           taskAllocationStrategy:
 *             type: string
 *           blockSize:
 *             type: integer
 *           allocationOf:
 *             type: string
 *           agents:
 *             type: array
 *             items:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: if task assign job add successfully then Return 200 with a Success Message
 *       '403':
 *         description: If user does not have access to this route then send error
 *       '400':
 *         description: if required parameters not passes or parameters value is incorrect then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /projects/{projectId}/tasks/{id}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTaskById
 *     tags:
 *       - Tasks
 *     description: This is get task route which fetch the task by taskId
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: string
 *       description: Project Id
 *       required: true
 *     - in: path
 *       name: id
 *       type: string
 *       description: Task Id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the task Object
 *         schema:
 *           type: object
 *           items:
 *             $ref: '#/definitions/agentTask'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /taskStats:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAgentTaskStatsForAgents
 *     tags:
 *       - Tasks
 *     description: This is task stats route which fetch the task stats for agents
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the tasks list array for that given list
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/taskStats'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /api/v1/projects/{projectId}/tasks/stats:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAllTaskStatsOfAProject
 *     tags:
 *       - Tasks
 *     description: This is task stats route which fetch the task stats of a project
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: string
 *       description: Project Id
 *       required: true
 *     - in: query
 *       name: filter
 *       type: string
 *       description: Create an object of the column on which the filter is to be applied and send it by stringify
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the tasks list array for that given list
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/taskStats'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /tasks/tasksLiveCounts:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTasksLiveCounts
 *     tags:
 *       - Tasks
 *     description: This is task live counts route which fetch the task live counts of contacts and accounts of an agents
 *     parameters:
 *     - in: query
 *       name: projectId
 *       type: string
 *       description: Project Id
 *       required: true
 *     - in: query
 *       name: countsToCalculate
 *       type: array
 *       items:
 *         type: string
 *       description: Counts To calculate for
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the object of counts of contacts and accounts of an agent
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /project/{projectId}/tasks/facets:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getTaskUniqueFields
 *     tags:
 *       - Tasks Unique fields
 *     description: This is task facet route which fetch the unique value for given field
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: integer
 *       description: project id
 *       required: true
 *     - in: query
 *       name: field
 *       type: string
 *       required: false
 *     - in: query
 *       name: type
 *       type: string
 *       required: false
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the unique list of chosen task field
 *         schema:
 *            $ref: '#/definitions/taskFacetResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function TaskController() {
  const TaskCRUDService = require('../../../../services/projects/tasks/tasksService');
  const PaginationService = require('../../../../services/helpers/paginationService');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  this.taskCRUDService = new TaskCRUDService();
  this.paginationService = new PaginationService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

function getWriteStream() {
  const writableStream = new Transform({
    transform: (chunk, encoding, callback) => {
      callback(null, chunk);
    },
    flush: (callback) => {
      callback();
    },
  }).on('error', (error) => {
    console.log(`Could not Create a Write Stream {Error: ${error}}`);
    throw error;
  });

  return writableStream;
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
    logger.error(
      `[TASK-CONTROLLER] :: Could not find projectId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const download = req.query.download || false;

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const countOnly = req.query.countOnly || false;
  const page = self.paginationService.paginate(pageNo, pageSize);
  let isAsyncDownload = req.query.async || false;

  const inputs = {};
  let filter = req.query.filter || '{}';
  let sort = req.query.sort || '{}';
  inputs.projectId = projectId;
  inputs.userId = userId;
  inputs.limit = page.limit;
  inputs.offset = page.offset;
  inputs.countOnly = countOnly;
  inputs.requestId = generateUUID.uuid().slice(0, 4);

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      logger.error(
        `[TASK-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${error}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }
  let filterColumns = {};
  if (download && roles.indexOf(USER_ROLES.MANAGER) !== -1) {
    filterColumns = {
      updatedAt: { type: 'array', operator: ['between'] },
      contactStage: { type: 'string', operator: ['='] },
      contactComplianceStatus: { type: 'string', operator: ['='] },
      accountName: { type: 'string', operator: ['=', 'isNull'] },
      contactEmail: { type: 'string', operator: ['=', 'isNull'] },
      userName: { type: 'array', operator: ['='] },
      status: { type: 'string', operator: ['='] },
      accountDisposition: { type: 'array', operator: ['=', 'isNull'] },
      contactDisposition: { type: 'array', operator: ['=', 'isNull'] },
      accountFinalDisposition: { type: 'array', operator: ['=', 'isNull'] },
      potential: { type: 'string', operator: ['=', '<', '>'] },
      priority: { type: 'string', operator: ['='] },
      dueDate: { type: 'string', operator: ['<', '>='] },
      taskCreatedDate: { type: 'array', operator: ['between'] },
      taskUpdatedDate: { type: 'array', operator: ['between'] },
    };
  } else if (roles.indexOf(USER_ROLES.MANAGER) !== -1) {
    filterColumns = {
      accountName: { type: 'string', operator: ['=', 'isNull'] },
      contactEmail: { type: 'string', operator: ['=', 'isNull'] },
      userName: { type: 'array', operator: ['='] },
      status: { type: 'string', operator: ['='] },
      accountDisposition: { type: 'array', operator: ['=', 'isNull'] },
      contactDisposition: { type: 'array', operator: ['=', 'isNull'] },
      accountFinalDisposition: { type: 'array', operator: ['=', 'isNull'] },
      potential: { type: 'string', operator: ['=', '<', '>'] },
      priority: { type: 'string', operator: ['='] },
      dueDate: { type: 'string', operator: ['<', '>='] },
      taskCreatedDate: { type: 'array', operator: ['between'] },
      taskUpdatedDate: { type: 'array', operator: ['between'] },
    };
  }
  if (!isEmpty(filterColumns)) {
    try {
      self.filterHandler.validate(filterColumns, filter);
    } catch (error) {
      logger.error(
        `[TASK-CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${error.message}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: error.message,
      });
    }
  }

  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      logger.error(
        `[TASK-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${error}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The sort value type is not an object',
      });
    }
  }
  if (!download && roles.indexOf(USER_ROLES.MANAGER) !== -1) {
    const sortableColumns = [
      'accountName',
      'userName',
      'status',
      'accountDisposition',
      'contactDisposition',
      'accountFinalDisposition',
      'contactEmail',
      'potential',
      'priority',
    ];
    const multipleSort = true;
    try {
      self.sortHandler.validate(sortableColumns, sort, multipleSort);
    } catch (error) {
      logger.error(
        `[TASK-CONTROLLER] :: The value of sort is not correct {userId : ${userId}, error: ${error.message}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: error.message,
      });
    }
  }

  logger.info(
    `[TASK-CONTROLLER] : ${inputs.requestId} : START :: Fetch all Tasks of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  const downloadInputs = {};
  try {
    if (download && roles.indexOf(USER_ROLES.MANAGER) !== -1) {
      downloadInputs.fileId = generateUUID.uuid();
      downloadInputs.jobId = generateUUID.uuid();
      downloadInputs.projectId = projectId;
      downloadInputs.userId = userId;
      logger.info(
        `[TASK-CONTROLLER] :: TaskDownload Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );

      isAsyncDownload = isAsyncDownload
        ? true
        : await self.taskCRUDService.getFileIsLarger(
            projectId,
            filter,
            MAX_FILE_SIZE,
          );

      if (isAsyncDownload) {
        logger.info(
          '[TASK-CONTROLLER] :: Async TaskDownload Job Creation Started',
        );
        const result = await self.taskCRUDService.downloadAllTask(
          downloadInputs,
          filter,
          null,
          isAsyncDownload,
        );
        logger.info(
          `[TASK-CONTROLLER] :: Async TaskDownload Job Creation Success, ${JSON.stringify(
            result,
          )}`,
        );
        return res.status(200).send('Job Submitted Successfully');
      }
      const writableStream = getWriteStream();

      writableStream.on('finish', async () => {
        console.log('writableStream FINISH');
        await self.taskCRUDService.updateJobStatus(
          downloadInputs.jobId,
          JOB_STATUS.COMPLETED,
        );
        writableStream.destroy();
      });
      writableStream.on('close', () => {
        console.log('WritableStream Closed');
      });

      res.setHeader('Content-type', 'application/csv');
      writableStream.pipe(res);
      return self.taskCRUDService.downloadAllTask(
        downloadInputs,
        filter,
        writableStream,
        isAsyncDownload,
      );
    }
  } catch (error) {
    logger.error(
      `[TASK-CONTROLLER] :: ERROR :: Could Not Download Task {userId : ${userId}, projectId : ${projectId}, error : ${error}}`,
    );
    await self.taskCRUDService.updateJobStatus(
      downloadInputs.jobId,
      JOB_STATUS.FAILED,
    );

    return res.status(500).send({
      error: error.message,
      desc: 'Could Not Download Task',
    });
  }
  try {
    if (roles.indexOf(USER_ROLES.MANAGER) !== -1) {
      const taskList = await self.taskCRUDService.getAllTaskForManager(
        inputs,
        filter,
        sort,
      );
      logger.info(
        `[TASK-CONTROLLER] :: SUCCESS :: Fetch all Tasks of Project {userId : ${userId}, projectId : ${projectId}}`,
      );
      return res.status(200).send(taskList);
    }
    if (roles.indexOf(USER_ROLES.AGENT) !== -1) {
      const taskList = await self.taskCRUDService.getAllTaskForAgent(
        inputs,
        filter,
        sort,
      );
      logger.info(
        `[TASK-CONTROLLER] :: SUCCESS :: Fetch all Tasks of Project {userId : ${userId}, projectId : ${projectId}}`,
      );
      return res.status(200).send(taskList);
    }
    return res.status(403).send({
      err: 'Forbidden Error',
      desc: 'User not access this route',
    });
  } catch (err) {
    logger.error(
      `[TASK-CONTROLLER] :: ERROR :: Fetch all Tasks of Project {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err: err.message,
      desc: 'Could Not Get Tasks',
    });
  }
}

async function post(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[TASK-CONTROLLER] :: This user does not have access to the route {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { projectId } = req.params;
  if (!projectId) {
    logger.error(
      `[TASK-CONTROLLER] :: Could not find projectId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const tasksAssignData = req.body;

  let filter = req.query.filter || '{}';
  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[TASK-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  let sort = req.query.sort || '{}';
  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[TASK-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The sort value type is not an object',
      });
    }
  }

  try {
    this.taskCRUDService.validateTasksAssignData(tasksAssignData, filter, sort);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[TASK-CONTROLLER] :: The value of data is not correct {userId : ${userId}, error: ${JSON.stringify(
        error,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: error.message,
    });
  }

  logger.info(
    `[TASK-CONTROLLER] :: START :: Create Tasks {userId : ${userId}}`,
  );

  const inputs = cloneDeep(tasksAssignData);
  inputs.projectId = projectId;
  inputs.userId = userId;
  inputs.filter = cloneDeep(filter);
  inputs.sort = cloneDeep(sort);
  try {
    const result = await this.taskCRUDService.tasksAssign(inputs);

    logger.info(
      `[TASK-CONTROLLER] :: SUCCESS :: Create Tasks {userId : ${userId}}`,
    );

    return res.status(200).send(result);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[TASK-CONTROLLER] :: ERROR :: Create Tasks {userId : ${userId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Could Not Create Tasks',
    });
  }
}

async function getTaskById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const taskId = req.params.id;
  const { projectId } = req.params;
  const { roles } = req.user;

  if (!taskId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `TaskId is Required`,
    });
  }

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  logger.info(
    `[TASK-CONTROLLER] :: START :: Fetch Task By Id { taskId: ${taskId}, ProjectId: ${projectId}, userId : ${userId} }`,
  );

  const inputs = {};

  inputs.userId = userId;
  inputs.taskId = taskId;
  inputs.projectId = projectId;

  try {
    let task;
    if (roles.indexOf(USER_ROLES.MANAGER) !== -1) {
      task = await self.taskCRUDService.getTaskByIdForManager(inputs);
    } else if (roles.indexOf(USER_ROLES.AGENT) !== -1) {
      task = await self.taskCRUDService.getTaskByIdForAgent(inputs);
    } else {
      return res.status(403).send({
        err: 'Forbidden Error',
        desc: 'User not access this route',
      });
    }

    logger.info(
      `[TASK-CONTROLLER] :: SUCCESS :: Fetch Task By Id  { taskId: ${taskId}, ProjectId: ${projectId}, userId : ${userId} }`,
    );

    return res.status(200).send(task);
  } catch (err) {
    logger.error(
      `[TASK-CONTROLLER] :: ERROR :: Fetch Task By Id  { taskId: ${taskId}, ProjectId: ${projectId}, userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Task',
    });
  }
}

async function getTaskStats(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.userId = userId;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  logger.info(
    `[TASK-CONTROLLER] :: START :: Fetch all Tasks Stats of Project {userId : ${userId}}`,
  );

  try {
    let taskStats;

    if (roles.indexOf(USER_ROLES.AGENT) !== -1) {
      taskStats = await self.taskCRUDService.getTaskStatsProjectWise(inputs);
    } else {
      return res.status(403).send({
        err: 'Forbidden Error',
        desc: 'User not access this route',
      });
    }
    logger.info(
      `[TASK-CONTROLLER] :: SUCCESS :: Fetch all Tasks Stats of Project {userId : ${userId}}`,
    );

    return res.status(200).send(taskStats);
  } catch (err) {
    logger.error(
      `[TASK-CONTROLLER] :: ERROR :: Fetch all Tasks Stats of Project {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Tasks Stats',
    });
  }
}

async function getTasksLiveCounts(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  const { projectId } = req.query;
  const { accountId } = req.query;
  const { countsToCalculate } = req.query;
  let filter = req.query.filter || {};

  // filter can be a stringified Array, JSON.parse will convert it back to Object
  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      logger.error(
        `[TASK-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}}`,
      );
    }
  }

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (
    !Array.isArray(countsToCalculate) ||
    (Array.isArray(countsToCalculate) && !countsToCalculate.length)
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'countsToCalculate is required',
    });
  }

  const inputs = {};
  inputs.userId = userId;
  inputs.projectId = projectId;
  inputs.accountId = accountId;
  inputs.countsToCalculate = countsToCalculate;

  logger.info(
    `[TASK-CONTROLLER] :: START :: Fetch all Tasks Live Counts of Project {userId : ${userId}}`,
  );

  try {
    let tasksLiveCounts;

    if (roles.indexOf(USER_ROLES.AGENT) !== -1) {
      tasksLiveCounts = await self.taskCRUDService.getTasksLiveCounts(
        inputs,
        filter,
      );
    } else {
      return res.status(403).send({
        err: 'Forbidden Error',
        desc: 'User not access this route',
      });
    }
    logger.info(
      `[TASK-CONTROLLER] :: SUCCESS :: Fetch all Tasks Live Counts of Project {userId : ${userId}}`,
    );

    return res.status(200).send(tasksLiveCounts);
  } catch (err) {
    logger.error(
      `[TASK-CONTROLLER] :: ERROR :: Fetch all Tasks Live Counts of Project {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Tasks Live Counts',
    });
  }
}

async function getAllTaskStatsOfAProject(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[TASK-CONTROLLER] :: This user does not have access to the route {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
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

  const inputs = {};
  inputs.projectId = projectId;

  let filter = req.query.filter || '{}';

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const filterParseError = serializeError(error);
      logger.error(
        `[TASK-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          filterParseError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  let filterColumns = {};
  if (roles.indexOf(USER_ROLES.MANAGER) !== -1) {
    filterColumns = {
      accountName: { type: 'string', operator: ['=', 'isNull'] },
      contactEmail: { type: 'string', operator: ['=', 'isNull'] },
      userName: { type: 'array', operator: ['='] },
      status: { type: 'string', operator: ['='] },
      accountDisposition: { type: 'array', operator: ['=', 'isNull'] },
      contactDisposition: { type: 'array', operator: ['=', 'isNull'] },
      accountFinalDisposition: { type: 'array', operator: ['=', 'isNull'] },
      potential: { type: 'string', operator: ['=', '<', '>'] },
      priority: { type: 'string', operator: ['='] },
      dueDate: { type: 'string', operator: ['<', '>='] },
      taskCreatedDate: { type: 'array', operator: ['between'] },
      taskUpdatedDate: { type: 'array', operator: ['between'] },
    };
  }
  try {
    self.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const filterValidateError = serializeError(error);
    logger.error(
      `[TASK-CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        filterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: filterValidateError.message,
    });
  }

  logger.info(
    `[TASK-CONTROLLER] :: START :: Fetch all Task Stats of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const taskStats = await self.taskCRUDService.getAllTaskStatsOfAProject(
      inputs,
      filter,
    );
    logger.info(
      `[TASK-CONTROLLER] :: SUCCESS :: Fetch all Task Stats of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(taskStats);
  } catch (err) {
    const taskStatsError = serializeError(err);
    logger.error(
      `[TASK-CONTROLLER] :: ERROR :: Fetch all Task Stats of Project {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        taskStatsError,
      )}}`,
    );

    return res.status(500).send({
      err: taskStatsError.message,
      desc: 'Could Not Get Task Stats',
    });
  }
}

async function getTaskUniqueFields(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  const { field } = req.query;
  if (!projectId) {
    logger.error(
      `[TASK-CONTROLLER] :: Could not find projectId {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!field) {
    logger.error(
      `[TASK-CONTROLLER] :: Could not find field {userId : ${userId}}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'field is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  if (req.query.type) {
    inputs.fieldType = req.query.type;
  }

  logger.info(
    `[TASK-CONTROLLER] : ${inputs.requestId} : START :: Fetch all Tasks of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  let result;
  try {
    switch (field) {
      case 'disposition':
        result = await self.taskCRUDService.getTaskDispositions(inputs);
        logger.info(
          `[TASK-CONTROLLER] :: SUCCESS :: Fetch all Tasks Disposition for Project {userId : ${userId}, projectId : ${projectId}}`,
        );
        break;
      case 'userName':
        result = await self.taskCRUDService.getTaskUsers(inputs);
        logger.info(
          `[TASK-CONTROLLER] :: SUCCESS :: Fetch all Tasks Users for Project {userId : ${userId}, projectId : ${projectId}}`,
        );
        break;
      default:
        break;
    }
    return res.status(200).send(result);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[TASK-CONTROLLER] :: ERROR :: Fetch all Tasks Disposition for Project {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Tasks Facets',
    });
  }
}

TaskController.prototype = {
  get,
  post,
  getTaskById,
  getTaskStats,
  getTasksLiveCounts,
  getAllTaskStatsOfAProject,
  getTaskUniqueFields,
};

const taskController = new TaskController();

module.exports = taskController;
