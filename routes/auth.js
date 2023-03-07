const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
//const { body, validationResult } = require('express-validator');
const User = require("../models/User");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { findById } = require("../models/User");
const fetchuser = require("../middleware/fetchuser");
const JWT_SECRET = "hghgtuinvcxaai";

//POST to create user. no login required. /api/auth/createuser
router.post(
  "/createuser",
  [
    body("name", "Name must be atleast 2 characters").isLength({ min: 2 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "password must be atleast 5 in length").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    //if error returns bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //check if usr alredy exist with unique email
      if (await User.findOne({ email: req.body.email })) {
        return res
          .status(400)
          .json({ errors: "sorry a user already exists with this email" });
      }
      let salt = bcrypt.genSaltSync(10);
      let secPass = bcrypt.hashSync(req.body.password, salt);
      //create user
      let user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      var authToken = jwt.sign(data, JWT_SECRET);

      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error occured");
    }
  }
);

//POST to login user.Authenticate user /api/auth/login
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],

  async (req, res) => {
    
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });      
        try {
      const user = await User.findOne({ email: req.body.email });
      if (!user)
        return res.status(500).json("Please enter correct email");
      const passwordCompare = await bcrypt.compare(req.body.password, user.password);
      
      if (!passwordCompare)
        return res.status(500).json("Please enter correct password");
      const data = {
        user: {
          id: user.id,
        },
      };
      var authToken = jwt.sign(data, JWT_SECRET);

      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error occured");
    }
  }
);
//POST to get user details.Authenticate user. 
router.post(
  "/getuser",fetchuser,
  async (req, res) => {
    try {
          const userId=req.user.id;
          console.log(userId);
         const user= await User.findById(userId).select("-password");
         res.send(user);
      
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error occured");
    }

  })

module.exports = router;
