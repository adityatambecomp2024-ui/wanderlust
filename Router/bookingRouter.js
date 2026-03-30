// // const express = require("express");
// // const router = express.Router();
// // const Booking = require("../model/Booking");
// // const Listing = require("../model/Listing");
// // const User = require("../model/user");
// // const { sendBookingConfirmation } = require("../utils/sendEmail");

// // // ✅ Booking + Payment page
// // router.post("/:listingId/bookings", async (req, res) => {
// //     try {
// //         if (!req.user) {
// //             req.flash("error", "Please login first!");
// //             return res.redirect("/login");
// //         }

// //         const listing = await Listing.findById(req.params.listingId);

// //         const days = Math.ceil(
// //             (new Date(req.body.booking.endDate) - new Date(req.body.booking.startDate))
// //             / (1000 * 60 * 60 * 24)
// //         );
// //         const totalAmount = days * listing.price;

// //         const booking = new Booking({
// //             hotel: req.params.listingId,
// //             user: req.user._id,
// //             startDate: req.body.booking.startDate,
// //             endDate: req.body.booking.endDate,
// //             guests: req.body.booking.guests || 1,
// //             amount: totalAmount,
// //             paymentStatus: "pending"
// //         });
// //         await booking.save();

// //         res.render("bookings/payment.ejs", {
// //             listing,
// //             booking,
// //             totalAmount,
// //             days
// //         });

// //     } catch (err) {
// //         console.log(err);
// //         req.flash("error", "Booking failed!");
// //         res.redirect("/listing");
// //     }
// // });

// // // ✅ Payment confirm
// // router.post("/bookings/confirm/:bookingId", async (req, res) => {
// //     try {
// //         const booking = await Booking.findByIdAndUpdate(
// //             req.params.bookingId,
// //             { paymentStatus: "paid" },
// //             { new: true }
// //         ).populate("hotel");

// //         const user = await User.findById(req.user._id);
// //         const days = Math.ceil(
// //             (new Date(booking.endDate) - new Date(booking.startDate))
// //             / (1000 * 60 * 60 * 24)
// //         );
// //         await sendBookingConfirmation(
// //             user.email,
// //             user.username,
// //             booking.hotel.title,
// //             booking.startDate,
// //             booking.endDate,
// //             booking.guests,
// //             booking.amount
// //         );

// //         req.flash("success", "Payment successful! Booking confirmed! 🎉");
// //         res.redirect("/listing/" + booking.hotel._id);
// //     } catch (err) {
// //         console.log(err);
// //         req.flash("error", "Something went wrong!");
// //         res.redirect("/listing");
// //     }
// // });

// // // ✅ Booking History - Debug सह
// // router.get("/bookings/history", async (req, res) => {
// //     try {
// //         if (!req.user) {
// //             req.flash("error", "Please login first!");
// //             return res.redirect("/login");
// //         }

// //         // ✅ Debug
// //         console.log("=== BOOKING HISTORY DEBUG ===");
// //         console.log("User ID:", req.user._id);
// //         console.log("Username:", req.user.username);

// //         const bookings = await Booking.find({ user: req.user._id })
// //             .populate("hotel")
// //             .sort({ _id: -1 });

// //         // ✅ Debug
// //         console.log("Bookings found:", bookings.length);
// //         bookings.forEach(b => {
// //             console.log("Booking:", b._id, "Hotel:", b.hotel?.title, "Status:", b.paymentStatus);
// //         });
// //         console.log("=== DEBUG END ===");

// //         res.render("bookings/history.ejs", { 
// //             bookings,
// //             receivedBookings: []
// //         });

// //     } catch (err) {
// //         console.log(err);
// //         req.flash("error", "Something went wrong!");
// //         res.redirect("/listing");
// //     }
// // });

// // // ✅ Booking Cancel
// // router.delete("/bookings/:bookingId", async (req, res) => {
// //     try {
// //         await Booking.findByIdAndDelete(req.params.bookingId);
// //         req.flash("success", "Booking cancelled successfully!");
// //         res.redirect("/bookings/history");
// //     } catch (err) {
// //         console.log(err);
// //         req.flash("error", "Something went wrong!");
// //         res.redirect("/bookings/history");
// //     }
// // });

// // module.exports = router;

// const express = require("express");
// const router = express.Router();
// const Booking = require("../model/Booking");
// const Listing = require("../model/Listing");
// const User = require("../model/user");
// const { sendBookingConfirmation } = require("../utils/sendEmail");

// // ==============================
// // ✅ CREATE BOOKING + PAYMENT PAGE
// // ==============================
// router.post("/:listingId/bookings", async (req, res) => {
//     try {
//         if (!req.user) {
//             req.flash("error", "Please login first!");
//             return res.redirect("/login");
//         }

//         const listing = await Listing.findById(req.params.listingId);

