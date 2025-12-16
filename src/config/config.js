import dotenv from 'dotenv'

dotenv.config()

const config = Object.freeze({
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    SERVER_URL: process.env.SERVER_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    ACCESS_TOKEN: {
        SECRET: process.env.ACCESS_TOKEN_SECRET,
        EXPIRY: '7d'
    },
    REFRESH_TOKEN: {
        SECRET: process.env.REFRESH_TOKEN_SECRET,
        EXPIRY: 3600 * 24 * 365
    },
    auth: {
        sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.SERVER_URL || 'http://localhost:5000'}/v1/auth/google/callback`
        },
        facebook: {
            appId: process.env.FACEBOOK_APP_ID,
            appSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL || `${process.env.SERVER_URL || 'http://localhost:5000'}/v1/auth/facebook/callback`
        }
    },

    // Razorpay
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    DEFAULT_FEE: process.env.DEFAULT_FEE || 500,

    //ImageKit
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,

    // Email Service
    email: {
        service: process.env.EMAIL_SERVICE || "smtp",
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        user: process.env.EMAIL_USER || "",
        password: process.env.EMAIL_PASSWORD || "",
        from: process.env.EMAIL_FROM || "GoUpBroad <noreply@goupbroad.com>"
    },

    //firebase
    firebase: {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    }
})

export default config;
