const { Client } = require('@nexsalesdev/dataautomation-datamodel');
const { Sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../config/settings/settings-config');

const { Op } = Sequelize;

function ClientCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAllClient(_inputs) {
  const inputs = _inputs;
  const { limit, offset } = inputs;

  console.log(
    `[GetAllClient] :: Received Limit : ${limit} and Offset: ${offset}`,
  );

  const result = await Client.findAll({
    attributes: ['id', 'name'],
  });

  return result;
}

async function getAllClientDetails(inputs) {
  const { limit } = inputs;
  const { offset } = inputs;

  const result = await Client.findAndCountAll({
    order: [['createdAt', 'desc']],
    offset,
    limit,
  });

  const clients = {};
  clients.totalCount = result.count;
  clients.docs = result.rows;
  return clients;
}

async function getClient(inputs) {
  const { clientId } = inputs;

  const result = await Client.findOne({
    where: [
      {
        id: clientId,
      },
    ],
  });

  return result;
}

async function addClient(inputs) {
  const { clientId } = inputs;
  const { name } = inputs;
  const { pseudonym } = inputs;
  const { createdBy } = inputs;
  const updatedBy = inputs.updatedBy || inputs.createdBy;
  const { createdAt } = inputs;
  const updatedAt = inputs.updatedAt || inputs.createdAt;

  const clientFoundByName = await Client.findOne({
    where: {
      name: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('name')),
        '=',
        name.toLowerCase(),
      ),
      id: {
        [Op.ne]: clientId,
      },
    },
  });

  if (clientFoundByName) {
    return {
      code: 'CLIENT_WITH_NAME_ALREADY_EXISTS',
      message: 'Client With Name Already Exists',
    };
  }

  const clientFoundByPseudonym = await Client.findOne({
    where: {
      pseudonym: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('pseudonym')),
        '=',
        pseudonym.toLowerCase(),
      ),
      id: {
        [Op.ne]: clientId,
      },
    },
  });

  if (clientFoundByPseudonym) {
    return {
      code: 'CLIENT_WITH_PSEUDONYM_ALREADY_EXISTS',
      message: 'Client With Pseudonym Already Exists',
    };
  }

  const result = await Client.create({
    id: clientId,
    name,
    pseudonym,
    createdBy,
    updatedBy,
    createdAt,
    updatedAt,
  });

  return result;
}

async function editClient(inputs) {
  const { clientId } = inputs;
  const { name } = inputs;
  const { pseudonym } = inputs;
  const { updatedBy } = inputs;

  const clientFoundById = await Client.findOne({
    where: {
      id: clientId,
    },
  });

  if (!clientFoundById) {
    const error = new Error();
    error.message = `Could Not Update Client`;
    error.code = 'CLIENT_NOT_FOUND';
    throw error;
  }

  const clientFoundByName = await Client.findOne({
    where: {
      name: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('name')),
        '=',
        name.toLowerCase(),
      ),
      id: {
        [Op.ne]: clientId,
      },
    },
  });

  if (clientFoundByName) {
    return {
      code: 'CLIENT_WITH_NAME_ALREADY_EXISTS',
      message: 'Client With Name Already Exists',
    };
  }

  const clientFoundByPseudonym = await Client.findOne({
    where: {
      pseudonym: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('pseudonym')),
        '=',
        pseudonym.toLowerCase(),
      ),
      id: {
        [Op.ne]: clientId,
      },
    },
  });

  if (clientFoundByPseudonym) {
    return {
      code: 'CLIENT_WITH_PSEUDONYM_ALREADY_EXISTS',
      message: 'Client With Pseudonym Already Exists',
    };
  }

  const result = await Client.update(
    {
      name,
      pseudonym,
      updatedBy,
    },
    {
      where: [
        {
          id: clientId,
        },
      ],
    },
  );
  return result;
}

ClientCRUDService.prototype = {
  getAllClient,
  getAllClientDetails,
  getClient,
  addClient,
  editClient,
};

module.exports = ClientCRUDService;
