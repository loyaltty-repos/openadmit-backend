import os from 'os';
import config from '../config/config.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { razorpayInstance } from '../config/razorpayConfig.js';
export default {
    getSystemHealth: () => {
        return {
            cpuUsage: os.loadavg(),
            totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
            freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
        };
    },
    getApplicationHealth: () => {
        return {
            environment: config.ENV,
            uptime: `${process.uptime().toFixed(2)} Seconds`,
            memoryUsage: {
                heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            },
        };
    },
    hashPassword: (password) => {
        return bcrypt.hash(password, 10)
    },
    comparePassword: (attemptedPassword, encPassword) => {
        return bcrypt.compare(attemptedPassword, encPassword)
    },
    generateToken: (payload, secret, expiry) => {
        return jwt.sign(payload, secret, {
            expiresIn: expiry
        })
    },
    verifyToken: (token, secret) => {
        return jwt.verify(token, secret)
    },


    // Payment 
    createRazorpayOrder: async (amount, currency, receipt) => {
        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt
        };
        const order = await razorpayInstance.orders.create(options);
        return order;
    },
};
