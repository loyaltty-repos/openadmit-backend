// import httpResponse from '../../util/httpResponse.js';
// import responseMessage from '../../constant/responseMessage.js';
// import httpError from '../../util/httpError.js';
// import quicker from '../../util/quicker.js';
// import config from '../../config/config.js';
// import Payment from '../../model/paymentModel.js';
// import Student from '../../model/studentModel.js';
// import crypto from "crypto"
// import { razorpayInstance } from '../../config/razorpayConfig.js';
// import { PAYMENT_PLANS } from '../../constant/application.js';
// import emailService from '../../service/email.service.js';
// import { generateReceipt } from '../../service/receiptService.js';

// const generatePaymentConfirmationEmail = (data) => {
//     const { studentName, studentEmail, planName, planPrice, orderId, paymentId, features, category } = data;

//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Payment Confirmation - UpBroad</title>
//         <style>
//             body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//             .header { background-color: #145044; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
//             .content { background-color: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }
//             .success-icon { width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; }
//             .order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
//             .order-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
//             .order-row:last-child { border-bottom: none; }
//             .features-list { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
//             .feature-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
//             .feature-item:last-child { border-bottom: none; }
//             .next-steps { background-color: #e8f5f3; padding: 20px; border-radius: 8px; margin: 20px 0; }
//             .step { margin: 15px 0; padding: 15px; background-color: white; border-radius: 5px; }
//             .step-number { display: inline-block; width: 25px; height: 25px; background-color: #145044; color: white; border-radius: 50%; text-align: center; line-height: 25px; margin-right: 10px; font-size: 12px; }
//             .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
//             .price { font-size: 24px; font-weight: bold; color: #145044; }
//             .badge { background-color: #145044; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
//         </style>
//     </head>
//     <body>
//         <div class="header">
//             <div class="success-icon">✓</div>
//             <h1>Payment Successful!</h1>
//             <p>Thank you for choosing UpBroad. Your journey to success starts now!</p>
//         </div>
        
//         <div class="content">
//             <div class="order-details">
//                 <h2 style="color: #145044; margin-top: 0;">Order Summary</h2>
//                 <div style="margin-bottom: 20px;">
//                     <h3 style="margin: 0;">${planName}</h3>
//                     <span class="badge">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
//                 </div>
//                 <div class="price">₹${planPrice.toLocaleString('en-IN')}</div>
//                 <div style="color: #666; margin-top: 5px;">Paid</div>
                
//                 <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
//                     <div class="order-row">
//                         <span>Order ID:</span>
//                         <span style="font-family: monospace; font-weight: bold;">${orderId}</span>
//                     </div>
//                     <div class="order-row">
//                         <span>Payment ID:</span>
//                         <span style="font-family: monospace; font-weight: bold;">${paymentId}</span>
//                     </div>
//                     <div class="order-row">
//                         <span>Date:</span>
//                         <span>${new Date().toLocaleDateString('en-IN')}</span>
//                     </div>
//                     <div class="order-row">
//                         <span>Customer:</span>
//                         <span>${studentName} (${studentEmail})</span>
//                     </div>
//                 </div>
//             </div>
            
//             <div class="features-list">
//                 <h3 style="color: #145044; margin-top: 0;">What's Included in Your Plan</h3>
//                 ${features.map(feature => `<div class="feature-item">✓ ${feature}</div>`).join('')}
//             </div>
            
//             <div class="next-steps">
//                 <h3 style="color: #145044; margin-top: 0;">What Happens Next?</h3>
//                 <div class="step">
//                     <span class="step-number">1</span>
//                     <strong>Confirmation Email</strong><br>
//                     <small>You're reading it! Keep this email for your records.</small>
//                 </div>
//                 <div class="step">
//                     <span class="step-number">2</span>
//                     <strong>Counselor Assignment</strong><br>
//                     <small>Our team will assign a dedicated counselor to your case within 24-48 hours.</small>
//                 </div>
//                 <div class="step">
//                     <span class="step-number">3</span>
//                     <strong>Initial Consultation</strong><br>
//                     <small>Your counselor will schedule an initial consultation call to understand your goals.</small>
//                 </div>
//                 <div class="step">
//                     <span class="step-number">4</span>
//                     <strong>Get Started</strong><br>
//                     <small>Begin your journey with expert guidance every step of the way!</small>
//                 </div>
//             </div>
            
//             <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0f8f6; border-radius: 8px;">
//                 <h3 style="color: #145044; margin-top: 0;">Need Help?</h3>
//                 <p style="margin: 10px 0;">Our support team is here to assist you</p>
//                 <p style="margin: 5px 0;">📧 support@upbroad.com</p>
//                 <p style="margin: 5px 0;">📞 +91 98765 43210</p>
//             </div>
//         </div>
        
//         <div class="footer">
//             <p>© 2024 UpBroad. All rights reserved.</p>
//             <p>This is an automated email. Please do not reply to this email.</p>
//         </div>
//     </body>
//     </html>
//     `;
// };

