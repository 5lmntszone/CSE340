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
      classification_name: "", 
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
        classification_name,
      })
    }

    // Check if classification already exists
    const exists = await invModel.checkExistingClassification(classification_name)
    if (exists) {
      req.flash("message", "That classification already exists.")
      const nav = await utilities.getNav()
      return res.status(409).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash("message"),
        classification_name,
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
        classification_name,
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

/* ***************************
 * Process inventory submission
 ************************** */
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

    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)

    const isValidNumber = (val) => !isNaN(val) && Number(val) >= 0

    if (
      !classification_id ||
      !inv_make || !inv_model || !inv_description ||
      !inv_image || !inv_thumbnail || !inv_price ||
      !inv_year || !inv_miles || !inv_color
    ) {
      req.flash("message", "All fields are required.")
      return res.status(400).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        message: req.flash("message"),
        ...req.body,
      })
    }

    if (!/^\d+$/.test(classification_id)) {
      req.flash("message", "Classification ID must be a valid number.")
    } else if (!/^[A-Za-z0-9\s\-]+$/.test(inv_make)) {
      req.flash("message", "Invalid make name.")
    } else if (!/^[A-Za-z0-9\s\-]+$/.test(inv_model)) {
      req.flash("message", "Invalid model name.")
    } else if (!inv_description.trim()) {
      req.flash("message", "Description is required.")
    } else if (!inv_image.match(/\.(jpg|jpeg|png|gif)$/i)) {
      req.flash("message", "Image must be a valid image URL.")
    } else if (!inv_thumbnail.match(/\.(jpg|jpeg|png|gif)$/i)) {
      req.flash("message", "Thumbnail must be a valid image URL.")
    } else if (!isValidNumber(inv_price)) {
      req.flash("message", "Price must be a valid number.")
    } else if (!/^\d{4}$/.test(inv_year)) {
      req.flash("message", "Year must be a 4-digit number.")
    } else if (!isValidNumber(inv_miles)) {
      req.flash("message", "Miles must be a valid number.")
    } else if (!/^[A-Za-z\s]+$/.test(inv_color)) {
      req.flash("message", "Color must only contain letters.")
    }

    if (req.flash("message").length > 0) {
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
