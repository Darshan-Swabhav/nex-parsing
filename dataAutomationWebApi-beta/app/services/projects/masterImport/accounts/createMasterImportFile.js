const { serializeError } = require('serialize-error');
const { Storage } = require('@google-cloud/storage');

const csv = require('fast-csv');

const storage = new Storage();

function generateMasterImportFile(inputs) {
  const { jobId, fileData, location, logger } = inputs || {};

  return new Promise((resolve, reject) => {
    logger.debug(
      `[MASTER_IMPORT_FILE_GENERATOR] :: Generate MasterFile For JobId: ${jobId}`,
    );

    try {
      const bucketName = process.env.GCLOUD_STORAGE_PROCESS_FILE_BUCKET;
      const myBucket = storage.bucket(bucketName);
      const file = myBucket.file(location);
      const fileHeaders = Object.keys(fileData);

      // eslint-disable-next-line consistent-return
      file.exists((err, exists) => {
        if (err) {
          logger.error(
            `[MASTER_IMPORT_FILE_GENERATOR]: Error While Checking File Existence: Error: ${JSON.stringify(
              serializeError(err),
            )} { JobId: ${jobId} }`,
          );
          return reject(err);
        }

        if (exists) {
          logger.info(
            `[MASTER_IMPORT_FILE_GENERATOR]: Master Import File Already Exist, Skipping Master File Generation { JobId: ${jobId} }`,
          );
          return resolve();
        }

        const csvWriteStream = csv.format({
          headers: fileHeaders,
        });

        const gcpWriterStream = file
          .createWriteStream({
            metadata: {
              contentType: 'text/csv',
            },
          })
          .on('error', (error) => {
            logger.error(
              `[MASTER_IMPORT_FILE_GENERATOR] :: Could Not Create GCP Stream : ${JSON.stringify(
                serializeError(error),
              )} `,
            );
            reject(error);
          })
          .on('finish', () => {
            logger.info(
              `[MASTER_IMPORT_FILE_GENERATOR] :: Master Import File Generator ${location} uploaded to ${bucketName}`,
            );
            csvWriteStream.end();
            resolve();
          });

        csvWriteStream.pipe(gcpWriterStream);
        csvWriteStream.write(fileData);
        gcpWriterStream.end();
      });
    } catch (error) {
      logger.error(
        `[MASTER_IMPORT_FILE_GENERATOR] :: Could Not Generate Master Import File : ${JSON.stringify(
          serializeError(error),
        )} `,
      );
      reject(error);
    }
  });
}

module.exports = {
  generateMasterImportFile,
};
