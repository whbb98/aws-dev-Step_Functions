var MEMC = require('memcached');
const memcachedHost = process.env.MEMC_HOST;
// const memcachedPort = '11211';
const cacheTtlInSec = 300;
console.log("Using memcached host:", memcachedHost);
const memcached = new MEMC(memcachedHost, {
    timeout: 2000,
    retries: 3,
    reconnect: 1000
});

module.exports = memcached;

