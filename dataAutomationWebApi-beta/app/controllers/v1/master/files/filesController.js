/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
const path = require('path');
const errors = require('throw.js');
const generateUUID = require('uuidv4');
const { isEmpty, get } = require('lodash');
const { serializeError } = require('serialize-error');
const { sequelize } = require('@nexsalesdev/master-data-model');
const {
  USER_ROLES,
  FILE_TYPES,
  UPLOAD_FILE_OPERATIONS,
  INCLUSION_EXPORT_FILE_OPERATIONS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const errorMessages = require('../../../../config/error.config.json');

const validFileType = [FILE_TYPES.IMPORT, FILE_TYPES.INCLUSION_EXPORT];
const validOperationName = Object.values(UPLOAD_FILE_OPERATIONS).concat(
  Object.values(INCLUSION_EXPORT_FILE_OPERATIONS),
);

/**
 *
 * @openapi
 *
 * /master/files:
 *   post:
 *     security:
 *       - auth0_jwk: []
 *     operationId: uploadMasterFile
 *     tags:
 *       - MasterFile
 *     description: Upload Master File Route
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: fileUploadBody
 *         schema:
 *           type: object
 *           required:
 *             - fileType
 *             - mapping
 *             - fileName
 *             - fileContentType
 *             - operationParam
 *           properties:
 *             fileName:
 *               type: string
 *             fileContentType:
 *               type: string
 *             fileType:
 *               type: string
 *             operationName:
 *               type: string
 *             mapping:
 *               type: object
 *             operationParam:
 *               type: object
 *     responses:
 *       '200':
 *         description: Return an SignedUrl and file id to Upload File.
 *         schema:
 *           type: object
 *           properties:
 *             uploadUrl:
 *               type: string
 *             fileId:
 *               type: string
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '401':
 *         description: if user authentication fails then send error
 *       '403':
 *         description: if user is unauthorized then send error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /master/files/{fileId}:
 *   delete:
 *     security:
 *        - auth0_jwk: []
 *     operationId: deleteMasterFile
 *     tags:
 *       - MasterFile
 *     description: This is a delete master file route
 *     parameters:
 *     - in: path
 *       name: fileId
 *       type: integer
 *       description: file id
 *       required: true
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: successfully delete the master file
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '401':
 *         description: if user authentication fails then send error
 *       '403':
 *         description: if user is unauthorized then send error
 *       '500':
 *         description: if something fails internally then send error
 */

function FilesController() {
  const FileCRUDService = require('../../../../services/master/files/filesService');
  const ValidationService = require('../../../../services/helpers/validationService');

  this.fileCrudService = new FileCRUDService();
  this.validationService = new ValidationService();
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  const fileType = get(req, 'body.fileType');

  // TODO; vivek: need to iterate this code snippet
  if (!roles.includes(USER_ROLES.COMPLIANCE)) {
    if (
      roles.includes(USER_ROLES.MANAGER) &&
      fileType === FILE_TYPES.INCLUSION_EXPORT
    ) {
      // do nothing, let the flow run
    } else {
      logger.error(
        `[MASTER-FILE-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
      );
      return res.status(403).send({
        err: 'User Forbidden',
        desc: 'User not access this route',
      });
    }
  }

  let data = req.body;

  // cleanup
  data = self.validationService.removeNullKeysInObj(data);

  // find Missing Properties
  const missingProperties = self.validationService.validateObj(data, [
    'fileType',
    'mapping',
    'fileName',
    'fileContentType',
    'operationName',
    'operationParam',
    'source',
  ]);

  // check if missing properties are found
  if (!isEmpty(missingProperties)) {
    // some properties are missing, this is bad request
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${missingProperties.join(', ')} is required`,
    });
  }

  // check if given file type is supported by the system
  if (!validFileType.includes(data.fileType)) {
    // given file type is not supported, this is bad request
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${data.fileType} file type is invalid`,
    });
  }

  // check if given operation name is supported by the system
  if (!validOperationName.includes(data.operationName)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${data.operationName} operation name is invalid`,
    });
  }

  if (data.mapping) {
    try {
      data.mapping = JSON.parse(data.mapping);
    } catch (error) {
      const serializedMappingError = serializeError(error);
      logger.error(
        `[MASTER-FILE-CONTROLLER] :: Could not parse mapping in Json format {userEmail : ${userEmail}, error: ${JSON.stringify(
          serializedMappingError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The mapping value type is not an object',
      });
    }
  }

  if (data.operationParam) {
    try {
      data.operationParam = JSON.parse(data.operationParam);
    } catch (error) {
      const serializedOperationParamError = serializeError(error);
      logger.error(
        `[MASTER-FILE-CONTROLLER] :: Could not parse operation params in Json format {userEmail : ${userEmail}, error: ${JSON.stringify(
          serializedOperationParamError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The operation params value type is not an object',
      });
    }
  }
  logger.info(`
    [MASTER-FILE-CONTROLLER] :: START :: Upload Master File {userEmail : ${userEmail}}`);
  data.fileId = generateUUID.uuid();
  data.jobId = generateUUID.uuid();
  data.createdBy = userEmail;
  data.format = path.extname(data.fileName);

  const t = await sequelize.transaction();
  data.transaction = t;

  try {
    const result = await self.fileCrudService.createMasterFile(data);

    logger.info(
      `[MASTER-FILE-CONTROLLER] :: SUCCESS :: Upload Master File {userEmail : ${userEmail}}`,
    );

    await t.commit();
    return res.status(201).send(result);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[MASTER-FILE-CONTROLLER] :: ERROR :: Upload Master File {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    await t.rollback();
    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Upload Master File',
    });
  }
}

async function deleteFileById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;

  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[MASTER-FILE-CONTROLLER] :: This user does not have access to the route {userEmail : ${userEmail}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'fileId is required',
    });
  }

  logger.info(
    `[MASTER-FILE-CONTROLLER] :: START :: Delete Master File by Id {userEmail : ${userEmail}, fileId : ${fileId}}`,
  );

  const inputs = {
    fileId,
    userEmail,
  };

  const t = await sequelize.transaction();
  inputs.transaction = t;

  try {
    await self.fileCrudService.deleteMasterFileById(inputs);

    logger.info(
      `[MASTER-FILE-CONTROLLER] :: SUCCESS :: Delete Master File by Id {userEmail : ${userEmail}, fileId : ${fileId}}`,
    );

    await t.commit();
    return res.status(200).send(fileId);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[MASTER-FILE-CONTROLLER] :: ERROR :: Delete Master File by Id {userEmail : ${userEmail}, fileId : ${fileId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    await t.rollback();
    return res.status(500).send({
      err: error.message,
      desc: `Could Not Delete Master File`,
    });
  }
}

FilesController.prototype = {
  post,
  delete: deleteFileById,
};

const filesController = new FilesController();

module.exports = filesController;
