const express = require('express')
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const mongoose = require('mongoose')
const shortid = require('shortid');
const {
    stringify
} = require('querystring');
require('dotenv').config();

const shortUrl = require('./Models/urls')


function validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}


const app = express()

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.json());

app.set('view engine', 'ejs');

const port = process.env.PORT || 4000
const site_url = process.env.SITE_URL || `http://localhost:${port}`

const secretKey = process.env.SECRET_KEY || null
const siteKey = process.env.SITE_KEY || null
dbUrl = process.env.DB_URL || null

app.get('/', (req, res) => {
    res.status(200).render(__dirname + "/views/index.ejs", {
        siteKey: siteKey
    })
})

app.post('/', async (req, res) => {
    const url = req.body.url
    if (!validateUrl(url)) {
        return res.status(400).render(__dirname + "/views/error.ejs", {
            errorCode: "400",
            error: "Bad request"
        })
    }
    if (secretKey && siteKey) {
        const query = stringify({
            secret: secretKey,
            response: req.body['g-recaptcha-response'],
        });
        const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;
        const body = await fetch(verifyURL).then(res => res.json());
        if (body.success !== undefined && !body.success) {
            if (body['error-codes'][0] == 'invalid-input-secret'){
                return res.status(500).render(__dirname + "/views/error.ejs", {
                    errorCode: "500",
                    error: "Internal Server Error"
                })
            }
            return res.status(400).render(__dirname + "/views/error.ejs", {
                errorCode: "400",
                error: "Bad request"
            })
        }
    }
    const id = shortid.generate()
    newUrl = new shortUrl({
        _id: id,
        url: url
    })
    newUrl.save()
        .then((result) => {
            if (result.id) {
                res.status(200).render(__dirname + "/views/result.ejs", {
                    newUrl: `${site_url}/${result._id}`,
                    homeUrl: site_url
                })
            }
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).render(__dirname + "/views/error.ejs", {
                errorCode: "500",
                error: "Internal Server Error"
            })
        })
})

app.get('/:id', (req, res) => {
    shortUrl.findById(req.params.id)
        .then((result) => {
            if (result && result.url) {
                return res.redirect(result.url);
            } else {
                return res.status(404).render(__dirname + "/views/error.ejs", {
                    errorCode: "404",
                    error: "Not Found"
                })
            }
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).render(__dirname + "/views/error.ejs", {
                errorCode: "500",
                error: "Internal Server Error"
            })
        })
})


if (dbUrl) {
    mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Database connected.")
            server = app.listen(port, () => {
                console.log(`Listening at port ${port}.`)
            })
        })
        .catch((err) => {
            console.log(`Error in connect to database\n${err}`)
        })
} else {
    console.log("Empty Database URL.")
}