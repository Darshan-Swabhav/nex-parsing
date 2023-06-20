const nock = require('nock');
const jwt = require('jsonwebtoken');

const settingConfig = require('../config/settings/settings-config');

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA0hIvRz2DETtEA8zfONcyYEeCxMS7+RkaDqR+YKRkAAWKzDzE
xArztQ5MibJ4v1IV7PayBAJBprMcpJAtZPplEuXNwX/vAbCm+1IXNeqSqjxSFuiB
ej5hFwdYcM2QfBnOzASfjSUkpKsBbmFAToSt+F2hmeIiU8JPK9VxEryqDsc+NBoO
+6CWiwDvnpfc1JWcGRY0Sa+Gr1LzHSrJM0TDbM3/TRs9GvA6pQugO8Na1Y4g/oyU
w5yhKPSy7jjMO0Z8cDjVwHET8sQGLE3keBbJDS2AGIK/N7+aq2z4VgwnwJurgbMZ
RDQ8DFQhsJQotq5GOFrbzVV70kbgka24xh4w4QIDAQABAoIBAEreOkVckeLJSYNF
N+UtJQIVWnDAYPH1VUkUrQnKbO1pDD+gBMyNzq+fif2lQs2E9tV+UpGFMFq2CSZJ
UDRl3THv/vXQn6DtkYWOi0Em+eB8IRGTCdpEcxve/VEuoijolcA2gZqvOzEI1Ti+
pkmVld8nl5mdc3iAjvDjYCo6XS1ohcsK2Ymuro0IuBP0K7T591CmzTApV1xxJ7iF
hSuuvqdK/KUvcurS0rwsy1QawoXPCEV7jgnzbBA6MNRoQm1A06+5BOCsE2cgGCl6
oJKIpkafjtlDrLC+DrGSR90WuEWjKEN33DeWpN7D0ReOyqVl6Qk2Hn0slvQicj6S
MRM1+fUCgYEA4IET+WiIk02bazyIIkWp/VBmZqGz3jGQxn8EZI9UisGSeoFBmyMV
stoQrl2JbKcMI0gIsCpgcqRY0Eq68a1Z2wK72txwJEiz81iBm9eBoxG+C+OeMkV0
JhUaBqpthdCPO2/wJ6NYbHk3LLO5MwiVKOe0Xp1KRjB5h5xwNAKnovcCgYEA74q/
oAIpxtoENdK4QhpUA5cRcIbduxUSJl+6dZgA5jbLSSuZL1ed4YOXBmt1u+O4MF2p
b/FDZLh4Z/mpHaty2ek+iySHC7Wkc3rj5xFZz7MZYJ9bApcCUsz2IJkwYPujz80E
XpGlsdtVg4XAOaowrKcU6A729uMkpGiXwjxJ/OcCgYB9s+hSMtSd3ctS7O6wed8n
ZdggSRQkKg6NBduYzqQgmSgCDdOFIMzqeqzyZI8o1hO2wYOT1/Zu2lScM+uenFh+
h3ZVoi3sMwUHERxo/O6qNqn5kDYoobjaBeCvsMdoMJGyTwfhudUtz2U0U2E0EO8r
myjj/R/0UvoJE2/Dv2TLmwKBgCMGx9Ru3Ir+MCVqpZTM4sIPofYxUlTb1OaVkt9F
FcST+I+/d0vL5QMnybqflfyeZL11xKPgxHkC3GBfylHTUxz4FTQlaDXXHq/gJVkR
WW+cgbZ2NsmfKTDQVaEYpVFZGm/1S5FEfNUP/GYZ9ay47Rsh51WzcntRZXdA8Afv
5uW7AoGAYsoyC2sRRGHqo91GpQ2QGrlCdcjvcZKWAd2lm+pgNuW0T1Nv1Luh1QUZ
IFFStPwdyUwVSSZWS8ZisrmhxVMUl13xXEclGWKGAKg5Q9ztvH+8FTsqCRAf4gRU
0DQKSqBzGlR1vCnEP3vCy8ZOuvEwykFhAwwwa2GJgKkTa2ATnAM=
-----END RSA PRIVATE KEY-----`;

const nockReply = {
  keys: [
    {
      alg: 'RS256',
      kty: 'RSA',
      use: 'sig',
      n: '0hIvRz2DETtEA8zfONcyYEeCxMS7-RkaDqR-YKRkAAWKzDzExArztQ5MibJ4v1IV7PayBAJBprMcpJAtZPplEuXNwX_vAbCm-1IXNeqSqjxSFuiBej5hFwdYcM2QfBnOzASfjSUkpKsBbmFAToSt-F2hmeIiU8JPK9VxEryqDsc-NBoO-6CWiwDvnpfc1JWcGRY0Sa-Gr1LzHSrJM0TDbM3_TRs9GvA6pQugO8Na1Y4g_oyUw5yhKPSy7jjMO0Z8cDjVwHET8sQGLE3keBbJDS2AGIK_N7-aq2z4VgwnwJurgbMZRDQ8DFQhsJQotq5GOFrbzVV70kbgka24xh4w4Q', // eslint-disable-line max-len
      e: 'AQAB',
      kid: '0',
    },
  ],
};

nock(settingConfig.settings.jwtIssuer)
  .persist()
  .get('/.well-known/jwks.json')
  .reply(200, nockReply);

const getToken = () => {
  const user = {
    id: '6087dc463e5c26006f114f2b',
    email: 'test-bot@dawebapi.com',
  };

  const agentPayload = {
    sub: user.id,
    roles: ['agent'],
  };
  const managerPayload = {
    sub: user.id,
    roles: ['manager'],
  };

  const options = {
    header: { kid: '0' },
    algorithm: 'RS256',
    expiresIn: '1d',
    audience: settingConfig.settings.jwtAudience,
    issuer: settingConfig.settings.jwtIssuer,
  };

  const token = {};
  try {
    token.agent = jwt.sign(agentPayload, privateKey, options);
    token.manager = jwt.sign(managerPayload, privateKey, options);
    console.log(token);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return token;
};

module.exports = {
  getToken,
};
