const {
  expect
} = require('chai');
const sinon = require('sinon');
const {
  inspect
} = require('util');
const proxyquire = require('proxyquire');
const {
  User,
  JobError,
  Job,
  Contact,
  Account,
  FileChunk,
  File,
  ProjectSetting,
  Client,
  ProjectSpec,
  Task,
  TaskAllocationTemp,
  ProjectUser,
  Project,
  Sequelize,
  sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');

const {
  Op
} = Sequelize;

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const filterHandlerInstanceStub = {
  validate: sinon.stub(),
  buildWhereClause: sinon.stub(),
};

const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);

const sortHandlerInstanceStub = {
  validate: sinon.stub(),
  buildOrderClause: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const fileCRUDServiceInstanceStub = {
  deleteAllFilesOfAProject: sinon.stub(),
};

const FileCRUDServiceStub = sinon.stub().returns(fileCRUDServiceInstanceStub);

const ProjectService = proxyquire('../../../../services/projects/projectService', {
  '../../config/settings/settings-config': settingsConfig,
  './files/fileService': FileCRUDServiceStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler': FilterHandlerStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler': SortHandlerStub,
});
const projectService = new ProjectService();
let deleteProjectJobError, deleteProjectJob, deleteProjectContact, deleteProjectAccount, deleteProjectFileChunk, deleteProjectFile, deleteProjectSetting, deleteProjectSpec, deleteProjectTask, deleteProjectTaskAllocationTemp, deleteProject, projectUserAvailable, projectAvailable, projectUpdate, dateStub, projectFindAll, projectCount;

//[To-Do] :: transaction to add into query
// describe('#projectService - deleteProject', function () {
//   beforeEach(function () {
//     deleteProjectJobError  = sinon.stub(JobError, 'deleteProjectJobError');
//     deleteProjectJob  = sinon.stub(Job, 'deleteProjectJob');
//     deleteProjectContact  = sinon.stub(Contact, 'deleteProjectContact');
//     deleteProjectAccount  = sinon.stub(Account, 'deleteProjectAccount');
//     deleteProjectFileChunk  = sinon.stub(FileChunk, 'deleteProjectFileChunk');
//     deleteProjectFile  = sinon.stub(File, 'deleteProjectFile');
//     deleteProjectSetting  = sinon.stub(ProjectSetting, 'deleteProjectSetting');
//     deleteProjectSpec  = sinon.stub(ProjectSpec, 'deleteProjectSpec');
//     deleteProjectTask  = sinon.stub(Task, 'deleteProjectTask');
//     deleteProjectTaskAllocationTemp  = sinon.stub(TaskAllocationTemp, 'deleteProjectTaskAllocationTemp');
//     deleteProject  = sinon.stub(Project, 'deleteProject');
//   });
//   afterEach(function () {
//     deleteProjectJobError.restore();
//     deleteProjectJob.restore();
//     deleteProjectContact.restore();
//     deleteProjectAccount.restore();
//     deleteProjectFileChunk.restore();
//     deleteProjectFile.restore();
//     deleteProjectSetting.restore();
//     deleteProjectSpec.restore();
//     deleteProjectTask.restore();
//     deleteProjectTaskAllocationTemp.restore();
//     deleteProject.restore();
//   });
//   describe('Delete Project', function () {
//     context('Delete all files from gcp as well all data of that project', function () {
//       it('Should delete project when correct params are passed', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectJobError.returns('01');
//         deleteProjectJob.returns('01');
//         deleteProjectContact.returns('01');
//         deleteProjectAccount.returns('01');
//         deleteProjectFileChunk.returns('01');
//         deleteProjectFile.returns('01');
//         deleteProjectSetting.returns('01');
//         deleteProjectSpec.returns('01');
//         deleteProjectTask.returns('01');
//         deleteProjectTaskAllocationTemp.returns('01');
//         deleteProject.returns('01');
//         fileCRUDServiceInstanceStub.deleteAllFilesOfAProject = sinon.stub().returns('01');

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const actualData = result;
//             const expectedData = {
//               jobError: '01',
//               job: '01',
//               contact: '01',
//               account: '01',
//               fileChunk: '01',
//               file: '01',
//               projectSetting: '01',
//               projectSpec: '01',
//               projectTask: '01',
//               projectTaskAllocationTemp: '01',
//               project: '01',
//               gcpFiles: '01',
//             };

//             expect(actualData).to.deep.equal(expectedData);

//             const actualDeleteAllFilesOfAProjectArgs = fileCRUDServiceInstanceStub.deleteAllFilesOfAProject.getCall(0).args;
//             const expectedDeleteAllFilesOfAProjectArgs = [inputs];
//             expect(actualDeleteAllFilesOfAProjectArgs).to.deep.equal(expectedDeleteAllFilesOfAProjectArgs);
//             expect(actualDeleteAllFilesOfAProjectArgs.length).to.equal(expectedDeleteAllFilesOfAProjectArgs.length);

//             const actualDeleteProjectJobErrorArgs = deleteProjectJobError.getCall(0).args;
//             const expectedDeleteProjectJobErrorArgs = [inputs.projectId];
//             expect(actualDeleteProjectJobErrorArgs).to.deep.equal(expectedDeleteProjectJobErrorArgs);
//             expect(actualDeleteProjectJobErrorArgs.length).to.equal(expectedDeleteProjectJobErrorArgs.length);

//             const actualDeleteProjectJobArgs = deleteProjectJob.getCall(0).args;
//             const expectedDeleteProjectJobArgs = [inputs.projectId];
//             expect(actualDeleteProjectJobArgs).to.deep.equal(expectedDeleteProjectJobArgs);
//             expect(actualDeleteProjectJobArgs.length).to.equal(expectedDeleteProjectJobArgs.length);

//             const actualDeleteProjectContactArgs = deleteProjectContact.getCall(0).args;
//             const expectedDeleteProjectContactArgs = [inputs.projectId];
//             expect(actualDeleteProjectContactArgs).to.deep.equal(expectedDeleteProjectContactArgs);
//             expect(actualDeleteProjectContactArgs.length).to.equal(expectedDeleteProjectContactArgs.length);

//             const actualDeleteProjectAccountArgs = deleteProjectAccount.getCall(0).args;
//             const expectedDeleteProjectAccountArgs = [inputs.projectId];
//             expect(actualDeleteProjectAccountArgs).to.deep.equal(expectedDeleteProjectAccountArgs);
//             expect(actualDeleteProjectAccountArgs.length).to.equal(expectedDeleteProjectAccountArgs.length);

//             const actualDeleteProjectFileChunkArgs = deleteProjectFileChunk.getCall(0).args;
//             const expectedDeleteProjectFileChunkArgs = [inputs.projectId];
//             expect(actualDeleteProjectFileChunkArgs).to.deep.equal(expectedDeleteProjectFileChunkArgs);
//             expect(actualDeleteProjectFileChunkArgs.length).to.equal(expectedDeleteProjectFileChunkArgs.length);

//             const actualDeleteProjectFileArgs = deleteProjectFile.getCall(0).args;
//             const expectedDeleteProjectFileArgs = [inputs.projectId];
//             expect(actualDeleteProjectFileArgs).to.deep.equal(expectedDeleteProjectFileArgs);
//             expect(actualDeleteProjectFileArgs.length).to.equal(expectedDeleteProjectFileArgs.length);

//             const actualDeleteProjectSettingArgs = deleteProjectSetting.getCall(0).args;
//             const expectedDeleteProjectSettingArgs = [inputs.projectId];
//             expect(actualDeleteProjectSettingArgs).to.deep.equal(expectedDeleteProjectSettingArgs);
//             expect(actualDeleteProjectSettingArgs.length).to.equal(expectedDeleteProjectSettingArgs.length);

//             const actualDeleteProjectSpecArgs = deleteProjectSpec.getCall(0).args;
//             const expectedDeleteProjectSpecArgs = [inputs.projectId];
//             expect(actualDeleteProjectSpecArgs).to.deep.equal(expectedDeleteProjectSpecArgs);
//             expect(actualDeleteProjectSpecArgs.length).to.equal(expectedDeleteProjectSpecArgs.length);

//             const actualDeleteProjectTaskArgs = deleteProjectTask.getCall(0).args;
//             const expectedDeleteProjectTaskArgs = [inputs.projectId];
//             expect(actualDeleteProjectTaskArgs).to.deep.equal(expectedDeleteProjectTaskArgs);
//             expect(actualDeleteProjectTaskArgs.length).to.equal(expectedDeleteProjectTaskArgs.length);

//             const actualDeleteProjectTaskAllocationTempArgs = deleteProjectTaskAllocationTemp.getCall(0).args;
//             const expectedDeleteProjectTaskAllocationTempArgs = [inputs.projectId];
//             expect(actualDeleteProjectTaskAllocationTempArgs).to.deep.equal(expectedDeleteProjectTaskAllocationTempArgs);
//             expect(actualDeleteProjectTaskAllocationTempArgs.length).to.equal(expectedDeleteProjectTaskAllocationTempArgs.length);

//             const actualDeleteProjectArgs = deleteProject.getCall(0).args;
//             const expectedDeleteProjectArgs = [inputs.projectId];
//             expect(actualDeleteProjectArgs).to.deep.equal(expectedDeleteProjectArgs);
//             expect(actualDeleteProjectArgs.length).to.equal(expectedDeleteProjectArgs.length);

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });

