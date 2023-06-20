const {
  expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const {
  loggerMock
} = require('../../../../helper');
const {
  Job,
  File,
  JobError,
  Sequelize,
} = require('@nexsalesdev/master-data-model');

const {Op} = Sequelize;

const {
  inspect
} = require('util');

const process = {
  env: {
    MASTER_GCLOUD_STORAGE_DOWNLOAD_FILE_BUCKET: '',
    MASTER_GCLOUD_STORAGE_PROCESS_FILE_BUCKET: ''
  }
};

const settingsConfig = {
  logger: loggerMock,
  settings: {}
};

const sortHandlerInstanceStub = {
  validate: sinon.stub(),
  buildOrderClause: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const downloadServiceRepo = {
  generateV4UploadSignedUrl: sinon.stub(),
};

const JobServiceModule = proxyquire(
  './../../../../../services/master/jobs/jobsService', {
    '../../../config/settings/settings-config': settingsConfig,
    '@nexsalesdev/da-download-service-repository': downloadServiceRepo,
    '@nexsalesdev/master-data-model/lib/services/sortHandler': SortHandlerStub,
  }
);

const jobServiceModule = new JobServiceModule();
let gcpMasterCloudStorageDownloadBucketStub, gcpMasterCloudStorageProcessBucketStub, jobServiceGetJobById, jobErrorsFindAll, jobFindAndCountAll;

// TODO:: need to repair
// describe("#jobsService - generateSignedURL", function () {
//   beforeEach(function () {
//     jobServiceGetJobById = sinon.stub(jobServiceModule, 'getJobById');
//     gcpMasterCloudStorageDownloadBucketStub = sinon.stub(process.env, 'MASTER_GCLOUD_STORAGE_DOWNLOAD_FILE_BUCKET').value('da-local-files');
//     gcpMasterCloudStorageProcessBucketStub = sinon.stub(process.env, 'MASTER_GCLOUD_STORAGE_PROCESS_FILE_BUCKET').value('da-local-files');
//   })
//   afterEach(function () {
//     jobServiceGetJobById.restore();
//     gcpMasterCloudStorageDownloadBucketStub.restore();
//     gcpMasterCloudStorageProcessBucketStub.restore();
//   })
//   describe('Generates signed URL', function () {
//     context('Generates signed URL for a file to be downloaded from GCP', function () {
//       it('Should return signed URL for a file to be downloaded', function(done) {
//         const inputs = {
//           jobId: '01',
//         };

//         jobServiceGetJobById.returns({
//           fileLocation: 'fileLocation', 
//           fileType: 'Import'
//         })

//         downloadServiceRepo.generateV4UploadSignedUrl.returns('signedURL');

//         jobServiceModule.generateSignedURL(inputs)
//         .then(function (result) {
//           const actualData = result;
//           const expectedData = "signedURL";

//           const expectedGetJobByIdArgs = {
//             jobId: '01',
//           }

//           const expectedGenerateV4UploadSignedUrlArgs = {
//             fileLocation: 'fileLocation',
//             downloadFilesBucketName: 'da-local-files',
//           };

//           const actualGetGobByIdFirstArg = jobServiceGetJobById.getCall(0).args[0];

//           expect(actualGetGobByIdFirstArg).to.deep.equal(expectedGetJobByIdArgs, 'Expected value not pass in get job by id function');
//           expect(Object.keys(actualGetGobByIdFirstArg).length).to.equal(Object.keys(expectedGetJobByIdArgs).length, 'Expected value not pass in get job by id function');

//           const actualGenerateV4UploadSignedUrlFirstArgs = downloadServiceRepo.generateV4UploadSignedUrl.getCall(0).args[0];
//           const actualGenerateV4UploadSignedUrlSecondArgs = downloadServiceRepo.generateV4UploadSignedUrl.getCall(0).args[1];
//           const actualGenerateV4UploadSignedUrlArgsLength = downloadServiceRepo.generateV4UploadSignedUrl.getCall(0).args.length;

//           expect(actualGenerateV4UploadSignedUrlFirstArgs).to.deep.equal(expectedGenerateV4UploadSignedUrlArgs.fileLocation, 'Expected value not pass in generate v4 signed url function');
//           expect(actualGenerateV4UploadSignedUrlSecondArgs).to.deep.equal(expectedGenerateV4UploadSignedUrlArgs.downloadFilesBucketName, 'Expected value not pass in generate v4 signed url function');
//           expect(actualGenerateV4UploadSignedUrlArgsLength).to.deep.equal(Object.keys(expectedGenerateV4UploadSignedUrlArgs).length, 'Expected value not pass in generate v4 signed url function');

//           expect(actualData).to.equal(expectedData);
//           done();
//         })
//         .catch(function (err) {
//           done(err);
//         })
//       });

//       it('Should throw error when something internally fails while getting job by id', function(done) {
//         const inputs = {
//           jobId: '01',
//         };

//         jobServiceGetJobById.throws(new Error('Something went wrong'))

//         downloadServiceRepo.generateV4UploadSignedUrl.returns('signedURL');

//         jobServiceModule.generateSignedURL(inputs)
//         .then(function (result) {
//           const error = new Error('This function could not throw expected error');
//           done(error);
//         })
//         .catch(function (err) {
//           // Assert
//           const actualErrMsg = err.message;
//           const expectedErrMsg = `Something went wrong`;

//           expect(actualErrMsg).to.equal(expectedErrMsg);
//           done();
//         })
//         .catch(function (err) {
//           done(err);
//         });
//       });

//       it('Should throw error when something internally fails while generating signed url', function(done) {
//         const inputs = {
//           jobId: '01',
//         };

//         jobServiceGetJobById.returns({
//           fileLocation: 'fileLocation', 
//           fileType: 'Import'
//         })

//         downloadServiceRepo.generateV4UploadSignedUrl.throws(new Error('Something went wrong'));

//         jobServiceModule.generateSignedURL(inputs)
//         .then(function (result) {
//           const error = new Error('This function could not throw expected error');
//           done(error);
//         })
//         .catch(function (err) {
//           // Assert
//           const actualErrMsg = err.message;
//           const expectedErrMsg = `Something went wrong`;

//           expect(actualErrMsg).to.equal(expectedErrMsg);
//           done();
//         })
//         .catch(function (err) {
//           done(err);
//         });
//       });
//     });
//   });
// })

describe("#jobsService - getJobById", function () {
  beforeEach(function () {
    jobServiceFindOne = sinon.stub(Job, 'findOne');
  })
  afterEach(function () {
    jobServiceFindOne.restore();
  })
  describe('Fetches a job', function () {
    context('Get a job using id', function () {
      it('Should return a job having the id', function(done) {
        const inputs = {
          jobId: '01',
        };

        jobServiceFindOne.returns({
          id: inputs.jobId,
        })

        jobServiceModule.getJobById(inputs)
        .then(function (result) {
          const actualData = result;
          const expectedData = {
            id: '01',
          };

          const expectedJobFindOneArgs = {
            where: {
              id: inputs.jobId,
            },
            attributes: [
              ['id', 'jobId'],
              [Sequelize.col('File.id'), 'fileId'],
              [Sequelize.col('File.name'), 'fileName'],
              [Sequelize.col('File.location'), 'fileLocation'],
              [Sequelize.col('File.type'), 'fileType'],
            ],
            include: [
              {
                model: File,
                attributes: [],
                required: true,
              },
            ],
            raw: true,
          };

          expect(actualData).to.deep.equal(expectedData);

          const actualJobServiceFindOneFirstArg = jobServiceFindOne.getCall(0).args[0];
            expect(inspect(actualJobServiceFindOneFirstArg.include, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindOneArgs.include, {
              depth: null
            }), 'Expected value not pass in job find one function');
            expect(inspect(actualJobServiceFindOneFirstArg.attributes, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindOneArgs.attributes, {
              depth: null
            }), 'Expected value not pass in job find one function');
            expect(inspect(actualJobServiceFindOneFirstArg.where, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindOneArgs.where, {
              depth: null
            }), 'Expected value not pass in job find one function');
            expect(inspect(actualJobServiceFindOneFirstArg.raw, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindOneArgs.raw, {
              depth: null
            }), 'Expected value not pass in job find one function');
            expect(Object.keys(actualJobServiceFindOneFirstArg).length).to.deep.equal(Object.keys(expectedJobFindOneArgs).length, 'Expected value not pass in job find one function');
          done();
        })
        .catch(function (err) {
          done(err);
        })
      });

      it('Should throw error when something internally fails while getting the job', function(done) {
        const inputs = {
          jobId: '01',
        };

        jobServiceFindOne.throws(new Error('Something went wrong'));

        jobServiceModule.getJobById(inputs)
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function (err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
    });
  });
})

describe("jobsService - convertToCSVFormat", function () {
  context("Removes unnecessary props and returns json object", function () {
    it('Should correctly return json object of a row', function(done) {
      const row = {
        id: '01',
        jobId: '01',
        errorCount: '0',
        chunkIndex: '0',
        createdAt: '2022-04-21T10:00:35.090Z',
        updatedAt: '2022-04-21T10:00:35.090Z',
        content: {
          desc: 'Error',
        }
      }

      const expectedData = {
        content: {
          desc: 'Error',
        }
      }
      const result = jobServiceModule.convertToCSVFormat(row);
      expect(result).to.deep.equal(expectedData);

      done();
    });
  });
});

describe("jobsService - getMasterJobErrors", function () {
  beforeEach(function () {
    jobErrorsFindAll = sinon.stub(JobError, 'findAll');
  })
  afterEach(function () {
    jobErrorsFindAll.restore();
  })
  describe('Fetches job errors list', function () {
    context('Get all job errors', function () {
      it('Should return job errors list', function(done) {
        const inputs = {
          jobId: '01',
        };

        jobErrorsFindAll.returns([
          {
            id: '01',
          }
        ])

        jobServiceModule.getMasterJobErrors(inputs)
        .then(function (result) {
          const actualData = result;
          const expectedData = [
            {
              id: '01',
            }
          ];

          const expectedJobErrorsFindAllArgs = {
            where: {
              JobId: inputs.jobId,
            },
          };

          expect(actualData).to.deep.equal(expectedData);

          const actualJobErrorFindAllFirstArg = jobErrorsFindAll.getCall(0).args[0];
            expect(inspect(actualJobErrorFindAllFirstArg.where, {
              depth: null
            })).to.deep.equal(inspect(expectedJobErrorsFindAllArgs.where, {
              depth: null
            }), 'Expected value not pass in job find one function');
            expect(Object.keys(actualJobErrorFindAllFirstArg).length).to.deep.equal(Object.keys(expectedJobErrorsFindAllArgs).length, 'Expected value not pass in job error find all function');
          done();
        })
        .catch(function (err) {
          done(err);
        })
      });

      it('Should throw error when something internally fails while getting the job', function(done) {
        const inputs = {
          jobId: '01',
        };

        jobErrorsFindAll.throws(new Error('Something went wrong'));

        jobServiceModule.getMasterJobErrors(inputs)
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function (err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
    });
  });
});

describe("jobsService - getAllMasterJobs", function () {
  beforeEach(function () {
    jobFindAndCountAll = sinon.stub(Job, 'findAndCountAll');
    sortHandlerInstanceStub.buildOrderClause = sinon.stub().returns([]);
  })
  afterEach(function () {
    sortHandlerInstanceStub.buildOrderClause = sinon.stub();
    jobFindAndCountAll.restore();
  })
  describe("Get lists of jobs", function () {
    context("Fetches list of jobs based on job type", function () {
      // it("Should return all types of jobs list when no job type is specified", function (done) {
      //   const inputs = {
      //     limit: 0,
      //     offset: 0,
      //     jobType: [],
      //     userEmail: 'dev.pmgr1@nexsales.com'
      //   }

      //   const sort = {};

      //   jobFindAndCountAll.returns({
      //     count: 0,
      //     rows: [],
      //   })

      //   jobServiceModule.getAllMasterJobs(inputs, sort)
      //   .then(function (result) {
      //     const expectedData = {
      //       totalCount: 0,
      //       docs: [],
      //     }
      //     const actualData = result;

      //     const sortColumnsMapping = {
      //       createdAt: `"createdAt"`,
      //     };

      //     const customSortColumn = {};

      //     const order = [];

      //     const actualBuildOrderClauseFirstArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[0];
      //     const actualBuildOrderClauseSecondArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[1];
      //     const actualBuildOrderClauseThirdArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[2];
      //     const actualBuildOrderClauseFourthArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[3];
      //     const actualBuildOrderClauseArgsLength = sortHandlerInstanceStub.buildOrderClause.getCall(0).args.length;

      //     const expectedBuildOrderClauseArgs = {
      //       sortColumnsMapping,
      //       customSortColumn,
      //       sort,
      //       order,
      //     }

      //     expect(actualBuildOrderClauseFirstArgs).to.deep.equal(expectedBuildOrderClauseArgs.sortColumnsMapping, 'Expected value not pass in build order clause function');
      //     expect(actualBuildOrderClauseSecondArgs).to.deep.equal(expectedBuildOrderClauseArgs.customSortColumn, 'Expected value not pass in build order clause function');
      //     expect(actualBuildOrderClauseThirdArgs).to.deep.equal(expectedBuildOrderClauseArgs.sort, 'Expected value not pass in build order clause function');
      //     expect(actualBuildOrderClauseFourthArgs).to.deep.equal(expectedBuildOrderClauseArgs.order, 'Expected value not pass in build order clause function');
      //     expect(actualBuildOrderClauseArgsLength).to.deep.equal(Object.keys(expectedBuildOrderClauseArgs).length, 'Expected value not pass in build order clause function');

      //     const where = {}
      //     where['$Job.operationName$'] = {
      //       [Op.or]: ['accountImport', 'contactImport', 'accountMetaImport', 'accountTechnologyImport', 'asyncAccountExport', 'asyncVerifyAccountExport', 'asyncContactExport','syncAccountExport', 'syncContactExport'],
      //     };

      //     const expectedJobFindAndCountAllArgs = {
      //       where: [where],
      //       attributes: [
      //         ['id', 'jobId'],
      //         'operationName',
      //         'status',
      //         'processed',
      //         'imported',
      //         'errored',
      //         'createdAt',
      //         'updatedAt',
      //         [Sequelize.col('File.name'), 'fileName'],
      //       ],
      //       include: [
      //         {
      //           model: File,
      //           attributes: [],
      //           required: true,
      //         },
      //       ],
      //       order,
      //       subQuery: false,
      //       raw: true,
      //       limit: inputs.limit,
      //       offset: inputs.offset,
      //     };

      //     const actualJobFindAndCountAllFirstArg = jobFindAndCountAll.getCall(0).args[0];
      //       expect(inspect(actualJobFindAndCountAllFirstArg.attributes, {
      //         depth: null
      //       })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.attributes, {
      //         depth: null
      //       }), 'Expected value not pass in jobs find and count all function');
      //       expect(inspect(actualJobFindAndCountAllFirstArg.order, {
      //         depth: null
      //       })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.order, {
      //         depth: null
      //       }), 'Expected value not pass in jobs find and count all function');
      //       expect(inspect(actualJobFindAndCountAllFirstArg.where, {
      //         depth: null
      //       })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.where, {
      //         depth: null
      //       }), 'Expected value not pass in jobs find and count all function');
      //       expect(inspect(actualJobFindAndCountAllFirstArg.limit, {
      //         depth: null
      //       })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.limit, {
      //         depth: null
      //       }), 'Expected value not pass in jobs find and count all function');
      //       expect(inspect(actualJobFindAndCountAllFirstArg.offset, {
      //         depth: null
      //       })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.offset, {
      //         depth: null
      //       }), 'Expected value not pass in jobs find and count all function');
      //       expect(inspect(actualJobFindAndCountAllFirstArg.raw, {
      //         depth: null
      //       })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.raw, {
      //         depth: null
      //       }), 'Expected value not pass in jobs find and count all function');
      //       expect(inspect(actualJobFindAndCountAllFirstArg.subQuery, {
      //         depth: null
      //       })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.subQuery, {
      //         depth: null
      //       }), 'Expected value not pass in jobs find and count all function');
      //       expect(Object.keys(actualJobFindAndCountAllFirstArg).length).to.deep.equal(Object.keys(expectedJobFindAndCountAllArgs).length, 'Expected value not pass in jobs find and count all function');

      //     expect(actualData).to.deep.equal(expectedData);
      //     done();
      //   })
      //   .catch(function(err){
      //     done(err);
      //   })
      // });

      it("Should return only upload types of jobs list when 'upload' job type is specified", function (done) {
        const inputs = {
          limit: 0,
          offset: 0,
          jobType: ['upload'],
          userEmail: 'dev.pmgr1@nexsales.com',
          userRoles: ['manager'],
        }

        const sort = {};

        jobFindAndCountAll.returns({
          count: 0,
          rows: [],
        })

        jobServiceModule.getAllMasterJobs(inputs, sort)
        .then(function (result) {
          const expectedData = {
            totalCount: 0,
            docs: [],
          }
          const actualData = result;

          const sortColumnsMapping = {
            createdAt: `"createdAt"`,
          };

          const customSortColumn = {};

          const order = [];

          const actualBuildOrderClauseFirstArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[0];
          const actualBuildOrderClauseSecondArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[1];
          const actualBuildOrderClauseThirdArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[2];
          const actualBuildOrderClauseFourthArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[3];
          const actualBuildOrderClauseArgsLength = sortHandlerInstanceStub.buildOrderClause.getCall(0).args.length;

          const expectedBuildOrderClauseArgs = {
            sortColumnsMapping,
            customSortColumn,
            sort,
            order,
          }

          expect(actualBuildOrderClauseFirstArgs).to.deep.equal(expectedBuildOrderClauseArgs.sortColumnsMapping, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseSecondArgs).to.deep.equal(expectedBuildOrderClauseArgs.customSortColumn, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseThirdArgs).to.deep.equal(expectedBuildOrderClauseArgs.sort, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseFourthArgs).to.deep.equal(expectedBuildOrderClauseArgs.order, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseArgsLength).to.deep.equal(Object.keys(expectedBuildOrderClauseArgs).length, 'Expected value not pass in build order clause function');

          const where = [{
            operationName: [
              'accountImport',
              'contactImport',
              'accountMetaImport',
              'accountTechnologyImport'
            ]
          }];

          const expectedJobFindAndCountAllArgs = {
            where,
            attributes: [
              ['id', 'jobId'],
              'operationName',
              'status',
              'rowCount',
              'processed',
              'imported',
              'errored',
              'createdAt',
              'updatedAt',
              [Sequelize.col('File.name'), 'fileName'],
              [Sequelize.col('File.source'), 'fileSource'],
            ],
            include: [
              {
                model: File,
                attributes: [],
                required: true,
              },
            ],
            order,
            subQuery: false,
            raw: true,
            limit: inputs.limit,
            offset: inputs.offset,
          };

          const actualJobFindAndCountAllFirstArg = jobFindAndCountAll.getCall(0).args[0];
            expect(inspect(actualJobFindAndCountAllFirstArg.attributes, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.attributes, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.order, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.order, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.where, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.where, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.limit, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.limit, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.offset, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.offset, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.raw, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.raw, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.subQuery, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.subQuery, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(Object.keys(actualJobFindAndCountAllFirstArg).length).to.deep.equal(Object.keys(expectedJobFindAndCountAllArgs).length, 'Expected value not pass in jobs find and count all function');

          expect(actualData).to.deep.equal(expectedData);
          done();
        })
        .catch(function(err){
          done(err);
        })
      });

      it("Should return only download types of jobs list when 'download' job type is specified", function (done) {
        const inputs = {
          limit: 0,
          offset: 0,
          jobType: ['download'],
          userEmail: 'dev.pmgr1@nexsales.com',
          userRoles:['manager'],
        }

        const sort = {};

        jobFindAndCountAll.returns({
          count: 0,
          rows: [],
        })

        jobServiceModule.getAllMasterJobs(inputs, sort)
        .then(function (result) {
          const expectedData = {
            totalCount: 0,
            docs: [],
          }
          const actualData = result;

          const sortColumnsMapping = {
            createdAt: `"createdAt"`,
          };

          const customSortColumn = {};

          const order = [];

          const actualBuildOrderClauseFirstArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[0];
          const actualBuildOrderClauseSecondArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[1];
          const actualBuildOrderClauseThirdArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[2];
          const actualBuildOrderClauseFourthArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[3];
          const actualBuildOrderClauseArgsLength = sortHandlerInstanceStub.buildOrderClause.getCall(0).args.length;

          const expectedBuildOrderClauseArgs = {
            sortColumnsMapping,
            customSortColumn,
            sort,
            order,
          }

          expect(actualBuildOrderClauseFirstArgs).to.deep.equal(expectedBuildOrderClauseArgs.sortColumnsMapping, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseSecondArgs).to.deep.equal(expectedBuildOrderClauseArgs.customSortColumn, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseThirdArgs).to.deep.equal(expectedBuildOrderClauseArgs.sort, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseFourthArgs).to.deep.equal(expectedBuildOrderClauseArgs.order, 'Expected value not pass in build order clause function');
          expect(actualBuildOrderClauseArgsLength).to.deep.equal(Object.keys(expectedBuildOrderClauseArgs).length, 'Expected value not pass in build order clause function');

          const where = [{
            operationName: ['asyncAccountExport', 'asyncContactExport', 'accountInclusionExport', 'contactInclusionExport'],
            createdBy: 'dev.pmgr1@nexsales.com'
          }];

          const expectedJobFindAndCountAllArgs = {
            where,
            attributes: [
              ['id', 'jobId'],
              'operationName',
              'status',
              'rowCount',
              'processed',
              'imported',
              'errored',
              'createdAt',
              'updatedAt',
              [Sequelize.col('File.name'), 'fileName'],
              [Sequelize.col('File.source'), 'fileSource'],
            ],
            include: [
              {
                model: File,
                attributes: [],
                required: true,
              },
            ],
            order,
            subQuery: false,
            raw: true,
            limit: inputs.limit,
            offset: inputs.offset,
          };

          const actualJobFindAndCountAllFirstArg = jobFindAndCountAll.getCall(0).args[0];
            expect(inspect(actualJobFindAndCountAllFirstArg.attributes, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.attributes, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.order, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.order, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.where, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.where, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.limit, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.limit, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.offset, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.offset, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.raw, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.raw, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(inspect(actualJobFindAndCountAllFirstArg.subQuery, {
              depth: null
            })).to.deep.equal(inspect(expectedJobFindAndCountAllArgs.subQuery, {
              depth: null
            }), 'Expected value not pass in jobs find and count all function');
            expect(Object.keys(actualJobFindAndCountAllFirstArg).length).to.deep.equal(Object.keys(expectedJobFindAndCountAllArgs).length, 'Expected value not pass in jobs find and count all function');

          expect(actualData).to.deep.equal(expectedData);
          done();
        })
        .catch(function(err){
          done(err);
        })
      });

      it('Should throw error when something internally fails while finding jobs with its total count', function (done) {
        //Arrange
        const inputs = {
          limit: 0,
          offset: 0,
          jobType: ['download'],
          userEmail: 'dev.pmgr1@nexsales.com',
          userRoles: ['manager'],
        }
        const sort = {};

        jobFindAndCountAll.throws(new Error('Something went wrong'));

        // Act
        jobServiceModule.getAllMasterJobs(inputs, sort)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
})