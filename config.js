require('dotenv').config();

const config = {
    port: process.env.PORT || 4000,
    site_url: process.env.SITE_URL || `http://localhost:${port}`,
    secretKey: process.env.SECRET_KEY || null,
    siteKey: process.env.SITE_KEY || null,
    dbUrl: process.env.DB_URL || null,
    api_key: process.env.API_KEY || null,
}

module.exports = config