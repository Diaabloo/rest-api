const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/models-order');
const Product = require('../models/models-product');
const checkAuth = require('../middleware/check-auth')

router.get('/',checkAuth ,(req,res)=>{
      //find all product
      Order.find()
      .select('_id product quantity')
      //to call the field and set it to the characteristics of Orders and in specify select characteristics
      .populate('product','_id name')
      .exec()
      .then(ords => {
            res.status(201).json({
                  count : ords.length,
                  Order : ords.map(ord =>{
                        return{
                              _id : ord._id,
                              product: ord.product ,
                              quantity  : ord.quantity,
                              request:{
                                    type:'GET',
                                    URL : `http://localhost:3000/orders/${ord._id}`
                              }
                        }
                  })
            })
      })
      .catch(err => {
            res.status(500).json({
                  Error : err
            })
      })
})


router.post("/",checkAuth , (req, res, next) => {
      Product.findById(req.body.productId)
        .then(product => {
          if (!product) {
            return res.status(404).json({
              message: "Product not found"
            });
          }

        //use body-parser (body) with json
          const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
          });

          return order
            .save()
            .then(result => {
              console.log(result);
              res.status(201).json({
                message: "Order stored",
                createdOrder: {
                  _id: result._id,
                  product: result.product,
                  quantity: result.quantity
                },
                request: {
                  type: "GET",
                  url: "http://localhost:3000/orders/" + result._id
                }
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              });
            });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    });


//GET and DELETE order by Id
router.get('/:orderId',checkAuth ,(req,res)=>{
      Order.findById(req.params.orderId)
      .select('_id product quantity')
      //to call the field and set it to the characteristics of Orders
      .populate('product','_id name price')
      .exec()
      .then(ord => {
            if(!ord){
                  return res.status(404).json({message:"No valid entry found for provided ID"})
            }
            res.status(201).json({
                  order : ord,
                  request: {
                        type : 'GET',
                        url:`http://localhost:3000/orders`
                  }
            })
      })
      .catch(err => {
            res.status(500).json({
                  Error : err
            })
      })
})

router.delete('/:orderId',checkAuth ,(req,res)=>{
      Order.deleteOne({_id : req.params.orderId })
      .exec()
      .then(ord => {
            res.status(201).json({
                  message : "Order Deleted",
                  request : {
                        type : "POST",
                        url:"http://localhost:3000/orders" ,
                        body : {
                              productId : "ID",
                              quantity : "Number"
                        }
                  }
            })
      })
      .catch(err => {
                  res.status(500).json({
                        Error : err
                  })
            })
      })


module.exports = router;