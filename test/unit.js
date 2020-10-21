/*
 * Unit Tests
 * 
 */

// Dependencies
const helpers = require('./../lib/helpers')
const assert =  require('assert')
const logs = require('./../lib/logs')
const example = require('./../lib/exampleDebuggingProblem')

// Holder for the tests
const unit = {}

// Assert thet getANumber function is returning a number
unit['helpers.getANumber should return a number'] = (done) => {
    const val = helpers.getANumber()
    assert.strictEqual(typeof(val), 'number')
    done()
}

// Assert thet getANumber function is returning 1
unit['helpers.getANumber should return 1'] = (done) => {
    const val = helpers.getANumber()
    assert.strictEqual(val, 1)
    done()
}

// Assert thet getANumber function is returning 2
unit['helpers.getANumber should return 2'] = (done) => {
    const val = helpers.getANumber()
    assert.strictEqual(val, 2)
    done()
}

// Logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log names'] = (done) => {
    logs.list(true, (err, logFileNames) => {
        assert.strictEqual(err, false)
        assert.ok(logFileNames instanceof Array)
        assert.ok(logFileNames.length > 1)
        done()
    })
}

// Logs.trunacate should not throw if the logId doesn't exist
unit['logs.trunacate should not throw if the logId does not exist. It should call back an error instead'] = (done) => {
    assert.doesNotThrow(() => {
        logs.truncate('123', (err) => {
            assert.ok(err)
            done()
        })
    }, TypeError)
}

// example.init() should not throw (but it does)
unit['example.init should not throw when called'] = (done) => {
    assert.doesNotThrow(() => {
        example.init()
        done()
    }, TypeError)
}

// Export the test to the runner
module.exports = unit