module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            skipMD5: true,
        },
        autostart: false,
        instance: {
            dbName: 'FoodApp'
        }
    },
    useSharedDBForAllJestWorkers: false
}
