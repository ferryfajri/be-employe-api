const pool = require('../config/db'); // otomatis baca dari .env jika sudah diset di db.js

// Get all applicants (Admin only)
exports.getAllApplicants = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.username, u.email 
       FROM applicants a 
       JOIN users u ON a.user_id = u.id 
       ORDER BY a.created_at DESC`
    );
    res.json({ applicants: result.rows });
  } catch (error) {
    console.error('Get all applicants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get specific applicant (Admin only)
exports.getMyApplicant = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM applicants WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    res.json({ applicant: result.rows[0] });
  } catch (error) {
    console.error('Get applicant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get specific applicant (Admin only)
exports.getApplicantById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.username, u.email 
       FROM applicants a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    res.json({ applicant: result.rows[0] });
  } catch (error) {
    console.error('Get applicant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or update applicant biodata
exports.createOrUpdateApplicant = async (req, res) => {
  try {
    const { full_name, phone, address, education, experience, skills } = req.body;

    if (!full_name) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    const existing = await pool.query(
      'SELECT * FROM applicants WHERE user_id = $1',
      [req.user.id]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        'UPDATE applicants SET full_name=$1, phone=$2, address=$3, education=$4, experience=$5, skills=$6, updated_at=NOW() WHERE user_id=$7 RETURNING *',
        [full_name, phone, address, education, experience, skills, req.user.id]
      );
    } else {
      result = await pool.query(
        'INSERT INTO applicants (user_id, full_name, phone, address, education, experience, skills) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [req.user.id, full_name, phone, address, education, experience, skills]
      );
    }

    res.json({
      message: existing.rows.length > 0 ? 'Biodata updated successfully' : 'Biodata created successfully',
      applicant: result.rows[0],
    });
  } catch (error) {
    console.error('Applicant create/update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete applicant (Admin only)
exports.deleteApplicant = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM applicants WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    res.json({ message: 'Applicant deleted successfully' });
  } catch (error) {
    console.error('Delete applicant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
