const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


const User = require('../models/models-user')
//A library to help you hash passwords
const bcrypt = require('bcrypt');
//Json Web Token
const jwt = require("jsonwebtoken");

router.post('/signup',(req,res,next)=>{
    //check if email address already exist
    User.find({email : req.body.email})
    .exec()
    .then(user => {
        //.length for sure the user array is not by null (email > 0)
        if(user.length >=1 ){
            return res.status(409).json({
                message : ' Email already exist'
            });
        }else{
            //Hash the password before saving it in db
            bcrypt.hash(req.body.password, 10, (err,hash)=>{
                if(err){
                    return res.status(500).json({
                        Error : `The Error is ${err}`
                    });
                }else{
                    const user = new User ({
                        _id : new mongoose.Types.ObjectId,
                        email : req.body.email,
                        password : hash
                    });
                    //save the user in DB
                    user.save()
                    .then((done)=>{
                        console.log(done);
                        res.status(201).json({
                            message: 'User created successfully'
                        })
                    })
                    .catch((error)=>{
                        res.status(500).json({
                            message : `Error : ${error}`
                        })
                    })
                };
            });
        }
    }
    )
})

router.get('/signup',(req,res,next)=>{
        User.find()
        .select('_id email')
        .exec()
        .then((user)=>{
            res.status(201).json({
                users : user
            })

        })
        .catch((err)=>{
            res.status(500).json({
                error : err
            })
        })
})

router.post("/login", (req, res, next) => {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        //check User
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        //check password : compare with password exist in signup 'Load hash from your password DB'
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Authentication failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                  expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed"
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


router.get('/login',(req,res,next)=>{
    User.find()
    .exec()
    .then((user)=>{
        res.status(201).json({
            users : user
        })

    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        })
    })
})
router.delete('/:userId',(req,res,next)=>{
    User.deleteOne({_id :req.params.userId})
    .exec()
    .then(result => {
        res.status(201).json({
            message:'Deleted User Successfully!'
        })
    })
    .catch(err =>{
        res.status(500).json({
            error : err
        })
    })
})




module.exports = router;