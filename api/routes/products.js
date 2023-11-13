const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const checkAuth = require('../middleware/check-auth')


const Product = require('../models/models-product');
const multer = require('multer');



//DiskStorage The disk storage engine gives you full control on storing files to disk.
const storage = multer.diskStorage({
      destination: function(req, file, cb) {
            cb(null, './uploads');
      },
      filename: function(req, file, cb) {
        cb(null, file.originalname);
      }
    });

// for storing image or not with image extension
const fileFilter = (req, file, cb) => {
      // reject a file
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
      } else {
        cb(null, false);
      }
    };

const upload = multer({
      storage: storage,
      // limits: {
      //   fileSize: 1024 * 1024 * 5
      // },
      fileFilter: fileFilter
    });

// const upload = multer({dest : './uploads/'});




// "/" => /products is used in Middleware (app.js)

//get info product from data base
router.get('/', (req,res)=>{
      Product.find()
      //select only * name , price and id *
      .select('name price _id productImage')
      .exec()
      .then((pro)=>{
            const response = {
                  count: pro.length,
                  products: pro.map(pro => {
                        return{
                              _id : pro._id,
                              name : pro.name,
                              price  : pro.price,
                              productImage: pro.productImage,
                              request : {
                                    type:'GET',
                                    url : `http://localhost:3000/products/${pro._id}`
                              }
                        }
                  })
            }
            res.status(200).json(response)
      })
      .catch(err => {
            console.log(`the Error is : ${err}`);
            res.status(500).json({
                  error : err
            })
      })
})

//Create new product
router.post('/',checkAuth , upload.single('productImage'),(req,res,next)=>{
      //use multer to req file (product image)
      // console.log(req.file);

      if (!req.file) {
            return res.status(400).json({ message: 'Please select File' });
          }

      //use body-parser and mongoose
      const product = new Product({
            _id : new mongoose.Types.ObjectId(),
            name: req.body.name,
            price: req.body.price,
            productImage: req.file.path
      })
      //Method from Mongoose for save the product in DB
      product
      .save()
      .then( results  => {
            console.log(results);
            res.status(201).json({
                  message:"New Product Created successfully",
                  createdProduct: {
                        _id : results._id,
                        name : results.name,
                        price : results.price,
                        request : {
                              type : 'GET',
                              url : `http://localhost:3000/products/${results._id}`
                        }
                  }
            })
      })
      .catch( err => {
            console.log(err);
            res.status(500).json({
                  error:`Error Creating New Product ${err}`
            })
      })
})


// GET infos on single product by id
router.get('/:productId',(req,res)=>{
      const id= req.params.productId;
      Product.findById(id)
      .select('name price _id productImage')
      .exec()
      .then(pro => {
            console.log(`From Data Base ${pro}`);

            // if the value of product null or not null
            if(pro){
                  res.status(200).json({
                        product : pro,
                        request : {
                              type : 'GET',
                              url : `http://localhost:3000/products`
                        }
                  })
            }else{
                  res.status(404).json({
                        message : 'The id is not defined'
                  })
            }
      })
      .catch(err => {
            console.log(err);
            res.status(500).json({error : err})
      })

})

//update and delete product with id

//for updating in postman will use body (json) : *[{"propName" : "name" , "value": "new name of prod"}]
router.patch('/:productId',checkAuth ,(req,res)=>{
      const id = req.params.productId;
      const updateOps = {};
      for (const ops of req.body ) {
            updateOps[ops.propName] = ops.value;
      }
      Product.updateOne({ _id: id },{ $set: updateOps })
      .exec()
      .then(pro => {
            res.status(200).json({
                  message: `Updating Product`,
                  request : {
                        type : 'GET',
                        url:`http://localhost:3000/products/${id}`
                  }
            })
      })
      .catch(err => {
            console.log(`Error in updating ${err}`);
            res.status(500).json({
                  Error: err
            })
      })
})

router.delete('/:productId',checkAuth ,(req,res)=>{
      const id = req.params.productId;
      Product.deleteOne({ _id:id })
      .exec()
      .then( pro => {
            res.status(200).json({
                  message : `product is delete`,
                  request : {
                        type : 'POST',
                        url : 'http://localhost:3000/products',
                        body : {name : 'String' , price : 'Number'}
                  }
            })
      }).catch( err => {
            console.log('Error in deleting');
            res.status(404).json({
                  error  : `Error deleting ${err}`
            })
      })
})

module.exports = router;