const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

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

router.get(
    "/getInventory/:classification_id",
    utilities.handleErrors(invController.getInventoryJSON)
  )

// Build the Edit Inventory view
router.get(
    "/edit/:inv_id",
    utilities.handleErrors(invController.editInventoryView)
  )

// Update vehicle 
router.post(
    "/update",
    invValidate.updateRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
  )

module.exports = router;