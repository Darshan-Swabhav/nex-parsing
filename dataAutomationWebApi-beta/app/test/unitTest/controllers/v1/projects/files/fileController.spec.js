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

const fileCRUDServiceInstanceStub = {
  getAllSharedFile: sinon.stub(),
  getAllFile: sinon.stub(),
  getCreatedBy: sinon.stub(),
  getClients: sinon.stub(),
  deleteFileById: sinon.stub(),
};
const validationServiceInstanceStub = {};
const paginationServiceInstanceStub = {
  paginate: sinon.stub(),
};
const filterHandlerInstanceStub = {
  validate: sinon.stub(),
};
const sortHandlerInstanceStub = {
  validate: sinon.stub(),
};

const FileCRUDServiceStub = sinon.stub().returns(fileCRUDServiceInstanceStub);
const ValidationServiceStub = sinon.stub().returns(validationServiceInstanceStub);
const PaginationServiceStub = sinon
  .stub()
  .returns(paginationServiceInstanceStub);
const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);
const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const fileControllerModule = proxyquire(
  '../../../../../../controllers/v1/projects/files/fileController', {
    '../../../../services/projects/files/fileService': FileCRUDServiceStub,
    '../../../../services/helpers/validationService': ValidationServiceStub,
    '../../../../services/helpers/paginationService': PaginationServiceStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler': FilterHandlerStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler': SortHandlerStub,
  },
);

