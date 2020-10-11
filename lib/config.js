/*
 * Create and export configuration variables
 *
 * NOTE1: in windows we must use the following command-line argument before 
 * the node command to set the environment mode e.g: staging or production
 * POWERSHELL-> $env:NODE_ENV="staging"
 * GIT-> export NODE_ENV=staging
 * 
 * NOTE2: For SSL Cert Generation we must use GitBash (cd to the https dir) for the following command to work:
 * openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
 * Enter the requiered info and it's done
 * 
 */

// Environments Container
const environments = {}

// Staging (default) environment
environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    hashingSecret: 'thisIsASecret',
    maxChecks: 5,
    twilio: {
        accountSid: 'AC94d52dbdc8a822cbe8ad1d20ea616c86',
        authToken: '4d8063142eb24881af756a3535a9bf3e',
        fromPhone: '+15005550006'
    },
    templateGlobals: {
        appName: 'UptimeChecker',
        companyName: 'NotARealCompany, Inc',
        yearCreated: '2020',
        baseUrl: 'http://localhost:3000/'
    }
}

// Production environment
// Must enter Real Twilio Credentials for production or a 404 Status code will be received
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    hashingSecret: 'thisIsAlsoASecret',
    maxChecks: 5,
    twilio: {
        accountSid: '',
        authToken: '',
        fromPhone: ''
    },
    templateGlobals: {
        appName: 'UrlUptimeChecker',
        companyName: 'NotARealCompany, Inc',
        yearCreated: '2020',
        baseUrl: 'http://localhost:5000/'
    }
}

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// Check that the current environment is one of ours, if not, defautl to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

// Export the module
module.exports = environmentToExport