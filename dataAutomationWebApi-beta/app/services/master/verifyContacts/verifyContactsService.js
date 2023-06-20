/* eslint-disable global-require */
const _ = require('lodash');
const {
  Contact,
  Account,
  Location,
  VerifyContact,
  File,
  Job,
  Sequelize,
} = require('@nexsalesdev/master-data-model');

const { Op } = Sequelize;
const { CloudTasksClient } = require('@google-cloud/tasks');
const {
  FILE_TYPES,
  ASYNC_DOWNLOAD_FILE_OPERATIONS,
  JOB_STATUS,
  LOCATION_TYPES,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const { serializeError } = require('serialize-error');

const dedupeKeysGenerator = require('@nexsalesdev/da-dedupekeys-generator');

const taskQueueClient = new CloudTasksClient();

const {
  ZB_STATUS,
  DOMAIN_STATUS,
  EMAIL_TAGS,
  CONTACT_DISPOSITION,
  JOB_LEVEL,
  JOB_DEPARTMENT,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const { phone } = require('phone');
const countryISO = require('@nexsalesdev/master-data-model/lib/dataFiles/countryISO.json');
const { getTokens } = require('@nexsalesdev/da-dedupekeys-generator');
const jobLevelMapping = require('@nexsalesdev/master-data-model/lib/dataFiles/jobLevel.json');
const jobDepartmentMapping = require('@nexsalesdev/master-data-model/lib/dataFiles/jobDepartment.json');
const settingsConfig = require('../../../config/settings/settings-config');

// goldMine :: verifyContact
const CONTACT_GOLDMINE_VERIFY_MASTER_MAPPING = {
  firstName: 'firstName',
  middleName: 'middleName',
  lastName: 'lastName',
  jobTitle: 'jobTitle',
  jobLevel: 'jobLevel',
  jobDepartment: 'jobDepartment',
  email: 'workEmail',
  zb: 'zbStatus',
  zbDateAndTime: 'zbDate',
  genericEmail: 'personalEmail',
  emailTags: 'emailTags',
  emailOpen: 'emailOpen',
  emailClick: 'emailClick',
  directPhone: 'directDial',
  mobileNumber1: 'mobileNumber1',
  mobileNumber2: 'mobileNumber2',
  homeNumber: 'homeNumber',
  linkedInUrl: 'linkedinHandle',
  facebookHandle: 'facebookHandle',
  twitterHandle: 'twitterHandle',
  clientNameHistory: 'clientNameHistory',
  disposition: 'disposition',
  homeAddressStreet1: 'homeAddressStreet1',
  homeAddressStreet2: 'homeAddressStreet2',
  homeAddressCity: 'homeAddressCity',
  homeAddressState: 'homeAddressState',
  homeAddressZipCode: 'homeAddressZipCode',
  homeAddressCountry: 'homeAddressCountry',
  source: 'otherSourceLink',
};

function VerifyContactCRUDService() {
  const config = settingsConfig.settings || {};
  this.config = config;
  this.logger = settingsConfig.logger || console;

  const SortHandler = require('@nexsalesdev/master-data-model/lib/services/sortHandler');
  const Sanitizer = require('../../commonServices/sanitizer');
  const ContactCRUDService = require('../contacts/contactsService');

  this.sanitizer = new Sanitizer();
  this.sortHandler = new SortHandler();
  this.contactCRUDService = new ContactCRUDService();
}

async function getAllContact(inputs) {
  const { limit, offset } = inputs;

  const result = await VerifyContact.findAndCountAll({
    attributes: [
      'id',
      'firstName',
      'middleName',
      'lastName',
      'jobTitle',
      'jobLevel',
      'jobDepartment',
      'personalEmail',
      'directDial',
      'disposition',
      'accountDomain',
      'location',
      'createdUserEmail',
    ],
    order: [['firstName', 'ASC']],
    offset,
    limit,
    raw: true,
    subQuery: false,
  });

  const contacts = {};
  contacts.totalCount = result.count;
  contacts.docs = result.rows;

  contacts.docs = result.rows.map((_contact) => {
    let contact = _contact;

    contact.name = _.join(
      [contact.firstName, contact.middleName, contact.lastName],
      ' ',
    ).trim();

    contact.name = contact.name.replaceAll('null', '');

    contact = _.omit(contact, ['firstName', 'middleName', 'lastName']);

    return contact;
  });

  return contacts;
}

async function downloadAllContact(_inputs) {
  const inputs = _.cloneDeep(_inputs);
  const fileData = {
    fileId: inputs.fileId,
    fileName: inputs.userProvidedFileName,
    jobId: inputs.jobId,
    createdBy: inputs.userEmail,
    updatedBy: inputs.userEmail,
  };

  await this.addFile(fileData);
  // Async Download Procedure
  return this.enqueue(fileData.jobId);
}

async function enqueue(jobId) {
  // TODO :: Correct Service Endpoint URl
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: this.config.MASTER_FILE_DOWNLOAD_ENDPOINT,
    },
  };

  const payload = {
    jobId,
  };

  if (payload) {
    task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );
    task.httpRequest.headers = {
      'Content-Type': 'application/json',
    };
  }

  task.httpRequest.oidcToken = {
    serviceContactEmail: this.config.SERVICE_ACCOUNT_EMAIL,
  };

  // Send create task request.
  this.logger.info(`Sending task: ${JSON.stringify(task)}`);

  const request = {
    parent: this.config.TASK_QUEUE_PATH,
    task,
  };
  try {
    const [response] = await taskQueueClient.createTask(request);
    this.logger.info(`Created task ${response.name}`);
    return;
  } catch (error) {
    this.logger.error('>>>>>>>> :/ Could Not Create Task');
    this.logger.error(error);
    throw error;
  }
}