// export default {
//     initiatePayment: async (req, res, next) => {
//         try {
//             const studentId = req.authenticatedStudent._id.toString();
//             const { planType, category } = req.body;

//             if (!planType || !category) {
//                 return httpError(next, new Error('Plan type and category are required'), req, 400);
//             }

//             if (!PAYMENT_PLANS[category] || !PAYMENT_PLANS[category][planType]) {
//                 return httpError(next, new Error('Invalid plan selection'), req, 400);
//             }

//             const selectedPlan = PAYMENT_PLANS[category][planType];
//             const amount = selectedPlan.price;
//             const timestamp = Date.now().toString().slice(-6);
//             const receipt = `rcpt_${studentId.slice(0, 12)}_${timestamp}`.slice(0, 40);

//             const order = await quicker.createRazorpayOrder(amount, 'INR', receipt);

//             const payment = new Payment({
//                 studentId,
//                 orderId: order.id,
//                 amount,
//                 currency: 'INR',
//                 planId: selectedPlan.id,
//                 planName: selectedPlan.name,
//                 planCategory: category,
//                 planType: planType
//             });
//             await payment.save();

//             return httpResponse(req, res, 200, responseMessage.SUCCESS, {
//                 orderId: order.id,
//                 amount,
//                 currency: 'INR',
//                 key: config.RAZORPAY_KEY_ID,
//                 planDetails: selectedPlan
//             });
//         } catch (err) {
//             console.log(err);
//             return httpError(next, err, req, 500);
//         }
//     },

//     verifyPayment: async (req, res, next) => {
//         const studentId = req.authenticatedStudent._id;
//         try {
//             const { paymentId, orderId, signature } = req.body;

//             if (!paymentId || !orderId || !signature) {
//                 return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('Missing payment details')), req, 400);
//             }

//             // Manual signature verification
//             const generatedSignature = crypto
//                 .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
//                 .update(`${orderId}|${paymentId}`)
//                 .digest('hex');

//             if (generatedSignature !== signature) {
//                 return httpError(next, new Error('Invalid payment signature'), req, 400);
//             }

//             const paymentDetails = await razorpayInstance.payments.fetch(paymentId);
//             if (paymentDetails.status !== 'captured' || paymentDetails.order_id !== orderId) {
//                 return httpError(next, new Error('Payment not captured or invalid'), req, 400);
//             }

//             const payment = await Payment.findOneAndUpdate(
//                 { orderId, studentId, status: 'PENDING' },
//                 { paymentId, status: 'SUCCESS' },
//                 { new: true }
//             );

//             if (!payment) {
//                 return httpResponse(req, res, 404, responseMessage.NOT_FOUND('Payment'));
//             }

//             const planDetails = PAYMENT_PLANS[payment.planCategory][payment.planType];

//             const UpdateStudent = await Student.findByIdAndUpdate(studentId, {
//                 isFeePaid: true,
//                 isVerified: true,
//                 planDetails: {
//                     course: payment.planCategory,
//                     planId: payment.planId,
//                     planName: payment.planName,
//                     planPrice: payment.amount,
//                     planBuyDate: new Date()
//                 }
//             }, { new: true });

//             if (!UpdateStudent) {
//                 return httpResponse(req, res, 404, responseMessage.NOT_FOUND('Student'));
//             }

//             let receiptUrl = null;
//             try {
//                 const receiptData = {
//                     studentName: UpdateStudent.name || UpdateStudent.email.split('@')[0],
//                     studentEmail: UpdateStudent.email,
//                     planName: planDetails.name,
//                     planPrice: payment.amount,
//                     orderId: orderId,
//                     paymentId: paymentId,
//                     features: planDetails.features,
//                     category: payment.planCategory,
//                     date: new Date().toLocaleDateString('en-IN')
//                 };

//                 const receiptResult = await generateReceipt(receiptData);
//                 if (receiptResult.success) {
//                     receiptUrl = receiptResult.receiptUrl;

//                     await Student.findByIdAndUpdate(studentId, {
//                         'planDetails.receiptLink': receiptUrl
//                     });
//                 }
//             } catch (receiptError) {
//                 console.log('Error generating receipt:', receiptError);
//             }

//             try {
//                 const emailSubject = 'Payment Confirmation - UpBroad';
//                 const emailHTML = generatePaymentConfirmationEmail({
//                     studentName: UpdateStudent.name || UpdateStudent.email.split('@')[0],
//                     studentEmail: UpdateStudent.email,
//                     planName: planDetails.name,
//                     planPrice: payment.amount,
//                     orderId: orderId,
//                     paymentId: paymentId,
//                     features: planDetails.features,
//                     category: payment.planCategory
//                 });

//                 await emailService.sendEmail(
//                     UpdateStudent.email,
//                     emailSubject,
//                     `Thank you for your payment! Your ${planDetails.name} plan is now active.`,
//                     emailHTML
//                 );
//             } catch (emailError) {
//                 console.log('Error sending confirmation email:', emailError);
//             }

