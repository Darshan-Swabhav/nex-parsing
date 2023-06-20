/* eslint-disable global-require */
function RouteConfig() {}

function loadRouteConfig() {
  let config;

  try {
    config = require('./route.config.json');

    if (!config.routes || config.routes.length === 0) {
      throw new Error('"routes" not defined');
    }
  } catch (e) {
    throw new Error(`Unable to parse "lib/config/route.config.json": ${e}`);
  }

  return config;
}

function loadController(routeItem) {
  let controller;

  if (!routeItem || !routeItem.controller) {
    throw new Error(
      'Undefined "controller" property in "lib/config/route.config.json"',
    );
  }

  try {
    // eslint-disable-next-line import/no-dynamic-require
    controller = require(routeItem.controller);
  } catch (e) {
    throw new Error(`Unable to load ${routeItem.controller}: ${e}`);
  }

  return controller;
}

function getRoute(routeItem) {
  if (!routeItem || !routeItem.route || routeItem.route.length === 0) {
    throw new Error(
      'Undefined or empty "route" property in "lib/config/route.config.json"',
    );
  }

  return routeItem.route;
}

function getMethod(routeItem) {
  if (!routeItem || !routeItem.method || routeItem.method.length === 0) {
    throw new Error(
      'Undefined or empty "method" property in "lib/config/route.config.json"',
    );
  }

  const method = routeItem.method.toLowerCase();

  switch (method) {
    case 'get':
    case 'put':
    case 'post':
    case 'delete':
      return method;
    default:
      throw new Error(
        `Invalid REST "method" property in "lib/config/route.config.json": ${method}`,
      );
  }
}

function getAction(routeItem) {
  if (!routeItem || !routeItem.action || routeItem.action.length === 0) {
    return getMethod(routeItem);
  }
  return routeItem.action;
}

function registerRoute(
  application,
  controller,
  route,
  method,
  action,
  settingsConfig,
) {
  application.route(route)[method]((req, res, next) => {
    controller[action](settingsConfig, req, res, next);
  });
}

function createConfigRoute(application, settingsConfig) {
  application.route('/config').get((req, res) => {
    res.status(200).json(settingsConfig.settings);
  });
}

function registerRoutes(application, settingsConfig) {
  const config = loadRouteConfig();

  for (let i = 0, { length } = config.routes; i < length; i += 1) {
    const routeItem = config.routes[i];

    const controller = loadController(routeItem, application);
    const route = getRoute(routeItem);
    const method = getMethod(routeItem);
    const action = getAction(routeItem);

    registerRoute(
      application,
      controller,
      route,
      method,
      action,
      settingsConfig,
    );
  }
  if (settingsConfig.settings.environment === 'development')
    createConfigRoute(application, settingsConfig);
}

RouteConfig.prototype = {
  registerRoutes,
};

const routeConfig = new RouteConfig();

module.exports = routeConfig;
