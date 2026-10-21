import { UI, restartBtnHtml } from '../core/ui.js';

export function renderSupport(view, header, Router) {
    // ปรับ Header ให้แสดงผลแบบเดียวกันกับหน้า home
    header.innerHTML = `
        <div class="flex items-center gap-3 pointer-events-auto">
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden p-0.5 border border-gray-100 dark:border-gray-700">
                <img src="logo.jpeg" alt="logo" class="w-full h-full object-contain">
            </div>
            <div>
                <p class="text-[10px] text-gray-400 uppercase font-bold">iFix <span style="color: OrangeRed;">Partners</span></p>
                <p class="font-bold dark:text-white text-sm">บริการซ่อมมือถือ</p>
            </div>
        </div>
        ${restartBtnHtml}
    `;

    view.innerHTML = `
    <style>
        /* CSS สำหรับ Popup Panel ที่สไลด์ขึ้นมาจากขอบล่าง */
        .popup-overlay-partners {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
            z-index: 2000; display: none; align-items: flex-end; opacity: 0; transition: opacity 0.3s ease;
        }
        .popup-overlay-partners.show { opacity: 1; }
        .popup-container-partners {
            width: 100%; height: 90dvh; background: #ffffff; border-radius: 24px 24px 0 0;
            transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            display: flex; flex-direction: column; overflow: hidden; border-top: 1px solid rgba(8, 145, 178, 0.2);
            box-shadow: 0 -10px 50px rgba(0,0,0,0.15);
        }
        .popup-container-partners.active { transform: translateY(0); }
        .popup-header-partners { 
            padding: 8px 16px; background: rgba(255, 255, 255, 0.92);
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(0,0,0,0.06); min-height: 42px;
        }
        .popup-title-partners { font-weight: 700; color: #0891b2; letter-spacing: 1px; font-size: 0.9rem; font-family: 'Rajdhani', sans-serif; }
        .popup-close-partners {
            background: rgba(0,0,0,0.06); border: none; color: #1a1a2e; 
            width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.2s; 
            display: flex; align-items: center; justify-content: center; font-size: 0.9rem;
        }
        .popup-close-partners:hover { background: #7c3aed; color: #fff; }
    </style>

    <div class="px-6 pt-24 pb-28 h-full flex flex-col relative overflow-y-auto">
        
        <!-- เมนูลัด 4 ปุ่มหลัก (สร้างเอกสาร / ซ่อมมือถือ / คำนวน / ฐานข้อมูล) -->
        <div class="grid grid-cols-2 gap-4 my-auto">
            <button class="partner-btn-item flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-brand-primary transition-all active:scale-95" data-url="https://support-ai.chatbot-partners.workers.dev/slip" data-name="สร้างเอกสาร">
                <span class="material-symbols-rounded text-4xl text-brand-primary mb-2">folder_open</span>
                <span class="text-sm font-bold dark:text-white">สร้างเอกสาร</span>
            </button>
            <button class="partner-btn-item flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-brand-primary transition-all active:scale-95" data-url="https://services.chatbot-partners.workers.dev/chat" data-name="หาวิธีซ่อมมือถือเบื้องต้น">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-2">chat</span>
                <span class="text-sm font-bold dark:text-white">พูดคุย</span>
            </button>
            <button class="partner-btn-item flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-brand-primary transition-all active:scale-95" data-url="https://support-ai.chatbot-partners.workers.dev/iphone16" data-name="ตัวอย่างiPhone 16">
                <span class="material-symbols-rounded text-4xl text-purple-500 mb-2">calculate</span>
                <span class="text-sm font-bold dark:text-white">โมเดล iphone 16</span>
            </button>
            <button class="partner-btn-item flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-brand-primary transition-all active:scale-95" data-url="https://support-ai.chatbot-partners.workers.dev/apple" data-name="สร้างใบเสร็จข้อมูล">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-2">database</span>
                <span class="text-sm font-bold dark:text-white">สร้างใบเสร็จ</span>
            </button>
        </div>

    </div>

    <!-- Popup Modal สำหรับแสดงผลหน้าเว็บลิงก์เมื่อกดปุ่มเมนูลัด (สไลด์ขึ้นจากขอบล่าง) -->
    <div class="popup-overlay-partners" id="popupOverlay">
        <div class="popup-container-partners" id="popupContainer">
            <div class="popup-header-partners">
                <span class="popup-title-partners" id="popupTitle">BROWSER LINK</span>
                <button class="popup-close-partners" id="popupClose">
                    <span class="material-symbols-rounded text-sm">close</span>
                </button>
            </div>
            <iframe id="popupContent" class="flex-1 w-full border-none bg-white dark:bg-gray-900" src="about:blank"></iframe>
        </div>
    </div>
    `; 

    // ผูกตรรกะการเปิด/ปิด Popup Panel เมื่อคลิกปุ่มเมนูลัด 4 ปุ่ม
    setTimeout(() => {
        const popupOverlay = document.getElementById('popupOverlay');
        const popupContainer = document.getElementById('popupContainer');
        const popupTitle = document.getElementById('popupTitle');
        const popupContent = document.getElementById('popupContent');
        const popupClose = document.getElementById('popupClose');

        if (!popupOverlay) return;

        document.querySelectorAll('.partner-btn-item').forEach(btn => {
            btn.addEventListener('click', () => {
                popupTitle.textContent = btn.dataset.name;
                popupContent.src = btn.dataset.url;
                
                popupOverlay.style.display = 'flex';
                setTimeout(() => {
                    popupOverlay.classList.add('show');
                    popupContainer.classList.add('active');
                }, 10);
            });
        });

        const closePopup = () => {
            popupContainer.classList.remove('active');
            popupOverlay.classList.remove('show');
            setTimeout(() => { 
                popupOverlay.style.display = 'none'; 
                popupContent.src = 'about:blank'; 
            }, 400);
        };

        if (popupClose) popupClose.addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', (e) => { 
            if (e.target === popupOverlay) closePopup(); 
        });
    }, 100);
}
