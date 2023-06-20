const {
  EmailPattern,
  DynamicEmailPattern,
  Sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');
const _ = require('lodash');
const settingsConfig = require('../../config/settings/settings-config');

const PATTERN_SOURCE = {
  LOCAL: 'local',
  MASTER: 'master',
};

const EMAIL_PATTERNS = {
  first: 'FIRST',
  last: 'LAST',
  first_dot_last: 'FIRST_DOT_LAST',
  first_underscore_last: 'FIRST_UNDERSCORE_LAST',
  first_last: 'FIRST LAST',
  last_first: 'LAST FIRST',
  last_dot_first: 'LAST_DOT_FIRST',
  last_underscore_first: 'LAST_UNDERSCORE_FIRST',
  first_last_initial: 'FIRST LAST_INITIAL',
  first_dot_last_initial: 'FIRST_DOT_LAST_INITIAL',
  last_initial_first: 'LAST_INITIAL FIRST',
  last_initial_dot_first: 'LAST_INITIAL_DOT_FIRST',
  last_initial_underscore_first: 'LAST_INITIAL_UNDERSCORE_FIRST',
  first_initial_dot_last: 'FIRST_INITIAL_DOT_LAST',
  first_initial_underscore_last: 'FIRST_INITIAL_UNDERSCORE_LAST',
  first_initial_last: 'FIRST_INITIAL LAST',
  last_dot_first_initial: 'LAST_DOT_FIRST_INITIAL',
  last_underscore_first_initial: 'LAST_UNDERSCORE_FIRST_INITIAL',
  last_first_initial: 'LAST FIRST_INITIAL',
  first_initial_last_initial: 'FIRST_INITIAL LAST_INITIAL',
  last_initial_first_initial: 'LAST_INITIAL FIRST_INITIAL',
  first_middle_last: 'FIRST MIDDLE LAST',
  first_dot_middle_dot_last: 'FIRST_DOT_MIDDLE_DOT_LAST',
  first_underscore_middle_underscore_last:
    'FIRST_UNDERSCORE_MIDDLE_UNDERSCORE_LAST',
  first_dot_middle_initial_dot_last: 'FIRST_DOT_MIDDLE_INITIAL_DOT_LAST',
  first_underscore_middle_initial_underscore_last:
    'FIRST_UNDERSCORE_MIDDLE_INITIAL_UNDERSCORE_LAST',
  first_middle_initial_last: 'FIRST MIDDLE_INITIAL LAST',
  first_initial_middle_initial_dot_last:
    'FIRST_INITIAL MIDDLE_INITIAL_DOT_LAST',
  first_initial_middle_initial_underscore_last:
    'FIRST_INITIAL MIDDLE_INITIAL_UNDERSCORE_LAST',
  first_initial_middle_initial_last: 'FIRST_INITIAL MIDDLE_INITIAL LAST',
};

function EmailPatternService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function getEmailFromPattern(patternCode, name, domain) {
  const {
    firstName,
    middleName,
    lastName,
    firstNameInitial,
    middleNameInitial,
    lastNameInitial,
  } = name;
  let generatedEmail = '';

  const defaultMiddleName = '[MIDDLE_NAME]';
  const defaultMiddleNameIntial = '[MIDDLE_NAME_INITIAL]';
  switch (patternCode) {
    case EMAIL_PATTERNS.first:
      generatedEmail = `${firstName}@${domain}`;
      break;
    case EMAIL_PATTERNS.last:
      generatedEmail = `${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_dot_last:
      generatedEmail = `${firstName}.${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_underscore_last:
      generatedEmail = `${firstName}_${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_last:
      generatedEmail = `${firstName}${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_first:
      generatedEmail = `${lastName}${firstName}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_dot_first:
      generatedEmail = `${lastName}.${firstName}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_underscore_first:
      generatedEmail = `${lastName}_${firstName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_last_initial:
      generatedEmail = `${firstName}${lastNameInitial}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_dot_last_initial:
      generatedEmail = `${firstName}.${lastNameInitial}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_initial_first:
      generatedEmail = `${lastNameInitial}${firstName}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_initial_dot_first:
      generatedEmail = `${lastNameInitial}.${firstName}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_initial_underscore_first:
      generatedEmail = `${lastNameInitial}_${firstName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_initial_dot_last:
      generatedEmail = `${firstNameInitial}.${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_initial_underscore_last:
      generatedEmail = `${firstNameInitial}_${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_initial_last:
      generatedEmail = `${firstNameInitial}${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_dot_first_initial:
      generatedEmail = `${lastName}.${firstNameInitial}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_underscore_first_initial:
      generatedEmail = `${lastName}_${firstNameInitial}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_first_initial:
      generatedEmail = `${lastName}${firstNameInitial}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_initial_last_initial:
      generatedEmail = `${firstNameInitial}${lastNameInitial}@${domain}`;
      break;
    case EMAIL_PATTERNS.last_initial_first_initial:
      generatedEmail = `${lastNameInitial}${firstNameInitial}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_middle_last:
      generatedEmail = `${firstName}${
        middleName || defaultMiddleName
      }${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_dot_middle_dot_last:
      generatedEmail = `${firstName}.${
        middleName || defaultMiddleName
      }.${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_underscore_middle_underscore_last:
      generatedEmail = `${firstName}_${
        middleName || defaultMiddleName
      }_${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_dot_middle_initial_dot_last:
      generatedEmail = `${firstName}.${
        middleNameInitial || defaultMiddleNameIntial
      }.${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_underscore_middle_initial_underscore_last:
      generatedEmail = `${firstName}_${
        middleNameInitial || defaultMiddleNameIntial
      }_${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_middle_initial_last:
      generatedEmail = `${firstName}${
        middleNameInitial || defaultMiddleNameIntial
      }${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_initial_middle_initial_dot_last:
      generatedEmail = `${firstNameInitial}${
        middleNameInitial || defaultMiddleNameIntial
      }.${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_initial_middle_initial_underscore_last:
      generatedEmail = `${firstNameInitial}${
        middleNameInitial || defaultMiddleNameIntial
      }_${lastName}@${domain}`;
      break;
    case EMAIL_PATTERNS.first_initial_middle_initial_last:
      generatedEmail = `${firstNameInitial}${
        middleNameInitial || defaultMiddleNameIntial
      }${lastName}@${domain}`;
      break;
    default:
      break;
  }
  return generatedEmail;
}

function generateInitialOfName(_name) {
  const name = _name;

  name.firstNameInitial = name.firstName[0] || '';
  name.middleNameInitial = name.middleName[0] || '';
  name.lastNameInitial = name.lastName[0] || '';

  if (name.firstName && name.firstName.length === 1) {
    name.firstName = '';
  }
  if (name.middleName && name.middleName.length === 1) {
    name.middleName = '';
  }
  if (name.lastName && name.lastName.length === 1) {
    name.lastName = '';
  }
  return name;
}

function generateEmailPattern(patternData, _name, domain, source) {
  const patterns = [];
  const totalPatterns = patternData.patterns.length;
  const name = generateInitialOfName(_name);
  for (let index = 0; index < totalPatterns; index += 1) {
    const element = patternData.patterns[index];
    const pattern = {};
    pattern.contacts = element.count_email_pattern;
    // TODO: correct occurance to occurrence.
    if (!element.occurance)
      element.occurance =
        (100 / patternData.totalContact) * element.count_email_pattern;
    pattern.occurance = Number(parseFloat(element.occurance));
    pattern.pattern = getEmailFromPattern(element.patternCode, name, domain);
    pattern.source = source;
    pattern.totalContact = patternData.totalContact;
    if (pattern.pattern) {
      patterns.push(pattern);
    }
  }
  return patterns;
}

async function getMasterPatterns(domain) {
  const result = await EmailPattern.findOne({
    attributes: ['patterns'],
    where: {
      emailDomain: domain,
    },
    raw: true,
  });
  return _.get(result, 'patterns', {});
}

async function getLocalPatterns(domain) {
  const localPatterns = await DynamicEmailPattern.findAll({
    group: ['pattern'],
    where: { emailDomain: domain },
    attributes: [
      ['pattern', 'patternCode'],
      [Sequelize.fn('COUNT', 'pattern'), 'count_email_pattern'],
    ],
    raw: true,
  });
  let totalContacts = 0;
  localPatterns.forEach((pattern) => {
    totalContacts += parseInt(pattern.count_email_pattern, 10);
  });
  const result = {
    totalContact: totalContacts,
    patterns: localPatterns,
  };
  return result;
}

async function getPatterns(inputs) {
  const domain = _.get(inputs, 'domain', '').toLowerCase().trim();
  const name = {};
  name.firstName = _.get(inputs, 'firstName', '').toLowerCase().trim();
  name.lastName = _.get(inputs, 'lastName', '').toLowerCase().trim();
  name.middleName = _.get(inputs, 'middleName', '').toLowerCase().trim();

  const masterPatterns = await getMasterPatterns(domain);
  const localPatterns = await getLocalPatterns(domain);

  // remove duplicate pattern code
  localPatterns.patterns = _.differenceWith(
    localPatterns.patterns,
    masterPatterns.patterns,
    (o1, o2) => o1.patternCode === o2.patternCode,
  );

  let masterEmailPatterns = [];

  if (Object.keys(masterPatterns).length) {
    masterEmailPatterns = generateEmailPattern(
      masterPatterns,
      name,
      domain,
      PATTERN_SOURCE.MASTER,
    );
  }

  let localEmailPatterns = [];
  if (Object.keys(localPatterns).length) {
    localEmailPatterns = generateEmailPattern(
      localPatterns,
      name,
      domain,
      PATTERN_SOURCE.LOCAL,
    );
  }

  const sortedMasterPatterns = _.sortBy(
    masterEmailPatterns,
    'occurance',
  ).reverse();
  const sortedLocalPatterns = _.sortBy(
    localEmailPatterns,
    'occurance',
  ).reverse();

  const result = sortedMasterPatterns.concat(sortedLocalPatterns);

  return result;
}

function formatData(emailPatterns) {
  const newEmailPatterns = [];
  for (let index = 0; index < emailPatterns.length; index += 1) {
    const newEmailPattern = {};
    newEmailPattern.emailDomain = emailPatterns[index].domain;
    newEmailPattern.patterns = emailPatterns[index].patterns;
    newEmailPatterns.push(newEmailPattern);
  }
  return newEmailPatterns;
}

async function addEmailPatterns(_emailPatterns) {
  const emailPatterns = formatData(_emailPatterns);

  const result = await EmailPattern.bulkCreate(emailPatterns);
  return result;
}

function matchEmailPattern(email, _name, domain, patternCode) {
  const name = _name;

  const genratedEmail = getEmailFromPattern(patternCode, name, domain);

  return email === genratedEmail;
}

function getPatternOfEmail(email, _name, domain) {
  let name = _name;

  name = generateInitialOfName(name);

  const keys = Object.keys(EMAIL_PATTERNS);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    const patternCode = EMAIL_PATTERNS[key];
    const res = matchEmailPattern(email, name, domain, patternCode);
    if (res) {
      return patternCode;
    }
  }

  throw new Error('Email Pattern is not Match');
}

async function addDynamicEmail(_inputs) {
  const inputs = _inputs;

  const email = inputs.email.toLowerCase().trim();
  const name = {};
  name.firstName = inputs.firstName.toLowerCase().trim() || '';
  name.middleName = inputs.middleName.toLowerCase().trim() || '';
  name.lastName = inputs.lastName.toLowerCase().trim() || '';

  const emailDomain = email.substring(email.lastIndexOf('@') + 1);

  const dynamicEmailPatternData = {};
  dynamicEmailPatternData.email = email;
  dynamicEmailPatternData.emailDomain = emailDomain;
  dynamicEmailPatternData.pattern = getPatternOfEmail(email, name, emailDomain);
  dynamicEmailPatternData.website = inputs.website || null;
  dynamicEmailPatternData.verifiedData = inputs.verifiedData || {};
  dynamicEmailPatternData.createdBy = inputs.createdBy;
  dynamicEmailPatternData.updatedBy = inputs.updatedBy || inputs.createdBy;

  const result = await DynamicEmailPattern.create(dynamicEmailPatternData);

  return result;
}

/*
NOTE : Commented Because It Was Not Used in Code

function dataStoreToDB(filePath) {
  const urlReaderStream = fs
    .createReadStream(filePath)
    .pipe(
      csvParser.parse({
        ignoreEmpty: true,
      }),
    )
    .on('data', handleData)
    .on('error', handleError)
    .on('end', handleEnd);

  async function handleData(row) {
    console.log(row.Domain);
  }

  function handleError(error) {
    console.log('Error While Reading URLs');
    console.log(error);
  }

  function handleEnd() {
    console.log('URL Reading Complete');
  }
}

*/

EmailPatternService.prototype = {
  getPatterns,
  addEmailPatterns,
  addDynamicEmail,
};

module.exports = EmailPatternService;
