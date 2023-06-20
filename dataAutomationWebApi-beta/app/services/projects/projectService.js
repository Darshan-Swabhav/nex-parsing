/* eslint-disable global-require */
const _ = require('lodash');
const {
  Project,
  Sequelize,
  sequelize,
  User,
  ProjectSetting,
  ProjectType,
  Client,
  Disposition,
  Account,
  Contact,
  File,
  ProjectSpec,
  FileChunk,
  Job,
  Task,
  TaskAllocationTemp,
  JobError,
  ProjectUser,
} = require('@nexsalesdev/dataautomation-datamodel');
const { Op } = require('sequelize');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');

const {
  sequelize: masterSequelize,
} = require('@nexsalesdev/master-data-model');
const settingsConfig = require('../../config/settings/settings-config');

function ProjectCRUDService() {
  const config = settingsConfig.settings || {};
  const FileCRUDService = require('./files/fileService');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
  this.fileCrudService = new FileCRUDService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

/**
 *
 * @param {String} tableName - a model name to fetch the column & data level details
 * @returns {Array}
 */
async function getTableDetails(tableName) {
  if (_.isEmpty(tableName) || !_.isString(tableName)) {
    this.logger.error(`[PROJECT-SERVICE] :: Can Not Fetch Schema Details`);

    throw new Error('Can Not Fetch Schema Details');
  }

  const result = await masterSequelize.query(
    `SELECT column_name,data_type FROM information_schema.columns WHERE table_name = '${tableName}' ;`,
  );

  if (result) {
    return result[0];
  }

  throw new Error(`${tableName} Details Can not be fetched`);
}

/**
 *
 * @param {String} tableName
 * @param {Array} _dataColumns
 * @param {Array} _removeColumns
 * @param {Array} uniqueColumns
 * @returns {String}
 */
function createTableQuery(
  tableName,
  _dataColumns,
  _removeColumns,
  uniqueColumns,
) {
  if (_.isEmpty(_dataColumns) || !Array.isArray(_dataColumns)) {
    this.logger.error(`[PROJECT-SERVICE] :: dataColumns Is Required`);

    throw new Error('dataColumns Is Required ');
  }

  const dataColumns = _.cloneDeep(_dataColumns);
  const removeColumns = _.cloneDeep(_removeColumns);

  let query = '';

  // eslint-disable-next-line no-restricted-syntax
  for (const dataColumn of dataColumns) {
    if (!removeColumns.includes(dataColumn.column_name)) {
      query += `"${dataColumn.column_name}" ${dataColumn.data_type},`;
    }
  }

  if (query.charAt(query.length - 1) === ',') {
    query = query.substring(0, query.length - 1);
  }

  let temporaryMasterContactsQuery = '';

  if (uniqueColumns && Array.isArray(uniqueColumns) && uniqueColumns.length) {
    let uniqueColumnNames = '';

    uniqueColumns.forEach((data) => {
      uniqueColumnNames += `"${data}",`;
    });

    if (uniqueColumnNames.charAt(uniqueColumnNames.length - 1) === ',') {
      uniqueColumnNames = uniqueColumnNames.substring(
        0,
        uniqueColumnNames.length - 1,
      );
    }

    temporaryMasterContactsQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (id uuid PRIMARY KEY,flag character varying, ${query}, UNIQUE(${uniqueColumnNames}));`;
  } else {
    temporaryMasterContactsQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (id uuid PRIMARY KEY,flag character varying, ${query});`;
  }

  return temporaryMasterContactsQuery;
}

/**
 *
 * @param {String} tableName
 * @param {Array} columnQuery
 */
async function createDynamicTable(query, transaction) {
  if (!query) {
    this.logger.error(
      `[PROJECT-SERVICE] :: tableName and columnQuery are required`,
    );

    throw new Error('columnQuery are required');
  }

  await sequelize.query(`${query}`, { transaction });
}

/**
 *
 * @param {String} indexColumn
 * @param {String} tableName
 * @param {String} projectId
 */
async function createIndexOnColumn(
  indexColumn,
  tableName,
  projectId,
  transaction,
) {
  if (_.isEmpty(indexColumn) || !_.isString(indexColumn)) {
    this.logger.error(`[PROJECT-SERVICE] :: Column Required To Index`);

    throw new Error('Column Required To Index');
  }

  if (_.isEmpty(tableName) || !_.isString(tableName)) {
    this.logger.error(`[PROJECT-SERVICE] :: tableName Can Not Empty`);

    throw new Error('tableName Can Not Empty');
  }

  if (_.isEmpty(projectId) || !_.isString(projectId)) {
    this.logger.error(`[PROJECT-SERVICE] :: projectId Can Not Empty`);

    throw new Error('projectId Can Not Empty');
  }

  await sequelize.query(
    `CREATE INDEX IF NOT EXISTS contacts_${indexColumn}_${projectId.replaceAll(
      '-',
      '_',
    )}key ON "${tableName}" ("${indexColumn}")`,
    { transaction },
  );
}

/**
 *
 * @param {String} projectId
 */
async function createTemporaryMasterContacts(projectId, transaction) {
  if (!projectId || !_.isString(projectId)) {
    this.logger.error(`[PROJECT-SERVICE] :: projectId Required`);

    throw new Error('projectId Required');
  }

  const tableDetails = {
    schemaNameContacts: 'Contacts',
    schemaNameLocations: 'Locations',
    removeColumn: [
      'id',
      'nameTokens',
      'jobTitleTokens',
      'clientNameHistory',
      'fnLnCompanyDomainDedupeKey',
      'fnLnEmailDomainDedupeKey',
      'fnLnScrubbedCompanyDomainDedupeKey',
      'LocationId',
      'Location.id',
      'Location.addressDedupeKey',
      'Location.AccountDomain',
      'Location.createdBy',
      'Location.updatedBy',
      'Location.createdAt',
      'Location.updatedAt',
    ],
  };

  const indexColumns = ['jobLevel'];
  const tableName = `${projectId.replaceAll('-', '_')}_master_contacts`;

  try {
    this.logger.info(
      `[PROJECT_SERVICE] :: Start Fetching Schema Details For Project ${projectId}`,
    );

    const contactsDataColumnDetails = await this.getTableDetails(
      tableDetails.schemaNameContacts,
    );
    const locationsDataColumnDetails = await this.getTableDetails(
      tableDetails.schemaNameLocations,
    );

    locationsDataColumnDetails.forEach((column) => {
      // eslint-disable-next-line no-param-reassign
      column.column_name = `Location.${column.column_name}`;
    });

    this.logger.info(
      `[PROJECT_SERVICE] :: Completed Fetched Schema Details For Project ${projectId}`,
    );

    this.logger.info(
      `[PROJECT_SERVICE] :: Start Creating Column String For The Temporary_Contact_Master Schema For Project ${projectId}`,
    );

    const uniqueValueColumns = ['workEmail'];
    const query = this.createTableQuery(
      tableName,
      contactsDataColumnDetails.concat(locationsDataColumnDetails),
      tableDetails.removeColumn,
      uniqueValueColumns,
    );

    this.logger.info(
      `[PROJECT_SERVICE] :: Completed Created Column String For The Temporary_Contact_Master Schema For Project ${projectId}`,
    );

    this.logger.info(
      `[PROJECT_SERVICE] :: Start Creating Contact Temporary table name ${tableName} For Project ${projectId}`,
    );

    await this.createDynamicTable(query, transaction);

    this.logger.info(
      `[PROJECT_SERVICE] :: Completed Created Contact Temporary table name ${tableName} For Project ${projectId}`,
    );

    this.logger.info(
      `[PROJECT_SERVICE] :: Start Creating Index On ${tableName} For Project ${projectId}`,
    );

    for (let index = 0; index < indexColumns.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.createIndexOnColumn(
        indexColumns[index],
        tableName,
        projectId,
        transaction,
      );
    }

    this.logger.info(
      `[PROJECT_SERVICE] :: Completed Creating Index On ${tableName} For Project ${projectId}`,
    );
  } catch (error) {
    this.logger.error(
      `[PROJECT_SERVICE] :: Error in Creating Temporary Master Contacts`,
      error,
    );
    throw new Error('Error in Creating Temporary Master Contacts');
  }
}

async function getProject(projectId, attributes) {
  const result = await Project.findOne({
    attributes,
    where: [
      {
        id: projectId,
      },
    ],
    raw: true,
  });

  return result;
}

async function checkUserPermission(inputs) {
  const { projectId } = inputs;
  const { userId } = inputs;
  const { operation } = inputs;
  const { projectName } = inputs;

  if (operation === 'DELETE') {
    const projectUserAvailable = await ProjectUser.findOne({
      where: {
        [Op.and]: [
          {
            ProjectId: projectId,
          },
          {
            UserId: userId,
          },
          {
            userLevel: 'owner_main',
          },
        ],
      },
    });

    const projectAvailable = await Project.findOne({
      where: {
        [Op.and]: [
          {
            id: projectId,
          },
          {
            name: projectName,
          },
        ],
      },
    });

    if (projectUserAvailable && projectAvailable) {
      return true;
    }
    return false;
  }
  return false;
}

async function getClientId(projectId) {
  const attributes = ['ClientId'];
  const project = await this.getProject(projectId, attributes);

  const clientId = _.get(project, 'ClientId', null);

  if (clientId) return clientId;

  throw new Error(`Cloud not find ClientId for project ${projectId}`);
}

async function addProject(inputs, transaction) {
  const {
    projectId,
    projectTypeId,
    name,
    aliasName,
    receivedDate,
    dueDate,
    createdAt,
    createdBy,
    templateId,
  } = inputs;

  const ClientId = inputs.clientId;
  const updatedAt = inputs.updatedAt || inputs.createdAt;
  const updatedBy = inputs.updatedBy || inputs.createdBy;

  const result = await Project.create(
    {
      id: projectId,
      ProjectTypeId: projectTypeId,
      name,
      aliasName,
      receivedDate,
      dueDate,
      ClientId,
      createdBy,
      updatedBy,
      TemplateId: templateId,
      createdAt,
      updatedAt,
    },
    { transaction },
  );

  await this.createTemporaryMasterContacts(projectId, transaction);

  return result;
}

async function editProject(inputs) {
  const {
    projectId,
    name,
    aliasName,
    receivedDate,
    description,
    dueDate,
    updatedAt,
    clientId,
    projectTypeId,
    templateId,
    updatedBy,
    contactExpiry,
    userRoles,
  } = inputs;

  const projectPayload = {
    name,
    aliasName,
    receivedDate,
    dueDate,
    updatedAt,
    description,
    ClientId: clientId,
    ProjectTypeId: projectTypeId,
    TemplateId: templateId,
    updatedBy,
    contactExpiry,
  };

  if (userRoles.indexOf(USER_ROLES.PROJECT_OWNER) < 0) {
    delete projectPayload.name;
    delete projectPayload.aliasName;
  }
  const result = await Project.update(projectPayload, {
    where: {
      id: projectId,
    },
  });

  return result;
}

async function deleteTemporaryMasterContactsTable(tableName) {
  if (!tableName) return;

  await sequelize.query(`DROP TABLE IF EXISTS "${tableName}";`);
}

async function deleteProject(inputs) {
  const { projectId } = inputs;
  this.logger.info(
    `[PROJECT-SERVICE] :: Deletion of a project ${projectId} started`,
  );

  try {
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> Files from GCP bucket`,
    );
    const gcpFiles = await this.fileCrudService.deleteAllFilesOfAProject(
      inputs,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> Files from GCP bucket completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> JobErrors from DB`,
    );
    const jobError = await JobError.deleteProjectJobError(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> JobErrors from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> Jobs from DB`,
    );
    const job = await Job.deleteProjectJob(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> Jobs from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> Contacts from DB`,
    );
    const contact = await Contact.deleteProjectContact(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> Contacts from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> Accounts from DB`,
    );
    const account = await Account.deleteProjectAccount(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> Accounts from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> FileChunks from DB`,
    );
    const fileChunk = await FileChunk.deleteProjectFileChunk(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> FileChunks from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> Files from DB`,
    );
    const file = await File.deleteProjectFile(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> Files from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> ProjectSettings from DB`,
    );
    const projectSetting = await ProjectSetting.deleteProjectSetting(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> ProjectSettings from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> ProjectSpecs from DB`,
    );
    const projectSpec = await ProjectSpec.deleteProjectSpec(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> ProjectSpecs from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> Tasks from DB`,
    );
    const projectTask = await Task.deleteProjectTask(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> Tasks from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} -> TaskAllocationTemps from DB`,
    );
    const projectTaskAllocationTemp =
      await TaskAllocationTemp.deleteProjectTaskAllocationTemp(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} -> TaskAllocationTemps from DB completed successfully`,
    );

    const tableName = `${projectId.replaceAll('-', '_')}_master_contacts`;
    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a Temporary Master Contact Table ${tableName} from DB`,
    );
    await deleteTemporaryMasterContactsTable(tableName);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a Temporary Master Contact Table ${tableName} from DB completed successfully`,
    );

    this.logger.info(
      `[PROJECT-SERVICE] :: Deleting a project ${projectId} from DB`,
    );
    const project = await Project.deleteProject(projectId);
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} from DB completed successfully`,
    );
    this.logger.info(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} successfully completed`,
    );
    return {
      jobError,
      job,
      contact,
      account,
      fileChunk,
      file,
      projectSetting,
      projectSpec,
      projectTask,
      projectTaskAllocationTemp,
      project,
      gcpFiles,
    };
  } catch (error) {
    this.logger.error(
      `[PROJECT-SERVICE] :: Deletion of a project ${projectId} failed with error ${error}`,
    );
    throw error;
  }
}

