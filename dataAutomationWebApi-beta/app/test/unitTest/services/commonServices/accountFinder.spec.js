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

// Bind Mock to Actual Service 
const AccountFinderService = proxyquire('../../../../services/commonServices/accountFinder', {
  '../../config/settings/settings-config': settingsConfig
});
const accountFinderService = new AccountFinderService();

let accountFindByPk;

beforeEach(function () {
  accountFindByPk = sinon.stub(Account, 'findByPk');
});
afterEach(function () {
  accountFindByPk.restore()
});

describe('#accountFinder - findAccount', () => {
  describe('Return a Account Of Given Id', () => {
    context('Check If AccountId is invalid', () => {
      it('Should return `accountId is required` with `BAD_ACCOUNT_ID` error', (done) => {
        //Arrange 
        const expectedError = {
          code: 'BAD_ACCOUNT_ID',
          message: 'accountId is required'
        }

        //Act
        accountFinderService
          .findAccount()
          .then((result) => {
            const error = new Error(
              'Expected Function to throw an Error But Got Data',
            );
            done(error);
          })
          .catch((error) => {
            const actualError = error;
            // Assert
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

    context('Check If get some errors while getting data from DB', () => {
      it('Should return sequelize database error', (done) => {
        //Arrange
        const accountId = '6087dc463e5c26006f114ddd';
        accountFindByPk.throws(new Error('Something went wrong in getting account data from DB'));

        //Act
        accountFinderService
          .findAccount(accountId)
          .then((result) => {
            const error = new Error(
              'Expected Function to throw an Error But Got Data',
            );
            done(error);
          })
          .catch(function (error) {
            const actualErrorMsg = error.message;
            const expectedErrMsg = `Something went wrong in getting account data from DB`;

            expect(actualErrorMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch((error) => {
            done(error);
          })

      });
    });

    context('Find Account By Id', () => {
      it('Should return account found with ID', (done) => {
        //Arrange
        const accountId = '6087dc463e5c26006f114ddd'
        const accountFindByPkInput = accountId;
        
        accountFindByPk.returns({
          "id": '6087dc463e5c26006f114ddd'
        });

        //Act
        accountFinderService
          .findAccount(accountId)
          .then((result) => {
            const actualResult = result;

            const expectedResult = {
              id: '6087dc463e5c26006f114ddd'
            };

            //Assert
            expect(accountFindByPk.calledWithExactly(accountFindByPkInput)).to.equal(true);
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          })
      });
    });

    context('Find Account By Id', () => {
      it('Should return null', (done) => {
        //Arrange
        const accountId = '6087dc463e5c26006f114ddd'
        accountFindByPk.returns(null);

        //Act
        accountFinderService
          .findAccount(accountId)
          .then((result) => {
            const actualResult = result;
            const expectedResult = null;

            //Assert
            expect(actualResult).to.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          })
      });
    });
  });
});