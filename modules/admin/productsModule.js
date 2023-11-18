// express
const express = require("express");
const products = require("../../models/admin/product_schema");
const productsModule = express.Router();
const fs  = require("fs")
const jwt = require("jsonwebtoken")

// multer
const multer = require("multer");
const users = require("../../models/admin/user_schema");

// '/admin/products'
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
productsModule.get("/", auth , async (req, res) => {
  // res.send("all products");
  // const {userId} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
  products
    .find()
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => console.log(err));
});
productsModule.get("/:id", auth , (req, res) => {
  // res.send("all products");
  products
    .findById({ _id: req.params.id })
    .then(async (product) => {
      users.findById(product.userId).then((user) => {
          res.json({product,attributes: user.attributes});

      }).catch(err => console.log(err))

    })
    .catch((err) => console.log(err));
});
const storage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname.replace("+","")}`);
    },
  }),
});
productsModule.post("/new-product", auth , storage.array("images"), async (req, res) => {
  const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
  
  const {
    name,
    sku,
    categorie,
    description,
    originalPrice,
    salePrice,
    discount,
    urlKey,
    metaTitle,
    metaKeywords,
    metaDescription,
    status,
    visibility,
    quantite,
  } = req.body;
  new products({
    name,
    sku,
    categorie,
    description,
    prices: {
      originalPrice,
      salePrice,
      discount,
    },
    media: {
      images: req.files.map((file) => file.filename),
    },
    searchEngineOptimize: {
      urlKey,
      metaTitle,
      metaKeywords,
      metaDescription,
    },
    productStatus: {
      status,
      visibility,
    },
    quantite,
    variants: [],
    userId: _id
  })
    .save()
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => console.log(err, 5));
});
productsModule.delete("/delete/:id", auth , (req, res) => {
  products.findById({_id: req.params.id}).then(prod => {
    products
    .deleteOne({ _id: req.params.id })
    .then((docs) => {
      const pathImages = prod.media.images.map(img => `./public/uploads/${img}`)
      console.log(pathImages,55);
      // const path = "./public/uploads/" + req.body.oldStoreLogo
      pathImages.forEach(path => {
        fs.unlink(path,(err) => {
          if (err) {
              console.log(err,"not deleted ???")
          } else {
            console.log("deleted....");

          }
      })
      })
      res.json(req.params.id);
    })
    .catch((err) => console.log(err));
  }).catch(err => console.log(err))
});

productsModule.patch( "/editProduct/:id", auth ,storage.array("images"),async (req, res) => {
  console.log(req.query,"#####",req.body);
  
  const prodDB = await products.findById(req.params.id)
    const {
      name,
      sku,
      categorie,
      description,
      originalPrice,
      salePrice,
      discount,
      urlKey,
      metaTitle,
      metaKeywords,
      metaDescription,
      status,
      visibility,
      quantite
    } = req.body;
    const oldImages = req.query.oldImages.filter((img) => img !== "undefined");
    const prodEdited = {
      name,
      sku,
      categorie,
      description,
      prices: {
        originalPrice,
        salePrice,
        discount,
      },
      media: {
        images: [...oldImages, ...req.files.map((file) => file.filename)],
      },
      searchEngineOptimize: {
        urlKey,
        metaTitle,
        metaKeywords,
        metaDescription,
      },
      productStatus: {
        status,
        visibility,
      },
      quantite,
      variants: prodDB.variants
    }
    
    products
      .updateOne(
        { _id: req.params.id },
        prodEdited
      )
      .then((docs) => {
        console.log(oldImages,req.query.allImages,9899);

        const imagesForDelete = req.query.allImages.filter(img => oldImages.indexOf(img) === -1)
        const pathImages = imagesForDelete.map(img => `./public/uploads/${img}`)
        console.log(pathImages,55);
        // const path = "./public/uploads/" + req.body.oldStoreLogo
        pathImages.forEach(path => {
          fs.unlink(path,(err) => {
            if (err) {
                console.log(err,"not deleted ???")
            } else {
              console.log("deleted....");

            }
        })
        })
        console.log(prodEdited, 6666);
        res.json({_id: req.params.id,...prodEdited});
      })
      .catch((err) => console.log(err));
  }
);
productsModule.put("/change-visibility", auth , async (req, res) => {
  console.log(req.body.id, req.body.visibility, 9963);
  const prod =  await products.findById(req.body.id)
  console.log(prod,8888);
  prod.productStatus.visibility = (req.body.visibility == "true" ? "false" : "true")
  console.log(prod,9998);
      products.updateOne({_id:req.body.id},prod
        )
        .then((docs) => {
          console.log(docs,5555);
          res.json(prod);
        })
        .catch((err) => console.log(err,99999999999));
});
productsModule.put("/add-variants", auth , async (req, res) => {
  console.log(req.body,9999999999);
  const prod =  await products.findById(req.body.id)
  console.log(prod,8888);
  prod.variants = req.body.variants
  prod.attributes = req.body.attributes
  console.log(prod,9998);
      products.updateOne({_id:req.body.id},prod
        )
        .then((docs) => {
          console.log(docs,5555);
          res.json(prod);
        })
        .catch((err) => console.log(err,99999999999));
});
productsModule.put("/update-many-status" , auth , (req , res) => {
  products.updateMany({"_id": req.body.items} , {
    productStatus: {
      ...this,
      visibility: req.body.status
    }
  }).then((prdcs) => {
    res.json({success: true , data: req.body})
  }).catch(err => console.log(err))
})
productsModule.put("/delete-many-status" , auth , (req , res) => {
  products.deleteMany({"_id": req.body.items}).then((prdcs) => {
    res.json({success: true , data: req.body})
  }).catch(err => console.log(err))
})

module.exports = productsModule;
