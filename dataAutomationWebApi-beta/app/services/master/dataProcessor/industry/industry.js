/* eslint-disable no-case-declarations */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable-next-line no-await-in-loop */
const { Industry, Sequelize } = require('@nexsalesdev/master-data-model');
const { trim, cloneDeep } = require('lodash');
const industrySubIndustryMapping = require('@nexsalesdev/master-data-model/lib/dataFiles/industrySubIndustryMapping.json');
const _ = require('lodash');
const settingsConfig = require('../../../../config/settings/settings-config');

const validIndustries = Object.keys(industrySubIndustryMapping);

const { Op } = Sequelize;

function IndustryService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

function formatIndustry(data) {
  let processedIndustry = trim(data).toLowerCase();

  if (!processedIndustry || processedIndustry === 'null') return null;

  const regex = / and /gi;
  processedIndustry = processedIndustry.replace(regex, ' & ');

  return processedIndustry;
}

function formatIndustryData(data) {
  const res = {};

  res.industry = formatIndustry(data.industry);
  res.industryNx = data.industryNx;
  res.subIndustryNx = data.subIndustryNx;

  return res;
}

async function getIndustries(industries) {
  try {
    this.logger.info(`[DATA_PROCESSOR_SERVICE] :: Get Industries`);
    const formattedIndustries = [];
    let formatIndustryResult;

    industries.forEach((industry) => {
      formatIndustryResult = formatIndustry(industry);
      formattedIndustries.push(formatIndustryResult);
    });

    const res = await Industry.findAll({
      attributes: ['industry', 'industryNx', 'subIndustryNx'],
      where: { industry: { [Op.in]: formattedIndustries } },
      raw: true,
    });

    const industriesResult = industries.reduce((acc, curr) => {
      const found = res.find((item) => item.industry === curr);

      if (found) {
        acc.push(found);
      } else {
        acc.push({
          industry: curr,
          industryNx: '',
          subIndustryNx: '',
        });
      }
      return acc;
    }, []);

    this.logger.info(`[DATA_PROCESSOR_SERVICE] :: Fetched Industries`);
    return industriesResult;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_SERVICE] :: Error In Fetching Industries error :: {${error}}`,
    );
    throw Error(error);
  }
}

async function getIndustryData(industry) {
  const industryData = await Industry.findOne({
    where: { industry },
    raw: true,
  });

  return industryData;
}

async function createIndustry(industryData) {
  await Industry.create(industryData);
}

async function updateIndustry(industryToSearch, oldData, newData) {
  if (
    oldData.industry === newData.industry &&
    oldData.industryNx === newData.industryNx &&
    oldData.subIndustryNx === newData.subIndustryNx
  ) {
    return null;
  }
  const res = await Industry.update(newData, {
    where: {
      industry: industryToSearch,
    },
    returning: true,
    plain: true,
    raw: true,
  });

  const [, industry] = res;

  const processedIndustry = formatIndustryData(industry);

  return processedIndustry;
}

/**
 *
 * mandatory fields for update & create industry & industryNx
 *
 */

async function postIndustries(industries) {
  const industriesResult = {
    failedRecords: {
      data: [],
    },
    existingMappingRecords: {
      data: [],
    },
    newMappingRecords: {
      data: [],
    },
  };

  try {
    this.logger.info(`[DATA_PROCESSOR_SERVICE] :: START :: Post Industries`);

    let index;

    for (index = 0; index < industries.length; index += 1) {
      const industryFromUser = cloneDeep(industries[index]);
      industryFromUser.industry = formatIndustry(industryFromUser.industry);
      industryFromUser.industryNx = formatIndustry(industryFromUser.industryNx);
      industryFromUser.subIndustryNx = formatIndustry(
        industryFromUser.subIndustryNx,
      );

      switch (true) {
        case !industryFromUser.industry || !industryFromUser.industryNx:
          industryFromUser.errMsg = 'Industry & IndustryNx Must Be Specified';
          industriesResult.failedRecords.data.push(industryFromUser);
          break;
        case !validIndustries.includes(industryFromUser.industryNx):
          industryFromUser.errMsg = 'Bad IndustryNx !';
          industriesResult.failedRecords.data.push(industryFromUser);
          break;
        case _.get(
          industrySubIndustryMapping,
          'industryFromUser.industry',
          '',
        ).includes(industryFromUser.subIndustryNx):
          industryFromUser.errMsg = 'Bad IndustryNx & SubIndustryNx !';
          industriesResult.failedRecords.data.push(industryFromUser);
          break;
        case !_.get(
          industrySubIndustryMapping,
          `${industryFromUser.industryNx}`,
          '',
        ).includes(industryFromUser.subIndustryNx):
          industryFromUser.errMsg =
            'The SubIndustryNx is not suitable for the given IndustryNx.';
          industriesResult.failedRecords.data.push(industryFromUser);
          break;
        default:
          const industryFromDB = await getIndustryData(
            industryFromUser.industry,
          );

          // create industry
          if (!industryFromDB) {
            await createIndustry(industryFromUser);

            industriesResult.newMappingRecords.data.push(industryFromUser);
          }
          // update industry
          else {
            await updateIndustry(
              industryFromUser.industry,
              industryFromDB,
              industryFromUser,
            );

            industriesResult.existingMappingRecords.data.push(industryFromUser);
          }
          break;
      }
    }

    this.logger.info(
      `[DATA_PROCESSOR_SERVICE] :: COMPLETED :: POST Industries`,
    );

    industriesResult.failedRecords.counts =
      industriesResult.failedRecords.data.length;

    industriesResult.existingMappingRecords.counts =
      industriesResult.existingMappingRecords.data.length;

    industriesResult.newMappingRecords.counts =
      industriesResult.newMappingRecords.data.length;

    return industriesResult;
  } catch (error) {
    this.logger.error(
      `[DATA_PROCESSOR_SERVICE] :: Error In  Updating/Creating industries error :: {${error}}`,
    );
    throw Error(error);
  }
}

IndustryService.prototype = {
  getIndustries,
  postIndustries,
};

module.exports = IndustryService;
