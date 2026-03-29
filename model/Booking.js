// const mongoose = require("mongoose");

// const bookingSchema = new mongoose.Schema({
//   hotel:{
//     type: mongoose.Schema.Types.ObjectId,
//     ref:"Listing"
//   },
//   user:{
//     type: mongoose.Schema.Types.ObjectId,
//     ref:"User"
//   },
//   startDate: Date,
//   endDate: Date,
//   guests: {
//     type:Number,
//     default:1
//   }
// });

// module.exports = mongoose.model("Booking", bookingSchema);

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    startDate: Date,
    endDate: Date,
    guests: {
        type: Number,
        default: 1
    },
    // ✅ Payment fields add केले
    amount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    }
});

module.exports = mongoose.model("Booking", bookingSchema);