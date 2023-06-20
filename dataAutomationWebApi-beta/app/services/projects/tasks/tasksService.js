/* eslint-disable global-require */
const _ = require('lodash');
const { uuid } = require('uuidv4');
const { serializeError } = require('serialize-error');
const {
  User,
  Task,
  TaskType,
  Account,
  Contact,
  Project,
  ProjectType,
  File,
  Job,
  TaskAllocationTemp,
  Sequelize,
  sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');
const {
  JOB_STATUS,
  JOB_OPERATION_NAME,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const { CloudTasksClient } = require('@google-cloud/tasks');

const taskQueueClient = new CloudTasksClient();
const { taskExporter } = require('@nexsalesdev/da-download-service-repository');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;

const TASK_ALLOCATION_STRATEGY = {
  SEQUENTIAL: 'Sequential',
  BLOCK: 'Block',
};
const ALLOCATION_OF = {
  TASK: 'task',
  ACCOUNT: 'account',
  CONTACT: 'contact',
};

const LIMIT_ASSIGNMENT = {
  ASSIGN_TOP: 'Assign Top',
  ASSIGN_ALL_FILTERED: 'Assign All Filtered',
};

const TASK_FIELDS = [
  'id',
  'description',
  'dueDate',
  'status',
  'priority',
  'completedDate',
  'createdAt',
  'updatedAt',
];

const ACCOUNT_FIELDS = [
  'id',
  'name',
  'addressHQ',
  'phoneHQ',
  'website',
  'linkedInUrl',
  'industry',
  'revenue_M_B_K',
  'employeeSize',
  'revenue',
  'employeeSizeLI',
  'employeeSizeZ_plus',
  'employeeSourceZ_plus',
  'employeeSizeFinalBucket',
  'employeeSize_others',
  'email',
  'source',
  'disposition',
  'qualifiedContacts',
  'potential',
];

const CONTACT_FIELDS = [
  'id',
  'researchStatus',
  'prefix',
  'firstName',
  'middleName',
  'lastName',
  'jobTitle',
  'jobLevel',
  'jobDepartment',
  'nsId',
  'directPhone',
  'mobile',
  'email',
  'zb',
  'gmailStatus',
  'source',
  'linkedInUrl',
  'screenshot',
  'disposition',
];

const FILE_TYPE = {
  EXPORT: 'Export',
  TASK_ALLOCATION: 'Task Allocation',
};

const USER_FIELDS = ['id', 'firstName', 'lastName', 'userName'];
const COMPLIANCE_STAGE = 'Compliance';
const COMPLIANCE_STATUS = {
  COMPLIANT: ['Compliant'],
  NON_COMPLIANT: [
    'Duplicate Contact',
    'Account Suppression',
    'Contact Suppression',
    'Bounce Email',
    'Title',
    'Missing Info',
    'Excess Contact',
    'Location',
    'Employee Range',
    'Revenue Range',
    'Industry Error',
    'QC Delete',
    'Other Error',
  ],
};
function TaskCRUDService() {
  const config = settingsConfig.settings || {};
  const UserCacheService = require('@nexsalesdev/dataautomation-datamodel/lib/services/userCache');
  const DispositionCacheService = require('@nexsalesdev/dataautomation-datamodel/lib/services/dispositionCache');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;

  this.userCacheService = new UserCacheService();
  this.dispositionCacheService = new DispositionCacheService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

async function getTaskStats(inputs, accountWhere = {}) {
  const result = [];

  const todayDate = new Date(Date.now());
  todayDate.setHours(0, 0, 0, 0);

  const totalCountWhere = {
    status: {
      [Op.ne]: 'In-Active',
    },
  };
  const completedCountWhere = {
    status: 'Completed',
  };
  const upcomingCountWhere = {
    status: 'Pending',
    dueDate: {
      [Op.gte]: todayDate,
    },
  };
  const overdueCountWhere = {
    status: 'Pending',
    dueDate: {
      [Op.lt]: todayDate,
    },
  };
  const workingCountWhere = {
    status: 'Working',
  };

  if (inputs.userId) {
    totalCountWhere.UserId = inputs.userId;
    completedCountWhere.UserId = inputs.userId;
    upcomingCountWhere.UserId = inputs.userId;
    overdueCountWhere.UserId = inputs.userId;
    workingCountWhere.UserId = inputs.userId;
  }

  if (inputs.projectId) {
    totalCountWhere.ProjectId = inputs.projectId;
    completedCountWhere.ProjectId = inputs.projectId;
    upcomingCountWhere.ProjectId = inputs.projectId;
    overdueCountWhere.ProjectId = inputs.projectId;
    workingCountWhere.ProjectId = inputs.projectId;
  }

  if (inputs.priority) {
    totalCountWhere.priority = inputs.priority;
    completedCountWhere.priority = inputs.priority;
    upcomingCountWhere.priority = inputs.priority;
    overdueCountWhere.priority = inputs.priority;
    workingCountWhere.priority = inputs.priority;
  }

  if (inputs.status) {
    totalCountWhere.status = inputs.status;
  }

  const include = [
    {
      model: Account,
      attributes: [],
      where: [accountWhere],
      through: {
        attributes: [],
        where: [
          {
            linkType: 'input',
          },
        ],
      },
    },
    {
      model: Contact,
      attributes: [],
      through: {
        attributes: [],
        where: [
          {
            linkType: 'input',
          },
        ],
      },
    },
  ];
  let totalCount = 0;
  let completedCount = 0;
  let upcomingCount = 0;
  let overDueCount = 0;
  let workingCount = 0;

  totalCount = await Task.count({
    where: [totalCountWhere],
    include,
  });

  completedCount = await Task.count({
    where: [completedCountWhere],
    include,
  });

  upcomingCount = await Task.count({
    where: [upcomingCountWhere],
    include,
  });

  overDueCount = await Task.count({
    where: [overdueCountWhere],
    include,
  });

  workingCount = await Task.count({
    where: [workingCountWhere],
    include,
  });

  if (inputs.status && inputs.status === 'Completed') {
    upcomingCount = 0;
    overDueCount = 0;
    workingCount = 0;
  }
  if (inputs.status && inputs.status === 'Working') {
    upcomingCount = 0;
    overDueCount = 0;
    completedCount = 0;
  }
  if (inputs.status && inputs.status === 'Pending') {
    completedCount = 0;
    workingCount = 0;
  }
  result.push({
    status: 'Total',
    count: totalCount,
  });
  result.push({
    status: 'Completed',
    count: completedCount,
  });
  result.push({
    status: 'Overdue',
    count: overDueCount,
  });
  result.push({
    status: 'Upcoming',
    count: upcomingCount,
  });
  result.push({
    status: 'Working',
    count: workingCount,
  });

  return result;
}

async function getTaskStatsProjectWise(inputs) {
  const { userId, countOnly, limit, offset } = inputs;

  const stateInput = {};
  stateInput.userId = userId;

  const counts = await this.getTaskStats(stateInput);
  if (countOnly) {
    return counts;
  }

  const result = await Task.findAndCountAll({
    attributes: [
      'ProjectId',
      [Sequelize.col('Project.aliasName'), 'projectAliasName'],
      [Sequelize.col('Project.ProjectType.type'), 'projectType'],
      [sequelize.fn('COUNT', Sequelize.col('Project.name')), 'taskCount'],
    ],
    include: [
      {
        attributes: [],
        model: Project,
        include: [
          {
            attributes: [],
            model: ProjectType,
          },
        ],
      },
    ],
    where: [
      {
        UserId: userId,
      },
      {
        status: {
          [Op.ne]: 'In-Active',
        },
      },
    ],
    group: ['ProjectId', 'Project.id', 'Project.ProjectType.type'],
    order: [[sequelize.fn('MAX', Sequelize.col('Task.createdAt')), 'DESC']],
    raw: true,
    offset,
    limit,
  });

  const taskStats = {};
  taskStats.counts = counts;
  taskStats.docs = result.rows;
  taskStats.totalCount = result.count.length;
  return taskStats;
}

async function fetchAllTask(
  where,
  order,
  offset,
  limit,
  projectWhere = {},
  accountFilter = {},
) {
  const result = await Task.findAndCountAll({
    attributes: TASK_FIELDS,
    where: [where],
    include: [
      {
        model: TaskType,
        attributes: ['id', 'type'],
      },
      {
        model: Project,
        attributes: ['id', 'name'],
        where: [projectWhere],
      },
      {
        model: Account,
        attributes: ACCOUNT_FIELDS,
        where: [accountFilter],
        through: {
          attributes: ['disposition'],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
      {
        model: Contact,
        attributes: CONTACT_FIELDS,
        through: {
          attributes: ['disposition'],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
      {
        model: User,
        attributes: USER_FIELDS,
      },
    ],
    order,
    offset,
    limit,
    subQuery: false,
  });

  const tasks = {};
  tasks.totalCount = result.count;
  tasks.docs = result.rows;
  return tasks;
}

function buildWhereClauseForStatus(_status, _where = {}) {
  let status = _status;
  const where = _.clone(_where);
  if (!status || !Array.isArray(status) || !status.length) {
    return where;
  }
  status = status.toString().toLowerCase();

  const statusOfFilter = [];

  const todayDate = new Date(Date.now());
  todayDate.setHours(0, 0, 0, 0);

  if (status.indexOf('completed') > -1) {
    statusOfFilter.push('Completed');
  }

  if (status.indexOf('working') > -1) {
    statusOfFilter.push('Working');
  }

  if (status.indexOf('pending') > -1) {
    statusOfFilter.push('Pending');
  }
  if (status.indexOf('overdue') > -1 || status.indexOf('upcoming') > -1) {
    statusOfFilter.push('Pending');
  }

  where.status = {
    [Op.or]: statusOfFilter,
  };

  if (status.indexOf('overdue') > -1 && status.indexOf('upcoming') > -1) {
    return where;
  }
  if (status.indexOf('overdue') > -1) {
    where.dueDate = {
      [Op.lt]: todayDate,
    };
  } else if (status.indexOf('upcoming') > -1) {
    where.dueDate = {
      [Op.gte]: todayDate,
    };
  }
  return where;
}

function buildWhereClause(filterProperty, userRole) {
  let whereClause = {};
  const filtersForAccount = {};
  if (!filterProperty || !Object.keys(filterProperty).length) {
    return [whereClause, filtersForAccount];
  }

  whereClause = this.buildWhereClauseForStatus(
    filterProperty.status,
    whereClause,
  );
  if (
    userRole === 'manager' &&
    filterProperty.updatedAt &&
    Array.isArray(filterProperty.updatedAt) &&
    filterProperty.updatedAt.length === 2
  ) {
    const startDate = new Date(filterProperty.updatedAt[0]).setHours(
      0,
      0,
      0,
      0,
    );
    const endDate = new Date(filterProperty.updatedAt[1]).setHours(
      23,
      59,
      59,
      999,
    );
    whereClause.updatedAt = {
      [Op.between]: [startDate, endDate],
    };
  }
  if (userRole === 'agent' && filterProperty['account.name']) {
    filtersForAccount.name = Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('Accounts.name')),
      Op.eq,
      filterProperty['account.name'].toLowerCase(),
    );
  }
  if (userRole === 'agent' && filterProperty['account.website']) {
    filtersForAccount.website = Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('Accounts.website')),
      Op.eq,
      filterProperty['account.website'].toLowerCase(),
    );
  }
  if (userRole === 'agent' && filterProperty['account.disposition']) {
    filtersForAccount.disposition = Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('Accounts.disposition')),
      Op.eq,
      filterProperty['account.disposition'].toLowerCase(),
    );
  }
  if (userRole === 'agent' && filterProperty['account.employeeSize']) {
    filtersForAccount.employeeSize = Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('Accounts.employeeSize')),
      Op.eq,
      filterProperty['account.employeeSize'].toLowerCase(),
    );
  }
  if (userRole === 'agent' && filterProperty['account.revenue']) {
    filtersForAccount.revenue = Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('Accounts.revenue')),
      Op.eq,
      filterProperty['account.revenue'].toLowerCase(),
    );
  }

  if (userRole === 'agent' && filterProperty['account.qualifiedContacts']) {
    filtersForAccount.qualifiedContacts =
      filterProperty['account.qualifiedContacts'];
  }
  if (userRole === 'agent' && filterProperty['account.potential']) {
    filtersForAccount.potential = filterProperty['account.potential'];
  }

  if (userRole === 'agent' && filterProperty['task.priority']) {
    whereClause.priority = Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('priority')),
      Op.eq,
      filterProperty['task.priority'].toLowerCase(),
    );
  }
  if (userRole === 'agent' && filterProperty['taskType.type']) {
    whereClause['$TaskType.type$'] = Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('TaskType.type')),
      Op.eq,
      filterProperty['taskType.type'].toLowerCase(),
    );
  }

  return [whereClause, filtersForAccount];
}

