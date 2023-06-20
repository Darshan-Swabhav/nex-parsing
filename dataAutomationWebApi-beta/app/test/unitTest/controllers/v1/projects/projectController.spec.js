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

const projectCRUDServiceInstanceStub = {
  checkUserPermission: sinon.stub(),
  deleteProject: sinon.stub(),
  getAllProjectWithSettings: sinon.stub(),
};

const ProjectCRUDServiceStub = sinon
  .stub()
  .returns(projectCRUDServiceInstanceStub);


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

const validationServiceInstanceStub = {};

const ValidationServiceStub = sinon.stub().returns(validationServiceInstanceStub);

const projectSettingCrudServiceInstanceStub = {};

const ProjectSettingCrudServiceStub = sinon.stub().returns(projectSettingCrudServiceInstanceStub);

const projectUserCrudServiceInstanceStub = {};

const ProjectUserCrudServiceStub = sinon.stub().returns(projectUserCrudServiceInstanceStub);

const projectControllerModule = proxyquire(
  '../../../../../controllers/v1/projects/projectController', {
    '../../../services/projects/projectService': ProjectCRUDServiceStub,
    '../../../services/helpers/paginationService': PaginationServiceStub,
    '../../../services/projects/user/userService': ProjectUserCrudServiceStub,
    '../../../services/helpers/validationService': ValidationServiceStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler': FilterHandlerStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler': SortHandlerStub,
    '../../../services/projects/setting/settingService': ProjectSettingCrudServiceStub,
  },
);

describe('#projectController - delete', function () {
  describe('Delete Project', function () {
    context('Check If User is Unauthorized', function () {
      it('Should return `401` with `Unauthorized` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: ''
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

        //Act
        projectControllerModule.delete(settingsConfig, req, res, next)
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
            sub: '111',
            roles: ['agent']
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
        projectControllerModule.delete(settingsConfig, req, res, next)
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
    });

    context('Check If ProjectId is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
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
            id: ''
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
        projectControllerModule.delete(settingsConfig, req, res, next)
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

    context('Check If ProjectName is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
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
            id: '01',
          },
          query: {
            projectName: '',
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
        projectControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectName is required'
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

    context('Check if user has permissions to delete project', function () {
      before(function () {
        projectCRUDServiceInstanceStub.checkUserPermission = sinon.stub().returns(false);
      });
      it('Should return `403` with NO_PROJECT_DELETE_PERMISSION error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            projectName: 'test'
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            id: '01'
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
        projectControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'NO_PROJECT_DELETE_PERMISSION',
              desc: 'Could Not Delete PROJECT',
            };

            const expectedCheckUserPermission = {};
            expectedCheckUserPermission.projectId = '01';
            expectedCheckUserPermission.userId = '111';
            expectedCheckUserPermission.projectName = 'test';
            expectedCheckUserPermission.operation = 'DELETE';

            const actualCheckUserPermissionFirstArg = projectCRUDServiceInstanceStub.checkUserPermission.getCall(0).args[0];

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualCheckUserPermissionFirstArg).to.deep.equal(expectedCheckUserPermission, 'Expected value not pass in check user permission function');
            expect(Object.keys(actualCheckUserPermissionFirstArg).length).to.deep.equal(Object.keys(expectedCheckUserPermission).length, 'Expected value not pass in check user permission function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        projectCRUDServiceInstanceStub.checkUserPermission = sinon.stub();
      });
    });

    context('Check if user has permission to delete a project', function () {
      before(function () {
        projectCRUDServiceInstanceStub.checkUserPermission = sinon.stub().returns(true);
        projectCRUDServiceInstanceStub.deleteProject = sinon.stub().returns({
          projectId: '01'
        });
      });
      it('Should return `200` when project is deleted successfully', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            projectName: 'test'
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            id: '01'
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
        projectControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              project: {
                projectId: '01',
              },
            };

            const expectedDeleteProject = {};
            expectedDeleteProject.projectId = '01';
            expectedDeleteProject.userId = '111';
            expectedDeleteProject.projectName = 'test';
            expectedDeleteProject.operation = 'DELETE';

            const actualDeleteProjectFirstArg = projectCRUDServiceInstanceStub.deleteProject.getCall(0).args[0];

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualDeleteProjectFirstArg).to.deep.equal(expectedDeleteProject, 'Expected value not pass in check user permission function');
            expect(Object.keys(actualDeleteProjectFirstArg).length).to.deep.equal(Object.keys(expectedDeleteProject).length, 'Expected value not pass in check user permission function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        projectCRUDServiceInstanceStub.checkUserPermission = sinon.stub();
        projectCRUDServiceInstanceStub.deleteProject = sinon.stub();
      });
    })

    context('Check if correct params are passed for deleting a project', function () {
      before(function () {
        projectCRUDServiceInstanceStub.checkUserPermission = sinon.stub().throws(new Error('Something went wrong'));
      });
      it('Should return `500` when project deletion fails while checking user permission', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            projectName: 'test'
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            id: '01'
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
        projectControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Delete PROJECT'
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
        projectCRUDServiceInstanceStub.checkUserPermission = sinon.stub();
      });
    })

    context('Check if correct params are passed for deleting a project', function () {
      before(function () {
        projectCRUDServiceInstanceStub.checkUserPermission = sinon.stub().returns(true);
        projectCRUDServiceInstanceStub.deleteProject = sinon.stub().throws(new Error('Something went wrong'));
      });
      it('Should return `500` when project deletion fails', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            projectName: 'test'
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            id: '01'
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
        projectControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Delete PROJECT'
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
        projectCRUDServiceInstanceStub.checkUserPermission = sinon.stub();
        projectCRUDServiceInstanceStub.deleteProject = sinon.stub();
      });
    })
  });
});

