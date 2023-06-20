const { Sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const { ProjectSpec } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;

function ProjectSpecCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAllProjectSpec(inputs) {
  const { projectId } = inputs;
  const { limit } = inputs;
  const { offset } = inputs;

  const result = await ProjectSpec.findAll({
    where: [
      {
        ProjectId: projectId,
      },
    ],
    limit,
    offset,
  });

  return result;
}

async function getProjectSpec(inputs) {
  const { projectId } = inputs;
  const { projectSpecId } = inputs;

  const result = await ProjectSpec.findOne({
    where: {
      [Op.and]: [
        {
          id: projectSpecId,
        },
        {
          ProjectId: projectId,
        },
      ],
    },
  });

  return result;
}

async function addProjectSpec(inputs) {
  const { projectSpecId } = inputs;
  const { projectId } = inputs;
  const { name } = inputs;
  const { values } = inputs;
  const { comments } = inputs;
  const { createdAt } = inputs;
  const updatedAt = inputs.updatedAt || inputs.createdAt;
  const { createdBy } = inputs;
  const updatedBy = inputs.updatedBy || inputs.createdBy;

  const result = await ProjectSpec.create({
    id: projectSpecId,
    ProjectId: projectId,
    name,
    values,
    comments,
    createdAt,
    updatedAt,
    createdBy,
    updatedBy,
  });

  return result;
}

async function editProjectSpec(inputs) {
  const { projectSpecId } = inputs;
  const { projectId } = inputs;
  const { name } = inputs;
  const { values } = inputs;
  const { comments } = inputs;
  const { updatedAt } = inputs;
  const { updatedBy } = inputs;

  const result = await ProjectSpec.update(
    {
      name,
      values,
      comments,
      updatedAt,
      updatedBy,
    },
    {
      where: {
        [Op.and]: [
          {
            id: projectSpecId,
          },
          {
            ProjectId: projectId,
          },
        ],
      },
    },
  );

  return result;
}

async function deleteProjectSpec(inputs) {
  const { projectId } = inputs;
  const { projectSpecId } = inputs;

  const result = await ProjectSpec.destroy({
    where: {
      [Op.and]: [
        {
          id: projectSpecId,
        },
        {
          ProjectId: projectId,
        },
      ],
    },
  });

  return result;
}

ProjectSpecCRUDService.prototype = {
  getAllProjectSpec,
  getProjectSpec,
  addProjectSpec,
  editProjectSpec,
  deleteProjectSpec,
};

module.exports = ProjectSpecCRUDService;