/* customOrder:
    Generate the custom order Sequelize statement For Given Column
  Fn Input Params:
    column=priority,
    values=['Overtime', 'Lowest', 'Low', 'Medium', 'Standard', 'High','Highest'],
    direction=DESC
  Fn Output:
    [ sequelize
      .literal(`CASE priority WHEN 'Overtime' THEN 1
        WHEN 'Lowest' THEN 2
        WHEN 'Low' THEN 3
        WHEN 'Medium' THEN 4
        WHEN 'Standard' THEN 5
        WHEN 'High' THEN 6
        WHEN 'Highest' THEN 7
        END`), 'DESC'
    ]
*/
const customOrder = (column, values, direction) => {
  let orderByClause = 'CASE ';
  for (let index = 0; index < values.length; index += 1) {
    let value = values[index];
    if (typeof value === 'string') value = `'${value}'`;
    orderByClause += `WHEN ${column} = ${value} THEN '${index}' `;
  }
  orderByClause += `ELSE ${column} END`;
  return [Sequelize.literal(orderByClause), direction];
};

async function getAllTaskForManager(inputs, _filter, _sort) {
  const filter = _.cloneDeep(_filter);
  const sort = _.cloneDeep(_sort);
  this.logger.debug(
    `[getAllTaskForManager] : Received Filter: ${JSON.stringify(filter)}`,
  );
  const { projectId, limit, offset } = inputs;

  const stateInput = {};
  stateInput.projectId = projectId;

  let where = {};
  where.ProjectId = projectId;
  where.status = {
    [Op.ne]: 'In-Active',
  };

  const filterColumnsMapping = {
    taskCreatedDate: `createdAt`,
    taskUpdatedDate: `updatedAt`,
    accountName: `$Accounts.name$`,
    contactEmail: `$Contacts.email$`,
    userName: `$User.userName$`,
    accountDisposition: `$Accounts->TaskLink.disposition$`,
    contactDisposition: `$Contacts->TaskLink.disposition$`,
    accountFinalDisposition: `$Accounts.disposition$`,
    potential: `$Accounts.potential$`,
  };
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    filter,
    where,
  );

  const sortColumnsMapping = {
    accountName: `"Accounts"."name"`,
    contactEmail: `"Contacts"."email"`,
    userName: `"User"."userName"`,
    accountDisposition: `"Accounts->TaskLink"."disposition"`,
    contactDisposition: `"Contacts->TaskLink"."disposition"`,
    accountFinalDisposition: `"Accounts"."disposition"`,
    potential: `"Accounts"."potential"`,
  };
  const customSortColumn = {
    priority: [
      'Overtime',
      'Lowest',
      'Low',
      'Medium',
      'Standard',
      'High',
      'Highest',
    ],
    status: ['In-Active', 'Pending', 'Working', 'Completed'],
  };
  let order = [];
  order = this.sortHandler.buildOrderClause(
    sortColumnsMapping,
    customSortColumn,
    sort,
    order,
  );

  // set default order
  if (!order.length) order = [['createdAt', 'asc']];

  const result = await Task.findAndCountAll({
    attributes: [
      'status',
      'priority',
      ['createdAt', 'taskCreatedDate'],
      ['updatedAt', 'taskUpdatedDate'],
      [Sequelize.col('Accounts.name'), 'accountName'],
      [Sequelize.col('Accounts.potential'), 'potential'],
      [Sequelize.col('Accounts.website'), 'website'],
      [Sequelize.col('Accounts.TaskLink.disposition'), 'accountDisposition'],
      [Sequelize.col('Contacts.TaskLink.disposition'), 'contactDisposition'],
      [Sequelize.col('Accounts.disposition'), 'accountFinalDisposition'],
      [Sequelize.col('Contacts.email'), 'contactEmail'],
      [Sequelize.col('User.userName'), 'userName'],
    ],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
      },
      {
        model: Account,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
      {
        model: Contact,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
    ],
    where,
    order,
    raw: true,
    offset,
    limit,
    subQuery: false,
  });

  const tasks = {};
  tasks.totalCount = result.count;
  tasks.docs = result.rows;
  return tasks;
}

