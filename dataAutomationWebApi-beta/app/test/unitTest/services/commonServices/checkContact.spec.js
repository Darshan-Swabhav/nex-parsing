const proxyquire = require('proxyquire');
const sinon = require('sinon');
const {
    expect
} = require('chai')
const {
    loggerMock
} = require('../../../helper');

// Build Mock For Dependant Services 
const settingsConfig = {
    logger: loggerMock,
    config: {}
};

const contactFinderInstanceStub = {
    findContact: sinon.stub(),
};
const duplicateCheckerInstanceStub = {
    findContactDuplicate: sinon.stub(),
};
const suppressionCheckerInstanceStub = {
    findContactSuppression: sinon.stub(),
};

const contactFinderStub = sinon.stub().returns(contactFinderInstanceStub);
const duplicateCheckerStub = sinon.stub().returns(duplicateCheckerInstanceStub);
const suppressionCheckerStub = sinon.stub().returns(suppressionCheckerInstanceStub);

// Bind Mock to Actual Service 
const CheckContactService = proxyquire('../../../../services/commonServices/checkContact', {
    '../../config/settings/settings-config': settingsConfig,
    './duplicateChecker': duplicateCheckerStub,
    './suppressionChecker': suppressionCheckerStub,
    './contactFinder': contactFinderStub,
});
const checkContactService = new CheckContactService();

