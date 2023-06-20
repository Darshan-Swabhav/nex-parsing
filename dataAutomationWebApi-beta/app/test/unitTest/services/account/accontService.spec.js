const sinon = require('sinon');
const chai = require('chai');
const proxyquire = require('proxyquire');
const {
  expect
} = chai;
const {
  loggerMock
} = require('../../../helper');
const {
  Account
} = require('@nexsalesdev/dataautomation-datamodel');

// Build Mock For Dependant Services 
const settingsConfig = {
  logger: loggerMock,
  config: {}
};

const checkAccountInstanceStub = {
  check: sinon.stub()
};
const findAccountStub ={
  findAccount: sinon.stub(),
};

let accountCheckStub = sinon.stub().returns(checkAccountInstanceStub);
let accountFinderStub = sinon.stub().returns(findAccountStub);

// Bind Mock to Actual Service 
const AccountService = proxyquire('../../../../services/projects/accounts/accountsService', {
  '../../../config/settings/settings-config': settingsConfig,
  '../../commonServices/checkAccount': accountCheckStub,
  '../../commonServices/accountFinder': accountFinderStub,
});
const accountService = new AccountService();

describe('#accountService - checkAccountSuppressionAndDuplicate', () => {
  describe('Returns A Duplicate or Suppressed Check Result Of Given Account', () => {
    context('Check the given account is duplicate', () => {
      it('Should return a duplicate Check result of given Account', (done) => {
        //Arrange 
        const accountDTO = {
          id: '6087dc463e5c26006f114ddd'
        };
        const inputsDTO = {
          checkSuppression: true,
          checkDuplicate: true
        };
        const matchWithAccount = {
          name: "abelsontaylor",
          scrubbedName: "1031xgenomics1",
          website: "www.abelsontaylor.com",
          id: '6087dc463e5c26006f114ddd',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          linkedInUrl: null,
          nsId: null,
          phoneHQ: null,
        }
        const duplicateCheckResult = {
          isDuplicate: true,
          duplicateMatchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          duplicateWith: {
            id: '6087dc463e5c26006f114ddd',
            name: 'abelsontaylor',
            website: 'www.abelsontaylor.com',
            domain: 'abelsontaylor.com',
            scrubbedName: 'abelsontaylor',
            aliasName: 'abelsontaylor',
            tokens: 'abelsontaylor',
            nsId: null,
            phoneHQ: null,
            linkedInUrl: null
          }
        }
        const suppressionCheckResult = {
          isSuppressed: false,
          suppressionMatchCase: '',
          suppressedWith: null,
        }

        const checkAccountResult = {
          labeledAccount: {
            label: 'duplicate',
            duplicateOf: '7806dc463e5c26006f114eee',
          },
          duplicateCheckResult,
          suppressionCheckResult,
        }
        const expectedResult = {
          matchType: 'duplicate',
          matchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          matchWith: matchWithAccount
        }

        checkAccountInstanceStub.check.returns(checkAccountResult);

        //Act
        accountService
          .checkAccountSuppressionAndDuplicate(accountDTO, inputsDTO)
          .then((result) => {
            const actualResult = result;

            //Assert
            expect(actualResult).to.deep.equal(expectedResult);
            done();
          })
          .catch((error) => {
            done(error);
          })
      });

      it('Should return a suppressed Check result of given Account', (done) => {
        //Arrange 
        const accountDTO = {
          id: '6087dc463e5c26006f114ddd'
        };
        const inputsDTO = {
          checkSuppression: true,
          checkDuplicate: true
        };
        const accountInstance = {
          id: '6087dc463e5c26006f114ddd',
          name: 'abelsontaylor',
          website: 'www.abelsontaylor.com',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          nsId: null,
          phoneHQ: null,
          linkedInUrl: null
        }
        const suppressionCheckResult = {
          isSuppressed: true,
          suppressionMatchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          suppressedWith: accountInstance,
        };
        const duplicateCheckResult = {
          isSuppressed: false,
          suppressionMatchCase: '',
          suppressedWith: {},
        }
        const checkAccountResult = {
          suppressionCheckResult,
          duplicateCheckResult
        }

        const expectedResult = {
          matchType: 'suppressed',
          matchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          matchWith: accountInstance
        }

        checkAccountInstanceStub.check.returns(checkAccountResult);

        //Act
        accountService
          .checkAccountSuppressionAndDuplicate(accountDTO, inputsDTO)
          .then((result) => {
            const actualResult = result;

            //Assert
            expect(actualResult).to.deep.equal(expectedResult);
            done();
          })
          .catch((error) => {
            done(error);
          })

      });
    });
  });
});

