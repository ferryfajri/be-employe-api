const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const applicantController = require('../controllers/applicantController');

router.post('/', authenticateToken, applicantController.createOrUpdateApplicant);
router.get('/me', authenticateToken, applicantController.getMyApplicant);
router.get('/', authenticateToken, isAdmin, applicantController.getAllApplicants);
router.get('/:id', authenticateToken, isAdmin, applicantController.getApplicantById);
router.delete('/:id', authenticateToken, isAdmin, applicantController.deleteApplicant);

module.exports = router;
