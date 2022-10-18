module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            // version: '4.0.3',
            skipMD5: true,
        },
        autostart: false,
        instance: {
            dbName: 'FoodApp'
        }
    },
    // mongoURLEnvName: 'DB_CONNECTION_STRING_TESTING',
    useSharedDBForAllJestWorkers: false
}