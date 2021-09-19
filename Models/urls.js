const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  _id: String,
  url: String,
  views: { type: Number, default: 0 },
});

const shortUrl = mongoose.model("shorturls", urlSchema);

module.exports = shortUrl;