//         if (!listing) {
//             req.flash("error", "Listing not found!");
//             return res.redirect("/listing");
//         }

//         const days = Math.ceil(
//             (new Date(req.body.booking.endDate) - new Date(req.body.booking.startDate))
//             / (1000 * 60 * 60 * 24)
//         );

//         const totalAmount = days * listing.price;

//         // 🔥 MAIN FIX (owner add kelela ahe)
//         const booking = new Booking({
//             hotel: listing._id,
//             user: req.user._id,
//             owner: listing.owner,   // ✅ IMPORTANT
//             startDate: req.body.booking.startDate,
//             endDate: req.body.booking.endDate,
//             guests: req.body.booking.guests || 1,
//             amount: totalAmount,
//             paymentStatus: "pending"
//         });

//         await booking.save();

//         res.render("bookings/payment.ejs", {
//             listing,
//             booking,
//             totalAmount,
//             days
//         });

//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Booking failed!");
//         res.redirect("/listing");
//     }
// });


// // ==============================
// // ✅ PAYMENT CONFIRM
// // ==============================
// router.post("/bookings/confirm/:bookingId", async (req, res) => {
//     try {
//         const booking = await Booking.findByIdAndUpdate(
//             req.params.bookingId,
//             { paymentStatus: "paid" },
//             { new: true }
//         ).populate("hotel");

//         const user = await User.findById(req.user._id);

//         const days = Math.ceil(
//             (new Date(booking.endDate) - new Date(booking.startDate))
//             / (1000 * 60 * 60 * 24)
//         );

//         await sendBookingConfirmation(
//             user.email,
//             user.username,
//             booking.hotel.title,
//             booking.startDate,
//             booking.endDate,
//             booking.guests,
//             booking.amount
//         );

//         req.flash("success", "Payment successful! Booking confirmed! 🎉");
//         res.redirect("/listing/" + booking.hotel._id);

//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/listing");
//     }
// });


// // ==============================
// // ✅ USER BOOKING HISTORY
// // ==============================
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


// // ==============================
// // ✅ OWNER BOOKING HISTORY 🔥
// // ==============================
// router.get("/owner/bookings", async (req, res) => {
//     try {
//         if (!req.user) {
//             req.flash("error", "Please login first!");
//             return res.redirect("/login");
//         }

//         const bookings = await Booking.find({ owner: req.user._id })
//             .populate("hotel")
//             .populate("user")
//             .sort({ _id: -1 });

//         res.render("bookings/ownerHistory.ejs", { bookings });

//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/listing");
//     }
// });


// // ==============================
// // ✅ CANCEL BOOKING
// // ==============================
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


// // ==============================
// // ✅ CREATE BOOKING
// // ==============================
// router.post("/:listingId/bookings", async (req, res) => {
//     try {
//         if (!req.user) {
//             req.flash("error", "Please login first!");
//             return res.redirect("/login");
//         }

//         const listing = await Listing.findById(req.params.listingId);

//         if (!listing) {
//             req.flash("error", "Listing not found!");
//             return res.redirect("/listing");
//         }

//         const days = Math.ceil(
//             (new Date(req.body.booking.endDate) - new Date(req.body.booking.startDate))
//             / (1000 * 60 * 60 * 24)
//         );

//         const totalAmount = days * listing.price;

//         const booking = new Booking({
//             hotel: listing._id,
//             user: req.user._id,
//             owner: listing.owner,   // 🔥 OWNER SAVE
//             startDate: req.body.booking.startDate,
//             endDate: req.body.booking.endDate,
//             guests: req.body.booking.guests || 1,
//             amount: totalAmount,
//             paymentStatus: "pending"
//         });

//         await booking.save();

//         res.render("bookings/payment.ejs", {
//             listing,
//             booking,
//             totalAmount,
//             days
//         });

//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Booking failed!");
//         res.redirect("/listing");
//     }
// });


// // ==============================
// // ✅ PAYMENT CONFIRM
// // ==============================
// router.post("/bookings/confirm/:bookingId", async (req, res) => {
//     try {
//         const booking = await Booking.findByIdAndUpdate(
//             req.params.bookingId,
//             { paymentStatus: "paid" },
//             { new: true }
//         ).populate("hotel");

//         const user = await User.findById(req.user._id);

//         await sendBookingConfirmation(
//             user.email,
//             user.username,
//             booking.hotel.title,
//             booking.startDate,
//             booking.endDate,
//             booking.guests,
//             booking.amount
//         );

//         req.flash("success", "Payment successful! 🎉");
//         res.redirect("/listing/" + booking.hotel._id);

//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/listing");
//     }
// });


// // ==============================
// // ✅ USER BOOKING HISTORY (FILTERED 🔥)
// // ==============================
// router.get("/bookings/history", async (req, res) => {
//     try {
//         if (!req.user) {
//             req.flash("error", "Please login first!");
//             return res.redirect("/login");
//         }

