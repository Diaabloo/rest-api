const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')


const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/user')


mongoose.connect('mongodb+srv://amine_elalami:Motdepasse@cluster0.w1dnqlw.mongodb.net/?retryWrites=true&w=majority');

mongoose.Promise = global.Promise;



//Middleware to use morgan
app.use(morgan('dev'))

//use the uploads folder as public folder with middleware (express.static)
app.use('/uploads',express.static('uploads'))

//Middleware to use body-parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Middleware CORS (Cross-Origin Resource Sharing) error localhost
//"*" means access from any localhost(path)
app.use((req,res,next)=>{
      res.header("Access-Control-Allow-Origin","*");
      res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
      if(req.method === "OPTIONS"){
            res.header("Access-Control-Allow-Methods","PUT, POST, PATCH, DELETE, GET");
            return res.status(200).json({});
      }
      next();
})

//Middleware enter to products , orders and user files and passe his concept
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/user', userRoutes)

//middleware for Errors
app.use((req,res,next)=>{
      const error = new Error('NOT FOUND')
      error.status = 404;
      next(error)
})

app.use((error,req,res)=>{
      res.status(error.status || 500);
      res.json({
            error : {
                  message : error.message
            }
      })
})


module.exports = app;