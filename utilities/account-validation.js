const { body, validationResult } = require("express-validator")
const utilities = require(".")
const accountModel = require("../models/account-model")

/* ============ Registration ============ */
const registrationRules = () => [
  body("account_firstname").trim().notEmpty().withMessage("Please provide a first name."),
  body("account_lastname").trim().notEmpty().withMessage("Please provide a last name."),
  body("account_email")
    .trim().isEmail().withMessage("A valid email is required.")
    .custom(async (email) => {
      const exists = await accountModel.checkExistingEmail(email)
      if (exists) throw new Error("Email exists. Please log in or use a different email.")
    }),
  body("account_password")
    .isStrongPassword({ minLength: 12, minLowercase:1, minUppercase:1, minNumbers:1, minSymbols:1 })
    .withMessage("Password must be 12+ chars and include upper, lower, number, and symbol."),
]

const checkRegData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

/* ============ Login ============ */
const loginRules = () => [
  body("account_email").trim().isEmail().withMessage("A valid email is required."),
  body("account_password").isLength({ min: 8 }).withMessage("Password is required."),
]

const checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    req.flash("message", errors.array()[0].msg)
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email
    })
  }
  next()
}

module.exports = { registrationRules, checkRegData, loginRules, checkLoginData }
