const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Build inventory detail view
 ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = parseInt(req.params.invId)
  const vehicleData = await invModel.getVehicleById(invId)

  if (!vehicleData) {
    return next(new Error("Vehicle not found"))
  }

  const nav = await utilities.getNav()
  const vehicleHTML = utilities.buildVehicleDetail(vehicleData)

  res.render("inventory/detail", {
    title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    vehicleHTML
  })
}

module.exports = invCont