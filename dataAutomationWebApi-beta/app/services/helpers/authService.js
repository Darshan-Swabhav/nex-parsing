const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const settingsConfig = require('../../config/settings/settings-config');

const checkJwt = jwt({
  // Validate the audience and the issuer.
  audience: settingsConfig.settings.jwtAudience,
  issuer: settingsConfig.settings.jwtAudience.jwtIssuer,
  algorithms: ['RS256'],
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: settingsConfig.settings.jwtURI,
  }),
});

module.exports = {
  checkJwt,
};
