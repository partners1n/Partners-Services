import { UI, restartBtnHtml } from '../core/ui.js';

export function renderProfile(view, header) { 
    UI.currentImgIndex = 0;

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
    // ดึงข้อมูลที่บันทึกไว้จาก localStorage (สมมติว่าใช้ Key ชื่อ 'gufix_saved_records' หรือปรับเปลี่ยนตามต้องการ)
    let savedRecords = [];
    try {
        savedRecords = JSON.parse(localStorage.getItem('gufix_saved_records')) || [];
    } catch (e) {
        savedRecords = [];
    }

    // สร้าง HTML สำหรับแสดงรายการที่บันทึกไว้
    let contentHtml = '';
    if (savedRecords.length === 0) {
        contentHtml = `
            <div class="flex flex-col items-center justify-center py-20 text-center px-4">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
                    <span class="material-symbols-rounded text-3xl">history_toggle_off</span>
                </div>
                <p class="font-bold text-gray-700 dark:text-gray-300 text-base">ยังไม่มีประวัติการบันทึก</p>
                <p class="text-xs text-gray-400 mt-1 max-w-[240px]">รายการที่คุณตรวจสอบหรือบันทึกจากหน้าเช็คอาการจะแสดงขึ้นที่นี่</p>
            </div>
        `;
    } else {
        contentHtml = `
            <div class="space-y-3 mb-6">
                ${savedRecords.map((item, index) => `
                    <div class="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between gap-3">
                        <div class="space-y-1">
                            <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">รายการที่ #${index + 1}</span>
                            <h4 class="font-bold text-sm text-gray-900 dark:text-white mt-1">${item.title || item.name || 'ไม่ระบุชื่อรายการ'}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400">${item.detail || item.date || ''}</p>
                        </div>
                        <button onclick="window.UI.deleteSavedRecord(${index})" class="text-gray-400 hover:text-red-500 transition-colors p-1">
                            <span class="material-symbols-rounded text-lg">delete</span>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="text-center pb-6">
                <button onclick="window.UI.clearSavedRecords()" class="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    ล้างประวัติทั้งหมด
                </button>
            </div>
        `;
    }

    view.innerHTML = `
        <div class="px-6 pt-6 pb-28 h-full overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-lg text-gray-900 dark:text-white"></h3>
                <span class="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">${savedRecords.length} รายการ</span>
            </div>
            ${contentHtml}
        </div>
    `;

    // ผูกฟังก์ชันเสริมเข้ากับ window.UI เพื่อให้ปุ่มลบทำงานได้ (หากยังไม่มีใน core/ui.js)
    if (window.UI) {
        window.UI.deleteSavedRecord = (index) => {
            let records = JSON.parse(localStorage.getItem('gufix_saved_records')) || [];
            records.splice(index, 1);
            localStorage.setItem('gufix_saved_records', JSON.stringify(records));
            renderProfile(view, header); // เรนเดอร์หน้าใหม่
        };
        window.UI.clearSavedRecords = () => {
            if (confirm('คุณต้องการล้างประวัติทั้งหมดใช่หรือไม่?')) {
                localStorage.removeItem('gufix_saved_records');
                renderProfile(view, header); // เรนเดอร์หน้าใหม่
            }
        };
    }
}
