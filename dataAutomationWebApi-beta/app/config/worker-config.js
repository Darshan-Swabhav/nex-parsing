/* eslint-disable global-require */
const cors = require('cors');
const http = require('http');
const util = require('util');
const Multer = require('multer');
const express = require('express');
const errors = require('throw.js');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDocs = require('swagger-jsdoc');
const helmet = require('helmet');
const routeConfig = require('./route-config');
const errorMessages = require('./error.config.json');
const settingsConfig = require('./settings/settings-config');
const authService = require('../services/helpers/authService');
const gcpService = require('../services/helpers/gcpDecode');

const application = express();

// const dd_options = {
//   response_code: true,
//   tags: ['app:webapi'],
// };
const env = process.env.NODE_ENV || 'local';

const swagger = require('./swagger');

const newUrl = `${settingsConfig.settings.thisnode.hostName}:${settingsConfig.settings.thisnode.port}`;
swagger.definition.servers = [];
swagger.definition.servers.push({ url: newUrl });

const specs = swaggerJsDocs(swagger);

// const connect_datadog = require("connect-datadog")(dd_options);

console.log(settingsConfig.settings);

function configureApplication(app) {
  const compression = require('compression');
  const morgan = require('morgan');
  const expressValidator = require('express-validator');

  if (settingsConfig.settings.environment === 'production') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }
  const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // no larger than 50mb, you can change as needed.
    },
  });
  const whitelist = [
    'https://innovation.auth0.com',
    'https://dev.da.rightleads.io',
    'https://beta.da.rightleads.io',
    'https://da.test',
    'https://dev.masterdb.rightleads.io',
    'https://beta.masterdb.rightleads.io',
  ];

  const localAppAllowedRoute = [
    '/api/v1/master/domain',
    '/api/v1/master/domain/validate',
    '/api/v1/master/dataProcessor/operators/process',
    '/api/v1/master/dataProcessor/operators/clean',
    '/api/v1/master/dataProcessor/employeeSizesMapping',
    '/api/v1/master/dataProcessor/industriesMapping',
    '/api/v1/master/dataProcessor/industries',
    '/api/v1/master/dataProcessor/employeeSizes',
  ];

  const localHostAllowedPort = ['localhost:8000', 'localhost:20100'];

  const jwtExceptionRoutes = [
    '/login',
    '/logout',
    '/auth',
    '/api/v1/ping',
    '/api/v1/callbacks',
    '/api/v1/parser',
    new RegExp('/api-docs'),
  ];

  // const corsOptions = {
  //   origin(origin, callback) {
  //     // A lack of Origin header means you're on the same origin as the current request.
  //     if (!origin || whitelist.indexOf(origin) !== -1) {
  //       callback(null, true);
  //     } else {
  //       callback('Bad Request');
  //     }
  //   }
  // };

  const corsOptionsDelegate = function (req, callback) {
    let hostInfo = req.header('Origin') || 'EmptyOrigin';

    hostInfo =
      hostInfo.indexOf('://') > -1 ? hostInfo.split('://')[1] : hostInfo;

    if (
      !req.header('Origin') ||
      whitelist.indexOf(req.header('Origin')) !== -1
    ) {
      callback(null, true);
    } else if (
      localAppAllowedRoute.indexOf(req.path) !== -1 &&
      localHostAllowedPort.indexOf(hostInfo) !== -1
    ) {
      callback(null, true);
    } else {
      callback('Bad Request');
    }
  };

  app.use(multer.single('file'));
  // app.use(cors(corsOptions));

  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*'); // replace 3000 with your frontend port
    res.set(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });

  app.use(cors(corsOptionsDelegate));

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(expressValidator());

  app.use(compression());
  app.use(express.json({ limit: '50mb', extended: true })); // support json encoded bodies
  app.use(
    express.urlencoded({
      extended: true,
    }),
  ); // support encoded bodies

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true }),
  );

  app.use(expressValidator());
  if (env === 'local' || env === 'test') {
    app.use(
      '/api/*',
      authService.checkJwt.unless({
        path: jwtExceptionRoutes,
      }),
    );
  } else {
    app.use('/api/*', gcpService().unless({ path: jwtExceptionRoutes }));
  }

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.type('application/json');
    next();
  });
}

function configureErrorHandler(app) {
  app.use((req, res, next) => {
    next(new errors.NotFound(errorMessages.ERR_API_NOT_FOUND));
  });
  app.use((_err, req, res) => {
    const err = _err;
    const log = settingsConfig.logger;
    if (err) {
      log.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Error for Request<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      log.error(`requested API : ${req.url}`);
      log.error(`method : ${req.method}`);
      log.error('request body : ');
      log.error(
        util.inspect(req.body, {
          showHidden: false,
          depth: 2,
          breakLength: Infinity,
        }),
      );
      log.error(`request Authorization  header:  ${req.get('Authorization')}`);
      log.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Error stack<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      log.error(err);
      log.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>End of error<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      if (
        settingsConfig.settings.environment === 'production' ||
        settingsConfig.settings.environment === 'beta'
      ) {
        // deletes the stack if it is prod or beta environment.
        // As stack is just for development purpose.
        delete err.stack;
      }
      res.status(err.statusCode || err.status || 500).json(err);
    }
  });
}

function configureRoutes(app) {
  // application.use(connect_datadog);
  routeConfig.registerRoutes(app, settingsConfig);
}

function startServer(app) {
  const log = settingsConfig.logger;

  const server = http.createServer(app);

  server.listen(settingsConfig.settings.thisnode.port, () => {
    log.info(
      'listening at http://%s:%s',
      settingsConfig.settings.thisnode.hostName,
      settingsConfig.settings.thisnode.port,
    );
  });
}

function configureWorker(app) {
  configureApplication(app);
  configureRoutes(app);
  configureErrorHandler(app);
  startServer(app);
}

configureWorker(application);
