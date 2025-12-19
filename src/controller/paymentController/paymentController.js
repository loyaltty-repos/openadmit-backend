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
import quicker from "../../util/quicker.js"; // kept to avoid breaking imports elsewhere
import config from "../../config/config.js";
import Payment from "../../model/paymentModel.js";
import Student from "../../model/studentModel.js";

import emailService from "../../service/email.service.js";
import { generateReceipt } from "../../service/receiptService.js";
import {
  PaymentConfirmationEmailTemplate,
  PaymentInitiationAdminEmailTemplate,
} from "../../service/emailTemplates.js";

import { PAYMENT_PLANS } from "../../constant/application.js";

// ✅ Cashfree imports (works whether you export client or not)
import { Cashfree, cashfreeClient, CASHFREE_API_VERSION } from "../../config/cashfreeConfig.js";

/**
 * Universal caller that supports BOTH Cashfree SDK styles:
 * - v5+: instance client => cashfreeClient.PGCreateOrder(request)
 * - v4: static => Cashfree.PGCreateOrder(apiVersion, request)
 */
async function callCashfree(methodName, ...args) {
  // Prefer v5 instance client
  if (cashfreeClient && typeof cashfreeClient[methodName] === "function") {
    return cashfreeClient[methodName](...args);
  }

  // Fallback to v4 static
  if (Cashfree && typeof Cashfree[methodName] === "function") {
    return Cashfree[methodName](CASHFREE_API_VERSION || "2023-08-01", ...args);
  }

  throw new Error(`Cashfree SDK method not found: ${methodName}`);
}

function normalizeStudentPhone(student) {
  const raw =
    student?.phone ||
    student?.mobile ||
    student?.mobileNumber ||
    student?.phoneNumber ||
    student?.contactNumber;

  const digits = (raw || "").toString().replace(/\D/g, "");
  // fallback test phone (replace with your preference)
  return digits && digits.length >= 10 ? digits.slice(-10) : "9999999999";
}

function buildReturnUrl() {
  // Cashfree return_url should contain {order_id} placeholder in many flows
  // (it’s fine even if you don’t use redirect flow, but useful for hosted checkout)
  const base =
    config.FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:3000";
  return `${base}/payment/callback?order_id={order_id}`;
}

function buildNotifyUrl() {
  // optional webhook/notify url if you implement webhooks
  const base =
    config.BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000";
  return `${base}/api/payment/cashfree/webhook`;
}

/**
 * Fetch payment success from Cashfree:
 * - Order must be PAID
 * - At least one payment must be SUCCESS
 *
 * Cashfree order creation returns payment_session_id used for checkout. :contentReference[oaicite:2]{index=2}
 */
async function fetchCashfreePaidStatus(orderId) {
  const orderRes = await callCashfree("PGFetchOrder", orderId);
  const order = orderRes?.data || orderRes || {};

  // Payments list
  const paymentsRes = await callCashfree("PGOrderFetchPayments", orderId);
  const payments = paymentsRes?.data || paymentsRes || [];

  const successPayments = Array.isArray(payments)
    ? payments.filter((p) => p?.payment_status === "SUCCESS")
    : [];

  const chosenPayment = successPayments[0] || null;

  return {
    order,
    payments,
    isPaid: order?.order_status === "PAID" && !!chosenPayment,
    chosenPayment,
  };
}

