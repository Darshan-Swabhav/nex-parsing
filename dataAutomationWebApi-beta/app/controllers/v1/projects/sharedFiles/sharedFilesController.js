/* eslint-disable global-require */
const _ = require('lodash');
const errors = require('throw.js');
const { serializeError } = require('serialize-error');
const errorMessages = require('../../../../config/error.config.json');

/**
 *
 *  @openapi
 *
 *  definitions:
 *   listFile:
 *    type: array
 *    items:
 *     type: object
 *     properties:
 *      id:
 *       type: string
 *      name:
 *       type: string
 *
 * /clients/{clientId}/projects/{projectId}/sharedFiles:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getLinkableFile
 *     tags:
 *     - SharedFiles
 *     description: This route returns all Linkable File to Current Project using clientId and projectId
 *     produces:
 *     - application/json
 *     parameters:
 *     - in: path
 *       name: clientId
 *       type: string
 *       required: true
 *       description: Client Id
 *     - in: path
 *       name: projectId
 *       type: string
 *       required: true
 *       description: Project Id
 *     responses:
 *       '200':
 *         description: Returns all Linkable File of a project
 *         schema:
 *           $ref: '#/definitions/listFile'
 *       '400':
 *         description: If required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: linkSharedFiles
 *     tags:
 *       - SharedFiles
 *     description: This is Link shared File route
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: clientId
 *         type: string
 *         required: true
 *         description: Client Id
 *       - in: path
 *         name: projectId
 *         type: string
 *         required: true
 *         description: Project Id
 *       - in: body
 *         name: body
 *         schema:
 *          type: object
 *          properties:
 *            filesId:
 *              type: array
 *              items:
 *                type: string
 *     produces:
 *       - application/json
 *     responses:
 *       '201':
 *         description: returns the Link created
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 * /clients/{clientId}/projects/{projectId}/sharedFiles/{sharedFileId}:
 *   delete:
 *     security:
 *        - auth0_jwk: []
 *     operationId: deleteSharedFileLink
 *     tags:
 *     - SharedFiles
 *     description: This Shared File route unlinks a file of project using project file id
 *     produces:
 *     - application/json
 *     parameters:
 *     - in: path
 *       name: clientId
 *       type: string
 *       required: true
 *       description: Client Id
 *     - in: path
 *       name: projectId
 *       type: string
 *       required: true
 *       description: Project Id
 *     - in: path
 *       name: sharedFileId
 *       type: string
 *       required: true
 *       description: Delete File id
 *     responses:
 *       '200':
 *         description: delete a shared file link from the project
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 */

function SharedFilesController() {
  const SharedFilesService = require('../../../../services/projects/sharedFiles/sharedFilesService');
  const PaginationService = require('../../../../services/helpers/paginationService');

  this.paginationService = new PaginationService();
  this.sharedFilesService = new SharedFilesService();
}

