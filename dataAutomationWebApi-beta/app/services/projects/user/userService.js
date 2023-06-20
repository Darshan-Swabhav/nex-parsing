const { Sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const { ProjectUser } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;

function ProjectUserCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}
async function getProjectUser(inputs) {
  const { projectId } = inputs;
  const { projectUserId } = inputs;
  // const limit  = inputs.limit;
  // const offset = inputs.offset;

  const result = ProjectUser.findAll({
    where: {
      [Op.and]: [
        {
          UserId: projectUserId,
        },
        {
          ProjectId: projectId,
        },
      ],
    },
    // limit : limit,
    // offset: offset
  });

  return result;
}

async function createProjectUser(inputs, transaction) {
  const { userLevel, createdAt, projectId, projectUserId, createdBy } = inputs;
  const updatedAt = inputs.updatedAt || inputs.createdAt;
  const updatedBy = inputs.updatedBy || inputs.createdBy;

  const result = await ProjectUser.create(
    {
      userLevel,
      createdAt,
      updatedAt,
      ProjectId: projectId,
      UserId: projectUserId,
      createdBy,
      updatedBy,
    },
    { transaction },
  );

  return result;
}

async function deleteProjectUser(inputs) {
  const { projectId } = inputs;
  // const projectUserId = inputs.projectUserId;

  const result = ProjectUser.destroy({
    where: {
      [Op.and]: [
        // {
        //   UserId: projectUserId
        // },
        {
          ProjectId: projectId,
        },
      ],
    },
  });

  return result;
}

ProjectUserCRUDService.prototype = {
  createProjectUser,
  getProjectUser,
  deleteProjectUser,
};

module.exports = ProjectUserCRUDService;
