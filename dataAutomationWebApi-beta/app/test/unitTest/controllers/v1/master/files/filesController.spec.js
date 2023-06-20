const {
  expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const generateUUID = require('uuidv4');

const {
  inspect
} = require('util');

const { sequelize } = require('@nexsalesdev/master-data-model');

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const fileCRUDServiceInstanceStub = {
  deleteMasterFileById: sinon.stub(),
  createMasterFile: sinon.stub(),
};

const FileCRUDServiceStub = sinon
  .stub()
  .returns(fileCRUDServiceInstanceStub);

const validationServiceInstanceStub = {
  removeNullKeysInObj: sinon.stub(),
  validateObj: sinon.stub(),
};

const ValidationServiceStub = sinon
  .stub()
  .returns(validationServiceInstanceStub);

const fileControllerModule = proxyquire('../../../../../../controllers/v1/master/files/filesController', {
  '../../../../services/master/files/filesService': FileCRUDServiceStub,
  '../../../../services/helpers/validationService': ValidationServiceStub,
});

let sequelizeTransaction, uuidStub, createMasterFile;

describe('#filesController - delete', function () {
  describe('Delete File by Id', function () {
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

        //Act
        fileControllerModule.delete(settingsConfig, req, res, next)
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
        fileControllerModule.delete(settingsConfig, req, res, next)
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

    context('Check If the file id is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager']
          },
          params: {
            fileId: ''
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
        fileControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'fileId is required',
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

    context('Check if correct params are passed for deleting a file', function () {
      before(function () {
        sequelizeTransaction = sinon.stub(sequelize, 'transaction').returns({
          commit: function () {},
          rollback: function () {},
        })
      });
      it('Should return `200` with deleted file id', function (done) {
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
            fileId: '01'
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
        fileControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = res.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = '01';

            const expectedInputs = {
              fileId: '01',
              userEmail: 'dev.pmgr1@nexsales.com',
              transaction: {
                commit: function () {},
                rollback: function () {},
              }
            }

            const actualDeleteMasterFileByIdArgs = fileCRUDServiceInstanceStub.deleteMasterFileById.getCall(0).args;

            expect(inspect(actualDeleteMasterFileByIdArgs[0], {
              depth: null
            })).to.deep.equal(inspect(expectedInputs, {
              depth: null
            }), 'Expected value not pass in delete master file by id function');

            expect(actualDeleteMasterFileByIdArgs.length).to.deep.equal([expectedInputs].length, 'Expected value not pass in delete master file by id function');

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        sequelizeTransaction.restore();
      });
    });

    context('Check if correct params are passed for deleting a file', function () {
      before(function () {
        sequelizeTransaction = sinon.stub(sequelize, 'transaction').returns({
          commit: function () {},
          rollback: function () {},
        })
        fileCRUDServiceInstanceStub.deleteMasterFileById = sinon.stub().throws(new Error('Something went wrong'));
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
            fileId: '01'
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
        fileControllerModule.delete(settingsConfig, req, res, next)
        .then(function (result) {
          // Assert
          const actualStatusCode = result.statusCode;
          const actualData = result.data;
          const expectedStatusCode = 500;
          const expectedData = {
            err: 'Something went wrong',
            desc: 'Could Not Delete Master File'
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
        sequelizeTransaction.restore();
        fileCRUDServiceInstanceStub.deleteMasterFileById = sinon.stub();
      });
    });
  });
});

describe('#filesController - post', function () {
  describe('Create a file and its info', function () {
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

        //Act
        fileControllerModule.post(settingsConfig, req, res, next)
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
        fileControllerModule.post(settingsConfig, req, res, next)
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

    context('Check If Mandatory values are available', function () {
      before(function () {
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
      it('Should return `400` when a mandatory value is not available', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['compliance']
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          fileType: 'Import',
          mapping: {
            name: 'account.name',
          },
          rowCount: 0,
          fileName: 'abc.csv',
          fileContentType: '.csv',
          operationName: 'accountImport',
          operationParam: {},
        });

        validationServiceInstanceStub.validateObj.returns(['fileType', 'mapping'])

        // Act
        fileControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: `fileType, mapping is required`,
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
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
    });

    context('Check If File type is valid', function () {
      before(function () {
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
      it('Should return `400` when a mandatory value is not available', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['compliance']
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          fileType: 'ImportData',
          mapping: {
            name: 'account.name',
          },
          rowCount: 0,
          fileName: 'abc.csv',
          fileContentType: '.csv',
          operationName: 'accountImport',
          operationParam: {},
        });

        validationServiceInstanceStub.validateObj.returns([])

        // Act
        fileControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: `ImportData file type is invalid`,
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
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
    });

    context('Check If Operation name is valid', function () {
      before(function () {
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
      it('Should return `400` when a mandatory value is not available', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['compliance']
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          fileType: 'Import',
          mapping: {
            name: 'account.name',
          },
          rowCount: 0,
          fileName: 'abc.csv',
          fileContentType: '.csv',
          operationName: 'accountImportData',
          operationParam: {},
        });

        validationServiceInstanceStub.validateObj.returns([])

        // Act
        fileControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: `accountImportData operation name is invalid`,
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
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
    });

    context('Check If mapping is parsed correctly', function () {
      before(function () {
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
      it('Should return `400` when a there is mapping parsing error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['compliance']
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          fileType: 'Import',
          mapping: 'mapping',
          rowCount: 0,
          fileName: 'abc.csv',
          fileContentType: '.csv',
          operationName: 'accountImport',
          operationParam: {},
        });

        validationServiceInstanceStub.validateObj.returns([])

        // Act
        fileControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'The mapping value type is not an object',
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
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
    });

    context('Check If operation param is parsed correctly', function () {
      before(function () {
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
      it('Should return `400` when a there is mapping parsing error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['compliance']
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          fileType: 'Import',
          mapping: '{}',
          rowCount: 0,
          fileName: 'abc.csv',
          fileContentType: '.csv',
          operationName: 'accountImport',
          operationParam: 'operationParam',
        });

        validationServiceInstanceStub.validateObj.returns([])

        // Act
        fileControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'The operation params value type is not an object',
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
        validationServiceInstanceStub.removeNullKeysInObj = sinon.stub();
        validationServiceInstanceStub.validateObj = sinon.stub();
      })
    });

    context('Create a master file', function () {
      beforeEach(function () {
        uuidStub = sinon.stub(generateUUID, 'uuid').returns('c23624e9-e21d-4f19-8853-cfca73e7109a');
        sequelizeTransaction = sinon.stub(sequelize, 'transaction').returns({
          commit: function () {},
          rollback: function () {},
        })
        fileCRUDServiceInstanceStub.createMasterFile = sinon.stub();
      })
      it('Should successfully create a master file when all params are passed correctly', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['compliance']
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          fileType: 'Import',
          mapping: '{}',
          rowCount: 0,
          fileName: 'abc.csv',
          fileContentType: '.csv',
          operationName: 'accountImport',
          operationParam: '{}',
        });

        validationServiceInstanceStub.validateObj.returns([])

        fileCRUDServiceInstanceStub.createMasterFile.returns({
          id: 'c23624e9-e21d-4f19-8853-cfca73e7109a'
        })

        // Act
        fileControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;

            const expectedStatusCode = 201;
            const expectedData = {
              id: 'c23624e9-e21d-4f19-8853-cfca73e7109a'
            }

            const expectedCreateMasterFileArgs = {
              fileType: 'Import',
              mapping: {},
              rowCount: 0,
              fileName: 'abc.csv',
              fileContentType: '.csv',
              operationName: 'accountImport',
              operationParam: {},
              fileId: 'c23624e9-e21d-4f19-8853-cfca73e7109a',
              jobId: 'c23624e9-e21d-4f19-8853-cfca73e7109a',
              createdBy: 'dev.pmgr1@nexsales.com',
              format: '.csv',
              transaction: {
                commit: function () {},
                rollback: function () {},
              },
            }

            const actualCreateMasterFileArgs = fileCRUDServiceInstanceStub.createMasterFile.getCall(0).args;

            expect(inspect(actualCreateMasterFileArgs[0], {
              depth: null
            })).to.deep.equal(inspect(expectedCreateMasterFileArgs, {
              depth: null
            }), 'Expected value not pass in create master file function');

            expect(actualCreateMasterFileArgs.length).to.deep.equal([expectedCreateMasterFileArgs].length, 'Expected value not pass in create master file function');
            
            
            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      })
      it('Should throw error when something internally fails while creating master file', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['compliance']
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

        validationServiceInstanceStub.removeNullKeysInObj.returns({
          fileType: 'Import',
          mapping: '{}',
          rowCount: 0,
          fileName: 'abc.csv',
          fileContentType: '.csv',
          operationName: 'accountImport',
          operationParam: '{}',
        });

        validationServiceInstanceStub.validateObj.returns([])

        fileCRUDServiceInstanceStub.createMasterFile.throws(new Error('Something went wrong'))

        // Act
        fileControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;

            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Upload Master File',
            }
                     
            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      })
      afterEach(function () {
        uuidStub.restore();
        sequelizeTransaction.restore();
        fileCRUDServiceInstanceStub.createMasterFile = sinon.stub();
      })
    })
  });
});