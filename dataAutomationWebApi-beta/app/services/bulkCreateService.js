/* eslint-disable no-await-in-loop */

/**
 * step 1: Edit The NO_OF_ACCOUNT variable value
 * step 2: Edit The noOfContactPerAccount variable value
 * step 3: run npm install
 * step 4: Run Script `DB_NAME=local DB_USER=postgres node scripts/upload_data_in_local_db.js`
 * */

const {
  Account,
  Contact,
  Task,
  TaskLink,
} = require('@nexsalesdev/dataautomation-datamodel');
const { uuid } = require('uuidv4');
const casual = require('casual');
const _ = require('lodash');

const POSITIVE_DISPOSITION = ['Contact Built'];
const NEGATIVE_DISPOSITION = [
  'Already in CRM - Suppression',
  'Contact Found: Email Bad',
  'Acquired/Merged/Subsidiary/Bankrupt/Shut Down',
  'Required Title Not Found',
  'Outside Geography (Country)',
  'Staff Level Title Available',
  'Manager Level Title Available',
  'Generic Title Available',
  'Website Not Found',
];
const RESEARCH_STATUS = [
  'QA',
  'QF',
  'Q',
  'Dup',
  'QA',
  'QF',
  'Q',
  'NQ',
  'QA',
  'QF',
  'Q',
  'NF',
  'QA',
  'QF',
  'Q',
  'D',
  'QA',
  'QF',
  'Q',
];
const RESEARCH_STATUS_DISPOSITION_MAPPING = {
  QA: 'Contact Built',
  QF: 'Contact Built',
  Q: 'Contact Built',
  Dup: 'Duplicate Contact',
  NQ: 'Incorrect Contact',
  NF: 'Incorrect Contact',
  D: 'Incorrect Contact',
};
const TASK_STATUS = [
  'Pending',
  'Completed',
  'Completed',
  'Completed',
  'Completed',
  'Completed',
  'Completed',
  'Completed',
  'Completed',
  'Completed',
];

const COMPLIANCE_STATUS_COMPLIANT = 'Compliant';
const COMPLIANCE_STATUS_NON_COMPLIANT = [
  'Duplicate Contact',
  'Account Suppression',
  'Contact Suppression',
  'Bounce Email',
  'Title',
  'Missing Info',
  'Excess Contact',
  'Location',
  'Employee Range',
  'Revenue Range',
  'Industry Error',
  'QC Delete',
  'Other Error',
];
const CONTACT_BULK_CREATE = 50;

const settingsConfig = require('../config/settings/settings-config');

