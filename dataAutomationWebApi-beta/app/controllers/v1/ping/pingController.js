/**
 *
 * @openapi
 * /ping:
 *   get:
 *     operationId: pingRoute
 *     description: ping route
 *     produces:
 *        - application/json
 *     responses:
 *       '200':
 *         description: returns the pong
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */
function PingController() {}

async function get(settingsConfig, req, res) {
  return res.status(200).send({
    pong: 'pong',
  });
}

PingController.prototype = {
  get,
};

const pingController = new PingController();

module.exports = pingController;
