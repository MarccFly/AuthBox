// database.js
import mysql from 'mysql2/promise';
import { config } from './config.js';

// based on the configuration in config.js
const pool = mysql.createPool(config.db);

/**
 * Executes a SQL query with given parameters
 * @param {string} sql - SQL query as a string
 * @param {Array} [params=[]] - parameters used in the SQL query
 * @returns {Promise<Array>} - the result of the query
 * @throws {Error} - if the query fails
 */
export async function query(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    throw new Error('Failed to execute database query.');
  }
}

/**
 * @returns {Promise<mysql.PoolConnection>} - a database connection
 * @throws {Error} - if obtaining the connection fails
 */
export async function getDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection successfully obtained.");
    return connection;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    throw new Error('Failed to get database connection.');
  }
}

export async function executeTransaction(operations) {
  const connection = await getDbConnection();
  try {
    await connection.beginTransaction();
    for (const operation of operations) {
      await operation(connection);
    }
    await connection.commit();
    console.log("Transaction successfully committed.");
  } catch (error) {
    await connection.rollback();
    console.error(`Transaction failed: ${error.message}, rolled back transaction.`);
    throw error;
  } finally {
    connection.release();
  }
}