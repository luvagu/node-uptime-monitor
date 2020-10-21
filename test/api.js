/*
 * API Tests
 * 
 */

// Dependencies
const app = require('./../index')
const assert = require('assert')
const http = require('http')
const config = require('./../lib/config')

// Holder  for the tests
const api = {}

// Helpers
const helpers = {}

helpers.makeGetRequet = (path, callback) => {
    // Configure the request details
    const requestDetails = {
        protocol: 'http:',
        hostname: 'localhost',
        port: config.httpPort,
        method: 'GET',
        path: path,
        headers: {
            'Content-Type': 'application/json'
        }
    }

    // Send the request
    const req = http.request(requestDetails, (res) => {
        callback(res)
    })

    req.end()
}

// The main init() function should be able to run without throwing
api['app.init should start without throwing'] = (done) => {
    assert.doesNotThrow(() => {
        app.init(err => {
            done()
        })
    }, TypeError)
}

// Make a request to /ping
api['/ping should respond to GET with 200'] = (done) => {
    helpers.makeGetRequet('/ping', (res) => {
        assert.strictEqual(res.statusCode, 200)
        done()
    })
}

// Make a request to /api/users
api['/api/users should respond to GET with 400'] = (done) => {
    helpers.makeGetRequet('/api/users', (res) => {
        assert.strictEqual(res.statusCode, 400)
        done()
    })
}

// Make a request to a random path
api['a random path should respond to GET with 404'] = (done) => {
    helpers.makeGetRequet('/this/path/should/not/exist', (res) => {
        assert.strictEqual(res.statusCode, 404)
        done()
    })
}

// Export the tests to the test runner
module.exports = api