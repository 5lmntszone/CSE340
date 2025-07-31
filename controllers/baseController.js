const utilities = require("../utilities/")
const baseController = {}

/* ***************************
 * Build home view
 ************************** */
baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

/* ***************************
 * Intentional 500 Error trigger
 ************************** */
baseController.triggerError = async function (req, res, next) {
  throw new Error("Intentional server error!")
}

module.exports = baseController;