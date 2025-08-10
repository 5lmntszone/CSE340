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
      return null
    }
  }
  
async function checkExistingEmail(account_email) {
    const r = await pool.query("SELECT 1 FROM account WHERE account_email = $1", [account_email])
    return r.rowCount > 0
  }

module.exports = { getAccountByEmail, checkExistingEmail, registerAccount }
