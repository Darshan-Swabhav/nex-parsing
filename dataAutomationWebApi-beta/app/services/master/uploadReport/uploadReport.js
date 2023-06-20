/* eslint-disable no-param-reassign */
const { File, Job, sequelize } = require('@nexsalesdev/master-data-model');
const {
  UPLOAD_FILE_OPERATIONS,
} = require('@nexsalesdev/master-data-model/lib/services/constants');
const _ = require('lodash');
const settingsConfig = require('../../../config/settings/settings-config');
const AccountCRUDService = require('../accounts/accountsService');
const ContactCRUDService = require('../contacts/contactsService');
const LocationService = require('../location/locationsService');

function UploadReportService() {
  const config = settingsConfig.settings || {};
  this.config = config;
  this.logger = settingsConfig.logger || console.log;

  this.accountCRUDService = new AccountCRUDService();
  this.contactCRUDService = new ContactCRUDService();
  this.locationService = new LocationService();
}

const getUploadAttributes = [
  [sequelize.literal(`count(*) over()`), 'totalCounts'],
  [sequelize.literal(`"Job"."createdAt"::timestamp::date`), 'jobCreatedAt'],
  [sequelize.col('Job.createdBy'), 'jobCreatedBy'],
  [sequelize.col('File.source'), 'fileSource'],
  [sequelize.fn('COUNT', sequelize.col('File.id')), 'fileCount'],
  [sequelize.fn('sum', sequelize.col('Job.processed')), 'totalProcessed'],
  [sequelize.fn('sum', sequelize.col('Job.imported')), 'totalImported'],
  [sequelize.fn('sum', sequelize.col('Job.errored')), 'totalErrored'],
];

async function getUploadReports(input) {
  const { offset, limit, operationName, attributes, order } = input;
  const res = await Job.findAll({
    attributes,
    include: {
      model: File,
      attributes: [],
      required: true,
    },
    where: { operationName },
    group: ['jobCreatedAt', 'jobCreatedBy', 'fileSource'],
    order,
    offset,
    limit,
    raw: true,
  });

  return res;
}

async function getAccountsUploadReports(input) {
  const { pagination } = input;
  const { limit, offset } = pagination;
  const res = {};
  const attributes = _.cloneDeep(getUploadAttributes);
  const order = [
    ['jobCreatedAt', 'DESC'],
    ['beforeUploadLocationCounts', 'DESC'],
  ];

  attributes.push([
    sequelize.literal(
      `(array_agg("Job"."operationParam" -> 'beforeUploadAccountCounts' order by "Job"."operationParam" ->> 'beforeUploadAccountCounts' NULLS LAST))[1]::TEXT::INTEGER`,
    ),
    'beforeUploadAccountCounts',
  ]);

  attributes.push([
    sequelize.literal(
      `(array_agg("Job"."operationParam" -> 'beforeUploadLocationCounts'order by "Job"."operationParam" ->> 'beforeUploadLocationCounts' NULLS LAST))[1]::TEXT::INTEGER `,
    ),
    'beforeUploadLocationCounts',
  ]);

  const data = await getUploadReports({
    offset,
    limit,
    operationName: UPLOAD_FILE_OPERATIONS.ACCOUNT_IMPORT,
    attributes,
    order,
  });

  res.rows = data;

  if (data.length) {
    res.count = data[0].totalCounts;
  }

  res.totalAccountCounts = await this.accountCRUDService.getAccountCounts();
  res.totalAccountLocationCounts =
    await this.locationService.getLocationCounts();

  data.forEach((element) => {
    if (_.has(element.totalCounts)) {
      delete element.totalCounts;
    }
  });

  return res;
}

async function getContactsUploadReports(input) {
  const { pagination } = input;
  const { limit, offset } = pagination;
  const res = {};
  const attributes = _.cloneDeep(getUploadAttributes);
  const order = [
    ['jobCreatedAt', 'DESC'],
    ['beforeUploadContactCounts', 'DESC'],
  ];

  attributes.push([
    sequelize.literal(
      `(array_agg("Job"."operationParam" -> 'beforeUploadContactCounts' order by "Job"."operationParam" ->> 'beforeUploadContactCounts' NULLS LAST))[1]::TEXT::INTEGER `,
    ),
    'beforeUploadContactCounts',
  ]);

  const data = await getUploadReports({
    offset,
    limit,
    operationName: UPLOAD_FILE_OPERATIONS.CONTACT_IMPORT,
    attributes,
    order,
  });

  res.rows = data;

  if (data.length) {
    res.count = data[0].totalCounts;
  }

  res.totalContactCounts = await this.contactCRUDService.getContactsCounts();

  data.forEach((element) => {
    if (_.has(element.totalCounts)) {
      delete element.totalCounts;
    }
  });

  return res;
}

UploadReportService.prototype = {
  getAccountsUploadReports,
  getContactsUploadReports,
};

module.exports = UploadReportService;
