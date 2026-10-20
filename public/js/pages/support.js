import { CheckData } from '../core/store.js';
import { UI, restartBtnHtml } from '../core/ui.js';

export function renderSupport(view, header) {
    header.innerHTML = `
        <div class="flex items-center gap-3 ml-2 pointer-events-auto truncate">
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden p-0.5 border border-gray-100 dark:border-gray-700 shrink-0">
                <img src="logo.jpeg" alt="logo" class="w-full h-full object-contain">
            </div>
            <h2 class="text-lg font-bold dark:text-white leading-tight truncate">เช็คราคาอะไหล่</h2>
        </div>
        ${restartBtnHtml}
    `;

    view.innerHTML = `
        <div class="px-6 pt-24 pb-24 h-full flex flex-col relative">
            
            <div class="mb-6">
                <label class="text-xs font-bold text-gray-500 mb-2 block ml-1">ค้นหาอาการอื่นๆ</label>
                <div class="flex gap-2">
                    <input type="text" id="custom-issue-input" placeholder="พิมพ์อาการเสีย..." class="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-brand-primary dark:text-white shadow-sm px-3 py-2">
                    <button onclick="window.UI.handleSupportSearch(document.getElementById('custom-issue-input').value, false)" class="bg-brand-primary text-white px-4 rounded-xl font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform flex items-center justify-center">
                        <span class="material-symbols-rounded">search</span>
                    </button>
                </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                <h3 class="font-bold mb-3 dark:text-white text-brand-primary">เช็คราคาอะไหล่กลาง</h3>
                <div class="grid grid-cols-3 gap-3">
                     ${CheckData.parts.map(p => `
                        <button onclick="window.UI.handleSupportSearch('ราคา ${p.name}', true)" class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-[10px] font-bold text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-colors flex flex-col items-center gap-1 active:scale-95">
                            <span class="material-symbols-rounded text-xl">${p.icon}</span>${p.name}
                        </button>
                     `).join('')}
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                <h3 class="font-bold mb-3 dark:text-white">ค้นหาวิธีแก้ไขเบื้องต้น</h3>
                <div class="grid grid-cols-2 gap-3">
                     ${CheckData.issues.map(i => `
                        <button onclick="window.UI.handleSupportSearch('${i.name}', false)" class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-primary hover:text-white transition-colors flex flex-col items-center gap-1 active:scale-95">
                            <span class="material-symbols-rounded text-2xl">${i.icon}</span>${i.name}
                        </button>
                     `).join('')}
                </div>
            </div>
        </div>`; 
}