function buildOrderClause(sort) {
  // default sort UpdatedAt
  let order = [['updatedAt', 'desc']];

  const isSortEmpty = _.isEmpty(sort);
  if (isSortEmpty) {
    return order;
  }

  // Account Name Sort
  if (_.get(sort, 'accountName', null))
    order = [[Account, 'name', sort.accountName]];

  // Account Website Sort
  if (_.get(sort, 'accountWebsite', null))
    order = [[Account, 'website', sort.accountWebsite]];

  // Account Disposition Sort
  if (_.get(sort, 'accountDisposition', null))
    order = [[Account, 'disposition', sort.accountDisposition]];

  // Account qualifiedContacts Sort
  if (_.get(sort, 'qualifiedContacts', null))
    order = [[Account, 'qualifiedContacts', sort.qualifiedContacts]];

  // Account potential Sort
  if (_.get(sort, 'potential', null))
    order = [[Account, 'potential', sort.potential]];

  // Task Assign Date Sort
  if (_.get(sort, 'taskCreatedAtDate', null))
    order = [['createdAt', sort.taskCreatedAtDate]];

  // Task DueDate Sort
  if (_.get(sort, 'taskDueDate', null)) order = [['dueDate', sort.taskDueDate]];

  // Task Priority Sort
  if (_.get(sort, 'taskPriority', null))
    order = [
      this.customOrder(
        'priority',
        ['Overtime', 'Lowest', 'Low', 'Medium', 'Standard', 'High', 'Highest'],
        sort.taskPriority,
      ),
    ];

  return order;
}