async function addFile(fileData) {
  const { fileId, createdBy, jobId } = fileData;
  const fileName = `${fileData.fileName}_${Date.now()}.csv`;
  const fileType = FILE_TYPES.EXPORT;
  const format = '.csv';
  const mapping = {};
  const jobStatus = JOB_STATUS.QUEUED;
  const operationName =
    ASYNC_DOWNLOAD_FILE_OPERATIONS.ASYNC_VERIFY_CONTACT_EXPORT;

  const operationParam = {};
  const resultProcessed = 0;
  const resultImported = 0;
  const resultErrored = 0;
  const rowCount = 0;
  const location = `files/master/${fileType}/${fileName}`;

  return File.create(
    {
      id: fileId,
      name: fileName,
      type: fileType,
      format,
      location,
      mapping,
      createdBy,
      Job: {
        id: jobId,
        status: jobStatus,
        chunks: fileData.chunks,
        operationName,
        operationParam,
        processed: resultProcessed,
        imported: resultImported,
        errored: resultErrored,
        createdBy,
        rowCount,
        FileId: fileId,
      },
    },
    {
      include: [
        {
          model: Job,
        },
      ],
    },
  );
}

async function updateJobStatus(jobId, status) {
  let result;
  try {
    result = await Job.update(
      {
        status,
      },
      {
        where: {
          id: jobId,
        },
      },
    );
  } catch (error) {
    console.log(
      `Could not update a Job Status: {JobId: ${jobId},Error: ${error}}`,
    );
  }
  return result;
}

function convertGoldMineToMasterContact(_contact) {
  const goldMineContact = _.cloneDeep(_contact);

  const processedContact = {};
  const goldMineContactKeys = Object.keys(goldMineContact);

  goldMineContactKeys.forEach((key) => {
    if (CONTACT_GOLDMINE_VERIFY_MASTER_MAPPING[key]) {
      processedContact[CONTACT_GOLDMINE_VERIFY_MASTER_MAPPING[key]] =
        goldMineContact[key];
    }
  });

  return processedContact;
}

