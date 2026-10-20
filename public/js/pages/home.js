import { CheckData, Store } from '../core/store.js';
import { UI, restartBtnHtml } from '../core/ui.js';

export function renderHome(view, header, Router) {
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
    
    let props = Store.data.properties;
    let isFiltered = false;
    const state = Store.checkState;
    
    if (state.brand && state.model && state.issue) {
        isFiltered = true;
        const exactMatches = props.filter(p => p.brand === state.brand && p.model === state.model && p.issue === state.issue);
        props = exactMatches.length > 0 ? exactMatches : props.filter(p => p.brand === state.brand);
    }

    view.innerHTML = `
        <div class="px-6 pt-24 pb-4 animate-enter">
            ${isFiltered ? `
            <div class="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                <div>
                    <p class="text-xs text-blue-600 dark:text-blue-300 font-bold mb-1">ผลลัพธ์สำหรับ (${state.deviceType || 'อุปกรณ์'})</p>
                    <p class="font-bold text-gray-900 dark:text-white text-sm">${state.brand} ${state.model} -${CheckData.issues.find(i=>i.id===state.issue)?.name || state.issue}</p>
                </div>
            </div>` : ''}

            <div class="flex justify-between items-end mb-4">
                <h2 class="text-xl font-bold dark:text-white">${state.brand || ''} ${state.model || ''}</h2>
            </div>
            
            ${props.length === 0 ? `<div class="text-center py-10 text-gray-400">ไม่พบรายการที่ตรงกัน<br>ลองติดต่อสอบถามโดยตรง</div>` : ''}

            <div class="physics-scroll -mx-6 px-6 pb-6">
                ${props.map(p => `
                    <div onclick="window.Router.navigate('/details/${p.id}')" class="w-[260px] shrink-0 relative rounded-[1.8rem] overflow-hidden aspect-[4/5] shadow-lg bg-gray-200 group cursor-pointer snap-center">
                        <img src="${p.images[0]}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">
                        <div class="absolute top-4 left-4">
                            <span class="px-3 py-1 bg-brand-primary/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/10 shadow-sm">${p.tag}</span>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <h3 class="text-white font-bold text-lg leading-tight mb-1 truncate">${p.title}</h3>
                            <div class="flex items-center justify-between">
                                <p class="text-brand-accent font-bold">${p.price}</p>
                                <div class="flex gap-2 text-[10px] text-white/80 items-center">
                                    <span class="bg-white/20 px-1.5 py-0.5 rounded flex items-center gap-1"><i class="material-symbols-rounded text-[10px]">schedule</i> ${p.specs.baths}</span>
                                </div>
                            </div>
                        </div>
                    </div>`).join('')}
            </div>
            
            <h2 class="text-xl font-bold mb-4 mt-2 dark:text-white">รายการเช็คราคาอะไหล่</h2>
            <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
                 ${CheckData.parts.map(p => `
                    <div onclick="window.UI.handlePartsExactSearch('${p.name}')" class="w-[240px] shrink-0 flex p-3 bg-white dark:bg-gray-800 rounded-[1.2rem] border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.98] transition-transform cursor-pointer group">
                        <div class="w-20 h-20 rounded-xl bg-blue-50 dark:bg-blue-900/20 overflow-hidden shrink-0 relative flex flex-col items-center justify-center text-blue-500 dark:text-blue-300 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                            <span class="material-symbols-rounded text-3xl mb-1">${p.icon}</span>
                        </div>
                        <div class="flex-1 ml-3 flex flex-col py-1 justify-center">
                            <h4 class="font-bold text-sm dark:text-white line-clamp-2 mb-1 font-display leading-tight">${p.name}</h4>
                            <p class="font-bold text-brand-primary dark:text-brand-accent text-xs mt-1">เช็คราคา <span class="material-symbols-rounded text-[10px] align-middle">chevron_right</span></p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
}
