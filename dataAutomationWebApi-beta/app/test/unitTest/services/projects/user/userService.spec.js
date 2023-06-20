const {
    expect
} = require('chai');
const sinon = require('sinon');
const {
    inspect
} = require('util');
const proxyquire = require('proxyquire');
const {
    ProjectUser,
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

const UserService = proxyquire('../../../../../services/projects/user/userService', {
    '../../../config/settings/settings-config': settingsConfig,
});
const userService = new UserService();

let projectUserDestroy, projectUserCreate, dateStub;

describe('userService - deleteProjectUser', () => {
    beforeEach(() => {
        projectUserDestroy = sinon.stub(ProjectUser, 'destroy');
    })
    afterEach(function () {
        projectUserDestroy.restore();
    })
    describe('Delete all users of a project', () => {
        context('Destroy a project users', function () {
            it('Should successfully destroy all users of a project when correct params are passed', function (done) {
                const inputs = {
                    projectId: '01',
                }
                projectUserDestroy.returns('User Deleted Successfully');
                userService.deleteProjectUser(inputs)
                    .then(function (result) {
                        const actual = result;
                        const expected = 'User Deleted Successfully';
                        expect(actual).to.equal(expected);

                        const actualProjectUserDestroyArgs = projectUserDestroy.getCall(0).args;
                        const expectedProjectUserDestroyArgs = {
                            where: {
                                [Op.and]: [
                                    // {
                                    //   UserId: projectUserId
                                    // },
                                    {
                                        ProjectId: inputs.projectId,
                                    },
                                ],
                            },
                        }
                        expect(inspect(actualProjectUserDestroyArgs[0], {
                            depth: null
                        })).to.deep.equal(inspect(expectedProjectUserDestroyArgs, {
                            depth: null
                        }), 'Expected value not passed in destroy project user function');
                        expect(actualProjectUserDestroyArgs.length).to.equal(Object.keys(expectedProjectUserDestroyArgs).length, 'Expected value not passed in destroy project user function');
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    })
            })

            it('Should throw error when something internally fails while deleting all users of a project', function (done) {
                const inputs = {
                    projectId: '01',
                }
                projectUserDestroy.throws(new Error('Something went wrong'))
                userService.deleteProjectUser(inputs)
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
            })
        })
    })
})

describe('userService - createProjectUser', () => {
    beforeEach(() => {
        const now = new Date();
        dateStub = sinon.stub(Date, 'now').returns(now);
        projectUserCreate = sinon.stub(ProjectUser, 'create');
    })
    afterEach(function () {
        projectUserCreate.restore();
        dateStub.restore();
    })

    //[To_Do] :: Transaction to add into input
    // describe('Create all users of a project', () => {
    //     context('Create a project users', function () {
    //         it('Should successfully create all users of a project when correct params are passed', function (done) {
    //             const inputs = {
    //                 projectId: '01',
    //                 userLevel: 'owner_assigned',
    //                 createdAt: new Date(Date.now()),
    //                 updatedAt: new Date(Date.now()),
    //                 projectUserId: '001',
    //                 createdBy: '001',
    //                 updatedBy: '001',
    //                 userRoles: ['manager'],
    //             }
    //             projectUserCreate.returns('User Created Successfully');
    //             userService.createProjectUser(inputs)
    //                 .then(function (result) {
    //                     const actual = result;
    //                     const expected = 'User Created Successfully';
    //                     expect(actual).to.equal(expected);

    //                     const actualProjectUserCreateArgs = projectUserCreate.getCall(0).args;
    //                     const expectedProjectUserCreateArgs = [{
    //                         userLevel: inputs.userLevel,
    //                         createdAt: inputs.createdAt,
    //                         updatedAt: inputs.updatedAt,
    //                         ProjectId: inputs.projectId,
    //                         UserId: inputs.projectUserId,
    //                         createdBy: inputs.createdBy,
    //                         updatedBy: inputs.updatedBy,
    //                     },{ transaction }];
    //                     expect(inspect(actualProjectUserCreateArgs[0], {
    //                         depth: null
    //                     })).to.deep.equal(inspect(expectedProjectUserCreateArgs, {
    //                         depth: null
    //                     }), 'Expected value not passed in create project user function');
    //                     expect(actualProjectUserCreateArgs.length).to.equal([expectedProjectUserCreateArgs].length, 'Expected value not passed in create project user function');
    //                     done();
    //                 })
    //                 .catch(function (err) {
    //                     done(err);
    //                 })
    //         })

    //         it('Should throw error when something internally fails while creating all users of a project', function (done) {
    //             const inputs = {
    //                 projectId: '01',
    //                 userLevel: 'owner_assigned',
    //                 createdAt: new Date(Date.now()),
    //                 updatedAt: new Date(Date.now()),
    //                 projectUserId: '001',
    //                 createdBy: '001',
    //                 updatedBy: '001',
    //                 userRoles: ['manager'],
    //             }
    //             projectUserCreate.throws(new Error('Something went wrong'))
    //             userService.createProjectUser(inputs)
    //                 .then(function (result) {
    //                     const error = new Error('This function could not throw expected error');
    //                     done(error);
    //                 })
    //                 .catch(function (err) {
    //                     const actualErrorMsg = err.message;
    //                     const expectedErrorMsg = 'Something went wrong'
    //                     expect(actualErrorMsg).to.equal(expectedErrorMsg);
    //                     done();
    //                 })
    //                 .catch(function (err) {
    //                     done(err);
    //                 })
    //         })
    //     })
    // })
})