//             httpResponse(req, res, 200, responseMessage.SUCCESS, {
//                 paymentId,
//                 status: 'success',
//                 receiptUrl,
//                 orderDetails: {
//                     planDetails,
//                     customerData: {
//                         firstName: UpdateStudent.name || UpdateStudent.email.split('@')[0],
//                         lastName: '',
//                         email: UpdateStudent.email
//                     },
//                     orderId,
//                     paymentId,
//                     price: payment.amount,
//                     category: payment.planCategory,
//                     receiptUrl
//                 }
//             });
//         } catch (err) {
//             console.log("Error during payment verification:", err);
//             httpError(next, err, req, 500);
//         }
//     }
// };


// import httpResponse from '../../util/httpResponse.js';
// import responseMessage from '../../constant/responseMessage.js';
// import httpError from '../../util/httpError.js';
// import quicker from '../../util/quicker.js';
// import config from '../../config/config.js';
// import Payment from '../../model/paymentModel.js';
// import Student from '../../model/studentModel.js';
// import crypto from "crypto"
// import { razorpayInstance } from '../../config/razorpayConfig.js';
// import { PAYMENT_PLANS } from '../../constant/application.js';
// import emailService from '../../service/email.service.js';
// import { generateReceipt } from '../../service/receiptService.js';
// import {
//   PaymentConfirmationEmailTemplate,
//   PaymentInitiationAdminEmailTemplate,
// } from '../../service/emailTemplates.js';

// export default {
//   initiatePayment: async (req, res, next) => {
//     try {
//       const studentId = req.authenticatedStudent._id.toString();
//       const { planType, category } = req.body;

//       if (!planType || !category) {
//         return httpError(
//           next,
//           new Error('Plan type and category are required'),
//           req,
//           400
//         );
//       }

//       if (!PAYMENT_PLANS[category] || !PAYMENT_PLANS[category][planType]) {
//         return httpError(
//           next,
//           new Error('Invalid plan selection'),
//           req,
//           400
//         );
//       }

//       const selectedPlan = PAYMENT_PLANS[category][planType];
//       const amount = selectedPlan.price;

//       const timestamp = Date.now().toString().slice(-6);
//       const receipt = `rcpt_${studentId.slice(0, 12)}_${timestamp}`.slice(0, 40);

//       const order = await quicker.createRazorpayOrder(amount, 'INR', receipt);

//       const payment = new Payment({
//         studentId,
//         orderId: order.id,
//         amount,
//         currency: 'INR',
//         planId: selectedPlan.id,
//         planName: selectedPlan.name,
//         planCategory: category,
//         planType: planType,
//       });

//       await payment.save();

//       // 🔔 Send payment initiation email to admin (modular via template)
//       try {
//         const student = await Student.findById(studentId).select('name email');

//         if (student && student.email) {
//           const studentName = student.name || student.email.split('@')[0];
//           const studentEmail = student.email;

//           const template = PaymentInitiationAdminEmailTemplate({
//             studentName,
//             studentEmail,
//             planName: selectedPlan.name,
//             planPrice: amount,
//             orderId: order.id,
//             category,
//           });

//           // Choose admin email: config.email.admin → fallback to config.email.from
//           const adminEmail = process.env.ADMIN_EMAIL;
           

//           await emailService.sendEmail(adminEmail, template);
//         }
//       } catch (emailError) {
//         console.log('Error sending payment initiation email:', emailError);
//       }

//       return httpResponse(req, res, 200, responseMessage.SUCCESS, {
//         orderId: order.id,
//         amount,
//         currency: 'INR',
//         key: config.RAZORPAY_KEY_ID,
//         planDetails: selectedPlan,
//       });
//     } catch (err) {
//       console.log(err);
//       return httpError(next, err, req, 500);
//     }
//   },
//   // I want to do another payment for increasing llm university finder limit of a user 
//   // I'll be getting studentId and payment amount in the request body

//   initiatePaymentForLLMUpgrade: async (req, res, next) => {
//     try {
//       const studentId = req.authenticatedStudent._id.toString();
//       const { amount } = req.body;
//         if (!amount || amount <= 0) {
//         return httpError(
//           next,
//           new Error('Valid amount is required for LLM upgrade'),
//           req,
//           400
//         );
//       }
//         const timestamp = Date.now().toString().slice(-6);
//         const receipt = `rcpt_llm_${studentId.slice(0, 12)}_${timestamp}`.slice(0, 40);
//         const order = await quicker.createRazorpayOrder(amount, 'INR', receipt);

//         const payment = new Payment({
//         studentId,
//         orderId: order.id,
//         amount,
//         currency: 'INR',
//         planId: 'llm_upgrade',
//         planName: 'LLM University Finder Upgrade',
//         planCategory: 'llm',
//         planType: 'upgrade',
//       });

