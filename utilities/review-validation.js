const { body, validationResult } = require("express-validator")

const reviewRules = () => [
  body("inv_id").toInt().isInt({ min: 1 }).withMessage("Invalid vehicle."),
  body("rating").toInt().isInt({ min: 1, max: 5 }).withMessage("Rating must be 1–5."),
  body("review_text").trim().isLength({ min: 10, max: 2000 }).withMessage("Review must be 10–2000 characters.")
]

const checkReviewData = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) return next()
      req.flash("formData", req.body)
  
    req.flash("message", errors.array()[0].msg)
    return res.redirect(`/inv/detail/${req.body.inv_id}`)
}  

const updateRules = () => [
  body("review_id").toInt().isInt({ min: 1 }).withMessage("Invalid review."),
  ...reviewRules().slice(1) 
]

module.exports = { reviewRules, updateRules, checkReviewData }
