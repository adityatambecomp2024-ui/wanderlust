require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./model/Listing.js");
const path = require("path");
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const { listingValidation, reviewValidation } = require("./Schema.js");
const Review = require("./model/Review.js");

const listingsRouter = require("./Router/listingRouter.js");
const hotelRouter = require("./Router/hotelRouter.js");
const reviewsRouter = require("./Router/reviewRouter.js");
const userRouter = require("./Router/userRouter.js");
const bookingRouter = require("./Router/bookingRouter.js");

const session = require("express-session");
const flash = require('express-flash');

const passport = require("passport");
const User = require("./model/user.js");
const LocalStrategy = require("passport-local");
const { v4: uuidv4 } = require('uuid');
const UserVisit = require('./model/userVisit.js');
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine('ejs', engine);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function startMongo() {
    try {
        await mongoose.connect("mongodb://localhost:27017/wanderlust");
        console.log("MongoDB Connected");
    } catch (err) {
        console.log(err);
    }
}

startMongo();

async function initSessionAndStart() {
    const MongoStore = require('connect-mongo');
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());

    let sessionOptions;
    if (process.env.NODE_ENV === 'production') {
        const store = MongoStore.create({
            mongoUrl: process.env.ATLAS_URL,
            crypto: { secret: process.env.SECRET_KEY },
            touchAfter: 24 * 3600,
        });
        store.on("error", () => {
            console.log("ERROR in MONGO Session Store");
        });
        sessionOptions = {
            store,
            secret: process.env.SECRET_KEY || 'thisshouldbechanged',
            resave: false,
            saveUninitialized: true,
            cookie: {
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            },
        };
    } else {
        sessionOptions = {
            secret: process.env.SECRET_KEY || 'thisshouldbechanged',
            resave: false,
            saveUninitialized: true,
        };
    }

    app.use(session(sessionOptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
}

initSessionAndStart().catch(err => console.error('Session init error', err));

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.userData = req.user;
    res.locals.pathData = req.path;
    next();
})

app.use(async (req, res, next) => {
    let userId = req.cookies.userId;
    if (!userId) {
        userId = uuidv4();
        res.cookie('userId', userId, { maxAge: 900000, httpOnly: true });
    }
    const userVisit = await UserVisit.findOneAndUpdate(
        { userId: userId },
        { $set: { lastVisit: new Date() } },
        { upsert: true, new: true }
    );
    req.userVisit = userVisit;
    next();
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// ✅ ROUTER ORDER
app.use("/", bookingRouter);
app.use("/listing", bookingRouter);
app.use("/listing", hotelRouter);
app.use("/listing", listingsRouter);
app.use("/listing/:id", reviewsRouter);
app.use("/", userRouter);

// ✅ Make Me Owner Route
app.get("/make-me-owner", async (req, res) => {
    try {
        if (!req.user) {
            return res.send(`
                <h2>Please login first!</h2>
                <a href='/login'>Login</a>
            `);
        }
        const listingId = req.query.id;
        if (!listingId) {
            const allListings = await Listing.find({}).select('title _id owner');
            let html = `
                <h2>Select listing to become owner:</h2>
                <p>Logged in as: <b>${req.user.username}</b></p>
                <hr>
            `;
            allListings.forEach(l => {
                html += `<p><a href='/make-me-owner?id=${l._id}'>${l.title}</a></p>`;
            });
            return res.send(html);
        }
        await Listing.findByIdAndUpdate(listingId, {
            $set: { owner: req.user._id }
        });
        res.send(`
            <h2>✅ Done! You are now owner!</h2>
            <a href='/listing/${listingId}'>View Listing</a> | 
            <a href='/make-me-owner'>Select Another</a>
        `);
    } catch (err) {
        res.send("Error: " + err.message);
    }
});

// ✅ Fix Geometry - Temporary Route
app.get("/fix-geometry", async (req, res) => {
    try {
        const Hotel = require("./model/Hotel.js");
        const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
        const geocodingClient = mbxgeocoding({
            accessToken: process.env.MAP_TOKEN
        });

        // ✅ सगळे hotels fix करा
        const hotels = await Hotel.find({});
        let fixed = 0;

        for (let hotel of hotels) {
            if (hotel.location) {
                try {
                    const response = await geocodingClient.forwardGeocode({
                        query: hotel.location,
                        limit: 1
                    }).send();

                    if (response.body.features.length > 0) {
                        hotel.geometry = {
                            type: 'Point',
                            coordinates: response.body.features[0].geometry.coordinates
                        };
                        await hotel.save();
                        fixed++;
                        console.log(`✅ Fixed: ${hotel.title} - ${hotel.location}`);
                    }
                } catch(e) {
                    console.log(`❌ Failed: ${hotel.title} - ${e.message}`);
                }
            }
        }

        res.send(`✅ ${fixed} hotels geometry fixed! <a href='/listing'>Go back</a>`);
    } catch (err) {
        res.send("Error: " + err.message);
    }
});

// seed
app.get("/seed-db", async (req, res) => {
    try {
        const sampleData = require("./init/data.js");
        let defaultUser = await User.findOne({ username: "demouser" });
        if (!defaultUser) {
            const newUser = new User({
                email: "demo@wanderlust.com",
                username: "demouser"
            });
            defaultUser = await User.register(newUser, "demo123");
            console.log("✓ Created demo user");
        }
        await Listing.deleteMany({});
        const listingsToInsert = sampleData.data.map(obj => ({
            ...obj,
            owner: defaultUser._id,
            image: Array.isArray(obj.image) ? obj.image : [obj.image],
            geometry: { type: 'Point', coordinates: [-155.134023, 19.698738] }
        }));
        const inserted = await Listing.insertMany(listingsToInsert);
        res.send(`✓ Seeded ${inserted.length} listings with user "${defaultUser.username}". <a href="/listing">View listings</a>`);
    } catch (err) {
        res.status(500).send(`Seed error: ${err.message}`);
    }
});

app.get("/getDemoUser", async (req, res, next) => {
    const newUser = new User({
        email: "rohan@gmail.com",
        username: "rohansonne",
    })
    const userData = await User.register(newUser, "1234");
    res.send(userData);
})

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "path not found"));
})

app.use((err, req, res, next) => {
    console.error("💥 ERROR:", err);
    let status = err.status || 500;
    let message = err.message || err || "Something went wrong";
    res.status(status).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("listening to port 8080");
})

