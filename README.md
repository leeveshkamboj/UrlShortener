# UrlShortener

Url Shortener made in Node JS with MongoDB Database.


# Deploy on local

## Delpoy

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

## How add g-recaptcha
1. Goto [this site](https://www.google.com/recaptcha/admin/create).
2. Fill the form and copy Site Key and Secret Key.
3. Add them in .env file click this:-
```
SITE_KEY=Your Site Key
SECRET_KEY=Your Secret Key
```


# Deploy on heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/leeveshkamboj/UrlShortener/)


# Example
[unbig.me](https://unbig.me/)