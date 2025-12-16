import express from 'express';
import router from './router/apiRouter.js';
import globalErrorHandler from './middleware/globalErrorHandler.js';
import responseMessage from './constant/responseMessage.js';
import httpError from './util/httpError.js';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from "./config/passport.js";
import config from './config/config.js';
import { EApplicationEnvironment } from './constant/application.js';
import { initializeFirebase } from './config/firebase.js';
const app = express();

app.use(helmet());
// const allowedOrigins = [
//     "http://127.0.0.1:5500/",
//     'http://localhost:5173',
// ];
// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
// }));
app.use(cors({
    origin: '*',
}))
app.set('trust proxy', 1); 
app.use(cookieParser());
app.use(express.json());

// Session configuration
app.use(session({
    secret: config.auth.sessionSecret || 'fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.ENV === EApplicationEnvironment.PRODUCTION,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    console.log("req body", req.body);
    next();
})

app.use('/v1', router);

app.use((req, _res, next) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('route'));
    } catch (err) {
        httpError(next, err, req, 404);
    }
});

app.use(globalErrorHandler);


// Initialize Firebase 
try {
    initializeFirebase();
} catch (error) {
    console.error('Failed to initialize Firebase services:', error);
}


export default app;

