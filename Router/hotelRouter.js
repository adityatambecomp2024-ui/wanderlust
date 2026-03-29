require('dotenv').config();
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const accesstoken = process.env.MAP_TOKEN;
const geocodingClient = mbxgeocoding({ accessToken: accesstoken });

const express = require("express");
const router = express.Router();
const Listing = require("../model/Hotel.js");
const OrignListing = require("../model/Listing.js");
const Booking = require("../model/Booking.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingValidation, reviewValidation, bookingValidation } = require("../Schema.js");
const { isloggedin, isOwwner } = require("../middleware.js");
const { storage } = require("../cloudinary_config.js");
const multer = require('multer');

const upload = multer({ storage }).fields([
    { name: 'image', maxCount: 10 },
    { name: 'roomPhotos_0', maxCount: 10 },
    { name: 'roomPhotos_1', maxCount: 10 },
    { name: 'roomPhotos_2', maxCount: 10 },
    { name: 'roomPhotos_3', maxCount: 10 },
    { name: 'roomPhotos_4', maxCount: 10 },
]);

function validateBooking(req, res, next) {
    const { error } = bookingValidation.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// ✅ Add new hotel - GET
router.get("/:id/hotels/new", isloggedin, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await OrignListing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }

    if (!req.user._id.equals(listing.owner._id)) {
        req.flash("error", "Only the location owner can add hotels");
        return res.redirect(`/listing/${id}`);
    }

    res.render("./Hotel/add.ejs", { id });
}))

// ✅ Add Rooms to existing hotel - GET
router.get("/:id/hotels/:hotelid/addrooms", isloggedin, wrapAsync(async (req, res) => {
    let { id, hotelid } = req.params;
    res.render("./Hotel/addrooms.ejs", { id, hotelid });
}))

// ✅ Add Rooms to existing hotel - POST
router.post("/:id/hotels/:hotelid/addrooms", isloggedin, upload, wrapAsync(async (req, res) => {
    let { id, hotelid } = req.params;
    const hotel = await Listing.findById(hotelid);

    if (!hotel) {
        req.flash("error", "Hotel not found");
        return res.redirect(`/listing/${id}`);
    }

    if (req.body.rooms) {
        const roomsArray = Object.values(req.body.rooms);
        const newRooms = roomsArray.map((room, index) => {
            const roomPhotos = req.files[`roomPhotos_${index}`] || [];
            return {
                roomType: room.roomType,
                price: room.price,
                capacity: room.capacity,
                description: room.description,
                photos: roomPhotos.map(file => ({
                    path: file.path,
                    filename: file.filename
                }))
            };
        });

        hotel.rooms.push(...newRooms);
        await hotel.save();
    }

    req.flash("success", "Rooms added successfully!");
    res.redirect(`/listing/${id}`);
}))

// ✅ Edit hotel - GET
router.get("/:id/hotels/:hotelid/edit", isloggedin, wrapAsync(async (req, res) => {
    let { id, hotelid } = req.params;
    const listing = await Listing.findById(hotelid);

    if (!listing) {
        req.flash("error", "Listing you access to edit is already deleted");
        return res.redirect("/listing");
    }

    const editImageUrl = listing.image.map(image => {
        return image.path.replace("/upload", "/upload/h_300,w_250");
    });

    res.render("./Hotel/update.ejs", { id, listing, editImageUrl });
}))

// ✅ Add new hotel - POST
router.post("/:id/hotels", isloggedin, upload, wrapAsync(async (req, res) => {
    let { id } = req.params;

    if (!req.files || !req.files['image'] || req.files['image'].length === 0) {
        req.flash("error", "Please upload at least one image");
        return res.redirect(`/listing/${id}/hotels/new`);
    }

    if (!req.body.listing || !req.body.listing.location) {
        req.flash("error", "Please enter a location");
        return res.redirect(`/listing/${id}/hotels/new`);
    }

    let newlisting = new Listing(req.body.listing);
    const listing = await OrignListing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }

    newlisting.image = req.files['image'].map(file => ({
        path: file.path,
        filename: file.filename
    }));

    newlisting.owner = req.user._id;

    if (req.body.rooms) {
        const roomsArray = Object.values(req.body.rooms);
        newlisting.rooms = roomsArray.map((room, index) => {
            const roomPhotos = req.files[`roomPhotos_${index}`] || [];
            return {
                roomType: room.roomType,
                price: room.price,
                capacity: room.capacity,
                description: room.description,
                photos: roomPhotos.map(file => ({
                    path: file.path,
                    filename: file.filename
                }))
            };
        });
    }

    try {
        const response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();

        if (response.body.features && response.body.features.length > 0) {
            newlisting.geometry = {
                type: 'Point',
                coordinates: response.body.features[0].geometry.coordinates
            };
        }
    } catch (geocodeError) {
        console.warn("Geocoding failed:", geocodeError.message);
        newlisting.geometry = { type: 'Point', coordinates: [0, 0] };
    }

    listing.Hotel.push(newlisting);
    await newlisting.save();
    await listing.save();

    req.flash("success", "Hotel added successfully");
    res.redirect(`/listing/${id}`);
}))

