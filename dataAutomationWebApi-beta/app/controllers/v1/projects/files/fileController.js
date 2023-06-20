/* eslint-disable global-require */
const path = require('path');
const { uuid } = require('uuidv4');
const errors = require('throw.js');
const { isEmpty, isString } = require('lodash');
const { serializeError } = require('serialize-error');
const {
  USER_ROLES,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');

const errorMessages = require('../../../../config/error.config.json');

const validFileType = [
  'Suppression',
  'Inclusion',
  'Supporting Document',
  'Import',
  'In Progress',
];
const validOperationName = [
  'accountSuppression',
  'contactSuppression',
  'accountInclusion',
  'contactInclusion',
  'accountImport',
  'contactImport',
  'acccountInProgress',
  'contactInProgress',
  'taskImport',
];

/**
 * @openapi
 * definitions:
 *   file:
 *     properties:
 *       id:
 *         type: string
 *       name:
 *         type: string
 *       type:
 *         type: string
 *         enum: ['Suppression', 'Inclusion', 'Supporting Document', 'Import', 'In Progress']
 *       mapping:
 *         type: object
 *       operationName:
 *         type: string
 *         enum: ['accountSuppression', 'contactSuppression', 'accountInclusion', 'contactInclusion', 'accountImport', 'contactImport', 'acccountInProgress', 'contactInProgress']
 *       ProjectId:
 *         type: string
 *   fileUpload:
 *     properties:
 *       fileId:
 *         type: string
 *       fileName:
 *         type: string
 *       jobId:
 *         type: string
 *
 *   fileFacetResponse:
 *     properties:
 *       client:
 *        type: array
 *       createdBy:
 *        type: array
 *
 * /files:
 *   get:
 *     security:
 *       - auth0_jwk: []
 *     operationId: getFile
 *     tags:
 *       - File
 *     description: This is the file data list route that fetches the file data for that user
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: projectId
 *         type: string
 *         required: true
 *         description: project id
 *     responses:
 *       '200':
 *         description: returns the file data list array for that project
 *         schema:
 *           $ref: '#/definitions/file'
 *       '400':
 *         description: if required parameters does not pass then send the params error
 *       '500':
 *         description: if something fails internally then send an error
 *   post:
 *     security:
 *       - auth0_jwk: []
 *     operationId: postFile
 *     tags:
 *       - File
 *     description: Upload File Route
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: fileUploadBody
 *         schema:
 *           type: object
 *           required:
 *             - projectId
 *             - fileType
 *             - mapping
 *             - rowCount
 *             - fileName
 *             - fileContentType
 *           properties:
 *             fileName:
 *               type: string
 *             fileContentType:
 *               type: string
 *             fileType:
 *               type: string
 *               enum: ['Suppression', 'Inclusion', 'Supporting Document', 'Import', 'In Progress']
 *             operationName:
 *               type: string
 *               enum: ['accountSuppression', 'contactSuppression', 'accountInclusion', 'contactInclusion', 'accountImport', 'contactImport', 'acccountInProgress', 'contactInProgress']
 *             mapping:
 *               type: object
 *             rowCount:
 *               type: string
 *             projectId:
 *               type: string
 *             taskTypeId:
 *               type: string
 *             objectType:
 *               type: string
 *     responses:
 *       '200':
 *         description: Return an SignedUrl to Upload File.
 *         schema:
 *           type: object
 *           properties:
 *             uploadUrl:
 *               type: string
 *       '400':
 *         description: if required parameters does not pass then send the params error
 *       '500':
 *         description: if something fails internally then send an error
 *
 * /files/{fileId}:
 *   get:
 *     security:
 *       - auth0_jwk: []
 *     operationId: getFileById
 *     tags:
 *       - File
 *     description: This is the File route that returns File data or File.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: fileId
 *         type: string
 *         required: true
 *         description: file id
 *       - in: query
 *         name: shouldGenerateDownloadUrl
 *         type: boolean
 *         required: false
 *         description: flag to get file download URL
 *     responses:
 *       '200':
 *         description: returns the file data or file
 *         schema:
 *           $ref: '#/definitions/file'
 *       '400':
 *         description: if required parameters does not pass then send the params error
 *       '404':
 *         description: if a file data not found then send an error
 *       '500':
 *         description: if something fails internally then send an error
 *   delete:
 *     security:
 *       - auth0_jwk: []
 *     operationId: deleteFileById
 *     tags:
 *       - File
 *     description: This is the File route that deletes the file.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: fileId
 *         type: string
 *         required: true
 *         description: file id
 *     responses:
 *       '200':
 *         description: returns the file id which deleted
 *         schema:
 *           $ref: '#/definitions/file'
 *       '400':
 *         description: if required parameters does not pass then send the params error
 *       '404':
 *         description: if a file data not found then send an error
 *       '500':
 *         description: if something fails internally then send an error
 *
 * /clients/{clientId}/projects/{projectId}/sharedFiles/fileExistance:
 *   post:
 *     security:
 *       - auth0_jwk: []
 *     operationId: checkSuppressionFileExistence
 *     tags:
 *       - File
 *     description: Check Existance Of Suppression File
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: projectId
 *         type: string
 *         required: true
 *         description: project id
 *       - in: path
 *         name: clientId
 *         type: string
 *         required: true
 *         description: client id
 *       - in: body
 *         name: suppressionFileCheck
 *         schema:
 *           type: object
 *           required:
 *             - fileName
 *           properties:
 *             fileName:
 *               type: string
 *     responses:
 *       '201':
 *         description: Return suppression file existance result.
 *       '400':
 *         description: if required parameters does not pass then send the params error
 *       '500':
 *         description: if something fails internally then send an error
 *
 * /files/facets:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getSharedFileFacets
 *     tags:
 *       - Shared Files Unique Facet fields
 *     description: This is shared files facet route which fetch the unique value for given field
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the unique list of chosen shared file field
 *         schema:
 *            $ref: '#/definitions/fileFacetResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function FileController() {
  const FileCRUDService = require('../../../../services/projects/files/fileService');
  const ValidationService = require('../../../../services/helpers/validationService');
  const PaginationService = require('../../../../services/helpers/paginationService');
  const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
  const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');

  this.fileCrudService = new FileCRUDService();
  this.validationService = new ValidationService();
  this.paginationService = new PaginationService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[FILE-CONTROLLER] :: This user does not have access to the route {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const onlySharedFiles = req.query.onlySharedFiles || false;

  let filter = req.query.filter || '{}';
  let sort = req.query.sort || '{}';

  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[FILE-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The filter value type is not an object',
      });
    }
  }

  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[FILE-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The sort value type is not an object',
      });
    }
  }

  let filterableColumns = {};
  let sortableColumns = [];
  const multipleSort = false;

  if (onlySharedFiles) {
    filterableColumns = {
      fileName: { type: 'string', operator: ['='] },
      client: { type: 'string', operator: ['='] },
      createdBy: { type: 'array', operator: ['='] },
      createdAt: { type: 'array', operator: ['between'] },
      projectName: { type: 'string', operator: ['=', 'isNull'] },
    };
    sortableColumns = ['fileName', 'createdBy', 'createdAt'];
  }

  if (!isEmpty(filterableColumns)) {
    try {
      self.filterHandler.validate(filterableColumns, filter);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[FILE-CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: error.message,
      });
    }
  }

  if (!isEmpty(sortableColumns)) {
    try {
      self.sortHandler.validate(sortableColumns, sort, multipleSort);
    } catch (err) {
      const error = serializeError(err);
      logger.error(
        `[FILE-CONTROLLER] :: The value of sort is not correct {userId : ${userId}, error: ${JSON.stringify(
          error,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: error.message,
      });
    }
  }

  const { projectId } = req.query;
  if (!onlySharedFiles && !projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  logger.info(
    `[FILE-CONTROLLER] :: START :: Fetch all File {userId : ${userId}}`,
  );

  try {
    let fileList;

    if (onlySharedFiles) {
      const getAllSharedFileInputs = {
        limit: page.limit,
        offset: page.offset,
        filter,
        sort,
      };
      fileList = await self.fileCrudService.getAllSharedFile(
        getAllSharedFileInputs,
      );
    } else {
      const getAllFileInputs = {
        limit: page.limit,
        offset: page.offset,
        projectId,
      };
      fileList = await self.fileCrudService.getAllFile(getAllFileInputs);
    }

    logger.info(
      `[FILE-CONTROLLER] :: SUCCESS :: Fetch all File {userId : ${userId}}`,
    );

    return res.status(200).send(fileList);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[FILE-CONTROLLER] :: ERROR :: Fetch all File {userId : ${userId}, error : ${JSON.stringify(
        error,
      )}}}`,
    );

    return res.status(500).send({
      err: error.message,
      desc: 'Could Not Get File List',
    });
  }
}

async function post(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  let data = req.body;

  // cleanup
  data = self.validationService.removeNullKeysInObj(data);

  // find Missing Properties
  const missingProperties = self.validationService.validateObj(data, [
    'projectId',
    'fileType',
    'mapping',
    'rowCount',
    'fileName',
    'fileContentType',
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

  if (data.fileType !== 'Supporting Document' && !data.operationName) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'operationName is required',
    });
  }

  if (
    data.fileType !== 'Supporting Document' &&
    !validOperationName.includes(data.operationName)
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `${data.operationName} operation name is invalid`,
    });
  }

  if (
    data.operationName === 'taskImport' &&
    !(data.taskTypeId || data.objectType)
  ) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `taskTypeId and objectType are required`,
    });
  }

  if (data.mapping) {
    try {
      data.mapping = JSON.parse(data.mapping);
    } catch (error) {
      logger.error(
        `[FILE-CONTROLLER] :: Could not parse data.mapping in Json format {userId : ${userId}}`,
      );
    }
  }

  logger.info(`[FILE-CONTROLLER] :: START :: Upload File {userId : ${userId}}`);
  data.fileId = uuid();
  data.jobId = uuid();
  data.createdBy = userId;
  data.format = path.extname(data.fileName);
  if (data.taskTypeId && data.objectType) {
    logger.debug(
      `[FILE-CONTROLLER] :: validate Object : ${JSON.stringify(data)}`,
    );
    logger.debug(`[FILE-CONTROLLER] :: Task Type Id : ${data.taskTypeId}`);
    logger.debug(`[FILE-CONTROLLER] :: ObjectType : ${data.objectType}`);
    data.operationParam = {
      mapping: data.mapping,
      taskTypeId: data.taskTypeId,
      objectType: data.objectType,
    };
  } else {
    data.operationParam = { mapping: data.mapping };
  }

  try {
    const result = await self.fileCrudService.createFile(data);

    logger.info(
      `[FILE-CONTROLLER] :: SUCCESS :: Upload File {userId : ${userId}}`,
    );

    return res.status(201).send(result);
  } catch (err) {
    console.log(err);
    logger.error(
      `[FILE-CONTROLLER] :: ERROR :: Upload File {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Create File',
    });
  }
}

async function getFileById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { fileId } = req.params;
  // const fileId = 'ABC';

  if (!fileId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'fileId is required',
    });
  }

  if (!isString(fileId)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'expected fileId to be an string',
    });
  }

  const shouldGenerateDownloadUrl =
    req.query.shouldGenerateDownloadUrl || false;

  if (shouldGenerateDownloadUrl) {
    try {
      logger.info(
        `[FILE-CONTROLLER] :: START :: Generate File Download URL { fileId: ${fileId}, userId : ${userId} }`,
      );

      const fileDownloadUrl =
        await self.fileCrudService.generateFileDownloadURL(fileId);

      logger.info(
        `[FILE-CONTROLLER] :: SUCCESS :: Generated File Download URL { fileId: ${fileId}, userId : ${userId} }`,
      );
      return res.status(200).send(fileDownloadUrl);
    } catch (e) {
      const error = serializeError(e);

      logger.error(
        `[FILE-CONTROLLER] :: ERROR :: Could Not Generate Download URL{ fileId: ${fileId}, userId : ${userId}, error : ${JSON.stringify(
          error,
        )}}`,
      );

      if (e.code && e.code === 'FILE_NOT_FOUND') {
        return res.status(404).send({
          err: `File with Id '${fileId}' does not Exist`,
          desc: `Could Not Generate Download URL`,
        });
      }

      return res.status(500).send({
        error: error.message,
        desc: `Something went wrong, Could Not Generate Download URL`,
      });
    }
  }

  try {
    logger.info(
      `[FILE-CONTROLLER] :: START :: get File By Id { fileId: ${fileId}, userId : ${userId} }`,
    );

    const file = await self.fileCrudService.getFileById(fileId);

    if (file) {
      logger.info(
        `[FILE-CONTROLLER] :: SUCCESS :: Get File By Id { fileId: ${fileId}, userId : ${userId} }`,
      );
      return res.status(200).send(file);
    }

    logger.warn(
      `[FILE-CONTROLLER] :: SUCCESS :: Could Not Find File { fileId: ${fileId}, userId : ${userId} }`,
    );

    return res.status(404).send({
      err: `File with Id '${fileId}' does not Exist`,
      desc: `Could Not Get File`,
    });
  } catch (e) {
    const error = serializeError(e);

    logger.error(
      `[FILE-CONTROLLER] :: ERROR :: Could Not Get File By Id { fileId: ${fileId}, userId : ${userId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      error: error.message,
      desc: `Something went wrong, Could Not Get File`,
    });
  }
}

async function deleteFileById(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { fileId } = req.params;
  if (!fileId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'fileId is required',
    });
  }

  logger.info(
    `[FILE-CONTROLLER] :: START :: Delete File by Id {userId : ${userId}}`,
  );

  try {
    const inputs = { fileId, userId };
    await self.fileCrudService.deleteFileById(inputs);

    logger.info(
      `[FILE-CONTROLLER] :: SUCCESS :: Delete File by Id {userId : ${userId}}`,
    );
    return res.status(200).send(fileId);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[FILE-CONTROLLER] :: ERROR :: Delete File by Id {userId : ${userId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.status(500).send({
      err: error.message,
      desc: `Could Not Delete File`,
    });
  }
}

async function getFileFacets(settingsConfig, req, res, next) {
  const self = this;
  const { logger } = settingsConfig;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  if (!roles.includes(USER_ROLES.MANAGER)) {
    logger.error(
      `[FILE-CONTROLLER] :: This user does not have access to the route {userId : ${userId}}}`,
    );
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });
  }

  const { field } = req.query;

  if (!field) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'field is required',
    });
  }

  let result;
  try {
    switch (field) {
      case 'createdBy':
        result = await self.fileCrudService.getCreatedBy();
        logger.info(
          `[FILE-CONTROLLER] :: SUCCESS :: Fetch all Shared File Users {userId : ${userId}}`,
        );
        break;
      case 'client':
        result = await self.fileCrudService.getClients();
        logger.info(
          `[FILE-CONTROLLER] :: SUCCESS :: Fetch all Shared File Disposition {userId : ${userId}}`,
        );
        break;
      default:
        return res.status(400).send({
          err: 'Bad Request',
          desc: 'Requested field is not defined',
        });
    }
    return res.status(200).send(result);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[FILE-CONTROLLER] :: ERROR :: Fetch all Shared File Facets {userId : ${userId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Shared File Facets',
    });
  }
}

FileController.prototype = {
  get,
  post,
  getFileById,
  delete: deleteFileById,
  getFileFacets,
};

const fileController = new FileController();

module.exports = fileController;