describe('#projectController - get', function () {
  describe('Get all projects', function () {
    context('Check If User is Unauthorized', function () {
      it('Should return `401` with `Unauthorized` error', function (done) {
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
            projectId: ''
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

        //Act
        projectControllerModule
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
            sub: '111',
            roles: ['agent']
          },
          params: {
            projectId: ''
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
        projectControllerModule
          .get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'Forbidden Error',
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

    context('Check If filter is invalid', function () {
      before(function () {
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: '',
          offset: ''
        });
      });
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager']
          },
          query: {
            attributes: [],
            filter: 'filter'
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
          }
        };

        // Act
        projectControllerModule
          .get(settingsConfig, req, res, next)
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
            console.log(err);
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
          offset: ''
        });
        filterHandlerInstanceStub.validate = sinon
          .stub()
          .throws(new Error('Value of filter is not correct'));
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
            attributes: []
          },
          user: {
            sub: '111',
            roles: ['manager']
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
          }
        };
        projectControllerModule
          .get(settingsConfig, req, res, next)
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
          offset: ''
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
            attributes: []
          },
          user: {
            sub: '111',
            roles: ['manager']
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
          }
        };

        // Act
        projectControllerModule
          .get(settingsConfig, req, res, next)
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
          offset: ''
        });
        sortHandlerInstanceStub.validate = sinon
          .stub()
          .throws(new Error('Value of sort is not correct'));
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
            attributes: []
          },
          user: {
            sub: '111',
            roles: ['manager']
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
          }
        };
        projectControllerModule
          .get(settingsConfig, req, res, next)
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

    context(
      'Check if correct params are passed for getting list of contacts',
      function () {
        before(function () {
          const projectRes = {
            totalCount: 0,
            docs: []
          };
          projectCRUDServiceInstanceStub.getAllProjectWithSettings = sinon
            .stub()
            .returns(projectRes);
          paginationServiceInstanceStub.paginate = sinon.stub().returns({
            limit: 0,
            offset: 0
          });
        });
        it('Should return `200` with projects list', function (done) {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            query: {
              filter: '{}',
              sort: '{}',
              attributes: []
            },
            user: {
              sub: '111',
              roles: ['manager']
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
            }
          };
          projectControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const filterColumns = {
                dueDate: {
                  type: 'array',
                  operator: ['between']
                },
                updatedAt: {
                  type: 'array',
                  operator: ['between']
                },
                status: {
                  type: 'string',
                  operator: ['=']
                },
                client: {
                  type: 'string',
                  operator: ['=']
                },
                project: {
                  type: 'string',
                  operator: ['=']
                },
                aliasName: {
                  type: 'string',
                  operator: ['=']
                },
              };
              const sortableColumns = ['dueDate', 'client'];
              const multipleSort = false;
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
                filter
              };

              const expectedSortValidateArgs = {
                sortableColumns,
                sort,
                multipleSort
              };

              const inputs = {
                userId: req.user.sub,
                limit: 0,
                offset: 0,
                searchColumn: null,
                searchValue: null,
                userRoles: [
                  "manager"
                ],
              };

              const expectedGetAllProjectsWithSettingsListArgs = {
                inputs,
                filter,
                sort
              };

              const actualFilterValidateFirstArg =
                filterHandlerInstanceStub.validate.getCall(0).args[0];
              const actualFilterValidateSecondArg =
                filterHandlerInstanceStub.validate.getCall(0).args[1];
              const actualFilterValidateArgsLength =
                filterHandlerInstanceStub.validate.getCall(0).args.length;

              const actualSortValidateFirstArg =
                sortHandlerInstanceStub.validate.getCall(0).args[0];
              const actualSortValidateSecondArg =
                sortHandlerInstanceStub.validate.getCall(0).args[1];
              const actualSortValidateThirdArg =
                sortHandlerInstanceStub.validate.getCall(0).args[2];
              const actualSortValidateArgsLength =
                sortHandlerInstanceStub.validate.getCall(0).args.length;

              const actualGetAllProjectsWithSettingsFirstArgs =
                projectCRUDServiceInstanceStub.getAllProjectWithSettings.getCall(0).args[0];
              const actualGetAllProjectsWithSettingsSecondArgs =
                projectCRUDServiceInstanceStub.getAllProjectWithSettings.getCall(0).args[1];
              const actualGetAllProjectsWithSettingsThirdArgs =
                projectCRUDServiceInstanceStub.getAllProjectWithSettings.getCall(0).args[2];
              const actualGetAllProjectsWithSettingsArgsLength =
                projectCRUDServiceInstanceStub.getAllProjectWithSettings.getCall(0).args
                .length;

              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);

              expect(actualFilterValidateFirstArg).to.deep.equal(
                expectedFilterValidateArgs.filterColumns,
                'Expected value not pass in filter validate function'
              );
              expect(actualFilterValidateSecondArg).to.deep.equal(
                expectedFilterValidateArgs.filter,
                'Expected value not pass in filter validate function'
              );
              expect(actualFilterValidateArgsLength).to.deep.equal(
                Object.keys(expectedFilterValidateArgs).length,
                'Expected value not pass in filter validate function'
              );

              expect(actualSortValidateFirstArg).to.deep.equal(
                expectedSortValidateArgs.sortableColumns,
                'Expected value not pass in sort validate function'
              );
              expect(actualSortValidateSecondArg).to.deep.equal(
                expectedSortValidateArgs.sort,
                'Expected value not pass in sort validate function'
              );
              expect(actualSortValidateThirdArg).to.deep.equal(
                expectedSortValidateArgs.multipleSort,
                'Expected value not pass in sort validate function'
              );
              expect(actualSortValidateArgsLength).to.deep.equal(
                Object.keys(expectedSortValidateArgs).length,
                'Expected value not pass in sort validate function'
              );

              expect(actualGetAllProjectsWithSettingsFirstArgs).to.deep.equal(
                expectedGetAllProjectsWithSettingsListArgs.inputs,
                'Expected value not pass in get all project with settings function'
              );
              expect(actualGetAllProjectsWithSettingsSecondArgs).to.deep.equal(
                expectedGetAllProjectsWithSettingsListArgs.filter,
                'Expected value not pass in get all project with settings function'
              );
              expect(actualGetAllProjectsWithSettingsThirdArgs).to.deep.equal(
                expectedGetAllProjectsWithSettingsListArgs.filter,
                'Expected value not pass in get all project with settings function'
              );
              expect(actualGetAllProjectsWithSettingsArgsLength).to.deep.equal(
                Object.keys(expectedGetAllProjectsWithSettingsListArgs).length,
                'Expected value not pass in get all project with settings function'
              );

              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
        after(function () {
          projectCRUDServiceInstanceStub.getAllProjectWithSettings = sinon.stub();
          paginationServiceInstanceStub.paginate = sinon.stub();
        });
      }
    );

    context(
      'Check if correct params are passed for getting list of contacts',
      function () {
        before(function () {
          paginationServiceInstanceStub.paginate = sinon.stub().returns({
            limit: 0,
            offset: 0
          });
          projectCRUDServiceInstanceStub.getAllProjectWithSettings = sinon
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
              filter: '{}',
              sort: '{}',
              attributes: []
            },
            user: {
              sub: '111',
              roles: ['manager']
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
            }
          };
          projectControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualStatusCode = result.statusCode;
              const actualData = result.data;
              const expectedStatusCode = 500;
              const expectedData = {
                err: 'Something went wrong',
                desc: 'Could Not Get PROJECTs'
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
          projectCRUDServiceInstanceStub.getAllProjectWithSettings = sinon.stub();
        });
      }
    );
  })
})