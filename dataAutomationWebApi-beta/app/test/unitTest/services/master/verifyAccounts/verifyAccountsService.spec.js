const {
  expect
} = require('chai');
const sinon = require('sinon');
const {
  CloudTasksClient
} = require('@google-cloud/tasks');
const proxyquire = require('proxyquire');
const {
  VerifyAccount, 
  File, 
  Job,
  Sequelize,
} = require('@nexsalesdev/master-data-model');

const {
  inspect
} = require('util');
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

const sortHandlerInstanceStub = {
  validate: sinon.stub(),
  buildOrderClause: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const sanitizerInstanceStub = {
  sanitize: sinon.stub,
}

const SanitizerService = sinon.stub().returns(sanitizerInstanceStub);

const VerifyAccountServiceModule = proxyquire(
  './../../../../../services/master/verifyAccounts/verifyAccountsService.js', {
    '../../../config/settings/settings-config': settingsConfig,
    '../../commonServices/sanitizer': SanitizerService,
    '@nexsalesdev/master-data-model/lib/services/sortHandler': SortHandlerStub,
  }
);
const verifyAccountServiceModule = new VerifyAccountServiceModule();
let accountServiceUpdateJobStatus, cloudTasksClientStub, dateStub, accountFileCreate, accountServiceAddFile, accountServiceEnqueue, accountFindAndCountAll, accountFindOne, findAccount, verifyAccountCreate, convertFormatAccount, createAccount;

describe('#verifyAccountsService - updateJobStatus', function () {
  beforeEach(function () {
    accountServiceUpdateJobStatus = sinon.stub(Job, 'update');
  });
  afterEach(function () {
    accountServiceUpdateJobStatus.restore();
  });
  describe('Update job status', function () {
    context('Update status based on job result', function () {
      it('Should update job status correctly', function (done) {
        const jobId = '01';
        const status = 'Processed';

        accountServiceUpdateJobStatus.returns('Job Updated Successfully');

        verifyAccountServiceModule.updateJobStatus(jobId, status)
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

            const actualUpdatedJobStatusFirstArgs = accountServiceUpdateJobStatus.getCall(0).args[0];
            const actualUpdatedJobStatusSecondArgs = accountServiceUpdateJobStatus.getCall(0).args[1];
            const actualUpdatedJobStatusArgsLength = accountServiceUpdateJobStatus.getCall(0).args.length;

            expect(inspect(actualUpdatedJobStatusFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedUpdatedJobStatusArgs.jobObj, {
              depth: null
            }), 'Expected value not pass in job update function');
            expect(inspect(actualUpdatedJobStatusSecondArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedUpdatedJobStatusArgs.whereObj, {
              depth: null
            }), 'Expected value not pass in job update function');
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

        accountServiceUpdateJobStatus.throws(new Error('Something went wrong'));

        // Act
        verifyAccountServiceModule.updateJobStatus(jobId, status)
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

describe('#verifyAccountsService - enqueue', function () {
  describe('Enqueue task in the queue', function () {
    context('Adds the task to the queue for process', function () {
      before(function () {
        cloudTasksClientStub = sinon.stub(CloudTasksClient.prototype, "createTask").returns([{
          name: 'task1'
        }]);
      });
      it('Should enqueue task when correct params are passed', function (done) {
        const jobId = '01';

        verifyAccountServiceModule.enqueue(jobId)
          .then(function (result) {
            const actual = result;
            const expected = undefined;

            const payload = {
              jobId,
            };

            const task = {
              httpRequest: {
                httpMethod: 'POST',
                url: 'https://dev-da-evt-process-file-download-ymghawfbjq-uc.a.run.app/master',
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
        const jobId = '01';

        verifyAccountServiceModule.enqueue(jobId)
          .then(function (result) {
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

describe('#verifyAccountsService - addFile', function () {
  const nowDate = Date.now();
  beforeEach(function () {
    dateStub = sinon.stub(Date, 'now').returns(nowDate);
    accountFileCreate = sinon.stub(File, 'create');
  });
  afterEach(function () {
    dateStub.restore();
    accountFileCreate.restore();
  });
  describe('Adds File to DB', function () {
    context('File creation in DB', function () {
      it('Should successfully create a file when all correct params are passed during async download', function (done) {
        //Arrange
        const fileData = {
          fileId: '01',
          fileName: 'unitTestFile',
          jobId: '01',
          createdBy: 'dev.pmgr1@nexsales.com',
        };

        const fileType = 'Export';
        const fileName = `${fileData.fileName}_${nowDate}.csv`;

        accountFileCreate.returns('File Created Successfully');

        // Act
        verifyAccountServiceModule.addFile(fileData)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: fileName,
                type: 'Export',
                format: '.csv',
                location: `files/master/${fileType}/${fileName}`,
                mapping: {},
                createdBy: fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Queued',
                  chunks: fileData.chunks,
                  operationName: 'asyncVerifyAccountExport',
                  operationParam: {},
                  processed: 0,
                  imported: 0,
                  errored: 0,
                  createdBy: fileData.createdBy,
                  rowCount: 0,
                  FileId: fileData.fileId,
                },
              },
              includeObject: {
                include: [{
                  model: Job,
                }, ],
              },
            }

            expect(actualMsg).to.equal(expectedMsg);

            const actualFileCreateFirstArgs = accountFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = accountFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = accountFileCreate.getCall(0).args.length;

            expect(inspect(actualFileCreateFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectFileCreateArgs.modelObj, {
              depth: null
            }), 'Expected value not pass in file create function');
            expect(inspect(actualFileCreateSecondArgs, {
              depth: null
            })).to.deep.equal(inspect(expectFileCreateArgs.includeObject, {
              depth: null
            }), 'Expected value not pass in file create function');
            expect(actualFileCreateArgsLength).to.equal(Object.keys(expectFileCreateArgs).length, 'Expected value not pass in file create function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while creating file in DB', function (done) {
        //Arrange
        const fileData = {
          fileId: '01',
          jobId: '01',
          createdBy: 'dev.pmgr1@nexsales.com',
        };

        accountFileCreate.throws(new Error('Something went wrong'));

        // Act
        verifyAccountServiceModule.addFile(fileData)
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

describe('#verifyAccountsService - downloadAllAccount', function () {
  beforeEach(function () {
    accountServiceAddFile = sinon.stub(verifyAccountServiceModule, 'addFile');
    accountServiceEnqueue = sinon.stub(verifyAccountServiceModule, 'enqueue');
  });
  afterEach(function () {
    accountServiceAddFile.restore();
    accountServiceEnqueue.restore();
  });
  describe('Downloads accounts or submits jobs for downloading accounts', function () {
    context('Process accounts download request', function () {
      it('Should correctly process and download accounts', function (done) {
        //Arrange
        const inputs = {
          fileId: '01',
          userProvidedFileName: 'testFile.csv',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        // Act
        verifyAccountServiceModule.downloadAllAccount(inputs)
          .then(function (result) {
            // Assert
            const actualMessage = result;
            const expectedMessage = 'Download Task Enqueued Successfully';

            const fileData = {
              fileId: inputs.fileId,
              fileName: inputs.userProvidedFileName,
              jobId: inputs.jobId,
              createdBy: inputs.userEmail,
              updatedBy: inputs.userEmail,
            };

            const expectedAddFileArgs = {
              fileData
            };

            const actualAddFileFirstArgs = accountServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = accountServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = accountServiceAddFile.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);

            expect(actualAddFileFirstArgs).to.deep.equal(expectedAddFileArgs.fileData, 'Expected value not pass in add file function');
            expect(actualAddFileSecondArgs).to.deep.equal(expectedAddFileArgs.isAsyncDownload, 'Expected value not pass in add file function');
            expect(actualAddFileArgsLength).to.deep.equal(Object.keys(expectedAddFileArgs).length, 'Expected value not pass in add file function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while adding file', function (done) {
        //Arrange
        const inputs = {
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        accountServiceAddFile.throws(new Error('Something went wrong'));

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        // Act
        verifyAccountServiceModule.downloadAllAccount(inputs)
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
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.throws(new Error('Something went wrong'));
        // Act
        verifyAccountServiceModule.downloadAllAccount(inputs)
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

describe('#verifyAccountsService - getAllAccount', function () {
  beforeEach(function () {
    sortHandlerInstanceStub.buildOrderClause = sinon.stub().returns([]);
    accountFindAndCountAll = sinon.stub(VerifyAccount, 'findAndCountAll');
  });
  afterEach(function () {
    sortHandlerInstanceStub.buildOrderClause = sinon.stub();
    accountFindAndCountAll.restore();
  });
  describe('Get verify accounts list with total count of accounts', function () {
    context('Get verify accounts and its total counts', function () {
      it('Should return verify accounts and total count', function (done) {
        const inputs = {
          limit: 0,
          offset: 0
        };
        const sort = {};

        accountFindAndCountAll.returns({
          count: 0,
          rows: []
        });

        verifyAccountServiceModule.getAllAccount(inputs, sort)
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
      it('Should throw error when something internally fails while finding verify account with its total count', function (done) {
        //Arrange
        const inputs = {
          limit: 0,
          offset: 0
        };
        const sort = {};

        accountFindAndCountAll.throws(new Error('Something went wrong'));

        // Act
        verifyAccountServiceModule.getAllAccount(inputs, sort)
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

    context('Validate verify account find and count all data query', function () {
      it('Should verify if query payload is valid', function (done) {
        const inputs = {
          limit: 0,
          offset: 0
        };
        const sort = {};

        accountFindAndCountAll.returns({
          count: 0,
          rows: []
        });

        const order = [
          ['name', 'ASC']
        ];

        verifyAccountServiceModule.getAllAccount(inputs, sort)
          .then(function (result) {
            // Assert
            const expectedAccountFindAllArgs = {
              attributes: [
                'name',
                'website',
                'employeeSize',
                'type',
                'industry',
                'updatedAt',
                'createdUserEmail',
              ],
              order,
              offset: inputs.offset,
              limit: inputs.limit,
              raw: true,
              subQuery: false,
            };

            const actualAccountFindAllFirstArg = accountFindAndCountAll.getCall(0).args[0];
            expect(inspect(actualAccountFindAllFirstArg.attributes, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.attributes, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.order, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.order, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.limit, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.limit, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.offset, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.offset, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.raw, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.raw, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.subQuery, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.subQuery, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(Object.keys(actualAccountFindAllFirstArg).length).to.deep.equal(Object.keys(expectedAccountFindAllArgs).length, 'Expected value not pass in accounts find and count all function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#verifyAccountsService - createAccount', function () {
  beforeEach(function () {
    findAccount = sinon.stub(verifyAccountServiceModule, 'findAccount');
    verifyAccountCreate = sinon.stub(VerifyAccount, 'create');
  });
  afterEach(function () {
    findAccount.restore();
    verifyAccountCreate.restore();
  });
  describe('Create or update a verify account based on findAccount result', function () {
    context('Upsert a verify account', function () {
      it('Should throw error when account is not passed', function (done) {
        verifyAccountServiceModule.createAccount()
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualData = {
            err: err.code,
            desc: err.message
          }
          const expectedData = {
            err: 'BAD_ACCOUNT_DATA',
            desc: 'Could Not Create Account, Account Is Missing'
          }
          expect(actualData).to.deep.equal(expectedData);
          done();
        })
        .catch(function (err) {
          done(err);
        })
      })

      it('Should throw error when find account internally fails', function (done) {
        findAccount.throws(new Error('Something went wrong'))
        verifyAccountServiceModule.createAccount({
          domain: 'nexsales.com'
        })
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualErrorMsg = err.message;
          const expectedErrMsg = 'Something went wrong'
          expect(actualErrorMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        })
      })

      it('Should create a new verify account when no existing verify account is found', function (done) {
        findAccount.returns(null)
        verifyAccountCreate.returns({
          domain: 'nexsales.com'
        })
        verifyAccountServiceModule.createAccount({
          domain: 'nexsales.com'
        })
        .then(function (result) {
          const actualData = result;
          const expectedData = {
            domain: 'nexsales.com'
          }
          expect(actualData).to.deep.equal(expectedData);

          const expectedVerifyCreateAccountArgs = [
            {
              domain: 'nexsales.com'
            }
          ]
          const actualVerifyAccountCreateArgs = verifyAccountCreate.getCall(0).args;
          expect(actualVerifyAccountCreateArgs[0]).to.deep.equal(expectedVerifyCreateAccountArgs[0], 'Expected value not passed in create verify account function');
          expect(actualVerifyAccountCreateArgs.length).to.equal(expectedVerifyCreateAccountArgs.length, 'Expected value not passed in create verify account function');
          done();
        })
        .catch(function (err) {
          done(err);
        })
      })

      it('Should throw error when something internally fails while creating a verify account', function (done) {
        findAccount.returns(null)
        verifyAccountCreate.throws(new Error('Something went wrong'))
        verifyAccountServiceModule.createAccount({
          domain: 'nexsales.com'
        })
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualErrorMsg = err.message;
          const expectedErrMsg = 'Something went wrong'
          expect(actualErrorMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        })
      })

      it('Should update verify account when existing verify account is found', function (done) {
        findAccount.returns({
          domain: 'nexsales.com',
          save: sinon.stub().returns('Saved Successfully'),
          changed: sinon.stub(),
        })
        verifyAccountServiceModule.createAccount({
          domain: 'nexsales.com'
        })
        .then(function (result) {
          const actualData = result;
          const expectedData = 'Saved Successfully'
          expect(actualData).to.equal(expectedData);
          done();
        })
        .catch(function (err) {
          done(err);
        })
      })

      it('Should throw error when something internally fails while saving verify account', function (done) {
        findAccount.returns({
          domain: 'nexsales.com',
          save: sinon.stub().throws(new Error('Something went wrong')),
          changed: sinon.stub(),
        })
        verifyAccountServiceModule.createAccount({
          domain: 'nexsales.com'
        })
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualErrorMsg = err.message;
          const expectedErrMsg = 'Something went wrong'
          expect(actualErrorMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        })
      })
    })
  })
});

describe('#verifyAccountsService - findAccount', function () {
  beforeEach(function () {
    accountFindOne = sinon.stub(VerifyAccount, 'findOne');
  });
  afterEach(function () {
    accountFindOne.restore();
  });
  describe('Fetch a verify account', function () {
    context('Get a verify account based on domain', function () {
      it('Should throw error when domain is not passed', function (done) {
        verifyAccountServiceModule.findAccount()
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualData = {
            err: err.code,
            desc: err.message
          }
          const expectedData = {
            err: 'BAD_ACCOUNT_ID',
            desc: 'domain is required'
          }
          expect(actualData).to.deep.equal(expectedData);
          done();
        })
        .catch(function (err) {
          done(err);
        })
      })

      it('Should throw error when something internally fails while finding a verify account', function(done) {
        const domain = 'nexsales.com';
        accountFindOne.throws(new Error('Something went wrong'));
        verifyAccountServiceModule.findAccount(domain)
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;
          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      })

      it('Should return a verify account when it is found', function(done) {
        const domain = 'nexsales.com';
        accountFindOne.returns({
          domain: 'nexsales.com'
        });
        verifyAccountServiceModule.findAccount(domain)
        .then(function (result) {
          const actualData = result;
          const expectedData = {
            domain: 'nexsales.com'
          }
          expect(actualData).to.deep.equal(expectedData);

          const actualaccountFindOneArgs = accountFindOne.getCall(0).args;
          const expectedaccountFindOneArgs = [{
            where: {
              domain: 'nexsales.com'
            }
          }]
          expect(inspect(actualaccountFindOneArgs[0], { depth: null })).to.deep.equal(inspect(expectedaccountFindOneArgs[0], { depth: null }), 'Expected value not pass in account find one function');
          expect(actualaccountFindOneArgs.length).to.equal(expectedaccountFindOneArgs.length, 'Expected value not pass in account find one function');
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it('Should return null when it is not found', function(done) {
        const domain = 'nexsales.com';
        accountFindOne.returns(null);
        verifyAccountServiceModule.findAccount(domain)
        .then(function (result) {
          const actualData = result;
          const expectedData = null;
          expect(actualData).to.deep.equal(expectedData);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
    })
  })
});

describe('#verifyAccountsService - saveAccount', function () {
  beforeEach(function () {
    sanitizerInstanceStub.sanitize = sinon.stub();
    convertFormatAccount = sinon.stub(verifyAccountServiceModule, 'convertFormatAccount');
    createAccount = sinon.stub(verifyAccountServiceModule, 'createAccount');
  });
  afterEach(function () {
    sanitizerInstanceStub.sanitize = sinon.stub();
    convertFormatAccount.restore();
    createAccount.restore();
  });
  describe('Save a verify account', function () {
    context('Save a verify account based on domain', function () {
      it('Should save a verify account successfully', function (done) {
        sanitizerInstanceStub.sanitize.returns({
          domain: 'nexsales.com'
        })
        convertFormatAccount.returns({
          domain: 'nexsales.com'
        })
        createAccount.returns({
          domain: 'nexsales.com'
        })
        const inputs = {
          account: {
            domain: 'nexsales.com'
          },
          userEmail: 'agent1@nexsales.com'
        }
        verifyAccountServiceModule.saveAccount(inputs)
        .then(function (result) {
          const actualData = result;
          const expectedData = {
            account: {
              domain: 'nexsales.com'
            },
            updateDate: false,
          }
          expect(actualData).to.deep.equal(expectedData);

          const expectedSanitizeAccountArgs = [{
            domain: 'nexsales.com'
          }]
          const actualSanitizedAccountArgs = sanitizerInstanceStub.sanitize.getCall(0).args;
          expect(actualSanitizedAccountArgs[0]).to.deep.equal(expectedSanitizeAccountArgs[0], 'Expected value not passed in sanitized function');
          expect(actualSanitizedAccountArgs.length).to.equal(expectedSanitizeAccountArgs.length, 'Expected value not passed in sanitized function');

          // const expectedConvertFormatAccountArgs = [{
          //   domain: 'nexsales.com'
          // }]
          // const actualConvertFormatAccountArgs = convertFormatAccount.getCall(0).args;
          // expect(actualConvertFormatAccountArgs[0]).to.deep.equal(expectedConvertFormatAccountArgs[0], 'Expected value not passed in convert format account function');
          // expect(actualConvertFormatAccountArgs.length).to.equal(expectedConvertFormatAccountArgs.length, 'Expected value not passed in convert format account function');

          const expectedCreateAccountArgs = [{
            domain: 'nexsales.com',
            createdUserEmail: 'agent1@nexsales.com'
          }]
          const actualCreateAccountArgs = createAccount.getCall(0).args;
          expect(actualCreateAccountArgs[0]).to.deep.equal(expectedCreateAccountArgs[0], 'Expected value not passed in create account function');
          expect(actualCreateAccountArgs.length).to.equal(expectedCreateAccountArgs.length, 'Expected value not passed in create account function');
          done();
        })
        .catch(function (err) {
          done(err);
        })
      })

      it('Should throw error when something internally fails while sanitizing', function (done) {
        sanitizerInstanceStub.sanitize.throws(new Error('Something went wrong'))
        convertFormatAccount.returns({
          domain: 'nexsales.com'
        })
        createAccount.returns({
          domain: 'nexsales.com'
        })
        const inputs = {
          account: {
            domain: 'nexsales.com'
          }
        }
        verifyAccountServiceModule.saveAccount(inputs)
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;
          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      })

      it('Should throw error when something internally fails while converting format', function (done) {
        sanitizerInstanceStub.sanitize.returns({
          domain: 'nexsales.com'
        })
        convertFormatAccount.throws(new Error('Something went wrong'))
        createAccount.returns({
          domain: 'nexsales.com'
        })
        const inputs = {
          account: {
            domain: 'nexsales.com'
          }
        }
        verifyAccountServiceModule.saveAccount(inputs)
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;
          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      })

      it('Should throw error when something internally fails while creating a verify account', function (done) {
        sanitizerInstanceStub.sanitize.returns({
          domain: 'nexsales.com'
        })
        convertFormatAccount.returns({
          domain: 'nexsales.com'
        })
        createAccount.throws(new Error('Something went wrong'))
        const inputs = {
          account: {
            domain: 'nexsales.com'
          }
        }
        verifyAccountServiceModule.saveAccount(inputs)
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;
          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      })
    })
  })
});

describe('#verifyAccountsService - convertFormatAccount', function () {
  context('Convert format of an account', function() {
    it ('Should covert format for various fields of an account' , function(done) {
      const account = {
        domain: 'nexsales.com',
        name: 'Nexsales',
        website: 'abc.com',
        type: 'Head Office',
        email: 'abc@nexsales.com',
        sicDescription: '',
        naicsDescription: '',
        industry: 'Manufacturing',
        subIndustry: '',
        description: '',
        liUrl: '',
        addressHQ: {
          address1HQ: 'Mumbai',
          address2HQ: '',
          cityHQ: 'Andheri',
          stateHQ: 'Maharashtra',
          zipCodeHQ: '396450',
          countryHQ: 'US',
        },
        phoneHQ: '8097896996',
        segment_technology: ['salesforce', 'zerobounce'],
        employeeSize: '10',
        employeeSizeLI: '10',
        employeeSizeZ_plus: '10',
        employeeSize_others: '10',
        revenue: '10000',
        sicCode: '100',
        naicsCode: '1010',
        disposition: 'Acquired/Merged/Subsidiary',
        comments: 'abc',
        parentWebsite: 'google.com',
        masterDisposition: "Active Account",
        masterUpdatedAt: "2022-09-30 11:28:42.815+00",
      }
      const expectedData = {
        name: 'Nexsales',
        website: 'abc.com',
        type: 'Head Office',
        domain: 'nexsales.com',
        email: 'abc@nexsales.com',
        sicDescription: '',
        naicsDescription: '',
        industry: 'Manufacturing',
        subIndustry: '',
        description: '',
        liUrl: undefined,
        location: {
          address1: 'Mumbai',
          address2: '',
          city: 'Andheri',
          state: 'Maharashtra',
          zipCode: '396450',
          country: 'US',
          phone1: '8097896996',
        },
        technology: [ 'salesforce', 'zerobounce' ],
        employeeSize: 10,
        employeeSizeLI: 10,
        employeeSizeZPlus: 10,
        employeeSizeOthers: 10,
        revenue: 10000,
        sicCode: 100,
        naicsCode: 1010,
        disposition: 'Acquired/Merged/Subsidiary',
        comments: 'abc',
        parentAccountDomain: 'google.com',
        masterDisposition: "Active Account",
        masterUpdatedAt: "2022-09-30 11:28:42.815+00",
      };

      const actualData = verifyAccountServiceModule.convertFormatAccount(account)
      expect(actualData).to.deep.equal(expectedData);
      done();

    })
  })
})