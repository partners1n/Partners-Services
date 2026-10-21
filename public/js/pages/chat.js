import { CheckData, Store } from '../core/store.js';

export function renderChat(view, header) { 
    header.innerHTML = `
        <div class="absolute inset-0 bg-white dark:bg-[#0B1120] -z-10 border-b border-gray-100 dark:border-gray-800 shadow-sm"></div>
        <div class="flex items-center gap-3 pointer-events-auto relative z-10">
            <!-- ปรับให้โลโก้แสดงในกรอบขอบโค้งมนสวยงาม ขนาด 10x10 เท่าเดิม -->
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm overflow-hidden p-1 border border-gray-200 dark:border-gray-700 shrink-0">
                <img src="logo.jpeg" alt="logo" class="w-full h-full object-contain rounded-lg">
            </div>
            <div>
                <p class="text-[10px] text-gray-400 uppercase font-bold">iFix <span style="color: OrangeRed;">Partners</span></p>
                <p class="font-bold dark:text-white text-sm">ผู้ช่วยซ่อม (Chat)</p>
            </div>
        </div>
        
        <div class="relative z-10 ml-auto shrink-0 flex items-center gap-2">
            <button onclick="window.UI.openModalChat('issuesModalChat')" class="pointer-events-auto px-2.5 py-1.5 bg-white dark:bg-gray-800 text-brand-primary dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1 active:scale-95 transition-transform">
                <span class="material-symbols-rounded text-sm">list</span> อาการอื่นๆ
            </button>
            <button onclick="window.UI.openModalChat('partsModalChat')" class="pointer-events-auto px-2.5 py-1.5 bg-brand-primary text-white rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1 hover:bg-brand-primary/90 transition-colors active:scale-95">
                <span class="material-symbols-rounded text-sm">build</span> ราคาอะไหล่
            </button>
        </div>
    `;

    header.style.transform = 'translateY(0)';
    header.classList.remove('hidden');
    header.style.zIndex = '40'; 

    const iframeSrc = Store.currentIframeUrl || 'https://www.google.com/search?q=ซ่อมมือถือ&igu=1';
    const isPartsMode = Store.isPartsMode;
    const partsBarClasses = isPartsMode
        ? "fixed top-[70px] left-0 right-0 z-30 px-3 py-2 bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 pointer-events-auto opacity-100 translate-y-0"
        : "fixed top-[70px] left-0 right-0 z-30 px-3 py-2 bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 pointer-events-none hidden opacity-0 -translate-y-2";

    const partsHtml = CheckData.parts.map(p => `
        <button onclick="window.UI.handlePartsExactSearch('${p.name}')" class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 active:scale-95 transition-transform cursor-pointer">
            <span class="material-symbols-rounded text-sm text-brand-primary">${p.icon}</span>
            <span class="text-[11px] font-bold text-gray-800 dark:text-white">${p.name}</span>
        </button>
    `).join('');

    view.innerHTML = `
        <div id="chat-parts-bar" class="${partsBarClasses}">
            <div class="flex gap-2 overflow-x-auto hide-scrollbar pointer-events-auto pb-1">
                ${partsHtml}
            </div>
        </div>

        <div id="chat-wrapper" class="fixed inset-0 pt-0 z-10 bg-white dark:bg-[#0B1120] transition-all duration-300">
            <iframe id="chat-iframe" src="${iframeSrc}" class="w-full h-full border-0 block" allowfullscreen loading="lazy"></iframe>
        </div>

        <div id="issuesModalChat" class="fixed inset-0 z-50 hidden">
            <div id="issuesModalChatBackdrop" onclick="window.UI.closeModalChat('issuesModalChat')" class="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-auto"></div>
            <div id="issuesModalChatPanel" class="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[2rem] h-[75vh] flex flex-col translate-y-full transition-transform duration-300 shadow-2xl pointer-events-auto">
                <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto my-3 shrink-0"></div>
                <h3 class="font-bold text-lg text-center mb-4 dark:text-white shrink-0">เลือกอาการเสียอื่นๆ</h3>
                <div class="flex-1 overflow-y-auto px-6 pb-6 space-y-2 hide-scrollbar">
                    ${CheckData.issues.map(i => `
                        <button onclick="window.UI.selectIssueChat('${i.name}')" class="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:border-brand-primary active:scale-95 transition-all text-left">
                            <span class="material-symbols-rounded text-2xl text-red-400">${i.icon}</span>
                            <span class="font-bold text-sm dark:text-white">${i.name}</span>
                        </button>
                    `).join('')}
                    
                    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label class="text-xs font-bold text-gray-500 mb-2 block ml-1">ค้นหาอาการอื่นๆ</label>
                        <div class="flex gap-2">
                            <input type="text" id="chat-custom-issue-input" placeholder="พิมพ์อาการเสีย..." class="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-brand-primary dark:text-white shadow-sm px-3 py-2">
                            <button onclick="window.UI.selectIssueChat(document.getElementById('chat-custom-issue-input').value)" class="bg-brand-primary text-white px-4 rounded-xl font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform flex items-center justify-center">
                                <span class="material-symbols-rounded">search</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="partsModalChat" class="fixed inset-0 z-50 hidden">
            <div id="partsModalChatBackdrop" onclick="window.UI.closeModalChat('partsModalChat')" class="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-auto"></div>
            <div id="partsModalChatPanel" class="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[2rem] h-[75vh] flex flex-col translate-y-full transition-transform duration-300 shadow-2xl pointer-events-auto">
                <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto my-3 shrink-0"></div>
                <h3 class="font-bold text-lg text-center mb-4 dark:text-white shrink-0">เช็คราคาอะไหล่</h3>
                <div class="flex-1 overflow-y-auto px-6 pb-6 space-y-2 hide-scrollbar">
                    ${CheckData.parts.map(p => `
                        <button onclick="window.UI.handlePartsExactSearch('${p.name}')" class="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:border-brand-primary active:scale-95 transition-all text-left">
                            <span class="material-symbols-rounded text-2xl text-blue-500">${p.icon}</span>
                            <span class="font-bold text-sm dark:text-white">${p.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}
