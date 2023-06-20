const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {}
  }
};

const contactCRUDServiceInstanceStub = {
  getAllContact: sinon.stub(),
  getAllContactStats: sinon.stub(),
  getContactUpdatedBy: sinon.stub(),
  getContactDispositions: sinon.stub(),
  checkContactSuppressionAndDuplicate: sinon.stub()
};

const paginationServiceInstanceStub = {
  paginate: sinon.stub()
};

const ContactCRUDServiceStub = sinon
  .stub()
  .returns(contactCRUDServiceInstanceStub);

const PaginationServiceStub = sinon
  .stub()
  .returns(paginationServiceInstanceStub);

const filterHandlerInstanceStub = {
  validate: sinon.stub()
};

const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);

const sortHandlerInstanceStub = {
  validate: sinon.stub()
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const fileStreamServiceInstanceStub = {};

const FileStreamServiceStub = sinon
  .stub()
  .returns(fileStreamServiceInstanceStub);

const contactControllerModule = proxyquire(
  '../../../../../../controllers/v1/projects/contacts/contactsController',
  {
    '../../../../services/projects/contacts/contactsService':
      ContactCRUDServiceStub,
    '../../../../services/helpers/paginationService': PaginationServiceStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler':
      FilterHandlerStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler':
      SortHandlerStub,
    '../../../../services/stream/fileStreamService': FileStreamServiceStub
  }
);

describe('#contactsController - getAllContactStats', function () {
  describe('Get Contacts Stats', function () {
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
          }
        };

        //Act
        contactControllerModule
          .getAllContactStats(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error(
              'This function could not throw expected error'
            );
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
          }
        };

        // Act
        contactControllerModule
          .getAllContactStats(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route'
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
          }
        };

        // Act
        contactControllerModule
          .getAllContactStats(settingsConfig, req, res, next)
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
            roles: ['manager']
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
          }
        };

        // Act
        contactControllerModule
          .getAllContactStats(settingsConfig, req, res, next)
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
        filterHandlerInstanceStub.validate = sinon
          .stub()
          .throws(new Error('Value of filter is not correct'));
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
            sort: '{}'
          },
          user: {
            sub: '111',
            roles: ['manager']
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
          }
        };
        contactControllerModule
          .getAllContactStats(settingsConfig, req, res, next)
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
        const contactStatsRes = {
          researchStatus: {
            data: [
              {
                researchStatus: 'string',
                count: 0
              }
            ],
            totalCount: 0
          },
          stage: {
            data: [
              {
                stage: 'string',
                count: 0
              }
            ],
            totalCount: 0
          }
        };
        contactCRUDServiceInstanceStub.getAllContactStats = sinon
          .stub()
          .returns(contactStatsRes);
      });
      it('Should return `200` with contact stats data', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            filter: '{}',
            sort: '{}'
          },
          user: {
            sub: '111',
            roles: ['manager']
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
          }
        };
        contactControllerModule
          .getAllContactStats(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const filterColumns = {
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
              }
            };
            const filter = {};
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              researchStatus: {
                data: [
                  {
                    researchStatus: 'string',
                    count: 0
                  }
                ],
                totalCount: 0
              },
              stage: {
                data: [
                  {
                    stage: 'string',
                    count: 0
                  }
                ],
                totalCount: 0
              }
            };
            const expectedFilterValidateArgs = {
              filterColumns,
              filter
            };

            const inputs = {
              projectId: req.params.projectId
            };

            const expectedGetAllContactStatsArgs = {
              inputs,
              filter
            };

            const actualFilterValidateFirstArg =
              filterHandlerInstanceStub.validate.getCall(0).args[0];
            const actualFilterValidateSecondArg =
              filterHandlerInstanceStub.validate.getCall(0).args[1];
            const actualFilterValidateArgsLength =
              filterHandlerInstanceStub.validate.getCall(0).args.length;

            const actualGetAllContactStatsFirstArgs =
              contactCRUDServiceInstanceStub.getAllContactStats.getCall(0)
                .args[0];
            const actualGetAllContactStatsSecondArgs =
              contactCRUDServiceInstanceStub.getAllContactStats.getCall(0)
                .args[1];
            const actualGetAllContactStatsArgsLength =
              contactCRUDServiceInstanceStub.getAllContactStats.getCall(0).args
                .length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualFilterValidateFirstArg).to.deep.equal(
              expectedFilterValidateArgs.filterColumns,
              'Expected value not pass in filter validate function'
            );
            expect(actualFilterValidateSecondArg).to.deep.equal(
              expectedFilterValidateArgs.filter,
              'Expected value not pass in filter validate function'
            );
            expect(actualFilterValidateArgsLength).to.deep.equal(
              Object.keys(expectedFilterValidateArgs).length,
              'Expected value not pass in filter validate function'
            );

            expect(actualGetAllContactStatsFirstArgs).to.deep.equal(
              expectedGetAllContactStatsArgs.inputs,
              'Expected value not pass in get all contact stats function'
            );
            expect(actualGetAllContactStatsSecondArgs).to.deep.equal(
              expectedGetAllContactStatsArgs.filter,
              'Expected value not pass in get all contact stats function'
            );
            expect(actualGetAllContactStatsArgsLength).to.deep.equal(
              Object.keys(expectedGetAllContactStatsArgs).length,
              'Expected value not pass in get all contact stats function'
            );

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        contactCRUDServiceInstanceStub.getAllContactStats = sinon.stub();
      });
    });

    context('Check if correct params are passed', function () {
      before(function () {
        contactCRUDServiceInstanceStub.getAllContactStats = sinon
          .stub()
          .throws(new Error('Something went wrong'));
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
            sort: '{}'
          },
          user: {
            sub: '111',
            roles: ['manager']
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
          }
        };
        contactControllerModule
          .getAllContactStats(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Contacts Stats'
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
        contactCRUDServiceInstanceStub.getAllContactStats = sinon.stub();
      });
    });
  });
});

