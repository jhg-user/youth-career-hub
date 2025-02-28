// board.js - 게시글 API 
const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL 연결 파일

// RESTful API에 맞게 POST, GET, PUT, DELETE로 구분하도록 수정
// ✅ 게시글 작성 API (POST /board)
router.post('/', (req, res) => {

    const { title, content, username, category_id } = req.body;
  
    if (!title || !content || !username || !category_id) {
      return res.status(400).json({ message: '제목, 내용, 사용자 ID, 카테고리를 입력해주세요.' });
    }
  
    const sql = `
      INSERT INTO board (title, content, username, category_id, views) 
      VALUES (?, ?, ?, ?, 0)
    `;
  
    db.query(sql, [title, content, username, category_id], (err, result) => {
      if (err) {
        console.error('게시글 생성 오류:', err);
        return res.status(500).json({ message: '게시글 생성 실패' });
      }
      res.status(201).json({ message: '게시글이 등록되었습니다.', id: result.insertId });
    });
});


// ✅ 게시글 목록 조회 API (GET /board)
router.get('/', (req, res) => {
    let page = parseInt(req.query.page) || 1;  // 현재 페이지 (기본값: 1)
    let limit = parseInt(req.query.limit) || 10;  // 한 페이지에 표시할 게시글 개수 (기본값: 10)
    let offset = (page - 1) * limit;  // OFFSET 계산
  
    const sql = `
      SELECT 
          board.id,
          board.title,
          board.content,
          board.views,
          board.created_at,
          categories.name AS category, -- 수정
          -- categories.name AS category_name, -- 🔥 카테고리명 가져오기
          users.nickname,
          users.profile_image,
          COALESCE(like_count_table.like_count, 0) AS like_count,
          COALESCE(bookmark_count_table.bookmark_count, 0) AS bookmark_count,
          COALESCE(comment_count_table.comment_count, 0) AS comment_count
      FROM board
      JOIN users ON board.username = users.username  -- 🔹 user_id → username 수정
      JOIN categories ON board.category_id = categories.id
      LEFT JOIN (
          SELECT post_id, COUNT(*) AS like_count FROM likes GROUP BY post_id
      ) AS like_count_table ON board.id = like_count_table.post_id
      LEFT JOIN (
          SELECT post_id, COUNT(*) AS bookmark_count FROM bookmarks GROUP BY post_id
      ) AS bookmark_count_table ON board.id = bookmark_count_table.post_id
      LEFT JOIN (
          SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id
      ) AS comment_count_table ON board.id = comment_count_table.post_id
      ORDER BY board.created_at DESC
      LIMIT ? OFFSET ?;
    `;

    db.query(sql, [limit, offset], (err, results) => {
      if (err) {
        console.error('게시판 조회 오류:', err);
        return res.status(500).json({ message: '게시판 조회 실패' });
      }

      // 전체 게시글 개수 조회 (총 페이지 수 계산용)
      const countSql = `SELECT COUNT(*) AS total FROM board;`;
      db.query(countSql, (err, countResult) => {
        if (err) {
          console.error('게시글 개수 조회 오류:', err);
          return res.status(500).json({ message: '게시글 개수 조회 실패' });
        }

        const totalPosts = countResult[0].total;
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
          currentPage: page,
          totalPages: totalPages,
          totalPosts: totalPosts,
          posts: results
        });
      });
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
  
    // 게시글 조회 쿼리
    const sql = `
      SELECT 
          board.id, board.title, board.content, board.views, board.created_at,
          categories.name AS category,
          users.nickname, users.profile_image,
          COALESCE(like_count_table.like_count, 0) AS like_count,
          COALESCE(bookmark_count_table.bookmark_count, 0) AS bookmark_count,
          COALESCE(comment_count_table.comment_count, 0) AS comment_count
      FROM board
      JOIN users ON board.username = users.username
      JOIN categories ON board.category_id = categories.id
      LEFT JOIN (
          SELECT post_id, COUNT(*) AS like_count FROM likes GROUP BY post_id
      ) AS like_count_table ON board.id = like_count_table.post_id
      LEFT JOIN (
          SELECT post_id, COUNT(*) AS bookmark_count FROM bookmarks GROUP BY post_id
      ) AS bookmark_count_table ON board.id = bookmark_count_table.post_id
      LEFT JOIN (
          SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id
      ) AS comment_count_table ON board.id = comment_count_table.post_id
      WHERE board.id = ?;
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

// ✅ 게시글 수정 API (작성자는 변경되지 않음)
router.put('/:id', (req, res) => {
  const postId = req.params.id;
  const { title, content, category_id } = req.body;

  console.log(`📢 게시글 수정 요청: ID=${postId}`);

  if (!title || !content || !category_id) {
      return res.status(400).json({ message: '제목, 내용, 카테고리를 입력해주세요.' });
  }

  // 🔥 원작성자를 유지하면서 수정하기 위해 기존 작성자 확인
  const getOriginalPostSql = `SELECT username FROM board WHERE id = ?`;
  db.query(getOriginalPostSql, [postId], (err, result) => {
      if (err) {
          console.error("❌ 게시글 조회 오류:", err);
          return res.status(500).json({ message: '게시글 조회 실패' });
      }
      if (result.length === 0) {
          return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      }

      const originalUsername = result[0].username; // ✅ 원래 작성자 유지

      // ✅ 게시글 업데이트 (작성자는 변경하지 않음)
      const updateSql = `UPDATE board SET title = ?, content = ?, category_id = ? WHERE id = ?`;
      db.query(updateSql, [title, content, category_id, postId], (err) => {
          if (err) {
              console.error("❌ 게시글 수정 오류:", err);
              return res.status(500).json({ message: '게시글 수정 실패' });
          }
          res.json({ message: '✅ 게시글이 수정되었습니다!', originalUsername }); // ✅ 원작성자 유지됨
      });
  });
});


// ✅ 게시글 삭제 (DELETE /board/:id)
router.delete('/:id', (req, res) => {
  const postId = req.params.id;
  const { username } = req.body;

  const checkAuthorSql = `SELECT * FROM board WHERE id = ? AND username = ?`;
  db.query(checkAuthorSql, [postId, username], (err, result) => {
      if (err) return res.status(500).json({ message: '작성자 확인 실패' });
      if (result.length === 0) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

      const deleteSql = `DELETE FROM board WHERE id = ?`;
      db.query(deleteSql, [postId], (err) => {
          if (err) return res.status(500).json({ message: '게시글 삭제 실패' });
          res.json({ message: '✅ 게시글이 삭제되었습니다!' });
      });
  });
});

module.exports = router;

