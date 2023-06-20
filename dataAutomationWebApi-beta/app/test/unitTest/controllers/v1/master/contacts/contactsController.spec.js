const {
  expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const {
  GENERALIZED_FILTERS_OPERATOR,
} = require('../../../../../../constant');

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const contactCRUDServiceInstanceStub = {
  getAllContact: sinon.stub(),
};

const ContactCRUDServiceStub = sinon
  .stub()
  .returns(contactCRUDServiceInstanceStub);

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

const contactControllerModule = proxyquire('../../../../../../controllers/v1/master/contacts/contactsController', {
  '../../../../services/master/contacts/contactsService': ContactCRUDServiceStub,
  '../../../../services/helpers/paginationService': PaginationServiceStub,
  '@nexsalesdev/master-data-model/lib/services/filterHandler': FilterHandlerStub,
});

describe('#contactsController - get', function () {
  describe('Get All Contacts', function () {
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
        contactControllerModule.get(settingsConfig, req, res, next)
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
        contactControllerModule.get(settingsConfig, req, res, next)
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
        contactControllerModule.get(settingsConfig, req, res, next)
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
        contactControllerModule.get(settingsConfig, req, res, next)
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

    context('Check if correct params are passed for getting list of Contacts', function () {
      before(function () {
        const accountRes = {
          totalCount: 0,
          docs: []
        };
        contactCRUDServiceInstanceStub.getAllContact = sinon.stub().returns(accountRes);
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
      });
      it('Should return `200` with Contacts list', function (done) {
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
        contactControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const filterColumns = {
              locationCountry: {
                type: 'string',
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.EQUAL,
                  GENERALIZED_FILTERS_OPERATOR.ISNULL,
                ],
              },
              disposition: {
                type: 'string',
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.EQUAL,
                  GENERALIZED_FILTERS_OPERATOR.ISNULL,
                ],
              },
              domainStatus: {
                type: 'array',
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.EQUAL,
                  GENERALIZED_FILTERS_OPERATOR.ISNULL,
                ],
              },
              // GENERALIZED_FILTERS_OPERATOR.ISNULL,
              emailTags: {
                type: 'string',
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.EQUAL,
                  GENERALIZED_FILTERS_OPERATOR.ISNULL,
                ],
              },
              // GENERALIZED_FILTERS_OPERATOR.ISNULL,
              emailOpen: {
                type: 'string',
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              emailClick: {
                type: 'string',
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.EQUAL,
                  GENERALIZED_FILTERS_OPERATOR.ISNULL,
                ],
              },
              name: {
                type: 'array',
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              workEmail: {
                type: 'string',
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              jobTitle: {
                type: 'array',
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              jobLevel: {
                type: 'array',
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.EQUAL,
                  GENERALIZED_FILTERS_OPERATOR.ISNULL,
                ],
              },
              jobDepartment: {
                type: 'array',
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.EQUAL,
                  GENERALIZED_FILTERS_OPERATOR.ISNULL,
                ],
              },
              zbStatus: {
                type: 'array',
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.EQUAL,
                  GENERALIZED_FILTERS_OPERATOR.ISNULL,
                ],
              },
              updatedAt: {
                type: 'array',
                operator: [GENERALIZED_FILTERS_OPERATOR.BETWEEN],
              },
              AccountDomain: {
                type: "string",
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL]
                }
            };
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

            const expectedgetAllContactListArgs = {
              inputs,
              filter,
            }

            const actualFilterValidateFirstArg = filterHandlerInstanceStub.validate.getCall(0).args[0];
            const actualFilterValidateSecondArg = filterHandlerInstanceStub.validate.getCall(0).args[1];
            const actualFilterValidateArgsLength = filterHandlerInstanceStub.validate.getCall(0).args.length;

            const actualgetAllContactsFirstArgs = contactCRUDServiceInstanceStub.getAllContact.getCall(0).args[0];
            const actualgetAllContactsSecondArgs = contactCRUDServiceInstanceStub.getAllContact.getCall(0).args[1];
            const actualgetAllContactsArgsLength = contactCRUDServiceInstanceStub.getAllContact.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualFilterValidateFirstArg).to.deep.equal(expectedFilterValidateArgs.filterColumns, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateSecondArg).to.deep.equal(expectedFilterValidateArgs.filter, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateArgsLength).to.deep.equal(Object.keys(expectedFilterValidateArgs).length, 'Expected value not pass in filter validate function');

            expect(actualgetAllContactsFirstArgs).to.deep.equal(expectedgetAllContactListArgs.inputs, 'Expected value not pass in get all contact function');
            expect(actualgetAllContactsSecondArgs).to.deep.equal(expectedgetAllContactListArgs.filter, 'Expected value not pass in get all contact function');
            expect(actualgetAllContactsArgsLength).to.deep.equal(Object.keys(expectedgetAllContactListArgs).length, 'Expected value not pass in get all contact function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        contactCRUDServiceInstanceStub.getAllContact = sinon.stub();
        paginationServiceInstanceStub.paginate = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting list of Contacts', function () {
      before(function () {
        paginationServiceInstanceStub.paginate = sinon.stub().returns({
          limit: 0,
          offset: 0,
        });
        contactCRUDServiceInstanceStub.getAllContact = sinon.stub().throws(new Error('Something went wrong'));
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
        contactControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Master Contacts'
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
        contactCRUDServiceInstanceStub.getAllContact = sinon.stub();
      });
    });
  });
});