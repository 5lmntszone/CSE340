const pool = require("../database")

async function addReview({ inv_id, account_id, rating, review_text }) {
  const sql = `
    INSERT INTO review (inv_id, account_id, rating, review_text)
    VALUES ($1,$2,$3,$4) RETURNING *`
  const { rows } = await pool.query(sql, [inv_id, account_id, rating, review_text])
  return rows[0]
}

async function getReviewsByInvId(inv_id) {
  const sql = `
    SELECT r.*, a.account_firstname, a.account_lastname
    FROM review r
    JOIN account a ON a.account_id = r.account_id
    WHERE r.inv_id = $1
    ORDER BY r.created_at DESC`
  const { rows } = await pool.query(sql, [inv_id])
  return rows
}

async function getUserReview(inv_id, account_id) {
  const sql = `SELECT * FROM review WHERE inv_id=$1 AND account_id=$2`
  const { rows } = await pool.query(sql, [inv_id, account_id])
  return rows[0]
}

async function updateReview({ review_id, rating, review_text, account_id, isAdmin }) {
  const sql = isAdmin
    ? `UPDATE review SET rating=$1, review_text=$2, updated_at=NOW() WHERE review_id=$3 RETURNING *`
    : `UPDATE review SET rating=$1, review_text=$2, updated_at=NOW() WHERE review_id=$3 AND account_id=$4 RETURNING *`
  const params = isAdmin ? [rating, review_text, review_id] : [rating, review_text, review_id, account_id]
  const { rows } = await pool.query(sql, params)
  return rows[0]
}

async function deleteReview({ review_id, account_id, isAdmin }) {
  const sql = isAdmin
    ? `DELETE FROM review WHERE review_id=$1 RETURNING review_id`
    : `DELETE FROM review WHERE review_id=$1 AND account_id=$2 RETURNING review_id`
  const params = isAdmin ? [review_id] : [review_id, account_id]
  const { rows } = await pool.query(sql, params)
  return rows[0]
}

async function getAverageRating(inv_id) {
  const sql = `SELECT AVG(rating)::numeric(10,2) AS avg, COUNT(*) AS count FROM review WHERE inv_id=$1`
  const { rows } = await pool.query(sql, [inv_id])
  return rows[0] 
}

module.exports = {
  addReview,
  getReviewsByInvId,
  getUserReview,
  updateReview,
  deleteReview,
  getAverageRating
}
