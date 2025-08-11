const { body, validationResult } = require("express-validator")
const utilities = require(".")
const accountModel = require("../models/account-model")

const registrationRules = () => [
  body("account_firstname").trim().notEmpty().withMessage("Please provide a first name."),
  body("account_lastname").trim().notEmpty().withMessage("Please provide a last name."),
  body("account_email")
    .trim().isEmail().withMessage("A valid email is required.")
    .custom(async (email) => {
      const exists = await accountModel.checkExistingEmail(email)
      if (exists) throw new Error("That email is already in use. Please try a different one.")
    }),
  body("account_password")
    .isStrongPassword({ minLength: 12, minLowercase:1, minUppercase:1, minNumbers:1, minSymbols:1 })
    .withMessage("Password does not meet requirements."),
]

const checkRegData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav() 
    req.flash("message", errors.array()[0].msg)
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      message: req.flash("message").join(" "),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

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
      message: req.flash("message").join(" "),
      account_email: req.body.account_email
    })
  }
  next()
}

async function emailAvailableForUpdate(email, account_id) {
  const existing = await accountModel.getAccountByEmail(email)
  if (!existing) return true
  return String(existing.account_id) === String(account_id) 
}

const updateAccountRules = () => [
  body("account_id").toInt().isInt({ min:1 }).withMessage("Invalid account."),
  body("account_firstname").trim().notEmpty().withMessage("First name is required."),
  body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
  body("account_email").trim().isEmail().withMessage("A valid email is required.")
    .bail()
    .custom(async (email, { req }) => {
      const ok = await emailAvailableForUpdate(email, req.body.account_id)
      if (!ok) throw new Error("That email is already in use.")
      return true
    }),
]

const checkUpdateAccount = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()
  const nav = await utilities.getNav()
  return res.status(400).render("account/update", {
    title: "Update Account",
    nav,
    message: errors.array()[0].msg,
    errors: errors.array(),
    account_id: req.body.account_id,
    account_firstname: req.body.account_firstname,
    account_lastname: req.body.account_lastname,
    account_email: req.body.account_email,
  })
}

const updatePasswordRules = () => [
  body("account_id").toInt().isInt({ min:1 }).withMessage("Invalid account."),
  body("new_password")
    .isStrongPassword({ minLength:12, minLowercase:1, minUppercase:1, minNumbers:1, minSymbols:1 })
    .withMessage("Password does not meet requirements."),
]

const checkUpdatePassword = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()
  const nav = await utilities.getNav()
  return res.status(400).render("account/update", {
    title: "Update Account",
    nav,
    message: errors.array()[0].msg,
    errors: errors.array(),
    account_id: req.body.account_id,
    account_firstname: res.locals.accountData?.account_firstname ?? "",
    account_lastname: res.locals.accountData?.account_lastname ?? "",
    account_email: res.locals.accountData?.account_email ?? "",
  })
}

module.exports = { 
  registrationRules, 
  checkRegData, 
  loginRules, 
  checkLoginData, 
  updateAccountRules,
  checkUpdateAccount,
  updatePasswordRules,
  checkUpdatePassword 
}