async function getMasterContact(dedupeKeys, accountDomain) {
  const whereClause = {};
  if (dedupeKeys.workEmail) whereClause.workEmail = dedupeKeys.workEmail;
  if (dedupeKeys.fnLnEmailDomainDedupeKey)
    whereClause.fnLnEmailDomainDedupeKey = dedupeKeys.fnLnEmailDomainDedupeKey;
  if (dedupeKeys.fnLnScrubbedCompanyDomainDedupeKey)
    whereClause.fnLnScrubbedCompanyDomainDedupeKey =
      dedupeKeys.fnLnScrubbedCompanyDomainDedupeKey;
  if (dedupeKeys.linkedinHandle)
    whereClause.linkedinHandle = dedupeKeys.linkedinHandle;

  if (_.isEmpty(whereClause)) {
    return null;
  }

  const contact = await Contact.findOne({
    where: {
      [Op.or]: whereClause,
      AccountDomain: accountDomain,
    },
    raw: true,
  });

  return contact;
}

async function fetchMasterAccountBasedOnDomain(domain) {
  const account = Account.findOne({
    where: {
      domain,
    },
    include: [
      {
        model: Location,
        where: {
          AccountDomain: domain,
          type: LOCATION_TYPES.HEAD_OFFICE,
        },
      },
    ],
    raw: true,
    subQuery: false,
  });

  return account;
}

async function updateMasterContactByEmail(_contact, workEmail) {
  let contact = _.cloneDeep(_contact);
  contact.isVerified = true;
  contact = _.omit(contact, ['createdBy', 'createdAt']);

  await Contact.update(contact, {
    where: {
      workEmail,
    },
  });
}

async function createMasterContact(_masterContact) {
  const masterContact = _.cloneDeep(_masterContact);
  masterContact.isVerified = true;

  const result = await Contact.create(masterContact);
  return result;
}

async function getVerifyContact(_dataForFindContact, logger) {
  const dataForFindContact = _.cloneDeep(_dataForFindContact) || {};

  if (
    _.isEmpty(dataForFindContact) ||
    !_.isObject(dataForFindContact) ||
    Array.isArray(dataForFindContact)
  ) {
    const errMsg = `Passing data or dataType is incorrect : {dataForFindContact: ${JSON.stringify(
      dataForFindContact,
    )}, dataType: ${typeof dataForFindContact}}`;
    logger.error(`[GET_VERIFY_CONTACT]: ERROR : ${errMsg}`);
    throw new Error(errMsg);
  }

  const where = {};
  const {
    workEmail,
    fnLnEmailDomainDedupeKey,
    fnLnScrubbedCompanyDomainDedupeKey,
    linkedinHandle,
  } = dataForFindContact;
  if (!_.isEmpty(workEmail) && _.isString(workEmail))
    where.workEmail = workEmail;
  if (
    !_.isEmpty(fnLnEmailDomainDedupeKey) &&
    _.isString(fnLnEmailDomainDedupeKey)
  )
    where.fnLnEmailDomainDedupeKey = fnLnEmailDomainDedupeKey;
  if (
    !_.isEmpty(fnLnScrubbedCompanyDomainDedupeKey) &&
    _.isString(fnLnScrubbedCompanyDomainDedupeKey)
  )
    where.fnLnScrubbedCompanyDomainDedupeKey =
      fnLnScrubbedCompanyDomainDedupeKey;
  if (!_.isEmpty(linkedinHandle) && _.isString(linkedinHandle))
    where.linkedinHandle = linkedinHandle;

  if (_.isEmpty(where)) {
    const errMsg = `Could Not Find Verify Contact Because workEmail,fnLnEmailDomainDedupeKey,fnLnScrubbedCompanyDomainDedupeKey and linkedinHandle, is Invalid or not a String {dataForFindContact: ${JSON.stringify(
      dataForFindContact,
    )}}`;
    logger.error(`[GET_VERIFY_CONTACT]: ERROR : ${errMsg}`);
    throw new Error(errMsg);
  }

  const verifyContact = await VerifyContact.findOne({
    where: { [Op.or]: where },
    raw: true,
  });

  if (verifyContact === null) {
    logger.info(
      `[GET_VERIFY_CONTACT]:  Could not Find Verify Contact {dataForFindContact: ${JSON.stringify(
        dataForFindContact,
      )}}`,
    );
    return verifyContact;
  }

  logger.info(
    `[GET_VERIFY_CONTACT]: Find Verify Contact from DB {Verify Contact: ${JSON.stringify(
      verifyContact,
    )}}`,
  );
  return verifyContact;
}

