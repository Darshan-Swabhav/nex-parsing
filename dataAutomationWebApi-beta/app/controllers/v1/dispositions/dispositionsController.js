const errors = require('throw.js');
const errorMessages = require('../../../config/error.config.json');

/**
 *@openapi
 * definitions:
 *   dispositions:
 *     properties:
 *       id:
 *        type: string
 *       dispositionType:
 *        type: string
 *       dispositionLevel:
 *        type: string
 *       dispositionCategory:
 *        type: string
 *
 * /dispositions:
 *   get:
 *     security:
 *        - auth0_jwk: []
 *     operationId: getDispositions
 *     tags:
 *       - Dispositions
 *     description: This is disposition list route which fetch the disposition list
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: returns the disposition list array
 *         schema:
 *            $ref: '#/definitions/dispositions'
 *       '500':
 *         description: if something fails internally then send error
 */

function DispositionController() {
  // eslint-disable-next-line global-require
  const DispositionCRUDService = require('../../../services/dispositions/dispositionService');

  this.dispositionCRUDService = new DispositionCRUDService();
}

async function get(settingsConfig, req, res, next) {
  const self = this;
  const logger = settingsConfig.logger || console.log;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  try {
    logger.info(
      `[DISPOSITION-CONTROLLER] :: START :: Fetch all Disposition {userId : ${userId}}`,
    );

    const dispositionList =
      await self.dispositionCRUDService.getAllDisposition();

    logger.info(
      `[DISPOSITION-CONTROLLER] :: SUCCESS :: Fetch all Disposition {userId : ${userId}}`,
    );

    return res.status(200).send(dispositionList);
  } catch (err) {
    logger.error(
      `[DISPOSITION-CONTROLLER] :: ERROR :: Fetch all Disposition {userId : ${userId}, error : ${err.message}}`,
    );

    return res.status(500).send({
      err,
      desc: 'Could Not Get Dispositions',
    });
  }
}
DispositionController.prototype = {
  get,
};

const dispositionController = new DispositionController();

module.exports = dispositionController;
