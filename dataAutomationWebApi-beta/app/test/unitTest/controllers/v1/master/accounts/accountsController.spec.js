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
  getAllAccount: sinon.stub(),
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

const accountControllerModule = proxyquire('../../../../../../controllers/v1/master/accounts/accountsController', {
  '../../../../services/master/accounts/accountsService': AccountCRUDServiceStub,
  '../../../../services/helpers/paginationService': PaginationServiceStub,
  '@nexsalesdev/master-data-model/lib/services/filterHandler': FilterHandlerStub,
  '@nexsalesdev/master-data-model/lib/services/sortHandler': SortHandlerStub,
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
            email: 'dev.pmgr1@nexsales.com',
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
            email: 'dev.pmgr1@nexsales.com',
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
            email: 'dev.pmgr1@nexsales.com',
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
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
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
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
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
        accountControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const filterColumns = {
              name: { type: 'array', operator: ['='] },
              website: { type: 'array', operator: ['='] },
              type: { type: 'array', operator: ['='] },
              industry: { type: 'array', operator: ['=', 'isNull'] },
              subIndustry: { type: 'array', operator: ['=', 'isNull'] },
              sicCode: { type: 'array', operator: ['=', 'isNull'] },
              sicDescription: { type: 'array', operator: ['=', 'isNull'] },
              naicsCode: { type: 'array', operator: ['=', 'isNull'] },
              naicsDescription: { type: 'array', operator: ['=', 'isNull'] },
              employeeSize: { type: 'string', operator: ['<', '>'] },
              employeeRange: { type: 'array', operator: ['='] },
              revenue: { type: 'string', operator: ['<', '>'] },
              revenueRange: { type: 'array', operator: ['='] },
              tags: { type: 'string', operator: ['='] },
              country: { type: 'string', operator: ['=', 'isNull'] },
              updatedAt: { type: 'array', operator: ['between'] },
              technology: { type: 'array', operator: ['='] },
            };;
            const sortableColumns = ['name', 'employeeSize', 'updatedAt'];
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
              userEmail: req.user.email,
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

    context('Check if correct params are passed for getting list of accounts', function () {
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
            email: 'dev.pmgr1@nexsales.com',
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
              desc: 'Could Not Get Master Accounts'
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