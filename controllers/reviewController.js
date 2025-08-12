const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")
const { validationResult } = require("express-validator")

async function createReview(req, res) {
  const errors = validationResult(req)
  const { inv_id, rating, review_text } = req.body
  const account = req.session.accountData
  if (!errors.isEmpty()) {
    req.flash("message", errors.array()[0].msg)
    return res.redirect(`/inv/detail/${inv_id}`)
  }
  try {
    await reviewModel.addReview({
      inv_id: parseInt(inv_id, 10),
      account_id: account.account_id,
      rating: parseInt(rating, 10),
      review_text: review_text.trim()
    })
    req.flash("message", "Review added. Thank you!")
  } catch (e) {
    req.flash("message", "You’ve already reviewed this vehicle. You can edit your review below.")
  }
  return res.redirect(`/inv/detail/${inv_id}`)
}

async function updateReview(req, res) {
    try {
      const errors = validationResult(req)
      const { review_id, inv_id, rating, review_text } = req.body
      const isAdmin = ["Employee", "Admin"].includes(req.session?.accountData?.account_type)
      if (!errors.isEmpty()) {
        req.flash("message", errors.array()[0].msg)
        return res.redirect(`/inv/detail/${inv_id}`)
      }
      const updated = await reviewModel.updateReview({
        review_id: parseInt(review_id, 10),
        rating: parseInt(rating, 10),
        review_text: review_text.trim(),
        account_id: req.session.accountData.account_id,
        isAdmin
      })
      req.flash("message", updated ? "Review updated." : "Update failed.")
      return res.redirect(`/inv/detail/${inv_id}`)
    } catch (e) {
      req.flash("message", "Update failed. Please try again.")
      return res.redirect(`/inv/detail/${req.body.inv_id}`)
    }
  }
  
async function deleteReview(req, res) {
    try {
      const { review_id, inv_id } = req.body
      const isAdmin = ["Employee", "Admin"].includes(req.session?.accountData?.account_type)
      const deleted = await reviewModel.deleteReview({
        review_id: parseInt(review_id, 10),
        account_id: req.session.accountData.account_id,
        isAdmin
      })
      req.flash("message", deleted ? "Review deleted." : "Delete failed.")
      return res.redirect(`/inv/detail/${inv_id}`)
    } catch (e) {
      req.flash("message", "Delete failed. Please try again.")
      return res.redirect(`/inv/detail/${req.body.inv_id}`)
    }
  }  

module.exports = { createReview, updateReview, deleteReview }