async function getAllTaskForAgent(inputs, filter, sort) {
  const { limit, offset, projectId, userId, countOnly } = inputs;

  const stateInput = {};
  stateInput.projectId = projectId;
  stateInput.userId = userId;
  stateInput.priority = filter.priority;

  let accountFilter = {};

  if (filter.accountName) {
    accountFilter.name = Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('name')),
      'LIKE',
      `%${filter.accountName.toLowerCase()}%`,
    );
  }

  const counts = await this.getTaskStats(stateInput, accountFilter);
  if (countOnly) {
    return counts;
  }

  const order = this.buildOrderClause(sort);

  accountFilter = {};
  let where = {};

  const userRole = 'agent';
  [where, accountFilter] = this.buildWhereClause(filter, userRole);

  where.ProjectId = projectId;
  where.UserId = userId;
  if (!where.status) {
    where.status = {
      [Op.ne]: 'In-Active',
    };
  }
  const projectWhere = { id: projectId };

  const result = await this.fetchAllTask(
    where,
    order,
    offset,
    limit,
    projectWhere,
    accountFilter,
  );

  const tasks = {};
  tasks.counts = counts;
  tasks.docs = result.docs;
  tasks.totalCount = result.totalCount;
  return tasks;
}

async function fetchTaskById(where) {
  const result = await Task.findAll({
    attributes: TASK_FIELDS,
    where: [where],
    include: [
      {
        model: TaskType,
        attributes: ['id', 'type'],
      },
      {
        model: Project,
        attributes: ['id', 'name', 'ClientId', 'contactExpiry', 'TemplateId'],
      },
      {
        model: Account,
        attributes: ACCOUNT_FIELDS,
        through: {},
      },
      {
        model: Contact,
        attributes: CONTACT_FIELDS,
        through: {},
      },
      {
        model: User,
        attributes: USER_FIELDS,
      },
    ],
    subQuery: false,
  });
  return result;
}

async function getTaskByIdForManager(inputs) {
  const { projectId } = inputs;
  const { taskId } = inputs;

  const where = {};
  where.id = taskId;
  where.ProjectId = projectId;

  const result = await fetchTaskById(where);
  return result;
}

async function getTaskByIdForAgent(inputs) {
  const { taskId } = inputs;
  const { projectId } = inputs;
  const { userId } = inputs;

  const where = {};
  where.id = taskId;
  where.ProjectId = projectId;
  where.UserId = userId;

  const result = await fetchTaskById(where);
  return result;
}

/**
 * Replace User Id with User Name.
 * @param {Object} _taskLink - TaskLink Object.
 */
async function convertUserIdsToName(_taskLink) {
  const taskLink = _.cloneDeep(_taskLink);

  if (!taskLink) {
    return taskLink;
  }

  const { createdBy, updatedBy, UserId } = taskLink || {};
  let users = {};
  try {
    users = await this.userCacheService.getUsers([
      createdBy,
      updatedBy,
      UserId,
    ]);
  } catch (err) {
    const error = new Error();
    error.message = err.message;
    error.code = 'USER_CACHE_ERROR';
    error.desc = `Could Not Convert USer Id to Names`;
    const serializedError = serializeError(error);
    this.logger.error(
      `[CONVERT_USER_ID_TO_NAME] :: User Ids Are "${createdBy}, ${updatedBy}, ${UserId}" : Error : ${JSON.stringify(
        serializedError,
      )}`,
    );
  }

  taskLink.createdByUserName =
    users[createdBy] &&
    (users[createdBy].firstName || users[createdBy].lastName)
      ? _.join(
          [users[createdBy].firstName, users[createdBy].lastName],
          ' ',
        ).trim()
      : createdBy;
  taskLink.updatedByUserName =
    users[updatedBy] &&
    (users[updatedBy].firstName || users[updatedBy].lastName)
      ? _.join(
          [users[updatedBy].firstName, users[updatedBy].lastName],
          ' ',
        ).trim()
      : updatedBy;
  taskLink.UserIdUserName =
    users[UserId] && (users[UserId].firstName || users[UserId].lastName)
      ? _.join([users[UserId].firstName, users[UserId].lastName], ' ').trim()
      : UserId;

  return taskLink;
}

async function getProjectName(projectId) {
  const result = await Project.findOne({
    attributes: ['aliasName'],
    where: [
      {
        id: projectId,
      },
    ],
  });

  if (!result) throw new Error(`Project not Found for ${projectId} id`);
  return result.aliasName;
}

function isToday(_someDate) {
  const someDate = new Date(_someDate);
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
}

function generateFileNameBasedOnFilter(_projectName, filter) {
  let projectName = _projectName;
  projectName = projectName.trim().replace(' ', '_');

  let fileName = `${projectName.trim()}_all_task_${new Date(Date.now())}.csv`;

  if (!filter || !Object.keys(filter).length) {
    return fileName;
  }

  if (
    filter.updatedAt &&
    Array.isArray(filter.updatedAt.value) &&
    filter.updatedAt.value.length === 2 &&
    this.isToday(filter.updatedAt.value[0]) &&
    this.isToday(filter.updatedAt.value[1])
  ) {
    fileName = `${projectName}_today_task_${new Date(Date.now())}.csv`;
    return fileName;
  }

  if (
    filter.contactStage &&
    filter.contactStage.value.toLowerCase() === 'compliance'
  ) {
    fileName = `${projectName}_compliance_task_${new Date(Date.now())}.csv`;
    return fileName;
  }
  if (
    filter.contactComplianceStatus &&
    filter.contactComplianceStatus.value.toLowerCase() === 'non-compliant'
  ) {
    fileName = `${projectName}_non_compliant_task_${new Date(Date.now())}.csv`;
    return fileName;
  }
  if (!_.isEmpty(filter)) {
    fileName = `${projectName}_filtered_task_${new Date(Date.now())}.csv`;
    return fileName;
  }
  return fileName;
}

