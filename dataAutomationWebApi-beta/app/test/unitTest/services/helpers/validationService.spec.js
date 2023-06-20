const {
    expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const settingsConfig = {
    logger: {
        info: () => {},
        debug: () => {},
        error: () => {},
        warn: () => {},
    },
};

const ValidationService = proxyquire('../../../../services/helpers/validationService', {
    '../../config/settings/settings-config': settingsConfig,
});

const validationService = new ValidationService();

describe('#validationService - removeNullKeysInObj', () => {
    context('Removes key with null values from the object', () => {
        it('Should remove all the properties having null values from the object', (done) => {
            const obj = {
                name: null,
                address: 'address',
                city: 'city',
                state: '',
                country: 'country'
            }
            const actualData = validationService.removeNullKeysInObj(obj);
            const expectedData = {
                address: 'address',
                city: 'city',
                state: '',
                country: 'country',
            }
            expect(actualData).to.deep.equal(expectedData);
            done();
        });
    });
});

describe('#validationService - validateObj', function () {
    context('Validates the object', () => {
        it('Should return the array of mandatory properties that are missing in an object', (done) => {
            const obj = {
                name: null,
                address: 'address',
                city: 'city',
                state: '',
                country: 'country'
            }
            const requiredKeys = ['name', 'address', 'city', 'state', 'country', 'phone'];
            const actualData = validationService.validateObj(obj, requiredKeys);
            const expectedData = ['phone'];
            expect(actualData).to.deep.equal(expectedData);
            done();
        });
    });
})