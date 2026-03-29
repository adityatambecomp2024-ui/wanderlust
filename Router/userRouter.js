const express=require("express");
const router=express.Router();
const passport=require("passport");

const User=require("../model/user.js");
const wrapAsync=require("../utils/wrapAsync.js");

const {urlredirect}=require("../middleware.js");

// Root route
router.get("/", (req, res) => {
    res.redirect("/listing");
});

//signup get
router.get("/signUp",async(req,res,next)=>{
    res.render("./users/signUp.ejs");
})

//signUp post
router.post("/signUp",wrapAsync(async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        let newUser=new User({email,username});
        let registeredUser=await User.register(newUser,password);
       req.login(registeredUser,(err)=>{
             if(err){
                return next(err);
             }
             req.flash("success","User signUp and login successfully");
             res.redirect("/listing");
       })
    }catch(er){
      req.flash("error","username with given name already registered");
      res.redirect("/signUp");
    }
}))

//login get
router.get("/login",async(req,res,next)=>{
    res.render("./users/login.ejs");
})

//login post
// router.post("/login",passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),wrapAsync(req,res)=>{
  
// })
router.post("/login",passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),(req,res)=>{
    req.flash("success","welcome back to wunderlust");
     res.redirect("/listing");
})
router.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are sucessfully logout");
    res.redirect("/listing");
    });
    
})

module.exports=router;