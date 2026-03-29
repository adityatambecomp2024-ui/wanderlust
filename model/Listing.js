const mongoose = require("mongoose");
const schema = mongoose.Schema;

const listingSchema = new schema({
    title: String,
    description: String,
    image: [{
        path: String,
        filename: String,
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
    Hotel: [{
        type: schema.Types.ObjectId,
        ref: "Hotel",
    }],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
        }
    },
})

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        const Review = require("./Review.js");
        await Review.deleteMany({ _id: { $in: listing.review } });
    }
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;