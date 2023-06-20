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
    warn: () => {},
  },
};

const PaginationService = proxyquire('../../../../services/helpers/paginationService', {
  '../../config/settings/settings-config': settingsConfig,
});

const paginationService = new PaginationService();

describe('#paginationService - paginate', () => {
  describe('Get limit and offset based on pageNo and pageSize', function () {
    context('Generates limit and offset', function () {
      it('Should return limit and offset when correct params are passed', function (done) {
        //Arrange
        const pageNo = 1;
        const pageSize = 10;

        // Act
        const actualData = paginationService.paginate(pageNo, pageSize);
        const expectedData = {
          limit: 10,
          offset: 10,
        }
        expect(actualData).to.deep.equal(expectedData);
        done();
      });
    });
  });
});