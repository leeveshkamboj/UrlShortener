const express = require("express");
const path = require("path");
const { stringify } = require("querystring");
const fetch = require("node-fetch");
const shortid = require("shortid");

const shortUrl = require("../Models/urls");
const config = require("../config");
const validateUrl = require("../utils");

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).render(path.resolve("./") + "/views/index.ejs", {
    siteKey: config.siteKey,
  });
});

router.post("/", async (req, res) => {
  const url = req.body.url;
  if (!validateUrl(url)) {
    return res.status(400).render(path.resolve("./") + "/views/index.ejs", {
      errorCode: "400",
      error: "Bad request",
    });
  }
  if (config.secretKey && config.siteKey) {
    const query = stringify({
      secret: config.secretKey,
      response: req.body["g-recaptcha-response"],
    });
    const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;
    const body = await fetch(verifyURL).then((res) => res.json());
    if (body.success !== undefined && !body.success) {
      if (body["error-codes"][0] == "invalid-input-secret") {
        return res.status(500).render(path.resolve("./") + "/views/error.ejs", {
          errorCode: "500",
          error: "Internal Server Error",
        });
      }
      return res.status(400).render(path.resolve("./") + "/views/error.ejs", {
        errorCode: "400",
        error: "Bad request",
      });
    }
  }
  const id = shortid.generate();
  newUrl = new shortUrl({
    _id: id,
    url: url,
  });
  newUrl
    .save()
    .then((result) => {
      if (result.id) {
        res.status(200).render(path.resolve("./") + "/views/result.ejs", {
          newUrl: `${config.site_url}/${result._id}`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).render(path.resolve("./") + "/views/error.ejs", {
        errorCode: "500",
        error: "Internal Server Error",
      });
    });
});

router.get("/author", async (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7);
  }
  const body = await fetch(
    `http://ip-api.com/json/${ip}?fields=status,countryCode`
  ).then((res) => res.json());
  if (body.status === "success" && body.countryCode !== "IN") {
    return res.status(200).redirect("https://www.linkedin.com/in/cvkamboj/");
  } else {
    return res.status(200).redirect("https://developer.wordpress.org/plugins/");
  }
});

router.get("/:id", (req, res) => {
  shortUrl
    .findById(req.params.id)
    .then((result) => {
      if (result && result.url) {
        result.updateOne({ views: result.views + 1 }).then(() => {
          return res.status(200).redirect(result.url);
        });
      } else {
        return res.status(404).render(path.resolve("./") + "/views/error.ejs", {
          errorCode: "404",
          error: "Not Found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).render(path.resolve("./") + "/views/error.ejs", {
        errorCode: "500",
        error: "Internal Server Error",
      });
    });
});

module.exports = router;