async function createVerifyContact(verifyContact, logger) {
  const contact = await getVerifyContact(
    {
      workEmail: verifyContact.workEmail,
      fnLnEmailDomainDedupeKey: verifyContact.fnLnEmailDomainDedupeKey,
      fnLnScrubbedCompanyDomainDedupeKey:
        verifyContact.fnLnScrubbedCompanyDomainDedupeKey,
      linkedinHandle: verifyContact.linkedinHandle,
    },
    logger,
  );

  if (contact) {
    await VerifyContact.update(verifyContact, {
      where: {
        id: contact.id,
      },
    });
    return;
  }
  await VerifyContact.create(verifyContact);
}

function checkMandatoryColumns(
  _data,
  _mandatoryColumns,
  checkIfKeyExist = false,
) {
  const data = _.cloneDeep(_data) || {};
  const mandatoryColumns = _.cloneDeep(_mandatoryColumns) || [];

  if (_.isEmpty(data) || !_.isObject(data) || Array.isArray(data))
    throw new Error(
      `Passing data or dataType is incorrect : {data: ${data}, dataType: ${typeof data}}`,
    );
  if (_.isEmpty(mandatoryColumns) || !Array.isArray(mandatoryColumns))
    throw new Error(
      `Passing mandatoryColumns or dataType is incorrect : {mandatoryColumns: ${mandatoryColumns}, dataType: ${typeof mandatoryColumns}}`,
    );

  mandatoryColumns.forEach((mandatoryColumn) => {
    const conditionForEmptyCheck = checkIfKeyExist
      ? _.has(data, mandatoryColumn) && _.isEmpty(data[mandatoryColumn])
      : _.isEmpty(data[mandatoryColumn]);

    if (conditionForEmptyCheck) {
      throw new Error(`Column: ${mandatoryColumn} Can Not Be Empty`);
    }
  });
}

function convertStringToArray(_stringValue, _separators) {
  const returnValue = [];
  const separatorForSplit = 'SEPARATOR_FOR_SPLIT';
  const separators = _separators ? _.cloneDeep(_separators) : [];

  if (_stringValue && !_.isString(_stringValue))
    throw new Error(
      `Passing String value or dataType is incorrect : {value: ${JSON.stringify(
        _stringValue,
      )}, dataType: ${typeof _stringValue}}`,
    );
  if (_.isEmpty(separators) || !Array.isArray(separators))
    throw new Error(
      `Passing separators or dataType is incorrect : {separators: ${JSON.stringify(
        separators,
      )}, dataType: ${typeof separators}}`,
    );

  let stringValue = _stringValue ? _stringValue.trim() : null;

  if (!stringValue) return returnValue;

  for (let index = 0; index < separators.length; index += 1) {
    const separator = separators[index];
    stringValue = stringValue.replaceAll(separator, separatorForSplit);
  }

  const arrayValue = stringValue.split(separatorForSplit);

  arrayValue.forEach((element) => {
    if (element.trim()) returnValue.push(element.trim());
  });

  return returnValue;
}

function convertArrayToLowerCase(data) {
  const lowerCaseData = [];
  data.forEach((element) => {
    if (element) lowerCaseData.push(element.toLowerCase());
  });
  return lowerCaseData;
}

function convertDateInToDbFormate(_data, _dateColumns) {
  const data = _.cloneDeep(_data) || {};
  const dateColumns = _.cloneDeep(_dateColumns) || [];

  if (_.isEmpty(data) || !_.isObject(data) || Array.isArray(data))
    throw new Error(
      `Passing data or dataType is incorrect : {data: ${data}, dataType: ${typeof data}}`,
    );
  if (_.isEmpty(dateColumns) || !Array.isArray(dateColumns))
    throw new Error(
      `Passing dateColumns or dataType is incorrect : {dateColumns: ${dateColumns}, dataType: ${typeof dateColumns}}`,
    );

  dateColumns.forEach((dateColumn) => {
    if (!data[dateColumn]) return;
    const valueInDateFormate = new Date(data[dateColumn]);
    if (valueInDateFormate.toString() === 'Invalid Date')
      throw new Error(
        `Could not convert string value into Date formate {columnName: ${dateColumn}, value: ${JSON.stringify(
          data[dateColumn],
        )}}`,
      );
    data[dateColumn] = valueInDateFormate;
  });
  return data;
}

