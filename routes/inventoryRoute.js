const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build inventory item detail view
router.get(
    "/detail/:invId",
    utilities.handleErrors(invController.buildDetailView)
);

module.exports = router;