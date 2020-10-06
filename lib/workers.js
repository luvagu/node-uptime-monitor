/*
 * Worker related tasks
 *
 */

// Dependencies
const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const url = require('url')

const _data = require('./data')
const helpers = require('./helpers')
const config = require('./config')

// Instantiate the worker object
const workers = {}

// Lookup all checks, get their data, send to a validator
workers.gatherAllChecks = () => {
    // Get all the checks
    _data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                // Read in the checks data
                _data.read('checks', check, (err, originalCheckData) => {
                    if (!err && originalCheckData) {
                        // Pass it to the check validator, and let that function continue or log errors as needed
                        workers.validateCheckData(originalCheckData)
                    } else {
                        console.log('Error reading one of the checks data')
                    }
                })
            })
        } else {
            console.log('Error: Could not find any checks to process')
        }
    })
}

// Sanity-check the check-data
workers.validateCheckData = (originalCheckData) => {
    // Validate data
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {}

    // Validate fields
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array ? originalCheckData.successCodes : false
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 == 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false

    // Set the keys that may not be set (if the workers have never seen this check before)
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down'
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false

    // If all the checks pass, pass the data along to the next step in the process
    if (originalCheckData.id && originalCheckData.userPhone && originalCheckData.protocol && originalCheckData.url && originalCheckData.method && originalCheckData.successCodes && originalCheckData.timeoutSeconds) {
        workers.performCheck(originalCheckData)
    } else {
        console.log('Error: One of the checks is not properly formatted. Skipping it.')
    }
}

// Perform the check, send the originalCheckData and outcome of the check process, to the next step in the process
workers.performCheck = (originalCheckData) => {
    // Perform the initial check outcome
    const checkOutcome = {
        error: false,
        responseCode: false
    }

    // Mark that the outcome has not been sent yet
    let outcomeSent = false

    // Parse the hostmane and the path out of the original check data
    const parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true)
    const hostName = parsedUrl.hostname
    // Using path and not 'pathname' because we want the query string
    const path = parsedUrl.path

    // Construct the request
    const requestDetails = {
        protocol: originalCheckData.protocol + ':',
        hostmane: hostName,
        method: originalCheckData.method.toUpperCase(),
        path: path,
        timeout: originalCheckData.timeoutSeconds * 1000,
        // headers: {
        //     'Content-Type': 'application/json'
        // },
        // host: 'localhost',
        // port: originalCheckData.protocol == 'http' ? config.httpPort : config.httpsPort,
    }

    // Instantiate the request object (using either the http or https module)
    const _moduleToUse = originalCheckData.protocol == 'http' ? http : https
    const req = _moduleToUse.request(requestDetails, (res) => {
        res.setEncoding('utf8');

        // Grab the staus of the sent request
        const status = res.statusCode

        // Update the checkOutcome and pass the data along
        checkOutcome.responseCode = status
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome)
            outcomeSent = true
        }
    })

    // Bind to the error event so it doesn't get thrown
    req.on('error', (e) => {
        // Update the checkOutcome and pass the data along
        checkOutcome.error = {
            error: true,
            value: e
        }
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome)
            outcomeSent = true
        }
    })

    // Bind to the timeout event
    req.on('timeout', (e) => {
        // Update the checkOutcome and pass the data along
        checkOutcome.error = {
            error: true,
            value: 'timeout'
        }
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome)
            outcomeSent = true
        }
    })

    // End the request
    req.end()
}

// Process the checkOutcome, update the originalCheckData as needed, trigger and alert to the user if needed
// Special logic for accomodating a check that has never been checked before (don't alert on that one)
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
    console.log('checkOutcome', checkOutcome)

    // Decide if the check is considered up or down
    const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down'

    // Decide if an alert is warranted
    const alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false

    // Update the check data
    const newCheckData = originalCheckData
    newCheckData.state = state
    newCheckData.lastChecked = Date.now()

    // Save the updates
    _data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            // Send the check data to the next phase in the process
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData)
            } else {
                console.log('Check outcome has not changed, no alert needed')
            }
        } else {
            console.log('Error trying to save updates to one of the checks')
        }
    })
}

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currenty ${newCheckData.state}`

    // Send the SMS message
    helpers.sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log('Success: User was alerted to a status change, via sms', msg)
        } else {
            console.log('Error: Could not send sms alert to user who had a state change in their check')
        }
    })
}

// Timer to execute the worker-process once per minute
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks()
    }, 1000 * 60)
}
// Init script
workers.init = () => {
    // Execute the checks inmediately
    workers.gatherAllChecks()

    // Call the loop so the checks will execute later on
    workers.loop()
}

// Export the module
module.exports = workers