const { ProjectType } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../../config/settings/settings-config');

function ProjectTypeCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAllProjectType() {
  const result = await ProjectType.findAll({
    attributes: ['id', 'type'],
  });

  return result;
}

// async function getProjectType (inputs) {
//   const projectId = inputs.projectId;

//   const result = await ProjectType.findOne({
//     where: [
//       {
//         ProjectId: projectId
//       }
//     ]
//   });

//   return result;
// }

// async function addProjectType (inputs) {
//   const projectTypeId = inputs.projectTypeId;
//   const type = inputs.type;
//   const meta = inputs.meta;
//   const createdAt = inputs.createdAt;
//   const updatedAt = inputs.updatedAt || inputs.createdAt;
//   const createdBy = inputs.createdBy;
//   const updatedBy = inputs.updatedBy || inputs.createdBy;
//   const projectId = inputs.projectId;

//   const result = await ProjectType.create({
//     id: projectTypeId,
//     type: type,
//     meta: meta,
//     createdAt: createdAt,
//     updatedAt: updatedAt,
//     createdBy: createdBy,
//     updatedBy: updatedBy,
//     ProjectId: projectId
//   });

//   return result;
// }

// async function editProjectType (inputs) {
//   const type = inputs.type;
//   const meta = inputs.meta;
//   const updatedAt = inputs.updatedAt;
//   const updatedBy = inputs.updatedBy;
//   const projectId = inputs.projectId;

//   const result = await ProjectType.update(
//     {
//       type: type,
//       meta: meta,
//       updatedAt: updatedAt,
//       updatedBy: updatedBy
//     },
//     {
//       where: [
//         {
//           ProjectId: projectId
//         }
//       ]
//     }
//   );

//   return result;
// }

ProjectTypeCRUDService.prototype = {
  getAllProjectType,
};

module.exports = ProjectTypeCRUDService;
