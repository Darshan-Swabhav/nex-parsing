const { TaskAllocationTemp } = require('@nexsalesdev/dataautomation-datamodel');
const { serializeError } = require('serialize-error');

function TaskAllocationTempService() {}

async function getAllTaskAllocationTempData(inputs) {
  const { projectId, jobId, limit, offset } = inputs;
  const result = await TaskAllocationTemp.findAndCountAll({
    attributes: [
      'id',
      'accountName',
      'accountWebsite',
      'accountDomain',
      'agentName',
    ],
    where: {
      projectId,
      jobId,
    },
    limit,
    offset,
    raw: true,
  });
  return result;
}

async function deleteTaskAllocationTempDataById(inputs) {
  const { projectId, jobId, taskAllocationTempId } = inputs;
  const result = await TaskAllocationTemp.destroy({
    where: {
      id: taskAllocationTempId,
      projectId,
      jobId,
    },
  });
  return result;
}

async function editTaskAllocationTempDataById(inputs) {
  const { projectId, jobId, taskAllocationTempId, agentId, agentName, logger } =
    inputs;

  const taskAllocationTempInstance = await TaskAllocationTemp.findOne({
    where: { id: taskAllocationTempId, jobId, projectId },
  });

  if (taskAllocationTempInstance == null) {
    const error = new Error();
    error.message = `Could Not Find TaskAllocationTemp Record With ID ${taskAllocationTempId}`;
    error.code = `BAD_TASK_ALLOCATION_TEMP_ID`;
    const serializedError = serializeError(error);
    logger.error(
      `[UPDATE_TASK_ALLOCATION_TEMP_DATA] :: ERROR : TaskAllocationTemp Reference Dose Not Exist :  ${JSON.stringify(
        serializedError,
      )}`,
    );
    throw error;
  }

  // UPDATE AGENT DETAILS
  taskAllocationTempInstance.agentId = agentId;
  taskAllocationTempInstance.agentName = agentName;

  taskAllocationTempInstance.save();
}

TaskAllocationTempService.prototype = {
  getAllTaskAllocationTempData,
  deleteTaskAllocationTempDataById,
  editTaskAllocationTempDataById,
};

module.exports = TaskAllocationTempService;