//     context('Error while deleting project data', function () {
//       it('Should throw error when it fails internally while deleting project files', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         fileCRUDServiceInstanceStub.deleteAllFilesOfAProject = sinon.stub().throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project job error data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectJobError.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project job data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectJob.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project contacts data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectContact.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project accounts data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectAccount.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project file chunks data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectFileChunk.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project file data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectFile.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project setting data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectSetting.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project specs data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectSpec.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project tasks data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectTask.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project task allocation temp data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProjectTaskAllocationTemp.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when it fails internally while deleting project data', function (done) {
//         //Arrange
//         const inputs = {};
//         inputs.projectId = '01';
//         inputs.userId = '111';
//         inputs.projectName = 'test';
//         inputs.operation = 'DELETE';

//         deleteProject.throws(new Error('Something went wrong'));

//         // Act
//         projectService.deleteProject(inputs)
//           .then(function (result) {
//             // Assert
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });
//   });
// });

describe('#projectService - checkUserPermission', function () {
  beforeEach(function () {
    projectUserAvailable = sinon.stub(ProjectUser, 'findOne');
    projectAvailable = sinon.stub(Project, 'findOne');
  });
  afterEach(function () {
    projectUserAvailable.restore();
    projectAvailable.restore();
  })
  describe('Check permission availablility', function(){
    context('Check permission for an user for deleting project', function (){
      it ('Should return no permission available When the operation "DELETE" is not passed', function(done){
        const inputs = {};
        inputs.projectId = '01';
        inputs.userId = '111';
        inputs.projectName = 'test';
        projectService.checkUserPermission(inputs)
        .then(function (result) {
          const actualValue = result;
          const expectedValue = false;
          expect(actualValue).to.equal(expectedValue);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it ('Should return no permission available When no project user is available', function(done){
        const inputs = {};
        inputs.projectId = '01';
        inputs.userId = '111';
        inputs.projectName = 'test';
        inputs.operation = 'DELETE';
        projectUserAvailable.returns(null);
        projectAvailable.returns({
          id: "01",
        });
        projectService.checkUserPermission(inputs)
        .then(function (result) {
          const actualValue = result;
          const expectedValue = false;
          expect(actualValue).to.equal(expectedValue);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it ('Should return no permission available When no project is available', function(done){
        const inputs = {};
        inputs.projectId = '01';
        inputs.userId = '111';
        inputs.projectName = 'test';
        inputs.operation = 'DELETE';
        projectUserAvailable.returns({
          id: '01'
        });
        projectAvailable.returns(null);
        projectService.checkUserPermission(inputs)
        .then(function (result) {
          const actualValue = result;
          const expectedValue = false;
          expect(actualValue).to.equal(expectedValue);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it ('Should return permission available When both project and user at level "owner_main" for that project are available', function(done){
        const inputs = {};
        inputs.projectId = '01';
        inputs.userId = '111';
        inputs.projectName = 'test';
        inputs.operation = 'DELETE';
        projectUserAvailable.returns({
          id: '01'
        });
        projectAvailable.returns({
          id: "01",
        });
        projectService.checkUserPermission(inputs)
        .then(function (result) {
          const actualValue = result;
          const expectedValue = true;
          expect(actualValue).to.equal(expectedValue);

          const expectedProjectUserAvailableArgs = {
            where: {
              [Op.and]: [
                {
                  ProjectId: inputs.projectId,
                },
                {
                  UserId: inputs.userId,
                },
                {
                  userLevel: 'owner_main',
                },
              ],
            },
          }

          const expectedProjectUserAvailableArgsLength = [expectedProjectUserAvailableArgs].length;

          const actualProjectUserAvailableArgs = projectUserAvailable.getCall(0).args[0];
          const actualProjectUserAvailableArgsLength = projectUserAvailable.getCall(0).args.length;

          expect(inspect(actualProjectUserAvailableArgs, { depth: null })).to.deep.equal(inspect(expectedProjectUserAvailableArgs, { depth: null}), 'Expected value not passed in project user find one function');
          expect(actualProjectUserAvailableArgsLength).to.equal(expectedProjectUserAvailableArgsLength);

          const expectedProjectAvailableArgs = {
            where: {
              [Op.and]: [
                {
                  id: inputs.projectId,
                },
                {
                  name: inputs.projectName,
                },
              ],
            },
          }

          const expectedProjectAvailableArgsLength = [expectedProjectAvailableArgs].length;

          const actualProjectAvailableArgs = projectAvailable.getCall(0).args[0];
          const actualProjectAvailableArgsLength = projectAvailable.getCall(0).args.length;

          expect(inspect(actualProjectAvailableArgs, { depth: null })).to.deep.equal(inspect(expectedProjectAvailableArgs, { depth: null}), 'Expected value not passed in project find one function');
          expect(actualProjectAvailableArgsLength).to.equal(expectedProjectAvailableArgsLength);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it('Should throw error when something internally fails while getting project user', function (done) {
        const inputs = {};
        inputs.projectId = '01';
        inputs.userId = '111';
        inputs.projectName = 'test';
        inputs.operation = 'DELETE';
        projectUserAvailable.throws(new Error('Something went wrong'));
        projectService.checkUserPermission(inputs)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting project', function (done) {
        const inputs = {};
        inputs.projectId = '01';
        inputs.userId = '111';
        inputs.projectName = 'test';
        inputs.operation = 'DELETE';
        projectAvailable.throws(new Error('Something went wrong'));
        projectService.checkUserPermission(inputs)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#projectService - editProject', function () {
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
    projectUpdate = sinon.stub(Project, 'update');
  });
  afterEach(function () {
    projectUpdate.restore();
    dateStub.restore();
  })
  describe('Update project info', function () {
    context('Modify project info', function () {
      it ('Should correctly update project info when correct params are passed', function (done) {
        const inputs = {};
        inputs.projectId = '01';
        inputs.name = 'project';
        inputs.aliasName = 'alias project';
        inputs.receivedDate = new Date(Date.now());
        inputs.description = '';
        inputs.dueDate = new Date(Date.now());
        inputs.updatedAt = new Date(Date.now());
        inputs.clientId = '001';
        inputs.projectTypeId = '01';
        inputs.templateId = '01';
        inputs.updatedBy = '001';
        inputs.contactExpiry = '30';
        inputs.userRoles = ['manager'];

        projectUpdate.returns('Project Updated Successfully');

        projectService.editProject(inputs)
        .then(function (result) {
          const actual = result;
          const expected = 'Project Updated Successfully';
          expect(actual).to.equal(expected);

          const expectedProjectUpdateArgs = {
            inputObj: {
              receivedDate: inputs.receivedDate,
              dueDate: inputs.dueDate,
              updatedAt: inputs.updatedAt,
              description: inputs.description,
              ClientId: inputs.clientId,
              ProjectTypeId: inputs.projectTypeId,
              TemplateId: inputs.templateId,
              updatedBy: inputs.updatedBy,
              contactExpiry: inputs.contactExpiry,
            },
            whereObj: {
              where: {
                id: inputs.projectId,
              },
            }
          };
          const actualProjectUpdateFirstArgs = projectUpdate.getCall(0).args[0];
          const actualProjectUpdateSecondArgs = projectUpdate.getCall(0).args[1];
          const actualProjectUpdateArgsLength = projectUpdate.getCall(0).args.length;
          expect(inspect(actualProjectUpdateFirstArgs, { depth: null })).to.deep.equal(inspect(expectedProjectUpdateArgs.inputObj, { depth: null}), 'Expected value not passed in project update function');
          expect(inspect(actualProjectUpdateSecondArgs, { depth: null })).to.deep.equal(inspect(expectedProjectUpdateArgs.whereObj, { depth: null}), 'Expected value not passed in project update function');
          expect(actualProjectUpdateArgsLength).to.equal(Object.keys(expectedProjectUpdateArgs).length, 'Expected value not passed in project update function');
          done();
        })
        .catch(function(err) {
          done(err)
        });
      })

      it('Should throw error when something internally fails while updating project info', function (done) {
        const inputs = {};
        inputs.projectId = '01';
        inputs.name = 'project';
        inputs.aliasName = 'alias project';
        inputs.receivedDate = new Date(Date.now());
        inputs.description = '';
        inputs.dueDate = new Date(Date.now());
        inputs.updatedAt = new Date(Date.now());
        inputs.clientId = '001';
        inputs.projectTypeId = '01';
        inputs.templateId = '01';
        inputs.updatedBy = '001';
        inputs.contactExpiry = '30';
        inputs.userRoles = ['manager'];

        projectUpdate.throws(new Error('Something went wrong'));

        projectService.editProject(inputs)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    })
  });
});

describe('#projectService - getAllProjectWithSettings', function (){
  beforeEach(function () {
    projectFindAll = sinon.stub(Project, 'findAll');
    projectCount = sinon.stub(Project, 'count');
    const contactFindAllWhere = {};
    contactFindAllWhere['$Users.id$'] = '01';
    filterHandlerInstanceStub.buildWhereClause = sinon
      .stub()
      .returns(contactFindAllWhere);
    sortHandlerInstanceStub.buildOrderClause = sinon.stub().returns([]);
  });
  afterEach(function () {
    projectFindAll.restore();
    projectCount.restore();
    filterHandlerInstanceStub.buildWhereClause = sinon.stub();
    sortHandlerInstanceStub.buildOrderClause = sinon.stub();
  })
  describe('Get projects list with total count of projects', function () {
    context('Get projects and its total counts', function () {
      it('Should return contacts and total count', function (done) {
        const inputs = {
          userId: '01',
          search: '',
          limit: 0,
          offset: 0,
          userRoles: [
            "manager"
          ],
        };
        const filter = {};
        const sort = {};

        projectFindAll.returns([]);
        projectCount.returns(0);

        projectService
          .getAllProjectWithSettings(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              totalCount: 0,
              docs: []
            };
            const where = {};
            where[`$Users.id$`] = '01';

            const filterColumnsMapping = {
              updatedAt: `$ProjectSetting.updatedAt$`,
              status: `$ProjectSetting.status$`,
              client: `$Project.ClientId$`,
              project: `$Project.id$`,
              aliasName: `$Project.id$`,
            };

            const sortColumnsMapping = {
              client: `"Client"."name"`,
              dueDate: `"dueDate"`,
            };

            const customSortColumn = {};

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where
            };

            const order = [];

            const expectedBuildOrderClauseArgs = {
              sortColumnsMapping,
              customSortColumn,
              sort,
              order
            };

            expect(actualData).to.deep.equal(expectedData);

            const actualBuildWhereClauseFirstArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            const actualBuildOrderClauseFirstArgs =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args[0];
            const actualBuildOrderClauseSecondArgs =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args[1];
            const actualBuildOrderClauseThirdArgs =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args[2];
            const actualBuildOrderClauseFourthArgs =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args[3];
            const actualBuildOrderClauseArgsLength =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args.length;

            expect(
              inspect(actualBuildWhereClauseFirstArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
                depth: null
              }),
              'Expected value not pass in build where clause function'
            );
            expect(
              inspect(actualBuildWhereClauseSecondArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.filter, { depth: null }),
              'Expected value not pass in build where clause function'
            );
            expect(
              inspect(actualBuildWhereClauseThirdArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.where, { depth: null }),
              'Expected value not pass in build where clause function'
            );
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(
              Object.keys(expectedBuildWhereClauseArgs).length,
              'Expected value not pass in build where clause function'
            );

            expect(actualBuildOrderClauseFirstArgs).to.deep.equal(
              expectedBuildOrderClauseArgs.sortColumnsMapping,
              'Expected value not pass in build order clause function'
            );
            expect(actualBuildOrderClauseSecondArgs).to.deep.equal(
              expectedBuildOrderClauseArgs.customSortColumn,
              'Expected value not pass in build order clause function'
            );
            expect(actualBuildOrderClauseThirdArgs).to.deep.equal(
              expectedBuildOrderClauseArgs.sort,
              'Expected value not pass in build order clause function'
            );
            expect(actualBuildOrderClauseFourthArgs).to.deep.equal(
              expectedBuildOrderClauseArgs.order,
              'Expected value not pass in build order clause function'
            );
            expect(actualBuildOrderClauseArgsLength).to.deep.equal(
              Object.keys(expectedBuildOrderClauseArgs).length,
              'Expected value not pass in build order clause function'
            );

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while find all projects', function (done) {
        //Arrange
        const inputs = {
          userId: '01',
          search: '',
          limit: 0,
          offset: 0,
          userRoles: [
            "manager"
          ],
        };
        const filter = {};
        const sort = {};

        projectFindAll.throws(new Error('Something went wrong'));

        // Act
        projectService
          .getAllProjectWithSettings(inputs, filter, sort)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while counting all projects', function (done) {
        //Arrange
        const inputs = {
          userId: '01',
          search: '',
          limit: 0,
          offset: 0,
          userRoles: [
            "manager"
          ],
        };
        const filter = {};
        const sort = {};

        projectCount.throws(new Error('Something went wrong'));

        // Act
        projectService
          .getAllProjectWithSettings(inputs, filter, sort)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Validate find all and count data query', function () {
      it('Should verify if query payload is valid when attributes list is passed', function (done) {
        const inputs = {
          userId: '01',
          search: 'abc',
          limit: 0,
          offset: 0,
          searchColumn: 'project',
          userRoles:['manager']
        };
        const filter = {};
        const sort = {};

        projectFindAll.returns([]);
        projectCount.returns(0);

        const where = {};
        where[`$Users.id$`] = inputs.userId;

        const order = [
          [
            sequelize.fn('MAX', Sequelize.col('Tasks.updatedAt')),
            'DESC NULLS FIRST',
          ],
          ['updatedAt', 'DESC'],
        ];

        projectService
          .getAllProjectWithSettings(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const expectedProjectsFindAllArgs = {
              attributes: ['id', 'name'],
              include: [
                {
                  model: ProjectSetting,
                  attributes: [],
                  required: true,
                },
                {
                  model: Client,
                  attributes: [],
                  required: true,
                },
                {
                  model: Task,
                  attributes: [],
                },
                {
                  model: User,
                  through: {
                    attributes: [],
                  },
                  attributes: [],
                  required: true,
                },
              ],
              where,
              order,
              limit: inputs.limit,
              offset: inputs.offset,
              group: ['Project.id', 'ProjectSetting.id', 'Client.id'],
              subQuery: false,
              raw: true,
            };
            const actualProjectsFindAllFirstArg = projectFindAll.getCall(0).args[0];
            expect(
              inspect(actualProjectsFindAllFirstArg.attributes, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.attributes, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.order, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.order, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.include, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.include, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.where, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.where, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.limit, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.limit, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.offset, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.offset, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.group, { depth: null })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.group, { depth: null }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.raw, { depth: null })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.raw, { depth: null }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.subQuery, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.subQuery, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              Object.keys(actualProjectsFindAllFirstArg).length
            ).to.deep.equal(
              Object.keys(expectedProjectsFindAllArgs).length,
              'Expected value not pass in projects find all function'
            );


            const expectedProjectsCountArgs = {
              include: [
                {
                  model: ProjectSetting,
                  attributes: [],
                  required: true,
                },
                {
                  model: Client,
                  attributes: [],
                  required: true,
                },
                {
                  model: User,
                  through: {
                    attributes: [],
                  },
                  attributes: [],
                  required: true,
                },
              ],
              where,
              subQuery: false,
              raw: true,
            };
            const actualProjectsCountArg = projectCount.getCall(0).args[0];
            expect(
              inspect(actualProjectsCountArg.include, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsCountArgs.include, {
                depth: null
              }),
              'Expected value not pass in projects count function'
            );
            expect(
              inspect(actualProjectsCountArg.where, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsCountArgs.where, {
                depth: null
              }),
              'Expected value not pass in projects count function'
            );
            expect(
              inspect(actualProjectsCountArg.raw, { depth: null })
            ).to.deep.equal(
              inspect(expectedProjectsCountArgs.raw, { depth: null }),
              'Expected value not pass in projects count function'
            );
            expect(
              inspect(actualProjectsCountArg.subQuery, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsCountArgs.subQuery, {
                depth: null
              }),
              'Expected value not pass in projects count function'
            );
            expect(
              Object.keys(actualProjectsCountArg).length
            ).to.deep.equal(
              Object.keys(expectedProjectsCountArgs).length,
              'Expected value not pass in projects count function'
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should verify if query payload is valid when no attributes is passed', function (done) {
        const inputs = {
          userId: '01',
          search: 'abc',
          limit: 0,
          offset: 0,
          attributes: null,
          userRoles: [
            "manager"
          ],
        };
        const filter = {};
        const sort = {};

        projectFindAll.returns([]);
        projectCount.returns(0);

        const where = {};
        where[`$Users.id$`] = inputs.userId;

        const order = [
          [
            sequelize.fn('MAX', Sequelize.col('Tasks.updatedAt')),
            'DESC NULLS FIRST',
          ],
          ['updatedAt', 'DESC'],
        ];

        projectService
          .getAllProjectWithSettings(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const expectedProjectsFindAllArgs = {
              attributes: [
                ['id', 'projectId'],
                'aliasName',
                [Sequelize.col('Client.id'), 'clientId'],
                [Sequelize.col('Client.name'), 'client'],
                'createdAt',
                'dueDate',
                [Sequelize.col('ProjectSetting.updatedAt'), 'updatedAt'],
                [Sequelize.col('ProjectSetting.status'), 'status'],
                [Sequelize.col('ProjectSetting.target'), 'targets'],
              ],
              include: [
                {
                  model: ProjectSetting,
                  attributes: [],
                  required: true,
                },
                {
                  model: Client,
                  attributes: [],
                  required: true,
                },
                {
                  model: Task,
                  attributes: [],
                },
                {
                  model: User,
                  through: {
                    attributes: [],
                  },
                  attributes: [],
                  required: true,
                },
              ],
              where,
              order,
              limit: inputs.limit,
              offset: inputs.offset,
              group: ['Project.id', 'ProjectSetting.id', 'Client.id'],
              subQuery: false,
              raw: true,
            };
            const actualProjectsFindAllFirstArg = projectFindAll.getCall(0).args[0];
            expect(
              inspect(actualProjectsFindAllFirstArg.attributes, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.attributes, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.order, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.order, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.include, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.include, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.where, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.where, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.limit, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.limit, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.offset, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.offset, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.group, { depth: null })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.group, { depth: null }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.raw, { depth: null })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.raw, { depth: null }),
              'Expected value not pass in projects find all function'
            );
            expect(
              inspect(actualProjectsFindAllFirstArg.subQuery, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsFindAllArgs.subQuery, {
                depth: null
              }),
              'Expected value not pass in projects find all function'
            );
            expect(
              Object.keys(actualProjectsFindAllFirstArg).length
            ).to.deep.equal(
              Object.keys(expectedProjectsFindAllArgs).length,
              'Expected value not pass in projects find all function'
            );


            const expectedProjectsCountArgs = {
              include: [
                {
                  model: ProjectSetting,
                  attributes: [],
                  required: true,
                },
                {
                  model: Client,
                  attributes: [],
                  required: true,
                },
                {
                  model: User,
                  through: {
                    attributes: [],
                  },
                  attributes: [],
                  required: true,
                },
              ],
              where,
              subQuery: false,
              raw: true,
            };
            const actualProjectsCountArg = projectCount.getCall(0).args[0];
            expect(
              inspect(actualProjectsCountArg.include, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsCountArgs.include, {
                depth: null
              }),
              'Expected value not pass in projects count function'
            );
            expect(
              inspect(actualProjectsCountArg.where, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsCountArgs.where, {
                depth: null
              }),
              'Expected value not pass in projects count function'
            );
            expect(
              inspect(actualProjectsCountArg.raw, { depth: null })
            ).to.deep.equal(
              inspect(expectedProjectsCountArgs.raw, { depth: null }),
              'Expected value not pass in projects count function'
            );
            expect(
              inspect(actualProjectsCountArg.subQuery, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedProjectsCountArgs.subQuery, {
                depth: null
              }),
              'Expected value not pass in projects count function'
            );
            expect(
              Object.keys(actualProjectsCountArg).length
            ).to.deep.equal(
              Object.keys(expectedProjectsCountArgs).length,
              'Expected value not pass in projects count function'
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});