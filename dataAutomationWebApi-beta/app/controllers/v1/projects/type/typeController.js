/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../../config/error.config.json');

/**
 * @openapi
 *
 * definitions:
 *   projectType:
 *     properties:
 *       id:
 *        type: string
 *        description: project id
 *       type:
 *        type: string
 *        description: project type name
 *
 * /projects/types:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getProjectTypes
 *     tags:
 *       - PROJECT Type
 *     description: This is project type list route which fetch the all the project type
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the project type array
 *         schema:
 *            $ref: '#/definitions/projectType'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */
function ProjectTypeController() {
  const ProjectTypeCRUDService = require('../../../../services/projects/types/typeService');

  this.projectTypeCrudService = new ProjectTypeCRUDService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  logger.info(
    `[PROJECT-TYPE-CONTROLLER] :: START ::Fetch All Project Type {userId : ${userId}}`,
  );

  try {
    const projectType = await self.projectTypeCrudService.getAllProjectType();

    logger.info(
      `[PROJECT-TYPE-CONTROLLER] :: SUCCESS :: Fetch All Project Type {userId : ${userId}`,
    );

    return res.status(200).send(projectType);
  } catch (err) {
    logger.error(
      `[PROJECT-TYPE-CONTROLLER] :: ERROR :: Fetch All Project Type {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get ProjectType',
    });
  }
}

// async function getProjectTypeById (settingsConfig, req, res, next) {
//   const self = this;
//   const logger = settingsConfig.logger || console.log;
//   const userId = req.user.sub;

//   if (!userId) {
//     next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
//   }

//   const projectId = req.params.projectId;

//   if (!projectId) {
//     return res.status(400).send({
//       err: 'Bad Request',
//       desc: 'projectId is required'
//     });
//   }

//   logger.info(
//     `[PROJECT-TYPE-CONTROLLER] :: START :: Fetch ProjectType by Id {userId : ${userId}, projectId : ${projectId}}`
//   );

//   var inputs = {};
//   inputs.projectId = projectId;

//   try {
//     const projectType = await self.projectTypeCrudService.getProjectType(
//       inputs
//     );

//     logger.info(
//       `[PROJECT-TYPE-CONTROLLER] :: SUCCESS :: Fetch ProjectType by Id {userId : ${userId}, projectId : ${projectId}}`
//     );

//     res.status(200).send(projectType);
//   } catch (err) {
//     logger.error(
//       `[PROJECT-TYPE-CONTROLLER] :: ERROR :: Fetch ProjectType by Id {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`
//     );

//     return res.status(500).send({
//       err: err,
//       desc: 'Could Not Get ProjectType'
//     });
//   }
// }

ProjectTypeController.prototype = {
  get,
};

const projectTypeController = new ProjectTypeController();

module.exports = projectTypeController;
