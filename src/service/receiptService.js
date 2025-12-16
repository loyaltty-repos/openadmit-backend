import fs from 'fs/promises';
import path from 'path';
import { uploadOnImageKit } from './imageKitService.js';

const generateReceiptHTML = (receiptData) => {
    const { 
        studentName, 
        studentEmail, 
        planName, 
        planPrice, 
        orderId, 
        paymentId, 
        features, 
        category,
        date 
    } = receiptData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 40px; 
                background-color: #f8f9fa;
                color: #333;
            }
            .receipt-container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                border-radius: 10px;
                overflow: hidden;
            }
            .header { 
                background: linear-gradient(135deg, #145044, #1a6b59); 
                color: white; 
                padding: 40px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 2.5em; 
                font-weight: bold; 
            }
            .header p { 
                margin: 10px 0 0 0; 
                font-size: 1.2em; 
                opacity: 0.9; 
            }
            .content { 
                padding: 40px; 
            }
            .receipt-info { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            .receipt-info div h3 { 
                margin: 0 0 10px 0; 
                color: #145044; 
                font-size: 1.1em;
            }
            .receipt-info div p { 
                margin: 5px 0; 
                color: #666; 
            }
            .order-details { 
                background: #f8f9fa; 
                padding: 30px; 
                border-radius: 8px; 
                margin: 30px 0; 
            }
            .order-details h2 { 
                margin: 0 0 20px 0; 
                color: #145044; 
                font-size: 1.8em;
            }
            .plan-info { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #ddd;
            }
            .plan-name { 
                font-size: 1.4em; 
                font-weight: bold; 
                color: #333; 
            }
            .plan-category { 
                background: #145044; 
                color: white; 
                padding: 5px 15px; 
                border-radius: 20px; 
                font-size: 0.9em; 
                margin-top: 5px;
                display: inline-block;
            }
            .plan-price { 
                font-size: 2.2em; 
                font-weight: bold; 
                color: #145044; 
            }
            .features { 
                margin: 20px 0; 
            }
            .features h3 { 
                margin: 0 0 15px 0; 
                color: #145044; 
            }
            .feature-item { 
                padding: 8px 0; 
                border-bottom: 1px solid #f0f0f0; 
                display: flex;
                align-items: center;
            }
            .feature-item:last-child { 
                border-bottom: none; 
            }
            .feature-item::before {
                content: "✓";
                color: #145044;
                font-weight: bold;
                margin-right: 10px;
                font-size: 1.2em;
            }
            .payment-details { 
                background: white; 
                border: 2px solid #145044; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 30px 0; 
            }
            .payment-details h3 { 
                margin: 0 0 15px 0; 
                color: #145044; 
            }
            .detail-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 8px 0; 
                border-bottom: 1px solid #f0f0f0; 
            }
            .detail-row:last-child { 
                border-bottom: none; 
                font-weight: bold;
                font-size: 1.1em;
            }
            .footer { 
                text-align: center; 
                padding: 30px; 
                background: #f8f9fa; 
                color: #666; 
                border-top: 1px solid #eee;
            }
            .footer h3 { 
                color: #145044; 
                margin-bottom: 15px; 
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 100px;
                color: rgba(20, 80, 68, 0.03);
                font-weight: bold;
                z-index: 0;
                pointer-events: none;
            }
            .content { position: relative; z-index: 1; }
        </style>
    </head>
    <body>
        <div class="watermark">UPBROAD</div>
        <div class="receipt-container">
            <div class="header">
                <h1>PAYMENT RECEIPT</h1>
                <p>Thank you for choosing UpBroad</p>
            </div>
            
            <div class="content">
                <div class="receipt-info">
                    <div>
                        <h3>Bill To:</h3>
                        <p><strong>${studentName}</strong></p>
                        <p>${studentEmail}</p>
                    </div>
                    <div style="text-align: right;">
                        <h3>Receipt Details:</h3>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Receipt #:</strong> RCP-${orderId}</p>
                    </div>
                </div>
                
                <div class="order-details">
                    <h2>Order Summary</h2>
                    <div class="plan-info">
                        <div>
                            <div class="plan-name">${planName}</div>
                            <div class="plan-category">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                        </div>
                        <div class="plan-price">₹${planPrice.toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div class="features">
                        <h3>Services Included:</h3>
                        ${features.map(feature => `<div class="feature-item">${feature}</div>`).join('')}
                    </div>
                </div>
                
                <div class="payment-details">
                    <h3>Payment Information</h3>
                    <div class="detail-row">
                        <span>Order ID:</span>
                        <span style="font-family: monospace;">${orderId}</span>
                    </div>
                    <div class="detail-row">
                        <span>Payment ID:</span>
                        <span style="font-family: monospace;">${paymentId}</span>
                    </div>
                    <div class="detail-row">
                        <span>Payment Method:</span>
                        <span>Online Payment</span>
                    </div>
                    <div class="detail-row">
                        <span>Payment Status:</span>
                        <span style="color: #28a745; font-weight: bold;">✓ PAID</span>
                    </div>
                    <div class="detail-row">
                        <span>Total Amount:</span>
                        <span style="color: #145044;">₹${planPrice.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <h3>UpBroad</h3>
                <p>Your journey to success starts here</p>
                <p>📧 support@upbroad.com | 📞 +91 98765 43210</p>
                <p style="margin-top: 20px; font-size: 0.9em;">
                    This is a computer-generated receipt. No signature required.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateReceipt = async (receiptData) => {
    try {
        const html = generateReceiptHTML(receiptData);
        
        // Create a temporary HTML file
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        
        const fileName = `receipt_${receiptData.orderId}_${Date.now()}.html`;
        const filePath = path.join(tempDir, fileName);
        
        await fs.writeFile(filePath, html);
        
        // Upload to ImageKit
        const uploadResult = await uploadOnImageKit(filePath, 'receipts');
        
        return {
            success: true,
            receiptUrl: uploadResult.url,
            fileId: uploadResult.fileId
        };
    } catch (error) {
        console.error('Error generating receipt:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export { generateReceipt };