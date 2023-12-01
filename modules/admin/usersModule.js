// express
const express = require("express");
const usersModule = express.Router();
const users = require("../../models/admin/user_schema")
const bcrypt = require("bcrypt")
// multer
const multer = require("multer");
// JWT
const jwt = require("jsonwebtoken")
// fs
const fs  = require("fs")

// // cors
// const cors = require('cors')
// app.use(cors())

// "/admin/account"
usersModule.get("/auth/addAuthToState",async (req , res) => {
    const result = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    console.log(result);
    users.findById(result._id,{password: false}).then((user) => {
        if(user){
            return res.json({success: true , user , token: req.cookies._auth})
        }else{
            return res.json({success: false , error: "PLease Login In Your Account"})
        }
        console.log(docs);
    }).catch(err => console.log(err))
})
usersModule.post("/register" , (req , res) => {
    console.log(req.body);
    users.findOne({email : req.body.email}).then((user) => {
        if(!user){
            bcrypt.hash(req.body.password , +process.env.PASSWORD_KEY).then((hashPass) => {
                                new users({
                                        ...req.body,
                                        password: hashPass
                                    }).save().then((docs) => {
                                            return res.json({success: true , data: docs})
                                    }).catch(err => console.log(err))
            }).catch(err => res.json({success: false , error: err}))
        }else{
           return res.json({success: false , error: "This email is already used"})
        }
    }).catch(err => console.log(err))
    
})
usersModule.post("/login" , (req , res) => {
    console.log(req.body);
    users.findOne({email : req.body.email}).then((user) => {
        if(user){
            bcrypt.compare(req.body.password , user.password ).then(async (pass) =>{
                if(pass){
                    const token = await jwt.sign(
                        {_id: user._id},
                        process.env.JWT_SECRET,
                        {expiresIn:"1d"}
                    );
                    res.cookie("token", token)
                    return res.json({success: true , user, token})
                }else{
                    return res.json({success: false , error: "Email or password is invalid"})
                }
            })
        }else{
           return res.json({success: false , error: "Email or password is invalid"})
        }
    }).catch(err => console.log(err))
    
})
usersModule.post("/attributes/new/:token" , async (req , res) => {
    console.log(req.body,req.params);
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then((user) => {
        console.log(user.attributes);
        user.attributes = [...user.attributes, req.body]
        user.save().then((docs) => {
            return res.json({success: true, data: docs.attributes})
        }).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Add Attribute"})
        })
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Add Attribute"})
    })
})
usersModule.get("/attributes" , async (req , res) => {
    console.log(req.body,req.params);
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then((user) => {
        return res.json({success: true , data: user.attributes})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To get Attributes"})
    })
})
usersModule.delete("/attributes/delete/:id" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then((user) => {
        user.attributes = user.attributes.filter(att => att._id !== req.params.id)
        // console.log(user.attributes , 9);
        user.save().then((docs) => {
            return res.json({success: true , data: docs.attributes, id: req.params.id})
        }).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Delete Attribute"})
        })
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Delete Attribute"})
    })
})
usersModule.put("/attributes/change-visibility" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then(async (user) => {
        user.attributes = await user.attributes.map(att => {
            if(att._id === req.body.id){
                console.log(att._id ,req.body.id,963)
                att = {
                    ...att,
                    publish : (req.body.visibility == "true" ? "false" : "true")
                }
                // att.publish = (req.body.visibility == "true" ? "false" : "true")
                // return att
            }
            return att
        })
        console.log(user.attributes , 9);
        // user.attributes =[]
        user.save().then((docs) => {
            console.log(docs,10);
            return res.json({success: true , data: docs.attributes})
        }).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Changed Visisblity"})
        })
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
})
usersModule.put("/attributes/update" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then(async (user) => {
        user.attributes = await user.attributes.map(att => {
            if(att._id === req.body._id){
                console.log(att._id ,req.body.id,963)
                att = req.body
                // att.publish = (req.body.visibility == "true" ? "false" : "true")
                // return att
            }
            return att
        })
        console.log(user.attributes , 9);
        // user.attributes =[]
        user.save().then((docs) => {
            console.log(docs,10);
            return res.json({success: true , data: docs.attributes})
        }).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Update Attribute"})
        })
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Update Attribute"})
    })
})
usersModule.put("/attributes/update-many-status" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then(async (user) => {
        user.attributes = await user.attributes.map(att => {
            if(req.body.items.indexOf(att._id) !== -1){
                return {
                    ...att,
                    publish: req.body.status
                }
            }
            return att
        })
        user.save().then((docs) => {
            return res.json({success: true , data: docs.attributes, items: req.body.items})
        }).catch(err => {
            return res.json({success: false , error: "Failed To Changed Visisblity"})
        })
    }).catch(err => {
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
  })
usersModule.put("/attributes/delete-many-status" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then(async (user) => {
        user.attributes = await user.attributes.filter(att => req.body.items.indexOf(att._id) === -1)
        user.save().then((docs) => {
            return res.json({success: true , data: docs.attributes , items: req.body.items})
        }).catch(err => {
            return res.json({success: false , error: "Failed To Changed Visisblity"})
        })
    }).catch(err => {
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
    // products.deleteMany({"_id": req.body.items}).then((prdcs) => {
    //   res.json({success: true , data: req.body})
    // }).catch(err => console.log(err))
})
// #####################
const storage = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./public/uploads");
      },
      filename: function (req, file, cb) {
        console.log(file,5);
        cb(null, `${Date.now()}_${file.originalname.replace("+","")}`);
      },
    }),
  });