//       await payment.save();
//         return httpResponse(req, res, 200, responseMessage.SUCCESS, {
//           orderId: order.id,
//           amount,
//           currency: 'INR',
//           key: config.RAZORPAY_KEY_ID,
//           planDetails: {
//             id: 'llm_upgrade',
//             name: 'LLM University Finder Upgrade',
//             category: 'llm',
//             type: 'upgrade',
//           },
//         });
//     } catch (err) {
//       console.log(err);
//       return httpError(next, err, req, 500);
//     }
//   },    

//   // upon verification increase the limit of llm university finder for that student
//   /**
//    * universityFinderLlmResponseLimit:{
//         type: Number,
//         default: 5
//     }, this is in Student schema
//    */

//  verifyPaymentForLLMUpgrade : async (req, res, next) => {
//   const studentId = req.authenticatedStudent._id;

//   try {
//     const { paymentId, orderId, signature } = req.body;

//     if (!paymentId || !orderId || !signature) {
//       return httpError(
//         next,
//         new Error(responseMessage.CUSTOM_MESSAGE('Missing payment details')),
//         req,
//         400
//       );
//     }

//     // 1️⃣ Verify Razorpay signature manually
//     const generatedSignature = crypto
//       .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
//       .update(`${orderId}|${paymentId}`)
//       .digest('hex');

//     if (generatedSignature !== signature) {
//       return httpError(
//         next,
//         new Error('Invalid payment signature'),
//         req,
//         400
//       );
//     }

//     // 2️⃣ Fetch payment details from Razorpay
//     const paymentDetails = await razorpayInstance.payments.fetch(paymentId);

//     if (
//       paymentDetails.status !== 'captured' ||
//       paymentDetails.order_id !== orderId
//     ) {
//       return httpError(
//         next,
//         new Error('Payment not captured or invalid'),
//         req,
//         400
//       );
//     }

//     // 3️⃣ Mark Payment as SUCCESS for this student & order
//     const payment = await Payment.findOneAndUpdate(
//       { orderId, studentId, status: 'PENDING' },
//       {
//         paymentId,
//         status: 'SUCCESS',
//         rawGatewayResponse: paymentDetails, // optional but useful
//       },
//       { new: true }
//     );

//     if (!payment) {
//       return httpResponse(
//         req,
//         res,
//         404,
//         responseMessage.NOT_FOUND('Payment')
//       );
//     }

//     // 4️⃣ Calculate credits to add (5 credits for each ₹50)
//     // Razorpay amount is in paise, so divide by 100 to get rupees
//     const amountInRupees = paymentDetails.amount / 100;

//     const pricePerPack = 50;      // ₹50
//     const creditsPerPack = 5;     // 5 credits

//     // How many 50-rupee packs did they effectively buy?
//     const packsBought = Math.floor(amountInRupees / pricePerPack);
//     const creditsToAdd = packsBought * creditsPerPack;

//     // If somehow amount < 50, still keep flow intact but don't add credits
//     if (creditsToAdd > 0) {
//       const updatedStudent = await Student.findByIdAndUpdate(
//         studentId,
//         { $inc: { universityFinderLlmResponseLimit: creditsToAdd } },
//         { new: true }
//       );

//       if (!updatedStudent) {
//         // Rollback payment status if you want, or just report error
//         return httpError(
//           next,
//           new Error('Student not found while updating credits'),
//           req,
//           500
//         );
//       }

//       return httpResponse(
//         req,
//         res,
//         200,
//         responseMessage.CUSTOM_MESSAGE(
//           'Payment verified & LLM credits added successfully'
//         ),
//         {
//           paymentId: payment.paymentId,
//           orderId: payment.orderId,
//           creditsAdded: creditsToAdd,
//           totalCredits: updatedStudent.universityFinderLlmResponseLimit,
//         }
//       );
//     }

//     // If no credits calculated (e.g., wrong amount), still success but warn
//     return httpResponse(
//       req,
//       res,
//       200,
//       responseMessage.CUSTOM_MESSAGE(
//         'Payment verified but amount too low to add credits'
//       ),
//       {
//         paymentId: payment.paymentId,
//         orderId: payment.orderId,
//         creditsAdded: 0,
//       }
//     );
//   } catch (err) {
//     console.error(err);
//     return httpError(next, err, req, 500);
//   }
// },

//   verifyPayment: async (req, res, next) => {
//     const studentId = req.authenticatedStudent._id;

//     try {
//       const { paymentId, orderId, signature } = req.body;

//       if (!paymentId || !orderId || !signature) {
//         return httpError(
//           next,
//           new Error(responseMessage.CUSTOM_MESSAGE('Missing payment details')),
//           req,
//           400
//         );
//       }

//       // 🔐 Manual signature verification
//       const generatedSignature = crypto
//         .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
//         .update(`${orderId}|${paymentId}`)
//         .digest('hex');

//       if (generatedSignature !== signature) {
//         return httpError(next, new Error('Invalid payment signature'), req, 400);
//       }

//       const paymentDetails = await razorpayInstance.payments.fetch(paymentId);
//       if (
//         paymentDetails.status !== 'captured' ||
//         paymentDetails.order_id !== orderId
//       ) {
//         return httpError(
//           next,
//           new Error('Payment not captured or invalid'),
//           req,
//           400
//         );
//       }

