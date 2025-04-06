const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    preferences: { category: String, location: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const UserModel = mongoose.model("Airtribe", userSchema);

module.exports = UserModel;