describe('#accountService - updateAccount', () => {
    describe('Returns A Updated Account Instance', () => {
      context('Check Input Account is given or not', () => {
        it('Should return error `BAD_ACCOUNT_DATA` with `Could Not Update Account,Account Is Missing`', (done) => {
          //Arrange 
          const expectedError = {
            code : 'BAD_ACCOUNT_DATA',
            desc: `Could Not Update Account,Account Is Missing` 
          }

          //Act
          accountService
            .updateAccount()
            .then((result)=>{
              const error = new Error('Expected Function To Throw An Error But Got Data');
              done(error);
            })
            .catch((error)=>{
              const actualError = error;

              //Assert
              expect(actualError.code).to.equal(
                expectedError.code,
                'Error Code Does Not Match',);

              expect(actualError.desc).to.equal(
                expectedError.desc,
                'Error Code Does Not Match',);
              done(null);
            })
            .catch((error)=>{
              done(error);
            })
        });
      });

      context('Check For Account Instance', () => {
        it('Should return error `BAD_ACCOUNT_DATA` with `Could Not Find Account With ID 6087dc463e5c26006f114ddd`', (done) => {
          //Arrange 
          const accountDTO = {
            id: '6087dc463e5c26006f114ddd',
            name: 'AbelsonTaylor',
            zoomInfoName: 'zoomInfo',
            researchStatus: 'status1',
            callingStatus: 'callStatus1',
            domain: 'abelsontaylor.com',
            scrubbedName: 'abelsontaylor',
            aliasName: '',
            tokens: 'abelsontaylor',
            industry: 'Manufacturing',
            subIndustry: 'Detroit',
            locationLI: '',
            linkedInUrl: '',
            revenue_M_B_K: '',
            employeeSizeLI: '10',
            employeeSizeZ_plus: '10',
            employeeSizeFinalBucket: '30',
            employeeSize_others: '60',
            employeeRangeLI: '10-40',
            stage: 'Working',
            complianceStatus: 'compliance',
            disposition: 'Contact Found: Email Bad',
            comments: '',
            description: '',
            addressHQ: '{"city": "Detroit", "state": "state", "country": "country"}',
            revenue: '[10000,20000]',
            employeeSize: '[30,50]',
            upperRevenue: 20000,
            lowerRevenue: 10000,
            upperEmployeeSize: 50,
            lowerEmployeeSize: 30,
            createdBy: '6087dc463e5c26006f114f2b',
            updatedBy: '6087dc463e5c26006f114f2b',
            createdAt: new Date('2020-06-17T03:24:00'),
            updatedAt: new Date('2020-06-17T03:24:00'),
            ProjectId: '01',
            website: 'abc.com',
            segment_technology: ['tech1'],
            nsId: 'nsId1',
            zoomInfoContactId: 'zoomInfoContactId1',
            sicCode: 'sic',
            naicsCode: 'naics',
            employeeSourceLI: 'empSource1',
            employeeSourceZ_plus: 'empSource1',
            sicDescription: 'sicDescription',
            naicsDescription: 'naicsDescription',
            source: 'source',
            phoneHQ: 'phone1',
            email: 'abc@gmail.com',
            label: 'inclusion',
          };
          const expectedError = {
            desc : `Could Not Find Account With ID ${accountDTO.id}`,
            code : `BAD_ACCOUNT_ID`
          }
          findAccountStub.findAccount.returns(null);
          
          //Act
          accountService
            .updateAccount(accountDTO)
            .then((result) => {
              const error = new Error('Expected Function To Throw An Error But Got Data');
              done(error);
            })
            .catch((error)=>{
              const actualError = error;

              //Assert
              expect(actualError.desc).to.equal(expectedError.desc,'Error Desc Does Not Match');
              expect(actualError.code).to.equal(expectedError.code,'Error Code Does Not Match');
              done();
            })
            .catch((error)=>{
              done(error);
            })
        });

        it('Should return updatedAccountInstance', (done) => {
          //Arrange 
          const accountDTO = {
            id: '6087dc463e5c26006f114ddd',
            name: 'AbelsonTaylor',
            zoomInfoName: 'zoomInfo',
            researchStatus: 'status1',
            callingStatus: 'callStatus1',
            domain: 'abelsontaylor.com',
            scrubbedName: 'abelsontaylor',
            aliasName: '',
            tokens: 'abelsontaylor',
            industry: 'Manufacturing',
            subIndustry: 'Detroit',
            locationLI: '',
            linkedInUrl: '',
            revenue_M_B_K: '',
            employeeSizeLI: '10',
            employeeSizeZ_plus: '10',
            employeeSizeFinalBucket: '30',
            employeeSize_others: '60',
            employeeRangeLI: '10-40',
            stage: 'Working',
            complianceStatus: 'compliance',
            disposition: 'Contact Found: Email Bad',
            comments: '',
            description: '',
            addressHQ: '{"city": "Detroit", "state": "state", "country": "country"}',
            revenue: '[10000,20000]',
            employeeSize: '[30,50]',
            upperRevenue: 20000,
            lowerRevenue: 10000,
            upperEmployeeSize: 50,
            lowerEmployeeSize: 30,
            createdBy: '6087dc463e5c26006f114f2c',
            updatedBy: '6087dc463e5c26006f114f2c',
            createdAt: new Date('2020-06-17T03:24:00'),
            updatedAt: new Date('2020-06-17T03:24:00'),
            ProjectId: '01',
            website: 'abc.com',
            segment_technology: ['tech1'],
            nsId: 'nsId1',
            zoomInfoContactId: 'zoomInfoContactId1',
            sicCode: 'sic',
            naicsCode: 'naics',
            employeeSourceLI: 'empSource1',
            employeeSourceZ_plus: 'empSource1',
            sicDescription: 'sicDescription',
            naicsDescription: 'naicsDescription',
            source: 'source',
            phoneHQ: 'phone1',
            email: 'abc@gmail.com',
            label: 'inclusion',
          };
          const accountInstance = {
            dataValues :{
              id: '6087dc463e5c26006f114ddd',
              name: 'AbelsonTaylor',
              zoomInfoName: 'zoomInfo',
              researchStatus: 'status1',
              callingStatus: 'callStatus1',
              domain: 'abelsontaylor.com',
              scrubbedName: 'abelsontaylor',
              aliasName: '',
              tokens: 'abelsontaylor',
              industry: 'Manufacturing',
              subIndustry: 'Detroit',
              locationLI: '',
              linkedInUrl: '',
              revenue_M_B_K: '',
              employeeSizeLI: '10',
              employeeSizeZ_plus: '10',
              employeeSizeFinalBucket: '30',
              employeeSize_others: '60',
              employeeRangeLI: '10-40',
              stage: 'Working',
              complianceStatus: 'compliance',
              disposition: 'Contact Found: Email Bad',
              comments: '',
              description: '',
              addressHQ: '{"city": "Detroit", "state": "state", "country": "country"}',
              revenue: '[10000,20000]',
              employeeSize: '[30,50]',
              upperRevenue: 20000,
              lowerRevenue: 10000,
              upperEmployeeSize: 50,
              lowerEmployeeSize: 30,
              createdBy: '6087dc463e5c26006f114f2c',
              updatedBy: '6087dc463e5c26006f114f2c',
              createdAt: new Date('2020-06-17T03:24:00'),
              updatedAt: new Date('2020-06-17T03:24:00'),
              ProjectId: '01',
              website: 'abc.com',
              segment_technology: ['tech1'],
              nsId: 'nsId1',
              zoomInfoContactId: 'zoomInfoContactId1',
              sicCode: 'sic',
              naicsCode: 'naics',
              employeeSourceLI: 'empSource1',
              employeeSourceZ_plus: 'empSource1',
              sicDescription: 'sicDescription',
              naicsDescription: 'naicsDescription',
              source: 'source',
              phoneHQ: 'phone1',
              email: 'abc@gmail.com',
              label: 'inclusion',
            },
            changed: (()=>{}),
            save: (()=>{ return accountInstance.dataValues})
          };
          const expectedResult =  {
            id: '6087dc463e5c26006f114ddd',
            name: 'AbelsonTaylor',
            zoomInfoName: 'zoomInfo',
            researchStatus: 'status1',
            callingStatus: 'callStatus1',
            domain: 'abelsontaylor.com',
            scrubbedName: 'abelsontaylor',
            aliasName: '',
            tokens: 'abelsontaylor',
            industry: 'Manufacturing',
            subIndustry: 'Detroit',
            locationLI: '',
            linkedInUrl: '',
            revenue_M_B_K: '',
            employeeSizeLI: '10',
            employeeSizeZ_plus: '10',
            employeeSizeFinalBucket: '30',
            employeeSize_others: '60',
            employeeRangeLI: '10-40',
            stage: 'Working',
            complianceStatus: 'compliance',
            disposition: 'Contact Found: Email Bad',
            comments: '',
            description: '',
            addressHQ: '{"city": "Detroit", "state": "state", "country": "country"}',
            revenue: '[10000,20000]',
            employeeSize: '[30,50]',
            upperRevenue: 20000,
            lowerRevenue: 10000,
            upperEmployeeSize: 50,
            lowerEmployeeSize: 30,
            createdBy: '6087dc463e5c26006f114f2c',
            updatedBy: '6087dc463e5c26006f114f2c',
            createdAt: new Date('2020-06-17T03:24:00'),
            updatedAt: new Date('2020-06-17T03:24:00'),
            ProjectId: '01',
            website: 'abc.com',
            segment_technology: ['tech1'],
            nsId: 'nsId1',
            zoomInfoContactId: 'zoomInfoContactId1',
            sicCode: 'sic',
            naicsCode: 'naics',
            employeeSourceLI: 'empSource1',
            employeeSourceZ_plus: 'empSource1',
            sicDescription: 'sicDescription',
            naicsDescription: 'naicsDescription',
            source: 'source',
            phoneHQ: 'phone1',
            email: 'abc@gmail.com',
            label: 'inclusion',
          }
          findAccountStub.findAccount.returns(accountInstance);

          //Act
          accountService
            .updateAccount(accountDTO)
            .then((result) => {
              const actualResult = result;
              
              //Assert
              expect(actualResult).to.deep.equal(expectedResult);

              done();
            })
            .catch((error) => {
              done(error);
            })
        });
      });
    });
  });

