const csv = require('fast-csv');

function FileStreamService() {}

function getWriteStream(convertCsvFunc) {
  const csvWriteStream = csv
    .format({
      headers: true,
    })
    .transform(convertCsvFunc);
  return csvWriteStream;
}
FileStreamService.prototype = {
  getWriteStream,
};

module.exports = FileStreamService;
