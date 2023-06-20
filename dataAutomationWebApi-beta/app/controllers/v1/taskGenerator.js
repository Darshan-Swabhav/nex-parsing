// Imports the Google Cloud Tasks library.
const { CloudTasksClient } = require('@google-cloud/tasks');
const errors = require('throw.js');
const errorMessages = require('../../config/error.config.json');
// Instantiates a client.
const client = new CloudTasksClient();

/**
 *
 * @openapi
 * /generateTask:
 *   post:
 *     security:
 *        - auth0_jwk: []
 *     operationId: taskGenerator
 *     tags:
 *       - TASK_GENERATOR
 *     description: create task to task queue
 *     produces:
 *        - application/json
 *     responses:
 *       '200':
 *         description: returns status OK
 */
function TaskGenerator() {}

async function post(settingsConfig, req, res, next) {
  this.config = settingsConfig.settings || {};
  this.logger = settingsConfig.logger || console;
  const userId = req.user.sub;

  if (!userId) {
    next(new errors.Unauthorized(errorMessages.ERR_UNAUTHORIZED));
  }

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: this.config.FILE_DOWNLOAD_ENDPOINT,
    },
  };

  const payload = {
    a: Math.floor(Math.random() * 100),
    b: Math.floor(Math.random() * 100),
  };

  if (payload) {
    task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );
    task.httpRequest.headers = {
      'Content-Type': 'application/json',
    };
  }

  task.httpRequest.oidcToken = {
    serviceAccountEmail: this.config.SERVICE_ACCOUNT_EMAIL,
  };

  // Send create task request.
  console.log('Sending task:');
  console.log(task);

  const request = {
    parent: this.config.TASK_QUEUE_PATH,
    task,
  };
  try {
    const [response] = await client.createTask(request);
    console.log(`Created task ${response.name}`);
    res.json({ status: 'OK' });
  } catch (error) {
    console.log('>>>>>>>> Cloud Not Create Task');
    console.log(error);
    res.status(500).send('Cloud Not Create Task');
  }
}

TaskGenerator.prototype = {
  post,
};

const taskGeneratorController = new TaskGenerator();

module.exports = taskGeneratorController;
