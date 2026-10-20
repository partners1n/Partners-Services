/**
 * Universal Chat Logic
 * Works with both Standard UI (index.html) and Neon UI (chat.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements Selection (IDs must match in HTML) ---
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const typingIndicator = document.getElementById("typing-indicator");

    // --- Bot Avatar ---
    const BOT_AVATAR_URL = "https://gufix.online/logo.jpeg";

    // --- Chat State ---
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

    // --- 2. Input Handling ---

    if (userInput) {
        userInput.addEventListener("input", function () {
            if (this.tagName.toLowerCase() === 'textarea') {
                this.style.height = "auto";
                this.style.height = (this.scrollHeight < 44 ? 44 : Math.min(this.scrollHeight, 120)) + "px";
            }
            const inputWrapper = document.getElementById('inputWrapper');
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

    // --- 3. Core Messaging Function ---

    async function sendMessage() {
        if (!userInput) return;
        const message = userInput.value.trim();

        if (message === "" || isProcessing) return;

        isProcessing = true;

        userInput.value = "";
        if (userInput.tagName.toLowerCase() === 'textarea') userInput.style.height = "auto";
        userInput.focus();

        const inputWrapper = document.getElementById('inputWrapper');
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
            if (sendButton) sendButton.disabled = false;
            userInput.focus();
        }
    }

    // --- 4. Silent Messaging (ใช้กับ OCR และ talk.html) ---

    async function sendSilentMessage(text, promptPrefix = "") {
        if (!text || !text.trim() || isProcessing) return;

        isProcessing = true;

        const fullPrompt = promptPrefix ? promptPrefix + "\n\n" + text : text;

        chatHistory.push({ role: "user", content: fullPrompt });

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

    // --- 5. Helper Functions ---

    function createMessageElement(role, content) {
        const div = document.createElement("div");
        const isUser = role === "user";

        div.className = `message ${isUser ? 'user-message' : 'bot-message assistant-message'}`;

        const avatarHTML = isUser
            ? ''
            : `<div class="avatar"><img src="${BOT_AVATAR_URL}" alt="bot"/></div>`;

        div.innerHTML = `
            ${avatarHTML}
            <div class="message-bubble">${formatText(content)}</div>
        `;
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

    // --- 6. Helper: ปิด Popup Container ---
    function closePopupIfOpen() {
        const popupOverlay = document.getElementById('popupOverlay');
        const popupContainer = document.getElementById('popupContainer');

        if (!popupOverlay || popupOverlay.style.display !== 'flex') return;

        const closeBtn = document.getElementById('popupClose');
        if (closeBtn) {
            closeBtn.click();
            return;
        }

        if (popupContainer) popupContainer.classList.remove('active');
        popupOverlay.classList.remove('show');
        setTimeout(() => {
            popupOverlay.style.display = 'none';
            const iframe = document.getElementById('popupContent');
            if (iframe) iframe.src = 'about:blank';
        }, 400);
    }

    // --- 7. Helper: ประมวลผล pending message ---
    function processPendingMessage() {
        try {
            const pending = localStorage.getItem('friday_pending_message');
            if (!pending) return false;

            const payload = JSON.parse(pending);
            localStorage.removeItem('friday_pending_message');

            // ตรวจอายุ (ภายใน 5 นาที)
            const age = Date.now() - (payload.timestamp || 0);
            if (age > 5 * 60 * 1000) {
                console.warn('Pending message is too old, skipped');
                return false;
            }

            // ปิด popup ถ้าเปิดอยู่
            closePopupIfOpen();

            // หน่วงนิดนึงให้ popup animation เริ่มก่อน AI ตอบ
            setTimeout(() => {
                if (payload.message && typeof window.FridayChat?.sendSilentMessage === 'function') {
                    window.FridayChat.sendSilentMessage(payload.message);
                }
            }, 400);

            return true;
        } catch (e) {
            console.error('Pending message error:', e);
            localStorage.removeItem('friday_pending_message');
            return false;
        }
    }

    // --- 8. Public API ---
    window.FridayChat = {
        sendSilentMessage,
        sendMessage,
        closePopupIfOpen,
        processPendingMessage
    };

    // --- 9. Listener: รับ postMessage จาก talk.html (เปิดใน iframe) ---
    window.addEventListener('message', (e) => {
        // ความปลอดภัย: รับเฉพาะ same origin
        if (e.origin !== window.location.origin) return;
        if (!e.data || e.data.type !== 'friday-pending-message') return;

        // หน่วงเล็กน้อยให้ talk.html แสดง success UI ก่อน
        setTimeout(() => {
            processPendingMessage();
        }, 600);
    });

    // --- 10. Fallback: ตรวจ pending message ตอนโหลดหน้า (กรณีเปิด /chat ตรงๆ) ---
    setTimeout(() => {
        processPendingMessage();
    }, 800);
});
