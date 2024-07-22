const mysql = require('mysql2');
const { query } = require('express');
require('dotenv').config({path: __dirname + '/../../group-1033715/.env'});

const pool = mysql.createPool({
    // host: process.env.MYSQL_HOST,
    // user: process.env.MYSQL_USER,
    // password: process.env.MYSQL_PASSWORD,
    // database: process.env.MYIRC_DATABSE,
    host: 'localhost',
    user: 'admin',
    password: '',
    database: 'myIRC',
  }).promise()

async function test () {

    const [str] =  await pool.query(`SELECT * FROM users`);

}

test();