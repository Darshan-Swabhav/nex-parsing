const {
  expect
} = require('chai');
const sinon = require('sinon');
const {
  inspect
} = require('util');
const proxyquire = require('proxyquire');
const buildDedupeKeysModule = require('../../../../../../app/services/commonServices/buildDedupeKeys');
const {
  Contact,
  Sequelize
} = require('@nexsalesdev/dataautomation-datamodel');
const {
  Op
} = Sequelize;
const {
  set
} = require('lodash');

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {}
  }
};

const sanitizerInstanceStub = {
  sanitize: sinon.stub()
};
const SanitizerStub = sinon.stub().returns(sanitizerInstanceStub);

const templateCacheInstanceStub = {
  getTemplate: sinon.stub()
};
const TemplateCacheService = sinon.stub().returns(templateCacheInstanceStub);

const ContactService = proxyquire(
  '../../../../../services/clients/contacts/contactsService', {
    '../../../config/settings/settings-config': settingsConfig,
    '../../commonServices/sanitizer': SanitizerStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/templateCache': TemplateCacheService,
  }
);
const contactService = new ContactService();

describe('#contactsService - extractFieldsFromTemplate', () => {
  describe('Returns the array of contact fields that exist in the contact form template', () => {
    context('Check If ContactForm config data does not exist in a project template', () => {
      it('Returns an Empty Array', (done) => {
        const projectTemplates = {};
        try {
          const actualContactFields = contactService.extractFieldsFromTemplate(projectTemplates);
          const expectedContactFields = [];

          expect(actualContactFields).to.deep.equal(expectedContactFields);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
    context('Check If ContactForm config data exist in a project template', () => {
      it('Returns an Array of contact fields', (done) => {
        const projectTemplates = {};
        const contactFormConfig = [{
            "section": "Name",
            "order": 1,
            "fields": [{
              "id": "contact.firstName",
              "label": "First Name",
              "order": 11
            }]
          },
          {
            "section": "Address",
            "order": 4,
            "fields": [{
                "id": "contact.addressHQ.address1",
                "label": "Address 1",
                "order": 41
              },
              {
                "id": "contact.addressHQ.address2",
                "label": "Address 2",
                "order": 42
              }
            ]
          },
          {
            "section": "Misc",
            "order": 6,
            "fields": [{
                "id": "screenshot",
                "label": "Screenshot",
                "order": 61
              },
              {
                "id": "source",
                "label": "Source",
                "order": 62
              }
            ]
          }
        ];

        try {
          set(projectTemplates, 'config.forms.AgentContactWorkspace.config', contactFormConfig);

          const actualContactFields = contactService.extractFieldsFromTemplate(projectTemplates);
          const expectedContactFields = [
            "firstName",
            "address",
            "screenshot",
            "source"
          ];

          expect(actualContactFields).to.deep.equal(expectedContactFields);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

describe('#contactsService - checkContactReuse', () => {
  describe('Returns a contact that already exists in DB', () => {

    let contact, inputs, getMatchedContact, buildDedupeKeysStub, dateStub, contactFindOneStub, extractFieldsFromTemplateStub;
    let returnValueOfBuildDedupeKeys;
    const nowDate = new Date();

    before(() => {
      dateStub = sinon.stub(Date, 'now').returns(nowDate);
    });
    after(() => {
      dateStub.restore();
    });
    beforeEach(() => {
      contact = {
        id: '111',
        projectId: '222',
        templateId: '333',
        contactExpiry: '30',
        firstName: 'firstName',
        lastName: 'lastName',
        companyName: 'companyName',
        companyDomain: 'companyDomain',
        email: 'abc@gmail.com',
      };
      inputs = {
        clientId: '111',
        projectId: '222',
        contactExpiry: '30',
        templateId: '333',
      };
      getMatchedContact = true;
      returnValueOfBuildDedupeKeys = {
        fnLnCompany: `${contact.firstName}${contact.lastName}${contact.companyName}`,
        fnLnDomain: `${contact.firstName}${contact.lastName}${contact.companyDomain}`
      };
      sanitizerInstanceStub.sanitize = sinon.stub().returns(contact);
      buildDedupeKeysStub = sinon.stub(buildDedupeKeysModule, 'buildDedupeKeys').returns(returnValueOfBuildDedupeKeys);
      contactFindOneStub = sinon.stub(Contact, 'findOne');
      extractFieldsFromTemplateStub = sinon.stub(contactService, 'extractFieldsFromTemplate');
    });
    afterEach(() => {
      sanitizerInstanceStub.sanitize = sinon.stub();
      buildDedupeKeysStub.restore();
      contactFindOneStub.restore();
      extractFieldsFromTemplateStub.restore();
      templateCacheInstanceStub.getTemplate = sinon.stub();
    });

    context('Check If getting some errors in sanitizing contact data', () => {
      it('Throws an error', (done) => {
        // Arrange
        sanitizerInstanceStub.sanitize = sinon.stub().throws(new Error(
          'Something went wrong in sanitizing contact data',
        ));

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Something went wrong in sanitizing contact data';

            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    context('Check If templateId is Empty When user try to getting contact from DB', () => {
      it('Throws an error', (done) => {
        // Arrange
        inputs.templateId = '';

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Template Id is Required';

            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    context('Check If getting some errors in building dedupe keys', () => {
      it('Throws an error', (done) => {
        // Arrange
        buildDedupeKeysStub.restore();
        buildDedupeKeysStub = sinon.stub(buildDedupeKeysModule, 'buildDedupeKeys').throws(new Error(
          'Something went wrong in building dedupe keys',
        ));

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Something went wrong in building dedupe keys';

            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    context('Check If not found any dedupe key for getting existing contact', () => {
      it('Throws an error', (done) => {
        // Arrange
        buildDedupeKeysStub.restore();
        buildDedupeKeysStub = sinon.stub(buildDedupeKeysModule, 'buildDedupeKeys').returns({});
        contact.email = '';

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Could not build any key for check reused Contact';

            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    context('Check If getting some errors in getting contact from DB for matchType', () => {
      it('Throws an error', (done) => {
        // Arrange
        inputs.contactExpiry = '30';
        getMatchedContact = false
        contactFindOneStub.throws(new Error('Something went wrong in getting contact'));

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Something went wrong in getting contact';

            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    context('Check If getting some errors in getting template from DB for matchWith data', () => {
      it('Throws an error', (done) => {
        // Arrange
        inputs.contactExpiry = '0';
        getMatchedContact = true
        templateCacheInstanceStub.getTemplate.throws(new Error('Something went wrong in getting template'));

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Something went wrong in getting template';

            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    context('Check If getting some errors in extracting contact fields from template for matchWith data', () => {
      it('Throws an error', (done) => {
        // Arrange
        inputs.contactExpiry = '0';
        getMatchedContact = true
        extractFieldsFromTemplateStub.throws(new Error('Something went wrong in extracting contact fields from template'));

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Something went wrong in extracting contact fields from template';

            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    context('Check If getting some errors in getting contact from DB for matchWith data', () => {
      it('Throws an error', (done) => {
        // Arrange
        inputs.contactExpiry = '0';
        getMatchedContact = true
        contactFindOneStub.throws(new Error('Something went wrong in getting contact from DB'));

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error'
            );
            done(error);
          })
          .catch((err) => {
            // Assert
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Something went wrong in getting contact from DB';

            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    context('Check If all data valid for getting existing contact', () => {
      it('Return empty result when contactExpiry and getMatchedContact value is negative', (done) => {
        // Arrange
        inputs.contactExpiry = '0';
        getMatchedContact = false
        contact.companyDedupeKey = returnValueOfBuildDedupeKeys.fnLnCompany;
        contact.emailDedupeKey = returnValueOfBuildDedupeKeys.fnLnDomain;

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then((result) => {
            // Assert
            const actualResult = result;
            const expectedResult = {
              matchType: '',
              matchWith: {}
            };
            const actualInputOfSanitize = sanitizerInstanceStub.sanitize.getCall(0).args;
            const expectedInputOfSanitize = [contact];
            const actualInputOfBuildDedupeKeys = buildDedupeKeysStub.getCall(0).args;
            const expectedInputOfBuildDedupeKeys = [contact];

            expect(actualInputOfSanitize).to.deep.equal(expectedInputOfSanitize, 'Expected value not pass in sanitize function');
            expect(actualInputOfBuildDedupeKeys).to.deep.equal(expectedInputOfBuildDedupeKeys, 'Expected value not pass in buildDedupeKeys function');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Return empty result when contactExpiry is positive (getter then 0) but contact not get from DB', (done) => {
        // Arrange
        inputs.contactExpiry = '30';
        getMatchedContact = false
        contact.companyDedupeKey = returnValueOfBuildDedupeKeys.fnLnCompany;
        contact.emailDedupeKey = returnValueOfBuildDedupeKeys.fnLnDomain;
        contactFindOneStub.returns(null);
        const now = new Date(nowDate);
        const contactExpiry = parseInt(inputs.contactExpiry, 10);
        const expiryDate = new Date(
          new Date(now.setDate(now.getDate() - contactExpiry)).setHours(0, 0, 0, 0),
        )

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then((result) => {
            // Assert
            const actualResult = result;
            const expectedResult = {
              matchType: '',
              matchWith: {}
            };
            const actualInputOfSanitize = sanitizerInstanceStub.sanitize.getCall(0).args;
            const expectedInputOfSanitize = [contact];
            const actualInputOfBuildDedupeKeys = buildDedupeKeysStub.getCall(0).args;
            const expectedInputOfBuildDedupeKeys = [contact];
            const actualInputOfContactFindOne = contactFindOneStub.getCall(0).args;
            const expectedInputOfContactFindOne = [{
              attributes: ['id'],
              where: {
                ClientId: inputs.clientId,
                disposition: 'Contact Built',
                createdAt: {
                  [Op.gt]: expiryDate,
                },
                id: {
                  [Op.ne]: contact.id
                },
                [Op.or]: [{
                  email: contact.email
                }, {
                  emailDedupeKey: contact.emailDedupeKey
                }, {
                  companyDedupeKey: contact.companyDedupeKey
                }],
              },
              raw: true,
            }];

            expect(actualInputOfSanitize).to.deep.equal(expectedInputOfSanitize, 'Expected value not pass in sanitize function');
            expect(actualInputOfBuildDedupeKeys).to.deep.equal(expectedInputOfBuildDedupeKeys, 'Expected value not pass in buildDedupeKeys function');
            expect(inspect(actualInputOfContactFindOne, {
              depth: null
            })).to.deep.equal(
              inspect(expectedInputOfContactFindOne, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB'
            );
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Return matchType result when contactExpiry is positive (getter then 0) and contact get from DB', (done) => {
        // Arrange
        inputs.contactExpiry = '60';
        getMatchedContact = false
        contact.companyDedupeKey = returnValueOfBuildDedupeKeys.fnLnCompany;
        contact.emailDedupeKey = returnValueOfBuildDedupeKeys.fnLnDomain;
        contactFindOneStub.returns({
          firstName: 'abc'
        });
        const now = new Date(nowDate);
        const contactExpiry = parseInt(inputs.contactExpiry, 10);
        const expiryDate = new Date(
          new Date(now.setDate(now.getDate() - contactExpiry)).setHours(0, 0, 0, 0),
        )

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then((result) => {
            // Assert
            const actualResult = result;
            const expectedResult = {
              matchType: `Within ${contactExpiry} Days`,
              matchWith: {}
            };
            const actualInputOfSanitize = sanitizerInstanceStub.sanitize.getCall(0).args;
            const expectedInputOfSanitize = [contact];
            const actualInputOfBuildDedupeKeys = buildDedupeKeysStub.getCall(0).args;
            const expectedInputOfBuildDedupeKeys = [contact];
            const actualInputOfContactFindOne = contactFindOneStub.getCall(0).args;
            const expectedInputOfContactFindOne = [{
              attributes: ['id'],
              where: {
                ClientId: inputs.clientId,
                disposition: 'Contact Built',
                createdAt: {
                  [Op.gt]: expiryDate,
                },
                id: {
                  [Op.ne]: contact.id
                },
                [Op.or]: [{
                  email: contact.email
                }, {
                  emailDedupeKey: contact.emailDedupeKey
                }, {
                  companyDedupeKey: contact.companyDedupeKey
                }],
              },
              raw: true,
            }];

            expect(actualInputOfSanitize).to.deep.equal(expectedInputOfSanitize, 'Expected value not pass in sanitize function');
            expect(actualInputOfBuildDedupeKeys).to.deep.equal(expectedInputOfBuildDedupeKeys, 'Expected value not pass in buildDedupeKeys function');
            expect(inspect(actualInputOfContactFindOne, {
              depth: null
            })).to.deep.equal(
              inspect(expectedInputOfContactFindOne, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB'
            );
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Return empty result when getMatchedContact value is positive but contact not get from DB', (done) => {
        // Arrange
        inputs.contactExpiry = '0';
        getMatchedContact = true
        contact.companyDedupeKey = returnValueOfBuildDedupeKeys.fnLnCompany;
        contact.emailDedupeKey = returnValueOfBuildDedupeKeys.fnLnDomain;

        const returnValueOfGetTemplate = {
          id: '01',
          name: 'xin-xin'
        };
        const returnValueOfExtractFieldsFromTemplate = ['id', 'name'];
        templateCacheInstanceStub.getTemplate.returns(returnValueOfGetTemplate);
        extractFieldsFromTemplateStub.returns(returnValueOfExtractFieldsFromTemplate);
        contactFindOneStub.returns(null);

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then((result) => {
            // Assert
            const actualResult = result;
            const expectedResult = {
              matchType: '',
              matchWith: {}
            };
            const actualInputOfSanitize = sanitizerInstanceStub.sanitize.getCall(0).args;
            const expectedInputOfSanitize = [contact];
            const actualInputOfBuildDedupeKeys = buildDedupeKeysStub.getCall(0).args;
            const expectedInputOfBuildDedupeKeys = [contact];
            const actualInputOfGetTemplate = templateCacheInstanceStub.getTemplate.getCall(0).args;
            const expectedInputOfGetTemplate = [inputs.templateId];
            const actualInputOfExtractFieldsFromTemplate = extractFieldsFromTemplateStub.getCall(0).args;
            const expectedInputOfExtractFieldsFromTemplate = [returnValueOfGetTemplate];
            const actualInputOfContactFindOne = contactFindOneStub.getCall(0).args;
            const expectedInputOfContactFindOne = [{
              where: {
                ClientId: inputs.clientId,
                disposition: ['Contact Built', 'Contact Built/Reuse'],
                id: {
                  [Op.ne]: contact.id
                },
                [Op.or]: [{
                  email: contact.email
                }, {
                  emailDedupeKey: contact.emailDedupeKey
                }, {
                  companyDedupeKey: contact.companyDedupeKey
                }],
              },
              order: [
                ['createdAt', 'desc']
              ],
              attributes: returnValueOfExtractFieldsFromTemplate,
              raw: true,
            }];

            expect(actualInputOfSanitize).to.deep.equal(expectedInputOfSanitize, 'Expected value not pass in sanitize function');
            expect(actualInputOfBuildDedupeKeys).to.deep.equal(expectedInputOfBuildDedupeKeys, 'Expected value not pass in buildDedupeKeys function');
            expect(actualInputOfGetTemplate).to.deep.equal(expectedInputOfGetTemplate, 'Expected value not pass in getTemplate function');
            expect(actualInputOfExtractFieldsFromTemplate).to.deep.equal(expectedInputOfExtractFieldsFromTemplate, 'Expected value not pass in extractFieldsFromTemplate function');
            expect(inspect(actualInputOfContactFindOne, {
              depth: null
            })).to.deep.equal(
              inspect(expectedInputOfContactFindOne, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB'
            );
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Return matchWith result when getMatchedContact value is positive and contact get from DB', (done) => {
        // Arrange
        inputs.contactExpiry = '0';
        getMatchedContact = true
        contact.companyDedupeKey = returnValueOfBuildDedupeKeys.fnLnCompany;
        contact.emailDedupeKey = returnValueOfBuildDedupeKeys.fnLnDomain;

        const returnValueOfGetTemplate = {
          id: '01',
          name: 'xin-xin'
        };
        const returnValueOfExtractFieldsFromTemplate = ['id', 'name'];
        const returnValueOfContactFindOne = {
          firstName: 'abc',
          zb: 'invalid',
          zbDateAndTime: new Date()
        }
        templateCacheInstanceStub.getTemplate.returns(returnValueOfGetTemplate);
        extractFieldsFromTemplateStub.returns(returnValueOfExtractFieldsFromTemplate);
        contactFindOneStub.returns(returnValueOfContactFindOne);

        // Act
        contactService.checkContactReuse(contact, inputs, getMatchedContact)
          .then((result) => {
            // Assert
            const actualResult = result;
            const expectedResult = {
              matchType: '',
              matchWith: returnValueOfContactFindOne
            };
            delete expectedResult.matchWith.zb;
            delete expectedResult.matchWith.zbDateAndTime;
            const actualInputOfSanitize = sanitizerInstanceStub.sanitize.getCall(0).args;
            const expectedInputOfSanitize = [contact];
            const actualInputOfBuildDedupeKeys = buildDedupeKeysStub.getCall(0).args;
            const expectedInputOfBuildDedupeKeys = [contact];
            const actualInputOfGetTemplate = templateCacheInstanceStub.getTemplate.getCall(0).args;
            const expectedInputOfGetTemplate = [inputs.templateId];
            const actualInputOfExtractFieldsFromTemplate = extractFieldsFromTemplateStub.getCall(0).args;
            const expectedInputOfExtractFieldsFromTemplate = [returnValueOfGetTemplate];
            const actualInputOfContactFindOne = contactFindOneStub.getCall(0).args;
            const expectedInputOfContactFindOne = [{
              where: {
                ClientId: inputs.clientId,
                disposition: ['Contact Built', 'Contact Built/Reuse'],
                id: {
                  [Op.ne]: contact.id
                },
                [Op.or]: [{
                  email: contact.email
                }, {
                  emailDedupeKey: contact.emailDedupeKey
                }, {
                  companyDedupeKey: contact.companyDedupeKey
                }],
              },
              order: [
                ['createdAt', 'desc']
              ],
              attributes: returnValueOfExtractFieldsFromTemplate,
              raw: true,
            }];

            expect(actualInputOfSanitize).to.deep.equal(expectedInputOfSanitize, 'Expected value not pass in sanitize function');
            expect(actualInputOfBuildDedupeKeys).to.deep.equal(expectedInputOfBuildDedupeKeys, 'Expected value not pass in buildDedupeKeys function');
            expect(actualInputOfGetTemplate).to.deep.equal(expectedInputOfGetTemplate, 'Expected value not pass in getTemplate function');
            expect(actualInputOfExtractFieldsFromTemplate).to.deep.equal(expectedInputOfExtractFieldsFromTemplate, 'Expected value not pass in extractFieldsFromTemplate function');
            expect(inspect(actualInputOfContactFindOne, {
              depth: null
            })).to.deep.equal(
              inspect(expectedInputOfContactFindOne, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB'
            );
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
  });
});
