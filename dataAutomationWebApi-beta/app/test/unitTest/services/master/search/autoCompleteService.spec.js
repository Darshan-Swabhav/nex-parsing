const {
  expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const {
  loggerMock
} = require('../../../../helper');

const settingsConfig = {
  logger: loggerMock,
  settings: {}
};

const AutoCompleteService = proxyquire(
  './../../../../../services/master/search/autoCompleteService', {
    '../../../config/settings/settings-config': settingsConfig,
  }
);

const autoCompleteServiceModule = new AutoCompleteService();
let search;

describe('#autoCompleteService - search', function () {
  context('Fetches filtered list of results', function () {
    it('should return list as it is when no param is specified', function (done) {
      const param = '';
      const array = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx'];
      const comparisonKey = '';
      const results = autoCompleteServiceModule.search(param, array, comparisonKey);
      const expectedData = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx'];
      expect(results).to.deep.equal(expectedData);
      done();
    })

    it('should return filtered list as it is when param is specified', function (done) {
      const param = 'a';
      const array = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx'];
      const comparisonKey = '';
      const results = autoCompleteServiceModule.search(param, array, comparisonKey);
      const expectedData = ['abc'];
      expect(results).to.deep.equal(expectedData);
      done();
    })

    it('should return filtered list as it is when param and comparisonKey are specified', function(done) {
      const param = 'a';
      const array = [{id: 1, name: 'abc'}, {id: 2, name:'def'}];
      const comparisonKey = 'name';
      const results = autoCompleteServiceModule.search(param, array, comparisonKey);
      const expectedData = [{id: 1, name: 'abc'}];
      expect(results).to.deep.equal(expectedData);
      done();
    })
  })
})

describe('#autoCompleteService - filterDataDictionary', function () {
  context('Fetches filtered list of results', function () {
    it('should return list as it is when no param and filter by are specified', function (done) {
      const param = '';
      const data = [];
      const filterBy = {
        "Aerospace and Defense": [
          "Aircraft Engine and Parts Manufacturing",
          "Aircraft Manufacturing",
          "Guided Missile and Space Vehicle Manufacturing",
          "Space Research and Technology",
          "Weapons and Ammunition Manufacturing"
        ],
      };
      const results = autoCompleteServiceModule.filterDataDictionary(param, data, filterBy);
      const expectedData = ["Aircraft Engine and Parts Manufacturing", "Aircraft Manufacturing", "Guided Missile and Space Vehicle Manufacturing", "Space Research and Technology", "Weapons and Ammunition Manufacturing"];
      expect(results).to.deep.equal(expectedData);
      done();
    })

    it('should return only filter by list when only filter by is specified', function (done) {
      const param = '';
      const data = ["Aerospace and Defense"];
      const filterBy = {
        "Aerospace and Defense": [
          "Aircraft Engine and Parts Manufacturing",
          "Aircraft Manufacturing",
          "Guided Missile and Space Vehicle Manufacturing",
          "Space Research and Technology",
          "Weapons and Ammunition Manufacturing"
        ],
        "Biotechnology, Pharmaceuticals and Medicine": [
          "Pharmaceutical Manufacturing"
        ],
      };
      const results = autoCompleteServiceModule.filterDataDictionary(param, data, filterBy);
      const expectedData = ["Aircraft Engine and Parts Manufacturing", "Aircraft Manufacturing", "Guided Missile and Space Vehicle Manufacturing", "Space Research and Technology", "Weapons and Ammunition Manufacturing"];
      expect(results).to.deep.equal(expectedData);
      done();
    })
  })

  context('Fetches filtered list of results as per params', function () {
    beforeEach(function () {
      search = sinon.stub(autoCompleteServiceModule, 'search');
    })
    it('should return only filter by list containing param when filter by and param is specified', function (done) {
      const param = 'Aircraft';
      const data = ["Aerospace and Defense"];
      const filterBy = {
        "Aerospace and Defense": [
          "Aircraft Engine and Parts Manufacturing",
          "Aircraft Manufacturing",
          "Guided Missile and Space Vehicle Manufacturing",
          "Space Research and Technology",
          "Weapons and Ammunition Manufacturing"
        ],
        "Biotechnology, Pharmaceuticals and Medicine": [
          "Pharmaceutical Manufacturing"
        ],
      };
      search.returns(["Aircraft Engine and Parts Manufacturing", "Aircraft Manufacturing"])
      const results = autoCompleteServiceModule.filterDataDictionary(param, data, filterBy);
      const expectedData = ["Aircraft Engine and Parts Manufacturing", "Aircraft Manufacturing"];

      const actualSearchArgs = search.getCall(0).args;
      const expectedSearchArgs = [
        'Aircraft',
        [
          'Aircraft Engine and Parts Manufacturing',
          'Aircraft Manufacturing',
          'Guided Missile and Space Vehicle Manufacturing',
          'Space Research and Technology',
          'Weapons and Ammunition Manufacturing'
        ]
      ]
      expect(actualSearchArgs).to.deep.equal(expectedSearchArgs, 'Expected value not passed in search function');
      expect(actualSearchArgs.length).to.equal(expectedSearchArgs.length, 'Expected value not passed in search function');
      expect(results).to.deep.equal(expectedData);
      done();
    })
    it('should throw error when something internally fails while filtering data dictionary', function (done) {
      try {
        const param = 'Aircraft';
        const data = ["Aerospace and Defense"];
        const filterBy = {
          "Aerospace and Defense": [
            "Aircraft Engine and Parts Manufacturing",
            "Aircraft Manufacturing",
            "Guided Missile and Space Vehicle Manufacturing",
            "Space Research and Technology",
            "Weapons and Ammunition Manufacturing"
          ],
          "Biotechnology, Pharmaceuticals and Medicine": [
            "Pharmaceutical Manufacturing"
          ],
        };
        search.throws(new Error('Something went wrong'));
        autoCompleteServiceModule.filterDataDictionary(param, data, filterBy);
        const error = new Error('This function could not throw expected error');
        done(error);
      } catch (error) {
        const message = error.message;
        const expectedMessage = 'Something went wrong';
        expect(message).to.equal(expectedMessage);
        done();
      }
    })
    afterEach(function () {
      search.restore();
    })
  })
})

