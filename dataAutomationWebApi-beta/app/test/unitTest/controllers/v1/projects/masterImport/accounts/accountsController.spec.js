const {
  expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const {
  GENERALIZED_FILTERS_OPERATOR,
  GENERALIZED_FILTERS_TYPE,
} = require('../../../../../../../../app/constant');

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const accountCRUDServiceInstanceStub = {
  injectAccountInDA: sinon.stub(),
};

const AccountCRUDServiceStub = sinon
  .stub()
  .returns(accountCRUDServiceInstanceStub);


const filterHandlerInstanceStub = {
  validate: sinon.stub(),
};

const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);

const sortHandlerInstanceStub = {
  validate: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const accountControllerModule = proxyquire('../../../../../../../controllers/v1/projects/masterImport/accounts/accountsController', {
  '../../../../../services/projects/masterImport/accounts/accountsService': AccountCRUDServiceStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler': FilterHandlerStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler': SortHandlerStub,
});

// describe('#accountsController - put', () => {
//   describe('Update account data', () => {
//     context('Check If User is Unauthorized', () => {
//       it('Should return `401` with `Unauthorized` error', (done) => {
//         // Arrange
//         const next = function (error, result) {
//           if (error) throw error;
//           return result;
//         };
//         const req = {
//           user: {
//             sub: ''
//           },
//           params: {},
//           query: {}
//         };
//         const res = {
//           statusCode: null,
//           data: null,
//           status: (code) => {
//             res.statusCode = code;
//             return res;
//           },
//           json: () => res,
//           send: (data) => {
//             res.data = data;
//             return res;
//           },
//         };

//         // Act
//         accountControllerModule.put(settingsConfig, req, res, next)
//           .then(function () {
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             // Assert
//             const actualStatusCode = err.statusCode;
//             const expectedStatusCode = 401;

//             expect(actualStatusCode).to.equal(expectedStatusCode);

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });
//     context('Check If ProjectId is invalid', () => {
//       it('Should return `400` with `Bad Request` error', (done) => {
//         // Arrange
//         const next = function (error, result) {
//           if (error) throw error;
//           return result;
//         };
//         const req = {
//           user: {
//             sub: '111',
//             roles: ['manager'],
//           },
//           params: {
//             projectId: ''
//           },
//           query: {}
//         };
//         const res = {
//           statusCode: null,
//           data: null,
//           status: (code) => {
//             res.statusCode = code;
//             return res;
//           },
//           json: () => res,
//           send: (data) => {
//             res.data = data;
//             return res;
//           },
//         };

//         // Act
//         accountControllerModule.put(settingsConfig, req, res, next)
//           .then(function (result) {
//             // Assert
//             const actualStatusCode = result.statusCode;
//             const actualData = result.data;
//             const expectedStatusCode = 400;
//             const expectedData = {
//               err: 'Bad Request',
//               desc: 'projectId is required'
//             };

//             expect(actualStatusCode).to.equal(expectedStatusCode);
//             expect(actualData).to.deep.equal(expectedData);

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });
//     context('Check If AccountId is invalid', () => {
//       it('Should return `400` with `Bad Request` error', (done) => {
//         // Arrange
//         const next = function (error, result) {
//           if (error) throw error;
//           return result;
//         };
//         const req = {
//           user: {
//             sub: '111',
//             roles: ['manager'],
//           },
//           params: {
//             projectId: '222',
//             accountId: ''
//           },
//           query: {}
//         };
//         const res = {
//           statusCode: null,
//           data: null,
//           status: (code) => {
//             res.statusCode = code;
//             return res;
//           },
//           json: () => res,
//           send: (data) => {
//             res.data = data;
//             return res;
//           },
//         };

//         // Act
//         accountControllerModule.put(settingsConfig, req, res, next)
//           .then(function (result) {
//             // Assert
//             const actualStatusCode = result.statusCode;
//             const actualData = result.data;
//             const expectedStatusCode = 400;
//             const expectedData = {
//               err: 'Bad Request',
//               desc: 'accountId is required'
//             };