describe('#contactsController - getContactUniqueFields', () => {
  describe('Get Contacts Unique fields', () => {
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
          }
        };

        // Act
        contactControllerModule
          .getContactUniqueFields(settingsConfig, req, res, next)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Invalid token';

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
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
            roles: ['manager']
          },
          params: {
            projectId: ''
          },
          query: {
            field: 'disposition'
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
          }
        };

        // Act
        contactControllerModule
          .getContactUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
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
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check If "field" is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
            roles: ['manager']
          },
          params: {
            projectId: '01'
          },
          query: {
            field: ''
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
          }
        };

        // Act
        contactControllerModule
          .getContactUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'field is required'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('Check if correct params are passed', () => {
      before(() => {
        const contactUpdatedByRes = [
          'agent1@nexsales.com',
          'agent2@nexsales.com',
          'agent3@nexsales.com'
        ];
        const contactDispositionsRes = [
          'Contact Built',
          'Already in CRM - Suppression'
        ];
        contactCRUDServiceInstanceStub.getContactUpdatedBy = sinon
          .stub()
          .returns(contactUpdatedByRes);
        contactCRUDServiceInstanceStub.getContactDispositions = sinon
          .stub()
          .returns(contactDispositionsRes);
      });

      it('Should return `200` with unique list of Contacts Disposition data', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'disposition'
          },
          user: {
            sub: '111'
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
          }
        };
        contactControllerModule
          .getContactUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              'Contact Built',
              'Already in CRM - Suppression'
            ];
            const inputs = {
              projectId: req.params.projectId
            };

            const expectedGetContactDispositionArgs = {
              inputs
            };

            const actualGetContactDispositionArgs =
              contactCRUDServiceInstanceStub.getContactDispositions.getCall(0)
                .args[0];
            const actualGetContactDispositionArgsLength =
              contactCRUDServiceInstanceStub.getContactDispositions.getCall(0)
                .args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualGetContactDispositionArgs).to.deep.equal(
              expectedGetContactDispositionArgs.inputs,
              'Expected value not pass in get all contact disposition function'
            );
            expect(actualGetContactDispositionArgsLength).to.deep.equal(
              Object.keys(expectedGetContactDispositionArgs).length,
              'Expected value not pass in get all contact disposition function'
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Should return `200` with unique list of Contacts UpdatedBy data', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'updatedBy'
          },
          user: {
            sub: '111'
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
          }
        };
        contactControllerModule
          .getContactUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              'agent1@nexsales.com',
              'agent2@nexsales.com',
              'agent3@nexsales.com'
            ];
            const inputs = {
              projectId: req.params.projectId
            };

            const expectedGetContactUpdatedByArgs = {
              inputs
            };

            const actualGetContactUpdatedByArgs =
              contactCRUDServiceInstanceStub.getContactUpdatedBy.getCall(0)
                .args[0];
            const actualGetContactUpdatedByArgsLength =
              contactCRUDServiceInstanceStub.getContactUpdatedBy.getCall(0).args
                .length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualGetContactUpdatedByArgs).to.deep.equal(
              expectedGetContactUpdatedByArgs.inputs,
              'Expected value not pass in get all contact disposition function'
            );
            expect(actualGetContactUpdatedByArgsLength).to.deep.equal(
              Object.keys(expectedGetContactUpdatedByArgs).length,
              'Expected value not pass in get all contact disposition function'
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      after(() => {
        contactCRUDServiceInstanceStub.getContactUpdatedBy = sinon.stub();
        contactCRUDServiceInstanceStub.getContactDispositions = sinon.stub();
      });
    });

    context('Check if correct params are passed', () => {
      before(() => {
        contactCRUDServiceInstanceStub.getContactUpdatedBy = sinon
          .stub()
          .throws(new Error('Something went wrong'));
        contactCRUDServiceInstanceStub.getContactDispositions = sinon
          .stub()
          .throws(new Error('Something went wrong'));
      });
      it('Should return `500` when some internal error occurs in getContactDispositions', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'disposition'
          },
          user: {
            sub: '111'
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
          }
        };
        contactControllerModule
          .getContactUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Contacts Facets'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Should return `500` when some internal error occurs in getContactUpdatedBy', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'updatedBy'
          },
          user: {
            sub: '111'
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
          }
        };
        contactControllerModule
          .getContactUniqueFields(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Contacts Facets'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      after(() => {
        contactCRUDServiceInstanceStub.getContactDispositions = sinon.stub();
        contactCRUDServiceInstanceStub.getContactUpdatedBy = sinon.stub();
      });
    });
  });
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
          }
        };

        //Act
        contactControllerModule
          .get(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error(
              'This function could not throw expected error'
            );
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
          }
        };

        // Act
        contactControllerModule
          .get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'Forbidden Error',
              desc: 'User not access this route'
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
          }
        };

        // Act
        contactControllerModule
          .get(settingsConfig, req, res, next)
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
          offset: ''
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
            roles: ['manager']
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
          }
        };

        // Act
        contactControllerModule
          .get(settingsConfig, req, res, next)
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
          offset: ''
        });
        filterHandlerInstanceStub.validate = sinon
          .stub()
          .throws(new Error('Value of filter is not correct'));
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
            sort: '{}'
          },
          user: {
            sub: '111',
            roles: ['manager']
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
          }
        };
        contactControllerModule
          .get(settingsConfig, req, res, next)
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
          offset: ''
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
            roles: ['manager']
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
          }
        };

        // Act
        contactControllerModule
          .get(settingsConfig, req, res, next)
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
          offset: ''
        });
        sortHandlerInstanceStub.validate = sinon
          .stub()
          .throws(new Error('Value of sort is not correct'));
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
            sort: '{}'
          },
          user: {
            sub: '111',
            roles: ['manager']
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
          }
        };
        contactControllerModule
          .get(settingsConfig, req, res, next)
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

    context(
      'Check if correct params are passed for getting list of contacts',
      function () {
        before(function () {
          const contactRes = {
            totalCount: 0,
            docs: []
          };
          contactCRUDServiceInstanceStub.getAllContact = sinon
            .stub()
            .returns(contactRes);
          paginationServiceInstanceStub.paginate = sinon.stub().returns({
            limit: 0,
            offset: 0
          });
        });
        it('Should return `200` with contacts list', function (done) {
          // Arrange
          const next = function (error, result) {
            if (error) throw error;
            return result;
          };
          const req = {
            query: {
              filter: '{}',
              sort: '{}'
            },
            user: {
              sub: '111',
              roles: ['manager']
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
            }
          };
          contactControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const filterColumns = {
                companyName: { type: 'string', operator: ['=', 'isNull'] },
                domain: { type: 'string', operator: ['=', 'isNull'] },
                accountLabel: { type: 'string', operator: ['='] },
                contactLabel: { type: 'string', operator: ['='] },
                stage: { type: 'string', operator: ['='] },
                researchStatus: { type: 'array', operator: ['='] },
                updatedBy: { type: 'array', operator: ['=', 'isNull'] },
                updatedAt: { type: 'array', operator: ['between'] }
              };
              const sortableColumns = ['companyName', 'domain'];
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
                filter
              };

              const expectedSortValidateArgs = {
                sortableColumns,
                sort,
                multipleSort
              };

              const inputs = {
                projectId: req.params.projectId,
                userId: req.user.sub,
                limit: 0,
                offset: 0
              };

              const expectedGetAllContactListArgs = {
                inputs,
                filter,
                sort
              };

              const actualFilterValidateFirstArg =
                filterHandlerInstanceStub.validate.getCall(0).args[0];
              const actualFilterValidateSecondArg =
                filterHandlerInstanceStub.validate.getCall(0).args[1];
              const actualFilterValidateArgsLength =
                filterHandlerInstanceStub.validate.getCall(0).args.length;

              const actualSortValidateFirstArg =
                sortHandlerInstanceStub.validate.getCall(0).args[0];
              const actualSortValidateSecondArg =
                sortHandlerInstanceStub.validate.getCall(0).args[1];
              const actualSortValidateThirdArg =
                sortHandlerInstanceStub.validate.getCall(0).args[2];
              const actualSortValidateArgsLength =
                sortHandlerInstanceStub.validate.getCall(0).args.length;

              const actualGetAllContactsFirstArgs =
                contactCRUDServiceInstanceStub.getAllContact.getCall(0).args[0];
              const actualGetAllContactsSecondArgs =
                contactCRUDServiceInstanceStub.getAllContact.getCall(0).args[1];
              const actualGetAllContactsThirdArgs =
                contactCRUDServiceInstanceStub.getAllContact.getCall(0).args[2];
              const actualGetAllContactsArgsLength =
                contactCRUDServiceInstanceStub.getAllContact.getCall(0).args
                  .length;

              expect(actualStatusCode).to.equal(expectedStatusCode);
              expect(actualData).to.deep.equal(expectedData);

              expect(actualFilterValidateFirstArg).to.deep.equal(
                expectedFilterValidateArgs.filterColumns,
                'Expected value not pass in filter validate function'
              );
              expect(actualFilterValidateSecondArg).to.deep.equal(
                expectedFilterValidateArgs.filter,
                'Expected value not pass in filter validate function'
              );
              expect(actualFilterValidateArgsLength).to.deep.equal(
                Object.keys(expectedFilterValidateArgs).length,
                'Expected value not pass in filter validate function'
              );

              expect(actualSortValidateFirstArg).to.deep.equal(
                expectedSortValidateArgs.sortableColumns,
                'Expected value not pass in sort validate function'
              );
              expect(actualSortValidateSecondArg).to.deep.equal(
                expectedSortValidateArgs.sort,
                'Expected value not pass in sort validate function'
              );
              expect(actualSortValidateThirdArg).to.deep.equal(
                expectedSortValidateArgs.multipleSort,
                'Expected value not pass in sort validate function'
              );
              expect(actualSortValidateArgsLength).to.deep.equal(
                Object.keys(expectedSortValidateArgs).length,
                'Expected value not pass in sort validate function'
              );

              expect(actualGetAllContactsFirstArgs).to.deep.equal(
                expectedGetAllContactListArgs.inputs,
                'Expected value not pass in get all contact function'
              );
              expect(actualGetAllContactsSecondArgs).to.deep.equal(
                expectedGetAllContactListArgs.filter,
                'Expected value not pass in get all contact function'
              );
              expect(actualGetAllContactsThirdArgs).to.deep.equal(
                expectedGetAllContactListArgs.filter,
                'Expected value not pass in get all contact function'
              );
              expect(actualGetAllContactsArgsLength).to.deep.equal(
                Object.keys(expectedGetAllContactListArgs).length,
                'Expected value not pass in get all contact function'
              );

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
      }
    );

    context(
      'Check if correct params are passed for getting list of contacts',
      function () {
        before(function () {
          paginationServiceInstanceStub.paginate = sinon.stub().returns({
            limit: 0,
            offset: 0
          });
          contactCRUDServiceInstanceStub.getAllContact = sinon
            .stub()
            .throws(new Error('Something went wrong'));
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
              sort: '{}'
            },
            user: {
              sub: '111',
              roles: ['manager']
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
            }
          };
          contactControllerModule
            .get(settingsConfig, req, res, next)
            .then(function (result) {
              // Assert
              const actualStatusCode = result.statusCode;
              const actualData = result.data;
              const expectedStatusCode = 500;
              const expectedData = {
                err: 'Something went wrong',
                desc: 'Could Not Get Contacts'
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
      }
    );
  });
});

