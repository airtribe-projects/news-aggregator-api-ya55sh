const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWT_SECRET;
const UserModel = require("../db/user.model");

const axios = require("axios");
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
const lookup = require("country-code-lookup");
const { response } = require("../app");

exports.hello = (req, res) => {
  res.send("Hello");
};

exports.signup = async (req, res) => {
  try {
    let { uname, email, password, category, location } = req.body;
    //check if user already exists
    let user = await UserModel.findOne({ email });
    if (user) return res.status(200).json({ message: "User already exists" });

    let hashPassword = await bcrypt.hash(password, saltRounds);

    let tempUser = {
      username: uname,
      email: email,
      password: hashPassword,
      preferences: { category, location },
    };

    let resp = await UserModel.create(tempUser);

    res.status(200).json({ message: "User created successfully", user: resp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong during signup" });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let hashPassword;

    //check if user exists or not
    let user = await UserModel.findOne({ email });
    console.log(user);
    if (!user) return res.status(200).json({ message: "User does not exist" });

    hashPassword = user.password;

    let checkPassword = bcrypt.compare(password, hashPassword);

    if (checkPassword) {
      var token = jwt.sign(
        { email: email, user: user.username },
        jwtSecretKey,
        {
          expiresIn: "2h",
        }
      );
      res.status(200).json({ message: "Login successfull", token: token });
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong while loggin in" });
  }
};

exports.preferences = async (req, res) => {
  try {
    let { email } = req.user;
    let getPreferences = (await UserModel.findOne({ email })).preferences;

    res.status(200).json({ preferences: getPreferences });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Encountered an error while getting preferences" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    let { email } = req.user;
    let { category, location } = req.body; // Get new preferences from request body

    // Find the user and update their preferences
    let updatedUser = await UserModel.findOneAndUpdate(
      { email },
      { preferences: { category, location } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Preferences updated successfully",
      preferences: updatedUser.preferences,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Encountered an error while updating preferences" });
  }
};

exports.news = async (req, res) => {
  try {
    let { email } = req.user;

    // Fetch user preferences from the database
    let user = await UserModel.findOne({ email });
    if (!user || !user.preferences) {
      return res.status(404).json({ message: "User preferences not found" });
    }

    let { category, location } = user.preferences;

    // Ensure preferences are available
    if (!category || !location) {
      return res.status(400).json({ message: "Invalid preferences set" });
    }
    console.log(location);
    location = lookup.byCountry(location) || "US";
    console.log("anda", location);

    let response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        category: category,
        country: location,
        language: "en",
        sortBy: "popularity",
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    res.status(200).json({ news: response.data.articles });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Failed to fetch news" });
  }
};
