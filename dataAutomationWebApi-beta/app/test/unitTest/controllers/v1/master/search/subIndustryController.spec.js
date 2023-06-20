const _ = require('lodash');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { loggerMock } = require('../../../../../helper');
const settingsConfig = {
  logger: loggerMock
};

const autoCompleteServiceInstanceStub = {
  filterDataDictionary: sinon.stub()
};

const AutoCompleteServiceStub = sinon
  .stub()
  .returns(autoCompleteServiceInstanceStub);

const subIndustryControllerModule = proxyquire(
  '../../../../../../controllers/v1/master/search/subIndustryController',
  {
    '../../../../services/master/search/autoCompleteService':
      AutoCompleteServiceStub
  }
);

const industrySubIndustryMapping = require('./industrySubIndustryMapping.json');

describe('#subIndustryController - get', function () {
  describe('Get All Sub Industries For All Industries', function () {
    context('Check If User is Unauthorized', function () {
      it('Should return `401` with `Unauthorized` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: ''
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
        subIndustryControllerModule
          .get(settingsConfig, req, res, next)
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
        subIndustryControllerModule
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

    context('Check If the industries is invalid', function () {
      it('Should return `400` when industries parsing fails', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager']
          },
          query: {
            industrys: 'industrys'
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

        // Act
        subIndustryControllerModule
          .get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'The industrys value type is not an object'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return `400` when industries is not an array or is an empty array', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager']
          },
          query: {
            industrys: []
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

        // Act
        subIndustryControllerModule
          .get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Industrys is required'
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
      'Check if correct params are passed for getting list of sub industries',
      function () {
        before(function () {
          autoCompleteServiceInstanceStub.filterDataDictionary = sinon
            .stub()
            .returns([
              'Aircraft Engine and Parts Manufacturing',
              'Guided Missile and Space Vehicle Manufacturing',
              'Space Research and Technology',
              'Weapons and Ammunition Manufacturing'
            ]);
        });
        it('Should return `200` with master sub industries list for industries', function (done) {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            query: {
              industrys: ['Aerospace and Defense']
            },
            user: {
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
          subIndustryControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualData = result.data;
              const actualStatusCode = result.statusCode;
              const expectedData = [
                'Aircraft Engine and Parts Manufacturing',
                'Guided Missile and Space Vehicle Manufacturing',
                'Space Research and Technology',
                'Weapons and Ammunition Manufacturing'
              ];
              const expectedStatusCode = 200;
              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);

              const actualFilterDataDictionaryArgs =
                autoCompleteServiceInstanceStub.filterDataDictionary.getCall(
                  0
                ).args;
              const expectedFilterDataDictionaryArgs = [
                '',
                ['Aerospace and Defense'],
                _.cloneDeep(industrySubIndustryMapping)
              ];
              expect(actualFilterDataDictionaryArgs).to.deep.equal(
                expectedFilterDataDictionaryArgs
              );
              expect(actualFilterDataDictionaryArgs.length).to.equal(
                expectedFilterDataDictionaryArgs.length
              );
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
        after(function () {
          autoCompleteServiceInstanceStub.filterDataDictionary = sinon.stub();
        });
      }
    );

    context(
      'Check if correct params are passed for getting list of sub industries',
      function () {
        before(function () {
          autoCompleteServiceInstanceStub.filterDataDictionary = sinon
            .stub()
            .throws(new Error('Something went wrong'));
        });
        it('Should return `500` when some internal error occurs', function (done) {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            query: {
              industrys: ['Aerospace and Defense']
            },
            user: {
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
          subIndustryControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualStatusCode = result.statusCode;
              const actualData = result.data;
              const expectedStatusCode = 500;
              const expectedData = {
                err: 'Something went wrong',
                desc: 'Could Not Get Master Sub Industry'
              };

              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
        after(function () {
          autoCompleteServiceInstanceStub.filterDataDictionary = sinon.stub();
        });
      }
    );
  });
});
