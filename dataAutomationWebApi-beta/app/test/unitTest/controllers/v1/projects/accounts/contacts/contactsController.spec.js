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
  saveContact: sinon.stub(),
};

const ContactCRUDServiceStub = sinon
  .stub()
  .returns(contactCRUDServiceInstanceStub);


const contactControllerModule = proxyquire(
  '../../../../../../../controllers/v1/projects/accounts/contacts/contactsController',
  {
    '../../../../../services/projects/contacts/contactsService':
      ContactCRUDServiceStub,
  }
);

describe('#contactsController - post', function () {
  describe('Save Contacts', function () {
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
          }
        };

        //Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
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

    context('Check If Contact is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: ''
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'contact is required'
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
          },
          params: {
            projectId: ''
          },
          body: {
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
            }
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
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

    context('Check If AccountId is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '',
          },
          body: {
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
            }
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
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

    context('Check If ClientId is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            clientId: '',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
            }
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'clientId is required'
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

    context('Check If Contact FirstName is invalid', function () {
      it('Should return `400` with `Required params not passed` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            clientId: '111',
            contact: {
              firstName: '',
              lastName: 'Routers',
            }
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Required params not passed',
              desc: 'firstName,lastName   is required'
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

    context('Check If Contact LastName is invalid', function () {
      it('Should return `400` with `Required params not passed` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: '',
            }
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Required params not passed',
              desc: 'firstName,lastName   is required'
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

    context('Check If TaskLink Id is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
            },
            taskLink: {
              TaskId: '',
            }
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'TaskId is required'
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

    context('Check If Research Status is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: '',
            },
            taskLink: {
              TaskId: '111',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'researchStatus is required'
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

    context('Check If Task Disposition is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: 'Contact Built',
            },
            taskLink: {
              TaskId: '111',
              disposition: '',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'disposition is required'
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

    context('Check If Contact Disposition is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: '',
            },
            taskLink: {
              TaskId: '111',
              disposition: 'Contact Built',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'disposition is required'
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

    context('Check If Contact Expiry is invalid', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: 'Contact Built',
            },
            taskLink: {
              TaskId: '111',
              disposition: 'Contact Built',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
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

    context('Check If Contact Expiry is not a number (NAN)', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            contactExpiry: 'a',
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: 'Contact Built',
            },
            taskLink: {
              TaskId: '111',
              disposition: 'Contact Built',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
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

    context('Check If Contact Expiry is less than 0', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            contactExpiry: '-1',
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: 'Contact Built',
            },
            taskLink: {
              TaskId: '111',
              disposition: 'Contact Built',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
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

    context('Check If Contact Expiry is greater than 360', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            contactExpiry: '361',
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: 'Contact Built',
            },
            taskLink: {
              TaskId: '111',
              disposition: 'Contact Built',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
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

    context('Check If Contact Expiry is not a multiple of 30 days (1 month)', function () {
      it('Should return `400` with `Bad Request` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            contactExpiry: '363',
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: 'Contact Built',
            },
            taskLink: {
              TaskId: '111',
              disposition: 'Contact Built',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
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

    context('Check if Contact is saved successfully', function () {
      before(function () {
        contactCRUDServiceInstanceStub.saveContact = sinon.stub().returns('saved successfully');
      });
      it('Should return `201`', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            contactExpiry: '30',
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: 'Contact Built',
            },
            taskLink: {
              TaskId: '111',
              disposition: 'Contact Built',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 201;

            const saveContactInput = {
              contact: req.body.contact,
              inputs: {
                projectId: req.params.projectId,
                accountId: req.params.accountId,
                userId: req.user.sub,
                disposeContact: req.body.disposeContact,
                contactExpiry: req.body.contactExpiry,
                clientId: req.body.clientId,
              },
              taskLink: req.body.taskLink,
            };
            expect(contactCRUDServiceInstanceStub.saveContact.calledWithExactly(saveContactInput.contact, saveContactInput.inputs, saveContactInput.taskLink)).to.equal(true, 'Expected value not pass in saveContact function');

            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        contactCRUDServiceInstanceStub.saveContact = sinon.stub();
      });
    });

    context('Check If any errors are caught while saving Contact data using the service function', function () {
      before(function () {
        contactCRUDServiceInstanceStub.saveContact = sinon.stub().throws(new Error('Something went wrong in saving contact data'));
      });
      it('Should return `500` with error message', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {
            projectId: '111',
            accountId: '111',
          },
          body: {
            contactExpiry: '30',
            disposeContact: true,
            clientId: '111',
            contact: {
              firstName: 'Alan',
              lastName: 'Routers',
              researchStatus: 'QA',
              disposition: 'Contact Built',
            },
            taskLink: {
              TaskId: '111',
              disposition: 'Contact Built',
            },
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
          }
        };

        // Act
        contactControllerModule
          .post(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'UNEXPECTED_ERROR',
              desc: 'Something went wrong in saving contact data'
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
        contactCRUDServiceInstanceStub.saveContact = sinon.stub();
      });
    });
  });
});