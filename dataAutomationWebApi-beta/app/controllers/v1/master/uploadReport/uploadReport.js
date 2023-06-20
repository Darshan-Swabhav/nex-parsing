const errors = require('throw.js');
const { serializeError } = require('serialize-error');

const errorMessages = require('../../../../config/error.config.json');
const PaginationService = require('../../../../services/helpers/paginationService');
const UploadReportService = require('../../../../services/master/uploadReport/uploadReport');

function UploadReportController() {
  this.paginationService = new PaginationService();
  this.uploadReportService = new UploadReportService();
}

/**
 * @openapi
 *
 * /master/uploadReport/{type}:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getUploadReports
 *     summary: Upload report
 *     description: Upload report for a given type
 *     tags:
 *       - Master
 *     parameters:
 *       - name: type
 *         in: path
 *         description: Type of report to upload
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the accounts list array for that given list
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */

async function getUploadReports(settingsConfig, req, res, next) {
  const logger = settingsConfig.logger || console;

  let result;
  const userEmail = req.user.email;
  const pageNumber = req.query.pageNumber || 0;
  const pageSize = req.query.pageSize || 10;
  const uploadReportType = req.params.type;

  const validUploadReportType = ['account', 'contact'];

  if (!userEmail) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  try {
    logger.info(
      `[UPLOAD_REPORT_CONTROLLER] :: START :: Get Upload Report {userEmail : ${userEmail}}`,
    );

    if (
      !uploadReportType ||
      !validUploadReportType.includes(uploadReportType)
    ) {
      throw new Error('UploadReportType must be specified');
    }

    const pagination = this.paginationService.paginate(pageNumber, pageSize);

    const getUploadReportsDTO = {
      pagination,
    };

    switch (uploadReportType) {
      case 'account':
        result = await this.uploadReportService.getAccountsUploadReports(
          getUploadReportsDTO,
        );
        break;
      case 'contact':
        result = await this.uploadReportService.getContactsUploadReports(
          getUploadReportsDTO,
        );
        break;
      default:
        return res.status(400).send({
          err: 'Bad Request',
          desc: 'UploadReportType must be specified',
        });
    }

    logger.info(
      `[UPLOAD_REPORT_CONTROLLER] :: COMPLETED :: Get Upload Report {userEmail : ${userEmail}}`,
    );
    return res.status(200).send(result);
  } catch (error) {
    const serializedError = serializeError(error);
    logger.error(
      `[UPLOAD_REPORT_CONTROLLER] :: ERROR :: Get Upload Report {userEmail : ${userEmail}, error : ${JSON.stringify(
        serializedError,
      )}}`,
    );

    return res.status(500).send({
      err: serializedError.message,
      desc: 'Could Not Get Upload Reports',
    });
  }
}

UploadReportController.prototype = {
  getUploadReports,
};

const uploadReportController = new UploadReportController();

module.exports = uploadReportController;