//             expect(actualStatusCode).to.equal(expectedStatusCode);
//             expect(actualData).to.deep.equal(expectedData);

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });
//     context('Check If Account is Empty', () => {
//       it('Should return `400` with `Bad Request` error', (done) => {
//         // Arrange
//         const next = function (error, result) {
//           if (error) throw error;
//           return result;
//         };
//         const req = {
//           user: {
//             sub: '111',
//             roles: ['manager'],
//           },
//           params: {
//             projectId: '222',
//             accountId: '333',
//           },
//           query: {},
//           body: {},
//         };
//         const res = {
//           statusCode: null,
//           data: null,
//           status: (code) => {
//             res.statusCode = code;
//             return res;
//           },
//           json: () => res,
//           send: (data) => {
//             res.data = data;
//             return res;
//           },
//         };

//         // Act
//         accountControllerModule.put(settingsConfig, req, res, next)
//           .then(function (result) {
//             // Assert
//             const actualStatusCode = result.statusCode;
//             const actualData = result.data;
//             const expectedStatusCode = 400;
//             const expectedData = {
//               err: 'Bad Request',
//               desc: 'Body in Account object not Found'
//             };

//             expect(actualStatusCode).to.equal(expectedStatusCode);
//             expect(actualData).to.deep.equal(expectedData);

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });

//     context('Check If Account-Type is invalid', () => {
//       before(function () {
//         accountCRUDServiceInstanceStub.validateMandatoryFields = sinon.stub().returns({
//           valid: false,
//           description: 'Account Type is invalid',
//         });
//       });
//       it('Should return `400` with `Bad Request` error', (done) => {
//         // Arrange
//         const next = function (error, result) {
//           if (error) throw error;
//           return result;
//         };
//         const req = {
//           user: {
//             sub: '111',
//             roles: ['manager'],
//           },
//           params: {
//             projectId: '222',
//             accountId: '333'
//           },
//           query: {},
//           body: {
//             type : ""
//           },
//         };
//         const res = {
//           statusCode: null,
//           data: null,
//           status: (code) => {
//             res.statusCode = code;
//             return res;
//           },
//           json: () => res,
//           send: (data) => {
//             res.data = data;
//             return res;
//           },
//         };

//         // Act
//         accountControllerModule.put(settingsConfig, req, res, next)
//           .then(function (result) {
//             // Assert
//             const actualStatusCode = result.statusCode;
//             const actualData = result.data;
//             const expectedStatusCode = 400;
//             const expectedData = {
//               err: 'Bad Request',
//               desc: 'Account Type is invalid'
//             };

//             expect(actualStatusCode).to.equal(expectedStatusCode);
//             expect(actualData).to.deep.equal(expectedData);

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });


//     context('Check If get any errors while editing Account data Using the service function', () => {
//       before(function () {
//         accountCRUDServiceInstanceStub.editAccount = sinon.stub().throws(new Error('Something went wrong in editing account data'));
//         accountCRUDServiceInstanceStub.validateMandatoryFields = sinon.stub().returns({
//           valid: true,
//           description: '',
//         });
//       });
//       it('Should return `500` with error message', (done) => {
//         // Arrange
//         const next = function (error, result) {
//           if (error) throw error;
//           return result;
//         };
//         const req = {
//           user: {
//             sub: '111',
//             roles: ['manager'],
//           },
//           params: {
//             projectId: '111',
//             accountId: '222',
//           },
//           query: {},
//           body: {
//             name: 'TCS',
//             type: 'Parent'
//           },
//         };
//         const res = {
//           statusCode: null,
//           data: null,
//           status: (code) => {
//             res.statusCode = code;
//             return res;
//           },
//           json: () => res,
//           send: (data) => {
//             res.data = data;
//             return res;
//           },
//         };

//         // Act
//         accountControllerModule.put(settingsConfig, req, res, next)
//           .then(function (result) {
//             // Assert
//             const actualStatusCode = result.statusCode;
//             const actualData = result.data;
//             const expectedStatusCode = 500;
//             const expectedData = {
//               err: 'Something went wrong in editing account data',
//               desc: 'Could Not Get Account'
//             };

