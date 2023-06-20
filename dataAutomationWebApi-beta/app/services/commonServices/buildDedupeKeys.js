const dedupeKeysGenerator = require('@nexsalesdev/da-dedupekeys-generator');
const settingsConfig = require('../../config/settings/settings-config');

const config = settingsConfig.settings || {};
/**
 * Build Dedupe Keys.
 * @param {Object} Contact - Contact Object.
 * @param {boolean=} buildEmailDomainDedupeKey - flag for build FN+LN+email_domain dedupe key.
 * @param {boolean=} buildPhoneDedupeKey - flag for build phone dedupe key.
 * @param {boolean=} buildCompanyDedupeKey - flag for build company dedupe key.
 * @param {boolean=} buildEmailName - flag for build email name dedupe key.
 * @param {boolean=} buildEmailDomain - flag for build email domain dedupe key.
 */
function buildDedupeKeys(
  contact,
  buildEmailDomainDedupeKey = true,
  buildPhoneDedupeKey = true,
  buildCompanyDedupeKey = true,
  buildEmailName = true,
  buildEmailDomain = true,
) {
  const contactDedupeGeneratorInput = {
    dataType: config.dataTypesForDedupeGeneratorModule.CONTACT,
    data: {
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      email: contact.email || '',
      companyName: contact.companyName || '',
    },
  };

  const dedupeKeys = dedupeKeysGenerator(contactDedupeGeneratorInput);

  const result = {
    fnLnCompany: '',
    fnLnDomain: '',
    fnLnPhone: '',
    emailDomain: '',
    emailName: '',
  };

  if (buildEmailDomainDedupeKey) {
    result.fnLnDomain = dedupeKeys.fnLnDomain;
  }
  if (buildPhoneDedupeKey) {
    result.fnLnPhone = dedupeKeys.fnLnPhone;
  }
  if (buildCompanyDedupeKey) {
    result.fnLnCompany = dedupeKeys.fnLnCompany;
  }
  if (buildEmailName) {
    result.emailName = dedupeKeys.emailName;
  }
  if (buildEmailDomain) {
    result.emailDomain = dedupeKeys.emailDomain;
  }
  return result;
}

module.exports = {
  buildDedupeKeys,
};
