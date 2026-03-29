// // // const express = require("express");
// // // const router = express.Router();
// // // const Booking = require("../model/Booking");


// // // router.post("/listing/:listingId/bookings", async (req, res) => {    
// // //     try {
// // //         const booking = new Booking({
// // //             hotel: req.params.hotelId,
// // //             user: req.user._id,
// // //             startDate: req.body.booking.startDate,
// // //             endDate: req.body.booking.endDate,
// // //             guests: req.body.booking.guests || 1
// // //         });

// // //         await booking.save();
// // //         req.flash("success", "Hotel booked successfully!");
// // //         res.redirect("/listing/" + req.params.listingId + "/hotels/" + req.params.hotelId);
// // //     } catch (err) {
// // //         console.log(err);
// // //         res.send("Booking Error");
// // //     }
// // // });


// // // module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const Booking = require("../model/Booking");

// // router.post("/:listingId/bookings", async (req, res) => {    
// //     try {
// //         const booking = new Booking({
// //             hotel: req.params.listingId,  // ✅ listingId वापरतो
// //             user: req.user._id,
// //             startDate: req.body.booking.startDate,
// //             endDate: req.body.booking.endDate,
// //             guests: req.body.booking.guests || 1
// //         });

// //         await booking.save();
// //         req.flash("success", "Hotel booked successfully!");
// //         res.redirect("/listing/" + req.params.listingId);  // ✅ listing page वर redirect
// //     } catch (err) {
// //         console.log(err);
// //         req.flash("error", "Booking failed, please try again!");
// //         res.redirect("/listing");
// //     }
// // });

// // module.exports = router;

// const express = require("express");
// const router = express.Router();
// const Booking = require("../model/Booking");
// const Listing = require("../model/Listing");

// // Booking save route
// router.post("/:listingId/bookings", async (req, res) => {    
//     try {
//         const booking = new Booking({
//             hotel: req.params.listingId,
//             user: req.user._id,
//             startDate: req.body.booking.startDate,
//             endDate: req.body.booking.endDate,
//             guests: req.body.booking.guests || 1
//         });

//         await booking.save();
//         req.flash("success", "Hotel booked successfully!");
//         res.redirect("/listing/" + req.params.listingId);
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Booking failed!");
//         res.redirect("/listing");
//     }
// });

// // ✅ Booking History route
// router.get("/bookings/history", async (req, res) => {
//     try {
//         if (!req.user) {
//             req.flash("error", "Please login first!");
//             return res.redirect("/login");
//         }

//         const bookings = await Booking.find({ user: req.user._id })
//             .populate("hotel")
//             .sort({ _id: -1 }); // नवीन आधी

//         res.render("bookings/history.ejs", { bookings });
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/listing");
//     }
// });

// module.exports = router; 


// const express = require("express");
// const router = express.Router();
// const Booking = require("../model/Booking");
// const Listing = require("../model/Listing");

// // ✅ Booking save route
// router.post("/:listingId/bookings", async (req, res) => {    
//     try {
//         const booking = new Booking({
//             hotel: req.params.listingId,
//             user: req.user._id,
//             startDate: req.body.booking.startDate,
//             endDate: req.body.booking.endDate,
//             guests: req.body.booking.guests || 1
//         });

//         await booking.save();
//         req.flash("success", "Hotel booked successfully!");
//         res.redirect("/listing/" + req.params.listingId);
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Booking failed!");
//         res.redirect("/listing");
//     }
// });

// // ✅ Booking History route
// router.get("/bookings/history", async (req, res) => {
//     try {
//         if (!req.user) {
//             req.flash("error", "Please login first!");
//             return res.redirect("/login");
//         }

//         const bookings = await Booking.find({ user: req.user._id })
//             .populate("hotel")
//             .sort({ _id: -1 });

//         res.render("bookings/history.ejs", { bookings });
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/listing");
//     }
// });

// // ✅ Booking Cancel/Delete route - हे नवीन add केलं
// router.delete("/bookings/:bookingId", async (req, res) => {
//     try {
//         await Booking.findByIdAndDelete(req.params.bookingId);
//         req.flash("success", "Booking cancelled successfully!");
//         res.redirect("/bookings/history");
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/bookings/history");
//     }
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const Booking = require("../model/Booking");
// const Listing = require("../model/Listing");
// const User = require("../model/user");
// const { sendBookingConfirmation } = require("../utils/sendEmail");

