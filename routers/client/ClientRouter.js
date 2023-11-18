// express
const express = require("express")
const productsModule = require("../../modules/client/ProductModule")
const route = express.Router()




// "/client/products"
route.use("/products",productsModule)

module.exports = route