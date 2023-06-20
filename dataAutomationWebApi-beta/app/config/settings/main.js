const convict = require('convict');
const convictFormatWithValidator = require('convict-format-with-validator');
const convictFormatWithMoment = require('convict-format-with-moment');

// Add the "email", "ipaddress" or "url" format
convict.addFormats(convictFormatWithValidator);

// Add "duration" or "timestamp" format
convict.addFormats(convictFormatWithMoment);

module.exports = convict({
  thisnode: {
    hostName: {
      doc: 'Data Automation Web API.',
      format: 'ipaddress',
      default: '127.0.0.1',
      env: 'DATA_AUTOMATION_API_IP_ADDRESS',
    },
    port: {
      doc: 'Data Automation Web API worker port. This is the port that external services will talk to the API.',
      format: 'port',
      default: '20100',
      env: 'PORT',
    },
    name: {
      doc: 'Data Automation Web API server name',
      format: String,
      default: 'Data Automation WebAPI',
      env: 'DATA_AUTOMATION_API_NAME',
    },
    version: {
      doc: 'Data Automation Web API version',
      format: String,
      default: '1.0.0',
      env: 'DATA_AUTOMATION_API_VERSION',
    },
  },
  environment: {
    doc: 'environment',
    format: ['production', 'development', 'test', 'beta'],
    default: 'development',
    env: 'NODE_ENV',
  },
  DEBUG: {
    doc: 'Debug flag',
    format: Boolean,
    default: true,
    env: 'DATA_AUTOMATION_API_DEBUG',
  },
  Error: {
    doc: 'Error level enumeration.',
    format: Object,
    default: {
      IGNORE: 0,
      NORMAL: 1,
      CRITICAL: 2,
    },
  },
  supressLogstash: {
    doc: 'suppress connecting to log-stash server',
    format: Boolean,
    default: true,
    env: 'RIGHT_LEADS_API_SUPPRESS_LOG_STASH',
  },
  logger: {
    ip: {
      doc: 'Logger IP address.',
      format: String,
      default: '127.0.0.1',
      env: 'LOGGER_IP_ADDRESS',
    },
    port: {
      doc: 'Logger port.',
      format: 'port',
      default: 24224,
      env: 'LOGGER_PORT',
    },
    tag: {
      dataAutomationApi: {
        doc: 'fluent label for dataAutomationApi.',
        format: String,
        default: 'dataAutomationApi',
        env: 'LOGGER_TAG_DATA_AUTOMATION',
      },
      node: {
        doc: 'fluent tag for node components.',
        format: String,
        default: 'node',
        env: 'LOGGER_TAG_NODE',
      },
    },
  },
  integrations: {
    zb: {
      validateUrlTpl: {
        doc: 'zero bounce validate endpoint',
        format: String,
        default:
          'https://api.zerobounce.net/v2/validate?api_key=<%= apiKey %>&email=<%= email %>&ip_address=<%= ipAddress %>',
        env: 'DATA_AUTOMATION_ZB_VALIDATE_TPL',
      },
      apiKey: {
        doc: 'zero bounce api key',
        format: String,
        default: '78108610308a40e3917192b276ac939b', // remove from this file and store in terraform
        env: 'DATA_AUTOMATION_ZB_API_KEY',
      },
    },
  },
});