function convertColumnsValueInToBoolean(_data, _booleanColumns) {
  const data = _.cloneDeep(_data) || {};
  const booleanColumns = _.cloneDeep(_booleanColumns) || [];

  if (_.isEmpty(data) || !_.isObject(data) || Array.isArray(data))
    throw new Error(
      `Passing data or dataType is incorrect : {data: ${data}, dataType: ${typeof data}}`,
    );
  if (_.isEmpty(booleanColumns) || !Array.isArray(booleanColumns))
    throw new Error(
      `Passing arrayColumns or dataType is incorrect : {arrayColumns: ${booleanColumns}, dataType: ${typeof booleanColumns}}`,
    );

  booleanColumns.forEach((booleanColumn) => {
    if (!_.has(data, booleanColumn)) return;

    let booleanValue = data[booleanColumn];
    if (_.isBoolean(booleanValue)) return;

    if (_.isString(booleanValue)) {
      booleanValue = _.trim(booleanValue).toLowerCase();
      if (booleanValue === 'true' || booleanValue === 'false') {
        data[booleanColumn] = JSON.parse(booleanValue);
        return;
      }
    }

    throw new Error(
      `Could not convert value into Boolean {columnName: ${booleanColumn}, value: ${JSON.stringify(
        data[booleanColumn],
      )}}`,
    );
  });
  return data;
}

function processDropDownColumnsOfContact(_contact) {
  // TODO: Value is wrong then throw Error. but first time import in not throwing error. if user insert wrong value then contact store with empty value
  // Drop Down Columns: jobLevel, jobDepartment, zbStatus, domainStatus, personalEmailStatus, emailTags, disposition

  const contact = _.cloneDeep(_contact) || {};

  if (contact.zbStatus) contact.zbStatus = _.toLower(contact.zbStatus);
  if (contact.personalEmailStatus)
    contact.personalEmailStatus = _.toLower(contact.personalEmailStatus);

  if (!JOB_LEVEL.includes(contact.jobLevel))
    contact.jobLevel = jobLevelMapping[_.toLower(contact.jobLevel)] || null;

  if (!JOB_DEPARTMENT.includes(contact.jobDepartment))
    contact.jobDepartment =
      jobDepartmentMapping[_.toLower(contact.jobDepartment)] || null;

  if (!ZB_STATUS.includes(contact.zbStatus)) contact.zbStatus = null;
  if (!DOMAIN_STATUS.includes(contact.domainStatus))
    contact.domainStatus = null;
  if (!ZB_STATUS.includes(contact.personalEmailStatus))
    contact.personalEmailStatus = null;
  if (!EMAIL_TAGS.includes(contact.emailTags)) contact.emailTags = null;
  if (!Object.values(CONTACT_DISPOSITION).includes(contact.disposition))
    contact.disposition = null;

  return contact;
}

function formatAndValidatePhoneNumber(number, _country) {
  // TODO:: Default `0` set for Phone number(One time change, Remove default value after all account data uploaded)
  if (!number || !_country) return '+10000000000';

  const country = _country.toLowerCase();

  let formateNumber;
  let parsedNumber;
  let phoneResult;

  phoneResult = phone(number);

  if (countryISO[country]) {
    phoneResult = phone(number, { country: countryISO[country] });
  }

  if (phoneResult) {
    parsedNumber = phoneResult.phoneNumber;
  }

  if (parsedNumber) {
    formateNumber = parsedNumber.replace(/tel:/g, '');
  }

  if (formateNumber && phoneResult.isValid) {
    return formateNumber;
  }

  // ONE_TIME_MASTER_CHANGE
  // add dummy data for once comment error
  // throw new Error(`Account Phone Number Is Wrong '${number}'`);
  return '+10000000000';
}

