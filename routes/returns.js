const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

    // Log the data (for now)
    console.log('Return request received:', formData);

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

module.exports = router;
