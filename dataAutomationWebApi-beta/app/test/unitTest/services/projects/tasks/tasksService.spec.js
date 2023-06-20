const {
  expect
} = require('chai');
const sinon = require('sinon');
const { inspect } = require('util');
const proxyquire = require('proxyquire');
const {
  File,
  Task,
  Project,
  TaskType,
  Job,
  Account,
  Contact,
  User,
  TaskAllocationTemp,
  sequelize,
  Sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');

const { CloudTasksClient } = require('@google-cloud/tasks');

const { Op } = Sequelize;

const userCacheInstanceStub = {};

const UserCacheStub = sinon.stub().returns(userCacheInstanceStub);

const dispositionCacheInstanceStub = {};

const DispositionCacheStub = sinon.stub().returns(dispositionCacheInstanceStub);

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

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const downloadServiceRepo = {
  taskExporter: sinon.stub(),
};

const TaskService = proxyquire('../../../../../services/projects/tasks/tasksService', {
  '@nexsalesdev/da-download-service-repository': downloadServiceRepo,
  '../../../config/settings/settings-config': settingsConfig,
  '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler': FilterHandlerStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler': SortHandlerStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/userCache': UserCacheStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/dispositionCache': DispositionCacheStub,
});
const taskService = new TaskService();

let taskServiceCheckTaskAllocationIsInProgress, taskServiceGetProjectName, taskServiceEnqueue, fileCreate, taskStatsFindOne, taskFindAll, dateStub, tasksServiceGenerateFileNameBasedOnFilter, taskFileCreate, taskServiceAddFile, taskServiceUpdateJobStatus, tasksCountMaxRecords, cloudTasksClientStub, tasksFindAndCountAll, todayDateCheck, getTaskStats, buildOrderClause, buildWhereClause, fetchAllTask, tasksCount, customOrder,buildWhereClauseForStatus;

describe('#tasksService - validateTasksAssignData', function () {
  beforeEach(function () {
    sortHandlerInstanceStub.validate = sinon.stub();
    filterHandlerInstanceStub.validate = sinon.stub();
  });
  describe('Validate assigned tasks data', function () {
    context('Check taskTypeId', function () {
      it('Should throw error when a taskTypeId is Empty', function (done) {
        // Arrange
        const data = {
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "abc",
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'taskTypeId is required';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });
    });

    context('Check tasks allocation strategy', function () {
      it('Should throw error when an invalid task allocation strategy is specified', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "abc",
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Received Unknown Task Allocation strategy';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });
    });

    context('Validate block size if task allocation strategy is `Block`', function () {
      it('Should throw error when an invalid block size is specified', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: 'abc',
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Block Size value is incorrect';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });

      it('Should throw error when block size is less than 1', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: '0',
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Block Size value is incorrect';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done()
        }
      });
    });

    context('Check limit assignment', function () {
      it('Should throw error when an invalid limit assignment is specified', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Sequential",
          limitAssignment: "abc",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Received Unknown Limit Assignment';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });
    });

    context('Validate limit size if limit assignment is `Assign Top`', function () {
      it('Should throw error when an invalid limit size is specified', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "abc"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Limit Size value is incorrect';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });

      it('Should throw error when limit size is less than 1', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "0"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Limit Size value is incorrect';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done()
        }
      });
    });

    context('Validate allocation type', function () {
      it('Should throw error when an invalid allocation type is specified', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "abc",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Received Unknown AllocationOf Value';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });
    });

    context('Validate agents for task allocation', function () {
      it('Should throw error when an invalid agents value is specified', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: "auth0|61110707c261f8006916a368",
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Agents value is incorrect';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });

      it('Should throw error when no agents value is specified', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: [],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Agents value is incorrect';
          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });
    });

    context('Validate filter and sort value if allocationOf value is a `task`', function () {
      it('Validated filter and sort successfully', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "task",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          disposition: "asc"
        };

        const filterableColumns = {
          accountName: {
            type: 'string',
            operator: ['=', 'isNull']
          },
          contactEmail: {
            type: 'string',
            operator: ['=', 'isNull']
          },
          userName: {
            type: 'array',
            operator: ['=']
          },
          status: {
            type: 'string',
            operator: ['=']
          },
          accountDisposition: {
            type: 'array',
            operator: ['=', 'isNull']
          },
          contactDisposition: {
            type: 'array',
            operator: ['=', 'isNull']
          },
          accountFinalDisposition: {
            type: 'array',
            operator: ['=', 'isNull']
          },
          potential: {
            type: 'string',
            operator: ['=', '<', '>']
          },
          priority: {
            type: 'string',
            operator: ['=']
          },
          dueDate: {
            type: 'string',
            operator: ['<', '>=']
          },
          taskCreatedDate: {
            type: 'array',
            operator: ['between']
          },
          taskUpdatedDate: {
            type: 'array',
            operator: ['between']
          },
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

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort)

          // Assert
          const actualValueForValidateSort = sortHandlerInstanceStub.validate.calledWithExactly(sortableColumns, sort, multipleSort);
          const expectedValueForValidateSort = true;
          const actualValueForValidateFilter = filterHandlerInstanceStub.validate.calledWithExactly(filterableColumns, filter);
          const expectedValueForValidateFilter = true;
          expect(actualValueForValidateSort).to.equal(expectedValueForValidateSort, 'Expected value not pass in validate sort function');
          expect(actualValueForValidateFilter).to.equal(expectedValueForValidateFilter, 'Expected value not pass in validate filter function');
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    context('Validate filter and sort value if allocationOf value is a `account`', function () {
      it('Validated filter and sort successfully', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          disposition: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {};

        const filterableColumns = {
          label: {
            type: 'string',
            operator: ['=']
          },
          createdAt: {
            type: 'array',
            operator: ['between']
          },
          updatedAt: {
            type: 'array',
            operator: ['between']
          },
          potential: {
            type: 'string',
            operator: ['=', '<', '>']
          },
          disposition: {
            type: 'array',
            operator: ['=']
          },
          stage: {
            type: 'string',
            operator: ['=']
          },
          isAssigned: {
            type: 'string',
            operator: ['=']
          },
          masterDisposition: {
            type: 'string',
            operator: ['=']
          },
        };
        const sortableColumns = ['name', 'domain'];
        const multipleSort = true;

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort)

          // Assert
          const actualValueForValidateSort = sortHandlerInstanceStub.validate.calledWithExactly(sortableColumns, sort, multipleSort);
          const expectedValueForValidateSort = true;
          const actualValueForValidateFilter = filterHandlerInstanceStub.validate.calledWithExactly(filterableColumns, filter);
          const expectedValueForValidateFilter = true;
          expect(actualValueForValidateSort).to.deep.equal(expectedValueForValidateSort, 'Expected value not pass in validate sort function');
          expect(actualValueForValidateFilter).to.deep.equal(expectedValueForValidateFilter, 'Expected value not pass in validate filter function');
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    context('Validate filter and sort value if allocationOf value is a `contact`', function () {
      it('Validated filter and sort successfully', function (done) {
        // Arrange
        const data = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "contact",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4"
        };
        const filter = {
          researchStatus: {
            operator: "=",
            value: ["Pending"]
          }
        };
        const sort = {
          companyName: "asc"
        };

        const filterableColumns = {
          companyName: {
            type: 'string',
            operator: ['=', 'isNull']
          },
          domain: {
            type: 'string',
            operator: ['=', 'isNull']
          },
          accountLabel: {
            type: 'string',
            operator: ['=']
          },
          contactLabel: {
            type: 'string',
            operator: ['=']
          },
          stage: {
            type: 'string',
            operator: ['=']
          },
          researchStatus: {
            type: 'array',
            operator: ['=']
          },
          updatedBy: {
            type: 'array',
            operator: ['=', 'isNull']
          },
          updatedAt: {
            type: 'array',
            operator: ['between']
          },
        };
        const sortableColumns = ['companyName', 'domain'];
        const multipleSort = true;

        try {
          // Act
          taskService.validateTasksAssignData(data, filter, sort)

          // Assert
          const actualValueForValidateSort = sortHandlerInstanceStub.validate.calledWithExactly(sortableColumns, sort, multipleSort);
          const expectedValueForValidateSort = true;
          const actualValueForValidateFilter = filterHandlerInstanceStub.validate.calledWithExactly(filterableColumns, filter);
          const expectedValueForValidateFilter = true;
          expect(actualValueForValidateSort).to.deep.equal(expectedValueForValidateSort, 'Expected value not pass in validate sort function');
          expect(actualValueForValidateFilter).to.deep.equal(expectedValueForValidateFilter, 'Expected value not pass in validate filter function');
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

describe('#tasksService - checkTaskAllocationIsInProgress', function () {
  beforeEach(function () {
    taskAllocationTempFindOne = sinon.stub(TaskAllocationTemp, 'findOne');
  });
  afterEach(function () {
    taskAllocationTempFindOne.restore()
  });
  describe('Check task allocation process is inProgress for given projectId', function () {
    context('Check If get some errors while find inProgress task allocation process from DB', function () {
      it('Should throw error', function (done) {
        // Arrange
        const projectId = '111';
        taskAllocationTempFindOne.throws(new Error('Something went wrong in getting task allocation temp from DB'));

        // Act
        taskService.checkTaskAllocationIsInProgress(projectId)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in getting task allocation temp from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If the task allocation process is inProgress', function () {
      it('Should throw error', function (done) {
        // Arrange
        const projectId = '111';
        taskAllocationTempFindOne.returns({
          id: '222'
        });

        // Act
        taskService.checkTaskAllocationIsInProgress(projectId)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `The process of task allocation for this project is already underway so you cannot start another process`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If the task allocation process is not an inProgress', function () {
      it('Should not throw an error', function (done) {
        // Arrange
        const projectId = '111';
        taskAllocationTempFindOne.returns(null);

        // Act
        taskService.checkTaskAllocationIsInProgress(projectId)
          .then(function () {
            // Assert
            const taskAllocationTempFindOneInput = {
              attributes: ['id'],
              where: {
                projectId
              },
            };

            expect(taskAllocationTempFindOne.calledWithExactly(taskAllocationTempFindOneInput)).to.equal(true, 'Expected Query not executed for find taskAllocationTemp data from DB');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#tasksService - getProjectName', function () {
  beforeEach(function () {
    projectFindOne = sinon.stub(Project, 'findOne');
  });
  afterEach(function () {
    projectFindOne.restore()
  });
  describe('Return project name of given projectId', function () {
    context('Check If get some errors while find project from DB', function () {
      it('Should throw error', function (done) {
        // Arrange
        const projectId = '111';
        projectFindOne.throws(new Error('Something went wrong in getting project data from DB'));

        // Act
        taskService.getProjectName(projectId)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in getting project data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if the project is not found in DB', function () {
      it('Should throw error with error message `Project not Found`', function (done) {
        // Arrange
        const projectId = '111';
        projectFindOne.returns(null);

        // Act
        taskService.getProjectName(projectId)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Project not Found for ${projectId} id`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if the project is found in DB', function () {
      it('Should return projectName', function (done) {
        // Arrange
        const projectId = '111';
        projectFindOne.returns({
          id: '111',
          aliasName: 'abc'
        });

        // Act
        taskService.getProjectName(projectId)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = 'abc';
            const projectFindOneInput = {
              attributes: ['aliasName'],
              where: [{
                id: projectId,
              }, ],
            };

            expect(projectFindOne.calledWithExactly(projectFindOneInput)).to.equal(true, 'Expected Query not executed for find project data from DB');
            expect(actualResult).to.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#tasksService - tasksAssign', function () {
  beforeEach(function () {
    taskServiceCheckTaskAllocationIsInProgress = sinon.stub(taskService, 'checkTaskAllocationIsInProgress');
    taskServiceGetProjectName = sinon.stub(taskService, 'getProjectName');
    taskServiceEnqueue = sinon.stub(taskService, 'enqueue');
    fileCreate = sinon.stub(File, 'create');
  });
  afterEach(function () {
    taskServiceCheckTaskAllocationIsInProgress.restore();
    taskServiceGetProjectName.restore();
    taskServiceEnqueue.restore();
    fileCreate.restore();
  });
  describe('Starts the process of assigning tasks', function () {
    context('Check task allocation process is inProgress for given projectId', function () {
      it('Should throw error', function (done) {
        //Arrange
        const inputs = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4",
          projectId: "111",
          userId: "222",
          filter: {
            disposition: {
              operator: "=",
              value: ["Pending"]
            }
          },
          sort: {
            disposition: "asc"
          }
        }
        taskServiceCheckTaskAllocationIsInProgress.throws(new Error(
          `The process of task allocation for this project is already underway so you cannot start another process`,
        ));

        // Act
        taskService.tasksAssign(inputs)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `The process of task allocation for this project is already underway so you cannot start another process`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If get some errors while getting the project name using projectId', function () {
      it('Should throw error', function (done) {
        //Arrange
        const inputs = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4",
          projectId: "111",
          userId: "222",
          filter: {
            disposition: {
              operator: "=",
              value: ["Pending"]
            }
          },
          sort: {
            disposition: "asc"
          }
        }
        taskServiceCheckTaskAllocationIsInProgress.returns();
        taskServiceGetProjectName.throws(new Error(`Project not Found for ${inputs.projectId} id`));

        // Act
        taskService.tasksAssign(inputs)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Project not Found for ${inputs.projectId} id`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If get some errors while adding file data in DB', function () {
      it('Should throw error', function (done) {
        //Arrange
        const inputs = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4",
          projectId: "111",
          userId: "222",
          filter: {
            disposition: {
              operator: "=",
              value: ["Pending"]
            }
          },
          sort: {
            disposition: "asc"
          }
        }
        const projectName = 'abc';
        taskServiceCheckTaskAllocationIsInProgress.returns();
        taskServiceGetProjectName.returns(projectName);
        fileCreate.throws(new Error('Something went wrong in adding file data in DB'));

        // Act
        taskService.tasksAssign(inputs)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in adding file data in DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If get some errors while adding the task assign process in the queue', function () {
      it('Should throw error', function (done) {
        //Arrange
        const inputs = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4",
          projectId: "111",
          userId: "222",
          filter: {
            disposition: {
              operator: "=",
              value: ["Pending"]
            }
          },
          sort: {
            disposition: "asc"
          }
        }
        const projectName = 'abc';
        taskServiceCheckTaskAllocationIsInProgress.returns();
        taskServiceGetProjectName.returns(projectName);
        fileCreate.returns(`File data successfully created in DB`);
        taskServiceEnqueue.throws(new Error('Something went wrong in adding task assign job in Queue'));

        // Act
        taskService.tasksAssign(inputs)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in adding task assign job in Queue`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If the task assign process starts successfully when the allocationOf value is `task`', function () {
      it('Should return success message `Task Assign job added Successfully`', function (done) {
        //Arrange
        const inputs = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "task",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4",
          projectId: "111",
          userId: "222",
          filter: {
            disposition: {
              operator: "=",
              value: ["Pending"]
            }
          },
          sort: {
            disposition: "asc"
          }
        }
        const objectType = 'account';
        const projectName = 'abc';
        taskServiceCheckTaskAllocationIsInProgress.returns();
        taskServiceGetProjectName.returns(projectName);
        fileCreate.returns(`File data successfully created in DB`);
        taskServiceEnqueue.returns(`Task assign job successfully Added in Queue`);

        // Act
        taskService.tasksAssign(inputs)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = `Task Assign job added Successfully`;
            const actualFileCreateInputFirstArg = fileCreate.getCall(0).args[0];
            const actualFileCreateInputTotalArg = fileCreate.getCall(0).args.length;

            const actualFileCreateInputId = actualFileCreateInputFirstArg.id || '';
            const actualFileCreateInputName = actualFileCreateInputFirstArg.name || '';
            const actualFileCreateInputJobId = actualFileCreateInputFirstArg.Job.id || '';
            delete actualFileCreateInputFirstArg.id;
            delete actualFileCreateInputFirstArg.name;
            delete actualFileCreateInputFirstArg.Job.id;

            const expectedFileCreateInputFirstArg = {
              type: 'Task Allocation',
              format: '.csv',
              location: `files/111/Task Allocation/${actualFileCreateInputId}.csv`,
              mapping: {
                ObjectId: 'ObjectId',
                UserName: 'userName'
              },
              ProjectId: '111',
              createdBy: '222',
              updatedBy: '222',
              Job: {
                status: 'Queued',
                operation_name: 'taskAllocation',
                operation_param: {
                  mapping: {
                    ObjectId: 'ObjectId',
                    UserName: 'userName'
                  },
                  projectId: '111',
                  taskAllocationStrategy: "Block",
                  blockSize: "4",
                  limitAssignment: "Assign Top",
                  limitSize: "4",
                  agents: ["auth0|61110707c261f8006916a368"],
                  filter: {
                    disposition: {
                      operator: "=",
                      value: ["Pending"]
                    }
                  },
                  sort: {
                    disposition: "asc"
                  },
                  taskTypeId: '01',
                  objectType: objectType,
                },
                result_processed: 0,
                result_imported: 0,
                result_errored: 0,
                createdBy: '222',
                updatedBy: '222',
                row_count: 0
              }
            };
            const expectedFileCreateInputTotalArg = 2;

            const actualTaskServiceEnqueueInputFirstArg = taskServiceEnqueue.getCall(0).args[0];
            const actualTaskServiceEnqueueInputSecondArg = taskServiceEnqueue.getCall(0).args[1];
            const actualTaskServiceEnqueueInputTotalArg = taskServiceEnqueue.getCall(0).args.length;

            const expectedTaskServiceEnqueueInputFirstArg = {
              jobId: actualFileCreateInputJobId,
              projectId: '111',
              userId: '222'
            };
            const expectedTaskServiceEnqueueInputSecondArg = 'https://dev-da-task-allocation-service-ymghawfbjq-uc.a.run.app/taskAllocation';
            const expectedTaskServiceEnqueueInputTotalArg = 2;

            expect(taskServiceCheckTaskAllocationIsInProgress.calledWithExactly(inputs.projectId)).to.equal(true, 'Expected value not pass in checkTaskAllocationIsInProgress function');
            expect(taskServiceGetProjectName.calledWithExactly(inputs.projectId)).to.equal(true, 'Expected value not pass in getProjectName function');
            expect(inspect(actualFileCreateInputFirstArg, { depth: null })).to.deep.equal(inspect(expectedFileCreateInputFirstArg, { depth: null }), 'Expected value not pass in File create');
            expect(actualFileCreateInputTotalArg).to.equal(expectedFileCreateInputTotalArg, 'Expected value not pass in File create');
            expect(actualFileCreateInputId).to.be.not.an.empty;
            expect(actualFileCreateInputName).to.be.not.an.empty;
            expect(actualFileCreateInputJobId).to.be.not.an.empty;
            expect(actualTaskServiceEnqueueInputFirstArg).to.deep.equal(expectedTaskServiceEnqueueInputFirstArg, 'Expected value not pass in enqueue function');
            expect(actualTaskServiceEnqueueInputSecondArg).to.equal(expectedTaskServiceEnqueueInputSecondArg, 'Expected value not pass in enqueue function');
            expect(actualTaskServiceEnqueueInputTotalArg).to.equal(expectedTaskServiceEnqueueInputTotalArg, 'Expected value not pass in enqueue function');
            expect(actualResult).to.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If the task assign process starts successfully when the allocationOf value is `account`', function () {
      it('Should return success message `Task Assign job added Successfully`', function (done) {
        //Arrange
        const inputs = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "account",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4",
          projectId: "111",
          userId: "222",
          filter: {
            disposition: {
              operator: "=",
              value: ["Pending"]
            }
          },
          sort: {}
        }
        const projectName = 'abc';
        taskServiceCheckTaskAllocationIsInProgress.returns();
        taskServiceGetProjectName.returns(projectName);
        fileCreate.returns(`File data successfully created in DB`);
        taskServiceEnqueue.returns(`Task assign job successfully Added in Queue`);

        // Act
        taskService.tasksAssign(inputs)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = `Task Assign job added Successfully`;
            const actualFileCreateInputFirstArg = fileCreate.getCall(0).args[0];
            const actualFileCreateInputTotalArg = fileCreate.getCall(0).args.length;

            const actualFileCreateInputId = actualFileCreateInputFirstArg.id || '';
            const actualFileCreateInputName = actualFileCreateInputFirstArg.name || '';
            const actualFileCreateInputJobId = actualFileCreateInputFirstArg.Job.id || '';
            delete actualFileCreateInputFirstArg.id;
            delete actualFileCreateInputFirstArg.name;
            delete actualFileCreateInputFirstArg.Job.id;

            const expectedFileCreateInputFirstArg = {
              type: 'Task Allocation',
              format: '.csv',
              location: `files/111/Task Allocation/${actualFileCreateInputId}.csv`,
              mapping: {
                ObjectId: 'ObjectId',
                UserName: 'userName'
              },
              ProjectId: '111',
              createdBy: '222',
              updatedBy: '222',
              Job: {
                status: 'Queued',
                operation_name: 'taskAllocation',
                operation_param: {
                  mapping: {
                    ObjectId: 'ObjectId',
                    UserName: 'userName'
                  },
                  projectId: '111',
                  taskAllocationStrategy: "Block",
                  blockSize: "4",
                  limitAssignment: "Assign Top",
                  limitSize: "4",
                  agents: ["auth0|61110707c261f8006916a368"],
                  filter: {
                    disposition: {
                      operator: "=",
                      value: ["Pending"]
                    }
                  },
                  sort: {
                    domain: 'asc',
                    name: 'asc'
                  },
                  taskTypeId: '01',
                  objectType: 'account',
                },
                result_processed: 0,
                result_imported: 0,
                result_errored: 0,
                createdBy: '222',
                updatedBy: '222',
                row_count: 0
              }
            };
            const expectedFileCreateInputTotalArg = 2;

            const actualTaskServiceEnqueueInputFirstArg = taskServiceEnqueue.getCall(0).args[0];
            const actualTaskServiceEnqueueInputSecondArg = taskServiceEnqueue.getCall(0).args[1];
            const actualTaskServiceEnqueueInputTotalArg = taskServiceEnqueue.getCall(0).args.length;

            const expectedTaskServiceEnqueueInputFirstArg = {
              jobId: actualFileCreateInputJobId,
              projectId: '111',
              userId: '222'
            };
            const expectedTaskServiceEnqueueInputSecondArg = 'https://dev-da-task-allocation-service-ymghawfbjq-uc.a.run.app/accountAllocation';
            const expectedTaskServiceEnqueueInputTotalArg = 2;

            expect(taskServiceCheckTaskAllocationIsInProgress.calledWithExactly(inputs.projectId)).to.equal(true, 'Expected value not pass in checkTaskAllocationIsInProgress function');
            expect(taskServiceGetProjectName.calledWithExactly(inputs.projectId)).to.equal(true, 'Expected value not pass in getProjectName function');
            expect(inspect(actualFileCreateInputFirstArg, { depth: null })).to.deep.equal(inspect(expectedFileCreateInputFirstArg, { depth: null }), 'Expected value not pass in File create');
            expect(actualFileCreateInputTotalArg).to.equal(expectedFileCreateInputTotalArg, 'Expected value not pass in File create');
            expect(actualFileCreateInputId).to.be.not.an.empty;
            expect(actualFileCreateInputName).to.be.not.an.empty;
            expect(actualFileCreateInputJobId).to.be.not.an.empty;
            expect(actualTaskServiceEnqueueInputFirstArg).to.deep.equal(expectedTaskServiceEnqueueInputFirstArg, 'Expected value not pass in enqueue function');
            expect(actualTaskServiceEnqueueInputSecondArg).to.equal(expectedTaskServiceEnqueueInputSecondArg, 'Expected value not pass in enqueue function');
            expect(actualTaskServiceEnqueueInputTotalArg).to.equal(expectedTaskServiceEnqueueInputTotalArg, 'Expected value not pass in enqueue function');
            expect(actualResult).to.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If the task assign process starts successfully when the allocationOf value is `contact`', function () {
      it('Should return success message `Task Assign job added Successfully`', function (done) {
        //Arrange
        const inputs = {
          taskTypeId: '01',
          agents: ["auth0|61110707c261f8006916a368"],
          allocationOf: "contact",
          taskAllocationStrategy: "Block",
          blockSize: "4",
          limitAssignment: "Assign Top",
          limitSize: "4",
          projectId: "111",
          userId: "222",
          filter: {
            disposition: {
              operator: "=",
              value: ["Pending"]
            }
          },
          sort: {
            disposition: "asc"
          }
        }
        const projectName = 'abc';
        taskServiceCheckTaskAllocationIsInProgress.returns();
        taskServiceGetProjectName.returns(projectName);
        fileCreate.returns(`File data successfully created in DB`);
        taskServiceEnqueue.returns(`Task assign job successfully Added in Queue`);

        // Act
        taskService.tasksAssign(inputs)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = `Task Assign job added Successfully`;
            const actualFileCreateInputFirstArg = fileCreate.getCall(0).args[0];
            const actualFileCreateInputTotalArg = fileCreate.getCall(0).args.length;

            const actualFileCreateInputId = actualFileCreateInputFirstArg.id || '';
            const actualFileCreateInputName = actualFileCreateInputFirstArg.name || '';
            const actualFileCreateInputJobId = actualFileCreateInputFirstArg.Job.id || '';
            delete actualFileCreateInputFirstArg.id;
            delete actualFileCreateInputFirstArg.name;
            delete actualFileCreateInputFirstArg.Job.id;

            const expectedFileCreateInputFirstArg = {
              type: 'Task Allocation',
              format: '.csv',
              location: `files/111/Task Allocation/${actualFileCreateInputId}.csv`,
              mapping: {
                ObjectId: 'ObjectId',
                UserName: 'userName'
              },
              ProjectId: '111',
              createdBy: '222',
              updatedBy: '222',
              Job: {
                status: 'Queued',
                operation_name: 'taskAllocation',
                operation_param: {
                  mapping: {
                    ObjectId: 'ObjectId',
                    UserName: 'userName'
                  },
                  projectId: '111',
                  taskAllocationStrategy: "Block",
                  blockSize: "4",
                  limitAssignment: "Assign Top",
                  limitSize: "4",
                  agents: ["auth0|61110707c261f8006916a368"],
                  filter: {
                    disposition: {
                      operator: "=",
                      value: ["Pending"]
                    }
                  },
                  sort: {
                    disposition: "asc"
                  },
                  taskTypeId: '01',
                  objectType: 'contact',
                },
                result_processed: 0,
                result_imported: 0,
                result_errored: 0,
                createdBy: '222',
                updatedBy: '222',
                row_count: 0
              }
            };
            const expectedFileCreateInputTotalArg = 2;

            const actualTaskServiceEnqueueInputFirstArg = taskServiceEnqueue.getCall(0).args[0];
            const actualTaskServiceEnqueueInputSecondArg = taskServiceEnqueue.getCall(0).args[1];
            const actualTaskServiceEnqueueInputTotalArg = taskServiceEnqueue.getCall(0).args.length;

            const expectedTaskServiceEnqueueInputFirstArg = {
              jobId: actualFileCreateInputJobId,
              projectId: '111',
              userId: '222'
            };
            const expectedTaskServiceEnqueueInputSecondArg = 'https://dev-da-task-allocation-service-ymghawfbjq-uc.a.run.app/contactAllocation';
            const expectedTaskServiceEnqueueInputTotalArg = 2;

            expect(taskServiceCheckTaskAllocationIsInProgress.calledWithExactly(inputs.projectId)).to.equal(true, 'Expected value not pass in checkTaskAllocationIsInProgress function');
            expect(taskServiceGetProjectName.calledWithExactly(inputs.projectId)).to.equal(true, 'Expected value not pass in getProjectName function');
            expect(inspect(actualFileCreateInputFirstArg, { depth: null })).to.deep.equal(inspect(expectedFileCreateInputFirstArg, { depth: null }), 'Expected value not pass in File create');
            expect(actualFileCreateInputTotalArg).to.equal(expectedFileCreateInputTotalArg, 'Expected value not pass in File create');
            expect(actualFileCreateInputId).to.be.not.an.empty;
            expect(actualFileCreateInputName).to.be.not.an.empty;
            expect(actualFileCreateInputJobId).to.be.not.an.empty;
            expect(actualTaskServiceEnqueueInputFirstArg).to.deep.equal(expectedTaskServiceEnqueueInputFirstArg, 'Expected value not pass in enqueue function');
            expect(actualTaskServiceEnqueueInputSecondArg).to.equal(expectedTaskServiceEnqueueInputSecondArg, 'Expected value not pass in enqueue function');
            expect(actualTaskServiceEnqueueInputTotalArg).to.equal(expectedTaskServiceEnqueueInputTotalArg, 'Expected value not pass in enqueue function');
            expect(actualResult).to.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#tasksService - getAllTaskStatsOfAProject', function () {
  let dateStub = {};
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
    taskStatsFindOne = sinon.stub(Task, 'findOne');
  });
  afterEach(function () {
    taskStatsFindOne.restore();
    dateStub.restore();
  });
  describe('Get Tasks Stats For A Project', function () {
    context('Get task stats data for a project', function () {
      it('Should get tasks stats for a project when correct params are passed', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        const taskStatsFindOneRes = {
          "Total": 0,
          "Completed": 0,
          "Overdue": 0,
          "Upcoming": 0,
          "Working": 0,
        };
        taskStatsFindOne.returns(taskStatsFindOneRes);

        // Act
        taskService.getAllTaskStatsOfAProject(inputs, filter)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = [{
                status: 'Total',
                count: 0
              },
              {
                status: 'Completed',
                count: 0
              },
              {
                status: 'Overdue',
                count: 0
              },
              {
                status: 'Upcoming',
                count: 0
              },
              {
                status: 'Working',
                count: 0
              }
            ];

            const filterColumnsMapping = {
              taskCreatedDate: `createdAt`,
              taskUpdatedDate: `updatedAt`,
              accountName: `$Accounts.name$`,
              contactEmail: `$Contacts.email$`,
              userName: `$User.userName$`,
              accountDisposition: `$Accounts->TaskLink.disposition$`,
              contactDisposition: `$Contacts->TaskLink.disposition$`,
              accountFinalDisposition: `$Accounts.disposition$`,
              potential: `$Accounts.potential$`,
            };

            const modifiedFilter = {};

            const where = {
              ProjectId: "01",
            };

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              modifiedFilter,
              where,
            }

            expect(actualData).to.deep.equal(expectedData);

            const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.modifiedFilter, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, { depth: null }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        taskStatsFindOne.throws(new Error('Something went wrong'));

        // Act
        taskService.getAllTaskStatsOfAProject(inputs, filter)
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

    context('Validate task stats data for a project query', function () {
      before(function () {
        const taskStatsFindOneWhere = {
          ProjectId: "01",
        };
        filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(taskStatsFindOneWhere);
      });
      it('Should verify if query payload is valid', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        let todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);
        todayDate = todayDate.toISOString();

        const where = {
          ProjectId: "01",
        };

        const taskStatsFindOneRes = {
          "Total": 0,
          "Completed": 0,
          "Overdue": 0,
          "Upcoming": 0,
          "Working": 0,
        };
        taskStatsFindOne.returns(taskStatsFindOneRes);

        // Act
        taskService.getAllTaskStatsOfAProject(inputs, filter)
          .then(function () {
            // Assert
            const expectedTaskStatsFindOneArgs = {
              attributes: [
                [
                  sequelize.literal(
                    `count(CASE WHEN ("Task"."status" != ('In-Active')) THEN 1 END)`,
                  ),
                  'Total',
                ],
                [
                  sequelize.literal(
                    `count(CASE WHEN ("Task"."status" = ('Completed')) THEN 1 END)`,
                  ),
                  'Completed',
                ],
                [
                  sequelize.literal(
                    `count(CASE WHEN ("Task"."status" = ('Pending')) AND ("Task"."dueDate" < ('${todayDate}')) THEN 1 END)`,
                  ),
                  'Overdue',
                ],
                [
                  sequelize.literal(
                    `count(CASE WHEN ("Task"."status" = ('Pending')) AND ("Task"."dueDate" >= ('${todayDate}')) THEN 1 END)`,
                  ),
                  'Upcoming',
                ],
                [
                  sequelize.literal(
                    `count(CASE WHEN ("Task"."status" = ('Working')) THEN 1 END)`,
                  ),
                  'Working',
                ],
              ],
              include: [
                {
                  model: User,
                  attributes: [],
                  required: true,
                  where: [
                    {
                      '$Task.ProjectId$': '01',
                    },
                  ],
                },
                {
                  model: Account,
                  attributes: [],
                  required: false,
                  where: [
                    {
                      '$Task.ProjectId$': '01',
                    },
                  ],
                  through: {
                    attributes: [],
                    where: [
                      {
                        linkType: 'input',
                      },
                    ],
                  },
                },
                {
                  model: Contact,
                  attributes: [],
                  required: false,
                  where: [
                    {
                      '$Task.ProjectId$': '01',
                    },
                  ],
                  through: {
                    attributes: [],
                    where: [
                      {
                        linkType: 'input',
                      },
                    ],
                  },
                },
              ],
              where,
              raw: true,
              subQuery: false,
            };

            const actualTaskStatsFindOneFirstArg = taskStatsFindOne.getCall(0).args[0];
            expect(inspect(actualTaskStatsFindOneFirstArg.attributes, { depth: null })).to.deep.equal(inspect(expectedTaskStatsFindOneArgs.attributes, { depth: null }), 'Expected value not pass in task stats find one function');
            expect(inspect(actualTaskStatsFindOneFirstArg.include, { depth: null })).to.deep.equal(inspect(expectedTaskStatsFindOneArgs.include, { depth: null }), 'Expected value not pass in task stats find one function');
            expect(inspect(actualTaskStatsFindOneFirstArg.where, { depth: null })).to.deep.equal(inspect(expectedTaskStatsFindOneArgs.where, { depth: null }), 'Expected value not pass in task stats find one function');
            expect(inspect(actualTaskStatsFindOneFirstArg.raw, { depth: null })).to.deep.equal(inspect(expectedTaskStatsFindOneArgs.raw, { depth: null }), 'Expected value not pass in task stats find one function');
            expect(inspect(actualTaskStatsFindOneFirstArg.subQuery, { depth: null })).to.deep.equal(inspect(expectedTaskStatsFindOneArgs.subQuery, { depth: null }), 'Expected value not pass in task stats find one function');
            expect(Object.keys(actualTaskStatsFindOneFirstArg).length).to.deep.equal(Object.keys(expectedTaskStatsFindOneArgs).length, 'Expected value not pass in task stats find one function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        filterHandlerInstanceStub.buildWhereClause = sinon.stub();
      });
    });
  });
});

describe('#tasksService - getTaskDispositions', () => {
  beforeEach(function () {
    taskFindAll = sinon.stub(Task, 'findAll');
  });
  afterEach(function () {
    taskFindAll.restore()
  });
  describe('Returns list of unique Task dispositions (Facets)', () => {
    context('When Task Dispositions are found', () => {
      it('Should return array of dispositions', (done) => {
        // Arrange
        const taskDTO = {
          projectId: '01',
        };

        const expectedResult = [
          'Generic Email',
          'Contact Built',
          'Contact Found: Email Bad',
        ];

        taskFindAll.returns([{
            contactDisposition: 'Generic Email',
            accountDisposition: 'Generic Email',
          },
          {
            contactDisposition: 'Contact Built',
            accountDisposition: 'Contact Built',
          },
          {
            contactDisposition: 'Contact Found: Email Bad',
            accountDisposition: 'Contact Found: Email Bad',
          },
        ]);

        taskService.getTaskDispositions(taskDTO).then(function (result) {
            // Assert
            const actualResult = result;
            expect(actualResult).to.deep.equal(expectedResult);
            expect(actualResult.length).to.equal(expectedResult.length);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Validate if the query arguments are valid', function () {
      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const taskDTO = {
          projectId: '01',
        };

        taskFindAll.throws(new Error('Something went wrong'));

        // Act
        taskService
          .getTaskDispositions(taskDTO)
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

      it('Should verify query arguments for DB operation', function (done) {
        // Arrange

        const taskDTO = {
          projectId: '01',
        };

        const where = {
          ProjectId: taskDTO.projectId,
          status: {
            [Op.ne]: 'In-Active',
          }
        };

        const expectedtaskFindAllInput = {
          attributes: [
            [Sequelize.col('Contacts.TaskLink.disposition'), 'contactDisposition'],
            [Sequelize.col('Accounts.TaskLink.disposition'), 'accountDisposition'],
          ],
          include: [
            {
              model: User,
              attributes: [],
              required: true,
              where: [
                {
                  '$Task.ProjectId$': taskDTO.projectId,
                },
                { '$Task.status$': where.status },
              ],
            },
            {
              model: Account,
              attributes: [],
              required: false,
              where: [
                {
                  '$Task.ProjectId$': taskDTO.projectId,
                },
                { '$Task.status$': where.status },
              ],
              through: {
                attributes: [],
                where: [
                  {
                    linkType: 'input',
                  },
                ],
              },
            },
            {
              model: Contact,
              attributes: [],
              required: false,
              where: [
                {
                  '$Task.ProjectId$': taskDTO.projectId,
                },
                { '$Task.status$': where.status },
              ],
              through: {
                attributes: [],
                where: [
                  {
                    linkType: 'input',
                  },
                ],
              },
            },
          ],
          where,
          raw: true,
        };

        taskFindAll.returns([{
            contactDisposition: 'Generic Email',
            accountDisposition: 'Generic Email',
          },
          {
            contactDisposition: 'Contact Built',
            accountDisposition: 'Contact Built',
          },
          {
            contactDisposition: 'Contact Found: Email Bad',
            accountDisposition: 'Contact Found: Email Bad',
          },
        ]);

        taskService.getTaskDispositions(taskDTO)
          .then(function () {
            // Assert
            const actualtaskFindAllInputFirstArgs = taskFindAll.getCall(0).args[0];
            expect(inspect(actualtaskFindAllInputFirstArgs.attributes, { depth: null })).to.deep.equal(inspect(expectedtaskFindAllInput.attributes, { depth: null }), 'Expected value not pass in get tasks dispositions function');
            expect(inspect(actualtaskFindAllInputFirstArgs.include, { depth: null })).to.deep.equal(inspect(expectedtaskFindAllInput.include, { depth: null }), 'Expected value not pass in get tasks dispositions function');
            expect(inspect(actualtaskFindAllInputFirstArgs.where, { depth: null })).to.deep.equal(inspect(expectedtaskFindAllInput.where, { depth: null }), 'Expected value not pass in get tasks dispositions function');
            expect(inspect(actualtaskFindAllInputFirstArgs.raw, { depth: null })).to.deep.equal(inspect(expectedtaskFindAllInput.raw, { depth: null }), 'Expected value not pass in get tasks dispositions function');
            expect(Object.keys(actualtaskFindAllInputFirstArgs).length).to.deep.equal(Object.keys(expectedtaskFindAllInput).length, 'Expected value not pass in get tasks dispositions function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#tasksService - getTaskUsers', () => {
  beforeEach(function () {
    taskFindAll = sinon.stub(Task, 'findAll');
  });
  afterEach(function () {
    taskFindAll.restore()
  });
  describe('Returns list of unique Contact updatedBy fields (Facets)', () => {
    context('When Contact UpdatedBy are found', () => {
      it('Should return array of Users', (done) => {
        // Arrange
        const taskDTO = {
          projectId: '01',
        };

        const expectedResult = [
          'agent1@nexsales.com',
          'agent2@nexsales.com',
          'agent3@nexsales.com',
        ];

        taskFindAll.returns([
          {
            userName: 'agent1@nexsales.com'
          },
          {
            userName: 'agent2@nexsales.com'
          },
          {
            userName: 'agent3@nexsales.com'
          },
        ]);

        taskService.getTaskUsers(taskDTO).then(function (result) {
            // Assert
            const actualResult = result;
            expect(actualResult).to.deep.equal(expectedResult);
            expect(actualResult.length).to.equal(expectedResult.length);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Validate if the query arguments are valid', function () {
      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const taskDTO = {
          projectId: '01',
        };

        taskFindAll.throws(new Error('Something went wrong'));

        // Act
        taskService
          .getTaskUsers(taskDTO)
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

      it('Should verify query arguments for DB operation', function (done) {
        // Arrange

        const taskDTO = {
          projectId: '01',
        };

        const where = {};
        where.ProjectId = taskDTO.projectId;
        where.status = {
          [Op.ne]: 'In-Active',
        };

        const expectedtaskFindAllInput = {
          attributes: [
            [Sequelize.fn('DISTINCT', Sequelize.col('User.userName')), 'userName'],
          ],
          where: [where],
          include: [
            {
              model: User,
              attributes: [],
              required: true,
              where: [
                {
                  '$Task.ProjectId$': taskDTO.projectId,
                },
                { '$Task.status$': where.status },
              ],
            },
            {
              model: Account,
              attributes: [],
              required: false,
              where: [
                {
                  '$Task.ProjectId$': taskDTO.projectId,
                },
                { '$Task.status$': where.status },
              ],
              through: {
                attributes: [],
                where: [
                  {
                    linkType: 'input',
                  },
                ],
              },
            },
            {
              model: Contact,
              attributes: [],
              required: false,
              where: [
                {
                  '$Task.ProjectId$': taskDTO.projectId,
                },
                { '$Task.status$': where.status },
              ],
              through: {
                attributes: [],
                where: [
                  {
                    linkType: 'input',
                  },
                ],
              },
            },
          ],
          raw: true,
        };

        taskFindAll.returns([
          {
            userName: 'agent1@nexsales.com'
          },
          {
            userName: 'agent2@nexsales.com'
          },
          {
            userName: 'agent3@nexsales.com'
          },
        ]);

        taskService.getTaskUsers(taskDTO)
          .then(function () {
            // Assert
            const actualtaskFindAllInputFirstArgs = taskFindAll.getCall(0).args[0];

            expect(inspect(actualtaskFindAllInputFirstArgs.attributes, { depth: null })).to.deep.equal(inspect(expectedtaskFindAllInput.attributes, { depth: null }), 'Expected value not pass in get tasks users function');
            expect(inspect(actualtaskFindAllInputFirstArgs.include, { depth: null })).to.deep.equal(inspect(expectedtaskFindAllInput.include, { depth: null }), 'Expected value not pass in get tasks users function');
            expect(inspect(actualtaskFindAllInputFirstArgs.where, { depth: null })).to.deep.equal(inspect(expectedtaskFindAllInput.where, { depth: null }), 'Expected value not pass in get tasks users function');
            expect(inspect(actualtaskFindAllInputFirstArgs.raw, { depth: null })).to.deep.equal(inspect(expectedtaskFindAllInput.raw, { depth: null }), 'Expected value not pass in get tasks users function');
            expect(Object.keys(actualtaskFindAllInputFirstArgs).length).to.deep.equal(Object.keys(expectedtaskFindAllInput).length, 'Expected value not pass in get tasks users function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#tasksService - addFile', function () {
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
    tasksServiceGenerateFileNameBasedOnFilter = sinon.stub(taskService, 'generateFileNameBasedOnFilter').returns(`test_all_task_${new Date(Date.now())}.csv`);
    taskServiceGetProjectName = sinon.stub(taskService, 'getProjectName');
    taskFileCreate = sinon.stub(File, 'create');
  });
  afterEach(function () {
    dateStub.restore();
    tasksServiceGenerateFileNameBasedOnFilter.restore();
    taskServiceGetProjectName.restore();
    taskFileCreate.restore();
  });
  describe('Adds File to DB', function () {
    context('File creation in DB', function () {
      it('Should successfully create a file when all correct params are passed during sync download', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = false;

        taskServiceGetProjectName.returns('test');

        taskFileCreate.returns('File Created Successfully');

        // Act
        taskService.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectedGetProjectNameArgs = {
              projectId: fileData.projectId,
            };

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: `test_all_task_${new Date(Date.now())}.csv`,
                type: 'Export',
                format: '.csv',
                location: '',
                mapping: {},
                ProjectId: fileData.projectId,
                createdBy: fileData.createdBy,
                updatedBy: fileData.updatedBy || fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Processing',
                  operation_name: 'syncTaskExport',
                  operation_param: {},
                  result_processed: 0,
                  result_imported: 0,
                  result_errored: 0,
                  createdBy: fileData.createdBy,
                  updatedBy: fileData.updatedBy || fileData.createdBy,
                  row_count: 0,
                },
              },
              includeObject: {
                include: [
                  {
                    model: Job,
                  },
                ],
              },
            }

            const espectedGenerateFileNameBasedOnFilter = {
              projectName: 'test',
              filter: {},
            }

            const actualGetProjectNameFirstArgs = taskServiceGetProjectName.getCall(0).args[0];
            const actualGetProjectNameArgsLength = taskServiceGetProjectName.getCall(0).args.length;

            expect(actualMsg).to.equal(expectedMsg);

            expect(actualGetProjectNameFirstArgs).to.deep.equal(expectedGetProjectNameArgs.projectId, 'Expected value not pass in get project name function');
            expect(actualGetProjectNameArgsLength).to.deep.equal(Object.keys(expectedGetProjectNameArgs).length, 'Expected value not pass in get project name function');

            const actualFileCreateFirstArgs = taskFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = taskFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = taskFileCreate.getCall(0).args.length;

            expect(inspect(actualFileCreateFirstArgs, { depth: null })).to.deep.equal(inspect(expectFileCreateArgs.modelObj, { depth: null }), 'Expected value not pass in file create function');
            expect(inspect(actualFileCreateSecondArgs, { depth: null })).to.deep.equal(inspect(expectFileCreateArgs.includeObject, { depth: null }), 'Expected value not pass in file create function');
            expect(actualFileCreateArgsLength).to.equal(Object.keys(expectFileCreateArgs).length, 'Expected value not pass in file create function');

            const actualGenerateFileNameBasedOnFilterFirstArgs = tasksServiceGenerateFileNameBasedOnFilter.getCall(0).args[0];
            const actualGenerateFileNameBasedOnFilterSecondArgs = tasksServiceGenerateFileNameBasedOnFilter.getCall(0).args[1];
            const actualGenerateFileNameBasedOnFilterArgsLength = tasksServiceGenerateFileNameBasedOnFilter.getCall(0).args.length;

            expect(actualGenerateFileNameBasedOnFilterFirstArgs).to.deep.equal(espectedGenerateFileNameBasedOnFilter.projectName, 'Expected value not pass in generate file name based on filter function');
            expect(actualGenerateFileNameBasedOnFilterSecondArgs).to.deep.equal(espectedGenerateFileNameBasedOnFilter.filter, 'Expected value not pass in generate file name based on filter function');
            expect(actualGenerateFileNameBasedOnFilterArgsLength).to.equal(Object.keys(espectedGenerateFileNameBasedOnFilter).length, 'Expected value not pass in generate file name based on filter function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should successfully create a file when all correct params are passed during async download', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = true;

        taskServiceGetProjectName.returns('test');

        taskFileCreate.returns('File Created Successfully');

        // Act
        taskService.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectedGetProjectNameArgs = {
              projectId: fileData.projectId,
            };

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: `test_all_task_${new Date(Date.now())}.csv`,
                type: 'Export',
                format: '.csv',
                location: `files/${fileData.projectId}/Export/test_all_task_${new Date(Date.now())}.csv`,
                mapping: {},
                ProjectId: fileData.projectId,
                createdBy: fileData.createdBy,
                updatedBy: fileData.updatedBy || fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Queued',
                  operation_name: 'asyncTaskExport',
                  operation_param: {},
                  result_processed: 0,
                  result_imported: 0,
                  result_errored: 0,
                  createdBy: fileData.createdBy,
                  updatedBy: fileData.updatedBy || fileData.createdBy,
                  row_count: 0,
                },
              },
              includeObject: {
                include: [
                  {
                    model: Job,
                  },
                ],
              },
            }

            const espectedGenerateFileNameBasedOnFilter = {
              projectName: 'test',
              filter: {},
            }

            const actualGetProjectNameFirstArgs = taskServiceGetProjectName.getCall(0).args[0];
            const actualGetProjectNameArgsLength = taskServiceGetProjectName.getCall(0).args.length;

            expect(actualMsg).to.equal(expectedMsg);

            expect(actualGetProjectNameFirstArgs).to.deep.equal(expectedGetProjectNameArgs.projectId, 'Expected value not pass in get project name function');
            expect(actualGetProjectNameArgsLength).to.deep.equal(Object.keys(expectedGetProjectNameArgs).length, 'Expected value not pass in get project name function');

            const actualFileCreateFirstArgs = taskFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = taskFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = taskFileCreate.getCall(0).args.length;

            expect(inspect(actualFileCreateFirstArgs, { depth: null })).to.deep.equal(inspect(expectFileCreateArgs.modelObj, { depth: null }), 'Expected value not pass in file create function');
            expect(inspect(actualFileCreateSecondArgs, { depth: null })).to.deep.equal(inspect(expectFileCreateArgs.includeObject, { depth: null }), 'Expected value not pass in file create function');
            expect(actualFileCreateArgsLength).to.equal(Object.keys(expectFileCreateArgs).length, 'Expected value not pass in file create function');

            const actualGenerateFileNameBasedOnFilterFirstArgs = tasksServiceGenerateFileNameBasedOnFilter.getCall(0).args[0];
            const actualGenerateFileNameBasedOnFilterSecondArgs = tasksServiceGenerateFileNameBasedOnFilter.getCall(0).args[1];
            const actualGenerateFileNameBasedOnFilterArgsLength = tasksServiceGenerateFileNameBasedOnFilter.getCall(0).args.length;

            expect(actualGenerateFileNameBasedOnFilterFirstArgs).to.deep.equal(espectedGenerateFileNameBasedOnFilter.projectName, 'Expected value not pass in generate file name based on filter function');
            expect(actualGenerateFileNameBasedOnFilterSecondArgs).to.deep.equal(espectedGenerateFileNameBasedOnFilter.filter, 'Expected value not pass in generate file name based on filter function');
            expect(actualGenerateFileNameBasedOnFilterArgsLength).to.equal(Object.keys(espectedGenerateFileNameBasedOnFilter).length, 'Expected value not pass in generate file name based on filter function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while generating file name', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = true;

        tasksServiceGenerateFileNameBasedOnFilter.throws(new Error('Something went wrong'));

        taskServiceGetProjectName.returns('test');

        taskFileCreate.returns('File Created Successfully');

        // Act
        taskService.addFile(fileData, isAsyncDownload)
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

      it('Should throw error when something internally fails while getting project name', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = true;

        taskServiceGetProjectName.throws(new Error('Something went wrong'));

        taskFileCreate.returns('File Created Successfully');

        // Act
        taskService.addFile(fileData, isAsyncDownload)
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

      it('Should throw error when something internally fails while creating file in DB', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = true;

        taskServiceGetProjectName.returns('test');

        taskFileCreate.throws(new Error('Something went wrong'));

        // Act
        taskService.addFile(fileData, isAsyncDownload)
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

describe('#tasksService - downloadAllTask', function () {
  beforeEach(function () {
    taskServiceAddFile = sinon.stub(taskService, 'addFile');
    taskServiceEnqueue = sinon.stub(taskService, 'enqueue');
  });
  afterEach(function () {
    taskServiceAddFile.restore();
    taskServiceEnqueue.restore();
  });
  describe('Downloads tasks or submits jobs for downloading tasks', function () {
    context('Process tasks download request', function () {
      it('Should correctly process and download tasks when async download is disabled', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        taskServiceAddFile.returns('Added File Successfully');

        taskServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.taskExporter.returns('Exported Records Successfully')

        // Act
        taskService.downloadAllTask(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            // Assert
            const actualMessage = result;
            const expectedMessage = 'Exported Records Successfully';

            const fileData = {
              fileId: inputs.fileId,
              jobId: inputs.jobId,
              projectId: inputs.projectId,
              filter,
              createdBy: inputs.userId,
              updatedBy: inputs.userId,
            };

            const expectedAddFileArgs = {
              fileData,
              isAsyncDownload,
            }

            const dbParam = {
              jobId: inputs.jobId,
              projectId: inputs.projectId,
              filter,
            };

            const expectedAccountExporterArgs = {
              writableStream,
              dbParam,
            };

            const actualAddFileFirstArgs = taskServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = taskServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = taskServiceAddFile.getCall(0).args.length;

            const actualTaskExporterFirstArgs = downloadServiceRepo.taskExporter.getCall(0).args[0];
            const actualTaskExporterSecondArgs = downloadServiceRepo.taskExporter.getCall(0).args[1];
            const actualTaskExporterArgsLength = downloadServiceRepo.taskExporter.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);
            
            expect(actualAddFileFirstArgs).to.deep.equal(expectedAddFileArgs.fileData, 'Expected value not pass in add file function');
            expect(actualAddFileSecondArgs).to.deep.equal(expectedAddFileArgs.isAsyncDownload, 'Expected value not pass in add file function');
            expect(actualAddFileArgsLength).to.deep.equal(Object.keys(expectedAddFileArgs).length, 'Expected value not pass in add file function');

            expect(actualTaskExporterFirstArgs).to.deep.equal(expectedAccountExporterArgs.writableStream, 'Expected value not pass in task exporter function');
            expect(actualTaskExporterSecondArgs).to.deep.equal(expectedAccountExporterArgs.dbParam, 'Expected value not pass in task exporter function');
            expect(actualTaskExporterArgsLength).to.deep.equal(Object.keys(expectedAccountExporterArgs).length, 'Expected value not pass in task exporter function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should correctly process and enqueue job when async download is enabled', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        taskServiceAddFile.returns('Added File Successfully');

        taskServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.taskExporter.returns('Exported Records Successfully')

        // Act
        taskService.downloadAllTask(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            // Assert
            const actualMessage = result;
            const expectedMessage = 'Download Task Enqueued Successfully';

            const fileData = {
              fileId: inputs.fileId,
              jobId: inputs.jobId,
              projectId: inputs.projectId,
              filter,
              createdBy: inputs.userId,
              updatedBy: inputs.userId,
            };

            const expectedAddFileArgs = {
              fileData,
              isAsyncDownload,
            }

            const payload = {
              jobId: fileData.jobId,
              projectId: fileData.projectId,
              filter,
            };

            const serviceEndpointUrl = 'https://dev-da-evt-process-file-download-ymghawfbjq-uc.a.run.app';

            const expectedEnqueueArgs = {
              payload,
              serviceEndpointUrl,
            }

            const actualAddFileFirstArgs = taskServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = taskServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = taskServiceAddFile.getCall(0).args.length;

            const actualEnqueueFirstArgs = taskServiceEnqueue.getCall(0).args[0];
            const actualEnqueueSecondArgs = taskServiceEnqueue.getCall(0).args[1];
            const actualEnqueueArgsLength = taskServiceEnqueue.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);
            
            expect(actualAddFileFirstArgs).to.deep.equal(expectedAddFileArgs.fileData, 'Expected value not pass in add file function');
            expect(actualAddFileSecondArgs).to.deep.equal(expectedAddFileArgs.isAsyncDownload, 'Expected value not pass in add file function');
            expect(actualAddFileArgsLength).to.deep.equal(Object.keys(expectedAddFileArgs).length, 'Expected value not pass in add file function');

            expect(actualEnqueueFirstArgs).to.deep.equal(expectedEnqueueArgs.payload, 'Expected value not pass in enqueue function');
            expect(actualEnqueueSecondArgs).to.deep.equal(expectedEnqueueArgs.serviceEndpointUrl, 'Expected value not pass in enqueue function');
            expect(actualEnqueueArgsLength).to.deep.equal(Object.keys(expectedEnqueueArgs).length, 'Expected value not pass in enqueue function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while adding file', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        taskServiceAddFile.throws(new Error('Something went wrong'));

        taskServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.taskExporter.returns('Exported Records Successfully');

        // Act
        taskService.downloadAllTask(inputs, filter, writableStream, isAsyncDownload)
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

      it('Should throw error when something internally fails while enqueueing task for async download', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        taskServiceAddFile.returns('Added File Successfully');

        taskServiceEnqueue.throws(new Error('Something went wrong'));

        downloadServiceRepo.taskExporter.returns('Exported Records Successfully');

        // Act
        taskService.downloadAllTask(inputs, filter, writableStream, isAsyncDownload)
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

      it('Should throw error when something internally fails while tasks exports for sync download', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        taskServiceAddFile.returns('Added File Successfully');

        taskServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.taskExporter.throws(new Error('Something went wrong'));

        // Act
        taskService.downloadAllTask(inputs, filter, writableStream, isAsyncDownload)
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

describe('#tasksService - updateJobStatus', function () {
  beforeEach(function () {
    taskServiceUpdateJobStatus = sinon.stub(Job, 'update');
  });
  afterEach(function () {
    taskServiceUpdateJobStatus.restore();
  });
  describe('Update job status', function(){
    context('Update status based on job result', function(){
      it('Should update job status correctly', function (done) {
        const jobId = '01';
        const status = 'Processed';

        taskServiceUpdateJobStatus.returns('Job Updated Successfully');

        taskService.updateJobStatus(jobId, status)
        .then(function (result) {
          // Assert
          const expectedMsg = 'Job Updated Successfully';
          const actualMsg = result;

          const expectedUpdatedJobStatusArgs = {
            jobObj: {
              status,
            },
            whereObj: {
              where: {
                id: jobId,
              },
            },
          };

          expect(actualMsg).to.equal(expectedMsg);

          const actualUpdatedJobStatusFirstArgs = taskServiceUpdateJobStatus.getCall(0).args[0];
          const actualUpdatedJobStatusSecondArgs = taskServiceUpdateJobStatus.getCall(0).args[1];
          const actualUpdatedJobStatusArgsLength = taskServiceUpdateJobStatus.getCall(0).args.length;

          expect(inspect(actualUpdatedJobStatusFirstArgs, { depth: null })).to.deep.equal(inspect(expectedUpdatedJobStatusArgs.jobObj, { depth: null }), 'Expected value not pass in job update function');
          expect(inspect(actualUpdatedJobStatusSecondArgs, { depth: null })).to.deep.equal(inspect(expectedUpdatedJobStatusArgs.whereObj, { depth: null }), 'Expected value not pass in job update function');
          expect(actualUpdatedJobStatusArgsLength).to.equal(Object.keys(expectedUpdatedJobStatusArgs).length, 'Expected value not pass in job update function');

          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it('Should throw error when something internally fails while updating job', function (done) {
        //Arrange
        const jobId = '01';
        const status = 'Processed';

        taskServiceUpdateJobStatus.throws(new Error('Something went wrong'));

        // Act
        taskService.updateJobStatus(jobId, status)
          .then(function (result) {
            const actual = result;
            const expected = undefined;

            expect(actual).to.equal(expected);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#tasksService - getFileIsLarger', () => {
  beforeEach(function () {
    tasksCountMaxRecords = sinon.stub(Task, 'count');
  });
  afterEach(function () {
    tasksCountMaxRecords.restore();
  });
  describe('Check the size of records for download process selection', () => {
    context('Check the size of the requested payload with the maximum records downloadable with synchronous process', () => {
      it('Should return "true" when requested payload size is greater than maximum records', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {};

        tasksCountMaxRecords.returns(200);

        // Act
        taskService.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function (result) {
            // Assert
            const actualValue = result;
            const expectedValue = true;

            expect(actualValue).to.equal(expectedValue);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return "false" when requested payload size is less than maximum records', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 300;
        const filter = {};
        
        tasksCountMaxRecords.returns(200);

        // Act
        taskService.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function (result) {
            // Assert
            const actualValue = result;
            const expectedValue = false;

            expect(actualValue).to.equal(expectedValue);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {};

        tasksCountMaxRecords.throws(new Error('Something went wrong'));

        // Act
        taskService.getFileIsLarger(projectId, filter, maximumRecords)
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

    context('Validate contact count data query', () => {
      it('Should verify if query payload is valid without any filters', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {};

        tasksCountMaxRecords.returns(200);

        const where = {};
        where.ProjectId = "01";
        where.status = {
          [Op.ne]: 'In-Active',
        };

        const contactFilter = null;

        // Act
        taskService.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function () {
            // Assert
            const expectedTasksCountMaxRecordsArgs = {
              where: [where],
              include: [
                {
                  model: Account,
                },
                {
                  model: User,
                  required: true,
                },
                {
                  model: Contact,
                  where: contactFilter,
                },
              ],
            };

            const actualTasksCountMaxRecordsArgs = tasksCountMaxRecords.getCall(0).args[0];
            expect(inspect(actualTasksCountMaxRecordsArgs.include, { depth: null })).to.deep.equal(inspect(expectedTasksCountMaxRecordsArgs.include, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualTasksCountMaxRecordsArgs.where, { depth: null })).to.deep.equal(inspect(expectedTasksCountMaxRecordsArgs.where, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(Object.keys(actualTasksCountMaxRecordsArgs).length).to.deep.equal(Object.keys(expectedTasksCountMaxRecordsArgs).length, 'Expected value not pass in account count for maximum records function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should verify if query payload is valid with "stage" filter', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {
          contactStage: {
            value: "compliance",
            operator: "=",
          }
        };

        tasksCountMaxRecords.returns(200);

        const where = {};
        where.ProjectId = "01";
        where.status = {
          [Op.ne]: 'In-Active',
        };

        const contactFilter = {};
        contactFilter.stage = "Compliance";

        // Act
        taskService.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function () {
            // Assert
            const expectedTasksCountMaxRecordsArgs = {
              where: [where],
              include: [
                {
                  model: Account,
                },
                {
                  model: User,
                  required: true,
                },
                {
                  model: Contact,
                  where: contactFilter,
                },
              ],
            };

            const actualTasksCountMaxRecordsArgs = tasksCountMaxRecords.getCall(0).args[0];
            expect(inspect(actualTasksCountMaxRecordsArgs.include, { depth: null })).to.deep.equal(inspect(expectedTasksCountMaxRecordsArgs.include, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualTasksCountMaxRecordsArgs.where, { depth: null })).to.deep.equal(inspect(expectedTasksCountMaxRecordsArgs.where, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(Object.keys(actualTasksCountMaxRecordsArgs).length).to.deep.equal(Object.keys(expectedTasksCountMaxRecordsArgs).length, 'Expected value not pass in account count for maximum records function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should verify if query payload is valid with "complianceStatus" filter', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {
          contactComplianceStatus: {
            value: "non-compliant",
            operator: "=",
          }
        };

        tasksCountMaxRecords.returns(200);

        const where = {};
        where.ProjectId = "01";
        where.status = {
          [Op.ne]: 'In-Active',
        };

        const COMPLIANCE_STATUS = {
          COMPLIANT: ['Compliant'],
          NON_COMPLIANT: [
            'Duplicate Contact',
            'Account Suppression',
            'Contact Suppression',
            'Bounce Email',
            'Title',
            'Missing Info',
            'Excess Contact',
            'Location',
            'Employee Range',
            'Revenue Range',
            'Industry Error',
            'QC Delete',
            'Other Error',
          ],
        };

        const contactFilter = {};
        contactFilter.complianceStatus = {
          [Op.in]: COMPLIANCE_STATUS.NON_COMPLIANT,
        };

        // Act
        taskService.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function () {
            // Assert
            const expectedTasksCountMaxRecordsArgs = {
              where: [where],
              include: [
                {
                  model: Account,
                },
                {
                  model: User,
                  required: true,
                },
                {
                  model: Contact,
                  where: contactFilter,
                },
              ],
            };

            const actualTasksCountMaxRecordsArgs = tasksCountMaxRecords.getCall(0).args[0];
            expect(inspect(actualTasksCountMaxRecordsArgs.include, { depth: null })).to.deep.equal(inspect(expectedTasksCountMaxRecordsArgs.include, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualTasksCountMaxRecordsArgs.where, { depth: null })).to.deep.equal(inspect(expectedTasksCountMaxRecordsArgs.where, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(Object.keys(actualTasksCountMaxRecordsArgs).length).to.deep.equal(Object.keys(expectedTasksCountMaxRecordsArgs).length, 'Expected value not pass in account count for maximum records function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      before(function () {
        const filterWhere = {};
        filterWhere.ProjectId = "01";
        filterWhere.status = {
          [Op.ne]: 'In-Active',
        };
        filterWhere['$Accounts.potential$'] = "0";
        filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(filterWhere);
      });
      it('Should verify if query payload is valid with filters other than "complianceStatus" and "stage"', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {
          potential: {
            value: "0",
            operator: "=",
          }
        };

        tasksCountMaxRecords.returns(200);

        const where = {};
        where.ProjectId = "01";
        where.status = {
          [Op.ne]: 'In-Active',
        };
        where['$Accounts.potential$'] = "0";

        const contactFilter = null;

        // Act
        taskService.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function () {
            // Assert
            const expectedTasksCountMaxRecordsArgs = {
              where: [where],
              include: [
                {
                  model: Account,
                },
                {
                  model: User,
                  required: true,
                },
                {
                  model: Contact,
                  where: contactFilter,
                },
              ],
            };

            const filterColumnsMapping = {
              taskCreatedDate: `createdAt`,
              taskUpdatedDate: `updatedAt`,
              accountName: `$Accounts.name$`,
              contactEmail: `$Contacts.email$`,
              userName: `$User.userName$`,
              accountDisposition: `$Accounts->TaskLink.disposition$`,
              contactDisposition: `$Contacts->TaskLink.disposition$`,
              accountFinalDisposition: `$Accounts.disposition$`,
              potential: `$Accounts.potential$`,
            };

            const actualWhere = Object.assign({}, where);
            delete actualWhere['$Accounts.potential$'];

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              actualWhere,
            }

            const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.actualWhere, { depth: null }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

            const actualTasksCountMaxRecordsArgs = tasksCountMaxRecords.getCall(0).args[0];
            expect(inspect(actualTasksCountMaxRecordsArgs.include, { depth: null })).to.deep.equal(inspect(expectedTasksCountMaxRecordsArgs.include, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualTasksCountMaxRecordsArgs.where, { depth: null })).to.deep.equal(inspect(expectedTasksCountMaxRecordsArgs.where, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(Object.keys(actualTasksCountMaxRecordsArgs).length).to.deep.equal(Object.keys(expectedTasksCountMaxRecordsArgs).length, 'Expected value not pass in account count for maximum records function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        filterHandlerInstanceStub.buildWhereClause = sinon.stub();
      })
    });
  });
});

describe('#tasksService - enqueue', function () {
  describe('Enqueue task in the queue', function () {
    context('Adds the task to the queue for process', function () {
      before(function () {
        cloudTasksClientStub = sinon.stub(CloudTasksClient.prototype, "createTask").returns([{
          name: 'task1'
        }]);
      });
      it('Should enqueue task when correct params are passed', function (done) {
        const payload = {
          jobId: '01', 
          projectId: '01',
          filter: {},
        }
        const serviceEndpointUrl = 'https://dev-da-evt-process-file-download-ymghawfbjq-uc.a.run.app';

        taskService.enqueue(payload, serviceEndpointUrl)
        .then(function (result){
          const actual = result;
          const expected = undefined;

          const task = {
            httpRequest: {
              httpMethod: 'POST',
              url: 'https://dev-da-evt-process-file-download-ymghawfbjq-uc.a.run.app',
            },
          };
          task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString(
            'base64',
          );
          task.httpRequest.headers = {
            'Content-Type': 'application/json',
          };
          task.httpRequest.oidcToken = {
            serviceAccountEmail: 'trigger-na0xhcju@da-tf-project-1-1b0f.iam.gserviceaccount.com',
          };

          const expectedRequest = {
            parent: 'projects/da-tf-project-1-1b0f/locations/us-central1/queues/da-dev-task-queue',
            task,
          };

          const actualCloudTaskLinkCreateTaskArgs = cloudTasksClientStub.getCall(0).args[0];
          const actualCloudTaskLinkCreateTaskArgsLength = Object.keys(cloudTasksClientStub.getCall(0).args[0]).length;

          expect(actual).to.equal(expected);
          expect(actualCloudTaskLinkCreateTaskArgs.parent).to.equal(expectedRequest.parent, 'Expected value not pass in cloud task link create task function');
          expect(actualCloudTaskLinkCreateTaskArgs.task).to.deep.equal(expectedRequest.task, 'Expected value not pass in cloud task link create task function');
          expect(actualCloudTaskLinkCreateTaskArgsLength).to.equal(Object.keys(expectedRequest).length, 'Expected value not pass in cloud task link create task function');
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
      after(function () {
        cloudTasksClientStub.restore();
      });
    });

    context('Adds the task to the queue for process', function () {
      before(function () {
        cloudTasksClientStub = sinon.stub(CloudTasksClient.prototype, "createTask").throws(new Error('Something went wrong'));
      });
      it('Should throw error when something internally fails while enqueueing task', function (done) {
        const payload = {
          jobId: '01', 
          projectId: '01',
          filter: {},
        }
        const serviceEndpointUrl = 'https://dev-da-evt-process-file-download-ymghawfbjq-uc.a.run.app';

        taskService.enqueue(payload, serviceEndpointUrl)
        .then(function (result){
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function (err) {
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
      after(function () {
        cloudTasksClientStub.restore();
      });
    });
  });
});

describe('#tasksService - getAllTaskForManager', function() {
  beforeEach(function () {
    const taskFindAndCountAllWhere = {};
    taskFindAndCountAllWhere.ProjectId = "01";
    taskFindAndCountAllWhere.status = {
      [Op.ne]: 'In-Active',
    };
    filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(taskFindAndCountAllWhere);
    sortHandlerInstanceStub.buildOrderClause = sinon.stub().returns([]);
    tasksFindAndCountAll = sinon.stub(Task, 'findAndCountAll');
  });
  afterEach(function () {
    filterHandlerInstanceStub.buildWhereClause = sinon.stub();
    sortHandlerInstanceStub.buildOrderClause = sinon.stub();
    tasksFindAndCountAll.restore();
  });
  describe('Get tasks list with total count of tasks', function() {
    context('Get tasks and its total counts', function() {
      it('Should return tasks and total count', function(done) {
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        tasksFindAndCountAll.returns({
          count: 0,
          rows: [],
        });

        taskService.getAllTaskForManager(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              totalCount: 0,
              docs: [],
            };
            const where = {};
            where.ProjectId = "01";
            where.status = {
              [Op.ne]: 'In-Active',
            };

            const filterColumnsMapping = {
              taskCreatedDate: `createdAt`,
              taskUpdatedDate: `updatedAt`,
              accountName: `$Accounts.name$`,
              contactEmail: `$Contacts.email$`,
              userName: `$User.userName$`,
              accountDisposition: `$Accounts->TaskLink.disposition$`,
              contactDisposition: `$Contacts->TaskLink.disposition$`,
              accountFinalDisposition: `$Accounts.disposition$`,
              potential: `$Accounts.potential$`,
            };

            const sortColumnsMapping = {
              accountName: `"Accounts"."name"`,
              contactEmail: `"Contacts"."email"`,
              userName: `"User"."userName"`,
              accountDisposition: `"Accounts->TaskLink"."disposition"`,
              contactDisposition: `"Contacts->TaskLink"."disposition"`,
              accountFinalDisposition: `"Accounts"."disposition"`,
              potential: `"Accounts"."potential"`,
            };

            const customSortColumn = {
              priority: [
                'Overtime',
                'Lowest',
                'Low',
                'Medium',
                'Standard',
                'High',
                'Highest',
              ],
              status: ['In-Active', 'Pending', 'Working', 'Completed'],
            };

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where,
            }

            const order = [];

            const expectedBuildOrderClauseArgs = {
              sortColumnsMapping,
              customSortColumn,
              sort,
              order,
            }

            expect(actualData).to.deep.equal(expectedData);

            const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            const actualBuildOrderClauseFirstArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[0];
            const actualBuildOrderClauseSecondArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[1];
            const actualBuildOrderClauseThirdArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[2];
            const actualBuildOrderClauseFourthArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[3];
            const actualBuildOrderClauseArgsLength = sortHandlerInstanceStub.buildOrderClause.getCall(0).args.length;

            expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, { depth: null }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

            expect(actualBuildOrderClauseFirstArgs).to.deep.equal(expectedBuildOrderClauseArgs.sortColumnsMapping, 'Expected value not pass in build order clause function');
            expect(actualBuildOrderClauseSecondArgs).to.deep.equal(expectedBuildOrderClauseArgs.customSortColumn, 'Expected value not pass in build order clause function');
            expect(actualBuildOrderClauseThirdArgs).to.deep.equal(expectedBuildOrderClauseArgs.sort, 'Expected value not pass in build order clause function');
            expect(actualBuildOrderClauseFourthArgs).to.deep.equal(expectedBuildOrderClauseArgs.order, 'Expected value not pass in build order clause function');
            expect(actualBuildOrderClauseArgsLength).to.deep.equal(Object.keys(expectedBuildOrderClauseArgs).length, 'Expected value not pass in build order clause function');
            
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        tasksFindAndCountAll.throws(new Error('Something went wrong'));

        // Act
        taskService.getAllTaskForManager(inputs, filter, sort)
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

    context('Validate tasks find and count all data query', function() {
      it('Should verify if query payload is valid', function(done) {
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        tasksFindAndCountAll.returns({
          count: 0,
          rows: [],
        });

        const where = {};
        where.ProjectId = inputs.projectId;
        where.status = {
          [Op.ne]: 'In-Active',
        };

        const order = [['createdAt', 'asc']];

        taskService.getAllTaskForManager(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const expectedTasksFindAndCountAllArgs = {
              attributes: [
                'status',
                'priority',
                ['createdAt', 'taskCreatedDate'],
                ['updatedAt', 'taskUpdatedDate'],
                [Sequelize.col('Accounts.name'), 'accountName'],
                [Sequelize.col('Accounts.potential'), 'potential'],
                [Sequelize.col('Accounts.website'), 'website'],
                [Sequelize.col('Accounts.TaskLink.disposition'), 'accountDisposition'],
                [Sequelize.col('Contacts.TaskLink.disposition'), 'contactDisposition'],
                [Sequelize.col('Accounts.disposition'), 'accountFinalDisposition'],
                [Sequelize.col('Contacts.email'), 'contactEmail'],
                [Sequelize.col('User.userName'), 'userName'],
              ],
              include: [
                {
                  model: User,
                  attributes: [],
                  required: true,
                  where: [
                    {
                      '$Task.ProjectId$': inputs.projectId,
                    },
                    { '$Task.status$': where.status },
                  ],
                },
                {
                  model: Account,
                  attributes: [],
                  required: false,
                  where: [
                    {
                      '$Task.ProjectId$': inputs.projectId,
                    },
                    { '$Task.status$': where.status },
                  ],
                  through: {
                    attributes: [],
                    where: [
                      {
                        linkType: 'input',
                      },
                    ],
                  },
                },
                {
                  model: Contact,
                  attributes: [],
                  required: false,
                  where: [
                    {
                      '$Task.ProjectId$': inputs.projectId,
                    },
                    { '$Task.status$': where.status },
                  ],
                  through: {
                    attributes: [],
                    where: [
                      {
                        linkType: 'input',
                      },
                    ],
                  },
                },
              ],
              where,
              order,
              raw: true,
              offset: 0,
              limit: 0,
              subQuery: false,
            };

            const actualTasksFindAndCountAllFirstArg = tasksFindAndCountAll.getCall(0).args[0];
            expect(inspect(actualTasksFindAndCountAllFirstArg.attributes, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.attributes, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.order, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.order, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.include, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.include, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.where, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.where, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.limit, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.limit, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.offset, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.offset, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.raw, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.raw, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.subQuery, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.subQuery, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(Object.keys(actualTasksFindAndCountAllFirstArg).length).to.deep.equal(Object.keys(expectedTasksFindAndCountAllArgs).length, 'Expected value not pass in tasks find all function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#tasksService - generateFileNameBasedOnFilter', function () {
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
    todayDateCheck = sinon.stub(taskService, 'isToday');
  });
  afterEach(function(){
    dateStub.restore();
    todayDateCheck.restore();
  });
  describe('Generate File name', function () {
    context('Returns file name based on filters passed', function () {
      it('Should return all tasks file name when no filter is applied', function(done) {
        const projectName = 'test';
        const filter = {};

        const actualFileName = taskService.generateFileNameBasedOnFilter(projectName, filter);
        const expectedFileName = `${projectName}_all_task_${new Date(Date.now())}.csv`;
        expect(actualFileName).to.equal(expectedFileName);
        done();
      });

      it('Should return today tasks file name when filter applied is data range todays date', function(done) {
        const projectName = 'test';
        const filter = {
          updatedAt: { value: ['2022-02-02', '2022-02-02'], operator: ['between'] }
        };

        todayDateCheck.returns(true);

        const actualFileName = taskService.generateFileNameBasedOnFilter(projectName, filter);
        const expectedFileName = `${projectName}_today_task_${new Date(Date.now())}.csv`;
        expect(actualFileName).to.equal(expectedFileName);
        done();
      });

      it('Should return compliance tasks file name when filter applied is stage as compliance', function(done) {
        const projectName = 'test';
        const filter = {
          contactStage: { value: 'compliance', operator: ['='] }
        };

        const actualFileName = taskService.generateFileNameBasedOnFilter(projectName, filter);
        const expectedFileName = `${projectName}_compliance_task_${new Date(Date.now())}.csv`;
        expect(actualFileName).to.equal(expectedFileName);
        done();
      });

      it('Should return non-compliant tasks file name when filter applied is compliance status as non-compliant', function(done) {
        const projectName = 'test';
        const filter = {
          contactComplianceStatus: { value: 'non-compliant', operator: ['='] }
        };

        const actualFileName = taskService.generateFileNameBasedOnFilter(projectName, filter);
        const expectedFileName = `${projectName}_non_compliant_task_${new Date(Date.now())}.csv`;
        expect(actualFileName).to.equal(expectedFileName);
        done();
      });

      it('Should return filtered tasks file name when filter applied is other than "updatedAt" todays date, "contactStage" as compliance and "contactComplianceStatus" as non-compliant', function(done) {
        const projectName = 'test';
        const filter = {
          potential: { value: "0", operator: ['='] }
        };

        const actualFileName = taskService.generateFileNameBasedOnFilter(projectName, filter);
        const expectedFileName = `${projectName}_filtered_task_${new Date(Date.now())}.csv`;
        expect(actualFileName).to.equal(expectedFileName);
        done();
      });
    });
  });
});

describe('#tasksService - getAllTaskForAgent', function (){
  beforeEach(function () {
    getTaskStats = sinon.stub(taskService, 'getTaskStats');
    buildOrderClause = sinon.stub(taskService, 'buildOrderClause');
    buildWhereClause = sinon.stub(taskService, 'buildWhereClause');
    fetchAllTask = sinon.stub(taskService, 'fetchAllTask');
  });
  this.afterEach(function () {
    getTaskStats.restore();
    buildOrderClause.restore();
    buildWhereClause.restore();
    fetchAllTask.restore();
  });
  describe('Get tasks list for agent', function () {
    context('Get tasks and its total counts', function () {
      it('Should return tasks and total counts When count only option is disabled', function(done) {
        const inputs = {
          limit: 0,
          offset: 0,
          projectId: '01',
          userId: '01',
          countOnly: false
        };
        const filter = {};
        const sort = {};

        getTaskStats.returns([{
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
        ]);

        buildOrderClause.returns([['updatedAt', 'desc']]);

        buildWhereClause.returns([{}, {}]);

        fetchAllTask.returns({
          docs: [],
          totalCount: 0,
        });

        taskService.getAllTaskForAgent(inputs, filter, sort)
        .then(function (result) {
          // Assert
          const actualData = result;
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
              },
            ],
          };

          const stateInput = {};
          stateInput.projectId =  inputs.projectId;
          stateInput.userId =  inputs.userId;
          stateInput.priority =  filter.priority;

          const accountFilter = {};

          const expectedGetTaskStatsArgs = {
            stateInput,
            accountFilter,
          }
          
          expect(actualData).to.deep.equal(expectedData);

          const actualGettaskStatsFirstArgs = getTaskStats.getCall(0).args[0];
          const actualGettaskStatsSecondArgs = getTaskStats.getCall(0).args[1];
          const actualGettaskStatsArgsLength = getTaskStats.getCall(0).args;

          expect(actualGettaskStatsFirstArgs).to.deep.equal(expectedGetTaskStatsArgs.stateInput, 'Expected value not pass in get task stats function');
          expect(actualGettaskStatsSecondArgs).to.deep.equal(expectedGetTaskStatsArgs.accountFilter, 'Expected value not pass in get task stats function');
          expect(Object.keys(actualGettaskStatsArgsLength).length).to.deep.equal(Object.keys(actualGettaskStatsArgsLength).length, 'Expected value not pass in get task stats function');

          const expectedbuildOrderClauseArgs = {
            sort,
          };

          const actualBuildOrderClauseFirstArgs = buildOrderClause.getCall(0).args[0];
          const actualBuildOrderClauseArgsLength = buildOrderClause.getCall(0).args.length;

          expect(actualBuildOrderClauseFirstArgs).to.deep.equal(expectedbuildOrderClauseArgs.sort, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseArgsLength).to.deep.equal(Object.keys(expectedbuildOrderClauseArgs).length, 'Expected value not pass in build order clause function');

          const userRole = 'agent';

          const expectedbuildWhereClauseArgs = {
            filter,
            userRole,
          };

          const actualBuildWhereClauseFirstArgs = buildWhereClause.getCall(0).args[0];
          const actualBuildWhereClauseSecondArgs = buildWhereClause.getCall(0).args[1];
          const actualBuildWhereClauseArgsLength = buildWhereClause.getCall(0).args;

          expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedbuildWhereClauseArgs.filter, { depth: null }), 'Expected value not pass in build where clause function');
          expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedbuildWhereClauseArgs.userRole, { depth: null }), 'Expected value not pass in build where clause function');
          expect(Object.keys(actualBuildWhereClauseArgsLength).length).to.deep.equal(Object.keys(expectedbuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

          const where = {};
          where.ProjectId = inputs.projectId;
          where.UserId = inputs.userId;
          where.status = {
            [Op.ne]: 'In-Active',
          };

          const projectWhere = { id: inputs.projectId };

          const order = [['updatedAt', 'desc']];

          const expectedfetchAllTaskArgs = {
            where,
            order,
            offset: inputs.offset,
            limit: inputs.limit,
            projectWhere,
            accountFilter,
          }

          const actualfetchAllTasksFirstArgs = fetchAllTask.getCall(0).args[0];
          const actualfetchAllTasksSecondArgs = fetchAllTask.getCall(0).args[1];
          const actualfetchAllTasksThirdArgs = fetchAllTask.getCall(0).args[2];
          const actualfetchAllTasksFourthArgs = fetchAllTask.getCall(0).args[3];
          const actualfetchAllTasksFifthArgs = fetchAllTask.getCall(0).args[4];
          const actualfetchAllTasksSixthArgs = fetchAllTask.getCall(0).args[5];
          const actualfetchAllTasksArgsLength = fetchAllTask.getCall(0).args.length;

          expect(inspect(actualfetchAllTasksFirstArgs, { depth: null })).to.deep.equal(inspect(expectedfetchAllTaskArgs.where, { depth: null }), 'Expected value not pass in fetch all tasks function');
          expect(inspect(actualfetchAllTasksSecondArgs, { depth: null })).to.deep.equal(inspect(expectedfetchAllTaskArgs.order, { depth: null }), 'Expected value not pass in fetch all tasks function');
          expect(inspect(actualfetchAllTasksThirdArgs, { depth: null })).to.deep.equal(inspect(expectedfetchAllTaskArgs.offset, { depth: null }), 'Expected value not pass in fetch all tasks function');
          expect(inspect(actualfetchAllTasksFourthArgs, { depth: null })).to.deep.equal(inspect(expectedfetchAllTaskArgs.limit, { depth: null }), 'Expected value not pass in fetch all tasks function');
          expect(inspect(actualfetchAllTasksFifthArgs, { depth: null })).to.deep.equal(inspect(expectedfetchAllTaskArgs.projectWhere, { depth: null }), 'Expected value not pass in fetch all tasks function');
          expect(inspect(actualfetchAllTasksSixthArgs, { depth: null })).to.deep.equal(inspect(expectedfetchAllTaskArgs.accountFilter, { depth: null }), 'Expected value not pass in fetch all tasks function');
          expect(actualfetchAllTasksArgsLength).to.deep.equal(Object.keys(expectedfetchAllTaskArgs).length, 'Expected value not pass in fetch all tasks function');

          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it('Should return counts When count only option is enabled', function(done) {
        const inputs = {
          limit: 0,
          offset: 0,
          projectId: '01',
          userId: '01',
          countOnly: true,
        };
        const filter = {};
        const sort = {};

        getTaskStats.returns([{
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
        ]);

        taskService.getAllTaskForAgent(inputs, filter, sort)
        .then(function (result) {
          // Assert
          const actualData = result;
          const expectedData = [{
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

          const stateInput = {};
          stateInput.projectId =  inputs.projectId;
          stateInput.userId =  inputs.userId;
          stateInput.priority =  filter.priority;

          const accountFilter = {};

          const expectedGetTaskStatsArgs = {
            stateInput,
            accountFilter,
          }
          
          expect(actualData).to.deep.equal(expectedData);

          const actualGettaskStatsFirstArgs = getTaskStats.getCall(0).args[0];
          const actualGettaskStatsSecondArgs = getTaskStats.getCall(0).args[1];
          const actualGettaskStatsArgsLength = getTaskStats.getCall(0).args;

          expect(actualGettaskStatsFirstArgs).to.deep.equal(expectedGetTaskStatsArgs.stateInput, 'Expected value not pass in get task stats function');
          expect(actualGettaskStatsSecondArgs).to.deep.equal(expectedGetTaskStatsArgs.accountFilter, 'Expected value not pass in get task stats function');
          expect(Object.keys(actualGettaskStatsArgsLength).length).to.deep.equal(Object.keys(actualGettaskStatsArgsLength).length, 'Expected value not pass in get task stats function');

          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it('Should throw error when something internally fails while getting task stats', function(done) {
        const inputs = {
          limit: 0,
          offset: 0,
          projectId: '01',
          userId: '01',
          countOnly: true,
        };
        const filter = {};
        const sort = {};

        getTaskStats.throws(new Error('Something went wrong'));

        taskService.getAllTaskForAgent(inputs, filter, sort)
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

      it('Should throw error when something internally fails while getting tasks', function(done) {
        const inputs = {
          limit: 0,
          offset: 0,
          projectId: '01',
          userId: '01',
          countOnly: false,
        };
        const filter = {};
        const sort = {};

        getTaskStats.returns([{
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
        ]);

        buildOrderClause.returns([['updatedAt', 'desc']]);

        buildWhereClause.returns([{}, {}]);

        fetchAllTask.throws(new Error('Something went wrong'));

        taskService.getAllTaskForAgent(inputs, filter, sort)
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

      it('Should throw error when something internally fails while building order clause', function (done) {
        const inputs = {
          limit: 0,
          offset: 0,
          projectId: '01',
          userId: '01',
          countOnly: false,
        };
        const filter = {};
        const sort = {};

        getTaskStats.returns([{
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
        ]);

        buildOrderClause.throws(new Error('Something went wrong'));

        taskService.getAllTaskForAgent(inputs, filter, sort)
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

      it('Should throw error when something internally fails while building where clause', function(done) {
        const inputs = {
          limit: 0,
          offset: 0,
          projectId: '01',
          userId: '01',
          countOnly: false,
        };
        const filter = {};
        const sort = {};

        getTaskStats.returns([{
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
        ]);

        buildOrderClause.returns([['updatedAt', 'desc']]);

        buildWhereClause.throws(new Error('Something went wrong'));

        taskService.getAllTaskForAgent(inputs, filter, sort)
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
})

describe('#tasksService - getTaskStats', function () {
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
    tasksCount = sinon.stub(Task, 'count');
  });
  afterEach(function () {
    dateStub.restore();
    tasksCount.restore();
  });
  describe('Get tasks count', function () {
    context('Fetch tasks count for different status', function() {
      it('Should return tasks counts', function (done) {
        const inputs = {
          userId: '01',
          projectId: '01',
          priority: 'Standard',
        };
        const accountWhere = {};

        let todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);

        const totalCountWhere = {
          status: {
            [Op.ne]: 'In-Active',
          },
          UserId: '01',
          ProjectId: '01',
          priority: 'Standard',
        };
        const completedCountWhere = {
          status: 'Completed',
          UserId: '01',
          ProjectId: '01',
          priority: 'Standard',
        };
        const upcomingCountWhere = {
          status: 'Pending',
          dueDate: {
            [Op.gte]: todayDate,
          },
          UserId: '01',
          ProjectId: '01',
          priority: 'Standard',
        };
        const overdueCountWhere = {
          status: 'Pending',
          dueDate: {
            [Op.lt]: todayDate,
          },
          UserId: '01',
          ProjectId: '01',
          priority: 'Standard',
        };
        const workingCountWhere = {
          status: 'Working',
          UserId: '01',
          ProjectId: '01',
          priority: 'Standard',
        };

        tasksCount.returns(0);

        taskService.getTaskStats(inputs, accountWhere)
        .then(function(result){
          const actualData = result;

          const expectedData = [{
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
          ]

          const include = [
            {
              model: Account,
              attributes: [],
              where: [accountWhere],
              through: {
                attributes: [],
                where: [
                  {
                    linkType: 'input',
                  },
                ],
              },
            },
            {
              model: Contact,
              attributes: [],
              through: {
                attributes: [],
                where: [
                  {
                    linkType: 'input',
                  },
                ],
              },
            },
          ];

          const expectedTaskCountFirstCallArgs = {
            where: [totalCountWhere],
            include,
          };

          const actualTaskCountFirstCallFirstArgs = tasksCount.getCall(0).args[0];

          expect(inspect(actualTaskCountFirstCallFirstArgs.where, { depth: null })).to.deep.equal(inspect(expectedTaskCountFirstCallArgs.where, { depth: null }), 'Expected value not pass in task count function');
          expect(inspect(actualTaskCountFirstCallFirstArgs.include, { depth: null })).to.deep.equal(inspect(expectedTaskCountFirstCallArgs.include, { depth: null }), 'Expected value not pass in task count function');
          expect(Object.keys(actualTaskCountFirstCallFirstArgs).length).to.deep.equal(Object.keys(expectedTaskCountFirstCallArgs).length, 'Expected value not pass in task count function');

          const expectedTaskCountSecondCallArgs = {
            where: [completedCountWhere],
            include,
          };

          const actualTaskCountSecondCallFirstArgs = tasksCount.getCall(1).args[0];

          expect(inspect(actualTaskCountSecondCallFirstArgs.where, { depth: null })).to.deep.equal(inspect(expectedTaskCountSecondCallArgs.where, { depth: null }), 'Expected value not pass in task count function');
          expect(inspect(actualTaskCountSecondCallFirstArgs.include, { depth: null })).to.deep.equal(inspect(expectedTaskCountSecondCallArgs.include, { depth: null }), 'Expected value not pass in task count function');
          expect(Object.keys(actualTaskCountSecondCallFirstArgs).length).to.deep.equal(Object.keys(expectedTaskCountSecondCallArgs).length, 'Expected value not pass in task count function');

          const expectedTaskCountThirdCallArgs = {
            where: [upcomingCountWhere],
            include,
          };

          const actualTaskCountThirdCallFirstArgs = tasksCount.getCall(2).args[0];

          expect(inspect(actualTaskCountThirdCallFirstArgs.where, { depth: null })).to.deep.equal(inspect(expectedTaskCountThirdCallArgs.where, { depth: null }), 'Expected value not pass in task count function');
          expect(inspect(actualTaskCountThirdCallFirstArgs.include, { depth: null })).to.deep.equal(inspect(expectedTaskCountThirdCallArgs.include, { depth: null }), 'Expected value not pass in task count function');
          expect(Object.keys(actualTaskCountThirdCallFirstArgs).length).to.deep.equal(Object.keys(expectedTaskCountThirdCallArgs).length, 'Expected value not pass in task count function');

          const expectedTaskCountFourthCallArgs = {
            where: [overdueCountWhere],
            include,
          };

          const actualTaskCountFourthCallFirstArgs = tasksCount.getCall(3).args[0];

          expect(inspect(actualTaskCountFourthCallFirstArgs.where, { depth: null })).to.deep.equal(inspect(expectedTaskCountFourthCallArgs.where, { depth: null }), 'Expected value not pass in task count function');
          expect(inspect(actualTaskCountFourthCallFirstArgs.include, { depth: null })).to.deep.equal(inspect(expectedTaskCountFourthCallArgs.include, { depth: null }), 'Expected value not pass in task count function');
          expect(Object.keys(actualTaskCountFourthCallFirstArgs).length).to.deep.equal(Object.keys(expectedTaskCountFourthCallArgs).length, 'Expected value not pass in task count function');

          const expectedTaskCountFifthCallArgs = {
            where: [workingCountWhere],
            include,
          };

          const actualTaskCountFifthCallFirstArgs = tasksCount.getCall(4).args[0];

          expect(inspect(actualTaskCountFifthCallFirstArgs.where, { depth: null })).to.deep.equal(inspect(expectedTaskCountFifthCallArgs.where, { depth: null }), 'Expected value not pass in task count function');
          expect(inspect(actualTaskCountFifthCallFirstArgs.include, { depth: null })).to.deep.equal(inspect(expectedTaskCountFifthCallArgs.include, { depth: null }), 'Expected value not pass in task count function');
          expect(Object.keys(actualTaskCountFifthCallFirstArgs).length).to.deep.equal(Object.keys(expectedTaskCountFifthCallArgs).length, 'Expected value not pass in task count function');

          expect(actualData).to.deep.equal(expectedData);

          done(); 
        })
        .catch(function(err){
          done(err);
        });
      });

      it('Should return tasks counts with upcoming, overdue and  working count as "0" when status is "Completed"', function (done) {
        const inputs = {
          userId: '01',
          projectId: '01',
          priority: 'Standard',
          status: 'Completed',
        };
        const accountWhere = {};

        let todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);

        tasksCount.returns(5);

        taskService.getTaskStats(inputs, accountWhere)
        .then(function(result){
          const actualData = result;

          const expectedData = [{
              status: 'Total',
              count: 5,
            },
            {
              status: 'Completed',
              count: 5,
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
          ]

          expect(actualData).to.deep.equal(expectedData);

          done(); 
        })
        .catch(function(err){
          done(err);
        });
      });

      it('Should return tasks counts with upcoming, overdue and  completed count as "0" when status is "Working"', function (done) {
        const inputs = {
          userId: '01',
          projectId: '01',
          priority: 'Standard',
          status: 'Working',
        };
        const accountWhere = {};

        let todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);

        tasksCount.returns(5);

        taskService.getTaskStats(inputs, accountWhere)
        .then(function(result){
          const actualData = result;

          const expectedData = [{
              status: 'Total',
              count: 5,
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
              count: 5,
            },
          ]

          expect(actualData).to.deep.equal(expectedData);

          done(); 
        })
        .catch(function(err){
          done(err);
        });
      });

      it('Should return tasks counts with working and  completed count as "0" when status is "Pending"', function (done) {
        const inputs = {
          userId: '01',
          projectId: '01',
          priority: 'Standard',
          status: 'Pending',
        };
        const accountWhere = {};

        let todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);

        tasksCount.onCall(0).returns(5);
        tasksCount.onCall(1).returns(5);
        tasksCount.onCall(2).returns(3);
        tasksCount.onCall(3).returns(2);
        tasksCount.onCall(1).returns(5);

        taskService.getTaskStats(inputs, accountWhere)
        .then(function(result){
          const actualData = result;

          const expectedData = [{
              status: 'Total',
              count: 5,
            },
            {
              status: 'Completed',
              count: 0,
            },
            {
              status: 'Overdue',
              count: 2,
            },
            {
              status: 'Upcoming',
              count: 3,
            },
            {
              status: 'Working',
              count: 0,
            },
          ]

          expect(actualData).to.deep.equal(expectedData);

          done(); 
        })
        .catch(function(err){
          done(err);
        });
      });

      it('Should throw error when something internally fails while getting counts', function(done) {
        const inputs = {
          userId: '01',
          projectId: '01',
          priority: 'Standard',
          status: 'Pending',
        };
        const accountWhere = {};

        let todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);

        tasksCount.throws(new Error('Something went wrong'));

        taskService.getTaskStats(inputs, accountWhere)
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
      
      it('Should call task count function only 5 times', function(done) {
        const inputs = {
          userId: '01',
          projectId: '01',
          priority: 'Standard',
          status: 'Pending',
        };
        const accountWhere = {};

        let todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);

        taskService.getTaskStats(inputs, accountWhere)
        .then(function (result) {
          expect(tasksCount.callCount).to.equal(5);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
    });
  });
});

describe('#tasksService - fetchAllTask', function() {
  beforeEach(function () {
    tasksFindAndCountAll = sinon.stub(Task, 'findAndCountAll');
  });
  afterEach(function () {
    tasksFindAndCountAll.restore();
  });
  describe('Get tasks list with total count of tasks', function() {
    context('Get tasks and its total counts', function() {
      it('Should return tasks and total count', function(done) {
        const where = {};
        const order = [];
        const offset = 0;
        const limit = 0;
        const projectWhere = {};
        const accountFilter = {};

        tasksFindAndCountAll.returns({
          count: 0,
          rows: [],
        });

        taskService.fetchAllTask(
          where,
          order,
          offset,
          limit,
          projectWhere,
          accountFilter,
        )
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              totalCount: 0,
              docs: [],
            };
            
            expect(actualData).to.deep.equal(expectedData);
            
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const where = {};
        const order = [];
        const offset = 0;
        const limit = 0;
        const projectWhere = {};
        const accountFilter = {};

        tasksFindAndCountAll.throws(new Error('Something went wrong'));

        // Act
        taskService.fetchAllTask(
          where,
          order,
          offset,
          limit,
          projectWhere,
          accountFilter,
        )
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

    context('Validate tasks find and count all data query', function() {
      it('Should verify if query payload is valid', function(done) {
        const where = {};
        const order = [];
        const offset = 0;
        const limit = 0;
        const projectWhere = {};
        const accountFilter = {};

        tasksFindAndCountAll.returns({
          count: 0,
          rows: [],
        });

        taskService.fetchAllTask(
          where,
          order,
          offset,
          limit,
          projectWhere,
          accountFilter,
        )
          .then(function (result) {
            // Assert
            const TASK_FIELDS = [
              'id',
              'description',
              'dueDate',
              'status',
              'priority',
              'completedDate',
              'createdAt',
              'updatedAt',
            ];
            const ACCOUNT_FIELDS = [
              'id',
              'name',
              'addressHQ',
              'phoneHQ',
              'website',
              'linkedInUrl',
              'industry',
              'revenue_M_B_K',
              'employeeSize',
              'revenue',
              'employeeSizeLI',
              'employeeSizeZ_plus',
              'employeeSourceZ_plus',
              'employeeSizeFinalBucket',
              'employeeSize_others',
              'email',
              'source',
              'disposition',
              'qualifiedContacts',
              'potential',
            ];
            
            const CONTACT_FIELDS = [
              'id',
              'researchStatus',
              'prefix',
              'firstName',
              'middleName',
              'lastName',
              'jobTitle',
              'jobLevel',
              'jobDepartment',
              'nsId',
              'directPhone',
              'mobile',
              'email',
              'zb',
              'gmailStatus',
              'source',
              'linkedInUrl',
              'screenshot',
              'disposition',
            ];
            const USER_FIELDS = ['id', 'firstName', 'lastName', 'userName'];
            const expectedTasksFindAndCountAllArgs = {
              attributes: TASK_FIELDS,
              include: [
                {
                  model: TaskType,
                  attributes: ['id', 'type'],
                },
                {
                  model: Project,
                  attributes: ['id', 'name'],
                  where: [projectWhere],
                },
                {
                  model: Account,
                  attributes: ACCOUNT_FIELDS,
                  where: [accountFilter],
                  through: {
                    attributes: ['disposition'],
                    where: [
                      {
                        linkType: 'input',
                      },
                    ],
                  },
                },
                {
                  model: Contact,
                  attributes: CONTACT_FIELDS,
                  through: {
                    attributes: ['disposition'],
                    where: [
                      {
                        linkType: 'input',
                      },
                    ],
                  },
                },
                {
                  model: User,
                  attributes: USER_FIELDS,
                },
              ],
              where: [where],
              order,
              offset,
              limit,
              subQuery: false,
            };

            const actualTasksFindAndCountAllFirstArg = tasksFindAndCountAll.getCall(0).args[0];
            expect(inspect(actualTasksFindAndCountAllFirstArg.attributes, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.attributes, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.order, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.order, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.include, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.include, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.where, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.where, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.limit, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.limit, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.offset, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.offset, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(inspect(actualTasksFindAndCountAllFirstArg.subQuery, { depth: null })).to.deep.equal(inspect(expectedTasksFindAndCountAllArgs.subQuery, { depth: null }), 'Expected value not pass in tasks find all function');
            expect(Object.keys(actualTasksFindAndCountAllFirstArg).length).to.deep.equal(Object.keys(expectedTasksFindAndCountAllArgs).length, 'Expected value not pass in tasks find all function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#tasksService - buildOrderClause', function (){
  context('Build order clause for sorting', function() {
    it('Should return default sort when no sorting is applied', function(done) {
      const sort  = {};

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [['updatedAt', 'desc']];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });

    it('Should return accountName sort when accountName sorting is applied', function(done) {
      const sort  = {
        accountName: 'desc'
      };

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [[Account, 'name', sort.accountName]];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });

    it('Should return accountWebsite sort when accountWebsite sorting is applied', function(done) {
      const sort  = {
        accountWebsite: 'desc'
      };

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [[Account, 'website', sort.accountWebsite]];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });

    it('Should return accountDisposition sort when accountDisposition sorting is applied', function(done) {
      const sort  = {
        accountDisposition: 'desc'
      };

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [[Account, 'disposition', sort.accountDisposition]];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });

    it('Should return qualifiedContacts sort when qualifiedContacts sorting is applied', function(done) {
      const sort  = {
        qualifiedContacts: 'desc'
      };

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [[Account, 'qualifiedContacts', sort.qualifiedContacts]];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });

    it('Should return potential sort when potential sorting is applied', function(done) {
      const sort  = {
        potential: 'desc'
      };

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [[Account, 'potential', sort.potential]];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });

    it('Should return taskCreatedAtDate sort when taskCreatedAtDate sorting is applied', function(done) {
      const sort  = {
        taskCreatedAtDate: 'desc'
      };

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [['createdAt', sort.taskCreatedAtDate]];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });

    it('Should return taskDueDate sort when taskDueDate sorting is applied', function(done) {
      const sort  = {
        taskDueDate: 'desc'
      };

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [['dueDate', sort.taskDueDate]];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });

    before(function() {
      customOrder = sinon.stub(taskService, 'customOrder');
    });
    it('Should return taskPriority sort when taskPriority sorting is applied', function(done) {
      const sort  = {
        taskPriority: 'desc'
      };

      customOrder.returns([Sequelize.literal(`CASE WHEN priority = 'Overtime' THEN '0' WHEN priority = 'Lowest' THEN '1' WHEN priority = 'Low' THEN '2' WHEN priority = 'Medium' THEN '3' WHEN priority = 'Standard' THEN '4' WHEN priority = 'High' THEN '5' WHEN priority = 'Highest' THEN '6' ELSE priority END`), sort.taskPriority])

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [[Sequelize.literal(`CASE WHEN priority = 'Overtime' THEN '0' WHEN priority = 'Lowest' THEN '1' WHEN priority = 'Low' THEN '2' WHEN priority = 'Medium' THEN '3' WHEN priority = 'Standard' THEN '4' WHEN priority = 'High' THEN '5' WHEN priority = 'Highest' THEN '6' ELSE priority END`), sort.taskPriority]];

      expect(inspect(actualData, { depth: null })).to.deep.equal(inspect(expectedData, { depth: null }));
      expect(actualData.length).to.equal(1);
      done();
    });
    after(function() {
      customOrder.restore();
    });

    it('Should return first sort when multiple fields sorting is applied', function(done) {
      const sort  = {
        taskDueDate: 'desc',
        taskCreatedAtDate: 'desc'
      };

      const actualData = taskService.buildOrderClause(sort);
      const expectedData = [['dueDate', sort.taskCreatedAtDate]];

      expect(actualData).to.deep.equal(expectedData);
      expect(actualData.length).to.equal(1);
      done();
    });
  });
})

describe('#tasksService - customOrder', function(){
  context('Generates ordering for fields with custom values', function(){
    it('Should return sort for fields with custom values', function(done) {
      const column = 'priority';
      const values = [
        'Overtime',
        'Lowest',
        'Low',
        'Medium',
        'Standard',
        'High',
        'Highest',
      ];
      const direction = 'asc';
      const actualData = taskService.customOrder(column, values, direction);
      const expectedData = [Sequelize.literal(`CASE WHEN priority = 'Overtime' THEN '0' WHEN priority = 'Lowest' THEN '1' WHEN priority = 'Low' THEN '2' WHEN priority = 'Medium' THEN '3' WHEN priority = 'Standard' THEN '4' WHEN priority = 'High' THEN '5' WHEN priority = 'Highest' THEN '6' ELSE priority END`), 'asc'];
      expect(inspect(actualData, { depth: null })).to.deep.equal(inspect(expectedData, { depth: null }));
      expect(actualData.length).to.equal(expectedData.length)
      done();
    });
  });
});

describe('#tasksService - buildWhereClause', function(){
  beforeEach(function () {
    buildWhereClauseForStatus = sinon.stub(taskService, 'buildWhereClauseForStatus');
  })
  afterEach(function () {
    buildWhereClauseForStatus.restore();
  })
  describe('Generates where clause', function (){
    context('Generates where obect based on filter properties', function () {
      it('Should return empty where object When no filter is provided', function(done){
        const filterProperty = {};
        const userRole = 'agent';
        const expectedData = [{}, {}];
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return empty where object When even filter is provided and no conditions fulfil', function(done){
        const filterProperty = {
          updatedAt: [],
        };
        const userRole = 'agent';
        const expectedData = [{}, {}];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);

        const actualBuildWhereClauseForStatusFirstArgs = buildWhereClauseForStatus.getCall(0).args[0];
        const actualBuildWhereClauseForStatusSecondArgs = buildWhereClauseForStatus.getCall(0).args[1];
        const actualBuildWhereClauseForStatusArgsLength = buildWhereClauseForStatus.getCall(0).args.length;

        const expectedBuildWhereClauseForStatusArgs = {
          filterProp: filterProperty.status,
          where: {}
        }

        expect(inspect(actualBuildWhereClauseForStatusFirstArgs, {depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseForStatusArgs.filterProp, { depth: null}), 'Expected value for build where clause for status not provided');
        expect(inspect(actualBuildWhereClauseForStatusSecondArgs, {depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseForStatusArgs.where, { depth: null}), 'Expected value for build where clause for status not provided');
        expect(actualBuildWhereClauseForStatusArgsLength).to.equal(Object.keys(expectedBuildWhereClauseForStatusArgs).length, 'Expected value for build where clause for status not provided');
        done();
      });

      it('Should return where object with updatedAt When updatedAt filter is provided for manager', function(done){
        const filterProperty = {
          updatedAt: ['2022-02-02', '2022-02-02'],
        };
        const userRole = 'manager';
        const whereClause = {};
        const startDate = new Date(filterProperty.updatedAt[0]).setHours(
          0,
          0,
          0,
          0,
        );
        const endDate = new Date(filterProperty.updatedAt[1]).setHours(
          23,
          59,
          59,
          999,
        );
        whereClause.updatedAt = {
          [Op.between]: [startDate, endDate],
        };
        const expectedData = [whereClause, {}];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return account where object with name When account name filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['account.name'] = 'account';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        filtersForAccount.name = Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('Accounts.name')),
          Op.eq,
          filterProperty['account.name'].toLowerCase(),
        );
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return account where object with website When account website filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['account.website'] = 'website';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        filtersForAccount.website = Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('Accounts.website')),
          Op.eq,
          filterProperty['account.website'].toLowerCase(),
        );
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return account where object with disposition When account disposition filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['account.disposition'] = 'disposition';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        filtersForAccount.disposition = Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('Accounts.disposition')),
          Op.eq,
          filterProperty['account.disposition'].toLowerCase(),
        );
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return account where object with employeeSize When account employeeSize filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['account.employeeSize'] = 'employeeSize';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        filtersForAccount.employeeSize = Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('Accounts.employeeSize')),
          Op.eq,
          filterProperty['account.employeeSize'].toLowerCase(),
        );
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return account where object with revenue When account revenue filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['account.revenue'] = 'revenue';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        filtersForAccount.revenue = Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('Accounts.revenue')),
          Op.eq,
          filterProperty['account.revenue'].toLowerCase(),
        );
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return account where object with qualifiedContacts When account qualifiedContacts filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['account.qualifiedContacts'] = 'qualifiedContacts';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        filtersForAccount.qualifiedContacts = filterProperty['account.qualifiedContacts'];
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return account where object with potential When account potential filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['account.potential'] = 'potential';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        filtersForAccount.potential = filterProperty['account.potential'];
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return where object with priority When task priority filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['task.priority'] = 'priority';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        whereClause.priority = Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('priority')),
          Op.eq,
          filterProperty['task.priority'].toLowerCase(),
        );
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should return where object with priority When taskType type filter is provided for agent', function(done){
        const filterProperty = {};
        filterProperty['taskType.type'] = 'type';
        const userRole = 'agent';
        const whereClause = {};
        const filtersForAccount = {};
        whereClause['$TaskType.type$'] = Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('TaskType.type')),
          Op.eq,
          filterProperty['taskType.type'].toLowerCase(),
        );
        const expectedData = [whereClause, filtersForAccount];
        buildWhereClauseForStatus.returns({});
        const actualData = taskService.buildWhereClause(filterProperty, userRole);
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        expect(actualData.length).to.equal(expectedData.length);
        done();
      });

      it('Should throw error when something internally fails while building where clause for status', function(done) {
        const filterProperty = {
          updatedAt: [],
        };
        const userRole = 'agent';
        buildWhereClauseForStatus.throws(new Error('Something went wrong'));
        try {
          taskService.buildWhereClause(filterProperty, userRole);
          const error = new Error('This function could not throw expected error');
          done(error);
        } catch (err) {
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;
          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        }
      });
    });
  });
});

describe('#tasksService - buildWhereClauseForStatus', function(){
  beforeEach(function(){
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
  })
  afterEach(function(){
    dateStub.restore();
  })
  describe('Generate status where clause', function() {
    context('Generate where object for the status filter', function(){
      it('Should return empty where object when the status is empty', function(done){
        const status = [];
        const where = {};
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });

      it('Should return where object for "completed" status when the status filter is "completed"', function(done){
        const status = ['completed'];
        const where = {};
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expectedData.status = {
          [Op.or]: ['Completed'],
        };
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });

      it('Should return where object for "working" status when the status filter is "working"', function(done){
        const status = ['working'];
        const where = {};
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expectedData.status = {
          [Op.or]: ['Working'],
        };
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });

      it('Should return where object for "pending" status when the status filter is "pending"', function(done){
        const status = ['pending'];
        const where = {};
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expectedData.status = {
          [Op.or]: ['Pending'],
        };
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });

      it('Should return where object for "overdue" status and dueDate when the status filter is "overdue"', function(done){
        const status = ['overdue'];
        const where = {};
        const todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expectedData.status = {
          [Op.or]: ['Pending'],
        };
        expectedData.dueDate = {
          [Op.lt]: todayDate,
        };
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });

      it('Should return where object for "upcoming" status and dueDate when the status filter is "upcoming"', function(done){
        const status = ['upcoming'];
        const where = {};
        const todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expectedData.status = {
          [Op.or]: ['Pending'],
        };
        expectedData.dueDate = {
          [Op.gte]: todayDate,
        };
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });

      it('Should return where object for "overdue" and "upcoming" status when the status filter are "overdue" and "upcoming"', function(done){
        const status = ['upcoming', 'overdue'];
        const where = {};
        const todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expectedData.status = {
          [Op.or]: ['Pending'],
        };
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });

      it('Should return where object for multiple status when the status filter are multiple', function(done){
        const status = ['upcoming', 'overdue', 'completed', 'working'];
        const where = {};
        const todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expectedData.status = {
          [Op.or]: ['Completed', 'Working', 'Pending'],
        };
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });

      it('Should return where object with empty array value when the status filter is other than "upcoming", "overdue", "completed" and "working"', function(done){
        const status = ['abc'];
        const where = {};
        const todayDate = new Date(Date.now());
        todayDate.setHours(0, 0, 0, 0);
        const actualData = taskService.buildWhereClauseForStatus(status, where);
        const expectedData = {};
        expectedData.status = {
          [Op.or]: [],
        };
        expect(inspect(actualData, {depth: null })).to.deep.equal(inspect(expectedData, { depth: null}));
        done();
      });
    });
  });
});