async function validateAndPreProcessContactForSkip(_inputs) {
  const inputs = _.cloneDeep(_inputs) || {};
  let { contact } = inputs;
  const { userEmail } = inputs;

  const mandatoryColumns = ['firstName', 'lastName', 'jobTitle'];
  const dateColumns = ['zbDate', 'domainDate'];
  const booleanColumns = ['emailOpen', 'emailClick', 'isVerified'];
  const objectColumns = ['clientNameHistory'];

  checkMandatoryColumns(contact, mandatoryColumns);

  const firstName = contact.firstName || '';
  const middleName = contact.middleName || '';
  const lastName = contact.lastName || '';
  const name = `${firstName} ${middleName} ${lastName}`;

  const separatorsOfTokens = ['|'];
  contact.nameTokens = convertStringToArray(
    getTokens(name),
    separatorsOfTokens,
  );
  const jobTitleTokens = convertStringToArray(
    getTokens(contact.jobTitle),
    separatorsOfTokens,
  );
  contact.jobTitleTokens = convertArrayToLowerCase(jobTitleTokens);

  contact = convertDateInToDbFormate(contact, dateColumns);

  contact = convertColumnsValueInToBoolean(contact, booleanColumns);

  const defaultValueOfObjectColumn = {};
  objectColumns.forEach((objectColumn) => {
    contact[objectColumn] = defaultValueOfObjectColumn;
  });

  // TODO: Add validation for Url Columns
  // Url Columns: linkedinHandle, facebookHandle, twitterHandle, otherSourceLink,

  // Drop Down Columns: jobLevel, jobDepartment, zbStatus, domainStatus, personalEmailStatus, emailTags, disposition
  contact = processDropDownColumnsOfContact(contact);

  if (contact.email) contact.email = _.toLower(contact.email);
  if (contact.linkedinHandle) {
    try {
      const url = new URL(contact.linkedinHandle);

      contact.linkedinHandle = `${url.host}${url.pathname}`;
    } catch (error) {
      const errMsg = `Linkedin URL is invalid {Linkedin URL: ${contact.linkedinHandle}}`;
      throw new Error(errMsg);
    }
  }

  // Phone number columns: directDial, mobileNumber1, mobileNumber2, homeNumber
  const phoneNumberColumns = [
    'directDial',
    'mobileNumber1',
    'mobileNumber2',
    'homeNumber',
  ];
  phoneNumberColumns.forEach((phoneNumberColumn) => {
    contact[phoneNumberColumn] = formatAndValidatePhoneNumber(
      contact[phoneNumberColumn],
      contact.locationCountry,
    );
  });

  contact.updatedBy = userEmail;
  contact.createdBy = userEmail;

  contact.updatedAt = new Date();
  contact.createdAt = new Date();

  return contact;
}

