const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation") 

// Management 
router.get(
  "/",
  utilities.requireAuth,
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Auth pages
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/logout", accountController.logoutAccount)

// Register
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Login 
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account Update
router.get(
  "/update/:account_id",
  utilities.requireAuth,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

router.post(
  "/update",
  utilities.requireAuth,
  regValidate.updateAccountRules(),   
  regValidate.checkUpdateAccount,    
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/update-password",
  utilities.requireAuth,
  regValidate.updatePasswordRules(), 
  regValidate.checkUpdatePassword,    
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router
