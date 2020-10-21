/*
 * Test runner
 * 
 */

// Overwrite the NODE_ENV variable
process.env.NODE_ENV = 'testing'

// Application logic for the test runner
_app = {}

// Container for the tests
_app.tests = {}

// Add on the unit tests
_app.tests.unit = require('./unit')
_app.tests.api = require('./api')

// Count all the tests
_app.countTests = () => {
    let counter = 0
    for (const key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];

            for (const testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++
                }
            }
        }
    }
    return counter
}

// Produce the test outcome report
_app.produceTestReport = (limit, successes, errors) => {
    console.log('')
    console.log('--------------------BEGIN TEST REPORT--------------------')
    console.log('')
    console.log('Total Tests: ', limit)
    console.log('Pass: ', successes)
    console.log('Failed: ', errors.length)

    // If there are errors, print them in detail
    if (errors.length > 0) {
        console.log('-------------------BEGIN ERROR DETAILS-------------------')
        console.log('')

        errors.forEach(testError => {
            console.log('\x1b[31m%s\x1b[0m', testError.name)
            console.log(testError.error)
            console.log('')
        })

        console.log('')
        console.log('--------------------END ERROR DETAILS--------------------')
    }

    console.log('')
    console.log('---------------------END TEST REPORT---------------------')
    process.exit(0)
}

// Run all the tests, collecting the error and successes
_app.runTests = () => {
    const errors = []
    let successes = 0
    const limit = _app.countTests()
    let counter = 0

    for (const key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];

            for (const testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    (function() {
                        const tmpTestName = testName
                        const testValue = subTests[testName]
                        // Call the test
                        try {
                            testValue(function() {
                                // If it calls back without throwing, them it succeeded, so log in green
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName)
                                counter++
                                successes++
                                if (counter == limit) {
                                    _app.produceTestReport(limit, successes, errors)
                                }
                            })
                        } catch (err) {
                            // If it throws, then it failed, so capture the error thrown and log it in red
                            errors.push({
                                name: testName,
                                error: err
                            })
                            console.log('\x1b[31m%s\x1b[0m', tmpTestName)
                            counter++
                            if (counter == limit) {
                                _app.produceTestReport(limit, successes, errors)
                            }
                        }
                    })()
                }
            }
        }
    }
}

// Run the test
_app.runTests()