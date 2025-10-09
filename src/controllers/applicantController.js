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
    const {
      posisi,
      full_name,
      ktp,
      birth_place,
      birth_date,
      gender,
      religion,
      blood_type,
      marital_status,
      address_ktp,
      address_domisili,
      email,
      phone,
      emergency_contact,
      education,
      training,
      pekerjaan,
      skills,
      bersedia_penempatan,
      penghasilan_harapan,
    } = req.body;

    // Validasi sederhana
    if (!full_name) {
      return res.status(400).json({ message: "Full name is required" });
    }

    // Cek apakah user sudah ada di tabel applicants
    const existing = await pool.query(
      "SELECT * FROM applicants WHERE user_id = $1",
      [req.user.id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update jika sudah ada
      result = await pool.query(
        `UPDATE applicants 
         SET posisi=$1,
             full_name=$2,
             ktp=$3,
             birth_place=$4,
             birth_date=$5,
             gender=$6,
             religion=$7,
             blood_type=$8,
             marital_status=$9,
             address_ktp=$10,
             address_domisili=$11,
             email=$12,
             phone=$13,
             emergency_contact=$14,
             education=$15,
             training=$16,
             pekerjaan=$17,
             skills=$18,
             bersedia_penempatan=$19,
             penghasilan_harapan=$20,
             updated_at=NOW()
         WHERE user_id=$21
         RETURNING *`,
        [
          posisi,
          full_name,
          ktp,
          birth_place,
          birth_date,
          gender,
          religion,
          blood_type,
          marital_status,
          address_ktp,
          address_domisili,
          email,
          phone,
          emergency_contact,
          JSON.stringify(education || []),
          JSON.stringify(training || []),
          JSON.stringify(pekerjaan || []),
          skills,
          bersedia_penempatan,
          penghasilan_harapan,
          req.user.id,
        ]
      );
    } else {
      // Insert jika belum ada
      result = await pool.query(
        `INSERT INTO applicants (
           user_id,
           posisi,
           full_name,
           ktp,
           birth_place,
           birth_date,
           gender,
           religion,
           blood_type,
           marital_status,
           address_ktp,
           address_domisili,
           email,
           phone,
           emergency_contact,
           education,
           training,
           pekerjaan,
           skills,
           bersedia_penempatan,
           penghasilan_harapan
         ) 
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         RETURNING *`,
        [
          req.user.id,
          posisi,
          full_name,
          ktp,
          birth_place,
          birth_date,
          gender,
          religion,
          blood_type,
          marital_status,
          address_ktp,
          address_domisili,
          email,
          phone,
          emergency_contact,
          JSON.stringify(education || []),
          JSON.stringify(training || []),
          JSON.stringify(pekerjaan || []),
          skills,
          bersedia_penempatan,
          penghasilan_harapan,
        ]
      );
    }

    return res.json({
      message:
        existing.rows.length > 0
          ? "Biodata updated successfully"
          : "Biodata created successfully",
      applicant: result.rows[0],
    });
  } catch (error) {
    console.error("Applicant create/update error:", error);
    res.status(500).json({ message: "Server error" });
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
