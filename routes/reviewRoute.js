const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const reviewController = require("../controllers/reviewController")
const rv = require("../utilities/review-validation")

router.post("/create",
  utilities.requireAuth,
  rv.reviewRules(),
  rv.checkReviewData,
  utilities.handleErrors(reviewController.createReview)
)

router.post("/update",
  utilities.requireAuth,
  rv.updateRules(),
  rv.checkReviewData,
  utilities.handleErrors(reviewController.updateReview)
)

router.post("/delete",
  utilities.requireAuth,
  utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router