// ✅ Show hotel
router.get("/:id/hotels/:hotelid", wrapAsync(async (req, res) => {
    let { id, hotelid } = req.params;
    const Orignlist = await OrignListing.findById(id)
        .populate("Hotel")
        .populate({ path: "review", populate: { path: "author" } })
        .populate("owner");

    const list = await Listing.findById(hotelid)
        .populate({ path: "review", populate: { path: "author" } })
        .populate("owner");

    if (!list) {
        req.flash("error", "Listing you access is already deleted");
        return res.redirect("/listing");
    }

    const bookings = await Booking.find({ hotel: hotelid }).populate('user');

    res.render("./Hotel/show.ejs", {
        id,
        list,
        Orignlist,
        bookings,
        userData: req.user
    });
}));

// ✅ Booking - POST
router.post("/:id/hotels/:hotelid/bookings", isloggedin, validateBooking, wrapAsync(async (req, res) => {
    const { id, hotelid } = req.params;
    const { startDate, endDate, guests } = req.body.booking;
    const hotel = await Listing.findById(hotelid);

    if (!hotel) {
        req.flash('error', 'Hotel not found');
        return res.redirect('/listing');
    }

    const newBooking = new Booking({
        startDate,
        endDate,
        guests: guests || 1,
        user: req.user._id,
        hotel: hotelid
    });

    await newBooking.save();
    hotel.bookings.push(newBooking);
    await hotel.save();

    req.flash('success', 'Booking created successfully');
    res.redirect(`/listing/${id}/hotels/${hotelid}`);
}));

// ✅ Update hotel - PUT
router.put("/:id/hotels/:hotelid", isloggedin, upload, wrapAsync(async (req, res) => {
    let { id, hotelid } = req.params;

    const hotel = await Listing.findById(hotelid);
    if (!hotel) {
        req.flash("error", "Hotel not found");
        return res.redirect(`/listing/${id}/hotels`);
    }

    if (!req.user._id.equals(hotel.owner._id)) {
        req.flash("error", "You are not authorized to update this hotel");
        return res.redirect(`/listing/${id}/hotels/${hotelid}`);
    }

    let updateData = { ...req.body.listing };

    if (updateData.location) {
        try {
            const response = await geocodingClient.forwardGeocode({
                query: updateData.location,
                limit: 1
            }).send();

            if (response.body.features && response.body.features.length > 0) {
                updateData.geometry = {
                    type: 'Point',
                    coordinates: response.body.features[0].geometry.coordinates
                };
            }
        } catch (err) {
            console.warn("Geocoding failed:", err.message);
        }
    }

    const updatedListing = await Listing.findByIdAndUpdate(hotelid, updateData, { new: true });

    if (req.files && req.files['image'] && req.files['image'].length > 0) {
        const newImages = req.files['image'].map(file => ({
            path: file.path,
            filename: file.filename
        }));
        updatedListing.image.push(...newImages);
        await updatedListing.save();
    }

    req.flash("success", "Hotel updated successfully");
    res.redirect(`/listing/${id}/hotels/${hotelid}`);
}))

// ✅ Delete hotel
router.delete("/:id/hotels/:hotelid", isloggedin, wrapAsync(async (req, res) => {
    let { id, hotelid } = req.params;
    const hotel = await Listing.findById(hotelid);

    if (!hotel) {
        req.flash("error", "Hotel not found");
        return res.redirect(`/listing/${id}/hotels`);
    }

    if (!req.user._id.equals(hotel.owner._id)) {
        req.flash("error", "You are not authorized to delete this hotel");
        return res.redirect(`/listing/${id}/hotels/${hotelid}`);
    }

    await OrignListing.findByIdAndUpdate(id, { $pull: { Hotel: hotelid } });
    await Listing.findByIdAndDelete(hotelid);

    req.flash("success", "Hotel deleted successfully");
    res.redirect(`/listing/${id}/hotels`);
}))

// ✅ Hotels index
router.get("/:id/hotels", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await OrignListing.findById(id)
        .populate({ path: "review", populate: { path: "author" } })
        .populate("owner")
        .populate("Hotel");

    if (!list) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }

    res.render("./Hotel/index.ejs", { list, id });
}))

module.exports = router;