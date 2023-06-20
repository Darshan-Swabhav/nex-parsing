/* eslint-disable prettier/prettier */
const { isString } = require('lodash');
const errors = require('throw.js');
const { uuid } = require('uuidv4');
const { serializeError } = require('serialize-error');

const {
  JOB_STATUS,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const FilterHandler = require('@nexsalesdev/master-data-model/lib/services/filterHandler');
const errorMessages = require('../../../../config/error.config.json');
const ImportErrorCRUDService = require('../../../../services/importError/importErrorService');
const PaginationService = require('../../../../services/helpers/paginationService');

const VALID_IMPORT_ERROR_TYPE = ['account', 'contact'];
/**
 *
 * @openapi
 *
 * definitions:
 *   importErrorReportObj:
 *     properties:
 *       category:
 *        type: string
 *       operationName:
 *        type: string
 *       count:
 *        type: integer
 *       unresolvedErrorCount:
 *        type: integer
 *
 *   importErrorFileReportObj:
 *     properties:
 *       id:
 *        type: string
 *       category:
 *        type: string
 *       name:
 *        type: string
 *       operationName:
 *        type: string
 *       totalCount:
 *        type: integer
 *       unresolvedErrorCount:
 *        type: integer
 *
 * /master/importError/{importErrorType}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getImportErrorReport
 *     tags:
 *       - ImportError
 *     description: This is importError Report route which fetch all type of error category with number of failed row
 *     parameters:
 *     - in: path
 *       name: importErrorType
 *       type: string
 *       description: Import Error Type
 *       required: true
 *     - in: query
 *       name: pageNo
 *       type: integer
 *       description: page number
 *     - in: query
 *       name: pageSize
 *       type: integer
 *       description: page sizes
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the import error report
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/importErrorReportObj'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 * 
 * /master/importError/{importErrorType}/files:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getImportErrorFilesReport
 *     tags:
 *       - ImportError
 *     description: This is importError Files Report route which fetch all type of error category with number of failed row
 *     parameters:
 *     - in: path
 *       name: importErrorType
 *       type: string
 *       description: Import Error Type
 *       required: true
 *     - in: query
 *       name: pageNo
 *       type: integer
 *       description: page number
 *     - in: query
 *       name: pageSize
 *       type: integer
 *       description: page sizes
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the import error report
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/importErrorFileReportObj'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function ImportErrorController() {
  this.importErrorCRUDService = new ImportErrorCRUDService();
  this.paginationService = new PaginationService();
  this.filterHandler = new FilterHandler();
}

async function getImportError(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;
  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { importErrorType } = req.params;
  if (!VALID_IMPORT_ERROR_TYPE.includes(importErrorType)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `importType must be specified as ${VALID_IMPORT_ERROR_TYPE.join(' or ')}`,
    });
  }

  const download = req.query.download || false;
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 30;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.userEmail = userEmail;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  let { filter } = req.query || '{}';
  // validate filter
  try {
    if (isString(filter)) {
      filter = JSON.parse(filter);
      self.importErrorCRUDService.validateErrorImportdownloadExport(filter);
    }
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[IMPORT_ERROR_CONTROLLER] :: The value of filter is not correct {userEmail : ${userEmail}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  logger.info(
    `[IMPORT_ERROR_CONTROLLER] :: START :: Fetch Master Import Error Download  {userEmail : ${userEmail}}`,
  );

  const downloadInputs = {};
  try {
    if (download) {
      downloadInputs.fileId = uuid();
      downloadInputs.jobId = uuid();
      downloadInputs.userEmail = userEmail;
      downloadInputs.fileName = req.query.fileName || null;
      logger.info(
        `[IMPORT_ERROR_CONTROLLER] :: Async Download Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );
      const result = await self.importErrorCRUDService.downloadAllImportError(
        downloadInputs,
        filter,
        importErrorType,
      );
      logger.info(
        `[IMPORT_ERROR_CONTROLLER] :: Async Import Error Download Job Creation Success, ${JSON.stringify(
          result,
        )}`,
      );
      return res.status(200).send('Job Submitted Successfully');
    }
  } catch (error) {
    const serializedDownloadError = serializeError(error);
    logger.error(
      `[IMPORT_ERROR_CONTROLLER] :: ERROR :: Could Not Download Imported Error {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedDownloadError,
      )}}`,
    );
    await self.importErrorCRUDService.updateJobStatus(
      downloadInputs.jobId,
      JOB_STATUS.FAILED,
    );

    return res.status(500).send({
      error: serializedDownloadError.message,
      desc: 'Could Not Download Imported Error',
    });
  }

  try {
    const importErrorList = await self.importErrorCRUDService.getAllImportError(
      inputs,
      filter,
      importErrorType,
    );

    logger.info(
      `[IMPORT_ERROR_CONTROLLER] :: SUCCESS :: Fetch all import error for Master {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(importErrorList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[IMPORT_ERROR_CONTROLLER] :: ERROR :: Fetch all import error for Master {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Master Import Error',
    });
  }
}

async function getAllErrorFiles(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console;
  const userEmail = req.user.email;
  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { importErrorType } = req.params;
  if (!VALID_IMPORT_ERROR_TYPE.includes(importErrorType)) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: `importType must be specified as ${VALID_IMPORT_ERROR_TYPE.join(' or ')}`,
    });
  }

  const download = req.query.download || false;
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.userEmail = userEmail;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  let { filter } = req.query || '{}';
  // validate filter
  try {
    if (isString(filter)) {
      filter = JSON.parse(filter);
      self.importErrorCRUDService.validateErrorImportdownloadExport(filter);
    }
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[IMPORT_ERROR_CONTROLLER] :: The value of filter is not correct {userEmail : ${userEmail}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  logger.info(
    `[IMPORT_ERROR_CONTROLLER] :: START :: Fetch Master Import Error Download  {userEmail : ${userEmail}}`,
  );

  const downloadInputs = {};
  try {
    if (download) {
      downloadInputs.fileId = uuid();
      downloadInputs.jobId = uuid();
      downloadInputs.userEmail = userEmail;
      downloadInputs.fileName = req.query.fileName || null;
      logger.info(
        `[IMPORT_ERROR_CONTROLLER] :: Async Download Request Received with params ${JSON.stringify(
          req.param,
        )}`,
      );
      const result = await self.importErrorCRUDService.downloadAllImportError(
        downloadInputs,
        filter,
        importErrorType,
      );
      logger.info(
        `[IMPORT_ERROR_CONTROLLER] :: Async Import Error Download Job Creation Success, ${JSON.stringify(
          result,
        )}`,
      );
      return res.status(200).send('Job Submitted Successfully');
    }
  } catch (error) {
    const serializedDownloadError = serializeError(error);
    logger.error(
      `[IMPORT_ERROR_CONTROLLER] :: ERROR :: Could Not Download Imported Error {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedDownloadError,
      )}}`,
    );
    await self.importErrorCRUDService.updateJobStatus(
      downloadInputs.jobId,
      JOB_STATUS.FAILED,
    );

    return res.status(500).send({
      error: serializedDownloadError.message,
      desc: 'Could Not Download Imported Error',
    });
  }

  try {
    const importErrorList =
      await self.importErrorCRUDService.getAllErrorFiles(
        inputs,
        filter,
        importErrorType,
      );

    logger.info(
      `[IMPORT_ERROR_CONTROLLER] :: SUCCESS :: Fetch all import error for Master {userEmail : ${userEmail}}`,
    );

    return res.status(200).send(importErrorList);
  } catch (err) {
    const serializedError = serializeError(err);
    logger.error(
      `[IMPORT_ERROR_CONTROLLER] :: ERROR :: Fetch all import error for Master {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Master Import Error',
    });
  }
}

ImportErrorController.prototype = {
  getImportError,
  getAllErrorFiles,
};

const importErrorController = new ImportErrorController();

module.exports = importErrorController;
