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
    message: req.flash("message"),
    account_email: ""
  })
}

async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    message: req.flash("message"),
    account_firstname: "",
    account_lastname: "",
    account_email: ""
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

      return res.redirect("/account/")
    } else {
      req.flash("message", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
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

    const newAccount = await accountModel.registerAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_password: hashedPassword,
    })

    if (!newAccount) {
      req.flash("message", "Registration failed, please try again.")
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      })
    }

    req.flash("message", "Nice! Account created. Please log in.")
    return res.redirect("/account/login")
  } catch (err) {
    req.flash("message", "That email may already be in use. Please try a different one.")
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: null,
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
    res.redirect("/")
  })
}

module.exports = {
  buildLogin,
  buildRegister,
  accountLogin,
  registerAccount,
  logoutAccount
}