//       const payment = await Payment.findOneAndUpdate(
//         { orderId, studentId, status: 'PENDING' },
//         { paymentId, status: 'SUCCESS' },
//         { new: true }
//       );

//       if (!payment) {
//         return httpResponse(
//           req,
//           res,
//           404,
//           responseMessage.NOT_FOUND('Payment')
//         );
//       }

//       const planDetails =
//         PAYMENT_PLANS[payment.planCategory][payment.planType];
//       const degree = payment.planCategory === 'masters' ? 'MASTER' : 'BACHELOR';
//       const UpdateStudent = await Student.findByIdAndUpdate(
//         studentId,
//         {
//           isFeePaid: true,
//           isVerified: true,
//           degree: degree,
//           planDetails: {
//             course: payment.planCategory,
//             planId: payment.planId,
//             planName: payment.planName,
//             planPrice: payment.amount,
//             planBuyDate: new Date(),
//           },
//         },
//         { new: true }
//       );

//       if (!UpdateStudent) {
//         return httpResponse(
//           req,
//           res,
//           404,
//           responseMessage.NOT_FOUND('Student')
//         );
//       }

//       // 🧾 Receipt generation
//       let receiptUrl = null;
//       try {
//         const receiptData = {
//           studentName:
//             UpdateStudent.name || UpdateStudent.email.split('@')[0],
//           studentEmail: UpdateStudent.email,
//           planName: planDetails.name,
//           planPrice: payment.amount,
//           orderId: orderId,
//           paymentId: paymentId,
//           features: planDetails.features,
//           category: payment.planCategory,
//           date: new Date().toLocaleDateString('en-IN'),
//         };

//         const receiptResult = await generateReceipt(receiptData);
//         if (receiptResult.success) {
//           receiptUrl = receiptResult.receiptUrl;

//           await Student.findByIdAndUpdate(studentId, {
//             'planDetails.receiptLink': receiptUrl,
//           });
//         }
//       } catch (receiptError) {
//         console.log('Error generating receipt:', receiptError);
//       }

//       // 📧 Payment confirmation email to student (via template)
//       try {
//         const template = PaymentConfirmationEmailTemplate({
//           studentName:
//             UpdateStudent.name || UpdateStudent.email.split('@')[0],
//           studentEmail: UpdateStudent.email,
//           planName: planDetails.name,
//           planPrice: payment.amount,
//           orderId: orderId,
//           paymentId: paymentId,
//           features: planDetails.features,
//           category: payment.planCategory,
//         });

//         await emailService.sendEmail(UpdateStudent.email, template);
//       } catch (emailError) {
//         console.log('Error sending confirmation email:', emailError);
//       }

//       httpResponse(req, res, 200, responseMessage.SUCCESS, {
//         paymentId,
//         status: 'success',
//         receiptUrl,
//         orderDetails: {
//           planDetails,
//           customerData: {
//             firstName:
//               UpdateStudent.name || UpdateStudent.email.split('@')[0],
//             lastName: '',
//             email: UpdateStudent.email,
//           },
//           orderId,
//           paymentId,
//           price: payment.amount,
//           category: payment.planCategory,
//           receiptUrl,
//         },
//       });
//     } catch (err) {
//       console.log('Error during payment verification:', err);
//       httpError(next, err, req, 500);
//     }
//   },
// };

import httpResponse from "../../util/httpResponse.js";
import responseMessage from "../../constant/responseMessage.js";
import httpError from "../../util/httpError.js";
import quicker from "../../util/quicker.js";
import config from "../../config/config.js";
import Payment from "../../model/paymentModel.js";
import Student from "../../model/studentModel.js";

import { Cashfree, CASHFREE_API_VERSION } from "../../config/cashfreeConfig.js";

import { PAYMENT_PLANS } from "../../constant/application.js";
import emailService from "../../service/email.service.js";
import { generateReceipt } from "../../service/receiptService.js";
import {
  PaymentConfirmationEmailTemplate,
  PaymentInitiationAdminEmailTemplate,
} from "../../service/emailTemplates.js";

/**
 * Small helper to support both SDK call signatures that Cashfree has used in docs:
 * - Cashfree.PGCreateOrder(request)
 * - Cashfree.PGCreateOrder(apiVersion, request)
 * Same for fetch calls.
 */
async function callCashfree(methodName, ...args) {
  const fn = Cashfree?.[methodName];
  if (typeof fn !== "function") {
    throw new Error(`Cashfree SDK method not found: ${methodName}`);
  }

  // Try versioned signature first (older SDK docs)
  try {
    if (args.length >= 1) {
      const res = await fn(CASHFREE_API_VERSION, ...args);
      return res;
    }
  } catch (e) {
    // fall through to unversioned call
  }

  // Try unversioned signature (newer SDK docs)
  return fn(...args);
}

