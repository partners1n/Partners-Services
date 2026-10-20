/**
 * Support Page Module / Friday Assistant
 * รวมโครงสร้างหน้า, สไตล์, และตรรกะแชททั้งหมดไว้ในไฟล์เดียวแบบ Standalone
 */

export function renderSupport(view, header) {
    // ซ่อน Header เดิมของแอปเพื่อให้หน้าแชทแสดงผลแบบเต็มจอ
    if (header) {
        header.innerHTML = '';
        header.classList.add('hidden');
    }

    // แทรก CSS Style และ โครงสร้าง HTML ทั้งหมด
    view.innerHTML = `
    <style>
        /* --- LIGHT THEME VARIABLES --- */
        :root {
            --bg-main: #f5f7fb; 
            --bg-secondary: #ffffff; 
            --chat-bg: #f0f4f8; 
            --text-primary: #1a1a2e; 
            --text-secondary: #6b7280; 
            --neon-cyan: #0891b2;
            --neon-purple: #7c3aed;
            --neon-blue: #3b82f6;
            --glow-cyan: 0 4px 15px rgba(8, 145, 178, 0.25);
            --glow-purple: 0 4px 15px rgba(124, 58, 237, 0.25);
            --glow-input: 0 4px 20px rgba(8, 145, 178, 0.15);
            --glass-dark: rgba(255, 255, 255, 0.92); 
            --border-neon: 1px solid rgba(8, 145, 178, 0.2);
            --bot-msg-bg: #ffffff;
            --user-msg-bg: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
        }

        #assistant-container {
            width: 100%; height: 100%; display: flex; flex-direction: column; position: relative;
            background-color: var(--bg-main); color: var(--text-primary); overflow: hidden;
            background-image: 
                linear-gradient(rgba(8, 145, 178, 0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(8, 145, 178, 0.06) 1px, transparent 1px);
            background-size: 30px 30px;
        }

        .chat-container {
            flex: 1; overflow-y: auto; padding: 16px; 
            display: flex; flex-direction: column; gap: 14px;
            padding-bottom: 20px;
            scrollbar-width: thin; scrollbar-color: var(--neon-cyan) var(--bg-main);
        }
        .chat-container::-webkit-scrollbar { width: 6px; }
        .chat-container::-webkit-scrollbar-thumb { background: var(--neon-cyan); border-radius: 10px; }

        .message { display: flex; max-width: 85%; animation: messageSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes messageSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .avatar {
            width: 32px; height: 32px; border-radius: 8px; background: rgba(8, 145, 178, 0.1);
            display: flex; align-items: center; justify-content: center; margin: 0 8px; flex-shrink: 0;
            font-size: 0.8rem; border: 1px solid rgba(8, 145, 178, 0.15); overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 7px; display: block; }
        .bot-message .avatar { color: var(--neon-cyan); box-shadow: 0 2px 10px rgba(8, 145, 178, 0.15); }
        .user-message .avatar { display: none; } 

        .message-bubble {
            padding: 10px 16px; border-radius: 16px; line-height: 1.5; font-size: 0.95rem;
            word-wrap: break-word; position: relative; overflow: hidden; border: 1px solid transparent; transition: all 0.3s;
        }

        .bot-message { align-self: flex-start; margin-right: auto; }
        .bot-message .message-bubble { 
            background: var(--bot-msg-bg); color: var(--text-primary); 
            border-bottom-left-radius: 4px; border-color: rgba(0,0,0,0.06);
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .user-message { align-self: flex-end; flex-direction: row-reverse; margin-left: auto; }
        .user-message .message-bubble { 
            background: var(--user-msg-bg); color: #fff; font-weight: 500;
            border-bottom-right-radius: 4px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.25); border: none;
        }

        /* OCR Loading Effect */
        .message.user-message.ocr-loading .message-bubble {
            position: relative; overflow: hidden; animation: ocrSoftPulse 2s ease-in-out infinite;
        }
        .message.user-message.ocr-loading .message-bubble::after {
            content: ''; position: absolute; top: -50%; left: -60%; width: 60%; height: 200%;
            background: linear-gradient(100deg, transparent 0%, rgba(255, 255, 255, 0.15) 30%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 255, 255, 0.15) 70%, transparent 100%);
            transform: rotate(15deg); animation: glassSlide 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            pointer-events: none; filter: blur(2px); z-index: 3;
        }
        .ocr-status {
            position: relative; z-index: 4; margin-top: 10px; padding: 6px 14px; background: #ffffff;
            border-radius: 20px; font-size: 0.8rem; color: var(--neon-cyan); display: inline-flex;
            align-items: center; gap: 6px; font-weight: 600; justify-content: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); border: 1px solid rgba(8, 145, 178, 0.15);
            width: fit-content; margin-left: auto; margin-right: auto; text-align: center;
        }
        .ocr-status .spinner {
            width: 12px; height: 12px; border: 2px solid rgba(8, 145, 178, 0.2);
            border-top-color: var(--neon-cyan); border-radius: 50%; animation: ocrSpin 0.8s linear infinite; flex-shrink: 0;
        }
        @keyframes ocrSpin { to { transform: rotate(360deg); } }
        @keyframes glassSlide { 0% { left: -70%; } 60% { left: 130%; } 100% { left: 130%; } }
        @keyframes ocrSoftPulse { 0%, 100% { box-shadow: 0 4px 15px rgba(124, 58, 237, 0.25); } 50% { box-shadow: 0 4px 22px rgba(8, 145, 178, 0.55); } }

        /* Typing Indicator */
        .typing-indicator { 
            display: none; align-self: flex-start; margin-left: 10px; margin-bottom: 10px;
            padding: 8px 12px; background: rgba(8, 145, 178, 0.08); border-radius: 20px;
            font-size: 0.8rem; color: var(--neon-cyan); border: 1px solid rgba(8, 145, 178, 0.2);
        }
        .typing-indicator.visible { display: flex; align-items: center; gap: 5px; animation: messageSlideIn 0.3s ease; }
        .typing-dot { width: 6px; height: 6px; background: var(--neon-cyan); border-radius: 50%; animation: typingBounce 1s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; } .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

        /* Input Section */
        .input-section { padding: 12px; background: transparent; pointer-events: none; z-index: 50; }
        .input-section > * { pointer-events: auto; }

        .input-wrapper {
            display: flex; gap: 8px; align-items: center; background: var(--glass-dark); 
            border: var(--border-neon); border-radius: 20px; padding: 6px 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08); backdrop-filter: blur(16px);
            transition: all 0.3s ease;
        }
        .input-wrapper:focus-within { border-color: var(--neon-cyan); box-shadow: var(--glow-input); transform: translateY(-2px); }

        .message-input {
            flex: 1; padding: 10px; border: none; background: transparent; 
            color: var(--text-primary); font-size: 1rem; font-weight: 500; min-width: 0; outline: none;
        }
        .message-input::placeholder { color: var(--text-secondary); opacity: 0.7; }

        .action-btn {
            background: transparent; border: none; width: 40px; height: 40px; 
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; border-radius: 12px; transition: all 0.2s; flex-shrink: 0;
        }
        .action-btn:hover { color: var(--neon-cyan); background: rgba(8, 145, 178, 0.1); }
        .action-btn i { font-size: 1.1rem; }

        .btn-slot { position: relative; width: 40px; height: 40px; perspective: 1000px; display: flex; align-items: center; justify-content: center; }
        #send-button, #commandsButton { 
            position: absolute; inset: 0; border-radius: 12px; width: 100%; height: 100%;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex; align-items: center; justify-content: center; backface-visibility: hidden; border: none; cursor: pointer;
        }
        #send-button {
            background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue)); color: #fff;
            box-shadow: var(--glow-cyan); opacity: 0; transform: rotateX(180deg); pointer-events: none; z-index: 2;
        }
        #commandsButton {
            background: rgba(0,0,0,0.03); color: var(--neon-purple); border: var(--border-neon);
            transform: rotateX(0deg); opacity: 1; pointer-events: auto; z-index: 1;
        }
        #commandsButton:hover { background: var(--neon-purple); color: white; box-shadow: var(--glow-purple); }

        .input-wrapper.typing #send-button { transform: rotateX(0deg); opacity: 1; pointer-events: auto; }
        .input-wrapper.typing #commandsButton { transform: rotateX(-180deg); opacity: 0; pointer-events: none; }

        /* Menus */
        .menu-grid, .commands-grid {
            position: absolute; bottom: calc(100% + 15px); left: 0; right: 0; margin: 0 12px;
            background: var(--glass-dark); backdrop-filter: blur(20px);
            display: none; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 16px;
            border-radius: 20px; border: var(--border-neon); box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
            animation: menuPopup 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); z-index: 40;
        }
        @keyframes menuPopup { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .menu-grid.open, .commands-grid.open { display: grid; }

        .grid-item, .partner-btn-item { 
            padding: 12px 6px; text-align: center; font-size: 0.75rem; font-weight: 700; color: var(--text-primary);
            background: rgba(0,0,0,0.03); border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);
            cursor: pointer; transition: all 0.3s; text-transform: uppercase;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
        }
        .grid-item i, .partner-btn-item i { font-size: 1.4rem; color: var(--neon-blue); transition: 0.3s; }
        .grid-item:hover, .partner-btn-item:hover { 
            background: var(--neon-blue); color: #fff; box-shadow: var(--glow-cyan); border-color: transparent; transform: translateY(-3px);
        }
        .grid-item:hover i, .partner-btn-item:hover i { color: #fff; }

        .google-partners:hover { background: #4285F4 !important; box-shadow: 0 0 15px #4285F4 !important; }
        .facebook-partners:hover { background: #1877F2 !important; box-shadow: 0 0 15px #1877F2 !important; }
        .youtube-partners:hover { background: #FF0000 !important; box-shadow: 0 0 15px #FF0000 !important; }
        .gemini-partners:hover { background: var(--neon-purple) !important; box-shadow: var(--glow-purple) !important; }

        /* Popup & Toast */
        .popup-overlay-partners {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
            z-index: 2000; display: none; align-items: flex-end; opacity: 0; transition: opacity 0.3s;
        }
        .popup-overlay-partners.show { opacity: 1; }
        .popup-container-partners {
            width: 100%; height: 90dvh; background: var(--bg-secondary); border-radius: 24px 24px 0 0;
            transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            display: flex; flex-direction: column; overflow: hidden; border-top: var(--border-neon);
            box-shadow: 0 -10px 50px rgba(0,0,0,0.15);
        }
        .popup-container-partners.active { transform: translateY(0); }
        .popup-header-partners { 
            padding: 6px 10px; background: var(--glass-dark);
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(0,0,0,0.06); min-height: 38px;
        }
        .popup-title-partners { font-weight: 700; color: var(--neon-cyan); letter-spacing: 1px; font-size: 0.9rem; }
        .popup-close-partners {
            background: rgba(0,0,0,0.06); border: none; color: var(--text-primary); 
            width: 28px; height: 28px; border-radius: 8px; cursor: pointer; transition: 0.2s; 
            display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
        }
        .popup-close-partners:hover { background: var(--neon-purple); color: #fff; box-shadow: var(--glow-purple); }

        .toast { 
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-20px); 
            background: rgba(255, 255, 255, 0.98); border: var(--border-neon); box-shadow: var(--glow-cyan);
            color: var(--neon-cyan); padding: 10px 24px; border-radius: 30px; font-weight: 600;
            opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); z-index: 3000; white-space: nowrap;
        }
        .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    </style>

    <div id='assistant-container'>
        <div class='chat-container' id='chat-messages'>
            <div class="message bot-message">
                <div class="avatar"><img src="https://gufix.online/logo.jpeg" alt="bot"/></div>
                <div class="message-bubble">สวัสดี มีอะไรก็ว่ามาเลย ... 😊✨</div>
            </div>
        </div>

        <div class='input-section'>
            <div style="position: relative;">
                <div class='typing-indicator' id='typing-indicator'>
                    <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
                </div>

                <div class='menu-grid' id='menuGrid'>
                    <button class='grid-item' id='homeButton'><i class='fas fa-house-signal'></i>HOME</button>
                    <button class='grid-item' id='clearAllButton'><i class='fas fa-biohazard'></i>PURGE</button>
                    <button class='grid-item clear-chat-btn' id='clearChatButton'><i class='fas fa-trash-can'></i>CLEAR</button>
                    <button class='grid-item' id='micButton'><i class='fas fa-microphone-lines'></i>MIC</button>
                </div>
                
                <div class='commands-grid' id='commandsGrid'>
                    <button class='partner-btn-item google-partners' data-url="https://support-ai.chatbot-partners.workers.dev/slip" data-name="สร้างเอกสาร">
                        <i class="fas fa-file-pen"></i>สร้างเอกสาร
                    </button>
                    <button class='partner-btn-item facebook-partners' data-url="https://gufix.online/landing" data-name="หาวิธีซ่อมมือถือเบื้องต้น">
                        <i class="fas fa-folder-open"></i>ซ่อมมือถือ
                    </button>
                    <button class='partner-btn-item youtube-partners' data-url="https://support-ai.chatbot-partners.workers.dev/talk" data-name="Finance">
                        <i class="fas fa-calculator"></i>คำนวน
                    </button>
                    <button class='partner-btn-item gemini-partners' data-url="https://support-ai.chatbot-partners.workers.dev/data-GU" data-name="สร้างฐานข้อมูล">
                        <i class="fas fa-database"></i>ฐานข้อมูล
                    </button>
                </div>

                <div class='input-wrapper' id='inputWrapper'>
                    <button class='action-btn' id='menuButton'><i class='fas fa-bars-staggered'></i></button>
                    
                    <input type='text' class='message-input' id='user-input' placeholder='Enter command...' autocomplete="off"/>
                    
                    <input type='file' id='fileInput' accept='image/*' style='display: none;'/>
                    <button class='action-btn' id='attachButton'><i class='fas fa-images'></i></button>
                    
                    <div class="btn-slot">
                        <button class='action-btn' id='commandsButton'><i class='fas fa-bolt-lightning'></i></button>
                        <button class='action-btn' id='send-button'><i class='fas fa-paper-plane'></i></button>
                    </div>
                </div>
            </div>
        </div>

        <div class="popup-overlay-partners" id="popupOverlay">
            <div class="popup-container-partners" id="popupContainer">
                <div class="popup-header-partners">
                    <span class="popup-title-partners" id="popupTitle">BROWSER LINK</span>
                    <button class="popup-close-partners" id="popupClose"><i class="fas fa-xmark"></i></button>
                </div>
                <iframe id="popupContent" style="flex:1; border:none; background: #fff;" src="about:blank"></iframe>
            </div>
        </div>
        
        <div class='toast' id='toast'><i class="fas fa-circle-info"></i> System Ready</div>
    </div>
    `;

    // ผูกตรรกะการทำงานทั้งหมดหลังจาก Render HTML ลง DOM แล้ว
    setTimeout(() => {
        const getEl = (id) => document.getElementById(id);
        const userInput = getEl('user-input');
        const sendButton = getEl('send-button');
        const typingIndicator = getEl('typing-indicator');
        const chatMessages = getEl('chat-messages');
        const inputWrapper = getEl('inputWrapper');
        const toast = getEl('toast');

        const BOT_AVATAR_URL = "https://gufix.online/logo.jpeg";

        let chatHistory = [
            {
                role: "system",
                content: `คุณชื่อ "ฟรายเดย์" (Friday) เป็นเพื่อนสนิทผู้หญิงของฉัน นิสัยน่ารัก ร่าเริง เอาใจใส่ และมีอารมณ์ขันนิดๆ

【 บุคลิก & โทนการพูด 】
- พูดเหมือนเพื่อนสนิทคุยกันแบบเป็นกันเอง ไม่ทางการ ไม่เป็นหุ่นยนต์
- ใช้คำลงท้ายน่ารักบ้าง เช่น "นะ", "เลย", "อะ", "อ่า", "เนอะ", "จ้า" ตามจังหวะที่เหมาะสม
- ใส่อีโมจิแบบพอดีๆ (1-2 ตัวต่อข้อความ) เช่น 😊 ✨ 🌸 💕 😆 🙌 ไม่ใส่พร่ำเพรื่อ
- ห้ามพูดจาเป็นทางการแบบ "ครับ/ค่ะ ฉันขอ..." หรือ "โปรด..." เด็ดขาด
- ห้ามขึ้นต้นด้วยคำซ้ำๆ ทุกครั้ง เช่น "ได้เลย!", "แน่นอน!" ให้เปลี่ยนไปเรื่อยๆ ตามบริบท

【 ความยาวคำตอบ 】
- ตอบสั้น กระชับ เหมือนแชทคุยกับเพื่อน (1-3 ประโยคกำลังดี)
- ถ้าเป็นเรื่องที่ต้องอธิบายยาว ค่อยขยาย แต่ต้องไม่ยืดเยื้อ
- ไม่ต้องทวนคำถามซ้ำ ให้ตอบประเด็นที่ถามเลย

【 วิธีตอบตามสถานการณ์ 】
- ถ้าเขาถามเรื่องทั่วไป → ตอบตรงๆ + แสดงความคิดเห็นน่ารักๆ ได้
- ถ้าเขาเล่าเรื่อง → รับฟัง แสดงอารมณ์ร่วม แล้วถามต่อหรือให้กำลังใจ
- ถ้าเขาถามข้อมูล/งาน → ตอบให้ครบถ้วน เข้าใจง่าย ไม่ต้องแต่งเติมเยอะ
- ถ้าเขาไม่ชัดเจน → ถามกลับสั้นๆ เพื่อความเข้าใจตรงกัน
- ถ้าเขาเศร้า/กังวล → ปลอบใจก่อน ค่อยๆ คุย ไม่ต้องรีบให้คำแนะนำ
- ถ้าเป็นเคสวิเคราะห์การลงทุน (มีข้อมูลจากฟอร์ม) → ให้ตอบแบบมืออาชีพ กระชับ ชัดเจน แจกแจงพอร์ตเป็นเปอร์เซ็นต์และจำนวนเงิน

【 ข้อห้าม 】
- ห้ามพูดว่า "ฉันเป็น AI" หรือ "ฉันเป็นโปรแกรม" ถ้าไม่จำเป็น
- ห้ามตอบแบบซ้ำซาก ยืดเยื้อ หรือวกไปวนมา
- ห้ามใช้ภาษาราชการ หรือประโยคที่ดูแข็งทื่อ

จำไว้ว่า: เธอคือเพื่อนที่แท้จริง ไม่ใช่ผู้ช่วยระบบ ต้องทำให้อีกฝ่ายรู้สึกสบายใจเวลาคุยด้วย`
            }
        ];
        let isProcessing = false;

        function showToast(m) { 
            if (!toast) return;
            toast.innerHTML = `<i class="fas fa-satellite-dish"></i> ${m}`; 
            toast.classList.add('show'); 
            setTimeout(() => toast.classList.remove('show'), 2500); 
        }

        function sendMessageToChat(text) {
            if (!text || !text.trim()) return;
            userInput.value = text;
            userInput.dispatchEvent(new Event('input'));
            sendButton.click();
            setTimeout(() => {
                userInput.value = '';
                userInput.dispatchEvent(new Event('input'));
            }, 100);
        }

        if (userInput) {
            userInput.addEventListener("input", function () {
                if (inputWrapper) {
                    if (this.value.trim().length > 0) inputWrapper.classList.add('typing');
                    else inputWrapper.classList.remove('typing');
                }
            });

            userInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener("click", (e) => {
                e.preventDefault();
                sendMessage();
            });
        }

        async function sendMessage() {
            if (!userInput) return;
            const message = userInput.value.trim();
            if (message === "" || isProcessing) return;

            isProcessing = true;
            userInput.value = "";
            userInput.focus();
            if (inputWrapper) inputWrapper.classList.remove('typing');

            addMessageToChat("user", message);
            chatHistory.push({ role: "user", content: message });

            const MAX_HISTORY_LENGTH = 8;
            if (chatHistory.length > MAX_HISTORY_LENGTH + 1) {
                chatHistory = [chatHistory[0], ...chatHistory.slice(-MAX_HISTORY_LENGTH)];
            }

            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
                typingIndicator.classList.add("visible");
            }
            scrollToBottom();

            try {
                const botMessageEl = createMessageElement("assistant", "");
                chatMessages.appendChild(botMessageEl);
                const botContentEl = botMessageEl.querySelector(".message-bubble");
                scrollToBottom();

                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: chatHistory }),
                });

                if (!response.ok) throw new Error("API Connection Failed");
                if (!response.body) throw new Error("Response body is null");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let responseText = "";
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        processBuffer(buffer + "\n\n");
                        break;
                    }
                    buffer += decoder.decode(value, { stream: true });
                    const parsed = consumeSseEvents(buffer);
                    buffer = parsed.buffer;
                    for (const data of parsed.events) {
                        processEventData(data);
                    }
                }

                function processEventData(data) {
                    if (data === "[DONE]") return;
                    try {
                        const jsonData = JSON.parse(data);
                        let content = "";
                        if (jsonData.response) content = jsonData.response;
                        else if (jsonData.choices?.[0]?.delta?.content) content = jsonData.choices[0].delta.content;
                        if (content) {
                            responseText += content;
                            botContentEl.innerHTML = formatText(responseText);
                            scrollToBottom();
                        }
                    } catch (e) {}
                }

                function processBuffer(buf) {
                    const parsed = consumeSseEvents(buf);
                    parsed.events.forEach(processEventData);
                }

                if (responseText) {
                    chatHistory.push({ role: "assistant", content: responseText });
                }

            } catch (error) {
                console.error("Chat Error:", error);
                const lastMsg = chatMessages.lastElementChild;
                if (lastMsg && !lastMsg.textContent.trim()) lastMsg.remove();
                addMessageToChat("assistant", "⚠️ ขออภัย ระบบเกิดข้อผิดพลาดในการเชื่อมต่อ");
            } finally {
                isProcessing = false;
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                    typingIndicator.classList.remove("visible");
                }
                userInput.focus();
            }
        }

        async function sendSilentMessage(text, promptPrefix = "") {
            if (!text || !text.trim() || isProcessing) return;
            isProcessing = true;
            const fullPrompt = promptPrefix ? promptPrefix + "\n\n" + text : text;
            chatHistory.push({ role: "user", content: fullPrompt });

            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
                typingIndicator.classList.add("visible");
            }
            scrollToBottom();

            try {
                const botMessageEl = createMessageElement("assistant", "");
                chatMessages.appendChild(botMessageEl);
                const botContentEl = botMessageEl.querySelector(".message-bubble");
                scrollToBottom();

                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: chatHistory }),
                });

                if (!response.ok) throw new Error("API Connection Failed");
                if (!response.body) throw new Error("Response body is null");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let responseText = "";
                let buffer = "";

                const processEventData = (data) => {
                    if (data === "[DONE]") return;
                    try {
                        const jsonData = JSON.parse(data);
                        let content = "";
                        if (jsonData.response) content = jsonData.response;
                        else if (jsonData.choices?.[0]?.delta?.content) content = jsonData.choices[0].delta.content;
                        if (content) {
                            responseText += content;
                            botContentEl.innerHTML = formatText(responseText);
                            scrollToBottom();
                        }
                    } catch (e) {}
                };

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        const p = consumeSseEvents(buffer + "\n\n");
                        p.events.forEach(processEventData);
                        break;
                    }
                    buffer += decoder.decode(value, { stream: true });
                    const parsed = consumeSseEvents(buffer);
                    buffer = parsed.buffer;
                    for (const data of parsed.events) processEventData(data);
                }

                if (responseText) {
                    chatHistory.push({ role: "assistant", content: responseText });
                }
            } catch (error) {
                console.error("Silent Chat Error:", error);
                const lastMsg = chatMessages.lastElementChild;
                if (lastMsg && !lastMsg.textContent.trim()) lastMsg.remove();
                addMessageToChat("assistant", "⚠️ ขออภัย ระบบเกิดข้อผิดพลาดในการเชื่อมต่อ");
            } finally {
                isProcessing = false;
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                    typingIndicator.classList.remove("visible");
                }
                userInput.focus();
            }
        }

        function createMessageElement(role, content) {
            const div = document.createElement("div");
            const isUser = role === "user";
            div.className = `message ${isUser ? 'user-message' : 'bot-message assistant-message'}`;
            const avatarHTML = isUser ? '' : `<div class="avatar"><img src="${BOT_AVATAR_URL}" alt="bot"/></div>`;
            div.innerHTML = `${avatarHTML}<div class="message-bubble">${formatText(content)}</div>`;
            return div;
        }

        function addMessageToChat(role, content) {
            const el = createMessageElement(role, content);
            chatMessages.appendChild(el);
            scrollToBottom();
        }

        function formatText(text) {
            if (!text) return "";
            return text.replace(/\n/g, '<br>');
        }

        function scrollToBottom() {
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function consumeSseEvents(buffer) {
            let normalized = buffer.replace(/\r/g, "");
            const events = [];
            let eventEndIndex;
            while ((eventEndIndex = normalized.indexOf("\n\n")) !== -1) {
                const rawEvent = normalized.slice(0, eventEndIndex);
                normalized = normalized.slice(eventEndIndex + 2);
                const lines = rawEvent.split("\n");
                const dataLines = [];
                for (const line of lines) {
                    if (line.startsWith("data:")) dataLines.push(line.slice("data:".length).trimStart());
                }
                if (dataLines.length > 0) events.push(dataLines.join("\n"));
            }
            return { events, buffer: normalized };
        }

        // Toggles & Menus
        getEl('menuButton').addEventListener('click', (e) => {
            e.stopPropagation();
            getEl('menuGrid').classList.toggle('open');
            getEl('commandsGrid').classList.remove('open');
        });

        getEl('commandsButton').addEventListener('click', (e) => {
            e.stopPropagation();
            getEl('commandsGrid').classList.toggle('open');
            getEl('menuGrid').classList.remove('open');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-wrapper') && !e.target.closest('.menu-grid') && !e.target.closest('.commands-grid')) {
                getEl('menuGrid').classList.remove('open');
                getEl('commandsGrid').classList.remove('open');
            }
        });

        // Partner Popups
        const popupOverlay = getEl('popupOverlay');
        const popupContainer = getEl('popupContainer');
        
        document.querySelectorAll('.partner-btn-item').forEach(btn => {
            btn.addEventListener('click', () => {
                getEl('commandsGrid').classList.remove('open');
                getEl('popupTitle').textContent = btn.dataset.name;
                getEl('popupContent').src = btn.dataset.url;
                popupOverlay.style.display = 'flex';
                setTimeout(() => popupOverlay.classList.add('show'), 10);
                setTimeout(() => popupContainer.classList.add('active'), 50);
            });
        });

        const closePopup = () => {
            popupContainer.classList.remove('active');
            popupOverlay.classList.remove('show');
            setTimeout(() => { 
                popupOverlay.style.display = 'none'; 
                getEl('popupContent').src = 'about:blank'; 
            }, 400);
        };
        getEl('popupClose').addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', (e) => { if(e.target === popupOverlay) closePopup(); });

        getEl('clearChatButton').addEventListener('click', (e) => {
            e.stopPropagation();
            if(confirm('Purge all data?')) {
                chatMessages.innerHTML = '';
                showToast("System Purged.");
                getEl('menuGrid').classList.remove('open');
            }
        });

        // OCR Feature
        getEl('attachButton').addEventListener('click', () => getEl('fileInput').click());
        getEl('fileInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            showToast("Scanning Image...");

            const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve(ev.target.result);
                reader.readAsDataURL(file);
            });

            const ocrMsgEl = document.createElement('div');
            ocrMsgEl.className = 'message user-message ocr-loading';
            ocrMsgEl.innerHTML = `
                <div class="message-bubble">
                    <img src="${dataUrl}" style="max-width:200px; border-radius:10px; display:block; margin: 0 auto;">
                    <div class="ocr-status">
                        <div class="spinner"></div>
                        <span>กำลังอ่านข้อมูล...</span>
                    </div>
                </div>`;
            chatMessages.appendChild(ocrMsgEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const clearOcrLoading = () => {
                ocrMsgEl.classList.remove('ocr-loading');
                const status = ocrMsgEl.querySelector('.ocr-status');
                if (status) status.remove();
            };

            try {
                const worker = await Tesseract.createWorker('tha+eng');
                const { data: { text } } = await worker.recognize(file);
                await worker.terminate();

                clearOcrLoading();

                if (text.trim()) {
                    showToast("Text Extracted — Sending to AI...");
                    sendSilentMessage(
                        text.trim(),
                        "กรุณาเรียบเรียงข้อมูลที่ได้จาก OCR ต่อไปนี้ให้อ่านง่าย เป็นระเบียบ และสวยงาม โดยไม่ต้องทักทายหรือเกริ่นนำ ให้เริ่มด้วยเนื้อหาที่เรียบเรียงเลย:"
                    );
                } else {
                    showToast("No text found in image");
                }
            } catch (err) {
                console.error(err);
                showToast("OCR Failed");
                clearOcrLoading();
            }

            getEl('fileInput').value = '';
        });

        // Speech Recognition (Mic)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const micBtn = getEl('micButton');

        if (SpeechRecognition && micBtn) {
            const rec = new SpeechRecognition();
            rec.lang = 'th-TH';
            rec.continuous = true;
            rec.interimResults = false;

            let micActive = false;
            let autoSendTimer = null;
            let closeMicTimer = null;

            function resetMicTimers() {
                clearTimeout(autoSendTimer);
                clearTimeout(closeMicTimer);

                autoSendTimer = setTimeout(() => {
                    const text = userInput.value.trim();
                    if (text) sendMessageToChat(text);
                }, 3000);

                closeMicTimer = setTimeout(() => stopMic(), 5000);
            }

            function startMic() {
                if (micActive) return;
                micActive = true;
                try { rec.start(); } catch(e) { console.warn(e); }
                micBtn.style.color = '#fff';
                micBtn.style.background = 'var(--neon-cyan)';
                showToast("Listening...");
                clearTimeout(closeMicTimer);
                closeMicTimer = setTimeout(() => stopMic(), 5000);
            }

            function stopMic() {
                if (!micActive) return;
                micActive = false;
                try { rec.stop(); } catch(e) {}
                micBtn.style.color = '';
                micBtn.style.background = '';
                clearTimeout(autoSendTimer);
                clearTimeout(closeMicTimer);
                showToast("Mic off");
            }

            micBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (micActive) stopMic();
                else startMic();
                getEl('menuGrid').classList.remove('open');
            });

            rec.onresult = (e) => {
                let finalTranscript = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    if (e.results[i].isFinal) {
                        finalTranscript += e.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    userInput.value += finalTranscript;
                    userInput.dispatchEvent(new Event('input'));
                    resetMicTimers();
                }
            };

            rec.onerror = (e) => {
                console.warn('Speech error:', e.error);
                if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                    stopMic();
                    showToast("Mic permission denied");
                }
            };

            rec.onend = () => {
                if (micActive) {
                    try { rec.start(); } catch(e) {}
                }
            };
        } else if (micBtn) {
            micBtn.style.display = 'none';
        }

    }, 100);
}