function BulkCreateDummyData() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function createBulkTasks(_params) {
  const self = this;
  const params = _.cloneDeep(_params);
  let contactCounter = 0;
  let accountCounter = 0;

  params.accountCount = params.accountCount ? params.accountCount : 1000;
  params.contactCount = params.contactCount ? params.contactCount : 100;
  params.projectId = params.projectId ? params.projectId : '01';

  self.logger.info(
    `[BULK_CREATE]: Generating ${params.accountCount} Accounts, ${params.contactCount} Contacts per Account, for Project: ${params.projectId}`,
  );
  const NO_OF_ACCOUNT = params.accountCount;
  let noOfContactPerAccount = params.contactCount;
  const PROJECT_ID = params.projectId;

  for (let index = 0; index < NO_OF_ACCOUNT; index += 1) {
    const taskStatus = TASK_STATUS[(index + 1) % 10];
    noOfContactPerAccount = params.contactCount || 100;

    let disposition = POSITIVE_DISPOSITION[0];

    if ((index + 1) % 27 === 0) {
      disposition =
        NEGATIVE_DISPOSITION[
          Math.floor(Math.random() * NEGATIVE_DISPOSITION.length)
        ];
      noOfContactPerAccount = 14;
    }
    if (taskStatus === 'Pending') {
      disposition = '';
    }

    const account = {
      id: uuid(),
      name: casual.company_name,
      zoomInfoName: 'zoomInfo',
      domain: `${index}${casual.domain}`,
      revenue_M_B_K: '10K-20K',
      employeeSizeLI: '40-100',
      employeeSizeZ_plus: '40-100',
      employeeSizeFinalBucket: '40-100',
      employeeSize_others: '40-100',
      employeeRangeLI: '40-100',
      disposition,
      comments: casual.words(7),
      description: casual.description,
      addressHQ: {
        address1HQ: casual.address1,
        address2HQ: casual.address2,
        cityHQ: casual.city,
        stateHQ: casual.state,
        countryHQ: casual.country,
        zipCodeHQ: casual.zip(),
      },
      revenue: '[10000,20000]',
      employeeSize: '[30,50]',
      upperRevenue: 20000,
      lowerRevenue: 10000,
      upperEmployeeSize: 50,
      lowerEmployeeSize: 30,
      createdBy: 'auth0|6135a6be81c014006ab78c7f',
      updatedBy: 'auth0|61110707c261f8006916a368',
      createdAt: new Date(),
      updatedAt: new Date(),
      ProjectId: PROJECT_ID,
      website: casual.url,
      segment_technology: casual.array_of_words(4),
      source: casual.url,
      phoneHQ: casual.phone,
      email: casual.email,
      label: 'inclusion',
    };
    const task = {
      id: uuid(),
      description: casual.description,
      dueDate: new Date(),
      status: taskStatus,
      disposition,
      priority: 'Standard',
      completedDate: new Date(),
      createdBy: 'auth0|6135a6be81c014006ab78c7f',
      updatedBy: 'auth0|61110707c261f8006916a368',
      updatedAt: new Date(),
      createdAt: new Date(),
      ProjectId: PROJECT_ID,
      UserId: 'auth0|61110707c261f8006916a368',
      TaskTypeId: '01',
    };
    const accountTaskLink = {
      TaskId: task.id,
      ObjectId: account.id,
      objectType: 'account',
      disposition: account.disposition,
      comments: account.comments,
      linkType: 'input',
      createdBy: 'auth0|6135a6be81c014006ab78c7f',
      updatedBy: 'auth0|61110707c261f8006916a368',
      UserId: 'auth0|61110707c261f8006916a368',
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    await Account.create(account);
    await Task.create(task);
    await TaskLink.create(accountTaskLink);
    accountCounter += 1;
    self.logger.info(
      `[BULK_CREATE]: ${index}-Account Created out of ${params.accountCount} Accounts`,
    );

    let contactList = [];
    let contactTaskLinkList = [];
    for (
      let contactIndex = 0;
      contactIndex < noOfContactPerAccount;
      contactIndex += 1
    ) {
      const researchStatus =
        RESEARCH_STATUS[Math.floor(Math.random() * RESEARCH_STATUS.length)];
      const contactDisposition =
        RESEARCH_STATUS_DISPOSITION_MAPPING[researchStatus];

      let stage = 'Review';
      let complianceStatus = '';
      if (researchStatus === 'Q') {
        complianceStatus =
          COMPLIANCE_STATUS_NON_COMPLIANT[
            Math.floor(Math.random() * COMPLIANCE_STATUS_NON_COMPLIANT.length)
          ];
        stage = 'Bad';
      } else if (researchStatus === 'QA' || researchStatus === 'QF') {
        complianceStatus = COMPLIANCE_STATUS_COMPLIANT;
        stage = 'Ready';
      }

      const contact = {
        id: uuid(),
        researchStatus,
        complianceStatus,
        prefix: casual.name_prefix,
        firstName: casual.first_name,
        lastName: casual.last_name,
        middleName: casual.first_name,
        address: {
          street1: casual.address1,
          street2: casual.address2,
          city: casual.city,
          state: casual.state,
          country: casual.country,
          zipCode: casual.zip(),
        },
        email: casual.email,
        zbDateAndTime: new Date(),
        phone: casual.phone,
        directPhone: casual.phone,
        jobTitle: 'Solution Operations Manager',
        jobLevel: 'Manager',
        jobDepartment: 'Operations',
        stage,
        createdBy: 'auth0|6135a6be81c014006ab78c7f',
        updatedBy: 'auth0|61110707c261f8006916a368',
        createdAt: new Date(),
        updatedAt: new Date(),
        AccountId: account.id,
        comments: casual.words(4),
        source: casual.url,
        screenshot: casual.url,
        disposition: contactDisposition,
        zb: 'valid',
        gmailStatus: 'valid',
        mailTesterStatus: 'passed',
        label: 'inclusion',
      };
      const contactTaskLink = {
        TaskId: task.id,
        ObjectId: contact.id,
        objectType: 'contact',
        disposition: contact.disposition,
        comments: contact.comments,
        linkType: 'output',
        createdBy: 'auth0|6135a6be81c014006ab78c7f',
        updatedBy: 'auth0|61110707c261f8006916a368',
        UserId: 'auth0|61110707c261f8006916a368',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      contactList.push(contact);
      contactTaskLinkList.push(contactTaskLink);

      if (contactCounter % CONTACT_BULK_CREATE === 0) {
        await Contact.bulkCreate(contactList);
        await TaskLink.bulkCreate(contactTaskLinkList);
        contactList = [];
        contactTaskLinkList = [];
      }
      contactCounter += 1;
    }
    if (contactList.length) {
      await Contact.bulkCreate(contactList);
      await TaskLink.bulkCreate(contactTaskLinkList);
      contactList = [];
      contactTaskLinkList = [];
    }
  }
  self.logger.info('[BULK_CREATE]: ***************************');
  self.logger.info('[BULK_CREATE]: Finished generating data');
  self.logger.info('[BULK_CREATE]: ***************************');

  self.logger.info(
    `[BULK_CREATE]: Finished generating data: ${accountCounter}, Contacts per Account ${contactCounter}, for Project: ${params.projectId}`,
  );
}

BulkCreateDummyData.prototype = {
  createBulkTasks,
};

module.exports = BulkCreateDummyData;
