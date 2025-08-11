const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require("dotenv").config()
const utilities = require("../utilities")
const accountModel = require("../models/account-model")

async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: req.flash("message").join(" "),
    account_email: ""
  })
}

async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    message: req.flash("message").join(" "),
    account_firstname: "",
    account_lastname: "",
    account_email: ""
  })
}

async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    message: req.flash("message").join(" "),
    errors: null,
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("message", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      message: req.flash("message").join(" "),
      account_email,
    })
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (match) {
      const safeAccount = { ...accountData }
      delete safeAccount.account_password

      req.session.accountData = safeAccount
      res.locals.accountData = safeAccount

      const token = jwt.sign(safeAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 }) 
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })

      req.flash("message", "You're logged in!")
      return res.redirect("/account/")
    } else {
      req.flash("message", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        message: req.flash("message").join(" "),
        account_email,
      })
    }
  } catch {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
 *  Process registration
 * ************************************ */
async function registerAccount(req, res, next) {
  const nav = await utilities.getNav()
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const result = await accountModel.registerAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_password: hashedPassword,
    })

    if (result?.duplicate) {
      req.flash("message", "That email is already in use. Please try a different one.")
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: null,
        message: req.flash("message").join(" "),
        account_firstname,
        account_lastname,
        account_email,
      })
    }

    if (!result) {
      req.flash("message", "Registration failed, please try again.")
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: null,
        message: req.flash("message").join(" "),
        account_firstname,
        account_lastname,
        account_email,
      })
    }

    req.flash("message", "Nice! Account created. Please log in.")
    return res.redirect("/account/login")
  } catch (err) {
    console.error("Registration error:", err)
    req.flash("message", "Something went wrong. Please try again.")
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      message: req.flash("message").join(" "),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
}

/* ****************************************
 *  Log out
 * ************************************ */
function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.session.destroy(() => {
    req.flash("message", "You’ve been logged out.")
    res.redirect("/")
  })
}

/* ****************************************
 *  Deliver update view
 * ************************************ */
async function buildUpdateAccount(req, res) {
  const nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id, 10)
  if (!res.locals.accountData || res.locals.accountData.account_id !== account_id) {
    req.flash("message", "Unauthorized")
    return res.redirect("/account/")
  }
  const acct = await accountModel.getAccountById(account_id)
  return res.render("account/update", {
    title: "Update Account",
    nav,
    message: req.flash("message"),
    errors: null,
    account_id: acct.account_id,
    account_firstname: acct.account_firstname,
    account_lastname: acct.account_lastname,
    account_email: acct.account_email,
  })
}

async function updateAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const ok = await accountModel.updateAccount({
    account_id: parseInt(account_id,10),
    account_firstname,
    account_lastname,
    account_email
  })
  if (!ok) {
    req.flash("message", "Update failed. Please try again.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      message: req.flash("message"),
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  }
  const fresh = await accountModel.getAccountById(parseInt(account_id,10))
  if (fresh) {
    req.session.accountData = {
      account_id: fresh.account_id,
      account_firstname: fresh.account_firstname,
      account_lastname: fresh.account_lastname,
      account_email: fresh.account_email,
      account_type: fresh.account_type
    }
  }
  req.flash("message", "Account updated successfully.")
  return res.redirect("/account/")
}

async function updatePassword(req, res) {
  const nav = await utilities.getNav()
  const { account_id, new_password } = req.body
  const hashed = await bcrypt.hash(new_password, 10)
  const ok = await accountModel.updatePassword(parseInt(account_id,10), hashed)
  if (!ok) {
    req.flash("message", "Password update failed. Please try again.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      message: req.flash("message"),
      errors: null,
      account_id,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
    })
  }
  req.flash("message", "Password updated successfully.")
  return res.redirect("/account/")
}

module.exports = {
  buildLogin,
  buildRegister,
  accountLogin,
  registerAccount,
  logoutAccount,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword
}
