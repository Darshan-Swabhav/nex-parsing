const {
  expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const taskAllocationTempServiceInstanceStub = {
  getAllTaskAllocationTempData: sinon.stub(),
  editTaskAllocationTempDataById: sinon.stub(),
  deleteTaskAllocationTempDataById: sinon.stub(),
};
let TaskAllocationTempServiceStub = sinon.stub().returns(taskAllocationTempServiceInstanceStub);

const paginationServiceInstanceStub = {
  paginate: sinon.stub(),
};
let PaginationServiceStub = sinon.stub().returns(paginationServiceInstanceStub);

const taskAllocationTempControllerModule = proxyquire('../../../../../../../controllers/v1/projects/jobs/taskAllocationTemp/taskAllocationTempController', {
  '../../../../../services/projects/jobs/taskAllocationTemp/taskAllocationTempService': TaskAllocationTempServiceStub,
  '../../../../../services/helpers/paginationService': PaginationServiceStub
});

describe('#taskAllocationTempController - get', () => {
  describe('Return a List of Task Allocation Temp Data of a Project', () => {
    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
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
          },
        };

        // Act
        taskAllocationTempControllerModule.get(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;

            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If the User role is invalid', () => {
      it('Should return `403` with `User Forbidden` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
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
          },
        };

        // Act
        taskAllocationTempControllerModule.get(settingsConfig, req, res, next)
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
          })
      });
    });
    context('Check If ProjectId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: ''
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
          },
        };

        // Act
        taskAllocationTempControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectId is required'
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
    context('Check If JobId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: ''
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
          },
        };

        // Act
        taskAllocationTempControllerModule.get(settingsConfig, req, res, next)
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
    context('Check If get any errors while getting TaskAllocationTemp data Using the service function', () => {
      before(function () {
        taskAllocationTempServiceInstanceStub.getAllTaskAllocationTempData = sinon.stub().throws(new Error('Something went wrong in getting task allocation temp data'));
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          offset: 0,
          limit: 10
        });
      });
      it('Should return `500` with error message', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '111'
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
          },
        };

        // Act
        taskAllocationTempControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong in getting task allocation temp data',
              desc: 'Could Not Get Task Allocation Temp Data'
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
        taskAllocationTempServiceInstanceStub.getAllTaskAllocationTempData = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });
    context('Check If the return taskAllocationTemp data list is correct', () => {
      before(function () {
        taskAllocationTempServiceInstanceStub.getAllTaskAllocationTempData = sinon.stub().returns([{
          id: '111'
        }]);
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          offset: 20,
          limit: 20
        });
      });
      it('Should return `200` with List of Task Allocation Temp Data', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '111'
          },
          query: {
            pageNo: 1,
            pageSize: 20
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
        taskAllocationTempControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const pageNo = 1;
            const pageSize = 20;
            const getAllTaskAllocationTempDataInput = {
              projectId: req.params.projectId,
              jobId: req.params.jobId,
              limit: 20,
              offset: 20,
            };
            expect(paginationServiceInstanceStub.paginate.calledWithExactly(pageNo, pageSize)).to.equal(true);
            expect(taskAllocationTempServiceInstanceStub.getAllTaskAllocationTempData.calledWithExactly(getAllTaskAllocationTempDataInput)).to.equal(true);

            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [{
              id: '111'
            }];

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        taskAllocationTempServiceInstanceStub.getAllTaskAllocationTempData = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });
  });
});

describe('#taskAllocationTempController - delete', () => {
  describe('Deleting a TaskAllocationTempData from DB table using TaskAllocationTempData ID', () => {
    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: ''
          },
          params: {
            projectId: '111',
            jobId:'222',
            taskAllocationTempId: '333',
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
          },
        };

        // Act
        taskAllocationTempControllerModule.delete(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;

            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If the User role is invalid', () => {
      it('Should return `403` with `User Forbidden` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['agent']
          },
          params: {
            projectId: '111',
            jobId:'222',
            taskAllocationTempId: '333',
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
          },
        };

        // Act
        taskAllocationTempControllerModule.delete(settingsConfig, req, res, next)
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
    context('Check If ProjectId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '',
            jobId:'222',
            taskAllocationTempId: '333',
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
          },
        };

        // Act
        taskAllocationTempControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectId is required'
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
    context('Check If JobId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId:'',
            taskAllocationTempId: '333',
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
          },
        };

        // Act
        taskAllocationTempControllerModule.delete(settingsConfig, req, res, next)
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
    context('Check If TaskAllocationTempId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId:'222',
            taskAllocationTempId: '',
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
          },
        };

        // Act
        taskAllocationTempControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'taskAllocationTempId is required'
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
    context('Check If get any errors while deleting TaskAllocationTemp data Using the service function', () => {
      before(function () {
        taskAllocationTempServiceInstanceStub.deleteTaskAllocationTempDataById = sinon.stub().throws(new Error('Something went wrong in deleting task allocation temp data'));
      });
      it('Should return `500` with error message', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '333'
          },
          query: {},
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
        taskAllocationTempControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong in deleting task allocation temp data',
              desc: 'Could Not Delete Task Allocation Temp Data'
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
        taskAllocationTempServiceInstanceStub.deleteTaskAllocationTempDataById = sinon.stub();
      });
    });
    context('Check if taskAllocationData deleted successfully', () => {
      before(function () {
        taskAllocationTempServiceInstanceStub.deleteTaskAllocationTempDataById = sinon.stub().returns('delete successfully');
      });
      it('Should return `200`', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '333'
          },
          query: {},
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
        taskAllocationTempControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 200;

            const deleteTaskAllocationTempDataByIdInput = {
              projectId: req.params.projectId,
              jobId: req.params.jobId,
              taskAllocationTempId: req.params.taskAllocationTempId,
            };
            
            expect(taskAllocationTempServiceInstanceStub.deleteTaskAllocationTempDataById.calledWithExactly(deleteTaskAllocationTempDataByIdInput)).to.equal(true);
            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        taskAllocationTempServiceInstanceStub.deleteTaskAllocationTempDataById = sinon.stub();
      });
    });
  });
});

