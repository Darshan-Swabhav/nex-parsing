const {
    expect
} = require('chai');
const sinon = require('sinon');
const {
    inspect
} = require('util');
const proxyquire = require('proxyquire');
const {
    User,
    JobError,
    Job,
    Contact,
    Account,
    FileChunk,
    File,
    ProjectSetting,
    ProjectSpec,
    Task,
    TaskAllocationTemp,
    ProjectUser,
    Project,
    Sequelize,
    sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');

const {
    Op
} = Sequelize;

const settingsConfig = {
    logger: {
        info: () => {},
        debug: () => {},
        error: () => {},
        warn: () => {},
    },
};

const accountPotentialBuilderServiceInstanceStub = {
    setProjectId: sinon.stub(),
    accountsPotentialBuilderForAProject: sinon.stub(),
};

const AccountPotentialBuilderServiceStub = sinon.stub().returns(accountPotentialBuilderServiceInstanceStub);

const SettingService = proxyquire('../../../../../services/projects/setting/settingService', {
    '../../../config/settings/settings-config': settingsConfig,
    '@nexsalesdev/dataautomation-datamodel/lib/services/accountsPotentialBuilder': AccountPotentialBuilderServiceStub,
});
const settingService = new SettingService();

let projectSettingFindOne, dateStub, updateAccountsPotentialCountsOfAProject;

describe('settingService - getStatusEnums', function () {
    context('Returns status list', function () {
        it('Should return list of status', (done) => {
            const expectedData = ['Yet to Start', 'Active', 'On Hold', 'Completed'];
            const acualData = settingService.getStatusEnums();
            expect(acualData).to.deep.equal(expectedData);
            done();
        })
    });
});

describe('settingService - getPriorityEnums', function () {
    context('Returns priority list', function () {
        it('Should return list of priority', (done) => {
            const expectedData = ['High', 'Medium', 'Low'];
            const acualData = settingService.getPriorityEnums();
            expect(acualData).to.deep.equal(expectedData);
            done();
        })
    });
});

describe('settingService - editProjectSetting', function () {
    beforeEach(function () {
        const now = new Date();
        dateStub = sinon.stub(Date, 'now').returns(now);
        projectSettingFindOne = sinon.stub(ProjectSetting, 'findOne');
        updateAccountsPotentialCountsOfAProject = sinon.stub(settingService, 'updateAccountsPotentialCountsOfAProject');
    })
    afterEach(function () {
        dateStub.restore();
        projectSettingFindOne.restore();
        updateAccountsPotentialCountsOfAProject.restore();
    })
    describe('Update project settings info', function () {
        context('Modify project settings info', function () {
            it('Should throw error when no project settings is found', (done) => {
                const inputs = {};
                inputs.target = {
                    contact: '10',
                    account: '1',
                };
                inputs.contactsPerAccount = '10';
                inputs.clientPoc = 'poc';
                inputs.priority = 'High';
                inputs.status = 'Completed';
                inputs.updatedAt = new Date(Date.now());
                inputs.updatedBy = '001';
                inputs.projectId = '01';

                projectSettingFindOne.returns(null);

                settingService.editProjectSetting(inputs)
                    .then(function (result) {
                        const error = new Error('This function could not throw expected error');
                        done(error);
                    })
                    .catch(function (err) {
                        const actualErrorMsg = err.message;
                        const expectedErrorMsg = `Project Settings Not Found For Project ${inputs.projectId}`
                        expect(actualErrorMsg).to.equal(expectedErrorMsg);
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    })
            });

            it('Should update project setting successfully when correct params are passed', (done) => {
                const inputs = {};
                inputs.target = {
                    contact: '10',
                    account: '1',
                };
                inputs.contactsPerAccount = '10';
                inputs.clientPoc = 'poc';
                inputs.priority = 'High';
                inputs.status = 'Completed';
                inputs.updatedAt = new Date(Date.now());
                inputs.updatedBy = '001';
                inputs.projectId = '01';

                projectSettingFindOne.returns({
                    projectId: '01',
                    contactsPerAccount: '9',
                    save: sinon.stub(),
                });

                updateAccountsPotentialCountsOfAProject.returns('Potential Update Successfully');

                settingService.editProjectSetting(inputs)
                    .then(function (result) {
                        const actualData = result;
                        const expectedData = {
                            projectId: '01',
                            contactsPerAccount: '10',
                            save: sinon.stub(),
                            target: {
                                contact: '10',
                                account: '1'
                            },
                            clientPoc: 'poc',
                            priority: 'High',
                            status: 'Completed',
                            updatedAt: new Date(Date.now()),
                            updatedBy: '001'
                        }
                        expect(inspect(actualData, {
                            depth: null
                        })).to.deep.equal(inspect(expectedData, {
                            depth: null
                        }));

                        const actualUpdateAccountsPotentialCountsOfAProjectArgs = updateAccountsPotentialCountsOfAProject.getCall(0).args[0];
                        const actualUpdateAccountsPotentialCountsOfAProjectArgsLength = updateAccountsPotentialCountsOfAProject.getCall(0).args.length;
                        const expectedUpdateAccountsPotentialCountsOfAProjectArgs = {
                            projectId: '01',
                        }
                        expect(actualUpdateAccountsPotentialCountsOfAProjectArgs).to.equal(expectedUpdateAccountsPotentialCountsOfAProjectArgs.projectId, 'Expected value not passed in update account potential count function');
                        expect(actualUpdateAccountsPotentialCountsOfAProjectArgsLength).to.equal(Object.keys(expectedUpdateAccountsPotentialCountsOfAProjectArgs).length, 'Expected value not passed in update account potential count function');
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    })
            });

            it('Should throw error when instance saving fails internally', (done) => {
                const inputs = {};
                inputs.target = {
                    contact: '10',
                    account: '1',
                };
                inputs.contactsPerAccount = '10';
                inputs.clientPoc = 'poc';
                inputs.priority = 'High';
                inputs.status = 'Completed';
                inputs.updatedAt = new Date(Date.now());
                inputs.updatedBy = '001';
                inputs.projectId = '01';

                projectSettingFindOne.returns({
                    projectId: '01',
                    contactsPerAccount: '9',
                    save: sinon.stub().throws(new Error('Something went wrong')),
                });

                updateAccountsPotentialCountsOfAProject.returns('Potential Update Successfully');

                settingService.editProjectSetting(inputs)
                    .then(function (result) {
                        const error = new Error('This function could not throw expected error');
                        done(error);
                    })
                    .catch(function (err) {
                        const actualErrorMsg = err.message;
                        const expectedErrorMsg = 'Something went wrong'
                        expect(actualErrorMsg).to.equal(expectedErrorMsg);
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    })
            });

            it('Should throw error when someting fails internally while updating accounts potential counts', (done) => {
                const inputs = {};
                inputs.target = {
                    contact: '10',
                    account: '1',
                };
                inputs.contactsPerAccount = '10';
                inputs.clientPoc = 'poc';
                inputs.priority = 'High';
                inputs.status = 'Completed';
                inputs.updatedAt = new Date(Date.now());
                inputs.updatedBy = '001';
                inputs.projectId = '01';

                projectSettingFindOne.returns({
                    projectId: '01',
                    contactsPerAccount: '9',
                    save: sinon.stub(),
                });

                updateAccountsPotentialCountsOfAProject.throws(new Error('Something went wrong'));

                settingService.editProjectSetting(inputs)
                    .then(function (result) {
                        const error = new Error('This function could not throw expected error');
                        done(error);
                    })
                    .catch(function (err) {
                        const actualErrorMsg = err.message;
                        const expectedErrorMsg = 'Something went wrong'
                        expect(actualErrorMsg).to.equal(expectedErrorMsg);
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    })
            });

            it('Should not update accounts potential counts when contacts per account does not change', (done) => {
                const inputs = {};
                inputs.target = {
                    contact: '10',
                    account: '1',
                };
                inputs.contactsPerAccount = '10';
                inputs.clientPoc = 'poc';
                inputs.priority = 'High';
                inputs.status = 'Completed';
                inputs.updatedAt = new Date(Date.now());
                inputs.updatedBy = '001';
                inputs.projectId = '01';

                projectSettingFindOne.returns({
                    projectId: '01',
                    contactsPerAccount: '10',
                    save: sinon.stub(),
                });

                updateAccountsPotentialCountsOfAProject.returns('Project Updated Successfully');

                settingService.editProjectSetting(inputs)
                    .then(function (result) {
                        expect(updateAccountsPotentialCountsOfAProject.notCalled).to.equal(true);
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    })
            });
        });
    });
})

describe('settingService - updateAccountsPotentialCountsOfAProject', function () {
    beforeEach(function () {
        accountPotentialBuilderServiceInstanceStub.setProjectId = sinon.stub();
        accountPotentialBuilderServiceInstanceStub.accountsPotentialBuilderForAProject = sinon.stub();
    })
    afterEach(function () { 
        accountPotentialBuilderServiceInstanceStub.setProjectId  = sinon.stub();
        accountPotentialBuilderServiceInstanceStub.accountsPotentialBuilderForAProject  = sinon.stub();
    })
    describe('Update potential counts of a project', function () {
        context('Modify potential counts of all accounts of a project', function () {
            it ('Should successfully update potential counts of all accounts of a project when correct params are passed', function (done) {
                const projectId = '01';
                settingService.updateAccountsPotentialCountsOfAProject(projectId)
                .then(function (result) {
                    const actual = result;
                    const expected = undefined;
                    expect(actual).to.equal(expected);

                    const actualSetProjectIdArgs = accountPotentialBuilderServiceInstanceStub.setProjectId.getCall(0).args[0];
                    const actualSetProjectIdArgsLength = accountPotentialBuilderServiceInstanceStub.setProjectId.getCall(0).args.length;
                    expect(actualSetProjectIdArgs).to.equal(projectId);
                    expect(actualSetProjectIdArgsLength).to.equal([projectId].length);

                    const actualAccountsPotentialBuilderForAProjectArgs = accountPotentialBuilderServiceInstanceStub.accountsPotentialBuilderForAProject.getCall(0).args;
                    expect(actualAccountsPotentialBuilderForAProjectArgs).to.deep.equal([]);
                    expect(actualAccountsPotentialBuilderForAProjectArgs.length).to.equal([].length);
                    done();
                })
                .catch(function(err) {
                    done(err);
                })
            });

            it ('Should handle thrown error when something internally fails while setting project id', function (done) {
                const projectId = '01';
                accountPotentialBuilderServiceInstanceStub.setProjectId.throws(new Error('Something went wrong'))
                settingService.updateAccountsPotentialCountsOfAProject(projectId)
                .then(function (result) {
                    const actualData = result;
                    const expectedData = undefined;
                    expect(actualData).to.deep.equal(expectedData);
                    done();
                })
                .catch(function(err) {
                    done(err);
                })
            });

            it ('Should handle thrown error when something internally fails while calculation account potential for all accounts of a project', function (done) {
                const projectId = '01';
                accountPotentialBuilderServiceInstanceStub.accountsPotentialBuilderForAProject.throws(new Error('Something went wrong'))
                settingService.updateAccountsPotentialCountsOfAProject(projectId)
                .then(function (result) {
                    const actualData = result;
                    const expectedData = undefined;
                    expect(actualData).to.deep.equal(expectedData);
                    done();
                })
                .catch(function(err) {
                    done(err);
                })
            });
        });
    });
})