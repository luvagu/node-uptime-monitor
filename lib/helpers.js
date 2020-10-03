/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto = require('crypto')
const config = require('./config')

// Container for all the helpers
const helpers = {}

// Hash passwords
helpers.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash
    } else {
        return false
    }
}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str)
        return obj
    } catch (error) {
        return {}
    }
}

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false

    if (strLength) {
        // Define all possible characters that could go into a string
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        // Start the final string
        let str = ''
        for (let i = 0; i < strLength; i++) {
            // Get a random character from the characters string
            let randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length))

            // Append this character to the final string
            str += randomCharacter
        }

        // Return the final string
        return str
    } else {
        return false
    }
}

// Export the module
module.exports = helpers