describe('#fileController - get', () => {
  const page = {
    offset: 0,
    limit: 10
  };
  before(() => {
    paginationServiceInstanceStub.paginate = sinon.stub().returns(page);
  });
  describe('Return a List of Files Data', () => {
    let req;
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
          roles: ['manager']
        },
        query: {
          filter: '{"fileName":{"operator":"=","value":"abc"}}',
          sort: '{"fileName":"asc"}',
          onlySharedFiles: true,
          pageNo: '0',
          pageSize: '10',
        },
      };
    });

    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
        // Arrange
        req.user = {};

        //Act
        fileControllerModule.get(settingsConfig, req, res, next)
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

    context('Check If the User role is invalid', () => {
      it('Should return `403` with `User Forbidden` error', (done) => {
        // Arrange
        req.user.roles = ['agent'];

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route',
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

    context('Check If Filter value is not a object', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.query.filter = 'filter';

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
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

    context('Check If Sort value is not a object', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.query.sort = 'sort';

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
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
    });

    context('Check If the Filter value is inCorrect when getting only sharedFile data', () => {
      before(() => {
        filterHandlerInstanceStub.validate = sinon
          .stub()
          .throws(new Error('Filter value is inCorrect'));
      });
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.query.filter = '{"fileName":"abc"}';

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Filter value is inCorrect'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(() => {
        filterHandlerInstanceStub.validate = sinon.stub();
      });
    });

    context('Check If the Sort value is inCorrect when getting only sharedFile data', () => {
      before(() => {
        sortHandlerInstanceStub.validate = sinon
          .stub()
          .throws(new Error('Sort value is inCorrect'));
      });
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.query.sort = '{"fileName":"abc"}';

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Sort value is inCorrect'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(() => {
        sortHandlerInstanceStub.validate = sinon.stub();
      });
    });

    context('Check If ProjectId is empty When getting a list project wise', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        req.query.onlySharedFiles = false;
        req.query.projectId = '';

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
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

    context('Check If get any errors while getting All File data Using the service function', () => {
      before(() => {
        fileCRUDServiceInstanceStub.getAllFile = sinon
          .stub()
          .throws(new Error('Something went wrong in getting All File data'));
      });
      it('Should return `500` with error message', (done) => {
        // Arrange
        req.query.onlySharedFiles = false;
        req.query.projectId = '123';

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong in getting All File data',
              desc: 'Could Not Get File List'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(() => {
        fileCRUDServiceInstanceStub.getAllFile = sinon.stub();
      });
    });

    context('Check If get any errors while getting Only Shared File data Using the service function', () => {
      before(() => {
        fileCRUDServiceInstanceStub.getAllSharedFile = sinon
          .stub()
          .throws(new Error('Something went wrong in getting Only Shared File data'));
      });
      it('Should return `500` with error message', (done) => {
        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong in getting Only Shared File data',
              desc: 'Could Not Get File List'
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(() => {
        fileCRUDServiceInstanceStub.getAllSharedFile = sinon.stub();
      });
    });

    context('Check If the return All File data list is correct', () => {
      before(() => {
        fileCRUDServiceInstanceStub.getAllFile = sinon
          .stub()
          .returns([{name:'abc'}]);
      });
      it('Should return `200` with List of File Data', (done) => {
        // Arrange
        req.query.onlySharedFiles = false;
        req.query.projectId = '123';

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Arrange
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [{name:'abc'}];
            const expectedPageNo = req.query.pageNo;
            const expectedPageSize = req.query.pageSize;

            const expectedInputOfPaginate = [expectedPageNo,expectedPageSize];
            const expectedInputOfGetAllFile = [{
              projectId: req.query.projectId,
              limit: page.limit,
              offset: page.offset,
            }];

            const actualInputOfPaginate = paginationServiceInstanceStub.paginate.getCall(0).args;
            const actualInputOfGetAllFile = fileCRUDServiceInstanceStub.getAllFile.getCall(0).args;

            expect(actualInputOfPaginate).to.deep.equal(expectedInputOfPaginate, 'Expected value not pass in paginate function');
            expect(actualInputOfGetAllFile).to.deep.equal(expectedInputOfGetAllFile, 'Expected value not pass in getAllFile function');
            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(() => {
        fileCRUDServiceInstanceStub.getAllFile = sinon.stub();
      });
    });

    context('Check If the return Only Shared File data list is correct', () => {
      before(() => {
        fileCRUDServiceInstanceStub.getAllSharedFile = sinon
          .stub()
          .returns([{name:'abc'}]);
      });
      it('Should return `200` with List of Shared File Data', (done) => {

        // Act
        fileControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Arrange
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [{name:'abc'}];
            const expectedPageNo = req.query.pageNo;
            const expectedPageSize = req.query.pageSize;

            const expectedInputOfPaginate = [expectedPageNo,expectedPageSize];
            const expectedInputOfGetAllSharedFile = [{
              limit: page.limit,
              offset: page.offset,
              filter: JSON.parse(req.query.filter),
              sort: JSON.parse(req.query.sort),
            }];

            const actualInputOfPaginate = paginationServiceInstanceStub.paginate.getCall(0).args;
            const actualInputOfGetAllSharedFile = fileCRUDServiceInstanceStub.getAllSharedFile.getCall(0).args;

            expect(actualInputOfPaginate).to.deep.equal(expectedInputOfPaginate, 'Expected value not pass in paginate function');
            expect(actualInputOfGetAllSharedFile).to.deep.equal(expectedInputOfGetAllSharedFile, 'Expected value not pass in getAllSharedFile function');
            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(() => {
        fileCRUDServiceInstanceStub.getAllSharedFile = sinon.stub();
      });
    });
  });

  after(() => {
    paginationServiceInstanceStub.paginate = sinon.stub();
  });
});

describe('#fileController - getFileFacets', () => {
  describe('Get File Unique fields', () => {
    context('Check If User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '',
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
          },
        };

        // Act
        fileControllerModule
          .getFileFacets(settingsConfig, req, res, next)
          .then(() => {
            const error = new Error(
              'This function could not throw expected error',
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
          },
        };

        // Act
        fileControllerModule.getFileFacets(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route',
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

    context('Check If "field" is invalid', () => {
      it('Should return `400` with `Bad Request` error if field is not found', (done) => {
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
            projectId: '01',
          },
          query: {
            field: '',
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
          },
        };

        // Act
        fileControllerModule
          .getFileFacets(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'field is required',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Should return `400` with `Bad Request` error if field is not defined', (done) => {
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
            projectId: '01',
          },
          query: {
            field: 'project',
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
          },
        };

        // Act
        fileControllerModule
          .getFileFacets(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'Requested field is not defined',
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
        const fileUserRes = [
          'agent1@nexsales.com',
          'agent2@nexsales.com',
          'agent3@nexsales.com',
        ];
        const fileClientRes = [
          'xin-xin',
          'Vonage',
          'Tpg',
        ];

        fileCRUDServiceInstanceStub.getClients = sinon
          .stub()
          .returns(fileClientRes);
        fileCRUDServiceInstanceStub.getCreatedBy = sinon
          .stub()
          .returns(fileUserRes);
      });

      it('Should return `200` with unique list of File Clients data', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'client',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {},
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
        fileControllerModule
          .getFileFacets(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              'xin-xin',
              'Vonage',
              'Tpg',
            ];

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it('Should return `200` with unique list of File Users data', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'createdBy',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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
        fileControllerModule
          .getFileFacets(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 200;
            const expectedData = [
              'agent1@nexsales.com',
              'agent2@nexsales.com',
              'agent3@nexsales.com',
            ];

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      after(() => {
        fileCRUDServiceInstanceStub.getClients = sinon.stub();
        fileCRUDServiceInstanceStub.getCreatedBy = sinon.stub();
      });
    });

    context('Check if correct params are passed', () => {
      before(() => {
        fileCRUDServiceInstanceStub.getCreatedBy = sinon
          .stub()
          .throws(new Error('Something went wrong'));
        fileCRUDServiceInstanceStub.getClients = sinon
          .stub()
          .throws(new Error('Something went wrong'));
      });
      it('Should return `500` when some internal error occurs in getClients', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'client',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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
        fileControllerModule
          .getFileFacets(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Shared File Facets',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('Should return `500` when some internal error occurs in getCreatedBy', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {
            field: 'createdBy',
          },
          user: {
            sub: '111',
            roles: ['manager'],
          },
          params: {
            projectId: '222',
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
        fileControllerModule
          .getFileFacets(settingsConfig, req, res, next)
          .then((result) => {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Shared File Facets',
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
        fileCRUDServiceInstanceStub.getCreatedBy = sinon.stub();
        fileCRUDServiceInstanceStub.getClients = sinon.stub();
      });
    });
  });
});

describe('#fileController - deleteFileById', () => {
  describe('Deleting a SharedFile from DB table using File ID', () => {
    context('Check if User is Unauthorized', () => {
      it('Should return `401` with `Unauthorized` error', (done) => {
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
            fileId: '111',
          },
          query: {}
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
        fileControllerModule.delete(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;

            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if FileId is invalid', () => {
      it('Should return `400` with `Bad Request` error', (done) => {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            sub: '111',
          },
          params: {},
          query: {}
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
        fileControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 400;
            const expectedData = {
              err: 'Bad Request',
              desc: 'fileId is required'
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
    context('Check if any error is caught while deleting File using the service function', () => {
      before(function () {
        fileCRUDServiceInstanceStub.deleteFileById = sinon.stub().throws(new Error('Something went wrong in deleting file data'));
      });
      it('Should return `500` with error message', (done) => {
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
            fileId: '111',
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
          },
        };

        // Act
        fileControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong in deleting file data',
              desc: 'Could Not Delete File'
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
        fileCRUDServiceInstanceStub.deleteFileById = sinon.stub();
      });
    });
    context('Check if File deleted successfully', () => {
      before(function () {
        fileCRUDServiceInstanceStub.deleteFileById = sinon.stub().returns('delete successfully');
      });
      it('Should return `200`', (done) => {
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
            fileId: '111',
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
          },
        };

        // Act
        fileControllerModule.delete(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const expectedStatusCode = 200;

            const deleteFileByIdInput = {
              fileId: req.params.fileId,
              userId: req.user.sub
            };

            expect(fileCRUDServiceInstanceStub.deleteFileById.calledWithExactly(deleteFileByIdInput)).to.equal(true);
            expect(actualStatusCode).to.equal(expectedStatusCode);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        fileCRUDServiceInstanceStub.deleteFileById = sinon.stub();
      });
    });
  });
});