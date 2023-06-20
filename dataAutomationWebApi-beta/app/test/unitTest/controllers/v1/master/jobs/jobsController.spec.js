const {
  expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const {
  loggerMock
} = require('../../../../../helper');
const settingsConfig = {
  logger: loggerMock
};

const paginationServiceInstanceStub = {
  paginate: sinon.stub(),
};

const PaginationServiceStub = sinon
  .stub()
  .returns(paginationServiceInstanceStub);


const sortHandlerInstanceStub = {
  validate: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const jobServiceInstanceStub = {
  getAllMasterJobs: sinon.stub(),
  generateSignedURL: sinon.stub(),
  getMasterJobErrors: sinon.stub(),
};

const JobServiceStub = sinon.stub().returns(jobServiceInstanceStub);

const fileStreamServiceInstanceStub = {};

const FileStreamServiceStub = sinon
  .stub()
  .returns(fileStreamServiceInstanceStub);

const jobControllerModule = proxyquire(
  '../../../../../../controllers/v1/master/jobs/jobsController', {
    '../../../../services/master/jobs/jobsService': JobServiceStub,
    '../../../../services/helpers/paginationService': PaginationServiceStub,
    '@nexsalesdev/master-data-model/lib/services/sortHandler': SortHandlerStub,
    '../../../../services/stream/fileStreamService': FileStreamServiceStub,
  }
);

describe('#jobsController - get', function () {
  describe('Get All Master Jobs', function () {
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
          params: {}
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
          },
        };

        //Act
        jobControllerModule.get(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('This function could not throw expected error');
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
          params: {}
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
          },
        };

        // Act
        jobControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route',
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

    context('Check If sort is invalid', function () {
      before(function () {
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: '',
          offset: '',
        });
      });
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: 'sort',
            jobType: ['download'],
          },
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {},
          body: {}
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
          },
        };

        // Act
        jobControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'The sort value type is not an object'
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
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });

    context('Check If sort data is wrong', function () {
      before(function () {
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: '',
          offset: '',
        });
        sortHandlerInstanceStub.validate = sinon.stub().throws(new Error('Value of sort is not correct'));
      });
      it('Should return `400` with data validation error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
            jobType: ['download'],
          },
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {},
          body: {},
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
          },
        };
        jobControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Value of sort is not correct'
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
        paginationServiceInstanceStub.paginate = sinon.stub();
        sortHandlerInstanceStub.validate = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting list of master jobs', function () {
      before(function () {
        const jobRes = {
          totalCount: 0,
          docs: []
        };
        jobServiceInstanceStub.getAllMasterJobs = sinon.stub().returns(jobRes);
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
      });
      it('Should return `200` with master jobs list', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
            jobType: ['download'],
          },
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {},
          body: {},
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
          },
        };
        jobControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const sortableColumns = ['createdAt'];
            const multipleSort = false;
            const sort = {};
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              totalCount: 0,
              docs: []
            };

            const expectedSortValidateArgs = {
              sortableColumns,
              sort,
              multipleSort,
            };

            const inputs = {
              getDataCount: false,
              jobType: ['download'],
              userEmail: req.user.email,
              limit: 0,
              offset: 0,
              userRoles: ['manager'],
            }

            const expectedGetAllMasterJobsArgs = {
              inputs,
              sort,
            }

            const actualSortValidateFirstArg = sortHandlerInstanceStub.validate.getCall(0).args[0];
            const actualSortValidateSecondArg = sortHandlerInstanceStub.validate.getCall(0).args[1];
            const actualSortValidateThirdArg = sortHandlerInstanceStub.validate.getCall(0).args[2];
            const actualSortValidateArgsLength = sortHandlerInstanceStub.validate.getCall(0).args.length;

            const actualGetAllMasterJobsFirstArgs = jobServiceInstanceStub.getAllMasterJobs.getCall(0).args[0];
            const actualGetAllMasterJobsSecondArgs = jobServiceInstanceStub.getAllMasterJobs.getCall(0).args[1];
            const actualGetAllMasterJobsArgsLength = jobServiceInstanceStub.getAllMasterJobs.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualSortValidateFirstArg).to.deep.equal(expectedSortValidateArgs.sortableColumns, 'Expected value not pass in sort validate function');
            expect(actualSortValidateSecondArg).to.deep.equal(expectedSortValidateArgs.sort, 'Expected value not pass in sort validate function');
            expect(actualSortValidateThirdArg).to.deep.equal(expectedSortValidateArgs.multipleSort, 'Expected value not pass in sort validate function');
            expect(actualSortValidateArgsLength).to.deep.equal(Object.keys(expectedSortValidateArgs).length, 'Expected value not pass in sort validate function');

            expect(actualGetAllMasterJobsFirstArgs).to.deep.equal(expectedGetAllMasterJobsArgs.inputs, 'Expected value not pass in get all master jobs function');
            expect(actualGetAllMasterJobsSecondArgs).to.deep.equal(expectedGetAllMasterJobsArgs.sort, 'Expected value not pass in get all master jobs function');
            expect(actualGetAllMasterJobsArgsLength).to.deep.equal(Object.keys(expectedGetAllMasterJobsArgs).length, 'Expected value not pass in get all master jobs function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        jobServiceInstanceStub.getAllMasterJobs = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting list of master jobs', function () {
      before(function () {
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
        jobServiceInstanceStub.getAllMasterJobs = sinon.stub().throws(new Error('Something went wrong'));
      });
      it('Should return `500` when some internal error occurs', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
            jobType: ['download'],
          },
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {
            projectId: '222'
          },
          body: {},
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
          },
        };
        jobControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Master JOBs'
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
        paginationServiceInstanceStub.paginate = sinon.stub();
        jobServiceInstanceStub.getAllMasterJobs = sinon.stub();
      });
    });
  });
});

