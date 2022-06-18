const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const JWT_SECRET = "$unnyY@d@v";

// Create a New User; POST "/api/auth/createuser"
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name of minimum length 3!").isLength({
      min: 3,
    }),
    body("email", "Enter a valid email!").isEmail(),
    body("password", "Enter a valid password of minimum length 5!").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // if there are errors return error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // check whether the user with same email exists
    try {
      let user = await User.findOne({ email: req.body.email });
      console.log(user);
      if (user) {
        return req
          .status(400)
          .json({ error: "User with the same email already exits!" });
      }

      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secpass,
        email: req.body.email,
      });

      // .then((user) => res.json(user))
      // .catch((err) => {console.log(err)
      // res.json({error : 'Please enter a unique value', message: err.message})
      // });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json(authtoken)
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Error!");
    }
  }
);

module.exports = router;
