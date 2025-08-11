const pool = require("../database")

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname,
              account_email, account_type, account_password
       FROM account WHERE account_email = $1`,
      [account_email]
    )
    return result.rows[0]
  } catch {
    return null
  }
}

/* ****************************************
 *  Add new account
 * ************************************ */
async function registerAccount({ account_firstname, account_lastname, account_email, account_password }) {
    try {
      const sql = `
        INSERT INTO account (
          account_firstname, account_lastname, account_email, account_password, account_type
        ) VALUES ($1, $2, $3, $4, 'Client')
        RETURNING account_id, account_firstname, account_lastname, account_email, account_type`
      const params = [account_firstname, account_lastname, account_email, account_password]
      const result = await pool.query(sql, params)
      return result.rows[0]
    } catch (e) {
      if (e.code === "23505") {
        return { duplicate: true }
      }
      throw e
    }
  }
  
async function checkExistingEmail(account_email) {
    const r = await pool.query("SELECT 1 FROM account WHERE account_email = $1", [account_email])
    return r.rowCount > 0
  }

async function getAccountById(account_id) {
    const sql = `SELECT account_id, account_firstname, account_lastname, account_email, account_type
                 FROM account WHERE account_id = $1`
    const r = await pool.query(sql, [account_id])
    return r.rows[0]
  }
  
async function updateAccount({ account_id, account_firstname, account_lastname, account_email }) {
    try {
      const sql = `UPDATE account
                     SET account_firstname = $1,
                         account_lastname  = $2,
                         account_email     = $3
                   WHERE account_id = $4`
      const r = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
      return r.rowCount === 1
    } catch (e) {
      return false
    }
  }
  
async function updatePassword(account_id, hashedPassword) {
    try {
      const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2`
      const r = await pool.query(sql, [hashedPassword, account_id])
      return r.rowCount === 1
    } catch (e) {
      return false
    }
  }

module.exports = { 
  getAccountByEmail, 
  checkExistingEmail, 
  registerAccount,
  getAccountById,
  updateAccount,
  updatePassword
 }
