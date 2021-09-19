# UrlShortener

Url Shortener made in Node JS with MongoDB Database.


# Deploy on local

1. Install Dependencies
`npm install`

2. Sign up in [MongoDB](https://www.mongodb.com/cloud/atlas/register) and get the connection url

3. Add .env file in the root directory
```
DB_URL=Your Mongodb Connection Url
SITE_URL=Url Of Your Site
```

4. Start Sever
`npm start`


# Deploy on heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/leeveshkamboj/UrlShortener/)


# How to add g-recaptcha

1. Goto [this site](https://www.google.com/recaptcha/admin/create).
2. Fill the form and copy Site Key and Secret Key.
3. Add them in .env file or your enviroment variables like this:-
```
SITE_KEY=Your Site Key
SECRET_KEY=Your Secret Key
```


# Example
[unbig.me](https://unbig.me/)


# Using API

1. Enter any API key in .env file or your enviroment variables like this:-
`API_KEY=Your API key`

### Request :-
@ Shorten Url
URL: /api METHOD: POST<br>
POST Parameters:-
```
api_key : required, API key added above
url : required, url you want to shorten
custom_url : optional, if you want custom url
```

@ Get Url Stats
URL: /api METHOD: GET<br>
GET Parameters:-
```
api_key : required, API key added above
id : required, url's id 
```