const _ = require('lodash');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { loggerMock } = require('../../../../../helper');
const settingsConfig = {
  logger: loggerMock
};

const locationControllerModule = proxyquire('../../../../../../controllers/v1/master/location/locationController', {});

console.log(locationControllerModule);

const locationTree = require('./locationTree.json');

describe('#locationController - get', function () {
  describe('Get All Locations', function () {
    context('Check If User is Unauthorized', function () {
      it('Should return `401` with `Unauthorized` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            roles: ['manager']
          },
          query: {}
        };
        const res = {
          statusCode: null,
          data: null,
          status: (code) => {
            res.statusCode = code;
            return res;
          },
          json: () => res,
          send: (data) => {
            res.data = data;
            return res;
          }
        };

        //Act
        locationControllerModule.get(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Invalid token';

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Check If the User role is invalid', function () {
      it('Should return `403` with `User Forbidden` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            email: 'dev.pmgr1@nexsales.com',
            roles: ['agent']
          },
          query: {}
        };
        const res = {
          statusCode: null,
          data: null,
          status: (code) => {
            res.statusCode = code;
            return res;
          },
          json: () => res,
          send: (data) => {
            res.data = data;
            return res;
          }
        };

        // Act
        locationControllerModule
          .get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context(
      'Check if correct params are passed for getting list of location',
      function () {
        it('Should return `200` with master location list', function (done) {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            query: {},
            user: {
              sub: '111',
              email: 'dev.pmgr1@nexsales.com',
              roles: ['manager']
            }
          };
          const res = {
            statusCode: null,
            data: null,
            status: (code) => {
              res.statusCode = code;
              return res;
            },
            json: () => res,
            send: (data) => {
              res.data = data;
              return res;
            }
          };
          locationControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualData = result.data;
              const actualStatusCode = result.statusCode;
              const expectedData = _.cloneDeep(locationTree);
              const expectedStatusCode = 200;
              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
      }
    );

    context(
      'Check if correct params are passed for getting list of location',
      function () {
        it('Should return `200` with master location list', function (done) {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            user: {
              sub: '111',
              email: 'dev.pmgr1@nexsales.com',
              roles: ['manager']
            }
          };
          const res = {
            statusCode: null,
            data: null,
            status: (code) => {
              res.statusCode = code;
              return res;
            },
            json: () => res,
            send: (data) => {
              res.data = data;
              return res;
            }
          };
          locationControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualData = result.data;
              const actualStatusCode = result.statusCode;
              const expectedData = _.cloneDeep(locationTree);
              const expectedStatusCode = 200;
              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
      }
    );
  });
});