async function getAllLinkableSuppressionFiles(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId, clientId } = req.params;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!clientId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'clientId is required',
    });
  }

  let sort = {};
  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 25;
  const page = self.paginationService.paginate(pageNo, pageSize);
  const search = req.query.param || '';
  sort = req.query.sort || {};

  if (typeof sort === 'string') {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      logger.error(
        `[SHARED-FILE-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}}`,
      );
    }
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.clientId = clientId;
  inputs.sort = sort;
  inputs.search = search;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  logger.info(
    `[SHARED-FILE-CONTROLLER] :: START :: Fetch All Linkable Suppression :: ${inputs.projectId}Files of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const linkableSuppressionFiles =
      await self.sharedFilesService.getAllLinkableSuppressionFiles(inputs);

    logger.info(
      `[SHARED-FILE-CONTROLLER] :: SUCCESS :: Fetch All Linkable Suppression Files of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(linkableSuppressionFiles);
  } catch (err) {
    logger.error(
      `[SHARED-FILE-CONTROLLER] :: ERROR :: Fetch All Linkable Suppression Files of Project {userId : ${userId}, projectId : ${projectId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get All Linkable Suppression Files',
    });
  }
}

async function linkSuppressionFiles(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId, clientId } = req.params;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  if (!clientId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'clientId is required',
    });
  }

  const checkSuppressionFileExistance =
    req.query.checkSuppressionFileExistance || false;

  const { fileIds, fileName } = req.body;

  if (checkSuppressionFileExistance) {
    if (!fileName) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'fileName is required for file existence check',
      });
    }
  }

  if (!checkSuppressionFileExistance) {
    if (!_.isArray(fileIds) || !fileIds.length) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'fileIds is required for file existence check',
      });
    }
  }

  if (checkSuppressionFileExistance) {
    logger.info(
      `[SHARED-FILE-CONTROLLER] :: START :: Check Suppression File Existance {userId : ${userId}}`,
    );

    try {
      const suppressionFileExistance =
        await self.sharedFilesService.checkSuppressionFileExistance(
          fileName,
          clientId,
        );

      logger.info(
        `[SHARED-FILE-CONTROLLER] :: SUCCESS :: Check Suppression File Existance {userId : ${userId}}`,
      );
      return res.status(200).send(suppressionFileExistance);
    } catch (err) {
      const suppressionFileExistanceSerializedError = serializeError(err);

      logger.error(
        `[SHARED-FILE-CONTROLLER] :: ERROR :: Check Suppression File Existance {userId : ${userId}, error : ${JSON.stringify(
          suppressionFileExistanceSerializedError,
        )}}`,
      );

      return res.status(500).send({
        error: err.message,
        desc: `Could Not Check Suppression File Existance for File ${fileName}`,
      });
    }
  }
  const inputs = {};
  inputs.projectId = projectId;
  inputs.clientId = clientId;
  inputs.userId = userId;
  inputs.fileIds = fileIds;

  logger.info(
    `[SHARED-FILE-CONTROLLER] :: START :: Link All Suppression Files to :: ${inputs.projectId}Files of Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const linkableSuppressionFiles =
      await self.sharedFilesService.linkSuppressionFiles(inputs);

    logger.info(
      `[SHARED-FILE-CONTROLLER] :: SUCCESS :: Link All Suppression Files of Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(linkableSuppressionFiles);
  } catch (err) {
    const linkableSuppressionFilesSerializedError = serializeError(err);

    logger.error(
      `[SHARED-FILE-CONTROLLER] :: ERROR :: Link All Suppression Files of Project {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        linkableSuppressionFilesSerializedError,
      )}}`,
    );

    return res.status(500).send({
      error: err.message,
      desc: 'Could Not add All Linkable Suppression Files',
    });
  }
}

async function unlinkSuppressionFile(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId, sharedFileId } = req.params;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }
  if (!sharedFileId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'sharedFileId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;
  inputs.sharedFileId = sharedFileId;

  logger.info(
    `[SHARED-FILE-CONTROLLER] :: START :: Unlink Suppression File  by Id {userId : ${userId}, projectId : ${projectId} , sharedFileId : ${sharedFileId}}`,
  );

  try {
    const sharedFiles = await this.sharedFilesService.unlinkSuppressionFile(
      inputs,
    );

    logger.info(
      `[SHARED-FILE-CONTROLLER] :: SUCCESS :: Unlink Suppression File by Id {userId : ${userId}, projectId : ${projectId} , sharedFileId : ${sharedFileId}}`,
    );

    return res.sendStatus(200).send(sharedFiles);
  } catch (err) {
    logger.error(
      `[SHARED-FILE-CONTROLLER] :: ERROR :: Unlink Suppression File by Id {userId : ${userId}, projectId : ${projectId} , sharedFileId : ${sharedFileId}, error : ${err.message}}`,
    );

    return res.sendStatus(500).send({
      err,
      desc: 'Could Not Delete SHARED-FILE',
    });
  }
}
SharedFilesController.prototype = {
  unlinkFile: unlinkSuppressionFile,
  getAllLinkableFiles: getAllLinkableSuppressionFiles,
  linkFiles: linkSuppressionFiles,
};

const sharedFilesController = new SharedFilesController();

module.exports = sharedFilesController;
