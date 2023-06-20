/* eslint-disable global-require */
const { serializeError } = require('serialize-error');
const errors = require('throw.js');
const errorMessages = require('../../../../config/error.config.json');

/**
 * @openapi
 *
 * definitions:
 *   excludedJobTitle:
 *     type: string
 *     description: An excluded job title
 *
 *   errorResponse:
 *     properties:
 *       error:
 *        type: string
 *       description:
 *        type: string
 *
 * tags:
 *   - name: PROJECT Job Titles
 *
 * /projects/{projectId}/excludedJobTitle:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAllExcludedJobTitles
 *     tags:
 *     - JOB_TITLE
 *     description: This route returns excluded job titles of project
 *     parameters:
 *     - in: path
 *       name: projectId
 *       type: string
 *       required: true
 *       description: Unique Id of Project
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Returns the excluded job titles of project
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/excludedJobTitle'
 *       '400':
 *         description: If required parameters not passes then sends the params error
 *         schema:
 *           $ref: '#/definitions/errorResponse'
 *       '403':
 *         description: If user is not authenticate then sends the user authentication error
 *         schema:
 *           $ref: '#/definitions/errorResponse'
 *       '500':
 *         description: if something fails internally then send error
 *         schema:
 *           $ref: '#/definitions/errorResponse'
 */

function JobTitleController() {
  const JobTitleCRUDService = require('../../../../services/projects/jobTitles/jobTitleService');

  this.jobTitleCrudService = new JobTitleCRUDService();
}

async function getAllExcludedJobTitles(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  const inputs = {};
  inputs.projectId = projectId;

  logger.info(
    `[JOBTITLE-CONTROLLER] :: START :: Fetch Excluded Job titles Of A Project {userId : ${userId}, projectId : ${projectId}}`,
  );

  try {
    const excludedJobTitle =
      await self.jobTitleCrudService.getAllExcludedJobTitles(inputs);

    logger.info(
      `[JOBTITLE-CONTROLLER] :: SUCCESS :: Fetch Excluded Job titles Of A Project {userId : ${userId}, projectId : ${projectId}}`,
    );

    return res.status(200).send(excludedJobTitle);
  } catch (err) {
    const error = serializeError(err);
    logger.error(
      `[JOBTITLE-CONTROLLER] :: ERROR :: Fetch Excluded Job titles Of A Project {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        error,
      )}}`,
    );

    return res.sendStatus(500).send({
      error: err.message,
      desc: 'Could Not Fetch Excluded Job titles Of A Project',
    });
  }
}

JobTitleController.prototype = {
  getAllExcludedJobTitles,
};

const jobTitleController = new JobTitleController();

module.exports = jobTitleController;
