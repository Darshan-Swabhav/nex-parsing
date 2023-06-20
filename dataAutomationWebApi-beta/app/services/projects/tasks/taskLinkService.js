/* eslint-disable global-require */
const { TaskLink, Task } = require('@nexsalesdev/dataautomation-datamodel');
const { serializeError } = require('serialize-error');
const AccountPotentialBuilderService = require('@nexsalesdev/dataautomation-datamodel/lib/services/accountsPotentialBuilder');
const _ = require('lodash');
const settingsConfig = require('../../../config/settings/settings-config');

const BAD_RESEARCH_STATUS = ['NQ', 'D'];

async function findTaskLink(objectId, taskId) {
  const result = await TaskLink.findOne({
    where: [
      {
        TaskId: taskId,
      },
      {
        ObjectId: objectId,
      },
    ],
  });

  return result;
}

async function createTaskLink(_taskLink, inputs) {
  const taskLink = _taskLink;
  taskLink.createdBy = inputs.userId;
  taskLink.updatedBy = inputs.userId;

  const result = await TaskLink.create(taskLink);

  return result;
}

async function updateTaskLink(_taskLink, inputs, findTaskLinkResult) {
  let taskLink = _taskLink;
  taskLink.updatedBy = inputs.userId;

  // Build Object From Data
  taskLink = TaskLink.build(taskLink);

  const TaskLinkInstance = findTaskLinkResult;
  // Merge Objects
  Object.keys(TaskLinkInstance.dataValues).forEach((key) => {
    if (taskLink[key]) {
      TaskLinkInstance[key] = taskLink[key];
    }
  });

  TaskLinkInstance.set('updatedAt', new Date());
  TaskLinkInstance.changed('updatedAt', true);

  return TaskLinkInstance.save();
}

class TaskLinkCRUDService {
  constructor() {
    // reasonable defaults for values
    this.config = settingsConfig.settings || {};
    this.logger = settingsConfig.logger || console;

    const ContactFinder = require('../../commonServices/contactFinder');
    this.contactFinder = new ContactFinder();

    this.accountPotentialBuilderService = new AccountPotentialBuilderService(
      this.logger,
    );
  }

  async disposeContact(contact, inputs, _taskLink) {
    const taskLink = _taskLink;
    taskLink.ObjectId = contact.id;
    taskLink.objectType = 'contact';
    taskLink.linkType = 'output';
    taskLink.UserId = inputs.userId;

    const findTaskLinkResult = await findTaskLink(
      taskLink.ObjectId,
      taskLink.TaskId,
    );

    let taskLinkCreateUpdateResult;
    if (findTaskLinkResult) {
      this.logger.info(
        `[DISPOSE CONTACT] :: TaskLink Found : ${JSON.stringify(
          findTaskLinkResult.dataValues,
        )}`,
      );
      taskLinkCreateUpdateResult = await updateTaskLink(
        taskLink,
        inputs,
        findTaskLinkResult,
      );
      this.logger.info(`[DISPOSE CONTACT] :: TaskLink Updated`);
    } else {
      taskLinkCreateUpdateResult = await createTaskLink(taskLink, inputs);
      this.logger.info(
        `[DISPOSE CONTACT] :: TaskLink Created : ${JSON.stringify(
          taskLinkCreateUpdateResult.dataValues,
        )}`,
      );
    }

    // Update Task's updatedAt and updatedBy
    const TaskInstance = await Task.findOne({ where: { id: taskLink.TaskId } });
    if (TaskInstance == null) {
      const error = new Error();
      error.message = `Could Not Find Task With Id: ${taskLink.TaskId}`;
      error.code = `BAD_TASK_ID`;
      throw error;
    }

    // Change The Task Status To 'Working' From 'Pending' When First Contact In This Task Is Disposed
    if (!TaskInstance.status || TaskInstance.status === 'Pending') {
      TaskInstance.status = 'Working';
    }

    TaskInstance.updatedBy = inputs.userId;
    // If no values of TaskInstance is changed, then to update 'updatedAt' we have forcefully set changed to true
    TaskInstance.set('updatedAt', new Date());
    TaskInstance.changed('updatedAt', true);
    await TaskInstance.save();

    // Update Contact's Stage To Review or Discarded
    const contactInstance = await this.contactFinder.findContact(contact.id);
    if (!contactInstance) {
      this.logger.error(
        `[DISPOSE CONTACT] :: ERROR : Could Not Update Contact Stage, Because Contact Not Found With ID: ${contact.id}`,
      );
    }

    const indexOf = _.indexOf(BAD_RESEARCH_STATUS, taskLink.researchStatus);
    if (indexOf > -1) {
      contactInstance.stage = 'Discarded';
    } else {
      contactInstance.stage = 'Review';
    }
    await contactInstance.save();
    this.logger.info(
      `[CREATE_CONTACT] :: Stage Updated of Contact with ID: ${contactInstance.id}`,
    );

    try {
      await this.accountPotentialBuilderService.setProjectId(contact.ProjectId);
      await this.accountPotentialBuilderService.accountsPotentialBuilderForAProject(
        contact.AccountId,
      );
      this.logger.info(
        `[DISPOSE CONTACT] :: SUCCESS : Projects Account Potential Was Build Successfully For Project: ${contact.ProjectId} Account: ${contact.AccountId}`,
      );
    } catch (error) {
      const serializedError = serializeError(error);
      this.logger.error(
        `[DISPOSE CONTACT] :: ALERT :: Could Not Build Projects Account Potential {ProjectId : ${
          contact.ProjectId
        }, Account: ${contact.AccountId}, error : ${JSON.stringify(
          serializedError,
        )}}`,
      );
    }

    return { disposed: true };
  }
}

module.exports = TaskLinkCRUDService;