async function saveContact(inputs) {
  const { userEmail, accountDomain } = inputs;
  let { contact, changedContactData } = inputs;

  contact = this.sanitizer.sanitize(contact);
  changedContactData = this.sanitizer.sanitize(changedContactData);

  const formateChangedContactData =
    this.convertGoldMineToMasterContact(changedContactData);

  let formateChangedContactDataString = Object.values(
    formateChangedContactData,
  ).join('');

  const formateChangedContactDataKeys = Object.keys(formateChangedContactData);
  formateChangedContactDataKeys.forEach((key) => {
    if (!formateChangedContactData[key]) {
      formateChangedContactDataString += null;
    }
  });

  if (formateChangedContactDataString.length === 0) {
    return contact;
  }

  contact = this.convertGoldMineToMasterContact(contact);
  contact.createdUserEmail = userEmail;

  contact = Object.assign(contact, formateChangedContactData);

  // researchStatus
  if (_.get(formateChangedContactData, 'researchStatus', null)) {
    switch (formateChangedContactData.researchStatus) {
      case 'QA':
      case 'Q':
      case 'QF':
      case 'NQ':
      case 'NF':
      case 'Dup':
        contact.researchStatus = 'Active Contact';
        break;
      case 'D':
        contact.researchStatus = 'No Longer';
        break;
      default:
        contact.researchStatus = 'No Longer';
        break;
    }
  }

  // validate & process contact
  contact = await validateAndPreProcessContactForSkip({
    contact,
    userEmail,
  });

  const DATA_TYPES_FOR_DEDUPE_KEYS_GENERATOR_MODULE = {
    CONTACT: 'contact',
    ACCOUNT: 'account',
  };

  // dedupeGenerator
  const dedupeGeneratorInput = {
    dataType: DATA_TYPES_FOR_DEDUPE_KEYS_GENERATOR_MODULE.CONTACT,
    data: {
      firstName: _.get(contact, 'firstName', ''),
      lastName: _.get(contact, 'lastName', ''),
      email: _.get(contact, 'workEmail', ''),
      companyDomain: accountDomain,
    },
  };

  const contactDedupeKeys = dedupeKeysGenerator(dedupeGeneratorInput);

  if (contactDedupeKeys.fnLnDomain)
    contact.fnLnEmailDomainDedupeKey = contactDedupeKeys.fnLnDomain;
  if (contactDedupeKeys.fnLnCompanyDomain)
    contact.fnLnCompanyDomainDedupeKey = contactDedupeKeys.fnLnCompanyDomain;
  if (contactDedupeKeys.fnLnScrubbedCompanyDomain)
    contact.fnLnScrubbedCompanyDomainDedupeKey =
      contactDedupeKeys.fnLnScrubbedCompanyDomain;

  const dedupeKeysForFetchMasterContact = {
    workEmail: contact.workEmail,
    fnLnEmailDomainDedupeKey: contact.fnLnEmailDomainDedupeKey,
    fnLnScrubbedCompanyDomainDedupeKey:
      contact.fnLnScrubbedCompanyDomainDedupeKey,
    linkedinHandle: contact.linkedinHandle,
  };

  const masterContact = await getMasterContact(
    dedupeKeysForFetchMasterContact,
    accountDomain,
  );

  if (masterContact) {
    if (masterContact.workEmail === dedupeKeysForFetchMasterContact.workEmail) {
      this.logger.info(
        `[MASTER_VERIFY_CONTACT_SERVICE] :: START :: Updating Master Contact {workEmail : ${masterContact.workEmail}, userEmail : ${userEmail}}`,
      );

      let updateContact = _.pick(contact, formateChangedContactDataKeys);
      updateContact = _.omitBy(updateContact, (v) => v === null);

      await updateMasterContactByEmail(updateContact, masterContact.workEmail);

      this.logger.info(
        `[MASTER_VERIFY_CONTACT_SERVICE] :: COMPLETED :: Updated Master Contact {workEmail : ${masterContact.workEmail}, userEmail : ${userEmail}}`,
      );
    } else if (
      masterContact.fnLnEmailDomainDedupeKey ===
        dedupeKeysForFetchMasterContact.fnLnEmailDomainDedupeKey ||
      masterContact.fnLnScrubbedCompanyDomainDedupeKey ===
        dedupeKeysForFetchMasterContact.fnLnScrubbedCompanyDomainDedupeKey ||
      masterContact.linkedinHandle ===
        dedupeKeysForFetchMasterContact.linkedinHandle
    ) {
      this.logger.info(
        `[MASTER_VERIFY_CONTACT_SERVICE] :: START ::  Matched with DedupeKey Add Contact To VerifyContact {workEmail : ${contact.workEmail}, userEmail : ${userEmail}}`,
      );

      await createVerifyContact(contact, this.logger);

      this.logger.info(
        `[MASTER_VERIFY_CONTACT_SERVICE] :: COMPLETED :: Added Contact To VerifyContact {workEmail : ${contact.workEmail}, userEmail : ${userEmail}}`,
      );
    }

    return contact;
  }

  this.logger.info(
    `[MASTER_VERIFY_CONTACT_SERVICE] :: START :: Search Master Account by Domain {accountDomain : ${accountDomain}, userEmail : ${userEmail}}`,
  );

  const masterAccount = await fetchMasterAccountBasedOnDomain(accountDomain);

  let isContactCreated = false;
  if (masterAccount && masterAccount['Locations.id']) {
    try {
      this.logger.info(
        `[MASTER_VERIFY_CONTACT_SERVICE] :: Completed :: Master Account Found By Domain {accountDomain : ${accountDomain}, userEmail : ${userEmail}}`,
      );

      const masterContactForCreate = _.cloneDeep(contact);
      masterContactForCreate.LocationId = masterAccount['Locations.id'];
      masterContactForCreate.AccountDomain = accountDomain;

      this.logger.info(
        `[MASTER_VERIFY_CONTACT_SERVICE] :: START :: Creating Master Contact {workEmail : ${masterContactForCreate.workEmail}, userEmail : ${userEmail}}`,
      );

      await createMasterContact(masterContactForCreate);

      this.logger.info(
        `[MASTER_VERIFY_CONTACT_SERVICE] :: COMPLETED :: Created Master Contact {workEmail : ${masterContactForCreate.workEmail}, userEmail : ${userEmail}}`,
      );

      isContactCreated = true;
    } catch (error) {
      this.logger.error(error);
    }
  }

  if (!isContactCreated) {
    this.logger.info(
      `[MASTER_VERIFY_CONTACT_SERVICE] :: Completed :: Master Account Not Found By Domain {accountDomain : ${accountDomain}, userEmail : ${userEmail}}`,
    );

    this.logger.info(
      `[MASTER_VERIFY_CONTACT_SERVICE] :: START :: Add Contact To VerifyContact {workEmail : ${contact.workEmail}, userEmail : ${userEmail}}`,
    );

    await createVerifyContact(contact, this.logger);

    this.logger.info(
      `[MASTER_VERIFY_CONTACT_SERVICE] :: COMPLETED :: Added Contact To VerifyContact {workEmail : ${contact.workEmail}, userEmail : ${userEmail}}`,
    );
  }

  return contact;
}