function normalizeStudentPhone(student) {
  // Cashfree requires a phone in customer_details for many flows.
  // Keep it robust by trying common field names and falling back.
  const raw =
    student?.phone ||
    student?.mobile ||
    student?.mobileNumber ||
    student?.phoneNumber ||
    student?.contactNumber;

  // If you store country code separately, adjust here.
  const digits = (raw || "").toString().replace(/\D/g, "");
  // basic fallback: Cashfree sandbox accepts test numbers; production should be real
  return digits && digits.length >= 10 ? digits.slice(-10) : "9999999999";
}

function buildReturnUrl() {
  // Keep it optional but useful (Cashfree supports {order_id} templating in docs)
  const base =
    config.FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:3000";
  return `${base}/payment/callback?order_id={order_id}`;
}

export default {
  /**
   * PLAN PAYMENT (replaces Razorpay order creation with Cashfree order creation)
   */
  initiatePayment: async (req, res, next) => {
    try {
      const studentId = req.authenticatedStudent._id.toString();
      const { planType, category } = req.body;

      if (!planType || !category) {
        return httpError(
          next,
          new Error("Plan type and category are required"),
          req,
          400
        );
      }

      if (!PAYMENT_PLANS[category] || !PAYMENT_PLANS[category][planType]) {
        return httpError(next, new Error("Invalid plan selection"), req, 400);
      }

      const selectedPlan = PAYMENT_PLANS[category][planType];
      const amount = selectedPlan.price;

      // Get student details (Cashfree order needs customer_details)
      const student = await Student.findById(studentId).select(
        "name email phone mobile mobileNumber phoneNumber contactNumber"
      );

      const customerName = student?.name || student?.email?.split("@")?.[0] || "Student";
      const customerEmail = student?.email || "no-reply@example.com";
      const customerPhone = normalizeStudentPhone(student);

      // Cashfree order_id must be <= 50 chars, allowed: alphanumeric, _ and -
      const timestamp = Date.now().toString().slice(-8);
      const orderId = `ord_${studentId.slice(0, 10)}_${timestamp}`.slice(0, 50);

      const orderRequest = {
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: "INR",
        customer_details: {
          customer_id: studentId.slice(0, 30),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: buildReturnUrl(),
        },
      };

      // Create Cashfree Order (returns payment_session_id)
      // Cashfree docs: Create Order gives payment_session_id used for checkout :contentReference[oaicite:1]{index=1}
      const cfRes = await callCashfree("PGCreateOrder", orderRequest);
      const cfData = cfRes?.data || {};

      const paymentSessionId =
        cfData.payment_session_id || cfData.paymentSessionId || cfData.payment_session;

      if (!paymentSessionId) {
        return httpError(
          next,
          new Error("Cashfree order created but payment_session_id missing"),
          req,
          500
        );
      }

      const payment = new Payment({
        studentId,
        orderId: orderId,
        amount,
        currency: "INR",
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        planCategory: category,
        planType: planType,
        status: "PENDING",
        rawGatewayResponse: cfData,
      });

      await payment.save();

      // 🔔 Admin email (unchanged)
      try {
        if (student && student.email) {
          const studentName = student.name || student.email.split("@")[0];
          const studentEmail = student.email;

          const template = PaymentInitiationAdminEmailTemplate({
            studentName,
            studentEmail,
            planName: selectedPlan.name,
            planPrice: amount,
            orderId: orderId,
            category,
          });

          const adminEmail = process.env.ADMIN_EMAIL;
          if (adminEmail) await emailService.sendEmail(adminEmail, template);
        }
      } catch (emailError) {
        console.log("Error sending payment initiation email:", emailError);
      }

      return httpResponse(req, res, 200, responseMessage.SUCCESS, {
        orderId: orderId,
        amount,
        currency: "INR",
        // keep "key" field so frontend doesn't break if it expects it
        key: config.CASHFREE_KEY_ID || process.env.CASHFREE_KEY_ID,
        paymentSessionId,
        planDetails: selectedPlan,
        gateway: "CASHFREE",
      });
    } catch (err) {
      console.log(err);
      return httpError(next, err, req, 500);
    }
  },

  /**
   * LLM UPGRADE PAYMENT INIT
   * - you said: you'll be getting studentId and payment amount in request body
   * - but your code currently uses authenticated student — keeping that intact.
   */
  initiatePaymentForLLMUpgrade: async (req, res, next) => {
    try {
      const studentId = req.authenticatedStudent._id.toString();
      const { amount } = req.body;

      if (!amount || Number(amount) <= 0) {
        return httpError(
          next,
          new Error("Valid amount is required for LLM upgrade"),
          req,
          400
        );
      }

      const student = await Student.findById(studentId).select(
        "name email phone mobile mobileNumber phoneNumber contactNumber"
      );

      const customerName = student?.name || student?.email?.split("@")?.[0] || "Student";
      const customerEmail = student?.email || "no-reply@example.com";
      const customerPhone = normalizeStudentPhone(student);

      const timestamp = Date.now().toString().slice(-8);
      const orderId = `ord_llm_${studentId.slice(0, 8)}_${timestamp}`.slice(0, 50);

      const orderRequest = {
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: "INR",
        customer_details: {
          customer_id: studentId.slice(0, 30),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: buildReturnUrl(),
        },
      };

      const cfRes = await callCashfree("PGCreateOrder", orderRequest);
      const cfData = cfRes?.data || {};

      const paymentSessionId =
        cfData.payment_session_id || cfData.paymentSessionId || cfData.payment_session;

      if (!paymentSessionId) {
        return httpError(
          next,
          new Error("Cashfree order created but payment_session_id missing"),
          req,
          500
        );
      }

      const payment = new Payment({
        studentId,
        orderId: orderId,
        amount: Number(amount),
        currency: "INR",
        planId: "llm_upgrade",
        planName: "LLM University Finder Upgrade",
        planCategory: "llm",
        planType: "upgrade",
        status: "PENDING",
        rawGatewayResponse: cfData,
      });

      await payment.save();

      return httpResponse(req, res, 200, responseMessage.SUCCESS, {
        orderId: orderId,
        amount: Number(amount),
        currency: "INR",
        key: config.CASHFREE_KEY_ID || process.env.CASHFREE_KEY_ID,
        paymentSessionId,
        planDetails: {
          id: "llm_upgrade",
          name: "LLM University Finder Upgrade",
          category: "llm",
          type: "upgrade",
        },
        gateway: "CASHFREE",
      });
    } catch (err) {
      console.log(err);
      return httpError(next, err, req, 500);
    }
  },

  /**
   * VERIFY LLM UPGRADE PAYMENT
   * Cashfree approach:
   * - Fetch order by order_id, ensure order_status === "PAID"
   * - Fetch payments for order, ensure any payment_status === "SUCCESS"
   *
   * Order status values include ACTIVE / PAID / EXPIRED / TERMINATED ... :contentReference[oaicite:2]{index=2}
   * Payment status values include SUCCESS / FAILED / USER_DROPPED / PENDING ... :contentReference[oaicite:3]{index=3}
   */
  verifyPaymentForLLMUpgrade: async (req, res, next) => {
    const studentId = req.authenticatedStudent._id;

    try {
      const { orderId, paymentId } = req.body;

      if (!orderId) {
        return httpError(
          next,
          new Error(responseMessage.CUSTOM_MESSAGE("Missing orderId")),
          req,
          400
        );
      }

      // 1) Fetch order
      const orderRes = await callCashfree("PGFetchOrder", orderId);
      const order = orderRes?.data || {};

      if (order.order_status !== "PAID") {
        return httpError(
          next,
          new Error("Payment not completed (order not PAID)"),
          req,
          400
        );
      }

      // 2) Fetch payments for the order
      const paymentsRes = await callCashfree("PGOrderFetchPayments", orderId);
      const payments = paymentsRes?.data || [];

      const successfulPayments = payments.filter(
        (p) => p.payment_status === "SUCCESS"
      );

      if (!successfulPayments.length) {
        return httpError(
          next,
          new Error("Order is PAID but no SUCCESS payment found"),
          req,
          400
        );
      }

      const chosenPayment = paymentId
        ? successfulPayments.find((p) => String(p.cf_payment_id) === String(paymentId)) ||
          successfulPayments[0]
        : successfulPayments[0];

      // 3) Mark Payment SUCCESS in your DB
      const paymentDoc = await Payment.findOneAndUpdate(
        { orderId, studentId, status: "PENDING" },
        {
          paymentId: String(chosenPayment.cf_payment_id || paymentId || ""),
          status: "SUCCESS",
          rawGatewayResponse: { order, payment: chosenPayment },
        },
        { new: true }
      );

      if (!paymentDoc) {
        return httpResponse(
          req,
          res,
          404,
          responseMessage.NOT_FOUND("Payment")
        );
      }

      // 4) Credits logic: 5 credits per ₹50
      const amountInRupees = Number(paymentDoc.amount); // you stored rupees already
      const pricePerPack = 50;
      const creditsPerPack = 5;

      const packsBought = Math.floor(amountInRupees / pricePerPack);
      const creditsToAdd = packsBought * creditsPerPack;

      if (creditsToAdd > 0) {
        const updatedStudent = await Student.findByIdAndUpdate(
          studentId,
          { $inc: { universityFinderLlmResponseLimit: creditsToAdd } },
          { new: true }
        );

        if (!updatedStudent) {
          return httpError(
            next,
            new Error("Student not found while updating credits"),
            req,
            500
          );
        }

        return httpResponse(
          req,
          res,
          200,
          responseMessage.CUSTOM_MESSAGE(
            "Payment verified & LLM credits added successfully"
          ),
          {
            paymentId: paymentDoc.paymentId,
            orderId: paymentDoc.orderId,
            creditsAdded: creditsToAdd,
            totalCredits: updatedStudent.universityFinderLlmResponseLimit,
          }
        );
      }

      return httpResponse(
        req,
        res,
        200,
        responseMessage.CUSTOM_MESSAGE(
          "Payment verified but amount too low to add credits"
        ),
        {
          paymentId: paymentDoc.paymentId,
          orderId: paymentDoc.orderId,
          creditsAdded: 0,
        }
      );
    } catch (err) {
      console.error(err);
      return httpError(next, err, req, 500);
    }
  },

  /**
   * VERIFY PLAN PAYMENT (Cashfree)
   */
  verifyPayment: async (req, res, next) => {
    const studentId = req.authenticatedStudent._id;

    try {
      const { orderId, paymentId } = req.body;

      if (!orderId) {
        return httpError(
          next,
          new Error(responseMessage.CUSTOM_MESSAGE("Missing orderId")),
          req,
          400
        );
      }

      // 1) Fetch order from Cashfree and confirm PAID
      const orderRes = await callCashfree("PGFetchOrder", orderId);
      const order = orderRes?.data || {};

      if (order.order_status !== "PAID") {
        return httpError(
          next,
          new Error("Payment not completed (order not PAID)"),
          req,
          400
        );
      }

      // 2) Fetch payments and confirm a SUCCESS transaction exists
      const paymentsRes = await callCashfree("PGOrderFetchPayments", orderId);
      const payments = paymentsRes?.data || [];

      const successfulPayments = payments.filter(
        (p) => p.payment_status === "SUCCESS"
      );

      if (!successfulPayments.length) {
        return httpError(
          next,
          new Error("Order is PAID but no SUCCESS payment found"),
          req,
          400
        );
      }

      const chosenPayment = paymentId
        ? successfulPayments.find((p) => String(p.cf_payment_id) === String(paymentId)) ||
          successfulPayments[0]
        : successfulPayments[0];

      // 3) Update your Payment record
      const payment = await Payment.findOneAndUpdate(
        { orderId, studentId, status: "PENDING" },
        {
          paymentId: String(chosenPayment.cf_payment_id || paymentId || ""),
          status: "SUCCESS",
          rawGatewayResponse: { order, payment: chosenPayment },
        },
        { new: true }
      );

      if (!payment) {
        return httpResponse(
          req,
          res,
          404,
          responseMessage.NOT_FOUND("Payment")
        );
      }

      const planDetails = PAYMENT_PLANS[payment.planCategory][payment.planType];
      const degree = payment.planCategory === "masters" ? "MASTER" : "BACHELOR";

      const UpdateStudent = await Student.findByIdAndUpdate(
        studentId,
        {
          isFeePaid: true,
          isVerified: true,
          degree: degree,
          planDetails: {
            course: payment.planCategory,
            planId: payment.planId,
            planName: payment.planName,
            planPrice: payment.amount,
            planBuyDate: new Date(),
          },
        },
        { new: true }
      );

      if (!UpdateStudent) {
        return httpResponse(
          req,
          res,
          404,
          responseMessage.NOT_FOUND("Student")
        );
      }

      // 🧾 Receipt generation (unchanged)
      let receiptUrl = null;
      try {
        const receiptData = {
          studentName: UpdateStudent.name || UpdateStudent.email.split("@")[0],
          studentEmail: UpdateStudent.email,
          planName: planDetails.name,
          planPrice: payment.amount,
          orderId: orderId,
          paymentId: payment.paymentId,
          features: planDetails.features,
          category: payment.planCategory,
          date: new Date().toLocaleDateString("en-IN"),
        };

        const receiptResult = await generateReceipt(receiptData);
        if (receiptResult.success) {
          receiptUrl = receiptResult.receiptUrl;

          await Student.findByIdAndUpdate(studentId, {
            "planDetails.receiptLink": receiptUrl,
          });
        }
      } catch (receiptError) {
        console.log("Error generating receipt:", receiptError);
      }

      // 📧 Confirmation email (unchanged)
      try {
        const template = PaymentConfirmationEmailTemplate({
          studentName: UpdateStudent.name || UpdateStudent.email.split("@")[0],
          studentEmail: UpdateStudent.email,
          planName: planDetails.name,
          planPrice: payment.amount,
          orderId: orderId,
          paymentId: payment.paymentId,
          features: planDetails.features,
          category: payment.planCategory,
        });

        await emailService.sendEmail(UpdateStudent.email, template);
      } catch (emailError) {
        console.log("Error sending confirmation email:", emailError);
      }

      return httpResponse(req, res, 200, responseMessage.SUCCESS, {
        paymentId: payment.paymentId,
        status: "success",
        receiptUrl,
        orderDetails: {
          planDetails,
          customerData: {
            firstName: UpdateStudent.name || UpdateStudent.email.split("@")[0],
            lastName: "",
            email: UpdateStudent.email,
          },
          orderId,
          paymentId: payment.paymentId,
          price: payment.amount,
          category: payment.planCategory,
          receiptUrl,
        },
        gateway: "CASHFREE",
      });
    } catch (err) {
      console.log("Error during payment verification:", err);
      return httpError(next, err, req, 500);
    }
  },
};
