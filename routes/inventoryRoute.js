const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory item detail view
router.get("/detail/:invId", invController.buildDetailView)

module.exports = router;