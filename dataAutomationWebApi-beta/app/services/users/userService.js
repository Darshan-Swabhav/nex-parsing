const { User } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../config/settings/settings-config');

function UserCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAllUser(inputs, _attributes) {
  let attributes = _attributes;
  const { limit, role } = inputs;
  const offset = inputs.offset || 0;
  let where = null;

  if (role) {
    where = [
      {
        role: [role],
      },
    ];
  }
  if (!attributes) {
    attributes = ['id', 'userName', 'firstName', 'lastName', 'role', 'gmailId'];
  }

  const result = await User.findAndCountAll({
    attributes,
    where,
    order: [['userName', 'ASC']],
    offset,
    limit,
  });

  const users = {};
  users.totalCount = result.count;
  users.docs = result.rows;

  return users;
}

async function createUser(inputs) {
  const { userId, userName, firstName, lastName, role, createdBy, createdAt } =
    inputs;
  const updatedBy = inputs.updatedBy || inputs.createdBy;
  const updatedAt = inputs.updatedAt || inputs.createdAt;

  const result = await User.create({
    id: userId,
    userName,
    firstName,
    lastName,
    role,
    createdBy,
    updatedBy,
    createdAt,
    updatedAt,
  });

  return result;
}

async function editUser(inputs) {
  const { userId, userName, firstName, lastName, role, updatedBy, updatedAt } =
    inputs;

  const result = await User.update(
    {
      userName,
      firstName,
      lastName,
      role,
      updatedBy,
      updatedAt,
    },
    {
      where: [
        {
          id: userId,
        },
      ],
    },
  );
  return result;
}

async function downloadAllUser(_inputs, writeStream) {
  let pageNo = 0;
  const inputs = _inputs;
  inputs.limit = 1000;
  inputs.offset = 0;
  const attributes = ['id', 'userName', 'firstName', 'lastName', 'role'];
  let users = await getAllUser(inputs, attributes);

  for (pageNo = 1; users.docs.length !== 0; pageNo += 1) {
    this.logger.info(`[USER-SERVICE] :: get user page no: ${pageNo - 1}`);
    const results = users.docs;
    for (let index = 0; index < results.length; index += 1) {
      writeStream.write(results[index].dataValues);
    }
    inputs.offset = pageNo * inputs.limit;
    // eslint-disable-next-line no-await-in-loop
    users = await getAllUser(inputs, attributes);
  }
  writeStream.end();
}

function convertToCSVFormat(row) {
  return row;
}

UserCRUDService.prototype = {
  getAllUser,
  createUser,
  editUser,
  downloadAllUser,
  convertToCSVFormat,
};

module.exports = UserCRUDService;
