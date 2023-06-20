const { ProjectSetting } = require('@nexsalesdev/dataautomation-datamodel');
const { serializeError } = require('serialize-error');
const AccountPotentialBuilderService = require('@nexsalesdev/dataautomation-datamodel/lib/services/accountsPotentialBuilder');
const constants = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const settingsConfig = require('../../../config/settings/settings-config');

function ProjectSettingCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;

  this.accountPotentialBuilderService = new AccountPotentialBuilderService(
    this.logger,
  );
}

async function getProjectSetting(inputs) {
  const { projectId } = inputs;

  const result = await ProjectSetting.findOne({
    where: [
      {
        ProjectId: projectId,
      },
    ],
  });

  return result;
}

async function addProjectSetting(inputs, transaction) {
  const {
    settingId,
    target,
    contactsPerAccount,
    clientPoc,
    priority,
    description,
    status,
    createdAt,
    createdBy,
    projectId,
  } = inputs;
  const updatedAt = inputs.updatedAt || inputs.createdAt;
  const updatedBy = inputs.updatedBy || inputs.createdBy;

  const result = await ProjectSetting.create(
    {
      id: settingId,
      target,
      contactsPerAccount,
      clientPoc,
      priority,
      status,
      description,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      ProjectId: projectId,
    },
    { transaction },
  );

  return result;
}

async function editProjectSetting(inputs) {
  const {
    target,
    contactsPerAccount,
    clientPoc,
    priority,
    status,
    updatedAt,
    updatedBy,
    projectId,
  } = inputs;

  const projectSettingInstance = await ProjectSetting.findOne({
    where: [
      {
        ProjectId: projectId,
      },
    ],
  });

  if (!projectSettingInstance) {
    throw new Error(`Project Settings Not Found For Project ${projectId}`);
  }

  const oldContactsPerAccountVal = projectSettingInstance.contactsPerAccount;

  projectSettingInstance.target = target;
  projectSettingInstance.contactsPerAccount = contactsPerAccount;
  projectSettingInstance.clientPoc = clientPoc;
  projectSettingInstance.priority = priority;
  projectSettingInstance.status = status;
  projectSettingInstance.updatedAt = updatedAt;
  projectSettingInstance.updatedBy = updatedBy;
  await projectSettingInstance.save();

  if (oldContactsPerAccountVal !== contactsPerAccount) {
    await this.updateAccountsPotentialCountsOfAProject(projectId);
  }

  return projectSettingInstance;
}

async function updateAccountsPotentialCountsOfAProject(projectId) {
  try {
    await this.accountPotentialBuilderService.setProjectId(projectId);
    await this.accountPotentialBuilderService.accountsPotentialBuilderForAProject();
    this.logger.info(
      `[PROJECT-SETTINGS-SERVICE] :: SUCCESS :: Projects Account Potential Was Build Successfully {projectId : ${projectId}}`,
    );
    return;
  } catch (error) {
    const serializedError = serializeError(error);
    this.logger.error(
      `[PROJECT-SETTINGS-SERVICE] :: ALERT :: Could Not Build Projects Account Potential {projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );
  }
}

async function editProjectSettingTarget(inputs) {
  const { target, contactsPerAccount, projectId } = inputs;

  const result = await ProjectSetting.update(
    {
      target,
      contactsPerAccount,
    },
    {
      where: [
        {
          ProjectId: projectId,
        },
      ],
    },
  );
  return result;
}

function getStatusEnums() {
  const status = constants.PROJECT_STATUS;
  return status;
}

function getPriorityEnums() {
  const priority = constants.PROJECT_PRIORITY;
  return priority;
}

ProjectSettingCRUDService.prototype = {
  getProjectSetting,
  addProjectSetting,
  editProjectSetting,
  editProjectSettingTarget,
  getStatusEnums,
  getPriorityEnums,
  updateAccountsPotentialCountsOfAProject,
};

module.exports = ProjectSettingCRUDService;