// // ✅ Booking save route
// router.post("/:listingId/bookings", async (req, res) => {    
//     try {
//         const listing = await Listing.findById(req.params.listingId);
        
//         const booking = new Booking({
//             hotel: req.params.listingId,
//             user: req.user._id,
//             startDate: req.body.booking.startDate,
//             endDate: req.body.booking.endDate,
//             guests: req.body.booking.guests || 1
//         });

//         await booking.save();

//         // ✅ Total calculate करा
//         const days = Math.ceil(
//             (new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)
//         );
//         const total = days * listing.price;

//         // ✅ Email पाठवा
//         const user = await User.findById(req.user._id);
//         await sendBookingConfirmation(
//             user.email,
//             user.username,
//             listing.title,
//             booking.startDate,
//             booking.endDate,
//             booking.guests,
//             total
//         );

//         req.flash("success", "Hotel booked successfully! Confirmation email sent! 📧");
//         res.redirect("/listing/" + req.params.listingId);
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Booking failed!");
//         res.redirect("/listing");
//     }
// });

// // ✅ Booking History route
// router.get("/bookings/history", async (req, res) => {
//     try {
//         if (!req.user) {
//             req.flash("error", "Please login first!");
//             return res.redirect("/login");
//         }

//         const bookings = await Booking.find({ user: req.user._id })
//             .populate("hotel")
//             .sort({ _id: -1 });

//         res.render("bookings/history.ejs", { bookings });
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/listing");
//     }
// });

// // ✅ Booking Cancel/Delete route
// router.delete("/bookings/:bookingId", async (req, res) => {
//     try {
//         await Booking.findByIdAndDelete(req.params.bookingId);
//         req.flash("success", "Booking cancelled successfully!");
//         res.redirect("/bookings/history");
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/bookings/history");
//     }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Booking = require("../model/Booking");
const Listing = require("../model/Listing");
const User = require("../model/user");
const { sendBookingConfirmation } = require("../utils/sendEmail");

// ✅ Booking + Payment page
router.post("/:listingId/bookings", async (req, res) => {
    try {
        if (!req.user) {
            req.flash("error", "Please login first!");
            return res.redirect("/login");
        }

        const listing = await Listing.findById(req.params.listingId);

        const days = Math.ceil(
            (new Date(req.body.booking.endDate) - new Date(req.body.booking.startDate))
            / (1000 * 60 * 60 * 24)
        );
        const totalAmount = days * listing.price;

        // ✅ Pending booking save करा
        const booking = new Booking({
            hotel: req.params.listingId,
            user: req.user._id,
            startDate: req.body.booking.startDate,
            endDate: req.body.booking.endDate,
            guests: req.body.booking.guests || 1,
            amount: totalAmount,
            paymentStatus: "pending"
        });
        await booking.save();

        // ✅ Payment page वर जा
        res.render("bookings/payment.ejs", {
            listing,
            booking,
            totalAmount,
            days
        });

    } catch (err) {
        console.log(err);
        req.flash("error", "Booking failed!");
        res.redirect("/listing");
    }
});

// ✅ Payment confirm
router.post("/bookings/confirm/:bookingId", async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { paymentStatus: "paid" },
            { new: true }
        ).populate("hotel");

        // ✅ Email पाठवा
        const user = await User.findById(req.user._id);
        const days = Math.ceil(
            (new Date(booking.endDate) - new Date(booking.startDate))
            / (1000 * 60 * 60 * 24)
        );
        await sendBookingConfirmation(
            user.email,
            user.username,
            booking.hotel.title,
            booking.startDate,
            booking.endDate,
            booking.guests,
            booking.amount
        );

        req.flash("success", "Payment successful! Booking confirmed! 🎉");
        res.redirect("/listing/" + booking.hotel._id);
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listing");
    }
});

// ✅ Booking History
router.get("/bookings/history", async (req, res) => {
    try {
        if (!req.user) {
            req.flash("error", "Please login first!");
            return res.redirect("/login");
        }

        const bookings = await Booking.find({ user: req.user._id })
            .populate("hotel")
            .sort({ _id: -1 });

        res.render("bookings/history.ejs", { bookings });
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listing");
    }
});

// ✅ Booking Cancel
router.delete("/bookings/:bookingId", async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.bookingId);
        req.flash("success", "Booking cancelled successfully!");
        res.redirect("/bookings/history");
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/bookings/history");
    }
});

module.exports = router;