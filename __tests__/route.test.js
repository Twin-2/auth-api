'use strict';

require('dotenv').config();
const supertest = require('supertest');
const { server } = require('../src/server.js');
const { db, food, clothes } = require('../src/models/index.js');

const mockRequest = supertest(server);

let users = {
    admin: { username: 'admin', password: 'password', role: 'admin' },
    editor: { username: 'editor', password: 'password', role: 'editor' },
    user: { username: 'user', password: 'password', role: 'user' },
};

let endPoints = [food, clothes]
let mockData = {
    food: { name: "banana", calories: 100, type: "fruit" },
    clothes: { name: "shirt", color: 'blue', size: "small" }
}

describe('Auth Router', () => {

    beforeAll(async (done) => {
        await db.sync();
        done();
    });
    afterAll(async (done) => {
        await db.drop();
        done();
    });

    Object.keys(users).forEach(userType => {

        describe(`${userType} users`, () => {

            it('can create one', async () => {
                const response = await mockRequest.post('/signup').send(users[userType]);
                const userObject = response.body;

                expect(response.status).toBe(201);
                expect(userObject.token).toBeDefined();
                expect(userObject.user.id).toBeDefined();
                expect(userObject.user.username).toEqual(users[userType].username)

            });

            it('can signin with basic', async () => {

                const response = await mockRequest.post('/signin')
                    .auth(users[userType].username, users[userType].password);

                const userObject = response.body;
                expect(response.status).toBe(200);
                expect(userObject.token).toBeDefined();
                expect(userObject.user.id).toBeDefined();
                expect(userObject.user.username).toEqual(users[userType].username)

            });

            it('can signin with bearer', async () => {

                // First, use basic to login to get a token
                const response = await mockRequest.post('/signin')
                    .auth(users[userType].username, users[userType].password);

                const token = response.body.token;
                // First, use basic to login to get a token
                const bearerResponse = await mockRequest
                    .get('/users')
                    .set('Authorization', `Bearer ${token}`)

                // Not checking the value of the response, only that we "got in"

                expect(bearerResponse.status).toBe(200);

            });

        });

        describe('bad logins', () => {
            it('basic fails with known user and wrong password ', async () => {

                const response = await mockRequest.post('/signin')
                    .auth('admin', 'xyz')
                const userObject = response.body;

                expect(response.status).toBe(403);
                expect(userObject.user).not.toBeDefined();
                expect(userObject.token).not.toBeDefined();

            });

            it('basic fails with unknown user', async () => {

                const response = await mockRequest.post('/signin')
                    .auth('nobody', 'xyz')
                const userObject = response.body;

                expect(response.status).toBe(403);
                expect(userObject.user).not.toBeDefined();
                expect(userObject.token).not.toBeDefined()

            });

            it('bearer fails with an invalid token', async () => {

                // First, use basic to login to get a token
                const bearerResponse = await mockRequest
                    .get('/users')
                    .set('Authorization', `Bearer foobar`)

                // Not checking the value of the response, only that we "got in"
                expect(bearerResponse.status).toBe(403);

            })
        })

    });

});

describe('RESOURCE ROUTES', () => {


    describe(`Admin users`, () => {

        Object.keys(mockData).forEach(value => {

            beforeEach(async (done) => {
                await db.sync();
                const response = await mockRequest.post(`/signup`).send(users.admin);
                done();
            });
            afterEach(async (done) => {
                await db.drop();
                done();
            });

            describe(`at /${value} endpoint`, () => {

                it(`can go to a POST /${value} and will get back a status of 201 and the object they created`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.admin.username, users.admin.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    expect(createdResources.status).toBe(201)

                })

                it(`can go to GET /${value} and will get backa status of 200 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.admin.username, users.admin.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.get(`/${value}`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`can go to GET /${value}/1 and will get back a status of 200 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.admin.username, users.admin.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.get(`/${value}/1`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`can go to PUT /${value}/1 and will get back a status of 200 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.admin.username, users.admin.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.put(`/${value}/1`).set('Authorization', `Bearer ${token}`).send({ name: "new" })
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`can go to DELETE /${value}/1 and will get back a status of 202 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.admin.username, users.admin.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.delete(`/${value}/1`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(202)
                })
            })
        })
    })

    describe(`Editor users`, () => {

        Object.keys(mockData).forEach(value => {

            beforeEach(async (done) => {
                await db.sync();
                const response = await mockRequest.post(`/signup`).send(users.editor);
                done();
            });
            afterEach(async (done) => {
                await db.drop();
                done();
            });

            describe(`at /${value} endpoint`, () => {

                it(`can go to a POST /${value} and will get back a status of 201 and the object they created`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.editor.username, users.editor.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    expect(createdResources.status).toBe(201)

                })

                it(`can go to GET /${value} and will get backa status of 200 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.editor.username, users.editor.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.get(`/${value}`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`can go to GET /${value}/1 and will get back a status of 200 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.editor.username, users.editor.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.get(`/${value}/1`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`can go to PUT /${value}/1 and will get back a status of 200 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.editor.username, users.editor.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.put(`/${value}/1`).set('Authorization', `Bearer ${token}`).send({ name: "new" })
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`cannot go to DELETE /${value}/1 so will get back a status of 500 and an error messege`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.editor.username, users.editor.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.delete(`/${value}/1`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(500)
                    expect(readResource.body.message).toBe('Access Denied')
                })
            })
        })
    })

    describe(`User users`, () => {

        Object.keys(mockData).forEach(value => {

            beforeEach(async (done) => {
                await db.sync();
                const response = await mockRequest.post(`/signup`).send(users.user);
                done();
            });
            afterEach(async (done) => {
                await db.drop();
                done();
            });

            describe(`at /${value} endpoint`, () => {

                it(`cannot go to a POST /${value} so will get back a status of 500 and an error message`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.user.username, users.user.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    expect(createdResources.status).toBe(500)
                    expect(createdResources.body.message).toBe('Access Denied')

                })

                it(`can go to GET /${value} and will get backa status of 200 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.user.username, users.user.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.get(`/${value}`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`can go to GET /${value}/1 and will get back a status of 200 and an object`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.user.username, users.user.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.get(`/${value}/1`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`cannot go to PUT /${value}/1 so will get back a status of 500 and an error message`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.user.username, users.user.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.put(`/${value}/1`).set('Authorization', `Bearer ${token}`).send({ name: "new" })
                    expect(readResource.status).toBe(500)
                    expect(readResource.body.message).toBe('Access Denied')
                })

                it(`cannot go to DELETE /${value}/1 so will get back a status of 202 and an error message`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.user.username, users.user.password);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    const readResource = await mockRequest.delete(`/${value}/1`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(500)
                    expect(readResource.body.message).toBe('Access Denied')
                })
            })
        })
    })
})
