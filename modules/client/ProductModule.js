// express
const express = require("express");
const products = require("../../models/admin/product_schema");
const productsModule = express.Router();
const fs  = require("fs")
const jwt = require("jsonwebtoken")

// multer
const multer = require("multer");
const users = require("../../models/admin/user_schema");

// '/client/products'
const auth = (req,res,next) => {
  // jwt.verify(req.cookies.token, process.env.JWT_SECRET , (err, decoded) => {
  //   if(err){
  //     console.log(err);
  //     res.json({success: false, message: err})
  //     return
  //   }
  //   console.log(decoded,693) // bar
  // })
  next()
}
productsModule.get("/", auth , (req, res) => {
  // res.send("all products");
  products
    .find()
    .then((docs) => {
      res.json(docs.filter(p => p.productStatus.visibility === "true"));
    })
    .catch((err) => console.log(err));
});

module.exports = productsModule;
