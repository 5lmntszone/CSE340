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

// Route to build inventory management view
router.get(
    "/",
    utilities.handleErrors(invController.buildManagement)
);

// Deliver add classification view
router.get(
    "/add-classification",
    utilities.handleErrors(invController.buildAddClassification)
);
  
// Process add classification
router.post(
    "/add-classification",
    utilities.handleErrors(invController.addClassification)
);

// Show add-inventory form
router.get(
    "/add-inventory",
    utilities.handleErrors(invController.buildAddInventory)
)
  
// Process add-inventory form
router.post(
    "/add-inventory",
    utilities.handleErrors(invController.addInventory)
)  

module.exports = router;