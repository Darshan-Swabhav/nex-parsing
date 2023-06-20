const errors = require('throw.js');
const _ = require('lodash');

const { serializeError } = require('serialize-error');

const FilterHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler');
const SortHandler = require('@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler');
const {
  GENERALIZED_FILTERS_OPERATOR,
  GENERALIZED_FILTERS_TYPE,
} = require('../../../../../constant');
const AccountService = require('../../../../../services/projects/masterImport/accounts/accountsService');

const errorMessages = require('../../../../../config/error.config.json');

/**
 *@openapi
 * definitions:
 *   masterImportResponse:
 *     properties:
 *       fileId:
 *         type: string
 *       fileName:
 *         type: string
 *       jobId:
 *         type: string
 *
 * /project/{project_id}/masterImport/account:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: masterImportAccount
 *     tags:
 *       - Accounts
 *     description: Import Account from Master
 *     parameters:
 *     - in: path
 *       name: project_id
 *       type: string
 *       description: project id
 *       required: true
 *     - in: body
 *       name: masterImportBody
 *       schema:
 *         type: object
 *         required:
 *           - filter
 *           - limit
 *           - sort
 *         properties:
 *           filter:
 *             type: object
 *           limit:
 *             type: string
 *           sort:
 *             type: object
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the result in json format with true/false for disposition
 *         schema:
 *            $ref: '#/definitions/masterImportResponse'
 *       '400':
 *         description: if Required Data is not passed in request body
 *       '401':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 *
 */

function AccountController() {
  this.accountService = new AccountService();
  this.filterHandler = new FilterHandler();
  this.sortHandler = new SortHandler();
}

async function post(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  const sortableColumns = ['employeeSize', 'revenue'];
  const multipleSort = false;

  const MAXIMUM_LIMIT = 5001;
  const MINIMUM_LIMIT = 0;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const { limit, fileName } = req.body;
  let { filter, sort } = req.body;

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'projectId is required',
    });
  }

  // validate filter is not empty
  if (!filter) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Filter is required',
    });
  }

  // validate sort is not empty
  if (!sort) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Sort is required',
    });
  }

  // validate limit is not empty
  if (!limit) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'Limit is required',
    });
  }

  // validate file name is not empty
  if (!fileName) {
    return res.status(400).send({
      err: 'Bad Request',
      desc: 'File Name is required',
    });
  }

  // parse filter(string to object)
  if (_.isString(filter)) {
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[MASTER_IMPORT_ACCOUNT_CONTROLLER] :: Could not parse filter in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The Filter type is invalid',
      });
    }
  }

  // parse filter(string to object)
  if (_.isString(sort)) {
    try {
      sort = JSON.parse(sort);
    } catch (error) {
      const serializedFilterError = serializeError(error);
      logger.error(
        `[MASTER_IMPORT_ACCOUNT_CONTROLLER] :: Could not parse sort in Json format {userId : ${userId}, error: ${JSON.stringify(
          serializedFilterError,
        )}}`,
      );
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'The Sort value type is not an object',
      });
    }
  }

  const filterColumns = {
    keywords: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    type: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    employeeSize: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.BETWEEN],
    },
    employeeSizeRange: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    revenue: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.BETWEEN],
    },
    revenueRange: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    sicCode: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    naicsCode: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    technology: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    industry: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    subIndustry: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    country: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    state: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
    countryZip: {
      type: GENERALIZED_FILTERS_TYPE.ARRAY,
      operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
    },
  };
  if (_.isString(_.get(filter, 'employeeSize.value', ''))) {
    filterColumns.employeeSize = {
      type: GENERALIZED_FILTERS_TYPE.STRING,
      operator: [
        GENERALIZED_FILTERS_OPERATOR.LESS_THAN,
        GENERALIZED_FILTERS_OPERATOR.GREATER_THAN,
      ],
    };
  }
  if (_.isString(_.get(filter, 'revenue.value', ''))) {
    filterColumns.revenue = {
      type: GENERALIZED_FILTERS_TYPE.STRING,
      operator: [
        GENERALIZED_FILTERS_OPERATOR.LESS_THAN,
        GENERALIZED_FILTERS_OPERATOR.GREATER_THAN,
      ],
    };
  }

  // filter validation
  try {
    this.filterHandler.validate(filterColumns, filter);
  } catch (error) {
    const serializedFilterValidateError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_ACCOUNT_CONTROLLER] :: The value of filter is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedFilterValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedFilterValidateError.message,
    });
  }

  // sort validation
  try {
    this.sortHandler.validate(sortableColumns, sort, multipleSort);
  } catch (error) {
    const serializedSortValidateError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_ACCOUNT_CONTROLLER] :: The value of sort is not correct {userId : ${userId}, error: ${JSON.stringify(
        serializedSortValidateError,
      )}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: serializedSortValidateError.message,
    });
  }

  // limit validation>
  if (!(limit > MINIMUM_LIMIT && limit < MAXIMUM_LIMIT)) {
    const errMsg = 'Bad Limit,Limit out of range';
    logger.error(
      `[MASTER_IMPORT_ACCOUNT_CONTROLLER] :: The value of limit is not correct {userId : ${userId}, error: ${errMsg}}`,
    );
    return res.status(400).send({
      err: 'Bad Request',
      desc: errMsg,
    });
  }

  try {
    const result = await this.accountService.injectAccountInDA({
      filter,
      sort,
      limit,
      projectId,
      userId,
      fileName,
    });

    return res.status(200).send(result);
  } catch (error) {
    const serializedError = serializeError(error);
    logger.error(
      `[MASTER_IMPORT_ACCOUNT_CONTROLLER] :: ERROR :: Can Not Save the projectSetting  {userId : ${userId}, projectId : ${projectId}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: 'Bad Request',
      desc: serializedError.message,
    });
  }
}

AccountController.prototype = {
  post,
};

const accountController = new AccountController();

module.exports = accountController;
