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

const accountCRUDServiceInstanceStub = {
  getAllAccount: sinon.stub,
  getAccountDispositions: sinon.stub(),
  getAccountStats: sinon.stub(),
  editAccount: sinon.stub(),
  checkAccountSuppressionAndDuplicate: sinon.stub(),
  validateMandatoryFields: sinon.stub(),
  getMandatoryFields: sinon.stub(),
};

const AccountCRUDServiceStub = sinon
  .stub()
  .returns(accountCRUDServiceInstanceStub);

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

const fileStreamServiceInstanceStub = {};

const FileStreamServiceStub = sinon
  .stub()
  .returns(fileStreamServiceInstanceStub);

const accountControllerModule = proxyquire('../../../../../../controllers/v1/projects/accounts/accountsController', {
  '../../../../services/projects/accounts/accountsService': AccountCRUDServiceStub,
  '../../../../services/helpers/paginationService': PaginationServiceStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler': FilterHandlerStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler': SortHandlerStub,
  '../../../../services/stream/fileStreamService': FileStreamServiceStub,
});

describe('#accountsController - getAccountDispositions', function () {
  describe('Get Accounts Dispositions', function () {
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
        accountControllerModule.getAccountDispositions(settingsConfig, req, res, next)
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
        accountControllerModule.getAccountDispositions(settingsConfig, req, res, next)
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

    context('Check if correct params are passed', function () {
      before(function () {
        const accountDispositionRes = [
          'Generic Email',
          'Contact Built',
          'Contact Found: Email Bad',
        ];
        accountCRUDServiceInstanceStub.getAccountDispositions = sinon.stub().returns(accountDispositionRes);
      });
      it('Should return `200` with task stats data', function (done) {
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
        accountControllerModule.getAccountDispositions(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              'Generic Email',
              'Contact Built',
              'Contact Found: Email Bad',
            ];
            const inputs = {
              projectId: req.params.projectId,
              userId: req.user.sub,
            }

            const expectedGetAccountDispositionsArgs = {
              inputs
            }

            const actualGetAccountDispositionsArgs = accountCRUDServiceInstanceStub.getAccountDispositions.getCall(0).args[0];
            const actualGetAccountDispositionsArgsLength = accountCRUDServiceInstanceStub.getAccountDispositions.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualGetAccountDispositionsArgs).to.deep.equal(expectedGetAccountDispositionsArgs.inputs, 'Expected value not pass in get Account Dispositions function');
            expect(actualGetAccountDispositionsArgsLength).to.deep.equal(Object.keys(expectedGetAccountDispositionsArgs).length, 'Expected value not pass in get get Account Dispositions function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        accountCRUDServiceInstanceStub.getAccountDispositions = sinon.stub();
      });
    });
  });
});

