// Importing Dependencies
const express = require('express')
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const mongoose = require('mongoose')
const shortid = require('shortid');
const secure = require('ssl-express-www');
const { stringify } = require('querystring');

const shortUrl = require('./Models/urls')
const config = require('./config')



// Functions
function validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}



// Setting up Express Sever
const app = express()
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(secure);
app.use('/favicon.ico', express.static('public/favicon.ico'));
app.set('view engine', 'ejs');



//Routes
app.get('/', (req, res) => {
    res.status(200).render(__dirname + "/views/index.ejs", {
        siteKey: config.siteKey
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
    if (config.secretKey && config.siteKey) {
        const query = stringify({
            secret: config.secretKey,
            response: req.body['g-recaptcha-response'],
        });
        const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;
        const body = await fetch(verifyURL).then(res => res.json());
        if (body.success !== undefined && !body.success) {
            if (body['error-codes'][0] == 'invalid-input-secret') {
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
                    newUrl: `${config.site_url}/${result._id}`
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
                return res.status(200).redirect(result.url);
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

// API
app.post('/api', async (req, res) => {
    const api_key = req.body.api_key
    if (!api_key) {
        return res.status(401).json({
            success: false,
            error: "API key not provided."
        })
    }
    if (!config.api_key || api_key != config.api_key) {
        return res.status(401).json({
            success: false,
            error: "Invalid API key."
        })
    }
    const url = req.body.url
    if (!validateUrl(url)) {
        return res.status(400).json({
            success: false,
            error: "Invalid url."
        })
    }
    var new_url = req.body.custom_url
    if (new_url) {
        regex = /^[a-zA-Z0-9]*$/
        if (!regex.test(new_url)) {
            return res.status(400).json({
                success: false,
                error: "New url must contain letters and digits only."
            })
        }
        if (new_url == "api" || await shortUrl.findById(new_url)) {
            return res.status(400).json({
                success: false,
                error: "New url already exists."
            })
        }
    } else {
        new_url = shortid.generate()
    }
    newUrl = new shortUrl({
        _id: new_url,
        url: url
    })
    newUrl.save()
        .then((result) => {
            if (result.id) {
                res.status(200).json({
                    success: true,
                    new_url: `${config.site_url}/${result.id}`
                })
            }
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        })

})


// Connecting to Database and starting the server
if (config.dbUrl) {
    mongoose.connect(config.dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Database connected.")
            server = app.listen(config.port, () => {
                console.log(`Listening at port ${config.port}.`)
            })
        })
        .catch((err) => {
            console.log(`Error while connecting to database\n${err}`)
        })
} else {
    console.log("Empty Database URL.")
}