async function addFile(fileData, isAsyncDownload = false) {
  const { fileId, projectId, createdBy, jobId } = fileData;
  const projectName = await this.getProjectName(projectId);
  const fileName = this.generateFileNameBasedOnFilter(
    projectName,
    fileData.filter,
  );
  const fileType = FILE_TYPE.EXPORT;
  const format = '.csv';
  const mapping = {};
  const updatedBy = fileData.updatedBy || createdBy;
  const jobStatus = isAsyncDownload ? JOB_STATUS.QUEUED : JOB_STATUS.PROCESSING;
  const operationName = isAsyncDownload
    ? JOB_OPERATION_NAME.ASYNC_TASK_EXPORT
    : JOB_OPERATION_NAME.SYNC_TASK_EXPORT;
  const operationParam = {};
  const resultProcessed = 0;
  const resultImported = 0;
  const resultErrored = 0;
  const rowCount = 0;
  const location = isAsyncDownload
    ? `files/${projectId}/${fileType}/${fileName}`
    : '';

  return File.create(
    {
      id: fileId,
      name: fileName,
      type: fileType,
      format,
      location,
      mapping,
      ProjectId: projectId,
      createdBy,
      updatedBy,
      Job: {
        id: jobId,
        status: jobStatus,
        operation_name: operationName,
        operation_param: operationParam,
        result_processed: resultProcessed,
        result_imported: resultImported,
        result_errored: resultErrored,
        createdBy,
        updatedBy,
        row_count: rowCount,
      },
    },
    {
      include: [
        {
          model: Job,
        },
      ],
    },
  );
}

async function enqueue(payload, serviceEndpointUrl) {
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: serviceEndpointUrl,
    },
  };

  if (payload) {
    task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );
    task.httpRequest.headers = {
      'Content-Type': 'application/json',
    };
  }

  task.httpRequest.oidcToken = {
    serviceAccountEmail: this.config.SERVICE_ACCOUNT_EMAIL,
  };

  // Send create task request.
  this.logger.info(`Sending task: ${JSON.stringify(task)}`);

  const request = {
    parent: this.config.TASK_QUEUE_PATH,
    task,
  };
  try {
    const [response] = await taskQueueClient.createTask(request);
    this.logger.info(`Created task ${response.name}`);
    return;
  } catch (error) {
    this.logger.error('>>>>>>>> :/ Cloud Not Create Task');
    this.logger.error(error);
    throw error;
  }
}

async function downloadAllTask(
  _inputs,
  filter,
  writableStream,
  isAsyncDownload = false,
) {
  const inputs = _.cloneDeep(_inputs);
  const fileData = {
    fileId: inputs.fileId,
    jobId: inputs.jobId,
    projectId: inputs.projectId,
    filter,
    createdBy: inputs.userId,
    updatedBy: inputs.userId,
  };

  await this.addFile(fileData, isAsyncDownload);

  if (isAsyncDownload) {
    const payload = {
      jobId: fileData.jobId,
      projectId: fileData.projectId,
      filter,
    };

    // Async Download Procedure
    return this.enqueue(payload, this.config.FILE_DOWNLOAD_ENDPOINT);
  }
  // sync Download Procedure
  const dbParam = {
    jobId: inputs.jobId,
    projectId: inputs.projectId,
    filter,
  };
  return taskExporter(writableStream, dbParam);
}

async function getFileIsLarger(projectId, filter, maximumRecords = 0) {
  let where = {};
  where.ProjectId = projectId;
  where.status = {
    [Op.ne]: 'In-Active',
  };

  // filter for contact
  let contactFilter = null;

  /*
        - compliance team will use this filter to download all contact to do compliance
        - if contact stage is 'compliance' that means that contact need to be go for compliance check
      */
  if (
    filter.contactStage &&
    filter.contactStage.value.toLowerCase() === 'compliance'
  ) {
    contactFilter = {};
    contactFilter.stage = COMPLIANCE_STAGE;
  } else if (
    /*
          - ops team will use this filter to download all contacts which is rejected in compliance
          - if contact status is 'non-compliant' that means that contact is rejected in compliance
        */
    filter.contactComplianceStatus &&
    filter.contactComplianceStatus.value.toLowerCase() === 'non-compliant'
  ) {
    contactFilter = {};
    contactFilter.complianceStatus = {
      [Op.in]: COMPLIANCE_STATUS.NON_COMPLIANT,
    };
  } else if (!_.isEmpty(filter)) {
    const filterColumnsMapping = {
      taskCreatedDate: `createdAt`,
      taskUpdatedDate: `updatedAt`,
      accountName: `$Accounts.name$`,
      contactEmail: `$Contacts.email$`,
      userName: `$User.userName$`,
      accountDisposition: `$Accounts->TaskLink.disposition$`,
      contactDisposition: `$Contacts->TaskLink.disposition$`,
      accountFinalDisposition: `$Accounts.disposition$`,
      potential: `$Accounts.potential$`,
    };
    where = this.filterHandler.buildWhereClause(
      filterColumnsMapping,
      filter,
      where,
    );
  }

  const count = await Task.count({
    where: [where],
    include: [
      {
        model: Account,
      },
      {
        model: User,
        required: true,
      },
      {
        model: Contact,
        where: contactFilter,
      },
    ],
  });

  return count > maximumRecords;
}

function formatDate(dateRange) {
  let startDate;
  let endDate;
  if (Array.isArray(dateRange) && dateRange.length === 2) {
    startDate = new Date(dateRange[0]);
    endDate = new Date(dateRange[1]);
  }
  return [startDate, endDate];
}

async function getCountsOfPositiveDisposedContacts(
  projectId,
  dispositions,
  userId,
  dateRange,
) {
  let startDate;
  let endDate;
  if (dateRange) {
    [startDate, endDate] = formatDate(dateRange);
  }

  const where = {};

  where['$Tasks.TaskLink.objectType$'] = {
    [Op.eq]: 'contact',
  };
  where['$Tasks.TaskLink.updatedBy$'] = {
    [Op.eq]: userId,
  };
  where['$Tasks.TaskLink.disposition$'] = {
    [Op.or]: dispositions,
  };

  where[Op.and] = [];

  if (startDate && endDate) {
    where[Op.and] = [
      Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('Tasks.TaskLink.updatedAt')),
        '>=',
        startDate,
      ),
      Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('Tasks.TaskLink.updatedAt')),
        '<=',
        endDate,
      ),
    ];
  }

  const contactInclude = [];
  const contactIncludeTaskObj = {
    model: Task,
    where: [
      {
        ProjectId: projectId,
      },
    ],
    through: {
      attributes: [],
    },
  };
  contactInclude.push(contactIncludeTaskObj);

  const complianceWhereClause = [
    {
      [Op.or]: [
        {
          '$Contact.complianceStatus$': {
            [Op.or]: COMPLIANCE_STATUS.COMPLIANT,
          },
        },
        {
          '$Contact.complianceStatus$': {
            [Op.is]: null,
          },
        },
        {
          '$Contact.complianceStatus$': {
            [Op.eq]: '',
          },
        },
      ],
    },
  ];

  where[Op.and] = _.concat(where[Op.and], complianceWhereClause);

  const result = await Contact.count({
    where: [where],
    include: contactInclude,
  });

  return result;
}

