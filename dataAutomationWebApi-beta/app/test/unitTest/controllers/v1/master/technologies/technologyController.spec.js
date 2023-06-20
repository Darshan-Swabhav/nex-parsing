const _ = require('lodash');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { loggerMock } = require('../../../../../helper');
const settingsConfig = {
  logger: loggerMock
};

const technologyServiceInstanceStub = {
  getTechnologies: sinon.stub()
};

const TechnologyServiceStub = sinon
  .stub()
  .returns(technologyServiceInstanceStub);

const technologyControllerModule = proxyquire(
  '../../../../../../controllers/v1/master/technologies/technologyController',
  {
    '../../../../services/master/technology/technologyService':
      TechnologyServiceStub
  }
);

const technologiesResponse = [
  'Salesforce',
  'Outreach',
  'Hubspot',
  'SugarCRM',
  'InfusionSoft',
];

describe('#technologyController - get', function () {
  describe('Get All technologies', function () {
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
        technologyControllerModule
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

    context(
      'Check if correct params are passed for getting list of technologies',
      function () {
        before(function () {
          technologyServiceInstanceStub.getTechnologies = sinon
            .stub()
            .returns(_.cloneDeep(technologiesResponse));
        });
        it('Should return `200` with master technologies list', function (done) {
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
          technologyControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualData = result.data;
              const actualStatusCode = result.statusCode;
              const expectedData = _.cloneDeep(technologiesResponse);
              const expectedStatusCode = 200;
              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);

              const actualgetTechnologiesArgs =
                technologyServiceInstanceStub.getTechnologies.getCall(0).args;
              const expectedgetTechnologiesArgs = [
                {
                  limit: "10",
                  offset: "0",
                  userParam: "",
                }
              ];
              expect(actualgetTechnologiesArgs).to.deep.equal(expectedgetTechnologiesArgs);
              expect(actualgetTechnologiesArgs.length).to.equal(
                expectedgetTechnologiesArgs.length
              );

              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
        after(function () {
          technologyServiceInstanceStub.getTechnologies = sinon.stub();
        });
      }
    );

    context(
      'Check if correct params are passed for getting list of technologies',
      function () {
        before(function () {
          technologyServiceInstanceStub.getTechnologies = sinon
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
          technologyControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualStatusCode = result.statusCode;
              const actualData = result.data;
              const expectedStatusCode = 500;
              const expectedData = {
                err: 'Something went wrong',
                desc: 'Could Not Get Technology'
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
          technologyServiceInstanceStub.getTechnologies = sinon.stub();
        });
      }
    );
  });
});
