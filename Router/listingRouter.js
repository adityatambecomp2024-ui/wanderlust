require('dotenv').config();
const mbxClient = require('@mapbox/mapbox-sdk/services/geocoding');
const accesstoken = process.env.MAP_TOKEN;
const geocodingClient = mbxClient({ accessToken: accesstoken });

const express = require("express");
const router = express.Router();
const ListingModel = require("../model/Listing.js"); // ✅ नाव बदललं
const wrapAsync = require("../utils/wrapAsync.js");
const { isloggedin, isOwwner } = require("../middleware.js");
const { storage } = require("../cloudinary_config.js");
const multer = require('multer');
const upload = multer({ storage }).array('image', 10);
const UserVisit = require('../model/userVisit.js');
const tracker = require("../utils/HitTracker.js");
const user = require("../model/user.js");

// ✅ 1. INDEX ROUTE
router.get("/", wrapAsync(async (req, res) => {
    const alllist = await ListingModel.find({});
    const { customerId, deviceId, websiteId } = req.query;
    tracker.visitWebsite(customerId, deviceId, websiteId);
    const count = tracker.getOverallWebsiteHitCount(websiteId);
    const visit = await UserVisit.find({});
    let count2 = visit.length;
    const userreg = await user.find({});
    let count3 = userreg.length;
    res.render("./listing/index.ejs", { alllist, count, count2, count3 });
}))

// ✅ 2. SEARCH ROUTE
router.get("/search", wrapAsync(async (req, res) => {
    const { query, customerId, deviceId, websiteId } = req.query;
    tracker.visitWebsite(customerId, deviceId, websiteId);
    const count = tracker.getOverallWebsiteHitCount(websiteId);
    const visit = await UserVisit.find({});
    let count2 = visit.length;
    const userreg = await user.find({});
    let count3 = userreg.length;

    if (!query) {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listing");
    }
    const listings = await ListingModel.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { country: { $regex: query, $options: 'i' } }
        ]
    });
    res.render("./listing/index.ejs", { alllist: listings, count, count2, count3 });
}));

// ✅ 3. NEW ROUTE
router.get("/new", isloggedin, (req, res) => {
    res.render("./listing/add.ejs");
})

// ✅ 4. EDIT ROUTE
router.get("/:id/edit", upload, isloggedin, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await ListingModel.findById(id);
    if (!listing) {
        req.flash("error", "Listing you access to edit is already deleted");
        return res.redirect("/listing");
    }
    const editImageUrl = listing.image.map(image => {
        return image.path.replace("/upload", "/upload/h_300,w_250");
    });
    res.render("./listing/update.ejs", { listing, editImageUrl });
}))

// ✅ 5. CREATE POST
router.post("/", isloggedin, upload, wrapAsync(async (req, res) => {
    const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    const newlisting = new ListingModel(req.body.listing);
    newlisting.image = req.files.map(file => ({
        path: file.path,
        filename: file.filename
    }));
    newlisting.owner = req.user._id;
    newlisting.geometry = response.body.features.length > 0
        ? response.body.features[0].geometry
        : { type: "Point", coordinates: [0, 0] };

    await newlisting.save();
    req.flash("success", "New listing added successfully");
    res.redirect("/listing");
}))

// ✅ 6. SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await ListingModel.findById(id)
        .populate("Hotel")
        .populate({ path: "review", populate: { path: "author" } })
        .populate("owner");

    if (!list) {
        req.flash("error", "Listing you access is already deleted");
        return res.redirect("/listing");
    }

    console.log("Hotel array:", list.Hotel);
    console.log("Hotel length:", list.Hotel ? list.Hotel.length : 0);

    res.render("./listing/show.ejs", { list });
}))

// ✅ 7. UPDATE
router.put("/:id", upload, isOwwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const updatedListing = await ListingModel.findByIdAndUpdate(id, { ...req.body.listing });
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => ({
            path: file.path,
            filename: file.filename
        }));
        updatedListing.image.push(...newImages);
        await updatedListing.save();
    }
    req.flash("success", "Listing updated successfully");
    res.redirect("/listing");
}))

// ✅ 8. DELETE
router.delete("/:id", isOwwner, isloggedin, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await ListingModel.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted successfully");
    res.redirect("/listing");
}))

module.exports = router;