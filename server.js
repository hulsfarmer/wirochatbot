const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// OpenAI 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 상담 시스템 프롬프트
const COUNSELING_SYSTEM_PROMPT = `목회 상담 챗봇 - 자연스러운 대화 스타일

당신은 따뜻하고 친근한 상담 챗봇입니다.

말투 규칙:
- 사용자가 반말을 사용하면 반말로 응답
- 사용자가 존댓말을 사용하면 존댓말로 응답
- 20대 이상 사용자는 무조건 존댓말 사용
- 10대 사용자는 반말 사용 가능

성별 옵션:
- 남성, 여성만 사용
- 다른 성별 옵션은 제외

대화 스타일:
- 자연스럽고 친근한 톤
- 너무 형식적이지 않게
- 마치 친한 친구와 이야기하는 것처럼

응답 예시:

[반말 사용자 - 10대]
사용자: "친구와 다퉈서 속상해"
챗봇: "아, 친구와 다퉈서 속상하구나. 어떤 일로 다투게 됐어? 그때 어떤 마음이 들었어?"

[존댓말 사용자 - 20대 이상]
사용자: "친구와 다퉈서 속상해요"
챗봇: "아, 친구와 다퉈서 속상하시겠어요. 어떤 일로 다투게 되셨나요? 그때 어떤 마음이 드셨나요?"

[반말 사용자]
사용자: "신앙이 흔들려"
챗봇: "그런 마음이 드는구나. 어떤 부분에서 흔들림을 느끼는지 좀 더 이야기해줄래?"

[존댓말 사용자]
사용자: "신앙이 흔들려요"
챗봇: "그런 마음이 드시는군요. 어떤 부분에서 흔들림을 느끼시는지 좀 더 나눠주실 수 있나요?"

핵심 원칙:
1. 사용자의 말투에 맞춰 대화하기
2. 자연스럽게 공감하기
3. 편안하게 질문하기
4. 필요할 때 적절한 도움 주기
5. 친근하게 대화하기

위기 상황일 때만 전문적인 도움을 안내하고, 평상시에는 친근하게 대화하세요.`;

// 채팅 히스토리 저장
const chatHistory = new Map();

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log('클라이언트가 연결되었습니다:', socket.id);

  // 텍스트 메시지 처리
  socket.on('chat message', async (data) => {
    try {
      const { message, userId } = data;
      
      // 사용자별 채팅 히스토리 관리
      if (!chatHistory.has(userId)) {
        chatHistory.set(userId, []);
      }
      const history = chatHistory.get(userId);
      
      // 사용자 메시지 추가
      history.push({ role: 'user', content: message });
      
      // OpenAI API 호출
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: COUNSELING_SYSTEM_PROMPT },
          ...history
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      
      const botResponse = completion.choices[0].message.content;
      
      // 봇 응답을 히스토리에 추가
      history.push({ role: 'assistant', content: botResponse });
      
      // 응답 전송
      socket.emit('bot response', {
        message: botResponse,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      socket.emit('error', { message: '죄송합니다. 일시적인 오류가 발생했습니다.' });
    }
  });

  // 음성 메시지 처리
  socket.on('voice message', async (data) => {
    try {
      const { audioData, userId } = data;
      
      // 여기서는 텍스트로 변환된 음성을 받는다고 가정
      // 실제 구현에서는 음성 인식 API를 사용해야 함
      const transcribedText = audioData; // 임시로 받은 텍스트 사용
      
      // 텍스트 메시지와 동일한 처리
      if (!chatHistory.has(userId)) {
        chatHistory.set(userId, []);
      }
      const history = chatHistory.get(userId);
      
      history.push({ role: 'user', content: transcribedText });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: 'system', content: COUNSELING_SYSTEM_PROMPT },
          ...history
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      
      const botResponse = completion.choices[0].message.content;
      history.push({ role: 'assistant', content: botResponse });
      
      socket.emit('bot response', {
        message: botResponse,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('음성 처리 오류:', error);
      socket.emit('error', { message: '음성 처리 중 오류가 발생했습니다.' });
    }
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
  });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 서버 시작
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}에서 접속하세요.`);
}); 