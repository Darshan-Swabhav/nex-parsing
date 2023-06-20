const _ = require('lodash');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { loggerMock } = require('../../../../../helper');
const settingsConfig = {
  logger: loggerMock
};

const autoCompleteServiceInstanceStub = {
  search: sinon.stub()
};

const AutoCompleteServiceStub = sinon
  .stub()
  .returns(autoCompleteServiceInstanceStub);

const industryControllerModule = proxyquire(
  '../../../../../../controllers/v1/master/search/industryController',
  {
    '../../../../services/master/search/autoCompleteService':
      AutoCompleteServiceStub
  }
);

const industrySubIndustryMapping = require('./industrySubIndustryMapping.json');
const industryTree = require('./industryTree.json');
const industry = Object.keys(industrySubIndustryMapping);

describe('#industryController - get', function () {
  describe('Get All Industries', function () {
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
        industryControllerModule
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
        industryControllerModule
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
      'Check if correct params are passed for getting list of industries',
      function () {
        before(function () {
          autoCompleteServiceInstanceStub.search = sinon
            .stub()
            .returns(_.cloneDeep(industry));
        });
        it('Should return `200` with master industries list', function (done) {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            query: {},
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
          industryControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualData = result.data;
              const actualStatusCode = result.statusCode;
              const expectedData = _.cloneDeep(industry);
              const expectedStatusCode = 200;
              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);

              const actualSearchArgs =
                autoCompleteServiceInstanceStub.search.getCall(0).args;
              const expectedSearchArgs = [
                '',
                _.cloneDeep(industry)
              ];
              expect(actualSearchArgs).to.deep.equal(expectedSearchArgs);
              expect(actualSearchArgs.length).to.equal(
                expectedSearchArgs.length
              );

              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
        after(function () {
          autoCompleteServiceInstanceStub.search = sinon.stub();
        });
      }
    );

    context(
      'Check if correct params are passed for getting list of industries',
      function () {
        before(function () {
          autoCompleteServiceInstanceStub.search = sinon
            .stub()
            .returns(_.cloneDeep(industry));
        });
        it('Should return `200` with master industries list', function (done) {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            query: {
              isSubIndustry: 'true',
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
          industryControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualData = result.data;
              const actualStatusCode = result.statusCode;
              const expectedData = _.cloneDeep(industryTree);
              const expectedStatusCode = 200;
              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
        after(function () {
          autoCompleteServiceInstanceStub.search = sinon.stub();
        });
      }
    );

    context(
      'Check if correct params are passed for getting list of industries',
      function () {
        before(function () {
          autoCompleteServiceInstanceStub.search = sinon
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
            query: {},
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
          industryControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualStatusCode = result.statusCode;
              const actualData = result.data;
              const expectedStatusCode = 500;
              const expectedData = {
                err: 'Something went wrong',
                desc: 'Could Not Get Master Industry'
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
          autoCompleteServiceInstanceStub.search = sinon.stub();
        });
      }
    );
  });
});
