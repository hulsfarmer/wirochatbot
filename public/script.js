// Socket.IO 연결
const socket = io();

// DOM 요소들
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const voiceButton = document.getElementById('voiceButton');
const voiceStatus = document.getElementById('voiceStatus');
const typingIndicator = document.getElementById('typingIndicator');

// 음성 인식 관련 변수들
let recognition = null;
let isRecording = false;
let userId = generateUserId();

// 사용자 ID 생성
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// 음성 인식 초기화
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true; // 연속 음성 인식 활성화
        recognition.interimResults = true; // 중간 결과도 받기
        recognition.lang = 'ko-KR';

        recognition.onstart = () => {
            isRecording = true;
            voiceButton.classList.add('recording');
            voiceStatus.style.display = 'flex';
            messageInput.placeholder = '음성 인식 중... 계속 말씀해주세요!';
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // 최종 결과가 있으면 메시지 전송
            if (finalTranscript.trim()) {
                messageInput.value = finalTranscript;
                sendMessage();
                
                // 음성 인식 재시작 (연속 대화)
                setTimeout(() => {
                    if (isRecording) {
                        recognition.start();
                    }
                }, 100);
            }
        };

        recognition.onerror = (event) => {
            console.error('음성 인식 오류:', event.error);
            if (event.error !== 'no-speech') {
                showError('음성 인식 오류가 발생했습니다. 다시 시도해주세요.');
            }
        };

        recognition.onend = () => {
            // 음성 인식이 끝나면 자동으로 재시작 (연속 대화)
            if (isRecording) {
                setTimeout(() => {
                    recognition.start();
                }, 100);
            } else {
                voiceButton.classList.remove('recording');
                voiceStatus.style.display = 'none';
                messageInput.placeholder = '메시지를 입력하세요...';
            }
        };
    } else {
        voiceButton.style.display = 'none';
        console.log('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
}

// 메시지 전송
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // 사용자 메시지 표시
    addMessage(message, 'user');
    messageInput.value = '';
    
    // 입력 필드 높이 조정
    adjustTextareaHeight();
    
    // 타이핑 표시기 표시
    showTypingIndicator();

    // 서버로 메시지 전송
    socket.emit('chat message', {
        message: message,
        userId: userId
    });
}

// 음성 메시지 전송
function sendVoiceMessage(audioData) {
    showTypingIndicator();
    
    socket.emit('voice message', {
        audioData: audioData,
        userId: userId
    });
}

// 메시지 추가
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    const icon = document.createElement('i');
    if (sender === 'user') {
        icon.className = 'fas fa-user';
    } else {
        icon.className = 'fas fa-user-tie';
    }
    
    avatar.appendChild(icon);
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    messageContent.appendChild(paragraph);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// 에러 메시지 표시
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    chatMessages.appendChild(errorDiv);
    scrollToBottom();
    
    // 5초 후 에러 메시지 제거
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// 타이핑 표시기 표시/숨김
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// 스크롤을 맨 아래로
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 텍스트 영역 높이 자동 조정
function adjustTextareaHeight() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
}

// 이벤트 리스너들
messageInput.addEventListener('input', adjustTextareaHeight);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

voiceButton.addEventListener('click', () => {
    if (!recognition) {
        showError('음성 인식을 사용할 수 없습니다.');
        return;
    }
    
    if (isRecording) {
        // 음성 인식 중지
        isRecording = false;
        recognition.stop();
        voiceButton.classList.remove('recording');
        voiceStatus.style.display = 'none';
        messageInput.placeholder = '메시지를 입력하세요...';
    } else {
        // 음성 인식 시작
        isRecording = true;
        recognition.start();
    }
});

// Socket.IO 이벤트 리스너들
socket.on('connect', () => {
    console.log('서버에 연결되었습니다.');
});

socket.on('bot response', (data) => {
    hideTypingIndicator();
    addMessage(data.message, 'bot');
});

socket.on('error', (data) => {
    hideTypingIndicator();
    showError(data.message);
});

socket.on('disconnect', () => {
    console.log('서버와의 연결이 끊어졌습니다.');
    showError('서버와의 연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();
    messageInput.focus();
    
    // 입력 필드 높이 초기화
    adjustTextareaHeight();
});

// 페이지 가시성 변경 시 포커스 복원
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        messageInput.focus();
    }
});

// 음성 인식 권한 요청
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    // 사용자 상호작용 후 권한 요청
    document.addEventListener('click', () => {
        if (recognition && !isRecording) {
            // 권한 요청을 위한 더미 호출
            try {
                recognition.start();
                recognition.stop();
            } catch (e) {
                console.log('음성 인식 권한 요청 완료');
            }
        }
    }, { once: true });
} 