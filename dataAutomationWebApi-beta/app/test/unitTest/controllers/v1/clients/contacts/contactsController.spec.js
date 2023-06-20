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
    warn: () => {}
  }
};

const contactServiceInstanceStub = {
  checkContactReuse: sinon.stub()
};

const ContactService = sinon
  .stub()
  .returns(contactServiceInstanceStub);


const contactControllerModule = proxyquire(
  '../../../../../../controllers/v1/clients/contacts/contactsController', {
    '../../../../services/clients/contacts/contactsService': ContactService
  }
);


describe('#contactsController - validateDataForDedupeKeys', () => {
  describe('Validating contact data for creating DedupeKeys', () => {
    context('Check If Contact data is InValid', () => {
      it('Throw error', (done) => {
        try {
          const contact = {};
          contactControllerModule.validateDataForDedupeKeys(contact);

          const error = new Error(
            'This function could not throw expected error'
          );
          done(error);
        } catch (error) {
          // Assert
          const actualErrorMessage = error.message;
          const expectedErrorMessage = 'Required Contact Fields (firstName, lastName, email, companyName, companyDomain)';

          expect(actualErrorMessage).to.equal(expectedErrorMessage);
          done();
        }
      });
    });
    context('Check If contact data is Valid', () => {
      it('Should not throw error If the Email value is exist', (done) => {
        try {
          const contact = {email: 'abc@gmail.com'};
          contactControllerModule.validateDataForDedupeKeys(contact);

          done();
        } catch (error) {
          done(error);
        }
      });
      it('Should not throw error If data valid for create companyDedupe key', (done) => {
        try {
          const contact = {firstName: 'abc',lastName: 'pqr',companyName: 'xyz'};
          contactControllerModule.validateDataForDedupeKeys(contact);

          done();
        } catch (error) {
          done(error);
        }
      });
      it('Should not throw error If data valid for create companyDomainDedupe key', (done) => {
        try {
          const contact = {firstName: 'abc',lastName: 'pqr',companyDomain: 'xyz'};
          contactControllerModule.validateDataForDedupeKeys(contact);

          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

describe('#contactsController - checkContactReuse', () => {
  describe('Returns a contact that already exists in DB', () => {
    let req, contactControllerValidateDataForDedupeKeys;;
    const next = function (error, result) {
      if (error) throw error;
      return result;
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

    beforeEach(() => {
      req = {
        user: {
          sub: '111',
          roles: ['agent']
        },
        params: {
          clientId: '111'
        },
        body: {
          projectId: '222',
          templateId: '333',
          contactExpiry: '30'
        }
      };
    });

    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
        // Arrange
        req.user = {};

        //Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(() => {
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

    context('Check If the User role is invalid', () => {
      it('Should return `403` with `User Forbidden` error', (done) => {
        // Arrange
        req.user.roles = ['manager'];

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
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

    context('Check If not send any data of contact in the body of the request', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.body = {};

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
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

    context('Check If ClientId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.params.clientId = '';

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Client Id is Required'
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

    context('Check If ProjectId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.body.projectId = '';

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Project Id is Required'
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

    context('Check If TemplateId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.body.templateId = ''

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Template Id is Required'
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

    context('Check If ContactExpiry is invalid', () => {
      it('Should return `400` with `Bad Request` error When contactExpiry value is Empty', (done) => {
        // Arrange
        req.body.contactExpiry = ''

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Contact Expiry value is InCorrect'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should return `400` with `Bad Request` error When contactExpiry value is not a Number', (done) => {
        // Arrange
        req.body.contactExpiry = 'abc'

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Contact Expiry value is InCorrect'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should return `400` with `Bad Request` error When contactExpiry value is less then 0', (done) => {
        // Arrange
        req.body.contactExpiry = '-1'

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Contact Expiry value is InCorrect'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should return `400` with `Bad Request` error When contactExpiry value is getter then 360', (done) => {
        // Arrange
        req.body.contactExpiry = '361'

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Contact Expiry value is InCorrect'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should return `400` with `Bad Request` error When contactExpiry value is not divided by 30', (done) => {
        // Arrange
        req.body.contactExpiry = '31'

        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Contact Expiry value is InCorrect'
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

    context('Check If Required data not send in Body', () => {
      before(() => {
        contactControllerValidateDataForDedupeKeys = sinon.stub(contactControllerModule, 'validateDataForDedupeKeys').throws(new Error(
          'Required Contact Fields (firstName, lastName, email, companyName, companyDomain)',
        ));
      })
      after(() => {
        contactControllerValidateDataForDedupeKeys.restore();
      })
      it('Should return `400` with `Bad Request` error', (done) => {
        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Required Contact Fields (firstName, lastName, email, companyName, companyDomain)'
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

    context('Check If get any errors while getting existing contact data Using the service function', () => {
      before(() => {
        contactControllerValidateDataForDedupeKeys = sinon.stub(contactControllerModule, 'validateDataForDedupeKeys').returns();
        contactServiceInstanceStub.checkContactReuse = sinon.stub().throws(new Error('Something went wrong in getting existing contact data'));
      })
      after(() => {
        contactControllerValidateDataForDedupeKeys.restore();
        contactServiceInstanceStub.checkContactReuse = sinon.stub();
      })
      it('Should return `500` with error message', (done) => {
        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              desc: 'Could Not Check Reusable',
              err: 'Something went wrong in getting existing contact data'
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

    context('Check If the return a existing contact', () => {
      const returnValueOfCheckContactReuse = {
        matchType: 'Within 30 Days',
        matchWith: {
          firstName: 'abc'
        },
      };
      before(() => {
        contactControllerValidateDataForDedupeKeys = sinon.stub(contactControllerModule, 'validateDataForDedupeKeys').returns();
        contactServiceInstanceStub.checkContactReuse = sinon.stub().returns(returnValueOfCheckContactReuse);
      })
      after(() => {
        contactControllerValidateDataForDedupeKeys.restore();
        contactServiceInstanceStub.checkContactReuse = sinon.stub();
      })
      it('Should return `500` with error message', (done) => {
        // Act
        contactControllerModule
          .checkContactReuse(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = returnValueOfCheckContactReuse;

            const actualInputOfValidateDataForDedupeKeys = contactControllerValidateDataForDedupeKeys.getCall(0).args;
            const expectedInputOfValidateDataForDedupeKeys = [req.body];

            const actualInputOfCheckContactReuse = contactServiceInstanceStub.checkContactReuse.getCall(0).args;
            const expectedFirstArgsOfCheckContactReuse = req.body;
            const expectedSecondArgsOfCheckContactReuse = {
              clientId: req.params.clientId,
              projectId: req.body.projectId,
              contactExpiry: req.body.contactExpiry,
              templateId: req.body.templateId,
            };
            const expectedThirdArgsOfCheckContactReuse = true;
            const expectedInputOfCheckContactReuse = [expectedFirstArgsOfCheckContactReuse, expectedSecondArgsOfCheckContactReuse, expectedThirdArgsOfCheckContactReuse];

            expect(actualInputOfValidateDataForDedupeKeys).to.deep.equal(expectedInputOfValidateDataForDedupeKeys);
            expect(actualInputOfCheckContactReuse).to.deep.equal(expectedInputOfCheckContactReuse);
            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});