describe('#taskAllocationTempController - put', () => {
  describe('Update agent name and ID in taskAllocationTemp data', () => {
    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
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
          },
        };

        // Act
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;

            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If the User role is invalid', () => {
      it('Should return `403` with `User Forbidden` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
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
          },
        };

        // Act
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
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
    context('Check If ProjectId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: ''
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
          },
        };

        // Act
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectId is required'
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
    context('Check If JobId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '',
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
          },
        };

        // Act
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
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
    context('Check If TaskAllocationTempId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: ''
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
          },
        };

        // Act
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'taskAllocationTempId is required'
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
    context('Check If TaskAllocationTempData is empty', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '333'
          },
          query: {},
          body: '',
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
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'taskAllocationTemp Data is required'
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
    context('Check If TaskAllocationTempData is not a object', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '333'
          },
          query: {},
          body: 'abc',
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
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'incorrect format of taskAllocationTemp data in request body'
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
    context('Check If TaskAllocationTempData in agentId is missing', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '333'
          },
          query: {},
          body: {
            agentId: '',
            agentName: 'abc'
          },
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
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Missing agentId in taskAllocationTempData in request body'
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
    context('Check If TaskAllocationTempData in agentName is missing', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '333'
          },
          query: {},
          body: {
            agentId: '111',
            agentName: ''
          },
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
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Missing agentName in taskAllocationTempData in request body'
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
    context('Check If TaskAllocationTempData in agentId is not a string', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '123'
          },
          query: {},
          body: {
            agentId: 111,
            agentName: 'abc'
          },
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
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'incorrect format of agentId in request body'
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
    context('Check If TaskAllocationTempData in agentName is not a string', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '123'
          },
          query: {},
          body: {
            agentId: '111',
            agentName: 111
          },
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
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'incorrect format of agentName in request body'
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
    context('Check If get any errors while editing TaskAllocationTemp data Using the service function', () => {
      before(function () {
        taskAllocationTempServiceInstanceStub.editTaskAllocationTempDataById = sinon.stub().throws(new Error('Something went wrong in editing task allocation temp data'));
      });
      it('Should return `500` with error message', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '123'
          },
          query: {},
          body: {
            agentId: '111',
            agentName: 'abc'
          },
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
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong in editing task allocation temp data',
              desc: 'Could Not Edit Task Allocation Temp Data'
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
        taskAllocationTempServiceInstanceStub.editTaskAllocationTempDataById = sinon.stub();
      });
    });
    context('Check if taskAllocationData edited successfully', () => {
      before(function () {
        taskAllocationTempServiceInstanceStub.editTaskAllocationTempDataById = sinon.stub().returns('edit successfully');
      });
      it('Should return `200`', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '111',
            jobId: '222',
            taskAllocationTempId: '123'
          },
          query: {},
          body: {
            agentId: '111',
            agentName: 'abc'
          },
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
        taskAllocationTempControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 200;

            const editTaskAllocationTempDataByIdInput = {
              projectId: req.params.projectId,
              jobId: req.params.jobId,
              taskAllocationTempId: req.params.taskAllocationTempId,
              agentId: req.body.agentId,
              agentName: req.body.agentName,
              logger: settingsConfig.logger,
            };
            expect(taskAllocationTempServiceInstanceStub.editTaskAllocationTempDataById.calledWithExactly(editTaskAllocationTempDataByIdInput)).to.equal(true);

            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        taskAllocationTempServiceInstanceStub.editTaskAllocationTempDataById = sinon.stub();
      });
    });
  });
});