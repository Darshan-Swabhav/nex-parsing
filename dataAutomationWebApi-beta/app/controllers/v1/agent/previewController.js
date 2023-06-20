/* eslint-disable global-require */
const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

const ROLES = {
  AGENT: 'agent',
};
const SORT_VALUE = ['asc', 'desc'];

/**
 *
 *@openapi
 *
 * definitions:
 *   agentPreview:
 *    properties:
 *      taskId:
 *        type: string
 *      taskStatus:
 *        type: string
 *      projectId:
 *        type: string
 *      contactId:
 *        type: string
 *      date:
 *        type: string
 *      contactDisposeDate:
 *        type: string
 *      accountDisposeDate:
 *        type: string
 *      projectName:
 *        type: string
 *      researchStatus:
 *        type: string
 *      email:
 *        type: string
 *      companyName:
 *        type: string
 *      accountDisposition:
 *        type: string
 *      accountComments:
 *        type: string
 *      ccPersona(contactCustom1):
 *        type: string
 *      prefix:
 *        type: string
 *      firstName:
 *        type: string
 *      middleName:
 *        type: string
 *      lastName:
 *        type: string
 *      jobTitle:
 *        type: string
 *      department:
 *        type: string
 *      function:
 *        type: string
 *      level:
 *        type: string
 *      city:
 *        type: string
 *      state:
 *        type: string
 *      country:
 *        type: string
 *      phone:
 *        type: string
 *      directPhone:
 *        type: string
 *      genericEmail:
 *        type: string
 *      zb:
 *        type: string
 *      zbTime:
 *        type: string
 *      gmailStatus(domainStatus):
 *        type: string
 *      companyWebsite:
 *        type: string
 *      contactDisposition:
 *        type: string
 *      contactComments:
 *        type: string
 *      contactSource(others):
 *        type: string
 *      contactSource(linkedin):
 *        type: string
 *      companyLinkedinUrl:
 *        type: string
 *      cityHQ:
 *        type: string
 *      stateHQ:
 *        type: string
 *      countryHQ:
 *        type: string
 *      phoneHQ:
 *        type: string
 *      industry:
 *        type: string
 *      annualRevenue:
 *        type: string
 *      employeeSize:
 *        type: string
 *      employeeRange(LI):
 *        type: string
 *      employeeSize(LI):
 *        type: string
 *      employeeSource(LI):
 *        type: string
 *      employeeSize(Z+):
 *        type: string
 *      employeeSource(Z+):
 *        type: string
 *      finalBucket:
 *        type: string
 *      employeeSize(others):
 *        type: string
 *      source(employeeSizeOther):
 *        type: string
 *      address1:
 *        type: string
 *      address2:
 *        type: string
 *   agentPreviewResponse:
 *     properties:
 *       count:
 *        type: number
 *       rows:
 *        type: array
 *        items:
 *          $ref: '#/definitions/agentPreview'
 *
 * /agent/preview:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getAgentPreview
 *     tags:
 *       - Agent Preview
 *     description: This is agent preview route which fetch the contact and account dispose data for that agent
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         type: integer
 *         description: The number of page
 *       - in: query
 *         name: pageSize
 *         type: integer
 *         description: The numbers of items to return
 *       - in: query
 *         name: filter
 *         type: string
 *         description: Create an object of the column on which the filter is to be applied and send it by stringify (Like- {columnName- filterValue})
 *       - in: query
 *         name: sort
 *         type: string
 *         description: Create an object of the column on which the sort is to be applied and send it by stringify (Like- {columnName- sortValue})
 *     responses:
 *       '200':
 *         description: returns the agent preview data
 *         schema:
 *            items:
 *              $ref: '#/definitions/agentPreviewResponse'
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

function PreviewController() {
  const PreviewService = require('../../../services/agent/previewService');
  const PaginationService = require('../../../services/helpers/paginationService');

  this.previewService = new PreviewService();
  this.paginationService = new PaginationService();
}

function validateFilterAndSort(filter, sort) {
  const filterColumns = [
    'date',
    'projectName',
    'researchStatus',
    'email',
    'accountDisposition',
    'contactDisposition',
  ];
  const sortColumns = [
    'date',
    'contactDisposeDate',
    'accountDisposeDate',
    'projectName',
    'researchStatus',
    'email',
    'companyName',
    'accountDisposition',
    'accountComments',
    'ccPersona(contactCustom1)',
    'prefix',
    'firstName',
    'middleName',
    'lastName',
    'jobTitle',
    'department',
    'function',
    'level',
    'address1',
    'address2',
    'city',
    'state',
    'zip',
    'country',
    'phone',
    'directPhone',
    'genericEmail',
    'zb',
    'zbTime',
    'gmailStatus(domainStatus)',
    'companyWebsite',
    'contactDisposition',
    'contactComments',
    'contactSource(others)',
    'contactSource(linkedin)',
    'companyLinkedinUrl',
    'address1HQ',
    'address2HQ',
    'cityHQ',
    'stateHQ',
    'zipHQ',
    'countryHQ',
    'phoneHQ',
    'industry',
    'annualRevenue',
    'employeeRange(LI)',
    'employeeSize(LI)',
    'employeeSource(LI)',
    'employeeSize(Z+)',
    'employeeSource(Z+)',
    'finalBucket',
    'employeeSize(others)',
    'source(employeeSizeOther)',
  ];

  // Check that the type of filter and sort value is correct
  if (filter.constructor !== Object)
    throw new Error(`The filter value type is not an object`);
  if (sort.constructor !== Object)
    throw new Error(`The sort value type is not an object`);

  const appliedFilterColumns = Object.keys(filter);
  const appliedSortColumns = Object.keys(sort);

  // Check that multiple filters do not apply simultaneously
  if (appliedFilterColumns.length > 1)
    throw new Error(`Filter will not be applied to multiple columns at a time`);
  // Check that multiple sorts do not apply simultaneously
  if (appliedSortColumns.length > 1)
    throw new Error(`Sort will not be applied to multiple columns at a time`);

  const appliedFilterColumn = appliedFilterColumns[0];
  const appliedSortColumn = appliedSortColumns[0];

  if (!appliedFilterColumn && !appliedSortColumn) return;

  // Check that filter and sort do not applied on the wrong column
  if (appliedFilterColumn && !filterColumns.includes(appliedFilterColumn))
    throw new Error(
      `Filter will not be applied across this column {column: ${appliedFilterColumn}}`,
    );
  if (appliedSortColumn && !sortColumns.includes(appliedSortColumn))
    throw new Error(
      `Sort will not be applied across this column {column: ${appliedSortColumn}}`,
    );

  // Check that filter and sort are not applied simultaneously on one column
  if (appliedFilterColumn === appliedSortColumn)
    throw new Error(
      `Filter and sort should not be applied simultaneously on a column {column: ${appliedSortColumn}}`,
    );

  if (!appliedSortColumn) return;

  const appliedSortColumnValue = sort[appliedSortColumn].toLowerCase();

  // Check that the value of the sort applied column is correct
  if (appliedSortColumn && !SORT_VALUE.includes(appliedSortColumnValue)) {
    throw new Error(
      `Sort value must be 'asc' or' desc'. wrong value column name is '${appliedSortColumn}' and value is '${appliedSortColumnValue}'`,
    );
  }
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { roles } = req.user;
  if (!roles.includes(ROLES.AGENT))
    return res.status(403).send({
      err: 'User Forbidden',
      desc: 'User not access this route',
    });

  let filter = req.query.filter || '{}';
  let sort = req.query.sort || '{}';

  try {
    filter = JSON.parse(filter);
  } catch (error) {
    logger.error(
      `[AGENT-PREVIEW-CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${error}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'The filter value type is not an object',
    });
  }

  try {
    sort = JSON.parse(sort);
  } catch (error) {
    logger.error(
      `[AGENT-PREVIEW-CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${error}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'The sort value type is not an object',
    });
  }

  try {
    validateFilterAndSort(filter, sort);
  } catch (error) {
    logger.error(
      `[AGENT-PREVIEW-CONTROLLER] :: The value of filter or sort is not correct {userId : ${userId}, error: ${error.message}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: error.message,
    });
  }

  const pageNo = req.query.pageNo || 0;
  const pageSize = req.query.pageSize || 10;
  const page = self.paginationService.paginate(pageNo, pageSize);

  const inputs = {};
  inputs.userId = userId;
  inputs.limit = page.limit;
  inputs.offset = page.offset;

  logger.info(
    `[AGENT-PREVIEW-CONTROLLER] :: START :: Fetch all Preview data Build By {userId : ${userId}}`,
  );

  try {
    const contactsBuildPreview = await self.previewService.getPreview(
      inputs,
      filter,
      sort,
    );

    logger.info(
      `[AGENT-PREVIEW-CONTROLLER] :: SUCCESS :: Fetch all Preview data Build By {userId : ${userId}}`,
    );

    return res.status(200).send(contactsBuildPreview);
  } catch (err) {
    logger.error(
      `[AGENT-PREVIEW-CONTROLLER] :: ERROR :: Fetch all Preview data Build By {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Agent Preview',
    });
  }
}

PreviewController.prototype = {
  get,
};

const previewController = new PreviewController();

module.exports = previewController;
