/* eslint-disable global-require */
function gcpDecode(options) {
  console.log(`[GCPDecode] : options Received : ${options}`);
  const gcpDecodeBase64 = function (req, res, next) {
    const userInfo = req.get('X-Apigateway-Api-Userinfo');
    const buff = Buffer.from(userInfo, 'base64');
    const decodedUserInfo = JSON.parse(buff.toString('ascii'));
    req.user = decodedUserInfo;
    console.log(
      `GCPDecodeLog | userInfo - ${userInfo} | decodedUserInfo - ${decodedUserInfo}`,
    );
    next();
  };
  gcpDecodeBase64.unless = require('express-unless');
  return gcpDecodeBase64;
}

module.exports = gcpDecode;