async function createContact(_contact) {
  const contact = _.cloneDeep(_contact);
  if (!contact) {
    const error = new Error();
    error.message = `Could Not Create Contact, Contact Is Missing`;
    error.code = `BAD_ACCOUNT_DATA`;
    const serializedError = serializeError(error);
    console.error(
      `[CREATE_VERIFY_CONTACT] :: ERROR : Invalid Contact Data :  ${JSON.stringify(
        serializedError.message,
      )}`,
    );
    throw error;
  }
  const contactInstance = await this.findContact(contact.domain);
  if (!contactInstance) {
    const createdContact = await VerifyContact.create(contact);

    console.info(
      `[CREATE_VERIFY_CONTACT] :: Contact Created,  contactDomain : ${createdContact.domain}`,
    );

    return createdContact;
  }

  const updatedContactInstance = _.merge(contactInstance, contact);
  if (contact.location) {
    updatedContactInstance.changed('location', true);
  }
  if (contact.technology) {
    updatedContactInstance.changed('technology', true);
  }

  console.info(
    `[CREATE_VERIFY_CONTACT] :: Contact Updated,  contactDomain : ${updatedContactInstance.domain}`,
  );
  return updatedContactInstance.save();
}

async function findContact(domain) {
  if (!domain) {
    const error = new Error();
    error.message = `domain is required`;
    error.code = `BAD_ACCOUNT_ID`;
    const serializedError = serializeError(error);
    this.logger.error(
      `[FIND_ACCOUNT] :: Could Not Find Reference domain to Find Contact : ${JSON.stringify(
        serializedError.message,
      )}`,
    );
    throw serializedError;
  }

  // Find Contact if Exist
  const contactInstance = await VerifyContact.findOne({
    where: {
      domain,
    },
  });

  if (contactInstance) {
    this.logger.info(
      `[FIND_ACCOUNT] :: Contact found with domain: ${contactInstance.domain}`,
    );
    return contactInstance;
  }
  return null;
}

VerifyContactCRUDService.prototype = {
  getAllContact,
  downloadAllContact,
  updateJobStatus,
  addFile,
  enqueue,
  saveContact,
  createContact,
  convertGoldMineToMasterContact,
  findContact,
};

module.exports = VerifyContactCRUDService;