//         // 🔥 ONLY USER BOOKINGS (owner exclude)
//         const bookings = await Booking.find({
//             user: req.user._id,
//             owner: { $ne: req.user._id }
//         })
//         .populate("hotel")
//         .sort({ createdAt: -1 });

//         res.render("bookings/history.ejs", { bookings });

//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Something went wrong!");
//         res.redirect("/listing");
//     }
// });


// // ==============================
// // ✅ OWNER BOOKINGS (OPTIONAL)
// // ==============================
// router.get("/owner/bookings", async (req, res) => {
//     try {
//         const bookings = await Booking.find({ owner: req.user._id })
//             .populate("hotel")
//             .populate("user")
//             .sort({ createdAt: -1 });

//         res.render("bookings/ownerHistory.ejs", { bookings });

//     } catch (err) {
//         console.log(err);
//         res.redirect("/listing");
//     }
// });


// // ==============================
// // ✅ CANCEL BOOKING
// // ==============================
// router.delete("/bookings/:bookingId", async (req, res) => {
//     try {
//         await Booking.findByIdAndDelete(req.params.bookingId);
//         req.flash("success", "Booking cancelled!");
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

// =========================
// POST /:listingId/bookings
// Booking + Payment page
// =========================
router.post("/:listingId/bookings", async (req, res) => {
    try {
        if (!req.user) {
            req.flash("error", "Please login first!");
            return res.redirect("/login");
        }

        const listing = await Listing.findById(req.params.listingId);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listing");
        }

        const days = Math.ceil(
            (new Date(req.body.booking.endDate) - new Date(req.body.booking.startDate)) /
            (1000 * 60 * 60 * 24)
        );
        const totalAmount = days * listing.price;

        const booking = new Booking({
            hotel: req.params.listingId,
            user: req.user._id,       // login user
            owner: listing.owner,     // 🔥 Must assign owner
            startDate: req.body.booking.startDate,
            endDate: req.body.booking.endDate,
            guests: req.body.booking.guests || 1,
            amount: totalAmount,
            paymentStatus: "pending"
        });
        await booking.save();

        console.log("🔥 Booking created:", booking);

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

// =========================
// POST /bookings/confirm/:bookingId
// Payment confirm
// =========================
router.post("/bookings/confirm/:bookingId", async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { paymentStatus: "paid" },
            { new: true }
        ).populate("hotel");

        const user = await User.findById(req.user._id);
        const days = Math.ceil(
            (new Date(booking.endDate) - new Date(booking.startDate)) /
            (1000 * 60 * 60 * 24)
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

        console.log("✅ Payment confirmed for booking:", booking._id);

        req.flash("success", "Payment successful! Booking confirmed! 🎉");
        res.redirect("/listing/" + booking.hotel._id);

    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listing");
    }
});

// =========================
// GET /bookings/history
// My Bookings (login user)
// =========================
router.get("/bookings/history", async (req, res) => {
    try {
        if (!req.user) {
            req.flash("error", "Please login first!");
            return res.redirect("/login");
        }

        console.log("=== USER BOOKING HISTORY ===");
        console.log("User ID:", req.user._id);
        console.log("Username:", req.user.username);

        const bookings = await Booking.find({ user: req.user._id })
            .populate("hotel")
            .sort({ _id: -1 });

        console.log("Bookings found:", bookings.length);
        bookings.forEach(b => {
            console.log("Booking:", b._id, "Hotel:", b.hotel?.title, "Status:", b.paymentStatus);
        });
        console.log("=== END BOOKING HISTORY ===");

        res.render("bookings/history.ejs", { bookings });

    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listing");
    }
});

// =========================
// DELETE /bookings/:bookingId
// Cancel Booking
// =========================
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

// =========================
// GET /owner/bookings
// Owner Received Bookings (all bookings made on owner hotels)
// =========================
router.get("/owner/bookings", async (req, res) => {
    try {
        if (!req.user) {
            req.flash("error", "Please login first!");
            return res.redirect("/login");
        }

        console.log("=== OWNER RECEIVED BOOKINGS ===");
        console.log("Owner ID:", req.user._id);

        // Find all listings owned by this user
        const listings = await Listing.find({ owner: req.user._id });
        const listingIds = listings.map(l => l._id);

        // Find all bookings on these hotels
        const receivedBookings = await Booking.find({ hotel: { $in: listingIds } })
            .populate("hotel")
            .populate("user")
            .sort({ _id: -1 });

        console.log("Received bookings found:", receivedBookings.length);
        receivedBookings.forEach(b => {
            console.log("Booking:", b._id, "User:", b.user.username, "Hotel:", b.hotel.title);
        });
        console.log("=== END RECEIVED BOOKINGS ===");

        res.render("bookings/received.ejs", { receivedBookings });

    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listing");
    }
});

module.exports = router;