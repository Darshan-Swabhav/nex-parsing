const { EmailPattern } = require('@nexsalesdev/master-data-model');
const settingsConfig = require('../../../config/settings/settings-config');

const EMAIL_PATTERNS = {
  first: 'FIRST',
  last: 'LAST',
  first_dot_last: 'FIRST_DOT_LAST',
  first_underscore_last: 'FIRST_UNDERSCORE_LAST',
  first_last: 'FIRST_LAST', // Gold Mine: 'FIRST LAST'
  last_first: 'LAST_FIRST', // Gold Mine: 'LAST FIRST'
  last_dot_first: 'LAST_DOT_FIRST',
  last_underscore_first: 'LAST_UNDERSCORE_FIRST',
  first_last_initial: 'FIRST_LAST_INITIAL', // Gold Mine: 'FIRST LAST_INITIAL'
  first_dot_last_initial: 'FIRST_DOT_LAST_INITIAL',
  last_initial_first: 'LAST_INITIAL_FIRST', // Gold Mine: 'LAST_INITIAL FIRST'
  last_initial_dot_first: 'LAST_INITIAL_DOT_FIRST',
  last_initial_underscore_first: 'LAST_INITIAL_UNDERSCORE_FIRST',
  first_initial_dot_last: 'FIRST_INITIAL_DOT_LAST',
  first_initial_underscore_last: 'FIRST_INITIAL_UNDERSCORE_LAST',
  first_initial_last: 'FIRST_INITIAL_LAST', // Gold Mine: 'FIRST_INITIAL LAST'
  last_dot_first_initial: 'LAST_DOT_FIRST_INITIAL',
  last_underscore_first_initial: 'LAST_UNDERSCORE_FIRST_INITIAL',
  last_first_initial: 'LAST FIRST_INITIAL',
  first_initial_last_initial: 'FIRST_INITIAL_LAST_INITIAL', // Gold Mine: 'FIRST_INITIAL LAST_INITIAL'
  last_initial_first_initial: 'LAST_INITIAL_FIRST_INITIAL', // Gold Mine: 'LAST_INITIAL FIRST_INITIAL'
  first_middle_last: 'FIRST_MIDDLE_LAST', // Gold Mine: 'FIRST MIDDLE LAST'
  first_dot_middle_dot_last: 'FIRST_DOT_MIDDLE_DOT_LAST',
  first_underscore_middle_underscore_last:
    'FIRST_UNDERSCORE_MIDDLE_UNDERSCORE_LAST',
  first_dot_middle_initial_dot_last: 'FIRST_DOT_MIDDLE_INITIAL_DOT_LAST',
  first_underscore_middle_initial_underscore_last:
    'FIRST_UNDERSCORE_MIDDLE_INITIAL_UNDERSCORE_LAST',
  first_middle_initial_last: 'FIRST_MIDDLE_INITIAL_LAST', // Gold Mine: 'FIRST MIDDLE_INITIAL LAST'
  first_initial_middle_initial_dot_last:
    'FIRST_INITIAL_MIDDLE_INITIAL_DOT_LAST', // Gold Mine: 'FIRST_INITIAL MIDDLE_INITIAL_DOT_LAST'
  first_initial_middle_initial_underscore_last:
    'FIRST_INITIAL_MIDDLE_INITIAL_UNDERSCORE_LAST', // Gold Mine: 'FIRST_INITIAL MIDDLE_INITIAL_UNDERSCORE_LAST'
  first_initial_middle_initial_last: 'FIRST_INITIAL_MIDDLE_INITIAL_LAST', // Gold Mine: 'FIRST_INITIAL MIDDLE_INITIAL LAST'
};
const defaultName = {
  firstName: '[FIRST_NAME]',
  middleName: '[MIDDLE_NAME]',
  lastName: '[LAST_NAME]',
  firstNameInitial: '[FIRST_NAME_INITIAL]',
  middleNameInitial: '[MIDDLE_NAME_INITIAL]',
  lastNameInitial: '[LAST_NAME_INITIAL]',
};