describe('#accountsController - getAccountStats', function () {
  describe('Get Accounts Stats', function () {
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
        accountControllerModule.getAccountStats(settingsConfig, req, res, next)
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
        accountControllerModule.getAccountStats(settingsConfig, req, res, next)
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
        accountControllerModule.getAccountStats(settingsConfig, req, res, next)
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

    context('Check If filter is invalid', function () {
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
        accountControllerModule.getAccountStats(settingsConfig, req, res, next)
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
    });

    context('Check If filter data is wrong', function () {
      before(function () {
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
        accountControllerModule.getAccountStats(settingsConfig, req, res, next)
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
        filterHandlerInstanceStub.validate = sinon.stub();
      });
    });

    context('Check if correct params are passed', function () {
      before(function () {
        const accountStatsRes = {
          "dispositions": {
            "data": [{
              "disposition": "string",
              "count": 0
            }],
            "totalCount": 0
          },
          "stages": {
            "data": [{
              "stage": "string",
              "count": 0
            }],
            "totalCount": 0
          }
        };
        accountCRUDServiceInstanceStub.getAccountStats = sinon.stub().returns(accountStatsRes);
      });
      it('Should return `200` with account stats data', function (done) {
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
        accountControllerModule.getAccountStats(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const filterColumns = {
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
            const filter = {};
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              "dispositions": {
                "data": [{
                  "disposition": "string",
                  "count": 0
                }],
                "totalCount": 0
              },
              "stages": {
                "data": [{
                  "stage": "string",
                  "count": 0
                }],
                "totalCount": 0
              }
            };
            const expectedFilterValidateArgs = {
              filterColumns,
              filter,
            };

            const inputs = {
              projectId: req.params.projectId,
            }

            const expectedGetAccountStatsArgs = {
              inputs,
              filter,
            }

            const actualFilterValidateFirstArg = filterHandlerInstanceStub.validate.getCall(0).args[0];
            const actualFilterValidateSecondArg = filterHandlerInstanceStub.validate.getCall(0).args[1];
            const actualFilterValidateArgsLength = filterHandlerInstanceStub.validate.getCall(0).args.length;

            const actualGetAccountStatsFirstArgs = accountCRUDServiceInstanceStub.getAccountStats.getCall(0).args[0];
            const actualGetAccountStatsSecondArgs = accountCRUDServiceInstanceStub.getAccountStats.getCall(0).args[1];
            const actualGetAccountStatsArgsLength = accountCRUDServiceInstanceStub.getAccountStats.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualFilterValidateFirstArg).to.deep.equal(expectedFilterValidateArgs.filterColumns, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateSecondArg).to.deep.equal(expectedFilterValidateArgs.filter, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateArgsLength).to.deep.equal(Object.keys(expectedFilterValidateArgs).length, 'Expected value not pass in filter validate function');

            expect(actualGetAccountStatsFirstArgs).to.deep.equal(expectedGetAccountStatsArgs.inputs, 'Expected value not pass in get account stats function');
            expect(actualGetAccountStatsSecondArgs).to.deep.equal(expectedGetAccountStatsArgs.filter, 'Expected value not pass in get account stats function');
            expect(actualGetAccountStatsArgsLength).to.deep.equal(Object.keys(expectedGetAccountStatsArgs).length, 'Expected value not pass in get account stats function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        accountCRUDServiceInstanceStub.getAccountStats = sinon.stub();
      });
    });

    context('Check if correct params are passed', function () {
      before(function () {
        accountCRUDServiceInstanceStub.getAccountStats = sinon.stub().throws(new Error('Something went wrong'));
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
        accountControllerModule.getAccountStats(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Accounts Stats'
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
        accountCRUDServiceInstanceStub.getAccountStats = sinon.stub();
      });
    });
  });
});

describe('#accountsController - put', () => {
  describe('Update account data', () => {
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
        accountControllerModule.put(settingsConfig, req, res, next)
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
        accountControllerModule.put(settingsConfig, req, res, next)
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
    context('Check If AccountId is invalid', () => {
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
            projectId: '222',
            accountId: ''
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
        accountControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'accountId is required'
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
    context('Check If Account is Empty', () => {
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
            projectId: '222',
            accountId: '333',
          },
          query: {},
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
        accountControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Body in Account object not Found'
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

    context('Check If Account-Type is invalid', () => {
      before(function () {
        accountCRUDServiceInstanceStub.validateMandatoryFields = sinon.stub().returns({
          valid: false,
          description: 'Account Type is invalid',
        });
      });
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
            projectId: '222',
            accountId: '333'
          },
          query: {},
          body: {
            type : ""
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
        accountControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Account Type is invalid'
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


    context('Check If get any errors while editing Account data Using the service function', () => {
      before(function () {
        accountCRUDServiceInstanceStub.editAccount = sinon.stub().throws(new Error('Something went wrong in editing account data'));
        accountCRUDServiceInstanceStub.validateMandatoryFields = sinon.stub().returns({
          valid: true,
          description: '',
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
            accountId: '222',
          },
          query: {},
          body: {
            name: 'TCS',
            type: 'Parent'
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
        accountControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong in editing account data',
              desc: 'Could Not Get Account'
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
        accountCRUDServiceInstanceStub.editAccount = sinon.stub();
      });
    });
    context('Check if account edited successfully', () => {
      before(function () {
        accountCRUDServiceInstanceStub.editAccount = sinon.stub().returns('edit successfully');
        accountCRUDServiceInstanceStub.validateMandatoryFields = sinon.stub().returns({
          valid: true,
          description: '',
        });
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
            accountId: '222',
          },
          query: {},
          body: {
            name: 'TCS',
            type: 'Parent'
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
        accountControllerModule.put(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 200;

            const editAccountInput = {
              projectId: req.params.projectId,
              accountId: req.params.accountId,
              account: req.body,
              userId: req.user.sub,
            };
            expect(accountCRUDServiceInstanceStub.editAccount.calledWithExactly(editAccountInput)).to.equal(true, 'Expected value not pass in editAccount function');

            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        accountCRUDServiceInstanceStub.editAccount = sinon.stub();
      });
    });
  });
});


describe('#accountsController - checkAccountSuppressionOrDuplicate', () => {
  describe('Check Account is Suppression or Duplicate', () => {
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
        accountControllerModule.checkAccountSuppressionOrDuplicate(settingsConfig, req, res, next)
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
        accountControllerModule.checkAccountSuppressionOrDuplicate(settingsConfig, req, res, next)
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
    context('Check If Account is Empty', () => {
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
            projectId: '222',
            accountId: '333',
          },
          query: {},
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
        accountControllerModule.checkAccountSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Body in Account object not Found'
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
    context('Check If get duplicate check errors while checking Account is duplicate or not Using the service function', () => {
      before(function () {
        accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate = sinon.stub().throws({
          code: 'DEDUPE_CHECK_ERROR',
          desc: 'Could Not Check Account, Something Went wrong while Dedupe Check'
        });
      });
      it('Should return `500` with error `DEDUPE_CHECK_ERROR`', (done) => {
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
            accountId: '222',
          },
          query: {},
          body: {
            name: 'TCS',
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
        accountControllerModule.checkAccountSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'DEDUPE_CHECK_ERROR',
              desc: 'Could Not Check Account, Something Went wrong while Dedupe Check'
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
        accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate = sinon.stub();
      });
    });
    context('Check If get suppression check errors while checking Account is suppressed or not Using the service function', () => {
      before(function () {
        accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate = sinon.stub().throws({
          code: 'SUPPRESSION_CHECK_ERROR',
          desc: 'Could Not Check Account, Something Went wrong while Suppression Check'
        });
      });
      it('Should return `500` with error `SUPPRESSION_CHECK_ERROR`', (done) => {
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
            accountId: '222',
          },
          query: {},
          body: {
            name: 'TCS',
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
        accountControllerModule.checkAccountSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'SUPPRESSION_CHECK_ERROR',
              desc: 'Could Not Check Account, Something Went wrong while Suppression Check'
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
        accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate = sinon.stub();
      });
    });
    context('Check If get any errors while editing Account data Using the service function', () => {
      before(function () {
        accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate = sinon.stub().throws(new Error('Something went wrong in check account is suppress or duplicate'));
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
            accountId: '222',
          },
          query: {},
          body: {
            name: 'TCS',
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
        accountControllerModule.checkAccountSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong in check account is suppress or duplicate',
              desc: 'Could Not Check Suppression/Duplicate'
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
        accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate = sinon.stub();
      });
    });
    context('Check if check account suppress or duplicate successfully', () => {
      before(function () {
        accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate = sinon.stub().returns('Account checked successfully');
      });
      it('Should return `200` with match result', (done) => {
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
            accountId: '222',
          },
          query: {
            checkSuppression: true,
            checkDuplicate: true,
          },
          body: {
            name: 'TCS',
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
        accountControllerModule.checkAccountSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = 'Account checked successfully';
            const account = req.body;
            const checkAccountSuppressionAndDuplicateInput = {
              checkSuppression: req.query.checkSuppression,
              checkDuplicate: req.query.checkDuplicate
            }

            expect(accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate.calledWithExactly(account, checkAccountSuppressionAndDuplicateInput)).to.equal(true, 'Expected value not pass in checkAccountSuppressionAndDuplicate function');
            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        accountCRUDServiceInstanceStub.checkAccountSuppressionAndDuplicate = sinon.stub();
      });
    });
  });
});

describe('#accountsController - get', function () {
  describe('Get All Accounts', function () {
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
          },
        };

        //Act
        accountControllerModule.get(settingsConfig, req, res, next)
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
        accountControllerModule.get(settingsConfig, req, res, next)
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
        accountControllerModule.get(settingsConfig, req, res, next)
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
        accountControllerModule.get(settingsConfig, req, res, next)
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
        accountControllerModule.get(settingsConfig, req, res, next)
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
        accountControllerModule.get(settingsConfig, req, res, next)
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
        accountControllerModule.get(settingsConfig, req, res, next)
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

    context('Check if correct params are passed for getting list of accounts', function () {
      before(function () {
        const accountRes = {
          totalCount: 0,
          docs: []
        };
        accountCRUDServiceInstanceStub.getAllAccount = sinon.stub().returns(accountRes);
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
      });
      it('Should return `200` with accounts list', function (done) {
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
        accountControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const filterColumns = {
              label: { type: 'string', operator: ['='] },
              createdAt: { type: 'array', operator: ['between'] },
              updatedAt: { type: 'array', operator: ['between'] },
              potential: { type: 'string', operator: ['=', '<', '>'] },
              disposition: { type: 'array', operator: ['='] },
              stage: { type: 'string', operator: ['='] },
              isAssigned: { type: 'string', operator: ['='] },
              masterDisposition: { type: 'string', operator: ['='] },
            };
            const sortableColumns = ['name', 'domain'];
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
            }

            const expectedGetAllAccountListArgs = {
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

            const actualGetAllAccountsFirstArgs = accountCRUDServiceInstanceStub.getAllAccount.getCall(0).args[0];
            const actualGetAllAccountsSecondArgs = accountCRUDServiceInstanceStub.getAllAccount.getCall(0).args[1];
            const actualGetAllAccountsThirdArgs = accountCRUDServiceInstanceStub.getAllAccount.getCall(0).args[2];
            const actualGetAllAccountsArgsLength = accountCRUDServiceInstanceStub.getAllAccount.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualFilterValidateFirstArg).to.deep.equal(expectedFilterValidateArgs.filterColumns, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateSecondArg).to.deep.equal(expectedFilterValidateArgs.filter, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateArgsLength).to.deep.equal(Object.keys(expectedFilterValidateArgs).length, 'Expected value not pass in filter validate function');

            expect(actualSortValidateFirstArg).to.deep.equal(expectedSortValidateArgs.sortableColumns, 'Expected value not pass in sort validate function');
            expect(actualSortValidateSecondArg).to.deep.equal(expectedSortValidateArgs.sort, 'Expected value not pass in sort validate function');
            expect(actualSortValidateThirdArg).to.deep.equal(expectedSortValidateArgs.multipleSort, 'Expected value not pass in sort validate function');
            expect(actualSortValidateArgsLength).to.deep.equal(Object.keys(expectedSortValidateArgs).length, 'Expected value not pass in sort validate function');

            expect(actualGetAllAccountsFirstArgs).to.deep.equal(expectedGetAllAccountListArgs.inputs, 'Expected value not pass in get all account function');
            expect(actualGetAllAccountsSecondArgs).to.deep.equal(expectedGetAllAccountListArgs.filter, 'Expected value not pass in get all account function');
            expect(actualGetAllAccountsThirdArgs).to.deep.equal(expectedGetAllAccountListArgs.filter, 'Expected value not pass in get all account function');
            expect(actualGetAllAccountsArgsLength).to.deep.equal(Object.keys(expectedGetAllAccountListArgs).length, 'Expected value not pass in get all account function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        accountCRUDServiceInstanceStub.getAllAccount = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting list of contacts', function () {
      before(function () {
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
        accountCRUDServiceInstanceStub.getAllAccount = sinon.stub().throws(new Error('Something went wrong'));
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
        accountControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Accounts'
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
        accountCRUDServiceInstanceStub.getAllAccount = sinon.stub();
      });
    });
  });
});