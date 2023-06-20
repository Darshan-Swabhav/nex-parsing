const _ = require('lodash');
const { Template } = require('@nexsalesdev/dataautomation-datamodel');
const { Project } = require('@nexsalesdev/dataautomation-datamodel');
const { Sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../../config/settings/settings-config');

function TemplateCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAllTemplate() {
  const results = await Template.findAll({
    attributes: ['id', 'name', 'config'],
  });

  return results;
}

async function getTemplateOfAProject(inputs) {
  const { projectId } = inputs;

  const result = await Template.findOne({
    attributes: ['id', 'name', 'config'],
    include: [
      {
        model: Project,
        attributes: [],
        where: [
          {
            id: projectId,
          },
        ],
      },
    ],
  });

  return result;
}

async function findTemplateByName(templateName) {
  const templateFoundByName = await Template.findOne({
    where: {
      name: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('name')),
        '=',
        templateName.toLowerCase(),
      ),
    },
  });

  return templateFoundByName;
}

async function createTemplate(inputs) {
  const { templateId, name, config, createdBy } = inputs;
  const updatedBy = inputs.updatedBy || inputs.createdBy;
  const createdAt = new Date();
  const updatedAt = new Date();

  const templateFoundByNameRes = await findTemplateByName(name);
  if (templateFoundByNameRes) {
    const error = {
      message: 'TEMPLATE_NAME_ALREADY_EXISTS',
    };
    throw error;
  }

  const result = await Template.create({
    id: templateId,
    name,
    config,
    createdAt,
    updatedAt,
    createdBy,
    updatedBy,
  });

  return result;
}

function getObjects(newObj, key, val, newVal) {
  const obj = _.cloneDeep(newObj);
  const newValue = newVal;
  let objects = [];
  const objKeys = Object.keys(obj);
  for (let i = 0; i < objKeys.length; i += 1) {
    if (typeof obj[objKeys[i]] === 'object') {
      objects = objects.concat(getObjects(obj[objKeys[i]], key, val, newValue));
    } else if (objKeys[i] === key && obj[key] === val) {
      obj.label = newVal;
      if (obj.name) {
        obj.name = newVal;
      }
    }
  }
  const finalObj = _.merge(newObj, obj);
  return finalObj;
}

function updateConfigLabels(config) {
  const { fieldLabels } = config;
  let result;
  const fieldLabelsKeys = Object.keys(fieldLabels);
  for (let i = 0; i < fieldLabelsKeys.length; i += 1) {
    result = getObjects(
      config,
      'id',
      fieldLabelsKeys[i],
      fieldLabels[fieldLabelsKeys[i]].label,
    );
    if (fieldLabelsKeys[i].indexOf('contact.') > -1) {
      const modifiedContactField = fieldLabelsKeys[i].replace('contact.', '');
      result.forms.AgentContactReadOnly = getObjects(
        result.forms.AgentContactReadOnly,
        'id',
        modifiedContactField,
        fieldLabels[fieldLabelsKeys[i]].label,
      );
      result.csv.ContactDownload = getObjects(
        result.csv.ContactDownload,
        'id',
        modifiedContactField,
        fieldLabels[fieldLabelsKeys[i]].label,
      );
    }
    if (fieldLabelsKeys[i].indexOf('account.') > -1) {
      let modifiedAccountField = fieldLabelsKeys[i].replace('account.', '');
      result.forms.AgentAccountWorkspace = getObjects(
        result.forms.AgentAccountWorkspace,
        'id',
        modifiedAccountField,
        fieldLabels[fieldLabelsKeys[i]].label,
      );
      result.csv.AccountDownload = getObjects(
        result.csv.AccountDownload,
        'id',
        modifiedAccountField,
        fieldLabels[fieldLabelsKeys[i]].label,
      );
      modifiedAccountField = fieldLabelsKeys[i].replace('account.', 'Account.');
      result.csv.ContactDownload = getObjects(
        result.csv.ContactDownload,
        'id',
        modifiedAccountField,
        fieldLabels[fieldLabelsKeys[i]].label,
      );
    }
  }
  return result;
}

async function updateTemplate(inputs) {
  let { config } = inputs;
  const { templateId, name, updatedBy } = inputs;
  const updatedAt = new Date();

  if (config.fieldLabels && Object.keys(config.fieldLabels).length) {
    config = updateConfigLabels(config);
  }

  const result = await Template.update(
    {
      name,
      config,
      updatedBy,
      updatedAt,
    },
    {
      where: {
        id: templateId,
      },
    },
  );

  return result;
}

async function getTemplateById(inputs) {
  const { templateId } = inputs;

  const result = await Template.findOne({
    attributes: ['id', 'name', 'config'],
    where: [
      {
        id: templateId,
      },
    ],
  });

  return result;
}

async function getTemplateGridConfig(templateId) {
  if (!templateId) {
    const error = new Error('template Id can not be nullish');
    error.code = 'BAD_TEMPLATE_ID';
    throw error;
  }
  const result = await Template.findOne({
    attributes: ['id', 'name', 'gridConfig'],
    where: [
      {
        id: templateId,
      },
    ],
  });

  if (result) return result;

  return {};
}

TemplateCRUDService.prototype = {
  getAllTemplate,
  createTemplate,
  updateTemplate,
  getTemplateOfAProject,
  getTemplateById,
  getTemplateGridConfig,
};

module.exports = TemplateCRUDService;
