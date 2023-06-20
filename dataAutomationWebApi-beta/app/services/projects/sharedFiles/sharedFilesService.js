const {
  Sequelize,
  SharedFile,
  SharedFileProject,
  Project,
} = require('@nexsalesdev/dataautomation-datamodel');

const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;
const FILE_TYPES = {
  SUPPRESSION: 'Suppression',
  INCLUSION: 'Inclusion',
  SUPPORTING_DOCUMENT: 'Supporting Document',
  IMPORT: 'Import',
  EXPORT: 'Export',
  IN_PROGRESS: 'In Progress',
};

function SharedFilesService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function buildOrderClause(sort, order) {
  // name
  if (
    sort.name &&
    (sort.name.toLowerCase() === 'asc' || sort.name.toLowerCase() === 'desc')
  ) {
    order.push(['name', sort.name]);
  }

  // updatedAt
  if (
    sort.updatedAt &&
    (sort.updatedAt.toLowerCase() === 'asc' ||
      sort.updatedAt.toLowerCase() === 'desc')
  ) {
    order.push(['updatedAt', sort.updatedAt]);
  }
  return order;
}

async function getAllLinkableSuppressionFiles(inputs) {
  const { projectId, clientId, limit, offset, sort, search } = inputs;

  let order = [];
  order = buildOrderClause(sort, order);

  const result = await SharedFile.findAll({
    where: {
      ClientId: clientId,
      '$Projects.id$': {
        [Op.or]: {
          [Op.ne]: projectId,
          [Op.eq]: null,
        },
      },
      name: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('SharedFile.name')),
        'LIKE',
        `${search}%`.toLowerCase(),
      ),
    },
    attributes: ['id', 'name'],
    include: [
      {
        model: Project,
        attributes: [],
        through: {
          attributes: [],
          where: {
            ProjectId: projectId,
          },
        },
        required: false,
      },
    ],
    raw: true,
    limit,
    offset,
    order,
    subQuery: false,
  });
  return result;
}

async function unlinkSuppressionFile(inputs) {
  const { projectId, sharedFileId } = inputs;

  const result = await SharedFileProject.destroy({
    where: {
      SharedFileId: sharedFileId,
      ProjectId: projectId,
    },
  });

  return result;
}

async function linkSuppressionFiles(inputs) {
  const { projectId, userId, fileIds } = inputs;

  const linkFiles = [];

  for (let index = 0; index < fileIds.length; index += 1) {
    const sharedFileProject = {
      SharedFileId: fileIds[index],
      ProjectId: projectId,
      createdBy: userId,
      updatedBy: userId,
    };
    linkFiles.push(sharedFileProject);
  }

  const result = await SharedFileProject.bulkCreate(linkFiles);
  return result;
}

async function checkSuppressionFileExistance(fileName, clientId) {
  const isSuppressionFileExists = await SharedFile.findOne({
    where: {
      ClientId: clientId,
      name: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('name')),
        fileName.toLowerCase(),
      ),
      type: FILE_TYPES.SUPPRESSION,
    },
  });

  this.logger.info(
    `[SHARED-FILE-SERVICE] :: Suppression File Existance Check completed successfully`,
  );

  if (isSuppressionFileExists) {
    return { isSuppressionFileExists: true };
  }
  return { isSuppressionFileExists: false };
}

SharedFilesService.prototype = {
  getAllLinkableSuppressionFiles,
  unlinkSuppressionFile,
  linkSuppressionFiles,
  checkSuppressionFileExistance,
};
module.exports = SharedFilesService;