//             expect(actualStatusCode).to.equal(expectedStatusCode);
//             expect(actualData).to.deep.equal(expectedData);

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//       after(function () {
//         accountCRUDServiceInstanceStub.editAccount = sinon.stub();
//       });
//     });
//     context('Check if account edited successfully', () => {
//       before(function () {
//         accountCRUDServiceInstanceStub.editAccount = sinon.stub().returns('edit successfully');
//         accountCRUDServiceInstanceStub.validateMandatoryFields = sinon.stub().returns({
//           valid: true,
//           description: '',
//         });
//       });
//       it('Should return `200`', (done) => {
//         // Arrange
//         const next = function (error, result) {
//           if (error) throw error;
//           return result;
//         };
//         const req = {
//           user: {
//             sub: '111',
//             roles: ['manager'],
//           },
//           params: {
//             projectId: '111',
//             accountId: '222',
//           },
//           query: {},
//           body: {
//             name: 'TCS',
//             type: 'Parent'
//           },
//         };
//         const res = {
//           statusCode: null,
//           data: null,
//           status: (code) => {
//             res.statusCode = code;
//             return res;
//           },
//           json: () => res,
//           send: (data) => {
//             res.data = data;
//             return res;
//           },
//         };

//         // Act
//         accountControllerModule.put(settingsConfig, req, res, next)
//           .then(function (result) {
//             // Assert
//             const actualStatusCode = result.statusCode;
//             const expectedStatusCode = 200;

//             const editAccountInput = {
//               projectId: req.params.projectId,
//               accountId: req.params.accountId,
//               account: req.body,
//               userId: req.user.sub,
//             };
//             expect(accountCRUDServiceInstanceStub.editAccount.calledWithExactly(editAccountInput)).to.equal(true, 'Expected value not pass in editAccount function');

//             expect(actualStatusCode).to.equal(expectedStatusCode);

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//       after(function () {
//         accountCRUDServiceInstanceStub.editAccount = sinon.stub();
//       });
//     });
//   });
// });