async function getAllProjectWithSettings(inputs, _filter, _sort) {
  const filter = _.cloneDeep(_filter);
  const sort = _.cloneDeep(_sort);
  this.logger.debug(
    `[getAllProjectForManager] : Received Filter: ${JSON.stringify(filter)}`,
  );

  const { limit, offset, userId, searchValue, userRoles } = inputs;
  let { searchColumn } = inputs;

  let where = {};
  let attributes = [
    ['id', 'projectId'],
    'aliasName',
    [Sequelize.col('Client.id'), 'clientId'],
    [Sequelize.col('Client.name'), 'client'],
    'createdAt',
    'dueDate',
    [Sequelize.col('ProjectSetting.updatedAt'), 'updatedAt'],
    [Sequelize.col('ProjectSetting.status'), 'status'],
    [Sequelize.col('ProjectSetting.target'), 'targets'],
  ];
  if (userRoles.includes(USER_ROLES.PROJECT_OWNER)) {
    attributes.push(['name', 'projectName']);
  }

  if (searchColumn) {
    attributes = ['id'];
    if (searchColumn === 'project') {
      searchColumn = 'Project.name';
      attributes.push('name');
    } else if (searchColumn === 'aliasName') {
      searchColumn = 'aliasName';
      attributes.push(['aliasName', 'name']);
    }

    if (searchValue)
      where = {
        name: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col(`${searchColumn}`)),
          'LIKE',
          `%${searchValue.toLowerCase()}%`,
        ),
      };
  }

  where['$Users.id$'] = userId;

  const filterColumnsMapping = {
    updatedAt: `$ProjectSetting.updatedAt$`,
    status: `$ProjectSetting.status$`,
    client: `$Project.ClientId$`,
    project: `$Project.id$`,
    aliasName: `$Project.id$`,
  };
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  const sortColumnsMapping = {
    client: `"Client"."name"`,
    dueDate: `"dueDate"`,
  };
  const customSortColumn = {};
  let order = [];
  order = this.sortHandler.buildOrderClause(
    sortColumnsMapping,
    customSortColumn,
    sort,
    order,
  );

  if (!order.length) {
    order = [
      [
        sequelize.fn('MAX', Sequelize.col('Tasks.updatedAt')),
        'DESC NULLS FIRST',
      ],
      ['updatedAt', 'DESC'],
    ];
  }
  const result = await Project.findAll({
    attributes,
    include: [
      {
        model: ProjectSetting,
        attributes: [],
        required: true,
      },
      {
        model: Client,
        attributes: [],
        required: true,
      },
      {
        model: Task,
        attributes: [],
      },
      {
        model: User,
        through: {
          attributes: [],
        },
        attributes: [],
        required: true,
      },
    ],
    where,
    order,
    limit,
    offset,
    group: ['Project.id', 'ProjectSetting.id', 'Client.id'],
    subQuery: false,
    raw: true,
  });
  const counts = await Project.count({
    include: [
      {
        model: ProjectSetting,
        attributes: [],
        required: true,
      },
      {
        model: Client,
        attributes: [],
        required: true,
      },
      {
        model: User,
        through: {
          attributes: [],
        },
        attributes: [],
        required: true,
      },
    ],
    where,
    raw: true,
    subQuery: false,
  });
  const projects = {};
  projects.totalCount = counts;
  projects.docs = result;
  _.map(projects.docs, (_item) => {
    const item = _item;
    if (item.targets) {
      item.targetAccount = item.targets.accountTarget;
      item.targetContact = item.targets.contactTarget;
    }
    return item;
  });
  return projects;
}

