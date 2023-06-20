/* eslint-disable global-require */
const _ = require('lodash');
const dot = require('dot-object');
const RawQuery = require('@nexsalesdev/dataautomation-datamodel/lib/services/rawQuery');

function PreviewService() {
  const Sanitizer = require('../commonServices/sanitizer');

  this.sanitizer = new Sanitizer();
  this.rawQuery = new RawQuery();
}

function renameHeaders(row, headerNameMapping) {
  const keyValues = Object.keys(row).map((key) => {
    const newKey = headerNameMapping[key] || key;
    return { [newKey]: row[key] || '' };
  });
  return Object.assign({}, ...keyValues);
}

function formatePreviewRow(_row) {
  let row = _.cloneDeep(_row);
  row = dot.dot(dot.object(row));

  // Contact Address
  row['address.street1'] = row['address.street1'] || row['address.address1'];
  row['address.street2'] = row['address.street2'] || row['address.address2'];

  const headerNameMapping = {
    'address.street1': 'address1',
    'address.street2': 'address2',
    'address.city': 'city',
    'address.state': 'state',
    'address.zipCode': 'zip',
    'address.country': 'country',
    'addressHQ.address1HQ': 'address1HQ',
    'addressHQ.address2HQ': 'address2HQ',
    'addressHQ.cityHQ': 'cityHQ',
    'addressHQ.stateHQ': 'stateHQ',
    'addressHQ.zipCodeHQ': 'zipHQ',
    'addressHQ.countryHQ': 'countryHQ',
  };

  // remove extra column
  delete row.count;

  row = renameHeaders(row, headerNameMapping);
  return row;
}

function getOrderForPreviewSort(sort) {
  let sortColumnName = Object.keys(sort)[0];
  const sortValue = sort[sortColumnName];

  const defaultOrder = `"date" Desc`;
  if (!sortColumnName) return defaultOrder;

  const sortColumnMapping = {
    address1: `"address"->>'street1'`,
    address2: `"address"->>'street2'`,
    city: `"address"->>'city'`,
    state: `"address"->>'state'`,
    zip: `"address"->>'zipCode'`,
    country: `"address"->>'country'`,
    address1HQ: `"addressHQ"->>'address1HQ'`,
    address2HQ: `"addressHQ"->>'address2HQ'`,
    cityHQ: `"addressHQ"->>'cityHQ'`,
    stateHQ: `"addressHQ"->>'stateHQ'`,
    zipHQ: `"addressHQ"->>'zipCodeHQ'`,
    countryHQ: `"addressHQ"->>'countryHQ'`,
  };

  sortColumnName = sortColumnMapping[sortColumnName] || `"${sortColumnName}"`;

  if (sortColumnName === 'date') return `${sortColumnName} ${sortValue}`;

  return `${sortColumnName} ${sortValue}, ${defaultOrder}`;
}

function getWhereForPreviewFilter(filter) {
  const filterColumnName = Object.keys(filter)[0];
  const defaultWhere = `"accountDisposition" IS NOT NULL OR "contactDisposition" IS NOT NULL`;

  if (!filterColumnName) return defaultWhere;

  const filterValue = filter[filterColumnName];
  const whereConditionOfFilter = {
    date: `(${defaultWhere}) AND DATE("date") = '${filterValue}'`,
    projectName: `(${defaultWhere}) AND "projectName" = '${filterValue}'`,
    email: `(${defaultWhere}) AND "email" = '${filterValue}'`,
    researchStatus: `"researchStatus" = '${filterValue}'`,
    accountDisposition: `"accountDisposition" = '${filterValue}'`,
    contactDisposition: `"contactDisposition" = '${filterValue}'`,
  };
  return _.get(whereConditionOfFilter, filterColumnName, defaultWhere);
}

async function getPreview(inputs, filter, sort) {
  const { userId, limit, offset } = inputs;

  const where = getWhereForPreviewFilter(filter);
  const order = getOrderForPreviewSort(sort);

  const agentPreviewList = await this.rawQuery.getAgentPreview(
    userId,
    where,
    order,
    limit,
    offset,
  );

  const response = {
    count: 0,
    rows: [],
  };

  if (agentPreviewList.length) {
    if (agentPreviewList[0].count)
      response.count = parseInt(agentPreviewList[0].count, 10);

    for (let index = 0; index < agentPreviewList.length; index += 1) {
      const row = agentPreviewList[index];
      const formattedRow = formatePreviewRow(row);
      response.rows.push(formattedRow);
    }
  }
  return response;
}

PreviewService.prototype = {
  getPreview,
};
module.exports = PreviewService;