describe('#jobsController - getSignedURL', function () {
  describe('Get Master Job Signed URL', function () {
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
          params: {}
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
          },
        };

        //Act
        jobControllerModule.getSignedURL(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('This function could not throw expected error');
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
          params: {}
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
          },
        };

        // Act
        jobControllerModule.getSignedURL(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route',
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

    context('Check If jobId is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {
            jobId: ''
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
          },
        };

        // Act
        jobControllerModule.getSignedURL(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'jobId is required'
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

    context('Check if correct params are passed for getting signed url of master job', function () {
      before(function () {
        const url = "signedURL";
        jobServiceInstanceStub.generateSignedURL = sinon.stub().returns(url);
      });
      it('Should return `200` with master job signed URL', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {
            jobId: '123',
          },
          body: {},
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
          },
        };
        jobControllerModule.getSignedURL(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              url: "signedURL"
            };

            const inputs = {
              jobId: req.params.jobId,
              userEmail: req.user.email,
            }

            const expectedGenerateSignedUrlArgs = {
              inputs,
            }

            const actualGenerateSignedURLFirstArgs = jobServiceInstanceStub.generateSignedURL.getCall(0).args[0];
            const actualGenerateSignedURLArgsLength = jobServiceInstanceStub.generateSignedURL.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualGenerateSignedURLFirstArgs).to.deep.equal(expectedGenerateSignedUrlArgs.inputs, 'Expected value not pass in generate signed URL function');
            expect(actualGenerateSignedURLArgsLength).to.deep.equal(Object.keys(expectedGenerateSignedUrlArgs).length, 'Expected value not pass in generate signed URL function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        jobServiceInstanceStub.generateSignedURL = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting signed url of master job', function () {
      before(function () {
        jobServiceInstanceStub.generateSignedURL = sinon.stub().throws(new Error('Something went wrong'));
      });
      it('Should return `500` when some internal error occurs', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {
            jobId: '222'
          },
          body: {},
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
          },
        };
        jobControllerModule.getSignedURL(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Generate Signed URLs for Master Job'
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
        jobServiceInstanceStub.generateSignedURL = sinon.stub();
      });
    });
  });
});

describe('#jobsController - getJobErrors', function () {
  describe('Get Master Job Errors List', function () {
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
          params: {}
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
          },
        };

        //Act
        jobControllerModule.getJobErrors(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('This function could not throw expected error');
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
          params: {}
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
          },
        };

        // Act
        jobControllerModule.getJobErrors(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route',
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

    context('Check If jobId is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {
            jobId: ''
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
          },
        };

        // Act
        jobControllerModule.getJobErrors(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'jobId is required'
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

    context('Check if correct params are passed for getting master jobs errors list', function () {
      before(function () {
        jobServiceInstanceStub.getMasterJobErrors = sinon.stub().returns([
          {
            id: '01',
          }
        ]);
      });
      it('Should return `200` with master jobs errors list', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {},
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
          params: {
            jobId: '123',
          },
          body: {},
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
          },
        };
        jobControllerModule.getJobErrors(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              {
                id: '01',
              }
            ];

            const inputs = {
              jobId: req.params.jobId,
              userEmail: req.user.email,
            }

            const expectedGetMasterJobsErrorsListArgs = {
              inputs,
            }

            const actualGetMasterJobsErrorsListFirstArgs = jobServiceInstanceStub.getMasterJobErrors.getCall(0).args[0];
            const actualGetMasterJobsErrorsListArgsLength = jobServiceInstanceStub.getMasterJobErrors.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualGetMasterJobsErrorsListFirstArgs).to.deep.equal(expectedGetMasterJobsErrorsListArgs.inputs, 'Expected value not pass in get master jobs errors list function');
            expect(actualGetMasterJobsErrorsListArgsLength).to.deep.equal(Object.keys(expectedGetMasterJobsErrorsListArgs).length, 'Expected value not pass in get master jobs errors list function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        jobServiceInstanceStub.getMasterJobErrors = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting master jobs errors list', function () {
      before(function () {
        jobServiceInstanceStub.getMasterJobErrors = sinon.stub().throws(new Error('Something went wrong'));
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
            roles: ['manager'],
          },
          params: {
            jobId: '222'
          },
          body: {},
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
          },
        };
        jobControllerModule.getJobErrors(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get JOBs Errors For Master Job'
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
        jobServiceInstanceStub.getMasterJobErrors = sinon.stub();
      });
    });
  });
});