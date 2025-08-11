/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session") 
const flash = require("express-flash")     
const env = require("dotenv").config()

const baseController = require("./controllers/baseController")
const pool = require("./database")
const utilities = require("./utilities")
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const cookieParser = require("cookie-parser")
const accountRoute = require("./routes/accountRoute")

/* ***********************
 * Middleware Setup
 *************************/
app.use(expressLayouts)
app.set("view engine", "ejs")
app.set("layout", "./layouts/layout")

app.use(session({
  secret: "superSecret",
  resave: false,
  saveUninitialized: true,
}))
app.use(flash())

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.use(cookieParser())
app.use(utilities.checkJWTToken)
app.use("/account", accountRoute)

app.use((req, res, next) => {
  res.locals.accountData = res.locals.accountData || req.session?.accountData || null
  next()
})

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Intentional error test route
app.get("/error-test", utilities.handleErrors(baseController.triggerError))

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * Error 404
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
