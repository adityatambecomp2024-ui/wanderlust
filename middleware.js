const ListingModel = require("./model/Listing.js"); // ✅ नाव बदललं
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./model/Review.js");

module.exports.isloggedin = (req, res, next) => {
    console.log(req.originalUrl);
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must logged in");
        return res.redirect("/login");
    }
    next();
}

module.exports.urlredirect = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await ListingModel.findById(id); // ✅ ListingModel
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "the listing you access has different owner");
        return res.redirect(`/listing/${id}`);
    }
    next();
}

module.exports.isauthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "the review you delete has different owner");
        return res.redirect(`/listing/${id}`);
    }
    next();
}