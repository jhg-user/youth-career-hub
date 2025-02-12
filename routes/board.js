const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL 연결 파일

// ✅ 게시글 작성 API (POST /board/create)
router.post('/create', (req, res) => {
  const { title, content, user_id, category } = req.body;

  if (!title || !content || !user_id || !category) {
    return res.status(400).json({ message: '제목, 내용, 사용자 ID, 카테고리를 입력해주세요.' });
  }

  const sql = `
    INSERT INTO board (title, content, user_id, category, views, likes, comments, bookmarks) 
    VALUES (?, ?, ?, ?, 0, 0, 0, 0)
  `;

  db.query(sql, [title, content, user_id, category], (err, result) => {
    if (err) {
      console.error('게시글 생성 오류:', err);
      return res.status(500).json({ message: '게시글 생성 실패' });
    }
    res.status(201).json({ message: '게시글이 등록되었습니다.', id: result.insertId });
  });
});

// ✅ 게시글 목록 조회 API (GET /board/list)
router.get('/list', (req, res) => {
  const sql = `
    SELECT id, title, content, created_at, category, views, likes, comments, bookmarks
    FROM board
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('게시판 조회 오류:', err);
      return res.status(500).json({ message: '게시판 조회 실패' });
    }
    res.json(results);
  });
});

// ✅ 특정 게시글 조회 API (GET /board/:id)
router.get('/:id', (req, res) => {
  const postId = req.params.id;

  // 조회수 증가
  const updateViews = 'UPDATE board SET views = views + 1 WHERE id = ?';
  db.query(updateViews, [postId], (err) => {
    if (err) {
      console.error('조회수 증가 오류:', err);
    }
  });

  // 게시글 조회
  const sql = `
    SELECT id, title, content, created_at, category, views, likes, comments, bookmarks
    FROM board
    WHERE id = ?
  `;

  db.query(sql, [postId], (err, result) => {
    if (err) {
      console.error('게시글 조회 오류:', err);
      return res.status(500).json({ message: '게시글 조회 실패' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json(result[0]);
  });
});

module.exports = router;