async function checkDetailedProjectUserAccess(result, userId) {
  let finalResult = {};
  const project = result;
  const userIds = await _.map(project.Users, 'id');
  const userIdIndex = await _.indexOf(userIds, userId);
  if (userIdIndex > -1) {
    finalResult = project;
  }
  return finalResult;
}

async function getDetailedProject(inputs) {
  const { projectId, userId, userRoles } = inputs;
  const result = await Project.findOne({
    where: [
      {
        id: projectId,
      },
    ],
    include: [
      {
        model: ProjectSetting,
      },
      {
        model: ProjectType,
      },
      {
        model: User,
      },
      {
        model: Client,
      },
      {
        model: Disposition,
      },
    ],
  });
  const finalResult = await checkDetailedProjectUserAccess(result, userId);

  if (userRoles.indexOf(USER_ROLES.PROJECT_OWNER) < 0) {
    delete result.dataValues.name;
  }
  return finalResult;
}

ProjectCRUDService.prototype = {
  getProject,
  addProject,
  editProject,
  deleteProject,
  getAllProjectWithSettings,
  getDetailedProject,
  checkUserPermission,
  getClientId,
  createTemporaryMasterContacts,
  getTableDetails,
  createTableQuery,
  createDynamicTable,
  createIndexOnColumn,
};

module.exports = ProjectCRUDService;
