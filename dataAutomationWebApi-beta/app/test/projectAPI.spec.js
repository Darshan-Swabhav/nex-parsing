const chai = require('chai');
const path = require('path');
const _ = require('lodash');
const supertest = require('supertest');
const { Storage } = require('@google-cloud/storage');
const { uuid } = require('uuidv4');
const assert = require('assert');

const { 
  Job, 
  File,
  Client,
  Project,
  Sequelize,
  sequelize,
  ProjectSpec,
  Task,
  ProjectSetting,
  Account,
  Contact,
  AccountSuppression,
  ContactSuppression,
  FileChunk,
  JobError,
  ProjectUser,
  TaskAllocationTemp
 } = require('@nexsalesdev/dataautomation-datamodel');

const { getToken } = require('./fixtures');
const settingsConfig = require('../config/settings/settings-config');
const availableUsers = require('../../node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/sample-data/sample-Users');
const availableClients = require('../../node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/sample-data/sample-Clients');
const availableProjects = require('../../node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/sample-data/sample-PROJECTs');
const availableAccounts = require('../../node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/sample-data/sample-Accounts');
const availableContacts = require('../../node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/sample-data/sample-Contacts');
const availableProjectSpecs = require('../../node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/sample-data/sample-PROJECTSpecs');
const availableProjectSettings = require('../../node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/sample-data/sample-PROJECTSettings');
const availableTaskAllocationTemp = require('./data/taskAllocationTemp.data');

const { Op } = Sequelize;
const { expect } = chai;
const storage = new Storage({
  email: process.env.GCLOUD_STORAGE_EMAIL,
  projectId: process.env.GCLOUD_STORAGE_PROJECT,
});
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET);

// Start Server
require('../config/worker-config.js');

const host = settingsConfig.settings.thisnode.hostName;
const { port } = settingsConfig.settings.thisnode;
const api = supertest(`http://${host}:${port}/api/v1`);

const agentToken = `Bearer ${getToken().agent}`;
const managerToken = `Bearer ${getToken().manager}`;

settingsConfig.logger = {
  info() {},
  debug() {},
  error() {},
};
sequelize.options.logging = false;