describe('#accountService - editAccount', () => {
  
  let accountFindAll,updateAccount;
  
  beforeEach(function () {
    accountFindAll = sinon.stub(Account, 'findAll');
    updateAccount = sinon.stub(accountService, 'updateAccount');
  });
  afterEach(function () {
    accountFindAll.restore();
    updateAccount.restore();
  });

  describe('Returns A Updated Account And accountDupSup Result', () => {
    context('Check accountDedupeKeys', () => {
      it('Should return duplicate account', (done) => {
        //Arrange 
        const accountInstance = {
          id: '6087dc463e5c26006f114ddd',
          name: 'AbelsonTaylor Pvt Ltd',
          zoomInfoName: 'zoomInfo',
          researchStatus: 'status1',
          callingStatus: 'callStatus1',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: '',
          tokens: 'abelsontaylor',
          industry: 'Manufacturing',
          subIndustry: 'Detroit',
          locationLI: '',
          linkedInUrl: '',
          revenue_M_B_K: '',
          employeeSizeLI: '10',
          employeeSizeZ_plus: '10',
          employeeSizeFinalBucket: '30',
          employeeSize_others: '60',
          employeeRangeLI: '10-40',
          stage: 'Working',
          complianceStatus: 'compliance',
          disposition: 'Contact Found: Email Bad',
          comments: '',
          description: '',
          addressHQ: '{"city": "Detroit", "state": "state", "country": "country"}',
          revenue: '[10000,20000]',
          employeeSize: '[30,50]',
          upperRevenue: 20000,
          lowerRevenue: 10000,
          upperEmployeeSize: 50,
          lowerEmployeeSize: 30,
          createdBy: '6087dc463e5c26006f114f2b',
          updatedBy: '6087dc463e5c26006f114f2b',
          createdAt: new Date('2020-06-17T03:24:00'),
          updatedAt: new Date('2020-06-17T03:24:00'),
          ProjectId: '01',
          website: 'abc.com',
          segment_technology: ['tech1'],
          nsId: 'nsId1',
          zoomInfoContactId: 'zoomInfoContactId1',
          sicCode: 'sic',
          naicsCode: 'naics',
          employeeSourceLI: 'empSource1',
          employeeSourceZ_plus: 'empSource1',
          sicDescription: 'sicDescription',
          naicsDescription: 'naicsDescription',
          source: 'source',
          phoneHQ: 'phone1',
          email: 'abc@gmail.com',
          label: 'inclusion',
        }
        const inputsDTO = {
          account : accountInstance ,
          accountId : "6087dc463e5c26006f114ddd", 
          projectId: "01",
          userId:"6087dc463e5c26006f114f2c"
        };
        const labeledAccount = {
          id: '6087dc463e5c26006f114ddd',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          ProjectId: "01",
        };
        const duplicateAccountInstance = {
          id: '8760dc463e5c26006f114eee',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
        };
        const duplicateCheckResult = {
          isDuplicate: true,
          duplicateMatchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          duplicateWith: duplicateAccountInstance,
        };
        const suppressionCheckResult = {
          isSuppressed: false,
          suppressionMatchCase: "NONE",
          suppressedWith: null,
        };
        const checkAccountResult={
            labeledAccount,
            duplicateCheckResult,
            suppressionCheckResult
        }
        const updatedAccountInstance ={
          id: '6087dc463e5c26006f114ddd',
          name: 'AbelsonTaylor Pvt Ltd',
          zoomInfoName: 'zoomInfo',
          researchStatus: 'status1',
          callingStatus: 'callStatus1',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: '',
          tokens: 'abelsontaylor',
          industry: 'Manufacturing',
          subIndustry: 'Detroit',
          locationLI: '',
          linkedInUrl: '',
          revenue_M_B_K: '',
          employeeSizeLI: '10',
          employeeSizeZ_plus: '10',
          employeeSizeFinalBucket: '30',
          employeeSize_others: '60',
          employeeRangeLI: '10-40',
          stage: 'Working',
          complianceStatus: 'compliance',
          disposition: 'Contact Found: Email Bad',
          comments: '',
          description: '',
          addressHQ: '{"city": "Detroit", "state": "state", "country": "country"}',
          revenue: '[10000,20000]',
          employeeSize: '[30,50]',
          upperRevenue: 20000,
          lowerRevenue: 10000,
          upperEmployeeSize: 50,
          lowerEmployeeSize: 30,
          createdBy: '6087dc463e5c26006f114f2c',
          updatedBy: '6087dc463e5c26006f114f2b',
          createdAt: new Date('2020-06-17T03:24:00'),
          updatedAt: new Date('2020-06-17T03:24:00'),
          ProjectId: '01',
          website: 'abc.com',
          segment_technology: ['tech1'],
          nsId: 'nsId1',
          zoomInfoContactId: 'zoomInfoContactId1',
          sicCode: 'sic',
          naicsCode: 'naics',
          employeeSourceLI: 'empSource1',
          employeeSourceZ_plus: 'empSource1',
          sicDescription: 'sicDescription',
          naicsDescription: 'naicsDescription',
          source: 'source',
          phoneHQ: 'phone1',
          email: 'abc@gmail.com',
          label: 'inclusion',
        }
        const expectedResult = {
          account: updatedAccountInstance,
          checkResult: {
            matchType : 'duplicate',
            matchCase : duplicateCheckResult.duplicateMatchCase,
            matchWith : duplicateCheckResult.duplicateWith
          }
        }
        
        checkAccountInstanceStub.check.returns(checkAccountResult);
        accountFindAll.returns([accountInstance,accountInstance]);
        updateAccount.returns(updatedAccountInstance);

        //Act
        accountService
          .editAccount(inputsDTO)
          .then((result) => {
            const actualResult = result;

            expect(actualResult).to.deep.equal(expectedResult);
            done();
          })
          .catch((err) => {
            done(err);
          })
      });

      it('Should return suppressed account', (done) => {
        const accountInstance = {
          id: '6087dc463e5c26006f114ddd',
          name: 'AbelsonTaylor Pvt Ltd',
          zoomInfoName: 'zoomInfo',
          researchStatus: 'status1',
          callingStatus: 'callStatus1',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: '',
          tokens: 'abelsontaylor',
          industry: 'Manufacturing',
          subIndustry: 'Detroit',
          locationLI: '',
          linkedInUrl: '',
          revenue_M_B_K: '',
          employeeSizeLI: '10',
          employeeSizeZ_plus: '10',
          employeeSizeFinalBucket: '30',
          employeeSize_others: '60',
          employeeRangeLI: '10-40',
          stage: 'Working',
          complianceStatus: 'compliance',
          disposition: 'Contact Found: Email Bad',
          comments: '',
          description: '',
          addressHQ: '{"city": "Detroit", "state": "state", "country": "country"}',
          revenue: '[10000,20000]',
          employeeSize: '[30,50]',
          upperRevenue: 20000,
          lowerRevenue: 10000,
          upperEmployeeSize: 50,
          lowerEmployeeSize: 30,
          createdBy: '6087dc463e5c26006f114f2b',
          updatedBy: '6087dc463e5c26006f114f2b',
          createdAt: new Date('2020-06-17T03:24:00'),
          updatedAt: new Date('2020-06-17T03:24:00'),
          ProjectId: '01',
          website: 'abc.com',
          segment_technology: ['tech1'],
          nsId: 'nsId1',
          zoomInfoContactId: 'zoomInfoContactId1',
          sicCode: 'sic',
          naicsCode: 'naics',
          employeeSourceLI: 'empSource1',
          employeeSourceZ_plus: 'empSource1',
          sicDescription: 'sicDescription',
          naicsDescription: 'naicsDescription',
          source: 'source',
          phoneHQ: 'phone1',
          email: 'abc@gmail.com',
          label: 'inclusion',
        }
        const inputsDTO = {
          account : accountInstance ,
          accountId : "6087dc463e5c26006f114ddd", 
          projectId: "01",
          userId:"6087dc463e5c26006f114f2c"
        };
        const updatedAccountInstance ={
          id: '6087dc463e5c26006f114ddd',
          name: 'AbelsonTaylor Pvt Ltd',
          zoomInfoName: 'zoomInfo',
          researchStatus: 'status1',
          callingStatus: 'callStatus1',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: '',
          tokens: 'abelsontaylor',
          industry: 'Manufacturing',
          subIndustry: 'Detroit',
          locationLI: '',
          linkedInUrl: '',
          revenue_M_B_K: '',
          employeeSizeLI: '10',
          employeeSizeZ_plus: '10',
          employeeSizeFinalBucket: '30',
          employeeSize_others: '60',
          employeeRangeLI: '10-40',
          stage: 'Working',
          complianceStatus: 'compliance',
          disposition: 'Contact Found: Email Bad',
          comments: '',
          description: '',
          addressHQ: '{"city": "Detroit", "state": "state", "country": "country"}',
          revenue: '[10000,20000]',
          employeeSize: '[30,50]',
          upperRevenue: 20000,
          lowerRevenue: 10000,
          upperEmployeeSize: 50,
          lowerEmployeeSize: 30,
          createdBy: '6087dc463e5c26006f114f2c',
          updatedBy: '6087dc463e5c26006f114f2b',
          createdAt: new Date('2020-06-17T03:24:00'),
          updatedAt: new Date('2020-06-17T03:24:00'),
          ProjectId: '01',
          website: 'abc.com',
          segment_technology: ['tech1'],
          nsId: 'nsId1',
          zoomInfoContactId: 'zoomInfoContactId1',
          sicCode: 'sic',
          naicsCode: 'naics',
          employeeSourceLI: 'empSource1',
          employeeSourceZ_plus: 'empSource1',
          sicDescription: 'sicDescription',
          naicsDescription: 'naicsDescription',
          source: 'source',
          phoneHQ: 'phone1',
          email: 'abc@gmail.com',
          label: 'inclusion',
        };
        const suppressedAccountInstance = {
          id: '6087dc463e5c26006f114ddd',
          name: 'abelsontaylor',
          website: 'www.abelsontaylor.com',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          nsId: null,
          phoneHQ: '',
          linkedInUrl: null
        }
        const suppressionCheckResult = {
          isSuppressed: true,
          suppressionMatchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          suppressedWith: suppressedAccountInstance,
        };
        const expectedResult = {
          account: updatedAccountInstance,
          checkResult: {
            matchType : 'suppressed',
            matchCase : suppressionCheckResult.suppressionMatchCase,
            matchWith : suppressionCheckResult.suppressedWith
          }
        }
        const labeledAccount = {
          id: '6087dc463e5c26006f114ddd',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          ProjectId: "01",
        }; 
        const duplicateCheckResult = {
          isDuplicate: false,
          duplicateMatchCase: "NONE",
          duplicateWith: null,
        };
        const checkAccountResult={
            labeledAccount,
            duplicateCheckResult,
            suppressionCheckResult
        }

        checkAccountInstanceStub.check.returns(checkAccountResult);
        accountFindAll.returns([accountInstance,accountInstance]);
        updateAccount.returns(updatedAccountInstance);

        //Act
        accountService
          .editAccount(inputsDTO)
          .then((result) => {
            const actualResult = result;

            expect(actualResult).to.deep.equal(expectedResult);
            done();
          })
          .catch((err) => {
            done(err);
          })
      });
    });
  });
});