describe('#contactsController - checkContactSuppressionOrDuplicate', function () {
  describe('Returns a contact result duplicate/exact-suppressed or fuzzy-suppressed', function () {
    context('Check If User is Unauthorized', function () {
      it('Should return `401` with `Unauthorized` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };

        const req = {
          user: {
            // sub: ''
          },
          params: {
            projectId: ''
          },
          body: {
            contact: {}
          },
          query: {
            checkSuppression: false,
            checkDuplicate: false
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
          }
        };

        //Act
        contactControllerModule
          .checkContactSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('Expected Error But Got Some Data');
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
            sub: '111'
          },
          params: {},
          body: {
            contact: {}
          },
          query: {
            checkSuppression: false,
            checkDuplicate: false
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
          }
        };

        // Act
        contactControllerModule
          .checkContactSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'projectId is Required'
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

    context('Check If Contact is empty', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };

        const req = {
          user: {
            sub: '111'
          },
          params: {
            projectId: '01'
          },
          body: {
            contact: {}
          },
          query: {
            checkSuppression: false,
            checkDuplicate: false
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
          }
        };

        // Act
        contactControllerModule
          .checkContactSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Expected Contact Details in Request Body'
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

    context('Check If Contact is duplicate', function () {
      it('Should return `200` with duplicate contact Result', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };

        const req = {
          user: {
            sub: '111'
          },
          params: {
            projectId: '01'
          },
          body: {
            contact: {
              id: '6087dc463e5c26006f114f2o',
              firstName: 'Kelly',
              middleName: 'as',
              lastName: 'Timpson',
              email: 'kelly.timpson@active.com',
              phone: '9873456727',
              duplicateOf: '',
              companyDedupeKey: 'kellytimpsonactive',
              emailDedupeKey: 'kellytimpsonactivecom',
              phoneDedupeKey: 'kellytimpson9873456727',
              emailNameDedupeKey: 'kellytimpson',
              emailDomainDedupeKey: 'active.com',
              ProjectId: ''
            }
          },
          query: {
            checkSuppression: false,
            checkDuplicate: false
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
          }
        };

        const expectedResult = {
          matchType: 'duplicate',
          matchCase: 'Email',
          matchWith: {
            id: '6087dc463e5c26006f114f2o',
            firstName: 'Kelly',
            middleName: 'as',
            lastName: 'Timpson',
            email: 'kelly.timpson@active.com',
            phone: '9873456727',
            duplicateOf: '',
            companyDedupeKey: 'kellytimpsonactive',
            emailDedupeKey: 'kellytimpsonactivecom',
            phoneDedupeKey: 'kellytimpson9873456727',
            emailNameDedupeKey: 'kellytimpson',
            emailDomainDedupeKey: 'active.com',
            duplicateOf: '0922dc463e5c26006f11025g'
          }
        };

        const inputsDTO = {
          checkSuppression: true,
          checkDuplicate: true
        };

        contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.returns(
          expectedResult
        );

        // Act
        contactControllerModule
          .checkContactSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualResponse = result.data;
            const expectedStatusCode = 200;

            //get contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args
            const actualCheckContactSuppressionAndDuplicateArgs =
              contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.getCall(
                0
              ).args[0];
            const actualCheckContactSuppressionAndDuplicateArgsLength =
              contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.getCall(
                0
              ).args.length;

            //Assert
            //assert contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args
            expect(actualCheckContactSuppressionAndDuplicateArgs).to.deep.equal(
              req.body.contact,
              inputsDTO,
              'contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate called with wrong args'
            );
            expect(
              actualCheckContactSuppressionAndDuplicateArgsLength
            ).to.equal(
              2,
              'contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args length is different'
            );

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualResponse).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Check If Contact is Exact Suppressed', function () {
      it('Should return `200` with Exact Suppressed contact Result', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };

        const req = {
          user: {
            sub: '111'
          },
          params: {
            projectId: '01'
          },
          body: {
            contact: {
              id: '6087dc463e5c26006f114f2o',
              firstName: 'Kelly',
              middleName: 'as',
              lastName: 'Timpson',
              email: 'kelly.timpson@active.com',
              phone: '9873456727',
              duplicateOf: '',
              companyDedupeKey: 'kellytimpsonactive',
              emailDedupeKey: 'kellytimpsonactivecom',
              phoneDedupeKey: 'kellytimpson9873456727',
              emailNameDedupeKey: 'kellytimpson',
              emailDomainDedupeKey: 'active.com',
              ProjectId: ''
            }
          },
          query: {
            checkSuppression: false,
            checkDuplicate: false
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
          }
        };

        const expectedResult = {
          matchType: 'Exact Suppressed',
          matchCase: 'Email',
          matchWith: {
            id: '6087dc463e5c26006f114f2o',
            firstName: 'Kelly',
            middleName: 'as',
            lastName: 'Timpson',
            email: 'kelly.timpson@active.com',
            phone: '9873456727',
            duplicateOf: '',
            companyDedupeKey: 'kellytimpsonactive',
            emailDedupeKey: 'kellytimpsonactivecom',
            phoneDedupeKey: 'kellytimpson9873456727',
            emailNameDedupeKey: 'kellytimpson',
            emailDomainDedupeKey: 'active.com',
            duplicateOf: ''
          }
        };

        const inputsDTO = {
          checkSuppression: true,
          checkDuplicate: true
        };

        contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.returns(
          expectedResult
        );

        // Act
        contactControllerModule
          .checkContactSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualResponse = result.data;
            const expectedStatusCode = 200;

            //get contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args
            const actualCheckContactSuppressionAndDuplicateArgs =
              contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.getCall(
                0
              ).args[0];
            const actualCheckContactSuppressionAndDuplicateArgsLength =
              contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.getCall(
                0
              ).args.length;

            //Assert
            //assert contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args
            expect(actualCheckContactSuppressionAndDuplicateArgs).to.deep.equal(
              req.body.contact,
              inputsDTO,
              'contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate called with wrong args'
            );
            expect(
              actualCheckContactSuppressionAndDuplicateArgsLength
            ).to.equal(
              2,
              'contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args length is different'
            );

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualResponse).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Check If Contact is Fuzzy Suppressed', function () {
      it('Should return `200` with Fuzzy Suppressed contact Result', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };

        const req = {
          user: {
            sub: '111'
          },
          params: {
            projectId: '01'
          },
          body: {
            contact: {
              id: '6087dc463e5c26006f114f2o',
              firstName: 'Kelly',
              middleName: 'as',
              lastName: 'Timpson',
              email: 'kelly.timpson@active.com',
              phone: '9873456727',
              duplicateOf: '',
              companyDedupeKey: 'kellytimpsonactive',
              emailDedupeKey: 'kellytimpsonactivecom',
              phoneDedupeKey: 'kellytimpson9873456727',
              emailNameDedupeKey: 'kellytimpson',
              emailDomainDedupeKey: 'active.com',
              ProjectId: ''
            }
          },
          query: {
            checkSuppression: false,
            checkDuplicate: false
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
          }
        };

        const expectedResult = {
          matchType: 'Fuzzy Suppressed',
          matchCase: 'Email',
          matchWith: {
            id: '6087dc463e5c26006f114f2o',
            firstName: 'Kelly',
            middleName: 'as',
            lastName: 'Timpson',
            email: 'kelly.timpson@active.com',
            phone: '9873456727',
            duplicateOf: '',
            companyDedupeKey: 'kellytimpsonactive',
            emailDedupeKey: 'kellytimpsonactivecom',
            phoneDedupeKey: 'kellytimpson9873456727',
            emailNameDedupeKey: 'kellytimpson',
            emailDomainDedupeKey: 'active.com',
            duplicateOf: ''
          }
        };

        const inputsDTO = {
          checkSuppression: true,
          checkDuplicate: true
        };

        contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.returns(
          expectedResult
        );

        // Act
        contactControllerModule
          .checkContactSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualResponse = result.data;
            const expectedStatusCode = 200;

            //get contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args
            const actualCheckContactSuppressionAndDuplicateArgs =
              contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.getCall(
                0
              ).args[0];
            const actualCheckContactSuppressionAndDuplicateArgsLength =
              contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.getCall(
                0
              ).args.length;

            //Assert
            //assert contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args
            expect(actualCheckContactSuppressionAndDuplicateArgs).to.deep.equal(
              req.body.contact,
              inputsDTO,
              'contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate called with wrong args'
            );
            expect(
              actualCheckContactSuppressionAndDuplicateArgsLength
            ).to.equal(
              2,
              'contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args length is different'
            );

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualResponse).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Check If Contact is suppression', function () {
      it('Should return `500` with `Could Not Check Suppression` error ', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };

        const req = {
          user: {
            sub: '111'
          },
          params: {
            projectId: '01'
          },
          body: {
            contact: {
              id: '6087dc463e5c26006f114f2o',
              firstName: 'Kelly',
              middleName: 'as',
              lastName: 'Timpson',
              email: 'kelly.timpson@active.com',
              phone: '9873456727',
              duplicateOf: '',
              companyDedupeKey: 'kellytimpsonactive',
              emailDedupeKey: 'kellytimpsonactivecom',
              phoneDedupeKey: 'kellytimpson9873456727',
              emailNameDedupeKey: 'kellytimpson',
              emailDomainDedupeKey: 'active.com',
              ProjectId: ''
            }
          },
          query: {
            checkSuppression: false,
            checkDuplicate: false
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
          }
        };

        const inputsDTO = {
          checkSuppression: true,
          checkDuplicate: true
        };

        contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.throws(new Error())

        // Act
        contactControllerModule
          .checkContactSuppressionOrDuplicate(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualResponse = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              desc : 'Could Not Check Suppression',
              err : ''
            };

            //get contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args
            const actualCheckContactSuppressionAndDuplicateArgs =
              contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.getCall(
                0
              ).args[0];
            const actualCheckContactSuppressionAndDuplicateArgsLength =
              contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate.getCall(
                0
              ).args.length;

            //Assert
            //assert contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args
            expect(actualCheckContactSuppressionAndDuplicateArgs).to.deep.equal(
              req.body.contact,
              inputsDTO,
              'contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate called with wrong args'
            );
            expect(
              actualCheckContactSuppressionAndDuplicateArgsLength
            ).to.equal(
              2,
              'contactCRUDServiceInstanceStub.checkContactSuppressionAndDuplicate args length is different'
            );

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualResponse).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});
