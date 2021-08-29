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

beforeAll(async (done) => {
    await db.sync();
    done();
});
afterAll(async (done) => {
    await db.drop();
    done();
});

xdescribe('Auth Router', () => {

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

            describe(`at /${value} endpoint`, () => {

                beforeAll(async () => {
                    await db.sync();

                })

                afterAll(async () => {
                    await db.drop();
                })

                it(`can go to a POST /${value} and will get back a status of 201 and the object they created`, async () => {
                    const response = await mockRequest.post(`/signup`).send(users.admin);
                    const token = response.body.token
                    const createdResources = await mockRequest.post(`/${value}`).send(mockData[value]).set('Authorization', `Bearer ${token}`)
                    expect(createdResources.status).toBe(201)

                })

                it.only(`should be able to GET /${value}`, async () => {
                    const response = await mockRequest.post(`/signin`).auth(users.admin.username, users.admin.password);
                    const token = response.body.token
                    console.log('@@@@@@@@@@@@@@@@@@@', response.body)
                    const readResource = await mockRequest.get(`/${value}`).set('Authorization', `Bearer ${token}`)
                    expect(readResource.status).toBe(200)
                    expect(typeof readResource.body).toBe('object')
                })

                it(`should be able to GET /${value}`, () => {

                })

                it(`should be able to PUT /${value}`, () => {

                })

                it(`should be able to DELETE /${value}`, () => {

                })
            })
        })
    })

    xdescribe(`${users.editor} users`, () => {

        beforeEach(async () => {
            await db.sync();
            const response = await mockRequest.post('/signup').send(users[userType]);
        })

        afterEach(async () => {
            await db.drop();
        })

        endPoint.forEach(value => {

            it(`should respond to a POST /${value}`, async () => {
                // const response = await mockRequest.post('/signup').send(users.admin);

            })

            it(`should be able to GET /${value}`, () => {

            })

            it(`should be able to GET /${value}`, () => {

            })

            it(`should be able to PUT /${value}`, () => {

            })

            it(`should be able to DELETE /${value}`, () => {

            })
        })
    })

    xdescribe(`${users.user} users`, () => {

        beforeEach(async () => {
            await db.sync();
        })

        afterEach(async () => {
            await db.drop();
        })

        endPoint.forEach(value => {

            describe(`${value}`)
            it(`should respond to a POST /${value}`, async () => {
                // const response = await mockRequest.post('/signup').send(users.admin);

            })

            it(`should be able to GET /${value}`, () => {

            })

            it(`should be able to GET /${value}`, () => {

            })

            it(`should be able to PUT /${value}`, () => {

            })

            it(`should be able to DELETE /${value}`, () => {

            })
        })
    })
})