describe('Data Automation Api Testing', () => {
  describe('PROJECT Handler API', () => {
    describe('Fetch All PROJECT', () => {
      const route = `/project`;

      describe('When the token is not set', () => {
        it("Should Returns Status 401", function (done) {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the user role is invalid (is not authorized)', () => {
        it("Should Returns Status 403", function (done) {
          api
            .get(route)
            .set('authorization', agentToken)
            .expect(403)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value type of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:'filter'})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify(['abc'])})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When a filter is applied to a column on which a filter is not available', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({complianceStatus:{value: 'abc', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value type of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({status:'abc'})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value of the filter column is Empty', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({status:{value: '', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      // describe('When the value of the filter column is incorrect', () => {
      //   it('Should Returns Status 400', (done) => {
      //     api
      //       .get(route)
      //       .set('authorization', managerToken)
      //       .query({filter:JSON.stringify({status:{value: ['abc', 'xyz'], operator: '='}})})
      //       .expect(400)
      //       .end((err) => {
      //         if (err) return done(err);
      //         done();
      //       });
      //   });
      // });

      describe('When the operator of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({status:{value: '0', operator: 'between'}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      // describe('When the value of the filter is correct', () => {
      //   it('Should Returns Status 200 With List of Projects and total counts of projects', (done) => {
      //     api
      //       .get(route)
      //       .set('authorization', managerToken)
      //       .query({filter:JSON.stringify({project:{value: '01', operator: '='}})})
      //       .expect(200)
      //       .end((err, response) => {
      //         if (err) return done(err);
      //         const resData = response.body;
      //         expect(resData.docs).to.be.an('array');
      //         expect(resData.totalCount).to.be.equal(1);
      //         expect(resData.docs.length).to.be.equal(1);
      //         done();
      //       });
      //   });
      // });

      // describe('When the required values are correctly passed', () => {
      //   it("Should Returns Status 200 With List of Projects and total counts of projects", function (done) {
      //     api
      //       .get(route)
      //       .set('authorization', managerToken)
      //       .expect(200)
      //       .end((err, response) => {
      //         if (err) return done(err);
      //         const resData = response.body;
      //         expect(resData.docs).to.be.an('array');
      //         expect(resData.totalCount >= 1).to.be.equal(true);
      //         done();
      //       });
      //   });
      // });

    });

    describe('Fetch PROJECT By Id', () => {
      const expectedProject = availableProjects[0];
      const projectProperties = Object.keys(expectedProject);
      const { id } = expectedProject;
      const route = `/project/${id}`;

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      // it('Should Returns an Object Of PROJECT with all Require Property and expected values', (done) => {
      //   api
      //     .get(route)
      //     .set('authorization', agentToken)
      //     .then((response) => {
      //       const actualProject = response.body;
      //       expect(actualProject).to.be.an('object');
      //       expect(actualProject).to.include.all.keys(projectProperties);
      //       expect(actualProject).to.have.own.property(
      //         'name',
      //         expectedProject.name,
      //       );
      //       done();
      //     })
      //     .catch((err) => done(err));
      // });
    });

    describe('Create PROJECT', () => {
      const project = {
        name: 'Test_post_project',
        clientId: '6087dc463e5c26006f114f2d',
        projectTypeId: '01',
        receivedDate: new Date(),
        dueDate: new Date(),
      };
      const route = `/project`;

      it('Should Returns Status 401', (done) => {
        api
          .post(route)
          .send({
            project,
          })
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400', (done) => {
        api
          .post(route)
          .set('authorization', agentToken)
          .send(null)
          .expect(400)
          .then((response) => {
            done();
          })
          .catch((err) => done(err));
      });

      // it('Should Returns Status 201', (done) => {
      //   api
      //     .post(route)
      //     .set('authorization', agentToken)
      //     .send({
      //       project,
      //     })
      //     .expect(201)
      //     .then((response) => {
      //       const actualProject = response.body.project;
      //       expect(actualProject).to.be.an('object');
      //       const projectId = actualProject.id;
      //       return Project.count({
      //         where: {
      //           id: projectId,
      //         },
      //       });
      //     })
      //     .then((count) => {
      //       // If count is 0; then project creation is failed
      //       // If count is greater then 1; then duplicate Id exists
      //       expect(count).to.equal(1);
      //       done();
      //     })
      //     .catch((err) => done(err));
      // });
      // after(done => {
      //   Project.destroy({ where: { name: project.name } })
      //   .then(() => done())
      //   .catch((error) => done(error));
      // });
    });

    // Commented This Test Bcoz. GCP bucket access is not setup for tests

    // --------------------------------------------------------------------------

    // async function beforeBlockDataInsertion(inputs) {
    //   const project = inputs.project;
    //   const projectSpec = inputs.projectSpec;
    //   const projectSetting = inputs.projectSetting;
    //   const file = inputs.file;
    //   const fileChunk = inputs.fileChunk;
    //   const accountSuppression = inputs.accountSuppression;
    //   const contactSuppression = inputs.contactSuppression;
    //   const account = inputs.account;
    //   const contact = inputs.contact;
    //   const job = inputs.job;
    //   const jobError = inputs.jobError;
    //   const filePath = inputs.filePath;
    //   const userId = inputs.userId;
    //   const projectUser = inputs.projectUser;
    //   const taskLink = inputs.taskLink;
    //   const task = inputs.task;

    //   try {
    //     await sequelize.queryInterface.bulkInsert('Tasks', task, {});
    //     await sequelize.queryInterface.bulkInsert('TaskLinks', taskLink, {});
    //     await sequelize.queryInterface.bulkInsert('ProjectSpecs', projectSpec, {});
    //     await sequelize.queryInterface.bulkInsert('ProjectSettings', projectSetting, {});
    //     var bucketName;
    //     for (var i=0; i<file.length; i++) {
    //       var fileLocation = file[i].location;
    //       var fileType = file[i].type;
    //       if (fileType === 'Supporting Document') {
    //         bucketName = storage.bucket(process.env.GCLOUD_STORAGE_SUPPORT_FILE_BUCKET);
    //       } else {
    //         bucketName = storage.bucket(process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET);
    //       }
    //       await storage.bucket(bucketName.name).upload(filePath, {
    //         destination: fileLocation,
    //       });
    //     }
    //     await sequelize.queryInterface.bulkInsert('Files', file, {});
    //     await sequelize.queryInterface.bulkInsert('FileChunks', fileChunk, {});
    //     await sequelize.queryInterface.bulkInsert('AccountSuppressions', accountSuppression, {});
    //     await sequelize.queryInterface.bulkInsert('ContactSuppressions', contactSuppression, {});
    //     await sequelize.queryInterface.bulkInsert('Accounts', account, {});
    //     await sequelize.queryInterface.bulkInsert('Contacts', contact, {});
    //     await sequelize.queryInterface.bulkInsert('Jobs', job, {});
    //     await sequelize.queryInterface.bulkInsert('JobErrors', jobError, {});
    //   } catch (error) {
    //     console.log("Error in beforeBlockDataInsertion block", error);
    //   }
    // }

    // async function afterBlockDataDeletion(inputs) {
    //   const project = inputs.project;
    //   const projectSpec = inputs.projectSpec;
    //   const projectSetting = inputs.projectSetting;
    //   const file = inputs.file;
    //   const fileChunk = inputs.fileChunk;
    //   const accountSuppression = inputs.accountSuppression;
    //   const contactSuppression = inputs.contactSuppression;
    //   const account = inputs.account;
    //   const contact = inputs.contact;
    //   const job = inputs.job;
    //   const jobError = inputs.jobError;
    //   const filePath = inputs.filePath;
    //   const userId = inputs.userId;
    //   const projectUser = inputs.projectUser;
    //   const taskLink = inputs.taskLink;
    //   const task = inputs.task;

    //   try {
    //     await sequelize.queryInterface.bulkDelete('JobErrors', {
    //       id: jobError[0].id
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('Jobs', {
    //       [Op.or]: [
    //         {
    //           id: job[0].id
    //         },
    //         {
    //           id: job[1].id
    //         }
    //       ]
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('Contacts', {
    //       id: contact[0].id
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('Accounts', {
    //       id: account[0].id
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('ContactSuppressions', {
    //       id: contactSuppression[0].id
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('AccountSuppressions', {
    //       id: accountSuppression[0].id
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('FileChunks', {
    //       [Op.or]: [
    //         {
    //           id: fileChunk[0].id
    //         },
    //         {
    //           id: fileChunk[1].id
    //         },
    //         {
    //           id: fileChunk[2].id
    //         }
    //       ]
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('Files', {
    //       [Op.or]: [
    //         {
    //           id: file[0].id
    //         },
    //         {
    //           id: file[1].id
    //         },
    //         {
    //           id: file[2].id
    //         }
    //       ]
    //     }, {});
    //     var bucketName;
    //     for (var i=0; i<file.length; i++) {
    //       var fileLocation = file[i].location;
    //       var fileType = file[i].type;
    //       var fileName = file[i].name;
    //       if (fileType === 'Supporting Document') {
    //         bucketName = storage.bucket(process.env.GCLOUD_STORAGE_SUPPORT_FILE_BUCKET);
    //       } else {
    //         bucketName = storage.bucket(process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET);
    //       }
    //       // var gcpFile = await storage.bucket(bucketName.name).file(`${fileLocation}`).getMetadata();
    //       try {
    //         await storage.bucket(bucketName.name).file(`${fileLocation}`).delete();
    //         console.log(`${fileName} deleted successfully`)
    //       } catch (error) {
    //         console.log(`${fileName} does not exists in GCP or deletion failed with error ${error}`)
    //       }
    //     }
    //     await sequelize.queryInterface.bulkDelete('ProjectSettings', {
    //       id: projectSetting[0].id
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('ProjectSpecs', {
    //       id: projectSpec[0].id
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('TaskLinks', {
    //       [Op.and]: [
    //         {
    //           TaskId: task[0].id
    //         },
    //         {
    //           ObjectId: contact[0].id
    //         }
    //       ]
    //     }, {});
    //     await sequelize.queryInterface.bulkDelete('Tasks', {
    //       id: task[0].id
    //     }, {});
    //   } catch (error) {
    //     console.log("Error in afterBlockDataDeletion block", error);
    //   }
    // }

    // describe('Delete A Project', function () {
    //   const project = [{
    //     id: 'project_01',
    //     name: 'Test Project',
    //     receivedDate: new Date(),
    //     dueDate: new Date(),
    //     startDate: new Date(),
    //     deliveryDate: new Date(),
    //     description: '',
    //     ClientId: '6087dc463e5c26006f114f2d',
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     ProjectTypeId: '01'
    //   }]
    //   const projectSpec = [{
    //     id: 'projectSpec_01',
    //     ProjectId: 'project_01',
    //     name: 'Gold Spec',
    //     values:
    //       '{"type": "gold","job_level": ["VP"],"job_department": ["Operations"],"job_title": ["VP of Operations"],"employee_count": [10000],"company_revenue": ["1B"],"industry": ["Business Service, Contact Center, Customer Support"],"geography": ["CA, USA"]}',
    //     comments: 'comment_01',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //   }]
    //   const projectSetting = [{
    //     id: 'projectSetting_01',
    //     ProjectId: 'project_01',
    //     target: '{"contactTarget": 3000, "accountTarget": 4000}',
    //     contactsPerAccount: 4,
    //     clientPoc: 'None',
    //     priority: 'Medium',
    //     status: 'Active',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     createdBy: '6087dc463e5c26006f114f2c',
    //     updatedBy: '6087dc463e5c26006f114f2c',
    //     deliveryFileMapping: '[{"firstname":"firstname"},{"lastname":"lastname"}]',
    //   }]
    //   const file = [{
    //     id: 'file_01',
    //     name: 'abc1',
    //     type: 'Suppression',
    //     format: '.csv',
    //     location:
    //       'files/project_01/suppression/file_01.csv',
    //     mapping: `{
    //     "firstName" : "f_name",
    //     "middleName": "m_name",
    //     "lastName"  : "l_name",
    //     "address"   : "address",
    //     "email"     : "email",
    //     "phone"     : "phone"
    //   }`,
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     ProjectId: 'project_01',
    // }, {
    //     id: 'file_02',
    //     name: 'abc2',
    //     type: 'Inclusion',
    //     format: '.csv',
    //     location:
    //       'files/project_01/inclusion/file_02.csv',
    //     mapping: `{
    //     "firstName" : "f_name",
    //     "middleName": "m_name",
    //     "lastName"  : "l_name",
    //     "address"   : "address",
    //     "email"     : "email",
    //     "phone"     : "phone"
    //   }`,
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     ProjectId: 'project_01',
    // }, {
    //     id: 'file_03',
    //     name: 'abc3',
    //     type: 'Supporting Document',
    //     format: '.csv',
    //     location:
    //       'files/project_01/supporting_document/file_03.csv',
    //     mapping: `{
    //     "firstName" : "f_name",
    //     "middleName": "m_name",
    //     "lastName"  : "l_name",
    //     "address"   : "address",
    //     "email"     : "email",
    //     "phone"     : "phone"
    //   }`,
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     ProjectId: 'project_01',
    //   }]
    //   const fileChunk = [{
    //     id: 'fileChunk_01',
    //     processed: 100,
    //     error: 0,
    //     success: 100,
    //     size: 100,
    //     status: 'done',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     FileId: 'file_01',
    // }, {
    //     id: 'fileChunk_02',
    //     processed: 100,
    //     error: 0,
    //     success: 100,
    //     size: 100,
    //     status: 'done',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     FileId: 'file_02',
    // }, {
    //     id: 'fileChunk_03',
    //     processed: 100,
    //     error: 0,
    //     success: 100,
    //     size: 100,
    //     status: 'done',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     FileId: 'file_03',
    //   }]
    //   const accountSuppression = [{
    //     id: 'accountSuppression_01',
    //     name: 'Test Account Suppression',
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     ProjectId: 'project_01',
    //     FileId: 'file_01'
    //   }]
    //   const contactSuppression = [{
    //     id: 'contactSuppression_01',
    //     firstName: 'Test',
    //     lastName: 'ContactSuppression',
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     ProjectId: 'project_01',
    //     updatedAt: new Date(),
    //     FileId: 'file_01'
    //   }]
    //   const account = [{
    //     id: 'account_01',
    //     name: 'Test Account',
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date('2020-06-17T03:24:00'),
    //     updatedAt: new Date('2020-06-17T03:24:00'),
    //     ProjectId: 'project_01'
    //   }]
    //   const contact = [{
    //     id: 'contact_01',
    //     firstName: 'Test',
    //     lastName: 'Contact',
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     AccountId: 'account_01'
    //   }]
    //   const job = [{
    //     id: 'job_01',
    //     status: 'Completed',
    //     chunks: 2,
    //     row_count: 200,
    //     operation_name: 'accountSuppression',
    //     operation_param: '{}',
    //     result_processed: 200,
    //     result_imported: 200,
    //     result_errored: 0,
    //     sub_status: '',
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     FileId: 'file_01'
    // }, {
    //     id: 'job_02',
    //     status: 'Completed',
    //     chunks: 5,
    //     row_count: 500,
    //     operation_name: 'contactSuppression',
    //     operation_param: '{}',
    //     result_processed: 500,
    //     result_imported: 500,
    //     result_errored: 0,
    //     sub_status: '',
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     FileId: 'file_02'
    //   }]
    //   const jobError = [{
    //     id         : "jobError_01",
    //     error_desc : "First Name Not Found (Mandatory Check Failed)",
    //     row_content: `{"fname":"", "lname":"alen"}`,
    //     error_count: "1",
    //     type       : "row",
    //     row_index  : null,
    //     chunk_index: "2",
    //     createdAt  : new Date(),
    //     updatedAt  : new Date(),
    //     JobId      : "job_01"
    //   }]
    //   const filePath = path.resolve(__dirname, 'testFile.csv');
    //   const userId = '6087dc463e5c26006f114f2b';
    //   const projectUser = [{
    //     userLevel: 'owner_main',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     ProjectId: project[0].id,
    //     UserId: userId,
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //   }]
    //   const task = [{
    //     id: '01',
    //     description: 'Test Case Task',
    //     dueDate: new Date(),
    //     status: 'Pending',
    //     disposition: 'Successful',
    //     priority: 'Standard',
    //     completedDate: new Date(),
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     ProjectId: project[0].id,
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //     UserId: userId,
    //     TaskTypeId: '01'
    //   }]
    //   const taskLink = [{
    //     TaskId: task[0].id,
    //     ObjectId: contact[0].id,
    //     objectType: 'contact',
    //     disposition: 'Successful',
    //     comments: '',
    //     linkType: 'input',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     createdBy: '6087dc463e5c26006f114f2b',
    //     updatedBy: '6087dc463e5c26006f114f2b',
    //   }]

    //   const inputs = {
    //     project: project,
    //     projectSpec: projectSpec,
    //     projectSetting: projectSetting,
    //     file: file,
    //     fileChunk: fileChunk,
    //     accountSuppression: accountSuppression,
    //     contactSuppression: contactSuppression,
    //     account: account,
    //     contact: contact,
    //     job: job,
    //     jobError: jobError,
    //     filePath: filePath,
    //     userId: userId,
    //     projectUser: projectUser,
    //     task: task,
    //     taskLink: taskLink
    //   }

    //   const id                = project[0].id;
    //   const route             = `/project/${id}`;

    //   describe('User is unauthorized', function () {
    //     it('Should Returns Status 401', function (done) {
    //       api
    //         .delete(route)
    //         .query({ projectName: project[0].name })
    //         .expect(401)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //   });

    //   describe('User has project deletion permission', function () {
    //     before(async () => {
    //       try {
    //         await sequelize.queryInterface.bulkInsert('Projects', project, {});
    //         await sequelize.queryInterface.bulkInsert('ProjectUsers', projectUser, {});
    //         await beforeBlockDataInsertion(inputs);
    //       } catch (error) {
    //         console.log("Error in beforeEach block", error);
    //       }
    //     });

    //     it('Should Returns Status 200', function (done) {
    //       api
    //         .delete(route)
    //         .set('authorization', agentToken)
    //         .query({ projectName: project[0].name })
    //         .expect(200)
    //         .then(async response => {
    //           var projectAvailable = await Project.findOne({
    //             where: {
    //               id: project[0].id
    //             }
    //           })
    //           expect(projectAvailable).to.equal(null);
    //           done();
    //         })
    //         .catch(err => done(err));
    //     });

    //     after(async () => {
    //       try {
    //         await afterBlockDataDeletion(inputs);
    //         await sequelize.queryInterface.bulkDelete('ProjectUsers', {
    //           [Op.and]: [
    //             {
    //               ProjectId: project[0].id
    //             },
    //             {
    //               UserId: userId
    //             }
    //           ]
    //         }, {});
    //         await sequelize.queryInterface.bulkDelete('Projects', {
    //           id: project[0].id
    //         }, {});
    //       } catch (error) {
    //         console.log("Error in afterEach block", error);
    //       }
    //     });
    //   })

    //   describe('User has project deletion permission but required params missing', function () {
    //     before(async () => {
    //       try {
    //         await sequelize.queryInterface.bulkInsert('Projects', project, {});
    //         await sequelize.queryInterface.bulkInsert('ProjectUsers', projectUser, {});
    //         await beforeBlockDataInsertion(inputs);
    //       } catch (error) {
    //         console.log("Error in beforeEach block", error);
    //       }
    //     });

    //     it('Should Returns Status 400', function (done) {
    //       api
    //         .delete(route)
    //         .set('authorization', agentToken)
    //         .expect(400)
    //         .then(async response => {
    //           done();
    //         })
    //         .catch(err => done(err));
    //     });

    //     after(async () => {
    //       try {
    //         await afterBlockDataDeletion(inputs);
    //         await sequelize.queryInterface.bulkDelete('ProjectUsers', {
    //           [Op.and]: [
    //             {
    //               ProjectId: project[0].id
    //             },
    //             {
    //               UserId: userId
    //             }
    //           ]
    //         }, {});
    //         await sequelize.queryInterface.bulkDelete('Projects', {
    //           id: project[0].id
    //         }, {});
    //       } catch (error) {
    //         console.log("Error in afterEach block", error);
    //       }
    //     });
    //   })

    //   describe('User do not have project deletion permission', function () {
    //     before(async () => {
    //       try {
    //         await sequelize.queryInterface.bulkInsert('Projects', project, {});
    //         await beforeBlockDataInsertion(inputs);
    //       } catch (error) {
    //         console.log("Error in beforeEach block", error);
    //       }
    //     });

    //     it('Should Returns Status 403', function (done) {
    //       api
    //         .delete(route)
    //         .set('authorization', agentToken)
    //         .query({ projectName: project[0].name })
    //         .expect(403)
    //         .then(response => {
    //           done();
    //         })
    //         .catch(err => done(err));
    //     });

    //     after(async () => {
    //       try {
    //         await afterBlockDataDeletion(inputs);
    //         await sequelize.queryInterface.bulkDelete('Projects', {
    //           id: project[0].id
    //         }, {});
    //       } catch (error) {
    //         console.log("Error in afterEach block", error);
    //       }
    //     });
    //   })
    // });

    // --------------------------------------------------------------------------

    //* Route Will Be Removed so it's test is commented
    // describe('Edit PROJECT', async function () {

    //   let id = 'test_01';
    //   const project = {
    //     id: id,
    //     name: 'Test_put_project',
    //     clientId: '6087dc463e5c26006f114f2d',
    //     type:'02',
    //     receivedDate: new Date(),
    //     dueDate: new Date()
    //   };

    //   const updatedproject = {
    //     id: id,
    //     name: 'Updated_test_put_project',
    //     clientId: '6087dc463e5c26006f114f2d',
    //     type:'02',
    //     receivedDate: new Date(),
    //     dueDate: new Date()
    //   };

    //   const route = `/project/${id}`;

    //   it('Should Returns Status 401', function (done) {
    //     api
    //       .put(route)
    //       .send({project : updatedproject})
    //       .expect(401)
    //       .end(err => {
    //         if (err) return done(err);
    //         done();
    //       });
    //   });

    //   before(async () => {
    //     await Project.create(project);
    //   });
    //   it("Should Returns Status 200", function(done) {
    //     api
    //       .put(route)
    //       .send({project : updatedproject})
    //       .set('authorization', agentToken)
    //       .expect(200)
    //       .then(response => {
    //         return Project.count({ where: { name: updatedproject.name }});
    //       })
    //       .then(count => {
    //         // If count is 0; then project creation is failed
    //         // If count is greater then 1; then duplicate Id exists
    //         expect(count).to.equal(1);
    //         done();
    //       })
    //       .catch(err => done(err));
    //   });
    //   after(async () => {
    //     await Project.destroy({ where: { id: id }});
    //   });
    // });
  });

  describe('PROJECT Specs Handler API', () => {
    describe('Fetch All Specs', () => {
      const project = availableProjects[0];
      const spec = availableProjectSpecs[0];
      const projectId = project.id;
      const route = `/project/${projectId}/specs`;
      const specProperties = Object.keys(spec);

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns an NonEmpty Array of Spec Objects', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .then((response) => {
            const specs = response.body;
            const spec = specs[0];
            expect(specs).to.be.an('array');
            expect(specs).to.have.lengthOf.above(0);
            expect(spec).to.include.all.keys(specProperties);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('Fetch Specs By Id', () => {
      const project = availableProjects[0];
      const expectedSpec = availableProjectSpecs[0];
      const projectId = project.id;
      const specId = expectedSpec.id;
      const route = `/project/${projectId}/specs/${specId}`;
      const specProperties = Object.keys(expectedSpec);

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns an Object Of PROJECTSpec with all Require Property and expected values', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .then((response) => {
            const actualSpec = response.body;
            expect(actualSpec).to.be.an('object');
            expect(actualSpec).to.include.all.keys(specProperties);
            expect(actualSpec).to.have.own.property('name', expectedSpec.name);
            expect(actualSpec).to.have.own.property(
              'ProjectId',
              expectedSpec.ProjectId,
            );
            expect(actualSpec).to.have.own.property(
              'comments',
              expectedSpec.comments,
            );
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('Create Specs', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const spec = {
        projectSpec: {
          name: 'Gold Spec',
          values:
            '{"type": "gold","job_level": ["VP"],"job_department": ["Operations"],"job_title": ["VP of Operations"],"employee_count": [10000],"company_revenue": ["1B"],"industry": ["Business Service, Contact Center, Customer Support"],"geography": ["CA, USA"]}',
          comments: 'comment_01',
        },
      };
      const route = `/project/${projectId}/specs`;

      it('Should Returns Status 401', (done) => {
        api
          .post(route)
          .send(spec)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400', (done) => {
        api
          .post(route)
          .send(null)
          .set('authorization', agentToken)
          .expect(400)
          .then((result) => {
            done();
          })
          .catch((err) => done(err));
      });

      it('Should Returns Status 201', (done) => {
        api
          .post(route)
          .send(spec)
          .set('authorization', agentToken)
          .expect(201)
          .then((response) => {
            const actualSpec = response.body;
            expect(actualSpec).to.be.an('object');
            const specId = actualSpec.id;
            return ProjectSpec.count({
              where: {
                id: specId,
              },
            });
          })
          .then((count) => {
            // If count is 0; then project creation is failed
            // If count is greater then 1; then duplicate Id exists
            expect(count).to.equal(1);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('Edit Specs', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const { createdBy } = project;
      const specId = 'test01';
      const spec = {
        id: specId,
        ProjectId: projectId,
        name: 'Gold Spec Test Object',
        values:
          '{"type": "gold","job_level": ["VP"],"job_department": ["Operations"],"job_title": ["VP of Operations"],"employee_count": [10000],"company_revenue": ["1B"],"industry": ["Business Service, Contact Center, Customer Support"],"geography": ["CA, USA"]}',
        comments: 'comment_01',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        updatedBy: createdBy,
      };
      const updatedSpec = {
        id: specId,
        ProjectId: projectId,
        name: 'Updated Gold Spec Test Object',
        values:
          '{"type": "gold","job_level": ["VP"],"job_department": ["Operations"],"job_title": ["VP of Operations"],"employee_count": [10000],"company_revenue": ["1B"],"industry": ["Business Service, Contact Center, Customer Support"],"geography": ["CA, USA"]}',
        comments: 'comment_01',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        updatedBy: createdBy,
      };
      const route = `/project/${projectId}/specs/${specId}`;

      it('Should Returns Status 401', (done) => {
        api
          .put(route)
          .send({
            projectSpec: spec,
          })
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400', (done) => {
        api
          .put(route)
          .set('authorization', agentToken)
          .send(null)
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      before((done) => {
        ProjectSpec.create(spec)
          .then((res) => {
            done();
          })
          .catch((err) => {
            console.log(err);
          });
      });
      it('Should Returns Status 200', (done) => {
        api
          .put(route)
          .send({
            projectSpec: updatedSpec,
          })
          .set('authorization', agentToken)
          .expect(200)
          .then((response) =>
            ProjectSpec.findOne({
              where: {
                [Op.and]: [
                  {
                    id: specId,
                  },
                  {
                    ProjectId: projectId,
                  },
                ],
              },
            }),
          )
          .then((spec) => {
            const actual = spec.name;
            const expected = updatedSpec.name;
            expect(actual).to.equal(expected);
            done();
          })
          .catch((err) => done(err));
      });
      after((done) => {
        ProjectSpec.destroy({
          where: {
            id: specId,
          },
        }).then(() => done());
      });
    });

    describe('Delete Specs By Id', () => {
      const project = availableProjects[0];
      const expectedSpec = availableProjectSpecs[0];
      const projectId = project.id;
      const specId = expectedSpec.id;
      const route = `/project/${projectId}/specs/${specId}`;

      it('Should Returns Status 401', (done) => {
        api
          .delete(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 201', (done) => {
        api
          .delete(route)
          .set('authorization', agentToken)
          .expect(201)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });
    });

    describe('Fetch List of Exclusion Job Titles', () => {
      const project = availableProjects[0];

      describe('When token is not provided', () => {
        const projectId = project.id;
        const route = `/projects/${projectId}/excludedJobTitle`;
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When required params are passed', () => {
        const projectId = project.id;
        const route = `/projects/${projectId}/excludedJobTitle`;
        it('Should Returns List Of Exclusion Job Titles', (done) => {
          api
            .get(route)
            .set('authorization', agentToken)
            .expect(200)
            .then((response) => {
              const excludedJobTitles = response.body;
              expect(excludedJobTitles).to.be.an('array');
              done();
            })
            .catch((err) => done(err));
        });
      });
    });
  });

  describe('PROJECT Settings Handler API', () => {
    describe('Fetch PROJECT Setting', () => {
      const project = availableProjects[0];
      const setting = availableProjectSettings[0];
      const projectId = project.id;
      const route = `/project/${projectId}/setting`;
      const settingProperties = Object.keys(setting);

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns an Setting Objects', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const setting = response.body;
            expect(setting).to.be.an('object');
            expect(setting).to.include.all.keys(settingProperties);
            done();
          });
      });
    });

    describe('Edit PROJECT Setting', () => {
      const projectSetting = { ...availableProjectSettings[0] };
      const projectId = projectSetting.ProjectId;
      const setting = {
        projectSetting: {
          projectId: '01',
          name: 'Moxie Contact Build',
          receivedDate: '2021-05-06T08:40:20.492Z',
          dueDate: '2021-05-06T08:40:20.492Z',
          target: {
            contactTarget: 2300,
            accountTarget: 4500,
          },
          contactsPerAccount: '4',
          clientPoc: 'None',
          priority: 'High',
          status: 'Yet to Start',
          type: 'Contact build',
          meta: {},
          clientId: '6087dc463e5c26006f114f2d',
          description: '',
          contactExpiry: '30',
          users: {
            owner_assigned: [
              {
                id: '6087dc463e5c26006f114f2b',
              },
            ],
          },
        },
      };
      const route = `/project/${projectId}/setting`;

      it('Should Returns Status 401', (done) => {
        api
          .put(route)
          .send(setting)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 403', (done) => {
        api
          .put(route)
          .send(null)
          .set('authorization', agentToken)
          .expect(403)
          .then((response) => {
            done();
          })
          .catch((err) => done(err));
      });

      /* Removing bcoz of user role error */
      // it('Should Returns Status 200', (done) => {
      //   api
      //     .put(route)
      //     .send(setting)
      //     .set('authorization', managerToken)
      //     .expect(200)
      //     .then((response) =>
      //       ProjectSetting.findOne({
      //         where: {
      //           id: projectSetting.id,
      //         },
      //       }),
      //     )
      //     .then((setting) => {
      //       expect(setting.priority).to.equal('High');
      //       done();
      //     })
      //     .catch((err) => done(err));
      // });
    });

    describe('Edit PROJECT Setting Target and Contacts per account', () => {
      const projectSetting = { ...availableProjectSettings[0] };
      const projectId = projectSetting.ProjectId;
      const setting = {
        projectSetting: {
          projectId: '01',
          target: {
            contactTarget: 2500,
            accountTarget: 2500,
          },
          contactsPerAccount: '5',
          clientPoc: 'None',
          priority: 'High',
          status: 'Yet to Start',
        },
      };
      const route = `/projects/${projectId}/editSettings`;

      it('Should Returns Status 401', (done) => {
        api
          .put(route)
          .send(setting)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400', (done) => {
        api
          .put(route)
          .send(null)
          .set('authorization', agentToken)
          .expect(400)
          .then((response) => {
            done();
          })
          .catch((err) => done(err));
      });

      it('Should Returns Status 200', (done) => {
        api
          .put(route)
          .send(setting)
          .set('authorization', agentToken)
          .expect(200)
          .then((response) =>
            ProjectSetting.findOne({
              where: {
                id: projectSetting.id,
              },
            }),
          )
          .then((setting) => {
            expect(setting.contactsPerAccount).to.equal('5');
            expect(setting.target.contactTarget).to.equal(2500);
            expect(setting.target.accountTarget).to.equal(2500);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('PROJECT type Handler API', () => {
    describe('Fetch All Project Types', () => {
      const route = `/projects/types`;

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 with list of project types', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .then((response) => {
            const types = response.body;
            const type = types[0];
            expect(types).to.be.an('array');
            expect(types).to.have.lengthOf.above(0);
            expect(type).to.include.all.keys(['id', 'type']);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('Task Type Handler API', () => {
    describe('Fetch All Task Type', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const route = `/projects/taskTypes`;
      const taskTypeProperties = ['id', 'type'];

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Array of Task Types', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const taskTypes = response.body;
            const taskType = taskTypes[0];
            expect(taskTypes).to.be.an('array');
            expect(taskType).to.include.all.keys(taskTypeProperties);
            done();
          });
      });
    });

    describe('Fetch Task Type Of A Project', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const route = `/project/${projectId}/taskType`;
      const taskTypeProperties = ['id'];

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns A Task Type Of A Project', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const taskType = response.body;
            expect(taskType).to.include.all.keys(taskTypeProperties);
            done();
          });
      });
    });
  });

  /* 
  * NOTE :: Need To Add Task Seeders First To Run Task API Test
  describe("Task API", function () {
    describe("Fetch Task By Id", function () {
      const project = availableProjects[0];
      const projectId = project.id;
      const taskId = "";
      const route = `/projects/${projectId}/tasks/${taskId}`;
      const taskProperties = [
        "id",
        "completedDate",
        "disposition",
        "dueDate",
        "description",
        "status",
        "priority",
      ];
      const linkedProperties = ["Project", "TaskType"];

      it("Should Returns Status 401", function (done) {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("Should Returns Status 200", function (done) {
        api
          .get(route)
          .set("authorization", agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("Should Returns Task Object", function (done) {
        api
          .get(route)
          .set("authorization", agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const task = response.body;
            expect(task).to.be.an("object");
            expect(task).to.include.all.keys(taskTypeProperties);
            done();
          });
      });

      it("Should have project and taskType in Task Object", function (done) {
        api
          .get(route)
          .set("authorization", agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const task = response.body;
            expect(task).to.be.an("object");
            expect(task).to.include.all.keys(linkedProperties);
            done();
          });
      });
    });
  });
*/

  describe('Tasks Handler API', () => {
    describe('Get tasks live counts for agent', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const responseKeys = ['positiveDisposedContactsCounts', 'positiveDisposedContactsOverallCounts', 'disposedAccountCounts', 'disposedAccountOverallCounts', 'negativeDisposedAccountCounts', 'negativeDisposedAccountOverallCounts', 'positiveDisposedContactsCountsOfAnAccount'];
      const route = `/tasks/tasksLiveCounts`;

      it("Should Returns Status 401", function (done) {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("Should Returns Status 400", function (done) {
        api
          .get(route)
          .set('authorization', agentToken)
          .query({ projectId: projectId})
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("Should Returns Status 200 with counts", function (done) {
        api
          .get(route)
          .set('authorization', agentToken)
          .query({ projectId: projectId, countsToCalculate: ['contacts', 'accounts']})
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const taskCounts = response.body;
            expect(taskCounts).to.be.an("object");
            expect(Object.keys(taskCounts)).to.be.eql(responseKeys)
            done();
          });
      });      
    });
    describe('Fetch task list for Manager', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const route = `/projects/${projectId}/tasks`;
      const responseKeys = ['totalCount', "docs"];
      const taskKeysOfRes = ["accountDisposition", "contactDisposition", "activity", "accountName", "contactEmail", "potential", "priority", "status", "taskCreatedDate", "userName", "website", "accountFinalDisposition"];
      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value type of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:'filter'})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify(['abc'])})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When a filter is applied to a column on which a filter is not available', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({contactStage:{value: 'abc', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value type of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({userName:'abc'})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter column is Empty', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({userName:{value: '', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      // describe('When the value of the filter column is incorrect', () => {
      //   it('Should Returns Status 400', (done) => {
      //     api
      //       .get(route)
      //       .set('authorization', managerToken)
      //       .query({filter:JSON.stringify({userName:{value: ['abc', 'xyz'], operator: '='}})})
      //       .expect(400)
      //       .end((err) => {
      //         if (err) return done(err);
      //         done();
      //       });
      //   });
      // });
      describe('When the operator of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({userName:{value: ['abc'], operator: '>'}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value type of the sort is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({sort:'abc'})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the sort is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({sort:JSON.stringify([])})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      // describe('When the sort is applied to more than one column', () => {
      //   it('Should Returns Status 400', (done) => {
      //     api
      //       .get(route)
      //       .set('authorization', managerToken)
      //       .query({sort:JSON.stringify({userName: 'asc', accountName: 'asc'})})
      //       .expect(400)
      //       .end((err) => {
      //         if (err) return done(err);
      //         done();
      //       });
      //   });
      // });
      describe('When a sort is applied to a column on which a sort is not available', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({sort:JSON.stringify({contactStage: 'asc'})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the sort column is Empty', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({sort:JSON.stringify({userName: ''})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the sort column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({sort:JSON.stringify({userName: 'abc'})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      // This testcase is correct to uncomment this after the seeders of the task are added
      // describe('When the mandatory value is sent correctly', () => {
      //   it('Should Returns Status 200 With List of Task', (done) => {
      //     api 
      //     .get(route)
      //     .set('authorization', managerToken)
      //     .expect(200)
      //     .end((err, response) => {
      //       if (err) return done(err);
      //       const resData = response.body;

      //       expect(resData).to.be.an("object");
      //       expect(Object.keys(resData)).to.be.eql(responseKeys);
      //       expect(resData.totalCount).to.be.an("number");
      //       expect(resData.docs).to.be.an("array");

      //       const taskData = resData.docs[0];
      //       expect(taskData).to.be.an("object");
      //       expect(Object.keys(taskData)).to.be.eql(taskKeysOfRes);
      //       done();
      //     });
      //   });
      // });
      // describe('When the value of the filter is correct', () => {
      //   it('Should Returns Status 200 With List of Filtered Task', (done) => {
      //     api
      //       .get(route)
      //       .set('authorization', managerToken)
      //       .query({filter:JSON.stringify({userName:{value: 'agent1@nexsales.com', operator: '='}})})
      //       .expect(200)
      //       .end((err, response) => {
      //         if (err) return done(err);
      //         const resData = response.body;
  
      //         expect(resData).to.be.an("object");
      //         expect(Object.keys(resData)).to.be.eql(responseKeys);
      //         expect(resData.totalCount).to.be.an("number");
      //         expect(resData.docs).to.be.an("array");
  
      //         const taskData = resData.docs[0];
      //         expect(taskData).to.be.an("object");
      //         expect(Object.keys(taskData)).to.be.eql(taskKeysOfRes);

      //         const actualUserName = taskData.userName;
      //         const expectedUserName = 'agent1@nexsales.com';
      //         expect(actualUserName).to.be.eql(expectedUserName);
      //         done();
      //       });
      //   });
      // });
      // describe('When the value of the sort is correct', () => {
      //   it('Should Returns Status 200 With List of Sorted Task', (done) => {
      //     api 
      //     .get(route)
      //     .set('authorization', managerToken)
      //     .query({sort:JSON.stringify({userName: 'asc'})})
      //     .expect(200)
      //     .end((err, response) => {
      //       if (err) return done(err);
      //       const resData = response.body;

      //       expect(resData).to.be.an("object");
      //       expect(Object.keys(resData)).to.be.eql(responseKeys);
      //       expect(resData.totalCount).to.be.an("number");
      //       expect(resData.docs).to.be.an("array");

      //       const taskData = resData.docs[0];
      //       expect(taskData).to.be.an("object");
      //       expect(Object.keys(taskData)).to.be.eql(taskKeysOfRes);
      //       done();
      //     });
      //   });
      // });
    });
    describe('Fetch tasks stats of a project', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const responseKeys = ['Total', 'Completed', 'Overdue', 'Upcoming', 'Working'];
      const route = `/projects/${projectId}/tasks/stats`;

      describe('When the token is not set', () => {
        it("Should Returns Status 401", function (done) {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value type of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:'filter'})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify(['abc'])})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When a filter is applied to a column on which a filter is not available', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({complianceStatus:{value: 'abc', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value type of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({status:'abc'})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value of the filter column is Empty', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({status:{value: '', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({status:{value: ['abc', 'xyz'], operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the operator of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({status:{value: '0', operator: 'between'}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value of the filter is correct', () => {
        it('Should Returns Status 200 With List of Stats', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({status:{value: 'Completed', operator: '='}})})
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              const resData = response.body;
              expect(resData).to.be.an('array');
              const resDataKeys = _.map(resData, 'status');
              expect(JSON.stringify(resDataKeys)).to.be.equal(JSON.stringify(responseKeys));
              done();
            });
        });
      });

      describe('When the required values are correctly passed', () => {
        it("Should Returns Status 200 with counts", function (done) {
          api
            .get(route)
            .set('authorization', managerToken)
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              const taskCounts = response.body;
              expect(taskCounts).to.be.an("array");
              const taskCountsKeys = _.map(taskCounts, 'status');
              expect(JSON.stringify(taskCountsKeys)).to.be.equal(JSON.stringify(responseKeys));
              done();
            });
        });
      });
    });
  });
  
// TODO: Write Unit Test Cases For AccountAPIs and Remove Commented API test cases
/*
 describe('Account Handler API', () => {
    describe('Fetch Accounts', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const route = `/project/${projectId}/accounts`;
      const responseKeys = ['totalCount', "docs"];
      const accountKeysOfRes = ["complianceStatus","createdAt","disposition","domain","industry","label","name","potential","researchStatus","stage", "assignedTo"];

      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the value type of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:'filter'})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify(['abc'])})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When a filter is applied to a column on which a filter is not available', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({complianceStatus:{value: 'abc', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value type of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({potential:'abc'})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter column is Empty', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({potential:{value: '', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({potential:{value: ['abc', 'xyz'], operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the operator of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({potential:{value: '0', operator: 'between'}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter is correct', () => {
        it('Should Returns Status 200 With List of Filtered Account', (done) => {
          api
            .get(route)
            .set('authorization', agentToken)
            .query({filter:JSON.stringify({potential:{value: '5', operator: '='}})})
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              const resData = response.body;
              expect(resData).to.include.all.keys(responseKeys);
  
              const totalAccount = resData.totalCount;
              const accounts = resData.docs;
              const account = accounts[0];
  
              expect(totalAccount).to.be.an('number');
              expect(accounts).to.be.an('array');
              expect(account).to.be.an("object");
              expect(account).to.include.all.keys(accountKeysOfRes);

              const actualPotential = account.potential;
              const expectedPotential = '5';
              expect(actualPotential).to.be.eql(expectedPotential);
              done();
            });
        });
      });
      describe('When the mandatory value is sent correctly', () => {
        it('Should Returns Status 200 With List of Account', (done) => {
          api
            .get(route)
            .set('authorization', agentToken)
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              const resData = response.body;
              expect(resData).to.include.all.keys(responseKeys);
  
              const totalAccount = resData.totalCount;
              const accounts = resData.docs;
              const account = accounts[0];
  
              expect(totalAccount).to.be.an('number');
              expect(accounts).to.be.an('array');
              expect(account).to.be.an("object");
              expect(account).to.include.all.keys(accountKeysOfRes);
              done();
            });
        });
      });

      describe('When the mandatory value is sent correctly and applying pagination', () => {
        it('Should Returns Status 200 With List of Account', (done) => {
          api
            .get(route)
            .query({
              pageNo: 1,
              pageSize: 1,
            })
            .set('authorization', agentToken)
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              const resData = response.body;
  
              const totalAccount = resData.totalCount;
              const accounts = resData.docs;
              const account = accounts[0];
  
              expect(resData).to.include.all.keys(responseKeys);
              expect(totalAccount).to.be.an('number');
              expect(accounts).to.be.an('array');
              expect(accounts).to.have.lengthOf(1);
              expect(account).to.include.all.keys(accountKeysOfRes);
              done();
            });
        });
      });
    });

    describe('Fetch Account Stats', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const route = `/projects/${projectId}/accounts/stats`;
      const statsProperties = ['dispositions', 'stages'];

      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value type of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:'filter'})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify(['abc'])})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When a filter is applied to a column on which a filter is not available', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({complianceStatus:{value: 'abc', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value type of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({potential:'abc'})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter column is Empty', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({potential:{value: '', operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({potential:{value: ['abc', 'xyz'], operator: '='}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the operator of the filter column is incorrect', () => {
        it('Should Returns Status 400', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({filter:JSON.stringify({potential:{value: '0', operator: 'between'}})})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the value of the filter is correct', () => {
        it('Should Returns Status 200 With List of Filtered Account', (done) => {
          api
            .get(route)
            .set('authorization', agentToken)
            .query({filter:JSON.stringify({potential:{value: '5', operator: '='}})})
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              const result = response.body;
              const stages = response.body.stages;
              const dispositions = response.body.dispositions;
              expect(result).to.include.all.keys(statsProperties);
              expect(dispositions).to.be.an('object');
              expect(stages).to.be.an('object');
              done();
            });
        });
      });
      describe('When the mandatory value is sent correctly', () => {
        it('Should Return Status 200 With Stats Object', (done) => {
          api
            .get(route)
            .set('authorization', agentToken)
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              const result = response.body;
              const stages = response.body.stages;
              const dispositions = response.body.dispositions;
              expect(result).to.include.all.keys(statsProperties);
              expect(dispositions).to.be.an('object');
              expect(stages).to.be.an('object');
              done();
            });
        });
      });
    });

    describe('Fetch account By Id', () => {
      const project = availableProjects[0];
      const account = availableAccounts[0];
      const projectId = project.id;
      const accountId = account.id;
      const route = `/project/${projectId}/accounts/${accountId}`;
      const accountProperties = Object.keys(account);

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Return an Object Of Account', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .then((response) => {
            const actualAccount = response.body;

            expect(actualAccount).to.be.an('object');
            expect(actualAccount).to.include.all.keys(accountProperties);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('Edit account', () => {
      const project = availableProjects[0];
      const account = availableAccounts[0];
      const projectId = project.id;
      const accountId = account.id;
      const route = `/project/${projectId}/accounts/${accountId}`;
      const accountProperties = Object.keys(account);
      const updatedAccount = Object.assign({}, account);
      updatedAccount.name = 'account edit';
      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .put(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the mandatory value is not sent correctly', () => {
        // it('Should Returns Status 400 When projectId is Empty', (done) => {
        //   var route = `/project/${null}/accounts/${accountId}`;
        //   api
        //     .put(route)
        //     .send(updatedAccount)
        //     .set('authorization', agentToken)
        //     .expect(400)
        //     .end((err) => {
        //       if (err) return done(err);
        //       done();
        //     });
        // });
        // it('Should Returns Status 400 When accountId is Empty', (done) => {
        //   var route = `/project/${projectId}/accounts/${null}`;
        //   api
        //     .put(route)
        //     .send(updatedAccount)
        //     .set('authorization', agentToken)
        //     .expect(400)
        //     .end((err) => {
        //       if (err) return done(err);
        //       done();
        //     });
        // });
        it('Should Returns Status 400 When account not send', (done) => {
          var route = `/project/${projectId}/accounts/${accountId}`;
          api
            .put(route)
            .send(null)
            .set('authorization', agentToken)
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the mandatory value is sent correctly', () => {
        it('Should Returns Status 200 With file metadata', (done) => {
          api
            .put(route)
            .send(updatedAccount)
            .set('authorization', agentToken)
            .expect(200)
            .then((response) =>
              Account.findOne({
                where: {
                  [Op.and]: [{
                      id: accountId,
                    },
                    {
                      ProjectId: projectId,
                    },
                  ],
                },
              }),
            )
            .then((account) => {
              const actual = account.name;
              const expected = updatedAccount.name;
              expect(actual).to.equal(expected);
              done();
            })
            .catch((err) => done(err));
        });
        after((done) => {
          Account.update(account, {
            where: {
              [Op.and]: [
                {
                  id: accountId,
                },
                {
                  ProjectId: projectId,
                },
              ],
            },
          }).then(() => done());
        });
      });
    });
  }); */


  describe('Contacts Handler API', () => {
    describe('Get contacts preview for agent', () => {
      const route = `/agent/preview`;

      it("Should Returns Status 401", function (done) {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("Should Returns Status 200 with total counts and array of contacts with default updatedAt sort", function (done) {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const totalContact = response.body.count;
            const contacts = response.body.rows;
            const defaultSort = response.body.sort;
            expect(totalContact).to.be.an('number');
            expect(contacts).to.be.an('array');
            done();
          });
      });      
    });

    // describe('Fetch Contacts', () => {
    //   const project = availableProjects[0];
    //   const contact = availableContacts[0];
    //   const projectId = project.id;
    //   const route = `/project/${projectId}/contacts`;
    //   const responseKeys = ['totalCount', "docs"];
    //   const contactKeysOfRes = ["jobTitle","disposition","researchStatus","stage","complianceStatus","companyName","contactFullName"];

    //   it('Should Returns Status 401', (done) => {
    //     api
    //       .get(route)
    //       .expect(401)
    //       .end((err) => {
    //         if (err) return done(err);
    //         done();
    //       });
    //   });

      // it('Should Returns Status 200', (done) => {
      //   api
      //     .get(route)
      //     .set('authorization', agentToken)
      //     .expect(200)
      //     .end((err) => {
      //       if (err) return done(err);
      //       done();
      //     });
      // });

      // it('Should Returns Array of Contact', (done) => {
      //   api
      //     .get(route)
      //     .set('authorization', agentToken)
      //     .expect(200)
      //     .end((err, response) => {
      //       if (err) return done(err);
      //       const resData = response.body;
      //       expect(resData).to.include.all.keys(responseKeys);

      //       const totalContact = resData.totalCount;
      //       const contacts = resData.docs;
      //       const contact = contacts[0];
      //       expect(totalContact).to.be.an('number');
      //       expect(contacts).to.be.an('array');
      //       expect(contact).to.be.an("object");
      //       expect(contact).to.include.all.keys(contactKeysOfRes);
      //       done();
      //     });
      // });

      // it('Should Returns Array of Contacts in Page wise', (done) => {
      //   api
      //     .get(route)
      //     .query({
      //       pageNo: 1,
      //       pageSize: 1,
      //     })
      //     .set('authorization', agentToken)
      //     .expect(200)
      //     .end((err, response) => {
      //       if (err) return done(err);
      //       const resData = response.body;
      //       expect(resData).to.include.all.keys(responseKeys);

      //       const totalContact = resData.totalCount;
      //       const contacts = resData.docs;
      //       const contact = contacts[0];

      //       expect(totalContact).to.be.an('number');
      //       expect(contacts).to.be.an('array');
      //       expect(contacts).to.have.lengthOf(1);
      //       expect(contact).to.include.all.keys(contactKeysOfRes);
      //       done();
      //     });
      // });
    // });

    // describe('Fetch Stats', () => {
    //   const project = availableProjects[0];
    //   const projectId = project.id;
    //   const route = `/projects/${projectId}/contacts/stats`;
    //   const statsProperties = ['researchStatus', 'stage'];

    //   it('Should Returns Status 401', (done) => {
    //     api
    //       .get(route)
    //       .expect(401)
    //       .end((err) => {
    //         if (err) return done(err);
    //         done();
    //       });
    //   });

    //   it('Should Returns Status 200', (done) => {
    //     api
    //       .get(route)
    //       .set('authorization', agentToken)
    //       .expect(200)
    //       .end((err) => {
    //         if (err) return done(err);
    //         done();
    //       });
    //   });

    //   it('Should Returns Stats Object', (done) => {
    //     api
    //       .get(route)
    //       .set('authorization', agentToken)
    //       .expect(200)
    //       .end((err, response) => {
    //         if (err) return done(err);
    //         const result = response.body; 
    //         const stages = response.body.stage.stages;
    //         const researchStatus = response.body.researchStatus;
    //         expect(result).to.include.all.keys(statsProperties);
    //         expect(researchStatus).to.be.an('array');
    //         expect(stages).to.be.an('array');
    //         done();
    //       });
    //   });
    // });

    describe('Create Contact', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const account = availableAccounts[0];
      const accountId = account.id;
      const contact = {
        address: {street1: "Ashram Road,Ellisbridge", street2: "", city: "Ahmedabad", state: "GJ", country: "India"},
        firstName: "Chirag",
        lastName: "Shah",
      };
      const disposeContact = false;
      var contactId = '';
      const route = `/projects/${projectId}/accounts/${accountId}/contacts`;

      it('Should Returns Status 401', (done) => {
        api
          .post(route)
          .send(contact)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400', (done) => {
        api
          .post(route)
          .set('authorization', agentToken)
          .send(null)
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      // it('Should Returns Status 201 for successful contact creation', (done) => {
      //   api
      //     .post(route)
      //     .send({
      //       contact: contact,
      //       contactExpiry:'30',
      //       clientId: '01',
      //       disposeContact: disposeContact
      //     })
      //     .set('authorization', agentToken)
      //     .expect(201)
      //     .then((response) => {
      //       const actualContact = response.body;
      //       expect(actualContact).to.be.an('object');
      //       contactId = actualContact.contactId;
      //       return Contact.count({
      //         where: {
      //           id: contactId,
      //         },
      //       });
      //     })
      //     .then((count) => {
      //       // If count is 0; then project creation is failed
      //       // If count is greater then 1; then duplicate Id exists
      //       expect(count).to.equal(1);
      //       return 'Success';
      //     })
      //     .then(async (result) => {
      //       console.log('Result : ', result);
      //       var createdContact = await Contact.findOne({
      //         where: {
      //           id: contactId,
      //         },
      //       });
      //       expect(createdContact.previous_firstName).to.equal(contact.firstName);
      //       expect(createdContact.previous_lastName).to.equal(contact.lastName);
      //       done();
      //     })
      //     .catch((err) => done(err));
      // });

      after(async () => {
        await Contact.destroy({
          where: {
            id: contactId,
          },
        });
      });
    });

    describe('Update Contact', () => {
      const project = availableProjects[0];
      const projectId = project.id;
      const account = availableAccounts[0];
      const accountId = account.id;
      const contact = {
        address: {street1: "Ashram Road,Ellisbridge", street2: "", city: "Ahmedabad", state: "GJ", country: "India"},
        firstName: "Chirag",
        lastName: "Shah",
        id: "test-6087dc463e5c26006f114abc",
        createdAt: '2021-06-17T07:02:39.870Z',
        createdBy: '6087dc463e5c26006f114f2b',
        updatedAt: '2021-06-17T07:02:39.870Z',
        updatedBy: '6087dc463e5c26006f114f2b',
        AccountId: accountId
      };
      var contactUpdated = {
        Account: {
          ProjectId: projectId,
          id: accountId,
        },
        AccountId: accountId,
        address: {street1: "Ashram Road,Ellisbridge", street2: "", city: "Ahmedabad", state: "GJ", country: "India"},
        firstName: "CHIRAG UPDATED",
        lastName: "SHAH UPDATED",
        previous_firstName: contact.firstName,
        previous_lastName: contact.lastName,
        id: "test-6087dc463e5c26006f114abc",
      };
      var contactId = "";
      const disposeContact = false;
      const route = `/projects/${projectId}/accounts/${accountId}/contacts`;

      it('Should Returns Status 401', (done) => {
        api
          .post(route)
          .send(contact)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400', (done) => {
        api
          .post(route)
          .set('authorization', agentToken)
          .send(null)
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });
    });
    /*
    describe("Check Suppression", function () {
      const project = availableProjects[0];
      const projectId = project.id;
      const route = `/projects/${projectId}/contacts/checkSuppression`;
      const contact = availableContacts[0];

      it("Should Returns Status 401", function (done) {
        api
          .post(route)
          .send({contact: contact})
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("Should Returns Status 400", function (done) {
        api
          .post(route)
          .send(null)
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("Should Returns Status 200", function (done) {
        api
          .post(route)
          .set("authorization", agentToken)
          .send({contact: contact})
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("Should Returns false if suppression not found", function (done) {
        api
          .post(route)
          .send({contact: contact})
          .set("authorization", agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result.isSuppression).to.be.false;
            done();
          });
      });
    });
    */
  });

  describe('Client Handler API', () => {
    describe('Fetch All Clients', () => {
      const client = availableClients[0];
      const route = `/client`;
      const clientProperties = Object.keys(client);

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns an NonEmpty Array of Client Objects', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const clients = response.body;
            const client = clients[0];
            expect(clients).to.be.an('array');
            expect(clients).to.have.lengthOf.above(0);
            expect(client).to.be.an('object');
            expect(client).to.include.all.keys(['id', 'name']);
            done();
          });
      });

      it('Should Return a Client Objects with all details', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .query({
            details: true,
          })
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const totalClient = response.body.totalCount;
            const clients = response.body.docs;
            const client = clients[0];

            expect(totalClient).to.be.an('number');
            expect(clients).to.be.an('array');
            expect(clients).to.have.lengthOf.above(0);
            expect(client).to.be.an('object');
            expect(client).to.include.all.keys(clientProperties);
            done();
          });
      });
    });

    describe('Fetch Client By Id', () => {
      const expectedClient = availableClients[0];
      const clientId = expectedClient.id;
      const route = `/client/${clientId}`;
      const clientProperties = Object.keys(expectedClient);

      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns an Object Of Client with all Require Property and expected values', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .then((response) => {
            const actualClient = response.body;
            expect(actualClient).to.be.an('object');
            expect(actualClient).to.include.all.keys(clientProperties);
            expect(actualClient).to.have.own.property(
              'name',
              expectedClient.name,
            );
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('Create Client', () => {
      const client = {
        name: 'test_post_client',
        pseudonym: 'tes_client',
      };
      const  client1 = {
        name: 'test_post_client',
        pseudonym: 'tes_client1',
      };
      const  client2 = {
        name: 'test_post_client1',
        pseudonym: 'tes_client',
      };
      const route = `/client`;

      it('Should Returns Status 401', (done) => {
        api
          .post(route)
          .send(client)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400', (done) => {
        api
          .post(route)
          .set('authorization', agentToken)
          .send(null)
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 201 for successful client creation', (done) => {
        api
          .post(route)
          .send({
            client,
          })
          .set('authorization', agentToken)
          .expect(201)
          .then((response) => {
            const actualClient = response.body;
            expect(actualClient).to.be.an('object');
            const clientId = actualClient.id;
            return Client.count({
              where: {
                id: clientId,
              },
            });
          })
          .then((count) => {
            // If count is 0; then project creation is failed
            // If count is greater then 1; then duplicate Id exists
            expect(count).to.equal(1);
            done();
          })
          .catch((err) => done(err));
      });

      it('Should Returns Status 201 and should not create new client on providing same client name', (done) => {
        api
          .post(route)
          .send({
            client: client1,
          })
          .set('authorization', agentToken)
          .expect(201)
          .then((response) => {
            const actualClient = response.body;
            expect(actualClient).to.be.an('object');
            expect(actualClient.code).to.equal("CLIENT_WITH_NAME_ALREADY_EXISTS");
            done();
          })
          .catch((err) => done(err));
      });

      it('Should Returns Status 201 and should not create new client on providing same pseudonym', (done) => {
        api
          .post(route)
          .send({
            client: client2,
          })
          .set('authorization', agentToken)
          .expect(201)
          .then((response) => {
            const actualClient = response.body;
            expect(actualClient).to.be.an('object');
            expect(actualClient.code).to.equal("CLIENT_WITH_PSEUDONYM_ALREADY_EXISTS");
            done();
          })
          .catch((err) => done(err));
      });

      after(async () => {
        await Client.destroy({
          where: {
            name: client.name,
          },
        });
      });
    });

    describe('Edit client', () => {
      const client = {
        createdAt: '2021-06-17T07:02:39.870Z',
        createdBy: '6087dc463e5c26006f114f2b',
        id: 'test-6087dc463e5c26006f114f2d',
        name: 'Nexsales Corp.',
        pseudonym: 'NS',
        updatedAt: '2021-06-17T07:02:39.870Z',
        updatedBy: '6087dc463e5c26006f114f2b',
      };
      const updatedClient = {
        name: 'Nexsales',
        pseudonym: 'NS',
      };
      const updatedClient1 = {
        name: 'OM INFO',
        pseudonym: 'NS',
      };
      const route = `/client/${client.id}`;

      it('Should Returns Status 401', (done) => {
        api
          .put(route)
          .send({
            client: updatedClient,
          })
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });
      it('Should Returns Status 400', (done) => {
        api
          .put(route)
          .set('authorization', agentToken)
          .send(null)
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });
      before((done) => {
        Client.create(client)
          .then((res) => {
            done();
          })
          .catch((err) => {
            console.log(err);
            done(err);
          });
      });
      it('Should Returns Status 200', (done) => {
        api
          .put(route)
          .send({
            client: updatedClient,
          })
          .set('authorization', agentToken)
          .expect(200)
          .then((response) =>
            Client.findOne({
              where: {
                id: client.id,
              },
            }),
          )
          .then((client) => {
            const actual = client.name;
            const expected = updatedClient.name;
            expect(actual).to.equal(expected);
            done();
          })
          .catch((err) => done(err));
      });
      
      it('Should Returns Status 200 and should not update client with name already exists', (done) => {
        api
          .put(route)
          .send({
            client: updatedClient1,
          })
          .set('authorization', agentToken)
          .expect(200)
          .then((response) => {
            const actualResponse = response.body;
            expect(actualResponse).to.be.an('object');
            expect(actualResponse.code).to.equal("CLIENT_WITH_NAME_ALREADY_EXISTS");
            done();
          })
          .catch((err) => done(err));
      });

      after((done) => {
        Client.destroy({
          where: {
            id: client.id,
          },
        })
          .then(() => done())
          .catch((err) => done(err));
      });
    });
  });

  describe('Auto Complete Routes', () => {
    describe('Job Level', () => {
      const route = `/jobLevel`;
      const queryParam = {
        param: 'dir',
      };
      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .query(queryParam)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 When param not sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            done();
          });
      });

      it('Should Returns Status 200 When param sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            done();
          });
      });
    });

    describe('Job Function', () => {
      const route = `/jobFunction`;

      it('Should Returns Status 401', (done) => {
        const queryParam = {
          param: 's',
        };

        api
          .get(route)
          .query(queryParam)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400 When Departments is not an array', (done) => {
        const queryParam = {
          param: 's',
          departments: 'Legal',
        };

        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 When Departments and param sent', (done) => {
        const queryParam = {
          param: 's',
          departments: JSON.stringify(['Legal']),
        };

        const expected = [
          'Acquisitions',
          'Contracts',
          'Corporate Secretary',
          'Ethics',
          'General Counsel',
          'Governmental Affairs & Regulatory Law',
          'Legal Counsel',
          'Legal Operations',
          'eDiscovery'
        ];

        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);

            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.eql(expected);
            done();
          });
      });

      it('Should Returns Status 200 When Empty Departments and param sent', (done) => {
        const queryParam = {
          param: '',
          industrys: [],
        };

        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);

            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf.above(0);
            done();
          });
      });
    });
    describe('Job Department', () => {
      const route = `/jobDepartment`;
      const queryParam = {
        param: 'priv',
      };
      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .query(queryParam)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 When param not sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            done();
          });
      });

      it('Should Returns Status 200 When param sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            done();
          });
      });
    });
    describe('Industry', () => {
      const route = `/industry`;
      const queryParam = {
        param: 'high',
      };
      const expected = ['Agriculture'];
      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .query(queryParam)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 When param not sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            done();
          });
      });

      it('Should Returns Status 200 When param sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            done();
          });
      });
    });
    describe('Employee Count', () => {
      const route = `/employeeCount`;
      const queryParam = {
        param: '0',
      };
      const expected = [
        '0-10',
        '10-50',
        '50-200',
        '200-500',
        '500-1000',
        '1000-5000',
        '5000-10K',
        '10K-5M',
      ];
      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .query(queryParam)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 When param not sent', (done) => {
        api
          .get(route)
          .query(null)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.deep.equal(expected);
            done();
          });
      });

      it('Should Returns Status 200 When param sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.deep.equal(expected);
            done();
          });
      });
    });
    describe('Segment Technology', () => {
      const route = `/segmentTechnology`;
      const queryParam = {
        param: 'salesforce',
      };
      const expected = [
        'Salesforce'
      ];
      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .query(queryParam)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 When param not sent', (done) => {
        api
          .get(route)
          .query(null)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf.above(0);
            done();
          });
      });

      it('Should Returns Status 200 When param sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.deep.equal(expected);
            done();
          });
      });
    });
    describe('Company Revenue', () => {
      const route = `/companyRevenue`;
      const queryParam = {
        param: '0',
      };
      const expected = [
        '0-1M',
        '1M-10M',
        '10M-50M',
        '50M-100M',
        '100M-250M',
        '250M-500M',
        '500M-1B',
        '1B-10B',
        '10B-1T',
      ];
      it('Should Returns Status 401', (done) => {
        api
          .get(route)
          .query(queryParam)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 When param not sent', (done) => {
        api
          .get(route)
          .query(null)
          .set('authorization', agentToken)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.deep.equal(expected);
            done();
          });
      });

      it('Should Returns Status 200 When param sent', (done) => {
        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);
            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.deep.equal(expected);
            done();
          });
      });
    });

    describe('Sub-Industry', () => {
      const route = `/subIndustry`;

      it('Should Returns Status 401', (done) => {
        const queryParam = {
          param: 's',
        };

        api
          .get(route)
          .query(queryParam)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 400 When Industry is not an array', (done) => {
        const queryParam = {
          param: 's',
          industrys: 'Sales',
        };

        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(400)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it('Should Returns Status 200 When Industry and param sent', (done) => {
        const queryParam = {
          param: 's',
          industrys: JSON.stringify(['Sales']),
        };

        const expected = [
          'Business Development',
          'Channel Sales / Partner Alliances',
          'Retail Sales',
          'Sales Enablement',
          'Sales Operations',
          'Sales Strategy',
          'Generic Sales',
          'Inside Sales',
        ];

        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);

            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.eql(expected);
            done();
          });
      });

      it('Should Returns Status 200 When Empty Industry and param sent', (done) => {
        const queryParam = {
          param: 's',
          industrys: [],
        };

        api
          .get(route)
          .set('authorization', agentToken)
          .query(queryParam)
          .expect(200)
          .end((err, response) => {
            if (err) return done(err);

            const result = response.body;
            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf.above(0);
            done();
          });
      });
    });
  });

  const firstFileId = uuid();
  const secondFileId = uuid();
  const firstJobId = uuid();
  const secondJobId = uuid();

  before(async () => {
    const project = availableProjects[0];
    const user = availableUsers[0];
    const filesData = [
      {
        id: firstFileId,
        name: 'abc.csv',
        type: 'Inclusion',
        format: 'csv',
        location: '/files/abc.scv',
        mapping: {
          first_name: 'First Name',
        },
        ProjectId: project.id,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        id: secondFileId,
        name: 'abc.csv',
        type: 'Inclusion',
        format: 'csv',
        location: '/files/abc.scv',
        mapping: {
          first_name: 'First Name',
        },
        ProjectId: project.id,
        createdBy: user.id,
        updatedBy: user.id,
      },
    ];
    const jobsData = [
      {
        id: firstJobId,
        status: 'Processing',
        operation_name: 'contactInclusion',
        operation_param: {},
        result_processed: null,
        result_imported: null,
        result_errored: null,
        result_errors: null,
        createdBy: user.id,
        updatedBy: user.id,
        FileId: firstFileId,
      },
      {
        id: secondJobId,
        status: 'Processing',
        operation_name: 'contactInclusion',
        operation_param: {},
        result_processed: null,
        result_imported: null,
        result_errored: null,
        result_errors: null,
        createdBy: user.id,
        updatedBy: user.id,
        FileId: secondFileId,
      },
    ];
    await File.bulkCreate(filesData);
    await Job.bulkCreate(jobsData);
    await TaskAllocationTemp.bulkCreate(availableTaskAllocationTemp);
  });

  describe('File Routes', () => {
    describe('Fetch All FILE Meta data', () => {
      const route = '/files';
      const project = availableProjects[0];
      const fileProperties = ['id', 'name', 'type', 'mapping'];

      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the mandatory value is not sent correctly', () => {
        it('Should Returns Status 400 When projectId not send', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });

      describe('When the mandatory value is sent correctly', () => {
        it('Should Returns Status 200 With List of File data', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .query({
              projectId: project.id,
            })
            .expect(200)
            .then((response) => {
              const files = response.body;
              const file = files[0];
              expect(files).to.be.an('array');
              expect(files).to.have.lengthOf.above(0);
              expect(file).to.include.all.keys(fileProperties);
              done();
            })
            .catch((error) => {
              done(error);
            });
        });
      });

      
    });

    // Commented This Test Bcoz. GCP bucket access is not setup for tests

    // --------------------------------------------------------------------------

    // describe('Upload', function () {
    //   const route    = '/files';
    //   const project  = availableProjects[0];
    //   const filePath = path.resolve(__dirname, 'testFile.csv');
    //   const fileData = {
    //     projectId    : project.id,
    //     fileType     : 'Inclusion',
    //     operationName: 'accountInclusion',
    //     mapping      : {
    //       first_name: 'First Name'
    //     }
    //   };
    //   var fileTestData;
    //   describe('When authentication failed', function () {
    //     it('Should Returns Status 401', function (done) {
    //       api
    //         .post(route)
    //         .send(fileData)
    //         .expect(401)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //   });
    //   describe('When the mandatory value is not sent correctly', function () {
    //     beforeEach(function () {
    //       fileTestData = Object.assign({}, fileData);
    //     });
    //     it('Should Returns Status 400 When projectId is Empty', function (done) {
    //       fileTestData.projectId = '';
    //       api
    //         .post(route)
    //         .set('authorization', agentToken)
    //         .send(fileTestData)
    //         .expect(400)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //     it('Should Returns Status 400 When fileType is Empty', function (done) {
    //       fileTestData.fileType = '';
    //       api
    //         .post(route)
    //         .set('authorization', agentToken)
    //         .send(fileTestData)
    //         .expect(400)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //     it('Should Returns Status 400 When operationName is Empty', function (done) {
    //       fileTestData.operationName = '';
    //       api
    //         .post(route)
    //         .set('authorization', agentToken)
    //         .send(fileTestData)
    //         .expect(400)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //     it('Should Returns Status 400 When mapping is Empty', function (done) {
    //       fileTestData.mapping = '';
    //       api
    //         .post(route)
    //         .set('authorization', agentToken)
    //         .send(fileTestData)
    //         .expect(400)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //     it('Should Returns Status 400 When file not Upload', function (done) {
    //       api
    //         .post(route)
    //         .set('authorization', agentToken)
    //         .send(fileTestData)
    //         .expect(400)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //     // ******** This test case is correct ***********
    //     // it('Should Returns Status 400 When fileType is invalid', function (done) {
    //     //   fileTestData.fileType = 'abc';
    //     //   api
    //     //     .post(route)
    //     //     .set('authorization', agentToken)
    //     //     .field('projectId', fileTestData.projectId)
    //     //     .field('operationName', fileTestData.operationName)
    //     //     .field('mapping', JSON.stringify(fileTestData.mapping))
    //     //     .field('fileType', fileTestData.fileType)
    //     //     .attach('file', filePath)
    //     //     .expect(400)
    //     //     .end(err => {
    //     //       if (err) return done(err);
    //     //       done();
    //     //     });
    //     // });
    //     // it('Should Returns Status 400 When operationName is invalid', function (done) {
    //     //   fileTestData.operationName = 'abc';
    //     //   api
    //     //     .post(route)
    //     //     .set('authorization', agentToken)
    //     //     .field('projectId', fileTestData.projectId)
    //     //     .field('operationName', fileTestData.operationName)
    //     //     .field('mapping', JSON.stringify(fileTestData.mapping))
    //     //     .field('fileType', fileTestData.fileType)
    //     //     .attach('file', filePath)
    //     //     .expect(400)
    //     //     .end(err => {
    //     //       if (err) return done(err);
    //     //       done();
    //     //     });
    //     // });
    //     // it('Should Returns Status 400 When jobStatus is invalid', function (done) {
    //     //   fileTestData.jobStatus = 'abc';
    //     //   api
    //     //     .post(route)
    //     //     .set('authorization', agentToken)
    //     //     .field('projectId', fileTestData.projectId)
    //     //     .field('operationName', fileTestData.operationName)
    //     //     .field('mapping', JSON.stringify(fileTestData.mapping))
    //     //     .field('fileType', fileTestData.fileType)
    //     //     .field('jobStatus', fileTestData.jobStatus)
    //     //     .attach('file', filePath)
    //     //     .expect(400)
    //     //     .end(err => {
    //     //       if (err) return done(err);
    //     //       done();
    //     //     });
    //     // });
    //     // ******** This test case is correct ***********
    //   });
    //   describe('When the mandatory value is sent correctly', function () {
    //     var uploadFileLocation, uploadFileId, jobId;
    //     var bucket;
    //     it('Should Returns Status 201 When file is support document', function (done) {
    //           bucket      = storage.bucket(process.env.GCLOUD_STORAGE_SUPPORT_FILE_BUCKET);
    //       var expectedKey = ['fileId', 'fileName'];

    //           fileData.fileType = 'Supporting Document';
    //       var uploadFilePath    = `files/${fileData.projectId}/${fileData.fileType}/`;

    //       api
    //         .post(route)
    //         .set('authorization', agentToken)
    //         .field('projectId', fileData.projectId)
    //         .field('operationName', fileData.operationName)
    //         .field('mapping', JSON.stringify(fileData.mapping))
    //         .field('fileType', fileData.fileType)
    //         .field('rowCount', 12)
    //         .attach('file', filePath)
    //         .expect(201)
    //         .then(response => {
    //           expect(response.body).to.include.all.keys(expectedKey);
    //           uploadFileId = response.body.fileId;
    //           return File.count({
    //             where: {
    //               id: response.body.fileId
    //             }
    //           });
    //         })
    //         .then(count => {
    //           expect(count).to.equal(1);
    //                 uploadFileLocation = `${uploadFilePath}${uploadFileId}.csv`;
    //           const file               = bucket.file(uploadFileLocation);
    //           return file.exists();
    //         })
    //         .then(exist => {
    //           if (exist[0]) {
    //             done();
    //           } else {
    //             done(new Error('file does not exist'));
    //           }
    //         })
    //         .catch(err => done(err));
    //     });
    //     it('Should Returns Status 201 When file is not support document', function (done) {
    //           bucket      = storage.bucket(process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET);
    //       var filePath    = path.resolve(__dirname, 'testFile.csv');
    //       var expectedKey = ['fileId', 'fileName', 'jobId'];

    //           fileData.fileType = 'Inclusion';
    //       var uploadFilePath    = `files/${fileData.projectId}/${fileData.fileType}/`;

    //       api
    //         .post(route)
    //         .set('authorization', agentToken)
    //         .field('projectId', fileData.projectId)
    //         .field('operationName', fileData.operationName)
    //         .field('mapping', JSON.stringify(fileData.mapping))
    //         .field('fileType', fileData.fileType)
    //         .field('rowCount', 12)
    //         .attach('file', filePath)
    //         .expect(201)
    //         .then(response => {
    //           expect(response.body).to.include.all.keys(expectedKey);
    //           jobId        = response.body.jobId;
    //           uploadFileId = response.body.fileId;
    //           return File.count({
    //             where: {
    //               id: response.body.fileId
    //             }
    //           });
    //         })
    //         .then(count => {
    //           expect(count).to.equal(1);
    //           return Job.count({
    //             where: {
    //               id: jobId
    //             }
    //           });
    //         })
    //         .then(count => {
    //           expect(count).to.equal(1);
    //                 uploadFileLocation = `${uploadFilePath}${uploadFileId}.csv`;
    //           const file               = bucket.file(uploadFileLocation);
    //           return file.exists();
    //         })
    //         .then(exist => {
    //           if (exist[0]) {
    //             done();
    //           } else {
    //             done(new Error('file does not exist'));
    //           }
    //         })
    //         .catch(err => done(err));
    //     });
    //     afterEach(async () => {
    //       await storage.bucket(bucket.name).file(uploadFileLocation).delete();
    //       if (jobId) {
    //         await Job.destroy({
    //           where: {
    //             id: jobId
    //           }
    //         });
    //       }
    //       await File.destroy({
    //         where: {
    //           id: uploadFileId
    //         }
    //       });
    //     });
    //   });
    // });

    // describe('Download / Get File Metadata', function () {
    //   const filePath = path.resolve(__dirname, 'testFile.csv');
    //   const fileName = path.basename(filePath);
    //   const project  = availableProjects[0];
    //   const user     = availableUsers[0];
    //   const fileData = {
    //     id      : uuid(),
    //     name    : fileName,
    //     type    : 'Inclusion',
    //     format  : 'csv',
    //     location: '',
    //     mapping : {
    //       first_name: 'First Name'
    //     },
    //     ProjectId: project.id,
    //     createdBy: user.id,
    //     updatedBy: user.id
    //   };
    //         fileData.location = `files/${fileData.ProjectId}/${fileData.type}/${fileData.id}.csv`;
    //   const queryParam        = {
    //     download: true
    //   };

    //   describe('When authentication failed', function () {
    //     it('Should Returns Status 401', function (done) {
    //       const fileId = 'abc';
    //       const route  = `/files/${fileId}`;
    //       api
    //         .get(route)
    //         .expect(401)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //   });
    //   describe('When the mandatory value is not sent correctly', function () {
    //     it('Should Returns Status 400 When fileId is Empty', function (done) {
    //       const fileId = '';
    //       const route  = `/files/${fileId}`;
    //       api
    //         .get(route)
    //         .set('authorization', agentToken)
    //         .expect(400)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //     it('Should Returns Status 404 When we try to get the metadata of the file, the data is not found', function (done) {
    //       const fileId = 'abc';
    //       const route  = `/files/${fileId}`;
    //       api
    //         .get(route)
    //         .set('authorization', agentToken)
    //         .expect(404)
    //         .end(err => {
    //           if (err) return done(err);
    //           done();
    //         });
    //     });
    //     // ******** This test case is correct ***********
    //     // it('Should Returns Status 404 When we try to download the file, the file is not found', function (done) {
    //     //   const fileId = 'abc';
    //     //   const route    = `/files/${fileId}`;
    //     //   api
    //     //     .get(route)
    //     //     .set('authorization', agentToken)
    //     //     .query(queryParam)
    //     //     .expect(404)
    //     //     .end(err => {
    //     //       if (err) return done(err);
    //     //       done();
    //     //     });
    //     // });
    //     // ******** This test case is correct ***********
    //   });
    //   describe('When the mandatory value is sent correctly', function () {
    //     before(async () => {
    //       await storage.bucket(bucket.name).upload(filePath, {
    //         destination: fileData.location,
    //       });
    //       await File.create({
    //         id       : fileData.id,
    //         name     : fileData.name,
    //         type     : fileData.type,
    //         format   : fileData.format,
    //         location : fileData.location,
    //         mapping  : fileData.mapping,
    //         ProjectId: fileData.ProjectId,
    //         createdBy: fileData.createdBy,
    //         updatedBy: fileData.updatedBy,
    //       });
    //     });
    //     it('Should Returns Status 200 With file metadata', function (done) {
    //       const route = `/files/${fileData.id}`;
    //       api
    //         .get(route)
    //         .set('authorization', agentToken)
    //         .expect(200)
    //         .then(response => {
    //           let actualFile   = response.body;
    //           let expectedFile = {
    //             id       : fileData.id,
    //             name     : fileData.name,
    //             type     : fileData.type,
    //             mapping  : fileData.mapping,
    //             ProjectId: fileData.ProjectId
    //           };
    //           expect(JSON.stringify(actualFile)).to.be.equal(JSON.stringify(expectedFile));
    //           done();
    //         })
    //         .catch(error => {
    //           done(error);
    //         });
    //     });
    //     it('Should Returns Status 200 With file download', function (done) {
    //       const route = `/files/${fileData.id}`;
    //       api
    //         .get(route)
    //         .set('authorization', agentToken)
    //         .query(queryParam)
    //         .expect(200)
    //         .then(response => {
    //           assert.ok(Buffer.isBuffer(response.body));
    //           done();
    //         })
    //         .catch(error => {
    //           done(error);
    //         });
    //     });
    //     after(async () => {
    //       await storage.bucket(bucket.name).file(`${fileData.location}`).delete();

    //       await File.destroy({
    //         where: {
    //           id: fileData.id
    //         }
    //       });
    //     });
    //   });
    // });

    // --------------------------------------------------------------------------
  });

  describe('Job Routes', () => {
    describe('Fetch All Job', () => {
      const project = availableProjects[0];
      const route = `/project/${project.id}/jobs`;
      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the mandatory value is sent correctly', () => {
        it('Should Returns Status 200 With Job list', (done) => {
          const expectedJobProperties = [
            'jobId',
            'status',
            'operation_name',
            'result_processed',
            'result_imported',
            'result_errored',
            'createdAt',
            'updatedAt',
            'row_count',
            'chunks',
            'fileName',
            'fileId',
          ];
          api
            .get(route)
            .set('authorization', agentToken)
            .expect(200)
            .then((response) => {
              const totalJob = response.body.totalCount;
              const jobs = response.body.docs;
              const job = jobs[0];
              expect(totalJob).to.be.an('number');
              expect(jobs).to.be.an('array');
              expect(jobs).to.have.lengthOf.above(0);
              expect(job).to.be.an('object');
              expect(job).to.include.all.keys(expectedJobProperties);
              done();
            })
            .catch((error) => {
              done(error);
            });
        });
      });
    });
    describe('Fetch Job By Id', () => {
      const project = availableProjects[0];
      const route = `/project/${project.id}/jobs/${firstJobId}`;
      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the mandatory value is sent correctly', () => {
        it('Should Returns Status 200 With Job', (done) => {
          const expectedJobProperties = [
            'jobId',
            'status',
            'operation_name',
            'result_processed',
            'result_imported',
            'result_errored',
            'createdAt',
            'updatedAt',
            'row_count',
            'chunks',
            'fileName',
            'fileId',
          ];
          api
            .get(route)
            .set('authorization', agentToken)
            .expect(200)
            .then((response) => {
              const job = response.body;
              expect(job).to.be.an('object');
              expect(job).to.include.all.keys(expectedJobProperties);
              done();
            })
            .catch((error) => {
              done(error);
            });
        });
      });
    });
    describe('Fetch All Errors of a Job', () => {
      const project = availableProjects[0];
      const route = `/project/${project.id}/jobs/06/jobErrors`;
      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the mandatory value is sent correctly', () => {
        it('Should Returns Status 200 With Job Errors list', (done) => {
          const expectedJobProperties = [
            'id',
            'error_desc',
            'row_content',
            'error_count',
            'type',
            'row_index',
            'chunk_index',
            'createdAt',
            'updatedAt',
            'JobId',
          ];
          api
            .get(route)
            .set('authorization', agentToken)
            .expect(200)
            .then((response) => {
              const jobErrors = response.body;
              const jobError = jobErrors[0];
              expect(jobErrors).to.be.an('array');
              expect(jobErrors).to.have.lengthOf.above(0);
              expect(jobError).to.be.an('object');
              expect(jobError).to.include.all.keys(expectedJobProperties);
              done();
            })
            .catch((error) => {
              done(error);
            });
        });
      });
    });
  });

  describe('SicCode', () => {
    const route = `/sicCode`;
    const queryParam = {
      param: '01',
    };
    it('Should Returns Status 401', (done) => {
      api
        .get(route)
        .query(queryParam)
        .expect(401)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Returns Status 200 When param not sent', (done) => {
      api
        .get(route)
        .set('authorization', agentToken)
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          const result = response.body;
          expect(result).to.be.an('array');
          done();
        });
    });

    it('Should Returns Status 200 When param sent', (done) => {
      api
        .get(route)
        .set('authorization', agentToken)
        .query(queryParam)
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          const result = response.body;
          
          expect(result).to.be.an('array');
          done();
        });
    });
  });

  describe('NaicsCode', () => {
    const route = `/naicsCode`;
    const queryParam = {
      param: '11',
    };
    it('Should Returns Status 401', (done) => {
      api
        .get(route)
        .query(queryParam)
        .expect(401)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Returns Status 200 When param not sent', (done) => {
      api
        .get(route)
        .set('authorization', agentToken)
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          const result = response.body;
          expect(result).to.be.an('array');
          done();
        });
    });

    it('Should Returns Status 200 When param sent', (done) => {
      api
        .get(route)
        .set('authorization', agentToken)
        .query(queryParam)
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          const result = response.body;
          expect(result).to.be.an('array');
          done();
        });
    });
  });

  describe('TaskAllocationTemp API', () => {
    describe('Fetch All Records TaskAllocationTemps', () => {
      const taskAllocationData = availableTaskAllocationTemp[0];
      const projectId = taskAllocationData.projectId;
      const jobId = taskAllocationData.jobId;
      const route = `/projects/${projectId}/jobs/${jobId}/taskAllocationTemps`;
      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
            .get(route)
            .expect(401)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the User does not have access', () => {
        it('Should Returns Status 403', (done) => {
          api
            .get(route)
            .set('authorization', agentToken)
            .expect(403)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the mandatory value is Given', () => {
        it('Should Returns Status 200 With list of taskAllocationTemp Records', (done) => {
          api
            .get(route)
            .set('authorization', managerToken)
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              const result = response.body;
              expect(result).to.be.an('object');
              expect(result.rows).to.be.an('array');
              done();
            });
        });
      });
    });

    describe('Delete TaskAllocationTemp Record By Id', () => {
      const taskAllocationData = availableTaskAllocationTemp[0];
      const projectId = taskAllocationData.projectId;
      const jobId = taskAllocationData.jobId;
      const taskAllocationTempId = taskAllocationData.id;
      const route = `/projects/${projectId}/jobs/${jobId}/taskAllocationTemps/${taskAllocationTempId}`;
      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
          .delete(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
        });
      });
      describe('When the User does not have access', () => {
        it('Should Returns Status 403', (done) => {
          api
            .delete(route)
            .set('authorization', agentToken)
            .expect(403)
            .end((err) => {
              if (err) return done(err);
              done();
            });
        });
      });
      describe('When the mandatory value is Given', () => {
        it('Should Returns Status 200', (done) => {
          api
            .delete(route)
            .set('authorization', managerToken)
            .expect(200)
            .end((err, response) => {
              if (err) return done(err);
              done();
            });
        });
      });
    });


    describe('Update TaskAllocationTemp Record By Id', () => {
      const taskAllocationData = availableTaskAllocationTemp[1];
      const projectId = taskAllocationData.projectId;
      const jobId = taskAllocationData.jobId;
      const taskAllocationTempId = taskAllocationData.id;
      const route = `/projects/${projectId}/jobs/${jobId}/taskAllocationTemps/${taskAllocationTempId}`;
      describe('When authentication failed', () => {
        it('Should Returns Status 401', (done) => {
          api
          .put(route)
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            done();
          });
        });
      });
      describe('When the mandatory value is Missing', () => {
        context('Empty  Request Body', () => {
          it('Should Returns Status 400', (done) => {
            api
            .put(route)
            .set('authorization', managerToken)
            .send({})
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
          });
        });
        context('Missing agentId in Request Body', () => {
          it('Should Returns Status 400', (done) => {
            api
            .put(route)
            .set('authorization', managerToken)
            .send({ 
              agentName: "agent1" 
            })
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
          });
        });
        context('Missing agentName in Request Body', () => {
          it('Should Returns Status 400', (done) => {
            api
            .put(route)
            .set('authorization', managerToken)
            .send({ 
              agentId: "auth0|abc9856s-54asd6fs" 
            })
            .expect(400)
            .end((err) => {
              if (err) return done(err);
              done();
            });
          });
        });
      });
      describe('When the mandatory value is Given', () => {
        it('Should Returns Status 200 And update a single taskAllocationTemp Record', (done) => {
          api
          .put(route)
          .set('authorization', managerToken)
          .send({ 
            agentId: "auth0|abc9856s-54asd6fs",
            agentName: "agent1"
          })
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            done();
          });
        });
      });
    });
  
  });

  after(async () => {
    await Job.destroy({
      where: {
        [Op.or]: [
          {
            id: firstJobId,
          },
          {
            id: secondJobId,
          },
        ],
      },
    });
    await File.destroy({
      where: {
        [Op.or]: [
          {
            id: firstFileId,
          },
          {
            id: secondFileId,
          },
        ],
      },
    });

    let taskAllocationTempIds = availableTaskAllocationTemp.map(({id}) => id);
    await TaskAllocationTemp.destroy({
      where: {
        id: {
          [Op.in] : taskAllocationTempIds
        }
      }
    });
  });
});