async function getCountsOfDisposedAccount(
  projectId,
  userId,
  dateRange,
  dispositions,
) {
  let startDate;
  let endDate;
  if (dateRange) {
    [startDate, endDate] = formatDate(dateRange);
  }

  const where = {
    objectType: 'account',
    updatedBy: userId,
    disposition: {
      [Op.ne]: null,
      [Op.ne]: '',
    },
  };

  if (dispositions) {
    where.disposition = {
      [Op.or]: dispositions,
    };
  }

  if (startDate && endDate) {
    where[Op.and] = [
      Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('Tasks.TaskLink.updatedAt')),
        '>=',
        startDate,
      ),
      Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('Tasks.TaskLink.updatedAt')),
        '<=',
        endDate,
      ),
    ];
  }

  const result = await Account.count({
    include: [
      {
        model: Task,
        where: [
          {
            ProjectId: projectId,
          },
        ],
        through: {
          where: [where],
        },
      },
    ],
  });

  return result;
}

async function getCountsOfDisposedContactsOfAnAccount(
  projectId,
  dispositions,
  accountId,
) {
  const where = {};

  where['$Contact.disposition$'] = {
    [Op.or]: dispositions,
  };

  where[Op.and] = [
    {
      [Op.or]: [
        {
          '$Contact.complianceStatus$': {
            [Op.or]: COMPLIANCE_STATUS.COMPLIANT,
          },
        },
        {
          '$Contact.complianceStatus$': {
            [Op.is]: null,
          },
        },
        {
          '$Contact.complianceStatus$': {
            [Op.eq]: '',
          },
        },
      ],
    },
  ];

  const result = await Contact.count({
    where: [where],
    include: [
      {
        model: Account,
        where: [
          {
            ProjectId: projectId,
          },
          {
            id: accountId,
          },
        ],
      },
    ],
  });

  return result;
}

async function getTasksLiveCounts(inputs, filter) {
  const { userId, projectId, countsToCalculate, accountId } = inputs;
  const dateRange = filter.updatedAt;

  if (dateRange && !Array.isArray(dateRange) && !dateRange.length === 2) {
    throw new Error('Invalid format of "updatedAt" filter');
  }

  let dispositions = await this.dispositionCacheService.getDispositions(
    ['positiveContactDispositions'],
    ['Contact/Account', 'Contact'],
    ['Positive'],
  );
  dispositions = dispositions.positiveContactDispositions;
  let accountDispositions = await this.dispositionCacheService.getDispositions(
    ['negativeAccountDispositions'],
    ['Contact/Account', 'Account'],
    ['Negative'],
  );
  accountDispositions = accountDispositions.negativeAccountDispositions;

  const tasksLiveCounts = {
    positiveDisposedContactsCounts: 0,
    positiveDisposedContactsOverallCounts: 0,
    disposedAccountCounts: 0,
    disposedAccountOverallCounts: 0,
    negativeDisposedAccountCounts: 0,
    negativeDisposedAccountOverallCounts: 0,
    positiveDisposedContactsCountsOfAnAccount: 0,
  };
  if (dateRange) {
    if (_.indexOf(countsToCalculate, 'contacts') > -1) {
      tasksLiveCounts.positiveDisposedContactsCounts =
        await getCountsOfPositiveDisposedContacts(
          projectId,
          dispositions,
          userId,
          dateRange,
        );
    }
    if (_.indexOf(countsToCalculate, 'accounts') > -1) {
      tasksLiveCounts.disposedAccountCounts = await getCountsOfDisposedAccount(
        projectId,
        userId,
        dateRange,
        null,
      );

      tasksLiveCounts.negativeDisposedAccountCounts =
        await getCountsOfDisposedAccount(
          projectId,
          userId,
          dateRange,
          accountDispositions,
        );
    }
  }
  if (_.indexOf(countsToCalculate, 'contacts') > -1) {
    tasksLiveCounts.positiveDisposedContactsOverallCounts =
      await getCountsOfPositiveDisposedContacts(
        projectId,
        dispositions,
        userId,
        null,
      );
  }
  if (_.indexOf(countsToCalculate, 'accounts') > -1) {
    tasksLiveCounts.disposedAccountOverallCounts =
      await getCountsOfDisposedAccount(projectId, userId, null, null);

    tasksLiveCounts.negativeDisposedAccountOverallCounts =
      await getCountsOfDisposedAccount(
        projectId,
        userId,
        null,
        accountDispositions,
      );
  }
  if (accountId) {
    tasksLiveCounts.positiveDisposedContactsCountsOfAnAccount =
      await getCountsOfDisposedContactsOfAnAccount(
        projectId,
        dispositions,
        accountId,
      );
  }

  return tasksLiveCounts;
}

async function updateJobStatus(jobId, status) {
  let result;
  try {
    result = await Job.update(
      {
        status,
      },
      {
        where: {
          id: jobId,
        },
      },
    );
  } catch (error) {
    console.log(
      `Could not update a Job Status: {JobId: ${jobId},Error: ${error}}`,
    );
  }
  return result;
}

