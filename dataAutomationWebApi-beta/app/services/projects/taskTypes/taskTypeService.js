const { TaskType } = require('@nexsalesdev/dataautomation-datamodel');
const { ProjectType } = require('@nexsalesdev/dataautomation-datamodel');
const { Project } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../../config/settings/settings-config');

function TaskTypeCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAllTaskType() {
  const result = await TaskType.findAll({
    attributes: ['id', 'type'],
  });

  return result;
}

async function getTaskTypeOfAProject(inputs) {
  const { projectId } = inputs;

  const result = await TaskType.findOne({
    attributes: ['id'],
    include: [
      {
        model: ProjectType,
        attributes: [],
        required: true,
        include: [
          {
            model: Project,
            attributes: [],
            required: true,
            where: [
              {
                id: projectId,
              },
            ],
          },
        ],
      },
    ],
  });

  return result;
}

TaskTypeCRUDService.prototype = {
  getAllTaskType,
  getTaskTypeOfAProject,
};

module.exports = TaskTypeCRUDService;
