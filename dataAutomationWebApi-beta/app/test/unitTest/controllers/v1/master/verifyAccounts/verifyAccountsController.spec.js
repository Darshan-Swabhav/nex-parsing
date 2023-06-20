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

const verifyAccountCRUDServiceInstanceStub = {
  getAllAccount: sinon.stub(),
  saveAccount: sinon.stub(),
};

const VerifyAccountCRUDServiceStub = sinon
  .stub()
  .returns(verifyAccountCRUDServiceInstanceStub);

const paginationServiceInstanceStub = {
  paginate: sinon.stub(),
};

const PaginationServiceStub = sinon
  .stub()
  .returns(paginationServiceInstanceStub);

const DomainServiceStub = {
  getDomain: sinon.stub(),
};

const verifyAccountControllerModule = proxyquire('../../../../../../controllers/v1/master/verifyAccounts/verifyAccountsController', {
  '../../../../services/master/verifyAccounts/verifyAccountsService': VerifyAccountCRUDServiceStub,
  '../../../../services/helpers/paginationService': PaginationServiceStub,
  '@nexsalesdev/da-dedupekeys-generator/lib/getDomain': DomainServiceStub,
});

describe('#verifyAccountsController - get', function () {
  describe('Get All Verify Accounts', function () {
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
        verifyAccountControllerModule.get(settingsConfig, req, res, next)
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
        verifyAccountControllerModule.get(settingsConfig, req, res, next)
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

    context('Check if correct params are passed for getting list of verify accounts', function () {
      before(function () {
        const accountRes = {
          totalCount: 0,
          docs: []
        };
        verifyAccountCRUDServiceInstanceStub.getAllAccount = sinon.stub().returns(accountRes);
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
      });
      it('Should return `200` with verify accounts list', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {},
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['compliance'],
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
        verifyAccountControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const sortableColumns = ['updatedAt'];
            const multipleSort = false;
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              totalCount: 0,
              docs: []
            };

            const inputs = {
              userEmail: req.user.email,
              limit: 0,
              offset: 0,
            }

            const expectedGetAllAccountListArgs = {
              inputs,
            }

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            const actualGetAllAccountsFirstArgs = verifyAccountCRUDServiceInstanceStub.getAllAccount.getCall(0).args[0];
            const actualGetAllAccountsSecondArgs = verifyAccountCRUDServiceInstanceStub.getAllAccount.getCall(0).args[1];
            const actualGetAllAccountsArgsLength = verifyAccountCRUDServiceInstanceStub.getAllAccount.getCall(0).args.length;

            expect(actualGetAllAccountsFirstArgs).to.deep.equal(expectedGetAllAccountListArgs.inputs, 'Expected value not pass in get all verify account function');
            expect(actualGetAllAccountsSecondArgs).to.deep.equal(expectedGetAllAccountListArgs.sort, 'Expected value not pass in get all verify account function');
            expect(actualGetAllAccountsArgsLength).to.deep.equal(Object.keys(expectedGetAllAccountListArgs).length, 'Expected value not pass in get all verify account function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        verifyAccountCRUDServiceInstanceStub.getAllAccount = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting list of verify accounts', function () {
      before(function () {
        verifyAccountCRUDServiceInstanceStub.getAllAccount = sinon.stub().throws(new Error('Something went wrong'));
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
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
            roles: ['compliance'],
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
        verifyAccountControllerModule.get(settingsConfig, req, res, next)
        .then(function (result) {
          // Assert
          const actualStatusCode = result.statusCode;
          const actualData = result.data;
          const expectedStatusCode = 500;
          const expectedData = {
            err: 'Something went wrong',
            desc: 'Could Not Get Master Verify Accounts'
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
        verifyAccountCRUDServiceInstanceStub.getAllAccount = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });
  });
});

describe('#verifyAccountsController - post', function () {
  describe('Create a Verify Account', function () {
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
        verifyAccountControllerModule.post(settingsConfig, req, res, next)
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
            roles: ['manager']
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
        verifyAccountControllerModule.post(settingsConfig, req, res, next)
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

    context('Check If the account is passed in body', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
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
        verifyAccountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Account object in body not Found',
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

    context('Check If the domain is passed in account', function () {
      before(function () {
        DomainServiceStub.getDomain = sinon.stub().returns('');
      })
      it('Should return `400` with `Bad Request` error', function (done) {
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
          body: {
            account: {
              name: 'test account',
              website: 'www.nexsales.com'
            },
            changedAccountData:{ name: 'test account updated', }
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
        verifyAccountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'domain is required',
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
        DomainServiceStub.getDomain = sinon.stub();
      })
    });

    context('Check If verify account params are passed successfully', function () {
      before(function () {
        DomainServiceStub.getDomain = sinon.stub().returns('');
        verifyAccountCRUDServiceInstanceStub.saveAccount = sinon.stub().returns({
          account: {
            domain: 'nexsales.com'
          }
        })
      })
      it('Should successfully create a verify account when all params are passed correctly', function (done) {
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
          body: {
            account: {
              name: 'test account',
              website: 'www.nexsales.com',
              domain: 'nexsales.com'
            },
            changedAccountData:{
              name: 'test account updated',
            },
            allowMasterUpdate: false,
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
        verifyAccountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 201;
            const expectedData = {
              account: {
                domain: 'nexsales.com'
              }
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            const expectedSaveAccountArgs = {
              account: {
                name: 'test account',
                website: 'www.nexsales.com',
                domain: 'nexsales.com'
              },
              changedAccountData:{
                name: 'test account updated',
              },
              userEmail: 'dev.pmgr1@nexsales.com',
            }

            const actualSaveAccountArgs = verifyAccountCRUDServiceInstanceStub.saveAccount.getCall(0).args;

            expect(actualSaveAccountArgs[0]).to.deep.equal(expectedSaveAccountArgs, 'Expected value not pass in save account function');
            expect(actualSaveAccountArgs.length).to.equal([expectedSaveAccountArgs].length, 'Expected value not pass in save account function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        DomainServiceStub.getDomain = sinon.stub();
        verifyAccountCRUDServiceInstanceStub.saveAccount = sinon.stub();
      })
    });

    context('Check If verify account params are passed successfully', function () {
      before(function () {
        DomainServiceStub.getDomain = sinon.stub().returns('');
        verifyAccountCRUDServiceInstanceStub.saveAccount = sinon.stub().throws(new Error('Something went wrong'))
      })
      it('Should throw error when something goes wrong', function (done) {
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
          body: {
            account: {
              name: 'test account',
              website: 'www.nexsales.com',
              domain: 'nexsales.com'
            },
            changedAccountData:{
              name: 'test account updated',
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

        // Act
        verifyAccountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Create Master Verify Account',
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
        DomainServiceStub.getDomain = sinon.stub();
        verifyAccountCRUDServiceInstanceStub.saveAccount = sinon.stub();
      })
    });
  });
});