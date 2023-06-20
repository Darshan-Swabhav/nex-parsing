const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const generateUUID = require('uuidv4');

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const taskCRUDServiceInstanceStub = {
  getAllTaskForAgent: sinon.stub(),
  getAllTaskForManager: sinon.stub(),
  validateTasksAssignData: sinon.stub(),
  tasksAssign: sinon.stub(),
  getAllTaskStatsOfAProject: sinon.stub(),
  getTaskDispositions: sinon.stub(),
  getTaskUsersByType: sinon.stub(),
  getTaskUsers: sinon.stub(),
};

const TaskCRUDServiceStub = sinon.stub().returns(taskCRUDServiceInstanceStub);

const paginationServiceInstanceStub = {
  paginate: sinon.stub(),
};

const PaginationServiceStub = sinon
  .stub()
  .returns(paginationServiceInstanceStub);

const filterHandlerInstanceStub = {
  validate: sinon.stub(),
};

const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);

const sortHandlerInstanceStub = {
  validate: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const taskControllerModule = proxyquire(
  '../../../../../../controllers/v1/projects/tasks/tasksController',
  {
    '../../../../services/projects/tasks/tasksService': TaskCRUDServiceStub,
    '../../../../services/helpers/paginationService': PaginationServiceStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler':
      FilterHandlerStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler':
      SortHandlerStub,
  },
);

let uuidStub;

describe('#tasksController - post', () => {
  describe('Assign tasks', () => {
    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '',
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
        taskControllerModule
          .post(settingsConfig, req, res, next)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error',
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;

            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch((err) => {
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
            roles: ['agent'],
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
        taskControllerModule
          .post(settingsConfig, req, res, next)
          .then((result) => {
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
          .catch((err) => {
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
        taskControllerModule
          .post(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectId is required',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check If filter is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: 'filter',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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

        // Act
        taskControllerModule
          .post(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'The filter value type is not an object',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check If sort is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: 'sort',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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

        // Act
        taskControllerModule
          .post(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'The sort value type is not an object',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check If taskAssignData, filter or sort data is wrong', () => {
      before(() => {
        taskCRUDServiceInstanceStub.validateTasksAssignData = sinon
          .stub()
          .throws(new Error('Incorrect tasks assignment'));
      });
      it('Should return `400` with data validation error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
          },
          body: {
            taskTypeId: '01',
            agents: ['auth0|61110707c261f8006916a368'],
            allocationOf: 'account',
            taskAllocationStrategy: 'Sequential',
            limitAssignment: 'Assign All Filtered',
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
        taskControllerModule
          .post(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Incorrect tasks assignment',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      after(() => {
        taskCRUDServiceInstanceStub.validateTasksAssignData = sinon.stub();
      });
    });

    context(
      'Check If get any errors while assign task Using the service function',
      () => {
        before(() => {
          taskCRUDServiceInstanceStub.validateTasksAssignData = sinon
            .stub()
            .returns('Data is correct');
          taskCRUDServiceInstanceStub.tasksAssign = sinon
            .stub()
            .throws(new Error('Something went wrong in assign task'));
        });
        it('Should return `500` with error message', (done) => {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            query: {
              filter: '{}',
              sort: '{}',
            },
            user: {
              sub: '111',
              roles: ['manager'],
            },
            params: {
              projectId: '222',
            },
            body: {
              taskTypeId: '01',
              agents: ['auth0|61110707c261f8006916a368'],
              allocationOf: 'account',
              taskAllocationStrategy: 'Sequential',
              limitAssignment: 'Assign All Filtered',
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
          taskControllerModule
            .post(settingsConfig, req, res, next)
            .then((result) => {
              // Assert
              const actualStatusCode = result.statusCode;
              const actualData = result.data;
              const expectedStatusCode = 500;
              const expectedData = {
                err: 'Something went wrong in assign task',
                desc: 'Could Not Create Tasks',
              };

              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);

              done();
            })
            .catch((err) => {
              done(err);
            });
        });
        after(() => {
          taskCRUDServiceInstanceStub.validateTasksAssignData = sinon.stub();
          taskCRUDServiceInstanceStub.tasksAssign = sinon.stub();
        });
      },
    );

    context('Check If task assign successfully', () => {
      before(() => {
        taskCRUDServiceInstanceStub.validateTasksAssignData = sinon
          .stub()
          .returns('Data is correct');
        taskCRUDServiceInstanceStub.tasksAssign = sinon
          .stub()
          .returns('Task assign successfully');
      });
      it('Should return `200`', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{"disposition":{"operator":"=","value":["Pending"]}}',
            sort: '{"disposition":"asc"}',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
          },
          body: {
            taskTypeId: '01',
            agents: ['auth0|61110707c261f8006916a368'],
            allocationOf: 'account',
            taskAllocationStrategy: 'Sequential',
            limitAssignment: 'Assign All Filtered',
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
        taskControllerModule
          .post(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = 'Task assign successfully';

            const validateTasksAssignDataInput = {
              tasksAssignData: req.body,
              filter: JSON.parse(req.query.filter),
              sort: JSON.parse(req.query.sort),
            };
            const taskAssignInput = req.body;
            taskAssignInput.projectId = req.params.projectId;
            taskAssignInput.userId = req.user.sub;
            taskAssignInput.filter = JSON.parse(req.query.filter);
            taskAssignInput.sort = JSON.parse(req.query.sort);

            expect(
              taskCRUDServiceInstanceStub.validateTasksAssignData.calledWithExactly(
                validateTasksAssignDataInput.tasksAssignData,
                validateTasksAssignDataInput.filter,
                validateTasksAssignDataInput.sort,
              ),
            ).to.equal(true);
            expect(
              taskCRUDServiceInstanceStub.tasksAssign.calledWithExactly(
                taskAssignInput,
              ),
            ).to.equal(true);
            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      after(() => {
        taskCRUDServiceInstanceStub.validateTasksAssignData = sinon.stub();
        taskCRUDServiceInstanceStub.tasksAssign = sinon.stub();
      });
    });
  });
});

describe('#tasksController - getAllTaskStatsOfAProject', () => {
  describe('Get Tasks Stats', () => {
    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '',
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
        taskControllerModule
          .getAllTaskStatsOfAProject(settingsConfig, req, res, next)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error',
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Invalid token';

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
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
            roles: ['agent'],
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
        taskControllerModule
          .getAllTaskStatsOfAProject(settingsConfig, req, res, next)
          .then((result) => {
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
          .catch((err) => {
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
          query: {
            filter: 'filter'
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '',
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
        taskControllerModule
          .getAllTaskStatsOfAProject(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectId is required',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check If filter is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: 'filter',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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

        // Act
        taskControllerModule
          .getAllTaskStatsOfAProject(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'The filter value type is not an object',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check If filter data is wrong', () => {
      before(() => {
        filterHandlerInstanceStub.validate = sinon
          .stub()
          .throws(new Error('Value of filter is not correct'));
      });
      it('Should return `400` with data validation error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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
        taskControllerModule
          .getAllTaskStatsOfAProject(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Value of filter is not correct',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      after(() => {
        filterHandlerInstanceStub.validate = sinon.stub();
      });
    });

    context('Check if correct params are passed', () => {
      before(() => {
        const taskStatsRes = [
          {
            status: 'Total',
            count: 0,
          },
          {
            status: 'Completed',
            count: 0,
          },
          {
            status: 'Overdue',
            count: 0,
          },
          {
            status: 'Upcoming',
            count: 0,
          },
          {
            status: 'Working',
            count: 0,
          },
        ];
        taskCRUDServiceInstanceStub.getAllTaskStatsOfAProject = sinon
          .stub()
          .returns(taskStatsRes);
      });
      it('Should return `200` with task stats data', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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
        taskControllerModule
          .getAllTaskStatsOfAProject(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const filterColumns = {
              accountName: { type: 'string', operator: ['=', 'isNull'] },
              contactEmail: { type: 'string', operator: ['=', 'isNull'] },
              userName: { type: 'array', operator: ['='] },
              status: { type: 'string', operator: ['='] },
              accountDisposition: { type: 'array', operator: ['=', 'isNull'] },
              contactDisposition: { type: 'array', operator: ['=', 'isNull'] },
              accountFinalDisposition: {
                type: 'array',
                operator: ['=', 'isNull'],
              },
              potential: { type: 'string', operator: ['=', '<', '>'] },
              priority: { type: 'string', operator: ['='] },
              dueDate: { type: 'string', operator: ['<', '>='] },
              taskCreatedDate: { type: 'array', operator: ['between'] },
              taskUpdatedDate: { type: 'array', operator: ['between'] },
            };
            const filter = {};
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              {
                status: 'Total',
                count: 0,
              },
              {
                status: 'Completed',
                count: 0,
              },
              {
                status: 'Overdue',
                count: 0,
              },
              {
                status: 'Upcoming',
                count: 0,
              },
              {
                status: 'Working',
                count: 0,
              },
            ];
            const expectedFilterValidateArgs = {
              filterColumns,
              filter,
            };

            const inputs = {
              projectId: req.params.projectId,
            };

            const expectedGetAllTaskStatsOfAProjectArgs = {
              inputs,
              filter,
            };

            const actualFilterValidateFirstArg =
              filterHandlerInstanceStub.validate.getCall(0).args[0];
            const actualFilterValidateSecondArg =
              filterHandlerInstanceStub.validate.getCall(0).args[1];
            const actualFilterValidateArgsLength =
              filterHandlerInstanceStub.validate.getCall(0).args.length;

            const actualGetAllTaskStatsOfAProjectFirstArgs =
              taskCRUDServiceInstanceStub.getAllTaskStatsOfAProject.getCall(0)
                .args[0];
            const actualGetAllTaskStatsOfAProjectSecondArgs =
              taskCRUDServiceInstanceStub.getAllTaskStatsOfAProject.getCall(0)
                .args[1];
            const actualGetAllTaskStatsOfAProjectArgsLength =
              taskCRUDServiceInstanceStub.getAllTaskStatsOfAProject.getCall(0)
                .args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualFilterValidateFirstArg).to.deep.equal(
              expectedFilterValidateArgs.filterColumns,
              'Expected value not pass in filter validate function',
            );
            expect(actualFilterValidateSecondArg).to.deep.equal(
              expectedFilterValidateArgs.filter,
              'Expected value not pass in filter validate function',
            );
            expect(actualFilterValidateArgsLength).to.deep.equal(
              Object.keys(expectedFilterValidateArgs).length,
              'Expected value not pass in filter validate function',
            );

            expect(actualGetAllTaskStatsOfAProjectFirstArgs).to.deep.equal(
              expectedGetAllTaskStatsOfAProjectArgs.inputs,
              'Expected value not pass in get all task stats of a project function',
            );
            expect(actualGetAllTaskStatsOfAProjectSecondArgs).to.deep.equal(
              expectedGetAllTaskStatsOfAProjectArgs.filter,
              'Expected value not pass in get all task stats of a project function',
            );
            expect(actualGetAllTaskStatsOfAProjectArgsLength).to.deep.equal(
              Object.keys(expectedGetAllTaskStatsOfAProjectArgs).length,
              'Expected value not pass in get all task stats of a project function',
            );

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      after(() => {
        taskCRUDServiceInstanceStub.getAllTaskStatsOfAProject = sinon.stub();
      });
    });

    context('Check if correct params are passed', () => {
      before(() => {
        taskCRUDServiceInstanceStub.getAllTaskStatsOfAProject = sinon
          .stub()
          .throws(new Error('Something went wrong'));
      });
      it('Should return `500` when some internal error occurs', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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
        taskControllerModule
          .getAllTaskStatsOfAProject(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Task Stats',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      after(() => {
        taskCRUDServiceInstanceStub.getAllTaskStatsOfAProject = sinon.stub();
      });
    });
  });
});

describe('#tasksController - getTaskUniqueFields', () => {
  describe('Get Task Unique fields', () => {
    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '',
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
        taskControllerModule
          .getTaskUniqueFields(settingsConfig, req, res, next)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error',
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Invalid token';

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
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
          },
          query: {
            field: 'disposition',
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
        taskControllerModule
          .getTaskUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectId is required',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check If "field" is invalid', () => {
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
            projectId: '01',
          },
          query: {
            field: '',
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
        taskControllerModule
          .getTaskUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'field is required',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check if correct params are passed', () => {
      before(() => {
        const taskUsersRes = [
          'agent1@nexsales.com',
          'agent2@nexsales.com',
          'agent3@nexsales.com',
        ];
        const taskDispositionsRes = [
          'Contact Built',
          'Already in CRM - Suppression',
        ];

        const taskDispositionsTypeRes = [
          'Contact Built',
          'Already in CRM - Suppression',
        ];
        taskCRUDServiceInstanceStub.getTaskDispositions = sinon
          .stub()
          .returns(taskDispositionsRes);
        taskCRUDServiceInstanceStub.getTaskUsersByType = sinon
          .stub()
          .returns(taskDispositionsTypeRes);
        taskCRUDServiceInstanceStub.getTaskUsers = sinon
          .stub()
          .returns(taskUsersRes);
      });

      it('Should return `200` with unique list of Task Disposition data', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'disposition',
          },
          user: {
            sub: '111',
          },
          params: {
            projectId: '222',
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
        taskControllerModule
          .getTaskUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              'Contact Built',
              'Already in CRM - Suppression',
            ];
            const inputs = {
              projectId: req.params.projectId,
            };

            const expectedGetTaskDispositionArgs = {
              inputs,
            };

            const actualGetTaskDispositionArgs =
              taskCRUDServiceInstanceStub.getTaskDispositions.getCall(0)
                .args[0];
            const actualGetTaskDispositionArgsLength =
              taskCRUDServiceInstanceStub.getTaskDispositions.getCall(0).args
                .length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualGetTaskDispositionArgs).to.deep.equal(
              expectedGetTaskDispositionArgs.inputs,
              'Expected value not pass in get task disposition function',
            );
            expect(actualGetTaskDispositionArgsLength).to.deep.equal(
              Object.keys(expectedGetTaskDispositionArgs).length,
              'Expected value not pass in get task disposition function',
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it('Should return `200` with unique list of Task users data', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'userName',
          },
          user: {
            sub: '111',
          },
          params: {
            projectId: '222',
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
        taskControllerModule
          .getTaskUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              'agent1@nexsales.com',
              'agent2@nexsales.com',
              'agent3@nexsales.com',
            ];
            const inputs = {
              projectId: req.params.projectId,
            };

            const expectedGetTaskUsersArgs = {
              inputs,
            };

            const actualGetTaskUserArgs =
              taskCRUDServiceInstanceStub.getTaskUsers.getCall(0).args[0];
            const actualGetTaskUserArgsLength =
              taskCRUDServiceInstanceStub.getTaskUsers.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualGetTaskUserArgs).to.deep.equal(
              expectedGetTaskUsersArgs.inputs,
              'Expected value not pass in get task users function',
            );
            expect(actualGetTaskUserArgsLength).to.deep.equal(
              Object.keys(expectedGetTaskUsersArgs).length,
              'Expected value not pass in get task users function',
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      after(() => {
        taskCRUDServiceInstanceStub.getTaskDispositions = sinon.stub();
        taskCRUDServiceInstanceStub.getTaskUsersByType = sinon.stub();
        taskCRUDServiceInstanceStub.getTaskUsers = sinon.stub();
      });
    });

    context('Check if correct params are passed', () => {
      before(() => {
        taskCRUDServiceInstanceStub.getTaskDispositions = sinon
          .stub()
          .throws(new Error('Something went wrong'));
        taskCRUDServiceInstanceStub.getTaskUsers = sinon
          .stub()
          .throws(new Error('Something went wrong'));
      });
      it('Should return `500` when some internal error occurs in getTaskDispositions', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'disposition',
          },
          user: {
            sub: '111',
          },
          params: {
            projectId: '222',
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
        taskControllerModule
          .getTaskUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Tasks Facets',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Should return `500` when some internal error occurs in getTaskUsers', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'userName',
          },
          user: {
            sub: '111',
          },
          params: {
            projectId: '222',
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
        taskControllerModule
          .getTaskUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Tasks Facets',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      after(() => {
        taskCRUDServiceInstanceStub.getTaskDispositions = sinon.stub();
        taskCRUDServiceInstanceStub.getTaskUsers = sinon.stub();
      });
    });
  });
});

describe('#tasksController - get', () => {
  describe('Get all tasks', () => {
    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '',
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
        taskControllerModule
          .get(settingsConfig, req, res, next)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error',
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Invalid token';

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
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
          query: {
            filter: 'filter'
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '',
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
        taskControllerModule
          .get(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectId is required',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check If filter is invalid', function () {
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
            filter: 'filter'
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222'
          },
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
        taskControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'The filter value type is not an object'
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

    context('Check If filter data is wrong', function () {
      before(function () {
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: '',
          offset: '',
        });
        filterHandlerInstanceStub.validate = sinon.stub().throws(new Error('Value of filter is not correct'));
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
          },
          user: {
            sub: '111',
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
        taskControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Value of filter is not correct'
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
        filterHandlerInstanceStub.validate = sinon.stub();
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
            sort: 'sort'
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222'
          },
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
        taskControllerModule.get(settingsConfig, req, res, next)
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
          },
          user: {
            sub: '111',
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
        taskControllerModule.get(settingsConfig, req, res, next)
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

    context('Check If the User role is invalid', function () {
      before(function () {
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: '',
          offset: '',
        });
      });
      it('Should return `403` with `User Forbidden` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
          },
          user: {
            sub: '111',
            roles: ['abc'],
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

        // Act
        taskControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'Forbidden Error',
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
      after(function () {
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting list of tasks for manager', function () {
      before(function () {
        const taskRes = {
          totalCount: 0,
          docs: []
        };
        taskCRUDServiceInstanceStub.getAllTaskForManager = sinon.stub().returns(taskRes);
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
        uuidStub = sinon.stub(generateUUID, 'uuid').returns('c23624e9-e21d-4f19-8853-cfca73e7109a');
      });
      it('Should return `200` with tasks list for manager', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
          },
          user: {
            sub: '111',
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
        taskControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const filterColumns = {
              accountName: { type: 'string', operator: ['=', 'isNull'] },
              contactEmail: { type: 'string', operator: ['=', 'isNull'] },
              userName: { type: 'array', operator: ['='] },
              status: { type: 'string', operator: ['='] },
              accountDisposition: { type: 'array', operator: ['=', 'isNull'] },
              contactDisposition: { type: 'array', operator: ['=', 'isNull'] },
              accountFinalDisposition: { type: 'array', operator: ['=', 'isNull'] },
              potential: { type: 'string', operator: ['=', '<', '>'] },
              priority: { type: 'string', operator: ['='] },
              dueDate: { type: 'string', operator: ['<', '>='] },
              taskCreatedDate: { type: 'array', operator: ['between'] },
              taskUpdatedDate: { type: 'array', operator: ['between'] },
            };
            const sortableColumns = [
              'accountName',
              'userName',
              'status',
              'accountDisposition',
              'contactDisposition',
              'accountFinalDisposition',
              'contactEmail',
              'potential',
              'priority',
            ];
            const multipleSort = true;
            const filter = {};
            const sort = {};
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              totalCount: 0,
              docs: []
            };
            const expectedFilterValidateArgs = {
              filterColumns,
              filter,
            };

            const expectedSortValidateArgs = {
              sortableColumns,
              sort,
              multipleSort,
            };

            const inputs = {
              projectId: req.params.projectId,
              userId: req.user.sub,
              limit: 0,
              offset: 0,
              countOnly: false,
              requestId: 'c236',
            }

            const expectedGetAllTaskListArgs = {
              inputs,
              filter,
              sort,
            }

            const actualFilterValidateFirstArg = filterHandlerInstanceStub.validate.getCall(0).args[0];
            const actualFilterValidateSecondArg = filterHandlerInstanceStub.validate.getCall(0).args[1];
            const actualFilterValidateArgsLength = filterHandlerInstanceStub.validate.getCall(0).args.length;

            const actualSortValidateFirstArg = sortHandlerInstanceStub.validate.getCall(0).args[0];
            const actualSortValidateSecondArg = sortHandlerInstanceStub.validate.getCall(0).args[1];
            const actualSortValidateThirdArg = sortHandlerInstanceStub.validate.getCall(0).args[2];
            const actualSortValidateArgsLength = sortHandlerInstanceStub.validate.getCall(0).args.length;

            const actualGetAllTasksFirstArgs = taskCRUDServiceInstanceStub.getAllTaskForManager.getCall(0).args[0];
            const actualGetAllTasksSecondArgs = taskCRUDServiceInstanceStub.getAllTaskForManager.getCall(0).args[1];
            const actualGetAllTasksThirdArgs = taskCRUDServiceInstanceStub.getAllTaskForManager.getCall(0).args[2];
            const actualGetAllTasksArgsLength = taskCRUDServiceInstanceStub.getAllTaskForManager.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualFilterValidateFirstArg).to.deep.equal(expectedFilterValidateArgs.filterColumns, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateSecondArg).to.deep.equal(expectedFilterValidateArgs.filter, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateArgsLength).to.deep.equal(Object.keys(expectedFilterValidateArgs).length, 'Expected value not pass in filter validate function');

            expect(actualSortValidateFirstArg).to.deep.equal(expectedSortValidateArgs.sortableColumns, 'Expected value not pass in sort validate function');
            expect(actualSortValidateSecondArg).to.deep.equal(expectedSortValidateArgs.sort, 'Expected value not pass in sort validate function');
            expect(actualSortValidateThirdArg).to.deep.equal(expectedSortValidateArgs.multipleSort, 'Expected value not pass in sort validate function');
            expect(actualSortValidateArgsLength).to.deep.equal(Object.keys(expectedSortValidateArgs).length, 'Expected value not pass in sort validate function');

            expect(actualGetAllTasksFirstArgs).to.deep.equal(expectedGetAllTaskListArgs.inputs, 'Expected value not pass in get all manager task function');
            expect(actualGetAllTasksSecondArgs).to.deep.equal(expectedGetAllTaskListArgs.filter, 'Expected value not pass in get all manager task function');
            expect(actualGetAllTasksThirdArgs).to.deep.equal(expectedGetAllTaskListArgs.filter, 'Expected value not pass in get all manager task function');
            expect(actualGetAllTasksArgsLength).to.deep.equal(Object.keys(expectedGetAllTaskListArgs).length, 'Expected value not pass in get all manager task function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        taskCRUDServiceInstanceStub.getAllTaskForManager = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
        uuidStub.restore();
      });
    });

    context('Check if correct params are passed for getting list of tasks for agent', function () {
      before(function () {
        const taskRes = {
          counts: [{
              status: 'Total',
              count: 0,
            },
            {
              status: 'Completed',
              count: 0,
            },
            {
              status: 'Overdue',
              count: 0,
            },
            {
              status: 'Upcoming',
              count: 0,
            },
            {
              status: 'Working',
              count: 0,
            }
          ],
          totalCount: 0,
          docs: []
        };
        taskCRUDServiceInstanceStub.getAllTaskForAgent = sinon.stub().returns(taskRes);
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
        uuidStub = sinon.stub(generateUUID, 'uuid').returns('c23624e9-e21d-4f19-8853-cfca73e7109a');
      });
      it('Should return `200` with tasks list for agent', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}',
          },
          user: {
            sub: '111',
            roles: ['agent'],
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
        taskControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const filter = {};
            const sort = {};
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              totalCount: 0,
              docs: [],
              counts: [{
                  status: 'Total',
                  count: 0,
                },
                {
                  status: 'Completed',
                  count: 0,
                },
                {
                  status: 'Overdue',
                  count: 0,
                },
                {
                  status: 'Upcoming',
                  count: 0,
                },
                {
                  status: 'Working',
                  count: 0,
                }
              ],
            };

            const inputs = {
              projectId: req.params.projectId,
              userId: req.user.sub,
              limit: 0,
              offset: 0,
              countOnly: false,
              requestId: 'c236',
            }

            const expectedGetAllTaskListArgs = {
              inputs,
              filter,
              sort,
            }

            const actualGetAllTasksFirstArgs = taskCRUDServiceInstanceStub.getAllTaskForAgent.getCall(0).args[0];
            const actualGetAllTasksSecondArgs = taskCRUDServiceInstanceStub.getAllTaskForAgent.getCall(0).args[1];
            const actualGetAllTasksThirdArgs = taskCRUDServiceInstanceStub.getAllTaskForAgent.getCall(0).args[2];
            const actualGetAllTasksArgsLength = taskCRUDServiceInstanceStub.getAllTaskForAgent.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualGetAllTasksFirstArgs).to.deep.equal(expectedGetAllTaskListArgs.inputs, 'Expected value not pass in get all agent task function');
            expect(actualGetAllTasksSecondArgs).to.deep.equal(expectedGetAllTaskListArgs.filter, 'Expected value not pass in get all agent task function');
            expect(actualGetAllTasksThirdArgs).to.deep.equal(expectedGetAllTaskListArgs.filter, 'Expected value not pass in get all agent task function');
            expect(actualGetAllTasksArgsLength).to.deep.equal(Object.keys(expectedGetAllTaskListArgs).length, 'Expected value not pass in get all agent task function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        taskCRUDServiceInstanceStub.getAllTaskForAgent = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
        uuidStub.restore();
      });
    });

    context('Check if correct params are passed for getting list of contacts for manager', function () {
      before(function () {
        taskCRUDServiceInstanceStub.getAllTaskForManager = sinon.stub().throws(new Error('Something went wrong'));
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
        uuidStub = sinon.stub(generateUUID, 'uuid').returns('c23624e9-e21d-4f19-8853-cfca73e7109a');
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
          },
          user: {
            sub: '111',
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
        taskControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Tasks'
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
        taskCRUDServiceInstanceStub.getAllTaskForManager = sinon.stub();
        uuidStub.restore();
      });
    });

    context('Check if correct params are passed for getting list of contacts for agent', function () {
      before(function () {
        taskCRUDServiceInstanceStub.getAllTaskForAgent = sinon.stub().throws(new Error('Something went wrong'));
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
        uuidStub = sinon.stub(generateUUID, 'uuid').returns('c23624e9-e21d-4f19-8853-cfca73e7109a');
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
          },
          user: {
            sub: '111',
            roles: ['agent'],
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
        taskControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Tasks'
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
        taskCRUDServiceInstanceStub.getAllTaskForAgent = sinon.stub();
        uuidStub.restore();
      });
    });
  });
});