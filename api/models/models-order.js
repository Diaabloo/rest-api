const mongoose = require ('mongoose');

const orderSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,

    //find product named in order (stock)
    product : {type: mongoose.Schema.Types.ObjectId,
               //search in product
               ref:'Product',
              //  required: true
             },

    quantity : {type: Number , default: 1}
});

module.exports = mongoose.model('Order', orderSchema);