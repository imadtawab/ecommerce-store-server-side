// express
const express = require("express");
const products = require("../../models/admin/product_schema");
const orders = require("../../models/admin/order_schema");
const ordersModule = express.Router();
const jwt = require("jsonwebtoken")

// admin/orders/......
ordersModule.get("/", async (req , res) => {
    console.log(req.cookies._auth);
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    orders.find({userId: _id}).then((orders) => {
        res.json({success: true , data: orders})
    }).catch(err => console.log(err))
})
ordersModule.get("/dashboard-order-data" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    orders.find({userId: _id}).then(async (orders) => {
        let today = await new Date().setHours(0,0,0,0)
        let todayOrders = await orders.filter(order => order.addedIn >= today)
        let todayRevenue = await [0 , ...todayOrders.map(o => [0 , ...o.shoppingCard.map(o => [0, ...o.variants.map(v => v.quantiteUser * v.salePrice)].reduce((a,b) => a + b))].reduce((a,b) => a + b))].reduce((a,b) => a + b)
        let todayOrdersNumber = await todayOrders.length

        let month = await new Date(new Date(new Date().setDate(1)).setHours(0,0,0,0))
        let monthOrders = await orders.filter(order => order.addedIn >= month)
        let monthRevenue = await monthOrders.map(o => o.shoppingCard.map(o => o.variants.map(v => v.quantiteUser * v.salePrice).reduce((a,b) => a + b)).reduce((a,b) => a + b)).reduce((a,b) => a + b)
        let monthChartData = await monthOrders.map(o => {return {date: o.addedIn , count: o.shoppingCard.map(o => o.variants.map(v => {return {q:v.quantiteUser , p:v.salePrice , c:o.categorie }}))}})
        let monthChartData_Sales = await monthChartData.map(o => {return {date: {day: new Date(o.date).getDate() , month: new Date(o.date).getMonth()+1}, count: o.count.map(o => o.map(o => o.q).reduce((a,b) => a + b)).reduce((a,b) => a + b)}})
        let monthChartData_Revenue = await monthChartData.map(o => {return {date: {day: new Date(o.date).getDate() , month: new Date(o.date).getMonth()+1}, count: o.count.map(o => o.map(o => o.q * o.p).reduce((a,b) => a + b)).reduce((a,b) => a + b)}})
        let monthChartData_Categorie = await monthChartData.map(o => {return {date: {day: new Date(o.date).getDate() , month: new Date(o.date).getMonth()+1}, count: o.count.map(o => o.map(o => {
            let count = []
            for (let i = 0; i < o.q; i++) {
                count.push(o.c)                
            }
            return count
        }).reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])])).reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])])}})
        let monthTopProductsSaling = await monthOrders.map(o => {
            return o.shoppingCard.map(s => {
                return {
                    _id: s._id,
                    image: s.media.images[0],
                    name: s.name,
                    categorie: s.categorie,
                    numberOfSales: s.variants.map(v => v.quantiteUser).reduce((a,b) => a + b)
                }
            }).reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])])
        })
        .reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])])
        let totalRevenue = await orders.map(o => o.shoppingCard.map(o => o.variants.map(v => v.quantiteUser * v.salePrice).reduce((a,b) => a + b)).reduce((a,b) => a + b)).reduce((a,b) => a + b)
        
        let final_dataChart_Sales = []
        let final_dataChart_Revenue = []
        let final_dataChart_Categorie = []
        let monthChartData_maxDay = await monthChartData_Sales.reduce((a,b) => a.date.day > b.date.day ? a : b).date.day

        for (let i = 1; i <= monthChartData_maxDay; i++) {
            final_dataChart_Sales.push({
                day: i,
                count: [0,...monthChartData_Sales.map(o => o.date.day === i && o.count).filter(o => o !== false)].reduce((a, b) => a+b)
            })
            final_dataChart_Revenue.push({
                day: i,
                count: [0,...monthChartData_Revenue.map(o => o.date.day === i && o.count).filter(o => o !== false)].reduce((a, b) => a+b)
            })
            final_dataChart_Categorie.push({
                day: i,
                count: ([[],...monthChartData_Categorie.map(o => o.date.day === i && o.count).filter(o => o !== false)].reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])]))
            })
        }
        // .map(o => o.date.day === 13 ? o.count : false)
        // res.json({m : final_dataChart})
        // console.log(at)
    
        
        let categorie_count = {}
        // true v
        // final_dataChart_Categorie = final_dataChart_Categorie.map(item => {
        //     categorie_count = {}
        //     item.count.forEach(a => {
        //         if (Object.keys(categorie_count).indexOf(a) === -1) {
        //             categorie_count[a] = 1
        //         } else {
        //             categorie_count[a] += 1
        //         }
        //     })
        //     return {
        //         day: item.day,
        //         count: categorie_count
        //     }
            
        // })
        // end true ^
         final_dataChart_Categorie.forEach(item => {
            // categorie_count = {}
            item.count.forEach(a => {
                if (Object.keys(categorie_count).indexOf(a) === -1) {
                    categorie_count[a] = 1
                } else {
                    categorie_count[a] += 1
                }
                
            })
            
        })

        let topProductsSaling_count = []

        console.log(monthTopProductsSaling)
        monthTopProductsSaling.forEach(item => {
            let checkIfExist = topProductsSaling_count.filter(p => p._id+"" === item._id+"")
            if (checkIfExist.length === 0) {
                // topProductsSaling_count.push(checkIfExist)
                topProductsSaling_count.push(item)
            } else {
                let result = topProductsSaling_count.map((p,i) => {
                    if (p._id+"" === item._id+"") {
                        return {
                            ...p,
                            numberOfSales: p.numberOfSales + item.numberOfSales
                        }
                    }
                    return p
                })
                topProductsSaling_count = result
            }
            
        })

        // Sorting numbers in descending order
        topProductsSaling_count.sort(function(a, b) {
        return b.numberOfSales - a.numberOfSales;
        });


    //    res.json({topProductsSaling_count,monthTopProductsSaling})
        await res.json({success: true , data: {    
            todayRevenue,
            monthRevenue,
            totalRevenue,
            todayOrdersNumber,
            todayVisitors: "//5",
            convetionRate: "//6",
            monthChartData_Sales:{
                month,
                data: final_dataChart_Sales
            }
            ,
            monthChartData_Revenue:{
                month,
                data: final_dataChart_Revenue
            },
            monthChartData_Categorie:{
                month,
                // data: final_dataChart_Categorie,
                data: categorie_count
            },
            monthChartData_TopProductsSaling:{
                month,
                data: topProductsSaling_count
            },
            
        }})

    }).catch(err => console.log(err))
})
ordersModule.get("/filter", async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)

    let startTime = new Date().setHours(0,0,0,0)
    // let filterObject = {userId: _id}
    // // || {$in:  ["pending" , "confirmed" , "shipped" , "delivered" , "cancelled" , "on_hold" , "delayed" , "returned"]}
    // if(req.query.status && req.query.status !== "false") {
    //     filterObject["current_status.name"] = req.query.status
    // }
    // if(req.query.time === "today"){
    //     filterObject.addedIn = {
    //             $gte: startTime // || 0
    //     }
    // }
    // orders.find(filterObject).then((order_filters) => {
    //     res.json({success: true , subData: orders, data: order_filters})
    // }).catch(err => console.log(err))
    orders.find({userId: _id}).then((orders) => {

        if(req.query.status && req.query.status !== "false"){
            // status[order.status.length - 1]
            res.json({success: true , subData: orders, data: orders.filter(order => order.current_status.name === req.query.status)})
            return
        }

        if(req.query.time === "today"){
            let startTime = new Date().setHours(0,0,0,0)
            console.log(startTime , 1202);
            res.json({success: true , subData: orders, data: orders.filter(order => order.addedIn >= startTime)})
            return
        }
        res.json({success: true , subData: orders, data: orders})
    }).catch(err => console.log(err))
})
ordersModule.get("/:id", async (req , res) => {
    console.log(req.cookies._auth);
    const userId = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    orders.findById(req.params.id).then((order) => {
        // console.log(order);
        if(!order){
            return res.json({success: false , error: "Error 404: Not Found"})
        }
        if(order.userId !== userId._id){
            return res.json({success: false , error: "Error 504: Authorisation falied"})
        }
        res.json({success: true , data: order})
    }).catch(err => res.json({success: false , error: "Error 404: Not Found"}))
})
ordersModule.post("/new-order",async (req , res) => {
    products.find({"_id": req.body.shoppingProducts.map(p => p.productId)}).then(async (productsSelect) => {
        let finalyProducts = productsSelect.map( prod => {
            let userProduct = req.body.shoppingProducts.find(up => up.productId === prod._id.toString())
            let variantsSelect = []
            console.log(123456,userProduct,654321);
            if(userProduct.productId !== userProduct.variants[0].variantId){
                prod.variants.forEach(v => {
                    userProduct.variants.forEach(userV => {
                        if(v.variantId === userV.variantId){
                            variantsSelect.push({
                                ...v,
                                quantiteUser: userV.quantiteUser,
                                totalPrice: userV.quantiteUser * v.salePrice
                            })
                        }
                })
            })
            }else{
                console.log(prod,36);
                variantsSelect.push({
                    ...userProduct.variants[0],
                    salePrice: prod.prices.salePrice
                })
            }
            console.log(userProduct,123);
            prod.variants = variantsSelect
            return prod
            // return {
            //     ...prod,
            //     variantsSelect: "ddd"
            // }
            
        })
        // console.log("-------------------------",finalyProducts,"!!!!!!!!!!!!!!!!!!!!!");
        let myUsers = []
        finalyProducts.forEach(prod => {
            let userExist = myUsers.find(user => user.userId === prod.userId)
            if (userExist) {
                myUsers = myUsers.map((user) => {
                    if (user.userId === prod.userId) {
                        return {
                            ...user,
                            products : [...user.products , prod]
                        }
                    } return user
                })
            } else {
                myUsers.push({
                    userId: prod.userId,
                    products : [prod]
                })
            }
        });
        myUsers.forEach((user,index) => {
            new orders({
                shoppingCard: user.products,
                userId: user.userId,
                ...req.body.userInformation,
                addedIn: Date.now(),
                status: [{
                    name: "pending",
                    addedIn: Date.now()
                }],
                current_status: {
                    name: "pending",
                    addedIn: Date.now()
                }
            }).save().then((docs) => {
                console.log(docs,9999);
                if (myUsers.length - 1 === index) {
                    res.json({success: true, data: myUsers})
                }
            })
        })
    }).catch((err) => console.log(err))
    // Handle users
    // let myUsers = []
    // await req.body.product.forEach(prod => {
    //     let userExist = myUsers.find(user => user.userId === prod.userId)
    //     if (userExist) {
    //         myUsers = myUsers.map((user) => {
    //             if (user.userId === prod.userId) {
    //                 return {
    //                     ...user,
    //                     products : [...user.products , prod]
    //                 }
    //             } return user
    //         })
    //     } else {
    //         myUsers.push({
    //             userId: prod.userId,
    //             products : [prod]
    //         })
    //     }
    // });
    // console.log(myUsers,88888);



    // myUsers.forEach(async user => {
    //     // console.log(user,1111);
    //     async function aaa(a){
    //        let lastProducts = []
    //     await user.products.forEach(async userP =>  {
    //         // console.log(userP,2222);
    //         await products.find({"_id": user.products.map(p => p.productId)}).then(async prds => {
    //             // console.log(prds,3333);
    //             await prds.forEach(prod => {
    //                 console.log(prod._id.toString() === userP.productId,4444);
    //                 if(prod._id.toString() === userP.productId){
    //                   let lastVariants = userP.variants.map(v => v.variantId)
    //                   console.log(lastVariants,5555);
    //                   let prod1 = prod
    //                   let lastProd = {
    //                       ...prod1,
    //                       variants: prod1.variants.map(v => {
    //                         if(lastVariants.indexOf(v.variantId) !== -1) {
    //                           return {...v, quantiteUser:  userP.variants[lastVariants.indexOf(v.variantId)].quantiteUser}
    //                         //   return v
    //                           }
    //                           return  false
    //                         }).filter(e => e !== false)
    //                   }
    //                   console.log(lastProd,6666);
    //                   a.push(lastProd)
    //                 // lastProducts = [...lastProducts , lastProd]
    //                 }
    //               })
    //         }).catch(err => console.log(err))
    //         return a
    //     })
    //    }
    //    let b = aaa()
    //     await console.log(b,7777);
    //     await res.json({success: true, data: await aaa()})
    //     console.log("-------------------")

    //   })
    // myUsers.forEach(async (user) => {
    //     let AllProducts = []
    //     products.find({"_id": user.products.map(p => p.productId)}).then(prds => {
    //         //  let result = prds.map(prod => {
    //         //      return user.products.map(userProd => {
    //         //          if(prod._id === userProd.productId){
    //         //             console.log("******************",prod._id, userProd.productId,"*******************")
    //         //             let userVariants = userProd.variants.map(v => variantId)
    //         //              return {
    //         //                 ...prod,
    //         //                 variants: prod.variants.map(v => {
    //         //                     if (userVariants.indexOf(v.variantId) === -1) {
    //         //                         return false
    //         //                     }
    //         //                     return v
    //         //                 }).filter(v => v !== false)
    //         //             }
    //         //         }
    //         //         return false

    //         //     }).filter(p => p !== false)
            
    //         })
            
    //         res.json({success: true, data: myUsers})
    //         // let products = prds.map(prod => {
    //             // return {
    //                 // ...prod,
    //                 // variants: prod.variants.map(v => {
    //                 //     if (userVariants.indexOf(v.variantId) === -1) {
    //                 //         return false
    //                 //     }
    //                 //     return v
    //                 // }).filter(v => v !== false)
    //             // }
    //         // })
    //     }).catch(err => console.log(err,3.355))

        // let allProduct = []
        // await user.products.forEach(async prod => {
            //     await products.findById(prod.productId)
            // .then(async (p) => {
                //     allProduct = [...allProduct , p]
                // }).catch(err => res.json({success: false , error: "Failed To Place Order", err}))
                // })
                // console.log("################### start :" , allProduct, "################ end1");
            // })
            // res.json({success: true, data: myUsers})
            // products.findById(req.body.product.productId).then(product => {
        // if(!product) return res.json({success: false , error: "Failed To Place Order"})
        // console.log(product);
    // }).catch(err => res.json({success: false , error: "Failed To Place Order"}))
})
ordersModule.put("/change-order-status", (req , res) => {
    console.log(req.body);
    orders.findById(req.body.orderId).then((order) => {
        order.status = [ ...order.status ,{
            name: req.body.status,
            addedIn: Date.now()
        }]
        order.current_status = {
            name: req.body.status,
            addedIn: Date.now()
        }
        // order.status = [{name: "pending" , addedIn: Date.now()}]
        // order.status = []
        order.save().then((docs) => {
            res.json({success: true , data: docs})
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
})
ordersModule.put("/delete-order-status", (req , res) => {
    console.log(req.body);
    orders.findById(req.body.orderId).then((order) => {
        order.status = order.status.filter((s,index) => index !== req.body.statusIndex)
        order.current_status = order.status[order.status.length - 1]
        // order.status = [{name: "pending" , addedIn: Date.now()}]
        // order.status = []
        order.save().then((docs) => {
            res.json({success: true , data: docs})
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
})

ordersModule.put("/new-personal-note", (req , res) => {
    console.log(req.body,5);
    orders.findById(req.body.orderId).then((order) => {
        order.personal_Notes = [...order.personal_Notes , req.body.personalNotes]
        // order.status = [{name: "pending" , addedIn: Date.now()}]
        // order.status = []
        order.save().then((docs) => {
            res.json({success: true , data: docs})
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
})
ordersModule.delete("/delete-order/:id" , (req , res) => {
    console.log(req.params.id);
    orders.deleteOne({_id: req.params.id}).then((docs) => {
            res.json({success: true , data: docs})
    }).catch(err => console.log(err))
})
ordersModule.put("/update-many-status" , (req , res) => {
    orders.updateMany({"_id": req.body.items} , {
         $push: { status: {
            name: req.body.status,
            addedIn: Date.now()
          } } 
          ,
          current_status: {
            name: req.body.status,
            addedIn: Date.now()
          }
    }).then((prdcs) => {
      res.json({success: true , data: req.body})
    }).catch(err => console.log(err))
  })
ordersModule.put("/delete-many-status" , (req , res) => {
orders.deleteMany({"_id": req.body.items}).then((prdcs) => {
    res.json({success: true , data: req.body})
}).catch(err => console.log(err))
})
module.exports = ordersModule;