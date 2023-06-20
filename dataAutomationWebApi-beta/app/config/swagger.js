const options = {
  definition: {
    swagger: '2.0',
    info: {
      title: 'backend-api',
      version: '0.0.0',
      description:
        'Data Automation API on API Gateway with a Cloud Run backend',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'nexsales',
        url: 'https://nexsales.com',
        email: 'innovation@nexsales.com',
      },
    },
    basePath: '/api/v1',
  },
  apis: [
    './app/controllers/v1/**/*.js',
    './app/controllers/v1/**/**/*.js',
    //  './apiDocsComponent/*.yaml'
  ],
};
/**
 * 
 * 
 * 
 * 
 * "schemes": [
    "https",
    "http"
  ],
  "x-google-backend": {
    "address": "https://backend-api-ymghawfbjq-uc.a.run.app/api/v1"
  }
 * 
 * 
 * 
 * 
*/
module.exports = options;
