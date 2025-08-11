const { body, validationResult } = require("express-validator")
const utilities = require(".")

const updateRules = () => [
  body("inv_id")
    .trim().notEmpty().withMessage("Invalid item.")
    .bail().toInt().isInt({ min: 1 }).withMessage("Invalid item."),
  body("classification_id")
    .trim().notEmpty().withMessage("Choose a classification.")
    .bail().toInt().isInt({ min: 1 }).withMessage("Choose a classification."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price")
    .trim().notEmpty().withMessage("Price is required.")
    .bail().toFloat().isFloat({ min: 0 }).withMessage("Price must be a number."),
  body("inv_year")
    .trim().notEmpty().withMessage("Year is required.")
    .bail().toInt().isInt({ min: 1885 }).withMessage("Year must be valid."),
  body("inv_miles")
    .trim().notEmpty().withMessage("Miles is required.")
    .bail().toInt().isInt({ min: 0 }).withMessage("Miles must be a number."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
]

const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav()
  const itemData = req.body
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id || null)
  const itemName = `${itemData.inv_make || ""} ${itemData.inv_model || ""}`.trim() || "Vehicle"

  const flashMessage = errors.array()[0].msg

  return res.status(400).render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: errors.array(),
    flashMessage,
    ...itemData
  })
}

module.exports = { updateRules, checkUpdateData }