function validateTasksAssignData(data, filter, sort) {
  const {
    taskTypeId,
    taskAllocationStrategy,
    blockSize,
    limitAssignment,
    limitSize,
    allocationOf,
    agents,
  } = data || {};

  if (!taskTypeId) throw new Error(`taskTypeId is required`);
  if (!Object.values(TASK_ALLOCATION_STRATEGY).includes(taskAllocationStrategy))
    throw new Error(`Received Unknown Task Allocation strategy`);
  if (
    taskAllocationStrategy === TASK_ALLOCATION_STRATEGY.BLOCK &&
    (Number(blockSize).toString() === 'NaN' || Number(blockSize) < 1)
  )
    throw new Error(`Block Size value is incorrect`);
  if (!Object.values(LIMIT_ASSIGNMENT).includes(limitAssignment))
    throw new Error(`Received Unknown Limit Assignment`);
  if (
    limitAssignment === LIMIT_ASSIGNMENT.ASSIGN_TOP &&
    (Number(limitSize).toString() === 'NaN' || Number(limitSize) < 1)
  )
    throw new Error(`Limit Size value is incorrect`);
  if (!Object.values(ALLOCATION_OF).includes(allocationOf))
    throw new Error(`Received Unknown AllocationOf Value`);
  if (!Array.isArray(agents) || !agents.length)
    throw new Error(`Agents value is incorrect`);

  let filterableColumns = {};
  let sortableColumns = [];
  const multipleSort = true;

  switch (allocationOf) {
    case ALLOCATION_OF.ACCOUNT:
      filterableColumns = {
        label: { type: 'string', operator: ['='] },
        createdAt: { type: 'array', operator: ['between'] },
        updatedAt: { type: 'array', operator: ['between'] },
        potential: { type: 'string', operator: ['=', '<', '>'] },
        disposition: { type: 'array', operator: ['='] },
        stage: { type: 'string', operator: ['='] },
        isAssigned: { type: 'string', operator: ['='] },
        masterDisposition: { type: 'string', operator: ['='] },
      };
      sortableColumns = ['name', 'domain'];
      break;
    case ALLOCATION_OF.CONTACT:
      filterableColumns = {
        companyName: { type: 'string', operator: ['=', 'isNull'] },
        domain: { type: 'string', operator: ['=', 'isNull'] },
        accountLabel: { type: 'string', operator: ['='] },
        contactLabel: { type: 'string', operator: ['='] },
        stage: { type: 'string', operator: ['='] },
        researchStatus: { type: 'array', operator: ['='] },
        updatedBy: { type: 'array', operator: ['=', 'isNull'] },
        updatedAt: { type: 'array', operator: ['between'] },
      };
      sortableColumns = ['companyName', 'domain'];
      break;
    case ALLOCATION_OF.TASK:
      filterableColumns = {
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
      sortableColumns = [
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
      break;
    default:
      throw new Error(`Received Unknown AllocationOf Value`);
  }

  if (!_.isEmpty(sortableColumns)) {
    this.sortHandler.validate(sortableColumns, sort, multipleSort);
  }

  if (!_.isEmpty(filterableColumns)) {
    this.filterHandler.validate(filterableColumns, filter);
  }
}

async function checkTaskAllocationIsInProgress(projectId) {
  const result = await TaskAllocationTemp.findOne({
    attributes: ['id'],
    where: { projectId },
  });
  if (result)
    throw new Error(
      `The process of task allocation for this project is already underway so you cannot start another process`,
    );
}

async function tasksAssign(inputs) {
  const {
    taskTypeId,
    taskAllocationStrategy,
    blockSize,
    limitAssignment,
    limitSize,
    allocationOf,
    agents,
    projectId,
    userId,
    filter,
  } = inputs || {};
  let { sort } = inputs;
  let objectType;
  let serviceEndpointUrl;

  await this.checkTaskAllocationIsInProgress(projectId);

  switch (allocationOf) {
    case ALLOCATION_OF.ACCOUNT:
      // set default sort
      if (_.isEmpty(sort)) sort = { domain: 'asc', name: 'asc' };

      serviceEndpointUrl = this.config.ACCOUNT_ALLOCATION_ENDPOINT;
      objectType = ALLOCATION_OF.ACCOUNT;
      break;
    case ALLOCATION_OF.CONTACT:
      // set default sort
      if (_.isEmpty(sort)) sort = { domain: 'asc', companyName: 'asc' };

      serviceEndpointUrl = this.config.CONTACT_ALLOCATION_ENDPOINT;
      objectType = ALLOCATION_OF.CONTACT;
      break;
    case ALLOCATION_OF.TASK:
      // set default sort
      if (_.isEmpty(sort)) sort = { userName: 'asc' };

      serviceEndpointUrl = this.config.TASK_ALLOCATION_ENDPOINT;
      objectType = 'account'; // todo: temp hack to resolve issue, it should null for contact reassignment
      break;

    default:
      throw new Error(`Received Unknown AllocationOf Value`);
  }

  const fileId = uuid();
  const jobId = uuid();
  const projectName = await this.getProjectName(projectId);
  const fileName = `${projectName}_${Date.now()}.csv`;
  const fileType = FILE_TYPE.TASK_ALLOCATION;
  const format = '.csv';
  const mapping = { ObjectId: 'ObjectId', UserName: 'userName' };
  const createdBy = userId;
  const updatedBy = userId;
  const jobStatus = JOB_STATUS.QUEUED;
  const operationName = JOB_OPERATION_NAME.TASK_ALLOCATION;
  const operationParam = {
    mapping,
    projectId,
    taskAllocationStrategy,
    blockSize,
    limitAssignment,
    limitSize,
    agents,
    filter,
    sort,
    taskTypeId,
    objectType,
  };
  const resultProcessed = 0;
  const resultImported = 0;
  const resultErrored = 0;
  const rowCount = 0;
  const location = `files/${projectId}/${fileType}/${fileId}${format}`;

  await File.create(
    {
      id: fileId,
      name: fileName,
      type: fileType,
      format,
      location,
      mapping,
      ProjectId: projectId,
      createdBy,
      updatedBy,
      Job: {
        id: jobId,
        status: jobStatus,
        operation_name: operationName,
        operation_param: operationParam,
        result_processed: resultProcessed,
        result_imported: resultImported,
        result_errored: resultErrored,
        createdBy,
        updatedBy,
        row_count: rowCount,
      },
    },
    {
      include: [
        {
          model: Job,
        },
      ],
    },
  );

  const payload = {
    jobId,
    projectId,
    userId,
  };

  await this.enqueue(payload, serviceEndpointUrl);

  return 'Task Assign job added Successfully';
}

async function getAllTaskStatsOfAProject(inputs, _filter) {
  this.logger.debug(
    `[getAllTaskStatsOfAProject] : Received Filter: ${JSON.stringify(_filter)}`,
  );
  const { projectId } = inputs;

  let where = {};
  where.ProjectId = projectId;

  const modifiedFilter = _.omit(_filter, ['status', 'dueDate']);

  let todayDate = new Date(Date.now());
  todayDate.setHours(0, 0, 0, 0);
  todayDate = todayDate.toISOString();

  const filterColumnsMapping = {
    taskCreatedDate: `createdAt`,
    taskUpdatedDate: `updatedAt`,
    accountName: `$Accounts.name$`,
    contactEmail: `$Contacts.email$`,
    userName: `$User.userName$`,
    accountDisposition: `$Accounts->TaskLink.disposition$`,
    contactDisposition: `$Contacts->TaskLink.disposition$`,
    accountFinalDisposition: `$Accounts.disposition$`,
    potential: `$Accounts.potential$`,
  };
  where = this.filterHandler.buildWhereClause(
    filterColumnsMapping,
    modifiedFilter,
    where,
  );

  const result = await Task.findOne({
    attributes: [
      [
        sequelize.literal(
          `count(CASE WHEN ("Task"."status" != ('In-Active')) THEN 1 END)`,
        ),
        'Total',
      ],
      [
        sequelize.literal(
          `count(CASE WHEN ("Task"."status" = ('Completed')) THEN 1 END)`,
        ),
        'Completed',
      ],
      [
        sequelize.literal(
          `count(CASE WHEN ("Task"."status" = ('Pending')) AND ("Task"."dueDate" < ('${todayDate}')) THEN 1 END)`,
        ),
        'Overdue',
      ],
      [
        sequelize.literal(
          `count(CASE WHEN ("Task"."status" = ('Pending')) AND ("Task"."dueDate" >= ('${todayDate}')) THEN 1 END)`,
        ),
        'Upcoming',
      ],
      [
        sequelize.literal(
          `count(CASE WHEN ("Task"."status" = ('Working')) THEN 1 END)`,
        ),
        'Working',
      ],
    ],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
        ],
      },
      {
        model: Account,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
      {
        model: Contact,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
    ],
    where,
    raw: true,
    subQuery: false,
  });

  const counts = [];
  _.forOwn(result, (value, key) => {
    counts.push({
      status: key,
      count: value,
    });
  });

  return counts;
}

async function getTaskDispositions(inputs) {
  this.logger.debug(
    `[getTaskDispositions] : Received Inputs: ${JSON.stringify(inputs)}`,
  );
  const { projectId } = inputs;

  const where = {};
  where.ProjectId = projectId;
  where.status = {
    [Op.ne]: 'In-Active',
  };

  const result = await Task.findAll({
    attributes: [
      [Sequelize.col('Contacts.TaskLink.disposition'), 'contactDisposition'],
      [Sequelize.col('Accounts.TaskLink.disposition'), 'accountDisposition'],
    ],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
      },
      {
        model: Account,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
      {
        model: Contact,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
    ],
    where,
    raw: true,
  });

  const uniqueDispositions = [];
  result.forEach((item) => {
    if (item.contactDisposition) {
      uniqueDispositions.push(item.contactDisposition);
    }
    if (item.accountDisposition) {
      uniqueDispositions.push(item.accountDisposition);
    }
  });

  return _.uniq(uniqueDispositions);
}

async function getTaskUsersByType(inputs) {
  const { projectId } = inputs;

  const where = {};
  where.ProjectId = projectId;
  where.status = {
    [Op.ne]: 'In-Active',
  };

  let userQuery = [];
  let targetId = '';

  switch (inputs.fieldType) {
    case 'account':
      userQuery = [
        [Sequelize.col('Accounts.TaskLink.objectType'), 'ObjectType'],
        [Sequelize.col('User.userName'), 'accountUserName'],
      ];
      targetId = 'accountUserName';
      break;
    case 'contact':
      userQuery = [
        [Sequelize.col('Contacts.TaskLink.objectType'), 'ObjectType'],
        [Sequelize.col('User.userName'), 'contactUserName'],
      ];
      targetId = 'contactUserName';
      break;
    default:
      break;
  }

  const result = await Task.findAll({
    attributes: userQuery,
    include: [
      {
        model: User,
        attributes: [],
        required: true,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
      },
      {
        model: Account,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
      {
        model: Contact,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
    ],
    where,
    raw: true,
  });

  const taskUsers = [];
  result.forEach((item) => {
    if (item.ObjectType) {
      taskUsers.push(item[targetId]);
    }
  });
  return _.uniq(taskUsers);
}

async function getTaskUsers(inputs) {
  this.logger.debug(
    `[getTaskUsers] : Received Inputs: ${JSON.stringify(inputs)}`,
  );

  if (inputs.fieldType) {
    const typeResult = await getTaskUsersByType(inputs);
    return typeResult;
  }
  const { projectId } = inputs;

  const where = {};
  where.ProjectId = projectId;
  where.status = {
    [Op.ne]: 'In-Active',
  };

  const result = await Task.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('User.userName')), 'userName'],
    ],
    where: [where],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
      },
      {
        model: Account,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
      {
        model: Contact,
        attributes: [],
        required: false,
        where: [
          {
            '$Task.ProjectId$': projectId,
          },
          { '$Task.status$': where.status },
        ],
        through: {
          attributes: [],
          where: [
            {
              linkType: 'input',
            },
          ],
        },
      },
    ],
    raw: true,
  });

  const taskUsers = result.map((item) => item.userName);
  return taskUsers;
}

TaskCRUDService.prototype = {
  getAllTaskForManager,
  getAllTaskForAgent,
  getTaskByIdForManager,
  getTaskByIdForAgent,
  downloadAllTask,
  getTaskStatsProjectWise,
  convertUserIdsToName,
  getTasksLiveCounts,
  getFileIsLarger,
  enqueue,
  updateJobStatus,
  validateTasksAssignData,
  getProjectName,
  checkTaskAllocationIsInProgress,
  tasksAssign,
  getAllTaskStatsOfAProject,
  addFile,
  getTaskDispositions,
  getTaskUsers,
  generateFileNameBasedOnFilter,
  getTaskStats,
  buildOrderClause,
  buildWhereClause,
  isToday,
  fetchAllTask,
  customOrder,
  buildWhereClauseForStatus,
};

module.exports = TaskCRUDService;