describe('#accountsController - post', function () {
  describe('Import Accounts from Master', function () {
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
        accountControllerModule.post(settingsConfig, req, res, next)
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

    // context('Check If the User role is invalid', function () {
    //   it('Should return `403` with `User Forbidden` error', function (done) {
    //     // Arrange
    //     const next = function (error, result) {
    //       if (error) throw error;
    //       return result;
    //     };
    //     const req = {
    //       user: {
    //         sub: '111',
    //         roles: ['agent']
    //       },
    //       params: {
    //         projectId: ''
    //       },
    //       body: {},
    //     };
    //     const res = {
    //       statusCode: null,
    //       data: null,
    //       status: (code) => {
    //         res.statusCode = code;
    //         return res;
    //       },
    //       json: () => res,
    //       send: (data) => {
    //         res.data = data;
    //         return res;
    //       },
    //     };

    //     // Act
    //     accountControllerModule.post(settingsConfig, req, res, next)
    //       .then(function (result) {
    //         // Assert
    //         const actualStatusCode = result.statusCode;
    //         const actualData = result.data;
    //         const expectedStatusCode = 403;
    //         const expectedData = {
    //           err: 'Forbidden Error',
    //           desc: 'User not access this route',
    //         };

    //         expect(actualStatusCode).to.equal(expectedStatusCode);
    //         expect(actualData).to.deep.equal(expectedData);
    //         done();
    //       })
    //       .catch(function (err) {
    //         done(err);
    //       });
    //   });
    // });

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
        accountControllerModule.post(settingsConfig, req, res, next)
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
        accountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Filter is required'
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
        accountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Filter is required'
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

    context('Check If sort is invalid', function () {
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
          body: {
            filter: {},
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
        accountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Sort is required'
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

    context('Check If sort data is wrong', function () {
      before(function () {
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
          body: {
            filter: {},
            sort: {},
            limit: 10,
            fileName: 'Master Import',
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
        accountControllerModule.post(settingsConfig, req, res, next)
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
        sortHandlerInstanceStub.validate = sinon.stub();
      });
    });

    context('Check if correct params are passed for importing accounts from Master', function () {
      before(function () {
        const accountRes = {
          "uploadUrl": "https://storage.googleapis.com/da-local-files",
          "FILE_ID": "f5848b62-7cf0-46bf-be0e-37d933f129c1"
        };
        accountCRUDServiceInstanceStub.injectAccountInDA = sinon.stub().returns(accountRes);
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
          body: {
            filter: {},
            sort: {},
            limit: 10,
            fileName: 'Master Import',
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
        accountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const filterColumns = {
              keywords: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              type: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              employeeSize: {
                type: GENERALIZED_FILTERS_TYPE.STRING,
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.LESS_THAN,
                  GENERALIZED_FILTERS_OPERATOR.GREATER_THAN,
                ],
              },
              employeeSizeRange: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              revenue: {
                type: GENERALIZED_FILTERS_TYPE.STRING,
                operator: [
                  GENERALIZED_FILTERS_OPERATOR.LESS_THAN,
                  GENERALIZED_FILTERS_OPERATOR.GREATER_THAN,
                ],
              },
              revenueRange: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              sicCode: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              naicsCode: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              technology: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              industry: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              subIndustry: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              country: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              state: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
              countryZip: {
                type: GENERALIZED_FILTERS_TYPE.ARRAY,
                operator: [GENERALIZED_FILTERS_OPERATOR.EQUAL],
              },
            };
            const sortableColumns = ['employeeSize', 'revenue'];
            const multipleSort = false;
            const filter = {};
            const sort = {};
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = {
              "uploadUrl": "https://storage.googleapis.com/da-local-files",
              "FILE_ID": "f5848b62-7cf0-46bf-be0e-37d933f129c1"
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

            const expectedGetAllAccountListArgs = {
              projectId: '222',
              userId: '111',
              limit: 10,
              filter,
              sort,
              fileName: 'Master Import',
            };

            const actualFilterValidateFirstArg = filterHandlerInstanceStub.validate.getCall(0).args[0];
            const actualFilterValidateSecondArg = filterHandlerInstanceStub.validate.getCall(0).args[1];
            const actualFilterValidateArgsLength = filterHandlerInstanceStub.validate.getCall(0).args.length;

            const actualSortValidateFirstArg = sortHandlerInstanceStub.validate.getCall(0).args[0];
            const actualSortValidateSecondArg = sortHandlerInstanceStub.validate.getCall(0).args[1];
            const actualSortValidateThirdArg = sortHandlerInstanceStub.validate.getCall(0).args[2];
            const actualSortValidateArgsLength = sortHandlerInstanceStub.validate.getCall(0).args.length;

            const actualGetAllAccountsFirstArgs = accountCRUDServiceInstanceStub.injectAccountInDA.getCall(0).args[0];
            const actualGetAllAccountsArgsLength = accountCRUDServiceInstanceStub.injectAccountInDA.getCall(0).args.length;

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            expect(actualFilterValidateFirstArg).to.deep.equal(expectedFilterValidateArgs.filterColumns, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateSecondArg).to.deep.equal(expectedFilterValidateArgs.filter, 'Expected value not pass in filter validate function');
            expect(actualFilterValidateArgsLength).to.deep.equal(Object.keys(expectedFilterValidateArgs).length, 'Expected value not pass in filter validate function');

            expect(actualSortValidateFirstArg).to.deep.equal(expectedSortValidateArgs.sortableColumns, 'Expected value not pass in sort validate function');
            expect(actualSortValidateSecondArg).to.deep.equal(expectedSortValidateArgs.sort, 'Expected value not pass in sort validate function');
            expect(actualSortValidateThirdArg).to.deep.equal(expectedSortValidateArgs.multipleSort, 'Expected value not pass in sort validate function');
            expect(actualSortValidateArgsLength).to.deep.equal(Object.keys(expectedSortValidateArgs).length, 'Expected value not pass in sort validate function');

            expect(actualGetAllAccountsFirstArgs).to.deep.equal(expectedGetAllAccountListArgs, 'Expected value not pass in get all account function');
            expect(actualGetAllAccountsArgsLength).to.equal(1, 'Expected value not pass in get all account function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        accountCRUDServiceInstanceStub.injectAccountInDA = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting list of contacts', function () {
      before(function () {
        accountCRUDServiceInstanceStub.injectAccountInDA = sinon.stub().throws(new Error('Something went wrong'));
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
          body: {
            filter: {},
            sort: {},
            limit: 10,
            fileName: 'Master Import',
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
        accountControllerModule.post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;

            const expectedData = {
              desc: 'Something went wrong',
              err: 'Bad Request'
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
        accountCRUDServiceInstanceStub.injectAccountInDA = sinon.stub();
      });
    });
  });
});