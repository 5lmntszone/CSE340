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

/* ***************************
 * Build inventory management view
 ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const message = req.flash("message")

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build add-classification view
 ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: req.flash("message"),
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Process add-classification form
 ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body

    // Server-side validation
    const validName = /^[A-Za-z0-9]+$/.test(classification_name)
    if (!validName) {
      req.flash("message", "Classification name is invalid.")
      const nav = await utilities.getNav()
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash("message"),
      })
    }

    // Insert into DB
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("message", "New classification added successfully.")
      const nav = await utilities.getNav()
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: req.flash("message"),
      })
    } else {
      req.flash("message", "Failed to add classification.")
      const nav = await utilities.getNav()
      return res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash("message"),
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Show add-inventory form
 ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      message: req.flash("message"),
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: ""
    })
  } catch (error) {
    next(error)
  }
}

/* Process inventory submission */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    } = req.body

    if (
      !classification_id || !inv_make || !inv_model || !inv_description ||
      !inv_image || !inv_thumbnail || !inv_price || !inv_year || !inv_miles || !inv_color
    ) {
      req.flash("message", "All fields are required.")
      const nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(classification_id)
      return res.status(400).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        message: req.flash("message"),
        ...req.body, 
      })
    }

    const result = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    )

    if (result) {
      req.flash("message", "Vehicle added successfully.")
      const nav = await utilities.getNav()
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: req.flash("message"),
      })
    } else {
      throw new Error("Insert failed")
    }

  } catch (error) {
    console.error("addInventory error:", error)
    req.flash("message", "Failed to add vehicle.")
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      message: req.flash("message"),
      ...req.body,
    })
  }
}


module.exports = invCont
