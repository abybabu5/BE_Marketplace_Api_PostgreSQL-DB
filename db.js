const {Client} = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

client.connect();

module.exports = {
    //this method will allow the querying through the pool of connections
    query: (text, params) => client.query(text, params)
};