usersModule.post("/categories/new/:token" , storage.single("image"), async (req , res) => {
    console.log(req.body , req.file , req.files, 333);
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then((user) => {
        console.log(user.categories);
        user.categories = [...user.categories, {
            _id: req.body._id,
            name: req.body.name,
            description: req.body.description,
            publish: req.body.publish,
            image: req?.file ? req?.file.filename : false
        }]
        user.save().then((docs) => {
            return res.json({success: true, data: docs.categories})
        }).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Add Categorie"})
        })
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Add Categorie"})
    })
})
usersModule.get("/categories" , async (req , res) => {
    console.log(req.body,req.params);
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then((user) => {
        return res.json({success: true , data: user.categories})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To get Categories"})
    })
})
usersModule.delete("/categories/delete/:id" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then((user) => {
        user.categories = user.categories.filter(att => att._id !== req.params.id)
        // console.log(user.categories , 9);
        user.save().then((docs) => {
            return res.json({success: true , data: docs.categories, id: req.params.id})
        }).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Delete Categorie"})
        })
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Delete Categorie"})
    })
})
usersModule.put("/categories/change-visibility" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then(async (user) => {
        user.categories = await user.categories.map(att => {
            if(att._id === req.body.id){
                console.log(att._id ,req.body.id,963)
                att = {
                    ...att,
                    publish : (req.body.visibility == "true" ? "false" : "true")
                }
                // att.publish = (req.body.visibility == "true" ? "false" : "true")
                // return att
            }
            return att
        })
        console.log(user.categories , 9);
        // user.categories =[]
        user.save().then((docs) => {
            console.log(docs,10);
            return res.json({success: true , data: docs.categories})
        }).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Changed Visisblity"})
        })
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
})
usersModule.put("/categories/update" ,storage.single("image"), async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    console.log(req.file , 6666);
    users.findById(_id).then(async (user) => {
        user.categories = await user.categories.map(att => {
            if(att._id === req.body._id){
                // console.log(att._id ,req.body.id,963)
                att = {  
                    _id: req.body._id,
                    name: req.body.name,
                    description: req.body.description, 
                    publish: req.body.publish,
                    image: req?.file ? req?.file.filename : !req.body.delete ? att.image : false
                }
                // att.publish = (req.body.visibility == "true" ? "false" : "true")
                // return att
            }
            return att
        })
        // console.log(user.categories , 9);
        // user.categories =[]
        user.save().then((docs) => {
            // console.log(docs,10);
            return res.json({success: true , data: docs.categories})
        }).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Update Categorie"})
        })
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Update Categorie"})
    })
})
usersModule.put("/categories/update-many-status" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then(async (user) => {
        user.categories = await user.categories.map(att => {
            if(req.body.items.indexOf(att._id) !== -1){
                return {
                    ...att,
                    publish: req.body.status
                }
            }
            return att
        })
        user.save().then((docs) => {
            return res.json({success: true , data: docs.categories, items: req.body.items})
        }).catch(err => {
            return res.json({success: false , error: "Failed To Changed Visisblity"})
        })
    }).catch(err => {
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
  })
usersModule.put("/categories/delete-many-status" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById(_id).then(async (user) => {
        user.categories = await user.categories.filter(att => req.body.items.indexOf(att._id) === -1)
        user.save().then((docs) => {
            return res.json({success: true , data: docs.categories , items: req.body.items})
        }).catch(err => {
            return res.json({success: false , error: "Failed To Changed Visisblity"})
        })
    }).catch(err => {
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
    // products.deleteMany({"_id": req.body.items}).then((prdcs) => {
    //   res.json({success: true , data: req.body})
    // }).catch(err => console.log(err))
})
// #####################
usersModule.put("/settings/profile/update" , storage.single("avatar"), async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    console.log(req.body, req.file?.filename ,1000000);

    users.updateOne({_id}, {...req.body, avatar: req.body?.emptyAvatar ? "" : req.file?.filename}).then(docs => {
        console.log(docs);
        // req.file?.filename && 
        if (req.body?.oldAvatar) {
            // http://localhost:3500/media/
            let path = `./public/uploads/${req.body?.oldAvatar.split("http://localhost:3500/media/",2)[1]}`
            fs.unlink(path,(err) => {
                if (err) {
                    console.log(err,"not deleted ???")
                } else {
                  console.log("deleted....");
    
                }
            })
        }
        if(!docs.acknowledged && !req.file?.filename && !req.body.emptyAvatar){
            res.json({success: false , error: "PLease Change Informations"})
            return
        }
        res.json({success: true , data: {...req.body , emptyAvatar: req.body?.emptyAvatar  , avatar: req.body?.emptyAvatar ? undefined : req.file?.filename}})
    }).catch(err => console.log(err))
})
usersModule.put("/settings/password/update" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById({_id}).then(user => {
        bcrypt.compare(req.body.current_password,user.password).then((pass_checked) => {
            if (pass_checked) {
                console.log(pass_checked);
                bcrypt.hash(req.body.new_password , +process.env.PASSWORD_KEY).then(hashPass => {
                    user.password = hashPass
                    user.save().then(newUser => {
                        res.json({success: "Password changed successfully"})  
                    }).catch(err => console.log(err))
                }).catch(err => console.log(err))
                return
            }
            res.json({success: false, error: "Password not changed !"})
        }).catch(err => console.log(err))
    })
})





// get user for testing
usersModule.get("/userrr" , storage.single("avatar"), async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    users.findById({_id} , {_id: true , email: true , userName: true, avatar: true , password: true}).then(user => {
        res.json(user)
    })
})

module.exports = usersModule;