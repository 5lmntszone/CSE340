const { body, validationResult } = require("express-validator")
const utilities = require(".")

const updateRules = () => [
  body("inv_id").toInt().isInt({ min: 1 }).withMessage("Invalid item."),
  body("classification_id").toInt().isInt({ min: 1 }).withMessage("Choose a classification."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").toFloat().isFloat({ min: 0 }).withMessage("Price must be a number."),
  body("inv_year").toInt().isInt({ min: 1885 }).withMessage("Year must be valid."),
  body("inv_miles").toInt().isInt({ min: 0 }).withMessage("Miles must be a number."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
]

const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav()
  const itemData = req.body
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make || ""} ${itemData.inv_model || ""}`.trim()

  req.flash("message", errors.array()[0].msg)
  return res.status(400).render("./inventory/edit-inventory", {
    title: "Edit " + (itemName || "Vehicle"),
    nav,
    classificationSelect,
    errors: errors.array(),
    ...itemData
  })
}

module.exports = { updateRules, checkUpdateData }
