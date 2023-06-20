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
  editProject: sinon.stub(),
};

const ProjectCRUDServiceStub = sinon
  .stub()
  .returns(projectCRUDServiceInstanceStub);

const validationServiceInstanceStub = {
  removeNullKeysInObj: sinon.stub(),
};

const ValidationServiceStub = sinon.stub().returns(validationServiceInstanceStub);

const projectSettingCrudServiceInstanceStub = {
  getStatusEnums: sinon.stub(),
  getPriorityEnums: sinon.stub(),
  editProjectSetting: sinon.stub(),
};

const ProjectSettingCrudServiceStub = sinon.stub().returns(projectSettingCrudServiceInstanceStub);

const projectUserCrudServiceInstanceStub = {
  deleteProjectUser: sinon.stub(),
  createProjectUser: sinon.stub(),
};

const ProjectUserCrudServiceStub = sinon.stub().returns(projectUserCrudServiceInstanceStub);

const projectTypeCRUDServiceInstanceStub = {};

const ProjectTypeCRUDServiceStub = sinon.stub().returns(projectTypeCRUDServiceInstanceStub);

let dateStub;

const projectSettingControllerModule = proxyquire(
  '../../../../../../controllers/v1/projects/setting/settingController', {
    '../../../../services/projects/types/typeService': ProjectTypeCRUDServiceStub,
    '../../../../services/projects/projectService': ProjectCRUDServiceStub,
    '../../../../services/projects/user/userService': ProjectUserCrudServiceStub,
    '../../../../services/helpers/validationService': ValidationServiceStub,
    '../../../../services/projects/setting/settingService': ProjectSettingCrudServiceStub,
  },
);

