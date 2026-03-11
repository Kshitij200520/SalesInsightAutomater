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

// Routes
app.use('/analyze', analyzeRoute);

// Swagger documentation - Mounted after routes
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route - Plain text as requested
app.get('/', (req, res) => {
  res.send('Sales Insight Automator API running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is LIVE on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Swagger docs: http://localhost:${PORT}/docs`);
});
