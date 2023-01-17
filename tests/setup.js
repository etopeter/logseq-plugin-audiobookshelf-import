//global.fetch = require('jest-fetch-mock');
global.logseq = {
  ...logseq,
  settings: {
    debug: ["index"],
  },
  UI: {
    showMsg: function (message) {
      return message;
    },
  },
};
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
