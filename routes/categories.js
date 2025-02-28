const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL 연결 파일

// 📌 ✅ 카테고리 목록 조회 API (GET /categories)
router.get('/', (req, res) => {
    const sql = `SELECT id, name FROM categories ORDER BY id ASC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ 카테고리 조회 오류:', err);
            return res.status(500).json({ message: '카테고리 조회 실패' });
        }

        res.json(results); // 🔥 JSON 형태로 반환
    });
});

module.exports = router;
