const sinon = require('sinon');
const chai = require('chai');
const proxyquire = require('proxyquire');
const { expect } = chai;
const { loggerMock } = require('../../../helper');
const { Account, Contact } = require('@nexsalesdev/dataautomation-datamodel');

// Build Mock For Dependant Services
const settingsConfig = {
  logger: loggerMock,
  config: {}
};

// Bind Mock to Actual Service
const ContactFinderService = proxyquire(
  '../../../../services/commonServices/contactFinder',
  {
    '../../config/settings/settings-config': settingsConfig
  }
);

const contactFinderService = new ContactFinderService();

let expectedResult;

describe('#contactFinder - findContact', () => {
  describe('should return a contactInstance of given contactId', () => {
    beforeEach(() => {
      contactId = '6087dc463e5c26006f114f2o';
      contactFindOneInput = {
        where: {
          id: contactId
        },
        include: [
          {
            model: Account
          }
        ]
      };
      contactFindOneOutput = {
        id: '6087dc463e5c26006f114f2o',
        researchStatus: 'QA',
        callingStatus: 'callStatus1',
        prefix: 'prefix',
        firstName: 'Kelly',
        lastName: 'Timpson',
        address: '{"city": "New York", "state": "state", "country": "country"}',
        email: 'kelly.timpson@active.com',
        genericEmail: '',
        zbDateAndTime: new Date(),
        phone: '9873456727',
        directPhone: '9873456717',
        jobTitle: 'Solution Operations Manager',
        jobLevel: 'Manager',
        jobDepartment: 'Operations',
        linkedInUrl: 'nexsales1@linkedin.in',
        stage: 'Working',
        complianceStatus: 'compliance',
        createdBy: '6087dc463e5c26006f114f2b',
        updatedBy: '6087dc463e5c26006f114f2b',
        createdAt: new Date('1995-12-17T03:24:00'),
        updatedAt: new Date('1995-12-17T03:24:00'),
        AccountId: '6087dc463e5c26006f114f2e',
        ProjectId: '01',
        ClientId: '6087dc463e5c26006f114f2d',
        middleName: 'as',
        website: 'abc.com',
        comments: 'comments',
        source: 'source',
        nsId: 'nsId1',
        zoomInfoContactId: 'zoomInfoId',
        screenshot: '',
        functions: '',
        disposition: 'QA',
        zb: '',
        gmailStatus: 'status1',
        mailTesterStatus: 'mailTestStatus',
        handles: '',
        emailDedupeKey: 'kellytimpsonactivecom',
        phoneDedupeKey: 'kellytimpson9873456717',
        companyDedupeKey: 'kellytimpsonlifecareassurance',
        label: 'inclusion',
        previous_researchStatus: 'QA',
        previous_callingStatus: 'previous_callStatus1',
        previous_prefix: 'previous_prefix',
        previous_firstName: 'previous_Kelly',
        previous_lastName: 'previous_Timpson',
        previous_address:
          '{"city": "previous_New York", "state": "previous_state", "country": "previous_country"}',
        previous_email: 'kelly.timpson@active.com',
        previous_genericEmail: 'previous',
        previous_zbDateAndTime: new Date(),
        previous_phone: '9873456727',
        previous_directPhone: '9873456717',
        previous_jobTitle: 'previous_Solution Operations Manager',
        previous_jobLevel: 'previous_Manager',
        previous_jobDepartment: 'previous_Operations',
        previous_linkedInUrl: 'nexsales1@linkedin.in',
        previous_stage: 'Working',
        previous_complianceStatus: 'previous_compliance',
        previous_middleName: 'previous_as',
        previous_website: 'abc.com',
        previous_comments: 'previous_comments',
        previous_source: 'previous_source',
        previous_nsId: 'previous_nsId1',
        previous_zoomInfoContactId: 'previous_zoomInfoId',
        previous_screenshot: 'previous',
        previous_functions: 'previous',
        previous_disposition: 'QA',
        previous_zb: '',
        previous_gmailStatus: 'previous_status1',
        previous_mailTesterStatus: 'previous_mailTestStatus',
        previous_handles: 'previous',
        previous_emailDedupeKey: 'kellytimpsonactivecom',
        previous_phoneDedupeKey: 'kellytimpson9873456717',
        previous_companyDedupeKey: 'kellytimpsonlifecareassurance',
        previous_label: 'inclusion'
      };

      //stub
      contactFindOne = sinon.stub(Contact, 'findOne');
    });

    afterEach(() => {
      //restore
      contactFindOne.restore();
    });

    context('When ContactId Is Undefined', () => {
      it('Should return a error BAD_CONTACT_ID', (done) => {
        //Arrange
        const expectedError = new Error();
        expectedError.message = 'contactId is required';
        expectedError.code = 'BAD_CONTACT_ID';

        //Act
        contactFinderService
          .findContact()
          .then(() => {
            const error = new Error(
              'Expected Function to throw an Error But Got Data'
            );
            done(error);
          })
          .catch((error) => {
            expect(error.message).to.equal(
              expectedError.message,
              'Error Code Does Not Match'
            );
            expect(error.code).to.equal(
              expectedError.code,
              'Error Code Does Not Match'
            );
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Sequelize Query Fails', () => {
        it('Should return a sequelize error', (done) => {
          //Arrange
          let expectedError = 'unexpected sequelize Query Error';
          contactFindOne.throws(new Error("unexpected sequelize Query Error"));
          
          //Act
          contactFinderService
            .findContact(contactId)
            .then(() => {
              const error = new Error(
                'Expected Function to throw an Error But Got Data'
              );
              done(error);
            })
            .catch((error) => {
            
              const actualErrMsg = error.message;
              expect(actualErrMsg).to.equal(
                expectedError,
                'Error Does Not Match'
              );
              done();
            })
            .catch((error) => {
              done(error);
            });
        });
      });

    context('When Contact Id Is Valid', () => {
      it('Should return a contactInstance for given contactId', (done) => {
        //Arrange
        contactFindOne.returns(contactFindOneOutput);

        //Act
        contactFinderService
          .findContact(contactId)
          .then((res) => {
            actualResult = res;

            //get called by args
            const contactFinderServiceArgs = contactFindOne.getCall(0).args[0];

            //expect query
            expect(contactFinderServiceArgs).to.deep.equal(
              contactFindOneInput,
              'Called Query & Expected Query for contact FindOne Differs'
            );
            
            //expect output
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(
                contactFindOneOutput,
              'expected & actual result are different'
            );
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Contact Id Is Valid', () => {
        it('Should return a null for given contactId', (done) => {
          //Arrange
          expectedResult = null;
          contactFindOne.returns();

          //Act
          contactFinderService
            .findContact(contactId)
            .then((res) => {
              actualResult = res;
            
              //get called by args
              const contactFinderServiceArgs = contactFindOne.getCall(0).args[0];
  
              //expect query
              expect(contactFinderServiceArgs).to.deep.equal(
                contactFindOneInput,
                'Called Query & Expected Query for contact FindOne Differs'
              );
              
              //expect output
              expect(actualResult).to.be.an('null');
              expect(actualResult).to.deep.equal(
                expectedResult,
                'expected & actual result are different'
              );
              done();
            })
            .catch((error) => {
              done(error);
            });
        });
    });
    
  });
});
