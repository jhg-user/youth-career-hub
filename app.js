// express 불러오기
const express = require('express');

const path = require('path');
// express 인스턴스 생성
const app = express();
// 포트 정보
const port = 3000;

// // 라우트 설정
// // HTTP GET 방식으로 '/' 경로를 요청하였을 때
// // Hello World!라는 문자열을 결과값으로 보냄
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// // 서버 실행
// app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

// 정적 파일 제공 (favicon 포함)
app.use(express.static(path.join(__dirname, 'public')));

// Home 페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});