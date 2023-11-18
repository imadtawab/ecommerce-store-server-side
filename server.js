/**************************** */
/*******   Settings  ******** */
/**************************** */
// express
const express = require("express")
const app = express()

// dot env
require('dotenv').config();

// cors
const cors = require('cors')
app.use(cors({
    origin: [process.env.CLIENT_DOMAINE],
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true
}))
// app.use(cors())

// // cookiesParser
const cookieParser = require("cookie-parser")
app.use(cookieParser());



// json
// app.use(express.urlencoded()); // support encoded bodies
app.use(express.json());

// static folder
const path = require("path")
app.use(express.static(path.join(__dirname,"public")))


// Connect to mongodb
const mongoose=require('mongoose');
mongoose.connect(process.env.DB).then(() => {
    console.log("DATABASE connected ...");
    // listen 
    app.listen(process.env.PORT,() => console.log("Server Started : http://localhost:"+process.env.PORT))
}).catch((err)=> console.log(err))


/**************************** */
/*******   ADMIN     ******** */
/**************************** */
// Routers
const adminRouter = require("./routers/admin/AdminRouter")
app.use("/admin" ,adminRouter)

const clientRouter = require("./routers/client/ClientRouter")
app.use("/client" ,clientRouter)

app.get("/media/:img" , (req , res) => {
    res.sendFile(path.join(__dirname,"public/uploads",req.params.img))
})
// 404 
app.all("*", (req,res)=>{
    return res.status(404).json({
        message: "Page Not Found!"
    })
});



