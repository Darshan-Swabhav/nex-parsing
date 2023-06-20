const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { loggerMock } = require('../../../../../helper');
const settingsConfig = {
  logger: loggerMock
};

const jobServiceInstanceStub = {
  validateUpdateJobData: sinon.stub(),
  updateJobById: sinon.stub()
};
let JobServiceStub = sinon.stub().returns(jobServiceInstanceStub);

const jobControllerModule = proxyquire(
  '../../../../../../controllers/v1/projects/jobs/jobController.js',
  {
    ' ../../../../services/projects/jobs/jobService': JobServiceStub
  }
);

describe('#jobController - put', () => {
  describe('Updates The Job Status', () => {
    context('When User Authentication Fail', () => {
      it('Should return `401`', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: ''
          },
          params: {},
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
        jobControllerModule
          .put(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('Expected To throw Error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Invalid token';
            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('When User Unauthorized Fail', () => {
      it('Should return `403`', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: 'test|unit_test_user_id',
            roles: ['agent']
          },
          params: {},
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
        jobControllerModule
          .put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 403;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            const actualData = result.data;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route',
            };
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('When `projectId` is Missing in Request Param', () => {
      it('Should Return 400', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: 'test|unit_test_user_id',
            roles: ['manager']
          },
          params: {
            jobId: '01'
          },
          query: {},
          body: {
            status: 'Unknown'
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
        jobControllerModule
          .put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 400;
            expect(actualStatusCode).to.equal(expectedStatusCode);

            const actualMessage = result.data.desc;
            const expectedMessage = 'projectId is required';
            expect(actualMessage).to.equal(expectedMessage);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('When `jobId` is Missing in Request Param', () => {
      it('Should Return 400', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: 'test|unit_test_user_id',
            roles: ['manager']
          },
          params: {
            projectId: '01'
          },
          query: {},
          body: {
            status: 'Unknown'
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
        jobControllerModule
          .put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 400;
            expect(actualStatusCode).to.equal(expectedStatusCode);
            const actualMessage = result.data.desc;
            const expectedMessage = 'jobId is required';
            expect(actualMessage).to.equal(expectedMessage);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('When Unknown Job Status Received', () => {
      it('Should Return Response 400', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: 'test|unit_test_user_id',
            roles: ['manager']
          },
          params: {
            projectId: '01',
            jobId: '01'
          },
          query: {},
          body: {
            status: 'Unknown'
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

        jobServiceInstanceStub.validateUpdateJobData.throws();

        // Act
        jobControllerModule
          .put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            jobServiceInstanceStub.validateUpdateJobData.reset();
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 400;
            expect(actualStatusCode).to.equal(expectedStatusCode);
            done();
          })
          .catch(function (err) {
            jobServiceInstanceStub.validateUpdateJobData.reset();
            done(err);
          });
      });
    });
    context('When `Cancelled` Job Status Received', () => {
      it('Should Return Response 200', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: 'test|unit_test_user_id',
            roles: ['manager']
          },
          params: {
            projectId: '01',
            jobId: '01'
          },
          query: {},
          body: {
            status: 'Cancelled'
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

        jobServiceInstanceStub.updateJobById.resolves();

        // Act
        jobControllerModule
          .put(settingsConfig, req, res, next)
          .then(function (result) {
            jobServiceInstanceStub.updateJobById.reset();
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 200;
            expect(actualStatusCode).to.equal(expectedStatusCode);
            done();
          })
          .catch(function (err) {
            jobServiceInstanceStub.updateJobById.reset();
            done(err);
          });
      });
    });
    context('When `Verified` Job Status Received', () => {
      it('Should Return Response 200', () => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: 'test|unit_test_user_id',
            roles: ['manager']
          },
          params: {
            projectId: '01',
            jobId: '01'
          },
          query: {},
          body: {
            status: 'Verified'
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

        jobServiceInstanceStub.updateJobById.resolves();

        // Act
        jobControllerModule
          .put(settingsConfig, req, res, next)
          .then(function (result) {
            jobServiceInstanceStub.updateJobById.reset();
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 200;
            expect(actualStatusCode).to.equal(expectedStatusCode);
            done();
          })
          .catch(function (err) {
            jobServiceInstanceStub.updateJobById.reset();
            done(err);
          });
      });
    });
  });
});
