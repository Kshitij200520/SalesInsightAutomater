const express = require('express');
const multer = require('multer');
const { parseFile } = require('../utils/fileParser');
const { generateSummary } = require('../services/aiService');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Validate file types (.csv and .xlsx only)
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only .csv and .xlsx files are allowed!'), false);
    }
  }
});

/**
 * @swagger
 * /analyze:
 *   post:
 *     summary: Analyze sales data, generate summary, and email to recipient
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or XLSX file containing sales data
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *     responses:
 *       200:
 *         description: Successfully processed
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a CSV or XLSX file.' });
    }

    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid recipient email address.' });
    }

    // 1. Parse CSV/Excel
    const parsedData = await parseFile(req.file.buffer, req.file.mimetype);

    if (!parsedData || parsedData.length === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty or invalid.' });
    }

    // 2. Extract Metrics
    console.log('Step 2: Extracting metrics...');
    const metricsString = extractMetricsStr(parsedData);
    
    // 3. Generate AI Summary
    console.log('Step 3: Generating AI summary...');
    const summary = await generateSummary(metricsString);
    console.log('AI Summary generated successfully.');

    // 4. Send Email (Fire and forget to avoid UI hang)
    console.log('Step 4: Sending email to:', email);
    sendEmail(email, summary).then(sent => {
      console.log('Email delivery status:', sent ? 'Success' : 'Mock/Failed');
    }).catch(err => {
      console.error('Background email error:', err.message);
    });

    res.status(200).json({
      message: 'Analysis complete.',
      summary: summary,
      emailStatus: 'Process initiated. Checking delivery...'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during processing.' });
  }
});

// Calculate Important Metrics
function extractMetricsStr(data) {
  let totalRevenue = 0;
  let cancelledOrders = 0;
  const revenueByRegion = {};
  const categoryPerformance = {};

  data.forEach(row => {
    // Sanitize inputs by parsing string to float
    const rev = parseFloat(row.Revenue || 0);
    const region = row.Region || 'Unknown';
    const category = row.Product_Category || row.Category || 'Unknown';
    const status = row.Status || '';

    totalRevenue += rev;
    revenueByRegion[region] = (revenueByRegion[region] || 0) + rev;
    categoryPerformance[category] = (categoryPerformance[category] || 0) + rev;

    if (status.toLowerCase() === 'cancelled') {
        cancelledOrders++;
    }
  });

  // Determine best performing region
  let bestRegion = 'None';
  let bestRegionRevenue = 0;
  for (const [region, revenue] of Object.entries(revenueByRegion)) {
    if (revenue > bestRegionRevenue) {
      bestRegionRevenue = revenue;
      bestRegion = region;
    }
  }

  return JSON.stringify({
    totalRevenue,
    bestPerformingRegion: bestRegion,
    revenueByRegion,
    categoryPerformance,
    cancelledOrders,
    sampleData: data.slice(0, 5) // Context context
  });
}

module.exports = router;
