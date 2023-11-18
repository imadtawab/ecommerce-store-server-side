// express
const express = require("express")
const route = express.Router()

// products Module 
const productsModule = require("../../modules/admin/productsModule")
const usersModule = require("../../modules/admin/usersModule")
const ordersModule = require("../../modules/admin/ordersModule")


// routes : "/admin"
route.get("/",(req ,res) => {
    res.send("dashboard")
})
// "/admin/products"
route.use("/products",productsModule)

// "/admin/account"
route.use("/account",usersModule)

// "/admin/orders"
route.use("/orders", ordersModule)

module.exports = route