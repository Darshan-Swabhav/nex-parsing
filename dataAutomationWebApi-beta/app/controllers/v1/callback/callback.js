const jwt = require('jsonwebtoken');

/**
 *
 * @openapi
 *
 * /callbacks:
 *   post:
 *     operationId: callBackRoutes
 *     description: callback route for auth flow
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: auth
 *         schema:
 *           type: object
 *           properties:
 *             access_token:
 *               type: string
 *             id_token:
 *               type: string
 *             scope:
 *               type: string
 *             expires_in:
 *               type: string
 *             token_type:
 *               type: string
 *             state:
 *               type: string
 *     responses:
 *       '200':
 *         description: returns the project list array for that given list
 *       '400':
 *         description: if required parameters not passes then sends the params error
 *       '500':
 *         description: if something fails internally then send error
 */
function CallbackController() {}

function post(settingsConfig, req, res) {
  settingsConfig.logger.debug(req.body);

  const scriptPrefix = `
  <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8">
        <title>loading..</title>

    </head>
        <script type="text/javascript">
        `;
  const scriptSuffix = `
        </script>
      </body>

      </html> `;
  let script = '';
  let returnTo;
  let hasState;
  try {
    returnTo = JSON.parse(req.body.state).returnTo;
    hasState = true;
  } catch (err) {
    hasState = false;
  }
  if (req.body.id_token) {
    const decoded = jwt.decode(req.body.id_token);
    script = `
          localStorage.clear();
          sessionStorage.clear();
          localStorage.setItem('id_token', '${req.body.id_token}');
          localStorage.setItem('accessToken', '${req.body.access_token}');
          localStorage.setItem('roles', '${decoded.roles}');
          localStorage.setItem('permissions', '${decoded.permissions}');
          localStorage.setItem('name', '${decoded.nickname}');
          localStorage.setItem('email', '${decoded.email}');
          localStorage.setItem('user_id', '${decoded.user_id}');`;

    const urlForRedirection = `var redirectUrl = window.location.protocol + '//' + window.location.host + '/#/';
                  if(${hasState}){
                    redirectUrl = redirectUrl + '${returnTo}';
                  }
                  window.location.replace(redirectUrl);`;
    script = script.concat(urlForRedirection);

    res.set('Content-Type', 'text/html');
    res.status(200).send(scriptPrefix + script + scriptSuffix);
  } else {
    const errorDesc =
      req.body.error_description ||
      'Could not authenticate. Please contact support';
    script = `
          window.location.replace(window.location.protocol + '//' + window.location.host + '/login?error=' +
            encodeURIComponent('${errorDesc}'));`;
    res.set('Content-Type', 'text/html');
    res.status(403).send(scriptPrefix + script + scriptSuffix);
  }
}

CallbackController.prototype = {
  post,
};

const callbackController = new CallbackController();

module.exports = callbackController;
