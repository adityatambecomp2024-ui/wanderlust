const reviewSchema = require("./Review.js");
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const listingSchema = new schema({
    title: String,
    description: String,
    image: [{
        path: String,
        filename: String,
    }],

    // ✅ Rooms add केले
    rooms: [{
        roomType: {
            type: String,
            enum: ["Standard", "Deluxe", "Suite", "Family"],
            default: "Standard"
        },
        price: Number,
        capacity: {
            type: Number,
            default: 2
        },
        description: String,
        photos: [{
            path: String,
            filename: String,
        }]
    }],

    price: Number,
    review: [{
        type: schema.Types.ObjectId,
        ref: "Review",
    }],
    location: String,
    country: String,
    owner: {
        type: schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    bookings: [{
        type: schema.Types.ObjectId,
        ref: 'Booking'
    }],
})

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await reviewSchema.deleteMany({ _id: { $in: listing.review } });
        const Booking = require("./Booking.js");
        await Booking.deleteMany({ hotel: listing._id });
    }
})

const Hotel = mongoose.model("Hotel", listingSchema);

module.exports = Hotel;