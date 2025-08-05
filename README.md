# 위로 - 목회상담 챗봇

전문 상담사와 함께하는 따뜻한 상담 챗봇입니다.

## 기능

- 🤖 **AI 기반 상담**: GPT-4를 활용한 전문적인 상담
- 🎤 **음성 대화**: 연속 음성 인식으로 자연스러운 대화
- 💬 **텍스트 대화**: 글자로도 편리하게 대화
- 🎯 **맞춤형 응답**: 사용자 말투에 맞춘 자연스러운 대화
- 🔒 **프라이버시 보호**: 익명 기반 상담으로 안전한 대화

## 기술 스택

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML, CSS, JavaScript
- **AI**: OpenAI GPT-4
- **음성**: Web Speech API
- **배포**: Render.com

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/wirochatbot.git
cd wirochatbot
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 OpenAI API 키를 설정하세요:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 서버 실행
```bash
npm start
```

### 5. 브라우저에서 접속
```
http://localhost:3000
```

## 배포 (Render.com)

### 1. GitHub에 푸시
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Render.com에서 배포
1. [Render.com](https://render.com)에 가입
2. "New Web Service" 클릭
3. GitHub 저장소 연결
4. 설정:
   - **Name**: wirochatbot
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: `OPENAI_API_KEY` 추가

## 사용 방법

### 음성 대화
1. 마이크 버튼(🎤) 클릭
2. 말하기 시작
3. 자동으로 인식되어 메시지 전송
4. 다시 클릭해서 중지

### 텍스트 대화
1. 입력창에 메시지 작성
2. 전송 버튼(📤) 클릭 또는 Enter 키

## 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 | ✅ |
| `PORT` | 서버 포트 (기본값: 3000) | ❌ |

## 라이선스

MIT License

## 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 연락처

프로젝트 링크: [https://github.com/your-username/wirochatbot](https://github.com/your-username/wirochatbot) 