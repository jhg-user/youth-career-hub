require('dotenv').config();  // .env 파일 로드
const mysql = require('mysql2');

// MySQL 연결 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // .env에서 환경 변수 가져옴
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306
});

// MySQL 연결 확인
db.connect(err => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
    return;
  }
  console.log('MySQL 연결 성공!');
});

// 다른 파일에서 db 객체 사용 가능
module.exports = db;
