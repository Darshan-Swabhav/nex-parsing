const {
  sequelize,
  ProjectSpec,
} = require('@nexsalesdev/dataautomation-datamodel');
const _ = require('lodash');
const settingsConfig = require('../../../config/settings/settings-config');

function JobTitleCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAllExcludedJobTitles(inputs) {
  const { projectId } = inputs;

  const specsWiseExclusionTitles = await ProjectSpec.findAll({
    attributes: [
      [sequelize.json('values.excluded_job_title'), 'excludedJobTitles'],
    ],
    where: [
      {
        ProjectId: projectId,
      },
    ],
    raw: true,
  });

  let combinedExclusionJobTitles = [];

  _.each(specsWiseExclusionTitles, (singleSpecExclusionTitles) => {
    let exclusionList = singleSpecExclusionTitles.excludedJobTitles;
    if (_.isString(exclusionList)) {
      exclusionList = JSON.parse(exclusionList);
    }
    combinedExclusionJobTitles = _.concat(
      combinedExclusionJobTitles,
      exclusionList,
    );
  });

  combinedExclusionJobTitles = _.compact(_.uniq(combinedExclusionJobTitles));

  return combinedExclusionJobTitles;
}

JobTitleCRUDService.prototype = {
  getAllExcludedJobTitles,
};

module.exports = JobTitleCRUDService;
