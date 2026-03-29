const express=require("express");
const router=express.Router({mergeParams:true});

const Review = require("../model/Review.js");
const Listing=require("../model/Listing.js");
const ListingHotels=require("../model/Hotel.js");

const {listingValidation,reviewValidation}=require("../Schema.js");
const {urlredirect,isloggedin,isauthor}=require("../middleware.js");

const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");


//review
//post route
router.post("/reviews",isloggedin,wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
     const listing= await Listing.findById(id);
     const newreview=new Review(req.body.review);
     newreview.author=req.user._id;
     listing.review.push(newreview);

    await newreview.save();
    await listing.save();
    res.redirect(`/listing/${listing._id}`);
}))

//delete review route
router.delete("/reviews/:reviewId",isloggedin,isauthor,wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});
    req.flash("success","deleted review sucessfully");
    res.redirect(`/listing/${id}`);
}))

//post route
router.post("/hotels/:hotelid/reviews",isloggedin,wrapAsync(async(req,res,next)=>{
    let {hotelid}=req.params;
     const listing= await ListingHotels.findById(hotelid);
     const newreview=new Review(req.body.review);
     newreview.author=req.user._id;
     listing.review.push(newreview);

    await newreview.save();
    await listing.save();
    res.redirect(`/listing/${listing._id}`);
}))

//delete review route
router.delete("/hotels/:hotelid/reviews/:reviewId",isloggedin,isauthor,wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Review.findByIdAndDelete(reviewId);
    await ListingHotels.findByIdAndUpdate(id,{$pull:{review:reviewId}});
    req.flash("success","deleted review sucessfully");
    res.redirect(`/listing/${id}`);
}))

module.exports=router;