function EmailPatternService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function buildEmailUsingPatternCode(patternCode, name, emailDomain) {
  let {
    firstName,
    middleName,
    lastName,
    firstNameInitial,
    middleNameInitial,
    lastNameInitial,
  } = name;
  let generatedEmail = '';

  firstName = firstName || defaultName.firstName;
  middleName = middleName || defaultName.middleName;
  lastName = lastName || defaultName.lastName;
  firstNameInitial = firstNameInitial || defaultName.firstNameInitial;
  middleNameInitial = middleNameInitial || defaultName.middleNameInitial;
  lastNameInitial = lastNameInitial || defaultName.lastNameInitial;

  switch (patternCode) {
    case EMAIL_PATTERNS.first:
      generatedEmail = `${firstName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last:
      generatedEmail = `${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_dot_last:
      generatedEmail = `${firstName}.${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_underscore_last:
      generatedEmail = `${firstName}_${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_last:
      generatedEmail = `${firstName}${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_first:
      generatedEmail = `${lastName}${firstName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_dot_first:
      generatedEmail = `${lastName}.${firstName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_underscore_first:
      generatedEmail = `${lastName}_${firstName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_last_initial:
      generatedEmail = `${firstName}${lastNameInitial}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_dot_last_initial:
      generatedEmail = `${firstName}.${lastNameInitial}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_initial_first:
      generatedEmail = `${lastNameInitial}${firstName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_initial_dot_first:
      generatedEmail = `${lastNameInitial}.${firstName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_initial_underscore_first:
      generatedEmail = `${lastNameInitial}_${firstName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_initial_dot_last:
      generatedEmail = `${firstNameInitial}.${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_initial_underscore_last:
      generatedEmail = `${firstNameInitial}_${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_initial_last:
      generatedEmail = `${firstNameInitial}${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_dot_first_initial:
      generatedEmail = `${lastName}.${firstNameInitial}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_underscore_first_initial:
      generatedEmail = `${lastName}_${firstNameInitial}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_first_initial:
      generatedEmail = `${lastName}${firstNameInitial}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_initial_last_initial:
      generatedEmail = `${firstNameInitial}${lastNameInitial}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.last_initial_first_initial:
      generatedEmail = `${lastNameInitial}${firstNameInitial}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_middle_last:
      generatedEmail = `${firstName}${middleName}${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_dot_middle_dot_last:
      generatedEmail = `${firstName}.${middleName}.${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_underscore_middle_underscore_last:
      generatedEmail = `${firstName}_${middleName}_${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_dot_middle_initial_dot_last:
      generatedEmail = `${firstName}.${middleNameInitial}.${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_underscore_middle_initial_underscore_last:
      generatedEmail = `${firstName}_${middleNameInitial}_${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_middle_initial_last:
      generatedEmail = `${firstName}${middleNameInitial}${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_initial_middle_initial_dot_last:
      generatedEmail = `${firstNameInitial}${middleNameInitial}.${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_initial_middle_initial_underscore_last:
      generatedEmail = `${firstNameInitial}${middleNameInitial}_${lastName}@${emailDomain}`;
      break;
    case EMAIL_PATTERNS.first_initial_middle_initial_last:
      generatedEmail = `${firstNameInitial}${middleNameInitial}${lastName}@${emailDomain}`;
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

function matchEmailPattern(email, _name, domain, patternCode) {
  const name = _name;

  const generatedEmail = buildEmailUsingPatternCode(patternCode, name, domain);

  return email === generatedEmail;
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

async function addEmailPattern(_inputs) {
  const inputs = _inputs;

  const email = inputs.email ? inputs.email.toLowerCase().trim() : '';
  const name = {};
  name.firstName = inputs.firstName
    ? inputs.firstName.toLowerCase().trim()
    : '';
  name.middleName = inputs.middleName
    ? inputs.middleName.toLowerCase().trim()
    : '';
  name.lastName = inputs.lastName ? inputs.lastName.toLowerCase().trim() : '';

  if (!email) {
    throw new Error('Email is Required');
  }
  if (!name.firstName && !name.middleName && !name.lastName) {
    throw new Error('First Name or Middle Name or Last Name is required');
  }

  const emailDomain = email.substring(email.lastIndexOf('@') + 1);

  if (!emailDomain) {
    throw new Error(`Email domain not found from Email. {email: ${email}}`);
  }

  const emailPatternData = {};
  emailPatternData.email = email;
  emailPatternData.emailDomain = emailDomain;
  emailPatternData.pattern = getPatternOfEmail(email, name, emailDomain);
  emailPatternData.website = inputs.website || null;
  emailPatternData.verifiedData = inputs.verifiedData || {};

  const result = await EmailPattern.create(emailPatternData);

  return result;
}

EmailPatternService.prototype = {
  addEmailPattern,
};

module.exports = EmailPatternService;
