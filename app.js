// express 불러오기
const express = require('express');

const bodyParser = require('body-parser');
const boardRoutes = require('./routes/board'); // 게시판 API 라우트

require('dotenv').config();

const path = require('path');
// express 인스턴스 생성
const app = express();
// // 포트 정보
// const port = 3000;
const PORT = process.env.PORT || 3000;


// 정적 파일 제공 (favicon 포함)
app.use(express.static(path.join(__dirname, 'public')));

// Home 페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
//   res.sendFile(__dirname + '/views/index.html');
});

// Middleware 설정
app.use(bodyParser.json());
app.use('/board', boardRoutes);


app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
