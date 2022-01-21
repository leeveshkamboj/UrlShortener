const express = require("express");
const shortid = require("shortid");

const shortUrl = require("../Models/urls");
const config = require("../config");
const validateUrl = require("../utils");

const router = express.Router();

router.get("/", async (req, res) => {
  const api_key = req.body.api_key;
  if (!api_key) {
    return res.status(401).json({
      success: false,
      error: "API key not provided.",
    });
  }
  if (!config.api_key || api_key != config.api_key) {
    return res.status(401).json({
      success: false,
      error: "Invalid API key.",
    });
  }
  const id = req.body.id;
  shortUrl
    .findById(id)
    .then((result) => {
      if (result && result.url) {
        return res.status(200).json({
          success: true,
          url: result.url,
          views: result.views,
        });
      } else {
        return res.status(404).json({
          success: false,
          error: "Not Found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    });
});

router.post("/", async (req, res) => {
  const api_key = req.body.api_key;
  if (!api_key) {
    return res.status(401).json({
      success: false,
      error: "API key not provided.",
    });
  }
  if (!config.api_key || api_key != config.api_key) {
    return res.status(401).json({
      success: false,
      error: "Invalid API key.",
    });
  }
  const url = req.body.url;
  if (!validateUrl(url)) {
    return res.status(400).json({
      success: false,
      error: "Invalid url.",
    });
  }
  var new_url = req.body.custom_url;
  if (new_url) {
//     regex = /^[a-zA-Z0-9]*$/;
//     if (!regex.test(new_url)) {
//       return res.status(400).json({
//         success: false,
//         error: "New url must contain letters and digits only.",
//       });
//     }
    if (new_url == "api" || (await shortUrl.findById(new_url))) {
      return res.status(400).json({
        success: false,
        error: "New url already exists.",
      });
    }
  } else {
    new_url = shortid.generate();
  }
  newUrl = new shortUrl({
    _id: new_url,
    url: url,
  });
  newUrl
    .save()
    .then((result) => {
      if (result.id) {
        res.status(200).json({
          success: true,
          new_url: `${config.site_url}/${result.id}`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    });
});

module.exports = router;
