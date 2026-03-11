require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const analyzeRoute = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/analyze', limiter); // explicitly apply to /analyze

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/analyze', analyzeRoute);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'Sales Insight Automator API is running.' });
});

app.listen(PORT, () => {
  console.log(`Server is LIVE on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Swagger docs: http://localhost:${PORT}/docs`);
});