describe('#settingController - put', function () {
  beforeEach(function () {
    projectCRUDServiceInstanceStub.editProject = sinon.stub();
    validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
    projectSettingCrudServiceInstanceStub.getStatusEnums = sinon.stub();
    projectSettingCrudServiceInstanceStub.getPriorityEnums = sinon.stub();
    projectSettingCrudServiceInstanceStub.editProjectSetting = sinon.stub();
    projectUserCrudServiceInstanceStub.deleteProjectUser = sinon.stub();
    projectUserCrudServiceInstanceStub.createProjectUser = sinon.stub();
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
  })
  afterEach(function () {
    dateStub.restore();
    projectCRUDServiceInstanceStub.editProject = sinon.stub();
    validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
    projectSettingCrudServiceInstanceStub.getStatusEnums = sinon.stub();
    projectSettingCrudServiceInstanceStub.getPriorityEnums = sinon.stub();
    projectSettingCrudServiceInstanceStub.editProjectSetting = sinon.stub();
    projectUserCrudServiceInstanceStub.deleteProjectUser = sinon.stub();
    projectUserCrudServiceInstanceStub.createProjectUser = sinon.stub();
  })
  describe('Edit Project Settings', function () {
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
        projectSettingControllerModule.put(settingsConfig, req, res, next)
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
        projectSettingControllerModule.put(settingsConfig, req, res, next)
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
          },
        };

        // Act
        projectSettingControllerModule.put(settingsConfig, req, res, next)
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

    context('Check If ProjectSetting is invalid', function () {
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
            projectId: '01',
          },
          body: {
            projectSetting: '',
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
        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Body in PROJECT setting object not Found',
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

    context('Check If contact expiry of ProjectSetting is invalid', function () {
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
            projectId: '01',
          },
          body: {
            projectSetting: {
              contactExpiry: '45'
            },
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
        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Contact Expiry value is InCorrect',
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

    context('Check If status is invalid', function () {
      it('should return "400" with "Bad Request" error', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '90'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {},
          status: 'status',
          priority: 'priority',
        })

        projectSettingCrudServiceInstanceStub.getStatusEnums.returns(['Yet to Start', 'Active', 'On Hold', 'Completed'])

        // Act
        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Invalid value of status',
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

    context('Check If priority is invalid', function () {
      it('should return "400" with "Bad Request" error', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '90'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {},
          status: 'Yet to Start',
          priority: 'priority',
        })

        projectSettingCrudServiceInstanceStub.getStatusEnums.returns(['Yet to Start', 'Active', 'On Hold', 'Completed'])
        projectSettingCrudServiceInstanceStub.getPriorityEnums.returns(['High', 'Medium', 'Low']);

        // Act
        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Invalid value of priority',
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

    context('Check if correct params are passed for editing Project Setting', function () {
      it('Should update project settings successfully when no error occurs', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {
            'owner_main': [{
              id: '001',
              firstName: 'John',
              lastName: 'Timpson'
            }]
          },
          status: 'Yet to Start',
          priority: 'High',
          contactExpiry: '180',
        })

        projectSettingCrudServiceInstanceStub.getStatusEnums.returns(['Yet to Start', 'Active', 'On Hold', 'Completed'])
        projectSettingCrudServiceInstanceStub.getPriorityEnums.returns(['High', 'Medium', 'Low']);

        projectCRUDServiceInstanceStub.editProject.returns({
          id: "01"
        });

        projectSettingCrudServiceInstanceStub.editProjectSetting.returns({
          projectId: "01"
        });

        projectUserCrudServiceInstanceStub.deleteProjectUser.returns('Project Users Deleted Successfully');

        projectUserCrudServiceInstanceStub.createProjectUser.returns({
          id: '001',
          firstName: 'John',
          lastName: 'Timpson'
        });

        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {};
            expectedData.project = {
              id: "01"
            };
            expectedData.projectSetting = {
              projectId: "01"
            };
            expectedData.userCreatedArray = {
              'owner_main': [
                {
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }
              ]
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            const actualRemoveNullKeysInObjArgs = validationServiceInstanceStub.removeNullKeysInObj.getCall(0).args[0];
            const expectedRemoveNullKeysInObjArgs = {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
            const actualRemoveNullKeysInObjArgsLength = validationServiceInstanceStub.removeNullKeysInObj.getCall(0).args.length;
            const expectedRemoveNullKeysInObjArgsLength = [expectedRemoveNullKeysInObjArgs].length;
            
            expect(actualRemoveNullKeysInObjArgs).to.deep.equal(expectedRemoveNullKeysInObjArgs);
            expect(actualRemoveNullKeysInObjArgsLength).to.equal(expectedRemoveNullKeysInObjArgsLength);

            const actualGetStatusEnumsArgs = projectSettingCrudServiceInstanceStub.getStatusEnums.getCall(0).args;
            const expectedGetStatusEnumArgs = [];
            expect(actualGetStatusEnumsArgs).to.deep.equal(expectedGetStatusEnumArgs);
            expect(expectedGetStatusEnumArgs.length).to.equal(expectedGetStatusEnumArgs.length);

            const actualGetPriorityEnumArgs = projectSettingCrudServiceInstanceStub.getPriorityEnums.getCall(0).args;
            const expectedGetPriorityEnumsArgs = [];
            expect(actualGetPriorityEnumArgs).to.deep.equal(expectedGetPriorityEnumsArgs);
            expect(actualGetPriorityEnumArgs.length).to.equal(expectedGetPriorityEnumsArgs.length);

            const expectedInputs = {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }

            const actualEditProjectArgs = projectCRUDServiceInstanceStub.editProject.getCall(0).args[0];
            const actualEditProjectArgsLength = projectCRUDServiceInstanceStub.editProject.getCall(0).args.length;
            const expectedEditProjectArgsLength = [expectedInputs].length;
            expect(actualEditProjectArgs).to.deep.equal(actualEditProjectArgs);
            expect(actualEditProjectArgsLength).to.equal(expectedEditProjectArgsLength);

            const actualEditProjectSettingArgs = projectSettingCrudServiceInstanceStub.editProjectSetting.getCall(0).args[0];
            const actualEditProjectSettingArgsLength = projectSettingCrudServiceInstanceStub.editProjectSetting.getCall(0).args.length;
            const expectedEditProjectSettingArgsLength = [expectedInputs].length;
            expect(actualEditProjectSettingArgs).to.deep.equal(actualEditProjectSettingArgs);
            expect(actualEditProjectSettingArgsLength).to.equal(expectedEditProjectSettingArgsLength);

            const actualDeleteProjectUsersArgs = projectUserCrudServiceInstanceStub.deleteProjectUser.getCall(0).args[0];
            const actualDeleteProjectUsersArgsLength = projectUserCrudServiceInstanceStub.deleteProjectUser.getCall(0).args.length;
            const expectedDeleteProjectUsersArgsLength = [expectedInputs].length;
            expect(actualDeleteProjectUsersArgs).to.deep.equal(actualDeleteProjectUsersArgs);
            expect(actualDeleteProjectUsersArgsLength).to.equal(expectedDeleteProjectUsersArgsLength);

            const actualCreateProjectUserArgs = projectUserCrudServiceInstanceStub.createProjectUser.getCall(0).args[0];
            const actualCreateProjectUserArgsLength = projectUserCrudServiceInstanceStub.createProjectUser.getCall(0).args.length;
            const expectedCreateProjectUserArgs = expectedInputs.users['owner_main'][0];
            expectedCreateProjectUserArgs.createdAt = new Date(Date.now());
            expectedCreateProjectUserArgs.createdBy = '111';
            expectedCreateProjectUserArgs.projectUserId = '001';
            expectedCreateProjectUserArgs.userLevel = 'owner_main'; 
            expectedCreateProjectUserArgs.projectId = '01';
            expectedCreateProjectUserArgs.userRoles = ["manager"];
            const expectedCreateProjectUserArgsLength = [actualCreateProjectUserArgs].length;
            expect(actualCreateProjectUserArgs).to.deep.equal(expectedCreateProjectUserArgs);
            expect(actualCreateProjectUserArgsLength).to.equal(expectedCreateProjectUserArgsLength);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Check If correct params are passed for editing Project Setting', function () {
      it('Should return `500` when something internally fails while removing null keys from an object', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.throws(new Error('Something went wrong'));

        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Update PROJECT Setting'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return `500` when something internally fails while getting status enums', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {
            'owner_main': [{
              id: '001',
              firstName: 'John',
              lastName: 'Timpson'
            }]
          },
          status: 'Yet to Start',
          priority: 'High',
          contactExpiry: '180',
        })
        projectSettingCrudServiceInstanceStub.getStatusEnums.throws(new Error('Something went wrong'));

        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Update PROJECT Setting'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return `500` when something internally fails while getting priority enums', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {
            'owner_main': [{
              id: '001',
              firstName: 'John',
              lastName: 'Timpson'
            }]
          },
          status: 'Yet to Start',
          priority: 'High',
          contactExpiry: '180',
        })
        projectSettingCrudServiceInstanceStub.getStatusEnums.returns(['Yet to Start', 'Active', 'On Hold', 'Completed'])
        projectSettingCrudServiceInstanceStub.getPriorityEnums.throws(new Error('Something went wrong'));

        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Update PROJECT Setting'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return `500` when something internally fails while editing Project info', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {
            'owner_main': [{
              id: '001',
              firstName: 'John',
              lastName: 'Timpson'
            }]
          },
          status: 'Yet to Start',
          priority: 'High',
          contactExpiry: '180',
        })
        projectSettingCrudServiceInstanceStub.getStatusEnums.returns(['Yet to Start', 'Active', 'On Hold', 'Completed'])
        projectSettingCrudServiceInstanceStub.getPriorityEnums.returns(['High', 'Medium', 'Low']);

        projectCRUDServiceInstanceStub.editProject.throws(new Error('Something went wrong'));

        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Update PROJECT Setting'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return `500` when something internally fails while editing Project setting info', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {
            'owner_main': [{
              id: '001',
              firstName: 'John',
              lastName: 'Timpson'
            }]
          },
          status: 'Yet to Start',
          priority: 'High',
          contactExpiry: '180',
        })
        projectSettingCrudServiceInstanceStub.getStatusEnums.returns(['Yet to Start', 'Active', 'On Hold', 'Completed'])
        projectSettingCrudServiceInstanceStub.getPriorityEnums.returns(['High', 'Medium', 'Low']);

        projectCRUDServiceInstanceStub.editProject.returns({
          id: "01"
        });

        projectSettingCrudServiceInstanceStub.editProjectSetting.throws(new Error('Something went wrong'));

        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Update PROJECT Setting'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return `500` when something internally fails while deleting Project users', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {
            'owner_main': [{
              id: '001',
              firstName: 'John',
              lastName: 'Timpson'
            }]
          },
          status: 'Yet to Start',
          priority: 'High',
          contactExpiry: '180',
        })
        projectSettingCrudServiceInstanceStub.getStatusEnums.returns(['Yet to Start', 'Active', 'On Hold', 'Completed'])
        projectSettingCrudServiceInstanceStub.getPriorityEnums.returns(['High', 'Medium', 'Low']);

        projectCRUDServiceInstanceStub.editProject.returns({
          id: "01"
        });

        projectSettingCrudServiceInstanceStub.editProjectSetting.returns({
          projectId: "01"
        });

        projectUserCrudServiceInstanceStub.deleteProjectUser.throws(new Error('Something went wrong'));

        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Update PROJECT Setting'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return `500` when something internally fails while creating Project users', function (done) {
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
          body: {
            projectSetting: {
              description: '',
              name: 'name',
              projectTypeId: '01',
              receivedDate: new Date(Date.now()),
              dueDate: new Date(Date.now()),
              clientId: '01',
              target: {
                contact: '10',
                account: '1'
              },
              contactsPerAccount: '10',
              clientPoc: 'poc',
              templateId: '01',
              users: {
                'owner_main': [{
                  id: '001',
                  firstName: 'John',
                  lastName: 'Timpson'
                }]
              },
              status: 'Yet to Start',
              priority: 'High',
              contactExpiry: '180'
            }
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          name: 'name',
          projectTypeId: '01',
          receivedDate: new Date(Date.now()),
          dueDate: new Date(Date.now()),
          clientId: '01',
          target: {
            contact: '10',
            account: '1'
          },
          contactsPerAccount: '10',
          clientPoc: 'poc',
          templateId: '01',
          users: {
            'owner_main': [{
              id: '001',
              firstName: 'John',
              lastName: 'Timpson'
            }]
          },
          status: 'Yet to Start',
          priority: 'High',
          contactExpiry: '180',
        })
        projectSettingCrudServiceInstanceStub.getStatusEnums.returns(['Yet to Start', 'Active', 'On Hold', 'Completed'])
        projectSettingCrudServiceInstanceStub.getPriorityEnums.returns(['High', 'Medium', 'Low']);

        projectCRUDServiceInstanceStub.editProject.returns({
          id: "01"
        });

        projectSettingCrudServiceInstanceStub.editProjectSetting.returns({
          projectId: "01"
        });

        projectUserCrudServiceInstanceStub.deleteProjectUser.returns('Project Users Deleted Successfully');

        projectUserCrudServiceInstanceStub.createProjectUser.throws(new Error('Something went wrong'));

        projectSettingControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Update PROJECT Setting'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    })
  });
});