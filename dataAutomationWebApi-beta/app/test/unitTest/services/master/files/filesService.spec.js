const {
  expect
} = require('chai');
const sinon = require('sinon');

const { Storage } = require('@google-cloud/storage');

const proxyquire = require('proxyquire');
const {
  File,
  Job,
  FileChunk,
  sequelize,
} = require('@nexsalesdev/master-data-model');

const {
  inspect
} = require('util');

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const process = {
  env: {
    MASTER_GCLOUD_STORAGE_PROCESS_FILE_BUCKET: '',
  }
};

const FileServiceModule = proxyquire(
  './../../../../../services/master/files/filesService.js', {
    '../../../config/settings/settings-config': settingsConfig,
  }
);
const fileServiceModule = new FileServiceModule();
let getMasterFileById, fileMethodsStub, fileStub, bucketStub, deleteMasterFilesInfoFromDB, fileServiceFileFindOne, sequelizeQuery, jobDestroy, fileChunkDestroy, fileDestroy, dateStub, createMasterJobInDB, createMasterFileInDB, fileCreate, jobCreate;

describe('#fileService - deleteMasterFileById', function () {
  beforeEach(function () {
    getMasterFileById = sinon.stub(fileServiceModule, 'getMasterFileById');
    deleteMasterFilesInfoFromDB = sinon.stub(fileServiceModule, 'deleteMasterFilesInfoFromDB');
    fileMethodsStub = {
      exists: sinon.stub(),
      delete: sinon.stub(),
    };
    fileStub = sinon.stub().callsFake(() => {
      return fileMethodsStub
    });
    bucketStub = sinon.stub(Storage.prototype, "bucket").callsFake(() => {
      return {
        file: fileStub
      }
    });
  });
  afterEach(function () {
    getMasterFileById.restore();
    deleteMasterFilesInfoFromDB.restore();
    fileMethodsStub.exists = sinon.stub();
    fileMethodsStub.delete = sinon.stub();
    bucketStub.restore();
  });
  describe('Deleting a master file using File ID', function(){
    context('Check if errors are caught while deleting a master file from GCP as well as DB', function(){
      it('Should throw error when something internally fails while getting master file', function(done) {
        const inputs = {
          fileId: '01',
        }

        getMasterFileById.throws(new Error('Something went wrong'));

        fileServiceModule.deleteMasterFileById(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      });

      it('Should throw error when master file not get from DB', function(done) {
        const inputs = {
          fileId: '01',
        }

        getMasterFileById.returns(null);
        
        fileServiceModule.deleteMasterFileById(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `File With Id 01 Does not Exist`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      });

      it('Should throw error when something internally fails while deleting master file from DB', function(done) {
        const inputs = {
          fileId: '01',
        }

        getMasterFileById.returns({
          id: "01",
        })

        deleteMasterFilesInfoFromDB.throws(new Error('Something went wrong'));

        fileServiceModule.deleteMasterFileById(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      });

      it('Should throw error when Storage Bucket File Exists method fails while deleting a file', function (done) {
        const inputs = {
          fileId: '01',
        }

        getMasterFileById.returns({
          id: "01",
        });

        deleteMasterFilesInfoFromDB.returns('File Deleting Successfully');

        fileMethodsStub.exists.throws(new Error('Something went wrong'));

        fileServiceModule.deleteMasterFileById(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      });

      it('Should throw error when Storage Bucket File Delete method fails while deleting a file', function (done) {
        const inputs = {
          fileId: '01',
        }

        getMasterFileById.returns({
          id: "01",
        });

        deleteMasterFilesInfoFromDB.returns('File Deleting Successfully');

        fileMethodsStub.exists.returns([true]);
        fileMethodsStub.delete.throws(new Error('Something went wrong'));
        
        fileServiceModule.deleteMasterFileById(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      });
    });

    context('Check if a master file is deleted from GCP as well as DB', function(){
      it('Should return file id of deleted master file', function(done) {
        const inputs = {
          fileId: '01',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        const expectedFileLocation = "da-files-test";

        getMasterFileById.returns({
          id: "01",
          location: expectedFileLocation,
        });

        deleteMasterFilesInfoFromDB.returns('File Deleting Successfully');

        const expectBucketExistsValue = [true];

        fileMethodsStub.exists.returns(expectBucketExistsValue);
        fileMethodsStub.delete.returns('File Deleted Successfully From GCP');
        
        fileServiceModule.deleteMasterFileById(inputs)
        .then(function(result) {
          const actualData = result;
          const expectedData = "01";
          expect(actualData).to.equal(expectedData); 

          const expectedDeleteMasterFilesInfoFromDBArgs = {
            fileId: inputs.fileId,
            transaction: inputs.transaction,
          }

          const actualDeleteMasterFilesInfoFromDBArgs = deleteMasterFilesInfoFromDB.getCall(0).args;

          expect(inspect(actualDeleteMasterFilesInfoFromDBArgs[0], {
            depth: null
          })).to.deep.equal(inspect(expectedDeleteMasterFilesInfoFromDBArgs, {
            depth: null
          }), 'Expected value not passed in delete master file info form DB function');

          expect(actualDeleteMasterFilesInfoFromDBArgs.length).to.equal([expectedDeleteMasterFilesInfoFromDBArgs].length, 'Expected value not passed in delete master file info form DB function');          

          const expectedGetMasterFileByIdInput = {
            fileId: "01",
          }
          const actualGetMasterFileByIdInput = getMasterFileById.getCall(0).args;
          expect(actualGetMasterFileByIdInput[0]).to.equal(expectedGetMasterFileByIdInput.fileId, 'Expected value not passed in get master file by id function');
          expect(actualGetMasterFileByIdInput.length).to.equal(Object.keys(expectedGetMasterFileByIdInput).length, 'Expected value not passed in get master file by id function');

          const actualBucketFileFirstArgs = fileStub.getCall(0).args[0];
          const actualBucketFileExistsReturnValue = fileMethodsStub.exists.getCall(0).returnValue;

          expect(inspect(actualBucketFileFirstArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileLocation, {
            depth: null
          }), 'Expected value not pass in bucket file function');
          expect(Object.keys(actualBucketFileFirstArgs).length).to.deep.equal(Object.keys(expectedFileLocation).length, 'Expected value not pass in bucket file function');

          expect(inspect(actualBucketFileExistsReturnValue, {
            depth: null
          })).to.deep.equal(inspect(expectBucketExistsValue, {
            depth: null
          }), 'Expected value not pass in bucket file function');
          expect(Object.keys(actualBucketFileExistsReturnValue).length).to.deep.equal(Object.keys(expectBucketExistsValue).length, 'Expected value not pass in bucket file function');
          expect(fileMethodsStub.delete.calledOnce).to.equal(true, 'Bucket file function not called');

          done();
        })
        .catch(function(err) {
          done(err);
        })
      });
    });
  });
});

describe('#fileService - getMasterFileById', function () {
  beforeEach(function () {
    fileServiceFileFindOne = sinon.stub(File, 'findOne');
  });
  afterEach(function () {
    fileServiceFileFindOne.restore();
  });
  describe('Get File', function () {
    context('Fetch File from DB', function () {
      it('Should return File when correct params are passed', function (done) {
        const fileId = '01';

        fileServiceFileFindOne.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Accounts",
        });

        fileServiceModule.getMasterFileById(fileId)
          .then(function (result) {
            // Assert
            const expectedValue = {
              id: "01",
              mapping: {
                name: 'Name',
                zoomInfoName: 'SFDC Company Name',
                address: 'address',
              },
              name: "Accounts",
            };
            const actualValue = result;
            const expectedGetFileByIdArgs = {
              where: {
                id: fileId,
              },
              raw: true,
            };

            expect(actualValue).to.deep.equal(expectedValue);

            const actualGetFileByIDArgs = fileServiceFileFindOne.getCall(0).args[0];

            expect(inspect(actualGetFileByIDArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedGetFileByIdArgs, {
              depth: null
            }), 'Expected value not pass in get master file by id function');
            expect(Object.keys(actualGetFileByIDArgs).length).to.equal(Object.keys(expectedGetFileByIdArgs).length, 'Expected value not pass in get master file by id function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting file', function (done) {
        //Arrange
        const fileId = '01';

        fileServiceFileFindOne.throws(new Error('Something went wrong'));

        // Act
        fileServiceModule.getMasterFileById(fileId)
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

describe('#fileService - deleteMasterFilesInfoFromDB', function () {
  beforeEach(function () {
    sequelizeQuery = sinon.stub(sequelize, 'query');
    jobDestroy = sinon.stub(Job, 'destroy');
    fileChunkDestroy = sinon.stub(FileChunk, 'destroy');
    fileDestroy = sinon.stub(File, 'destroy');
  });
  afterEach(function () {
    sequelizeQuery.restore();
    jobDestroy.restore();
    fileChunkDestroy.restore();
    fileDestroy.restore();
  });
  describe('Delete File Info Form DB', function () {
    context('Delete all file related info from DB', function() {
      it('Should successfully delete all files info from DB', function (done) {
        const inputs = {
          fileId: '01',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        sequelizeQuery.returns('Job Errors Deleted Successfully');
        jobDestroy.returns('Jobs Deleted Successfully');
        fileChunkDestroy.returns('File Chunks Deleted Successfully');
        fileDestroy.returns('File Deleted Successfully');

        fileServiceModule.deleteMasterFilesInfoFromDB(inputs)
        .then(function(result) {
          const actualValue = result;
          const expectedValue = undefined;

          const actualSequelizeQueryArgs = sequelizeQuery.getCall(0).args;

          const expectedSequelizeQueryArgs = {
            sql: ' DELETE FROM "JobErrors" AS "JobError"  USING "Jobs" AS "Job" , "Files" AS "Job->File"  WHERE "JobError"."JobId" = "Job"."id"  AND "Job"."FileId" = "Job->File"."id"  AND "Job->File"."id" = :fileId ',
            inputObj: {
              replacements: { fileId: '01' },
              type: sequelize.QueryTypes.DELETE,
              transaction: inputs.transaction,
            }
          }

          expect(inspect(actualSequelizeQueryArgs[0], {
            depth: null
          })).to.deep.equal(inspect(expectedSequelizeQueryArgs.sql, {
            depth: null
          }), 'Expected value not pass in sequelize query function');

          expect(inspect(actualSequelizeQueryArgs[1], {
            depth: null
          })).to.deep.equal(inspect(expectedSequelizeQueryArgs.inputObj, {
            depth: null
          }), 'Expected value not pass in sequelize query function');

          expect(actualSequelizeQueryArgs.length).to.equal(Object.keys(expectedSequelizeQueryArgs).length, 'Expected value not pass in sequelize query function');

          const expectedJobDestroyArgs = {
            where: {
              FileId: inputs.fileId,
            },
            transaction: inputs.transaction,
          }

          const actualJobDestroyArgs = jobDestroy.getCall(0).args;
          expect(inspect(actualJobDestroyArgs[0], {
            depth: null
          })).to.deep.equal(inspect(expectedJobDestroyArgs, {
            depth: null
          }), 'Expected value not pass in job destroy function');

          expect(actualJobDestroyArgs.length).to.equal([expectedJobDestroyArgs].length, 'Expected value not pass in job destroy function');

          const expectedFileChunkDestroyArgs = {
            where: {
              FileId: inputs.fileId,
            },
            transaction: inputs.transaction,
          }

          const actualFileChunkDestroyArgs = fileChunkDestroy.getCall(0).args;
          expect(inspect(actualFileChunkDestroyArgs[0], {
            depth: null
          })).to.deep.equal(inspect(expectedFileChunkDestroyArgs, {
            depth: null
          }), 'Expected value not pass in file chunks destroy function');

          expect(actualFileChunkDestroyArgs.length).to.equal([expectedFileChunkDestroyArgs].length, 'Expected value not pass in file chunks destroy function');

          const expectedFileDestroyArgs = {
            where: {
              id: inputs.fileId,
            },
            transaction: inputs.transaction,
          }

          const actualFileDestroyArgs = fileDestroy.getCall(0).args;
          expect(inspect(actualFileDestroyArgs[0], {
            depth: null
          })).to.deep.equal(inspect(expectedFileDestroyArgs, {
            depth: null
          }), 'Expected value not pass in file destroy function');

          expect(actualFileDestroyArgs.length).to.equal([expectedFileDestroyArgs].length, 'Expected value not pass in file destroy function');

          expect(actualValue).to.equal(expectedValue);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      })

      it('Should throw error when something internally fails while deleting job errors', function(done) {
        const inputs = {
          fileId: '01',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        sequelizeQuery.throws(new Error('Something went wrong'));
        jobDestroy.returns('Jobs Deleted Successfully');
        fileChunkDestroy.returns('File Chunks Deleted Successfully');
        fileDestroy.returns('File Deleted Successfully');

        // Act
        fileServiceModule.deleteMasterFilesInfoFromDB(inputs)
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

      it('Should throw error when something internally fails while deleting jobs', function(done) {
        const inputs = {
          fileId: '01',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        sequelizeQuery.returns('Job Errors Deleted Successfully');
        jobDestroy.throws(new Error('Something went wrong'));
        fileChunkDestroy.returns('File Chunks Deleted Successfully');
        fileDestroy.returns('File Deleted Successfully');

        // Act
        fileServiceModule.deleteMasterFilesInfoFromDB(inputs)
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

      it('Should throw error when something internally fails while deleting file chunks', function(done) {
        const inputs = {
          fileId: '01',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        sequelizeQuery.returns('Job Errors Deleted Successfully');
        jobDestroy.returns('Jobs Deleted Successfully');
        fileChunkDestroy.throws(new Error('Something went wrong'))
        fileDestroy.returns('File Deleted Successfully');

        // Act
        fileServiceModule.deleteMasterFilesInfoFromDB(inputs)
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

      it('Should throw error when something internally fails while deleting file', function(done) {
        const inputs = {
          fileId: '01',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        sequelizeQuery.returns('Job Errors Deleted Successfully');
        jobDestroy.returns('Jobs Deleted Successfully');
        fileChunkDestroy.returns('File Chunks Deleted Successfully');
        fileDestroy.throws(new Error('Something went wrong'))

        // Act
        fileServiceModule.deleteMasterFilesInfoFromDB(inputs)
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
  })
})

describe('#fileService - createMasterFile', function () {
  beforeEach(function () {
    dateStub = sinon.stub(Date, 'now').callsFake(() => {
      return 1659411447537;
    });
    fileMethodsStub = {
      getSignedUrl: sinon.stub(),
    };
    fileStub = sinon.stub().callsFake(() => {
      return fileMethodsStub
    });
    bucketStub = sinon.stub(Storage.prototype, "bucket").callsFake(() => {
      return {
        file: fileStub
      }
    });
    createMasterFileInDB = sinon.stub(fileServiceModule, 'createMasterFileInDB');
    createMasterJobInDB = sinon.stub(fileServiceModule, 'createMasterJobInDB');
  })
  afterEach(function () {
    dateStub.restore();
    fileMethodsStub.exists = sinon.stub();
    fileMethodsStub.delete = sinon.stub();
    bucketStub.restore();
    createMasterFileInDB.restore();
    createMasterJobInDB.restore();
  })
  describe('Create a master file', function () {
    context('Create a file to GCP as well as in DB along with its info', function () {
      it('should create a master file on GCP as well as in DB along with its info', function (done) {
        const inputs = {
          jobStatus: 'Queued',
          processed: 0,
          imported: 0,
          errored: 0,
          fileContentType: 'text/csv',
          fileId: '01',
          fileName: 'abc.csv',
          fileType: 'Import',
          format: '.csv',
          mapping: {},
          createdBy: 'dev.pmgr1@nexsales.com',
          transaction: {
            commit: function () {},
            rollback: function () {},
          },
          jobId: '01',
          chunks: '',
          operationName: 'accountImport',
          operationParam: {},
        }

        const expectBucketSignedUrlValue = ['gcpUrl'];
        fileMethodsStub.getSignedUrl.returns(expectBucketSignedUrlValue);

        fileServiceModule.createMasterFile(inputs)
        .then(function(result){
          const actualData = result;
          const expectedData = {
            uploadUrl: 'gcpUrl', 
            fileId: inputs.fileId
          }
          expect(actualData).to.deep.equal(expectedData);

          const actualBucketFileFirstArgs = fileStub.getCall(0).args[0];
          const expectedFileLocation = "files/Import/01.csv";

          expect(inspect(actualBucketFileFirstArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileLocation, {
            depth: null
          }), 'Expected value not pass in bucket file function');
          expect(Object.keys(actualBucketFileFirstArgs).length).to.deep.equal(Object.keys(expectedFileLocation).length, 'Expected value not pass in bucket file function');

          const actualBucketFileGetSignedUrlArgs = fileMethodsStub.getSignedUrl.getCall(0).args[0];
          const expectedBucketFileGetSignedUrl = {
            version: 'v4',
            action: 'write',
            expires: 1659412047537,
            contentType: 'text/csv'
          }
          
          expect(inspect(actualBucketFileGetSignedUrlArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedBucketFileGetSignedUrl, {
            depth: null
          }), 'Expected value not pass in bucket file get signed URL function');
          expect(Object.keys(actualBucketFileGetSignedUrlArgs).length).to.deep.equal(Object.keys(expectedBucketFileGetSignedUrl).length, 'Expected value not pass in bucket file get signed URL  function');

          const actualBucketFileGetSignedUrlReturnValue = fileMethodsStub.getSignedUrl.getCall(0).returnValue;

          expect(inspect(actualBucketFileGetSignedUrlReturnValue, {
            depth: null
          })).to.deep.equal(inspect(expectBucketSignedUrlValue, {
            depth: null
          }), 'Expected value not pass in bucket file get signed URL function');
          expect(Object.keys(actualBucketFileGetSignedUrlReturnValue).length).to.deep.equal(Object.keys(expectBucketSignedUrlValue).length, 'Expected value not pass in bucket file get signed URL function');
          expect(fileMethodsStub.getSignedUrl.calledOnce).to.equal(true, 'Bucket file function not called');

          const actualCreateMasterFileInDBArgs = createMasterFileInDB.getCall(0).args;
          const expectedCreateMasterFileInDBArgs = {
            id: '01',
            name: 'abc.csv',
            type: 'Import',
            format: '.csv',
            location: 'files/Import/01.csv',
            mapping: {},
            headers: [],
            source: undefined,
            createdBy: 'dev.pmgr1@nexsales.com',
            transaction: {
              commit: function () {},
              rollback: function () {},
            },
          }        
          expect(inspect(actualCreateMasterFileInDBArgs[0], {
            depth: null
          })).to.deep.equal(inspect(expectedCreateMasterFileInDBArgs, {
            depth: null
          }), 'Expected value not pass in create master file in db function');
          expect(actualCreateMasterFileInDBArgs.length).to.equal([expectedCreateMasterFileInDBArgs].length, 'Expected value not pass in create master file in db function');

          const actualCreateMasterJobInDBArgs = createMasterJobInDB.getCall(0).args;
          const expectedCreateMasterJobInDBArgs = {
            id: '01',
            status: 'Queued',
            chunks: '',
            operationName: 'accountImport',
            operationParam: {},
            processed: 0,
            imported: 0,
            errored: 0,
            createdBy: 'dev.pmgr1@nexsales.com',
            fileId: '01',
            transaction: {
              commit: function () {},
              rollback: function () {},
            },
          }        
          expect(inspect(actualCreateMasterJobInDBArgs[0], {
            depth: null
          })).to.deep.equal(inspect(expectedCreateMasterJobInDBArgs, {
            depth: null
          }), 'Expected value not pass in create master job in db function');
          expect(actualCreateMasterJobInDBArgs.length).to.equal([expectedCreateMasterJobInDBArgs].length, 'Expected value not pass in create master job in db function');

          done();
        })
        .catch(function(err) {
          done(err);
        })
      })
    });

    context('Check if errors are caught while creating a master file in GCP as well as DB', function(){
      it('Should throw error when Storage Bucket File get signed URl method fails while creating master file in GCP', function(done) {
        const inputs = {
          jobStatus: 'Queued',
          processed: 0,
          imported: 0,
          errored: 0,
          fileContentType: 'text/csv',
          fileId: '01',
          fileName: 'abc.csv',
          fileType: 'Import',
          format: '.csv',
          mapping: {},
          createdBy: 'dev.pmgr1@nexsales.com',
          transaction: {
            commit: function () {},
            rollback: function () {},
          },
          jobId: '01',
          chunks: '',
          operationName: 'accountImport',
          operationParam: {},
        }

        fileMethodsStub.getSignedUrl.throws(new Error('Something went wrong'));

        fileServiceModule.createMasterFile(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      });

      it('Should throw error when something internally fails while creating master file in DB', function(done) {
        const inputs = {
          jobStatus: 'Queued',
          processed: 0,
          imported: 0,
          errored: 0,
          fileContentType: 'text/csv',
          fileId: '01',
          fileName: 'abc.csv',
          fileType: 'Import',
          format: '.csv',
          mapping: {},
          createdBy: 'dev.pmgr1@nexsales.com',
          transaction: {
            commit: function () {},
            rollback: function () {},
          },
          jobId: '01',
          chunks: '',
          operationName: 'accountImport',
          operationParam: {},
        }

        const expectBucketSignedUrlValue = ['gcpUrl'];
        fileMethodsStub.getSignedUrl.returns(expectBucketSignedUrlValue);

        createMasterFileInDB.throws(new Error('Something went wrong'));

        fileServiceModule.createMasterFile(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      });

      it('Should throw error when something internally fails while creating master file job in DB', function(done) {
        const inputs = {
          jobStatus: 'Queued',
          processed: 0,
          imported: 0,
          errored: 0,
          fileContentType: 'text/csv',
          fileId: '01',
          fileName: 'abc.csv',
          fileType: 'Import',
          format: '.csv',
          mapping: {},
          createdBy: 'dev.pmgr1@nexsales.com',
          transaction: {
            commit: function () {},
            rollback: function () {},
          },
          jobId: '01',
          chunks: '',
          operationName: 'accountImport',
          operationParam: {},
        }

        const expectBucketSignedUrlValue = ['gcpUrl'];
        fileMethodsStub.getSignedUrl.returns(expectBucketSignedUrlValue);

        createMasterFileInDB.returns('File Created Successfully');

        createMasterJobInDB.throws(new Error('Something went wrong'));

        fileServiceModule.createMasterFile(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      });
    });
  });
});

describe('#fileService - createMasterFileInDB', function() {
  beforeEach(function() {
    fileCreate = sinon.stub(File, 'create');
  })
  afterEach(function() {
    fileCreate.restore();
  })
  describe('Create a file', function() {
    context('Create a file in DB', function() {
      it('Should create a file in DB when correct params are passed', function(done) {
        const inputs = {
          id: '01',
          name: 'abc.csv',
          type: 'Import',
          format: '.csv',
          location: 'files/Import/01.csv',
          mapping: {},
          createdBy: 'dev.pmgr1@nexsales.com',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        fileCreate.returns('File Created Successfully');

        fileServiceModule.createMasterFileInDB(inputs)
        .then(function(result) {
          const actual = result;
          const expected = undefined;
          expect(actual).to.deep.equal(expected);
          
          const actualFileCreateArgs = fileCreate.getCall(0).args;
          const expectedFileCreateArgs = [
            {
              id: '01',
              name: 'abc.csv',
              type: 'Import',
              format: '.csv',
              location: 'files/Import/01.csv',
              mapping: {},
              headers: undefined,
              source: undefined,
              createdBy: 'dev.pmgr1@nexsales.com'
            },
            {
              transaction: inputs.transaction,
            }
          ]
          expect(inspect(actualFileCreateArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileCreateArgs, {
            depth: null
          }), 'Expected value not pass in file create function');
          expect(actualFileCreateArgs.length).to.equal(expectedFileCreateArgs.length, 'Expected value not pass in file create function');

          done();
        })
        .catch(function(err) {
          done(err);
        })
      })

      it('Should throw error when something internally fails while creating a file in db', function(done) {
        const inputs = {
          id: '01',
          name: 'abc.csv',
          type: 'Import',
          format: '.csv',
          location: 'files/Import/01.csv',
          mapping: {},
          createdBy: 'dev.pmgr1@nexsales.com',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        fileCreate.throws(new Error('Something went wrong'));

        fileServiceModule.createMasterFileInDB(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      })
    })
  })
})

describe('#fileService - createMasterJobInDB', function() {
  beforeEach(function() {
    jobCreate = sinon.stub(Job, 'create');
  })
  afterEach(function() {
    jobCreate.restore();
  })
  describe('Create a job', function() {
    context('Create a job in DB', function() {
      it('Should create a job in DB when correct params are passed', function(done) {
        const inputs = {
          status: 'Queued',
          chunks: '',
          operationName: 'accountImport',
          operationParam: {},
          processed: 0,
          imported: 0,
          errored: 0,
          fileId: '01',
          id: '01',
          createdBy: 'dev.pmgr1@nexsales.com',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        jobCreate.returns('Job Created Successfully');

        fileServiceModule.createMasterJobInDB(inputs)
        .then(function(result) {
          const actual = result;
          const expected = undefined;
          expect(actual).to.deep.equal(expected);
          
          const actualJobCreateArgs = jobCreate.getCall(0).args;
          const expectedJobCreateArgs = [
            {
              id: '01',
              status: 'Queued',
              chunks: '',
              operationName: 'accountImport',
              operationParam: {},
              processed: 0,
              imported: 0,
              errored: 0,
              createdBy: 'dev.pmgr1@nexsales.com',
              FileId: '01'
            },
            {
              transaction: inputs.transaction,
            }
          ]
          expect(inspect(actualJobCreateArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedJobCreateArgs, {
            depth: null
          }), 'Expected value not pass in job create function');
          expect(actualJobCreateArgs.length).to.equal(expectedJobCreateArgs.length, 'Expected value not pass in job create function');

          done();
        })
        .catch(function(err) {
          done(err);
        })
      })

      it('Should throw error when something internally fails while creating a job in db', function(done) {
        const inputs = {
          status: 'Queued',
          chunks: '',
          operationName: 'accountImport',
          operationParam: {},
          processed: 0,
          imported: 0,
          errored: 0,
          fileId: '01',
          id: '01',
          createdBy: 'dev.pmgr1@nexsales.com',
          transaction: {
            commit: function () {},
            rollback: function () {},
          }
        }

        jobCreate.throws(new Error('Something went wrong'));

        fileServiceModule.createMasterJobInDB(inputs)
        .then(function(result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function(err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function(err) {
          done(err);
        })
      })
    })
  })
})