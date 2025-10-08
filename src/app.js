const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/applicants', applicantRoutes);

module.exports = app;
