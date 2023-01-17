// setupJestMock.js/* global jest */

const logseqMock = jest
  .fn(() => "settings")
  .mockImplementation(() => {
    debug: ["index"];
  });

global.logseq = jest.fn(() => logseqMock);
