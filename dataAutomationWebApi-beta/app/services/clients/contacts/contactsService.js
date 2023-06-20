const { get, cloneDeep } = require('lodash');
const { Contact, Sequelize } = require('@nexsalesdev/dataautomation-datamodel');
const TemplateCacheService = require('@nexsalesdev/dataautomation-datamodel/lib/services/templateCache');
const Sanitizer = require('../../commonServices/sanitizer');
const buildDedupeKeysModule = require('../../commonServices/buildDedupeKeys');
const settingsConfig = require('../../../config/settings/settings-config');

const { Op } = Sequelize;

function ContactService() {
  const config = settingsConfig.settings || {};
  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
  this.sanitizer = new Sanitizer();
  this.templateCache = new TemplateCacheService();
}

function extractFieldsFromTemplate(projectTemplate) {
  let templateFields = [];
  const fields = [];
  const contactForm = get(
    projectTemplate,
    'config.forms.AgentContactWorkspace.config',
    [],
  );

  contactForm.forEach((section) => {
    if (section.section === 'Address') {
      templateFields = templateFields.concat([{ id: 'contact.address' }]);
    } else {
      templateFields = templateFields.concat(section.fields);
    }
  });

  templateFields.forEach((field) => {
    const splitKey = 'contact.';
    let finalField;

    if (field.id.indexOf(splitKey) > -1) {
      // eslint-disable-next-line prefer-destructuring
      finalField = field.id.split(splitKey)[1];
    } else {
      finalField = field.id;
    }

    if (finalField === 'zb') fields.push('zbDateAndTime');

    fields.push(finalField);
  });

  return fields;
}

async function checkContactReuse(_contact, inputs, getMatchedContact = false) {
  let contact = cloneDeep(_contact);
  contact = this.sanitizer.sanitize(contact);

  const { projectId, clientId, templateId } = inputs;
  let { contactExpiry } = inputs;
  const logger = this.logger || console;

  const checkFinalResult = {
    matchType: '',
    matchWith: {},
  };

  if (getMatchedContact && !templateId) {
    this.logger.error(`[CONTACT_REUSE] :: Template Id is Required`);
    throw new Error(`Template Id is Required`);
  }

  // Generate Dedupe Keys
  const { fnLnCompany, fnLnDomain } =
    buildDedupeKeysModule.buildDedupeKeys(contact) || {};

  this.logger.info(
    `[CONTACT_REUSE] :: Dedupe Keys : ${JSON.stringify({
      fnLnCompany,
      fnLnDomain,
    })}`,
  );

  // Inject Dedupe Keys
  contact.companyDedupeKey = fnLnCompany;
  contact.emailDedupeKey = fnLnDomain;

  if (!contact.email && !contact.companyDedupeKey && !contact.emailDedupeKey) {
    this.logger.error(
      `[CONTACT_REUSE] :: Could not build any key for check reused Contact`,
    );
    throw new Error(`Could not build any key for check reused Contact`);
  }

  const reuseWhereClause = [];

  if (contact.email) {
    reuseWhereClause.push({ email: contact.email });
  }
  if (contact.emailDedupeKey) {
    reuseWhereClause.push({ emailDedupeKey: contact.emailDedupeKey });
  }
  if (contact.companyDedupeKey) {
    reuseWhereClause.push({ companyDedupeKey: contact.companyDedupeKey });
  }

  contactExpiry = parseInt(contactExpiry, 10);

  if (contactExpiry) {
    const now = new Date(Date.now());
    const expiryDate = new Date(
      new Date(now.setDate(now.getDate() - contactExpiry)).setHours(0, 0, 0, 0),
    );

    const contactInstance = await Contact.findOne({
      attributes: ['id'],
      where: {
        ClientId: clientId,
        disposition: 'Contact Built',
        createdAt: {
          [Op.gt]: expiryDate,
        },
        id: { [Op.ne]: contact.id || '' },
        [Op.or]: reuseWhereClause,
      },
      raw: true,
    });

    // Set MatchType = 'Within {{ x }} Days';
    if (contactInstance) {
      checkFinalResult.matchType = `Within ${contactExpiry} Days`;
    }
  }

  if (getMatchedContact) {
    const projectTemplate = await this.templateCache.getTemplate(templateId);
    const contactFields = this.extractFieldsFromTemplate(projectTemplate);

    const reusableContact = await Contact.findOne({
      where: {
        ClientId: clientId,
        disposition: ['Contact Built', 'Contact Built/Reuse'],
        id: { [Op.ne]: contact.id || '' },
        [Op.or]: reuseWhereClause,
      },
      order: [['createdAt', 'desc']],
      attributes: contactFields,
      raw: true,
    });

    if (reusableContact) {
      checkFinalResult.matchWith = reusableContact;
      if (!checkFinalResult.matchType) {
        delete checkFinalResult.matchWith.zb;
        delete checkFinalResult.matchWith.zbDateAndTime;
      }
    }
  }
  logger.info(projectId, clientId);
  return checkFinalResult;
}

ContactService.prototype = {
  extractFieldsFromTemplate,
  checkContactReuse,
};

module.exports = ContactService;
