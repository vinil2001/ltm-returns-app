const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Email configuration (will be updated with real credentials)
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// POST /apps/returns/submit
router.post('/submit', upload.array('photos', 3), async (req, res) => {
  try {
    // Parse form data
    const formData = {
      name: req.body.Name || req.body.full_name,
      email: req.body.Email || req.body.email,
      phone: req.body.Phone || req.body.phone || '',
      orderNumber: req.body.Order_number || req.body.order_number,
      items: [],
      comment: req.body.Comment || req.body.details || '',
      photos: req.files || []
    };

    // Parse items from form data
    const itemKeys = Object.keys(req.body).filter(key => key.startsWith('items['));
    const itemsMap = {};
    
    itemKeys.forEach(key => {
      const match = key.match(/items\[(\d+)\]\[(.+)\]/);
      if (match) {
        const index = match[1];
        const field = match[2];
        if (!itemsMap[index]) itemsMap[index] = {};
        itemsMap[index][field] = req.body[key];
      }
    });

    formData.items = Object.values(itemsMap);

    // Send email
    await sendReturnEmail(formData);

    res.status(200).json({ 
      success: true, 
      message: 'Return request submitted successfully' 
    });
  } catch (error) {
    console.error('Error processing return request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing return request' 
    });
  }
});

async function sendReturnEmail(data) {
  const emailContent = `
    <h2>New Return Request</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Order Number:</strong> ${data.orderNumber}</p>
    
    <h3>Items to Return:</h3>
    <ul>
      ${data.items.map(item => `
        <li>
          <strong>${item.product}</strong> - Qty: ${item.qty}
          <br>Reason: ${item.reason === 'Other' ? item.other_reason : item.reason}
        </li>
      `).join('')}
    </ul>
    
    ${data.comment ? `<p><strong>Additional Details:</strong><br>${data.comment}</p>` : ''}
    
    ${data.photos.length > 0 ? `<p><strong>Photos:</strong> ${data.photos.length} photo(s) attached</p>` : ''}
  `;

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@ltmuseum.co.uk',
    to: process.env.RETURNS_EMAIL || 'shopping@ltmuseum.co.uk',
    subject: `Return Request - Order ${data.orderNumber}`,
    html: emailContent,
    attachments: data.photos.map((photo, index) => ({
      filename: `photo-${index + 1}.${photo.originalname.split('.').pop()}`,
      content: photo.buffer
    }))
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;
