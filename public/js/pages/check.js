import { CheckData, Store } from '../core/store.js';
import { UI, restartBtnHtml } from '../core/ui.js';

export function renderCheck(view, header, Router) {
    header.innerHTML = `
        <div class="flex items-center gap-3 pointer-events-auto">
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden p-0.5 border border-gray-100 dark:border-gray-700">
                <img src="logo.jpeg" alt="logo" class="w-full h-full object-contain">
            </div>
            <p class="font-bold dark:text-white text-sm">ประเมินอาการเสีย</p>
        </div>
        ${restartBtnHtml}
    `;

    let step = 1;
    
    const updateStep = async () => {
        let html = '';
        let title = '';
        
        if (step === 1) {
            title = 'เลือก Brands';
            html = `
            <div class="grid grid-cols-2 gap-4 animate-slide-in pb-8">
                ${CheckData.brands.map(b => `
                    <button onclick="window.checkFlowSelectBrand('${b.id}')" class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center gap-3 hover:border-brand-primary transition-all active:scale-95">
                        <span class="material-symbols-rounded text-4xl text-gray-400">${b.icon}</span>
                        <span class="font-bold dark:text-white">${b.name}</span>
                    </button>
                `).join('')}
            </div>`;
        } else if (step === 2) {
            title = 'ประเภทอุปกรณ์ของคุณ?';
            html = `
            <div class="grid grid-cols-2 gap-4 animate-slide-in pb-8">
                ${CheckData.deviceTypes.map(d => `
                    <button onclick="window.checkFlowNext('deviceType', '${d.name}')" class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center gap-3 hover:border-brand-primary transition-all active:scale-95 text-center">
                        <span class="material-symbols-rounded text-4xl text-brand-primary">${d.icon}</span>
                        <span class="font-bold dark:text-white text-sm">${d.name}</span>
                    </button>
                `).join('')}
            </div>`;
        } else if (step === 3) {
            title = `รุ่น ${Store.checkState.brand} (${Store.checkState.deviceType}) ของคุณ?`;
            
            // โหลดข้อมูลรุ่นของแบรนด์นั้นๆ และคัดกรองตามประเภทอุปกรณ์ที่เลือก
            const brandData = await Store.loadBrandModels(Store.checkState.brand);
            let models = [];
            if (Array.isArray(brandData)) {
                models = brandData;
            } else if (brandData && typeof brandData === 'object') {
                const deviceTypeKey = Store.checkState.deviceType;
                models = brandData[deviceTypeKey] || brandData['โทรศัพท์มือถือ'] || Object.values(brandData).flat() || [];
            }
            
            html = `
            <div class="space-y-3 animate-slide-in pb-8">
                ${models.length === 0 ? `<p class="text-gray-400 text-center py-4">ไม่พบข้อมูลรุ่นสำหรับอุปกรณ์ประเภทนี้</p>` : ''}
                ${models.map(m => {
                    let name = m;
                    let imageUrl = null;
                    if (typeof m === 'object' && m.name) {
                        name = m.name;
                        imageUrl = m.image || null;
                    }
                    const escapedName = name.replace(/'/g, "\\'");
                    return `<button onclick="window.checkFlowNext('model', '${escapedName}')" 
                                    class="w-full p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 hover:border-brand-primary transition-all active:scale-95">
                                ${imageUrl ? `<img src="${imageUrl}" class="w-10 h-10 rounded-lg object-cover" alt="${name}" loading="lazy">` : ''}
                                <span class="font-bold dark:text-white flex-1 text-left">${name}</span>
                                <span class="material-symbols-rounded text-gray-300">chevron_right</span>
                            </button>`;
                }).join('')}
            </div>`;
        } else if (step === 4) {
            title = 'อาการเสียคืออะไร?';
            html = `
            <div class="grid grid-cols-2 gap-4 animate-slide-in pb-8">
                ${CheckData.issues.map(i => `
                    <button onclick="window.checkFlowFinish('${i.id}')" class="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center gap-2 hover:border-red-500 transition-all active:scale-95 text-center h-32 justify-center">
                        <span class="material-symbols-rounded text-3xl text-red-400">${i.icon}</span>
                        <span class="font-bold text-sm dark:text-white">${i.name}</span>
                    </button>
                `).join('')}
            </div>`;
        }

        view.innerHTML = `
            <div class="absolute inset-0 px-6 pt-24 flex flex-col bg-gray-50 dark:bg-[#0B1120]">
                <div class="mb-6 mt-4 shrink-0">
                    <div class="flex gap-2 mb-6">
                        <div class="h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-700'} transition-colors"></div>
                        <div class="h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-700'} transition-colors"></div>
                        <div class="h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-700'} transition-colors"></div>
                        <div class="h-1.5 flex-1 rounded-full ${step >= 4 ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-700'} transition-colors"></div>
                    </div>
                    <h1 class="text-3xl font-display font-bold text-gray-900 dark:text-white">${title}</h1>
                </div>
                <div class="flex-1 overflow-y-auto hide-scrollbar" style="padding-bottom: max(2rem, env(safe-area-inset-bottom));">
                    ${html}
                </div>
            </div>
        `;
    };
    
    window.checkFlowSelectBrand = async (brandId) => {
        Store.checkState.brand = brandId;
        step++;
        await updateStep();
    };

    window.checkFlowNext = async (key, val) => {
        Store.checkState[key] = val;
        step++;
        await updateStep();
    };
    
    window.checkFlowFinish = (issueId) => { 
        Store.checkState.issue = issueId;
        const issueObj = CheckData.issues.find(i => i.id === issueId);
        const issueName = issueObj ? issueObj.name : issueId;
        UI.handleSupportSearch(issueName, false);
    }; 
    
    updateStep();
}