describe('#checkContact - check', () => {
    describe('should return a contact is duplicate or suppressed', () => {
        beforeEach(() => {
            //Arrange
            contactDTO = {
                id: '6087dc463e5c26006f114f2o',
                firstName: 'Kelly',
                lastName: 'Timpson',
                phone: '9873456727',
                email: 'kelly.timpson@active.com',
                companyName: 'active',
                //set buildDedupeKeys in the input object
                companyDedupeKey : 'kellytimpsonactive',
                emailDedupeKey : 'kellytimpsonactivecom',
                phoneDedupeKey : 'kellytimpson9873456727',
                emailNameDedupeKey : 'kellytimpson',
                emailDomainDedupeKey : 'active.com',
                duplicateOf : null
            };
            optionsDTO = {
                checkSuppression: true,
                checkDuplicate: true
            };
            existingContactInstance = {
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
                previous_address: '{"city": "previous_New York", "state": "previous_state", "country": "previous_country"}',
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
                previous_phoneDedupeKey: 'kellytimpson9873456727',
                previous_companyDedupeKey: 'kellytimpsonlifecareassurance',
                previous_label: 'inclusion',
            }
            expectedError = {}

            //duplicate
            duplicateContactInstance = {
                id: '9521dc463e5c26006f115g0u',
                firstName: 'Kelly',
                middleName: 'as',
                lastName: 'Timpson',
                phone: '9873456727',
                email: 'kelly.timpson@active.com',
                emailDedupeKey: 'kellytimpsonactivecom',
                phoneDedupeKey: 'kellytimpson9873456717',
                companyDedupeKey: 'kellytimpsonlifecareassurance',
            };
            duplicateContactResult = {
                isDuplicate: false,
                duplicateMatchCase: "NONE",
                duplicateWith: null,
            };

            //suppressed
            suppressedContactInstance = {
                id: "6087dc463e5c26006f114f2o",
                companyName: "active",
                duplicateOf: null,
                email: "kelly.timpson@active.com",
                firstName: "Kelly",
                label: "",
                lastName: "Timpson",
                phone: "9873456727",
                companyDedupeKey: "kellytimpsonactive",
                emailDedupeKey: "kellytimpsonactivecom",
                emailDomainDedupeKey: "active.com",
                emailNameDedupeKey: "kellytimpson",
                phoneDedupeKey: "kellytimpson9873456727"
            }
            suppressionContactResult = {
                isSuppressed: false,
                suppressionMatchCase: "NONE",
                suppressedWith: null,
                isFuzzySuppressed: false,
                fuzzyMatchCase: "NONE",
                fuzzyMatches: null,
            }

            expectedResult = {
                labeledContact: contactDTO,
                duplicateCheckResult: duplicateContactResult,
                suppressionCheckResult: suppressionContactResult,
            }
        });

        afterEach(() => {
            //restore
            contactFinderInstanceStub.findContact = sinon.stub();
            duplicateCheckerInstanceStub.findContactDuplicate = sinon.stub();
            suppressionCheckerInstanceStub.findContactSuppression = sinon.stub();
        });

        context('when contact with id is passed but contactInstance is not found by contactFinder', () => {
            it('should return a error with code BAD_CONTACT_ID', (done) => {
                //Arrange
                expectedError.code = 'BAD_CONTACT_ID';
                expectedError.message = 'Could Not Find Contact with ID: 6087dc463e5c26006f114f2o, Contact Reference Dose Not Exist';

                //stub
                contactFinderInstanceStub.findContact.returns(null);

                checkContactService
                    .check(contactDTO, optionsDTO)
                    .then((res) => {
                        const error = new Error(
                            'Expected Function to throw an Error But Got Data',
                        );
                        done(error);
                    })
                    .catch((error) => {
                        const actualError = error;
                        
                        //get contactFinder.findContact args
                        const actualFindContactArg = contactFinderInstanceStub.findContact.getCall(0).args[0];
                        const actualContactArgsLength = contactFinderInstanceStub.findContact.getCall(0).args.length;

                        //Assert
                        //assert contactFinder.findContact args
                        expect(actualFindContactArg).to.equal(
                            contactDTO.id,
                            'contactFinder.findContact called with wrong args',
                        );
                        expect(actualContactArgsLength).to.equal(
                            1,
                            'contactFinder.findContact args length is different',
                        );
                        
                        //assert Error
                        expect(actualError.code).to.equal(
                            expectedError.code,
                            'Error Code Does Not Match',
                        );
                        expect(actualError.message).to.equal(
                            expectedError.message,
                            'Error Code Does Not Match',
                        );

                        done(null);
                    })
                    .catch((error) => {
                        done(error);
                    })
            });
        });

        context('when duplicate contact is passed', () => {
            it('should return a matched duplicate contact instance', (done) => {
                //Arrange
                contactDTO.label = 'duplicate';
                contactDTO.duplicateOf = "9521dc463e5c26006f115g0u"

                //set duplicateContactResult
                duplicateContactResult.isDuplicate = true;
                duplicateContactResult.duplicateMatchCase = "EMAIL";
                duplicateContactResult.duplicateWith = duplicateContactInstance;

                //stub
                contactFinderInstanceStub.findContact.returns(existingContactInstance);
                duplicateCheckerInstanceStub.findContactDuplicate.returns(duplicateContactResult);

                checkContactService
                    .check(contactDTO, optionsDTO)
                    .then((res) => {
                        let actualResult = res;

                        //Assert

                        //get contactFinder.findContact args
                        const actualFindContactArg = contactFinderInstanceStub.findContact.getCall(0).args[0];
                        const actualContactArgsLength = contactFinderInstanceStub.findContact.getCall(0).args.length;

                        //get duplicateCheckerInstanceStub.findContactDuplicate args
                        const actualFindContactDuplicateArg = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args[0];
                        const actualFindContactDuplicateArgsLength = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args.length;
                        
                        //Assert
                        //assert contactFinder.findContact args
                        expect(actualFindContactArg).to.equal(
                            contactDTO.id,
                            'contactFinder.findContact called with wrong args',
                        );
                        expect(actualContactArgsLength).to.equal(
                            1,
                            'contactFinder.findContact args length is different',
                        );

                        //assert duplicateCheckerInstanceStub.findContactDuplicate args
                        expect(actualFindContactDuplicateArg).to.deep.equal(
                            {contact : contactDTO },
                             'duplicateCheckerInstanceStub.findContactDuplicate called with wrong args',
                        );
                        expect(actualFindContactDuplicateArgsLength).to.equal(
                            1,
                            'duplicateCheckerInstanceStub.findContactDuplicate args length is different',
                        );

                        //expect the result
                        expect(actualResult).to.be.an('object');
                        expect(actualResult).to.deep.equal(expectedResult);

                        done();
                    })
                    .catch((error) => {
                        done(error);
                    })
            });
        });

        context('when duplicateChecker.findContactDuplicate() throws error', () => {
            it('should return a error with code DEDUPE_CHECK_ERROR', (done) => {
                //Arrange
                duplicateContactResult.isDuplicate = true;
                duplicateContactResult.duplicateMatchCase = "EMAIL";
                duplicateContactResult.duplicateWith = duplicateContactInstance;

                expectedError.code = "DEDUPE_CHECK_ERROR";
                expectedError.desc = "Could Not Check Contact, Something Went wrong while Dedupe Check";

                //stub
                contactFinderInstanceStub.findContact.returns(existingContactInstance);
                duplicateCheckerInstanceStub.findContactDuplicate.throws(new Error('unexpected error'));

                checkContactService
                    .check(contactDTO, optionsDTO)
                    .then(() => {
                        const error = new error("Expected A Error But Got Some Response");
                        done(error);
                    })
                    .catch((error) => {
                        const actualError = error;
                        //Assert

                        //get contactFinder.findContact args
                        const actualFindContactArg = contactFinderInstanceStub.findContact.getCall(0).args[0];
                        const actualContactArgsLength = contactFinderInstanceStub.findContact.getCall(0).args.length;

                        //get duplicateCheckerInstanceStub.findContactDuplicate args
                        const actualFindContactDuplicateArg = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args[0];
                        const actualFindContactDuplicateArgsLength = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args.length;
                        
                        //Assert
                        //assert contactFinder.findContact args
                        expect(actualFindContactArg).to.equal(
                            contactDTO.id,
                            'contactFinder.findContact called with wrong args',
                        );
                        expect(actualContactArgsLength).to.equal(
                            1,
                            'contactFinder.findContact args length is different',
                        );

                        //assert duplicateCheckerInstanceStub.findContactDuplicate args
                        expect(actualFindContactDuplicateArg).to.deep.equal(
                            {contact : contactDTO },
                             'duplicateCheckerInstanceStub.findContactDuplicate called with wrong args',
                        );
                        expect(actualFindContactDuplicateArgsLength).to.equal(
                            1,
                            'duplicateCheckerInstanceStub.findContactDuplicate args length is different',
                        );

                        expect(actualError.code).to.equal(expectedError.code, 'Error code Different');
                        expect(actualError.desc).to.equal(expectedError.desc, 'Error desc Different');

                        done();
                    })
                    .catch((error) => {
                        done(error);
                    })
            });
        });

        context('when exact suppressed contact is passed ', () => {
            it('should return a matched suppressed contact instance', (done) => {
                //Arrange
                contactDTO.label= "Exact Suppressed"

                //set suppressionContactResult
                suppressionContactResult.isSuppressed = true;

                //set expectedResult
                expectedResult.labeledContact = suppressedContactInstance;

                //set suppressedContactInstance
                suppressedContactInstance.label = "Exact Suppressed";

                //stub
                contactFinderInstanceStub.findContact.returns(existingContactInstance);
                duplicateCheckerInstanceStub.findContactDuplicate.returns({});
                suppressionCheckerInstanceStub.findContactSuppression.returns(suppressionContactResult);

                checkContactService
                    .check(contactDTO, optionsDTO)
                    .then((res) => {
                        let actualResult = res;
                        
                        //Assert

                        //get contactFinder.findContact args
                        const actualFindContactArg = contactFinderInstanceStub.findContact.getCall(0).args[0];
                        const actualContactArgsLength = contactFinderInstanceStub.findContact.getCall(0).args.length;

                        //get duplicateCheckerInstanceStub.findContactDuplicate args
                        const actualFindContactDuplicateArg = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args[0];
                        const actualFindContactDuplicateArgsLength = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args.length;

                        //get suppressionCheckerInstanceStub.findContactSuppression args
                        const actualFindContactSuppressionArg = suppressionCheckerInstanceStub.findContactSuppression.getCall(0).args[0];
                        const actualFindContactSuppressionArgsLength = suppressionCheckerInstanceStub.findContactSuppression.getCall(0).args.length;

                        //Assert
                        //assert contactFinder.findContact args
                        expect(actualFindContactArg).to.equal(
                            contactDTO.id,
                            'contactFinder.findContact called with wrong args',
                        );
                        expect(actualContactArgsLength).to.equal(
                            1,
                            'contactFinder.findContact args length is different',
                        );

                        //assert duplicateCheckerInstanceStub.findContactDuplicate args
                        expect(actualFindContactDuplicateArg).to.deep.equal(
                            {contact : contactDTO },
                             'duplicateCheckerInstanceStub.findContactDuplicate called with wrong args',
                        );
                        expect(actualFindContactDuplicateArgsLength).to.equal(
                            1,
                            'duplicateCheckerInstanceStub.findContactDuplicate args length is different',
                        );

                        //assert suppressionCheckerInstanceStub.findContactSuppression args
                        expect(actualFindContactSuppressionArg).to.deep.equal(
                            {contact : contactDTO },
                             'suppressionCheckerInstanceStub.findContactSuppression called with wrong args',
                        );
                        expect(actualFindContactSuppressionArgsLength).to.equal(
                            1,
                            'suppressionCheckerInstanceStub.findContactSuppression args length is different',
                        );

                        //expect the result
                        expect(actualResult).to.be.an('object');
                        expect(actualResult).to.deep.equal(expectedResult);

                        done();
                    })
                    .catch((error) => {
                        done(error);
                    })
            });
        });

        context('when fuzzy suppressed contact is passed ', () => {
            it('should return a fuzzy suppressed contact instance', (done) => {
                //Arrange
                contactDTO.label= "Fuzzy Suppressed"

                //set suppressionContactResult
                suppressionContactResult.isFuzzySuppressed = true;

                //set expectedResult
                expectedResult.labeledContact = suppressedContactInstance;

                //set suppressedContactInstance
                suppressedContactInstance.label = "Fuzzy Suppressed";

                //stub
                contactFinderInstanceStub.findContact.returns(existingContactInstance);
                duplicateCheckerInstanceStub.findContactDuplicate.returns({});
                suppressionCheckerInstanceStub.findContactSuppression.returns(suppressionContactResult);

                checkContactService
                    .check(contactDTO, optionsDTO)
                    .then((res) => {
                        let actualResult = res;

                        //get contactFinder.findContact args
                        const actualFindContactArg = contactFinderInstanceStub.findContact.getCall(0).args[0];
                        const actualContactArgsLength = contactFinderInstanceStub.findContact.getCall(0).args.length;

                        //get duplicateCheckerInstanceStub.findContactDuplicate args
                        const actualFindContactDuplicateArg = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args[0];
                        const actualFindContactDuplicateArgsLength = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args.length;

                        //get suppressionCheckerInstanceStub.findContactSuppression args
                        const actualFindContactSuppressionArg = suppressionCheckerInstanceStub.findContactSuppression.getCall(0).args[0];
                        const actualFindContactSuppressionArgsLength = suppressionCheckerInstanceStub.findContactSuppression.getCall(0).args.length;

                        //Assert
                        //assert contactFinder.findContact args
                        expect(actualFindContactArg).to.equal(
                            contactDTO.id,
                            'contactFinder.findContact called with wrong args',
                        );
                        expect(actualContactArgsLength).to.equal(
                            1,
                            'contactFinder.findContact args length is different',
                        );

                        //assert duplicateCheckerInstanceStub.findContactDuplicate args
                        expect(actualFindContactDuplicateArg).to.deep.equal(
                            {contact : contactDTO },
                             'duplicateCheckerInstanceStub.findContactDuplicate called with wrong args',
                        );
                        expect(actualFindContactDuplicateArgsLength).to.equal(
                            1,
                            'duplicateCheckerInstanceStub.findContactDuplicate args length is different',
                        );

                        //assert suppressionCheckerInstanceStub.findContactSuppression args
                        expect(actualFindContactSuppressionArg).to.deep.equal(
                            {contact : contactDTO },
                             'suppressionCheckerInstanceStub.findContactSuppression called with wrong args',
                        );
                        expect(actualFindContactSuppressionArgsLength).to.equal(
                            1,
                            'suppressionCheckerInstanceStub.findContactSuppression args length is different',
                        );

                        //expect the result
                        expect(actualResult).to.be.an('object');
                        expect(actualResult).to.deep.equal(expectedResult);

                        done();
                    })
                    .catch((error) => {
                        done(error);
                    })
            });
        });

        context('when suppressionChecker.findContactSuppression() throws error', () => {
            it('should return a error with code SUPPRESSION_CHECK_ERROR', (done) => {
                //Arrange
                //set suppressionContactResult
                suppressionContactResult.isSuppressed = true;

                //set expectedResult
                expectedResult.labeledContact = suppressedContactInstance;

                //set expectedError
                expectedError.code = "SUPPRESSION_CHECK_ERROR";
                expectedError.desc = "Could Not Check Contact, Something Went wrong while Suppression Check";

                //stub
                contactFinderInstanceStub.findContact.returns(existingContactInstance);
                duplicateCheckerInstanceStub.findContactDuplicate.returns({});
                suppressionCheckerInstanceStub.findContactSuppression.throws(new Error('unexpected error'));

                checkContactService
                    .check(contactDTO, optionsDTO)
                    .then(() => {
                        const error = new error("Expected A Error But Got Some Response");
                        done(error);
                    })
                    .catch((error) => {
                        const actualError = error;

                        //get contactFinder.findContact args
                        const actualFindContactArg = contactFinderInstanceStub.findContact.getCall(0).args[0];
                        const actualContactArgsLength = contactFinderInstanceStub.findContact.getCall(0).args.length;

                        //get duplicateCheckerInstanceStub.findContactDuplicate args
                        const actualFindContactDuplicateArg = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args[0];
                        const actualFindContactDuplicateArgsLength = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args.length;

                        //get suppressionCheckerInstanceStub.findContactSuppression args
                        const actualFindContactSuppressionArg = suppressionCheckerInstanceStub.findContactSuppression.getCall(0).args[0];
                        const actualFindContactSuppressionArgsLength = suppressionCheckerInstanceStub.findContactSuppression.getCall(0).args.length;

                        //Assert
                        //assert contactFinder.findContact args
                        expect(actualFindContactArg).to.equal(
                            contactDTO.id,
                            'contactFinder.findContact called with wrong args',
                        );
                        expect(actualContactArgsLength).to.equal(
                            1,
                            'contactFinder.findContact args length is different',
                        );

                        //assert duplicateCheckerInstanceStub.findContactDuplicate args
                        expect(actualFindContactDuplicateArg).to.deep.equal(
                            {contact : contactDTO },
                             'duplicateCheckerInstanceStub.findContactDuplicate called with wrong args',
                        );
                        expect(actualFindContactDuplicateArgsLength).to.equal(
                            1,
                            'duplicateCheckerInstanceStub.findContactDuplicate args length is different',
                        );

                        //assert suppressionCheckerInstanceStub.findContactSuppression args
                        expect(actualFindContactSuppressionArg).to.deep.equal(
                            {contact : contactDTO },
                             'suppressionCheckerInstanceStub.findContactSuppression called with wrong args',
                        );
                        expect(actualFindContactSuppressionArgsLength).to.equal(
                            1,
                            'suppressionCheckerInstanceStub.findContactSuppression args length is different',
                        );

                        expect(actualError.code).to.equal(expectedError.code, 'Error code Different');
                        expect(actualError.desc).to.equal(expectedError.desc, 'Error desc Different');

                        done();
                    })
                    .catch((error) => {
                        done(error);
                    })
            });
        });

        context('when contact is neither duplicate or suppressed', () => {
            it('should return a given contact instance', (done) => {
                //set suppressedContactInstance
                contactDTO.label = "inclusion";
                contactDTO.duplicateOf = null;

                //stub
                contactFinderInstanceStub.findContact.returns(existingContactInstance);
                duplicateCheckerInstanceStub.findContactDuplicate.returns({});
                suppressionCheckerInstanceStub.findContactSuppression.returns({});

                checkContactService
                    .check(contactDTO, optionsDTO)
                    .then((res) => {
                        let actualResult = res;

                        //Assert

                        //get contactFinder.findContact args
                        const actualFindContactArg = contactFinderInstanceStub.findContact.getCall(0).args[0];
                        const actualContactArgsLength = contactFinderInstanceStub.findContact.getCall(0).args.length;

                        //get duplicateCheckerInstanceStub.findContactDuplicate args
                        const actualFindContactDuplicateArg = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args[0];
                        const actualFindContactDuplicateArgsLength = duplicateCheckerInstanceStub.findContactDuplicate.getCall(0).args.length;

                        //get suppressionCheckerInstanceStub.findContactSuppression args
                        const actualFindContactSuppressionArg = suppressionCheckerInstanceStub.findContactSuppression.getCall(0).args[0];
                        const actualFindContactSuppressionArgsLength = suppressionCheckerInstanceStub.findContactSuppression.getCall(0).args.length;

                        //Assert
                        //assert contactFinder.findContact args
                        expect(actualFindContactArg).to.equal(
                            contactDTO.id,
                            'contactFinder.findContact called with wrong args',
                        );
                        expect(actualContactArgsLength).to.equal(
                            1,
                            'contactFinder.findContact args length is different',
                        );

                        //assert duplicateCheckerInstanceStub.findContactDuplicate args
                        expect(actualFindContactDuplicateArg).to.deep.equal(
                            {contact : contactDTO },
                             'duplicateCheckerInstanceStub.findContactDuplicate called with wrong args',
                        );
                        expect(actualFindContactDuplicateArgsLength).to.equal(
                            1,
                            'duplicateCheckerInstanceStub.findContactDuplicate args length is different',
                        );

                        //assert suppressionCheckerInstanceStub.findContactSuppression args
                        expect(actualFindContactSuppressionArg).to.deep.equal(
                            {contact : contactDTO },
                             'suppressionCheckerInstanceStub.findContactSuppression called with wrong args',
                        );
                        expect(actualFindContactSuppressionArgsLength).to.equal(
                            1,
                            'suppressionCheckerInstanceStub.findContactSuppression args length is different',
                        );

                        //expect the result
                        expect(actualResult).to.be.an('object');
                        expect(actualResult).to.deep.equal(expectedResult);

                        done();
                    })
                    .catch((error) => {
                        done(error);
                    })
            });
        });
    })
})