export default {
  /**
   * ===== PLAN PAYMENT INIT (Cashfree) =====
   * req.body: { category: 'masters', planType: 'pro' }
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
      const amount = Number(selectedPlan.price);

      // Fetch student for Cashfree customer_details
      const student = await Student.findById(studentId).select(
        "name email phone mobile mobileNumber phoneNumber contactNumber"
      );

      const customerName =
        student?.name || student?.email?.split("@")?.[0] || "Student";
      const customerEmail = student?.email || "no-reply@example.com";
      const customerPhone = normalizeStudentPhone(student);

      // Cashfree order_id limit is typically <= 50 chars
      const timestamp = Date.now().toString().slice(-8);
      const orderId = `ord_${studentId.slice(0, 10)}_${timestamp}`.slice(0, 50);

      const orderRequest = {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: studentId.slice(0, 30),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: buildReturnUrl(),
          notify_url: buildNotifyUrl(), // optional
        },
      };

      // ✅ Create Cashfree order => returns payment_session_id :contentReference[oaicite:3]{index=3}
      const cfRes = await callCashfree("PGCreateOrder", orderRequest);
      const cfData = cfRes?.data || cfRes || {};

      const paymentSessionId =
        cfData.payment_session_id ||
        cfData.paymentSessionId ||
        cfData.payment_session;

      if (!paymentSessionId) {
        return httpError(
          next,
          new Error("Cashfree order created but payment_session_id missing"),
          req,
          500
        );
      }

      // Save Payment in DB (keeps your structure)
      const payment = new Payment({
        studentId,
        orderId,
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

      // 🔔 Send admin initiation email (same as your Razorpay flow)
      try {
        if (student && student.email) {
          const studentName = student.name || student.email.split("@")[0];
          const studentEmail = student.email;

          const template = PaymentInitiationAdminEmailTemplate({
            studentName,
            studentEmail,
            planName: selectedPlan.name,
            planPrice: amount,
            orderId,
            category,
          });

          const adminEmail = process.env.ADMIN_EMAIL;
          if (adminEmail) {
            await emailService.sendEmail(adminEmail, template);
          }
        }
      } catch (emailError) {
        console.log("Error sending payment initiation email:", emailError);
      }

      // Keep response keys compatible with your old frontend
      return httpResponse(req, res, 200, responseMessage.SUCCESS, {
        orderId,
        amount,
        currency: "INR",
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
   * ===== LLM UPGRADE INIT (Cashfree) =====
   * req.body: { amount: 100 }  (studentId from auth)
   */
  initiatePaymentForLLMUpgrade: async (req, res, next) => {
    try {
      const studentId = req.authenticatedStudent._id.toString();
      const { amount } = req.body;

      const amt = Number(amount);
      if (!amt || amt <= 0) {
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

      const customerName =
        student?.name || student?.email?.split("@")?.[0] || "Student";
      const customerEmail = student?.email || "no-reply@example.com";
      const customerPhone = normalizeStudentPhone(student);

      const timestamp = Date.now().toString().slice(-8);
      const orderId = `ord_llm_${studentId.slice(0, 8)}_${timestamp}`.slice(
        0,
        50
      );

      const orderRequest = {
        order_id: orderId,
        order_amount: amt,
        order_currency: "INR",
        customer_details: {
          customer_id: studentId.slice(0, 30),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: buildReturnUrl(),
          notify_url: buildNotifyUrl(), // optional
        },
      };

      const cfRes = await callCashfree("PGCreateOrder", orderRequest);
      const cfData = cfRes?.data || cfRes || {};

      const paymentSessionId =
        cfData.payment_session_id ||
        cfData.paymentSessionId ||
        cfData.payment_session;

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
        orderId,
        amount: amt,
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
        orderId,
        amount: amt,
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
   * ===== VERIFY LLM UPGRADE (Cashfree) =====
   * Accepts old fields too (signature ignored) so frontend won’t break.
   * req.body can be:
   *  - { orderId }
   *  - { orderId, paymentId }
   *  - { orderId, paymentId, signature }  (ignored)
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

      const { order, payments, isPaid, chosenPayment } =
        await fetchCashfreePaidStatus(orderId);

      if (!isPaid) {
        return httpError(
          next,
          new Error("Payment not completed (order not PAID / no SUCCESS payment)"),
          req,
          400
        );
      }

      // pick payment if client sent paymentId, else use first success
      const finalPayment =
        paymentId && Array.isArray(payments)
          ? payments.find((p) => String(p?.cf_payment_id) === String(paymentId)) ||
            chosenPayment
          : chosenPayment;

      // Update Payment doc
      const paymentDoc = await Payment.findOneAndUpdate(
        { orderId, studentId, status: "PENDING" },
        {
          paymentId: String(finalPayment?.cf_payment_id || paymentId || ""),
          status: "SUCCESS",
          rawGatewayResponse: { order, payment: finalPayment, payments },
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

      // Credits: 5 credits per ₹50 (your same rule)
      const amountInRupees = Number(paymentDoc.amount);
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
   * ===== VERIFY MAIN PLAN PAYMENT (Cashfree) =====
   * Accepts old fields too (signature ignored) so frontend won’t break.
   * req.body can be:
   *  - { orderId }
   *  - { orderId, paymentId }
   *  - { orderId, paymentId, signature }  (ignored)
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

      const { order, payments, isPaid, chosenPayment } =
        await fetchCashfreePaidStatus(orderId);

      if (!isPaid) {
        return httpError(
          next,
          new Error("Payment not completed (order not PAID / no SUCCESS payment)"),
          req,
          400
        );
      }

      const finalPayment =
        paymentId && Array.isArray(payments)
          ? payments.find((p) => String(p?.cf_payment_id) === String(paymentId)) ||
            chosenPayment
          : chosenPayment;

      // Update Payment status in DB
      const payment = await Payment.findOneAndUpdate(
        { orderId, studentId, status: "PENDING" },
        {
          paymentId: String(finalPayment?.cf_payment_id || paymentId || ""),
          status: "SUCCESS",
          rawGatewayResponse: { order, payment: finalPayment, payments },
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

      // Keep your plan mapping logic
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
