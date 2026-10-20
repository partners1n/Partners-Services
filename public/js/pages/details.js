import { Store } from '../core/store.js';
import { UI, restartBtnHtml } from '../core/ui.js';

export function renderDetails(view, header, id, Router) {
    const p = Store.get(id);
    if (!p) return;

    const isFav = Store.data.favorites.includes(parseInt(id));
    UI.currentImages = p.images;
    UI.currentImgIndex = 0;

    header.innerHTML = `
        <div class="flex items-center gap-3 flex-1 overflow-hidden pointer-events-auto">
            <button onclick="window.Router.navigate('/')" class="shrink-0 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md flex items-center justify-center shadow-sm text-gray-800 dark:text-white transition-transform active:scale-90 z-50">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h2 id="header-title-text" class="text-sm font-bold dark:text-white truncate opacity-0 -translate-x-2 transition-all duration-300 flex-1 pr-2">
                ${p.title}
            </h2>
        </div>
        <div class="flex gap-2 shrink-0 pointer-events-auto items-center">
            ${restartBtnHtml}
            <button onclick="window.Store.toggleFav(${p.id})" class="fav-btn-icon w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md flex items-center justify-center shadow-sm ${isFav ? 'text-red-500' : 'text-gray-800 dark:text-white'} transition-colors active:scale-90"><span class="material-symbols-rounded">favorite</span></button>
        </div>`;

    view.innerHTML = `
        <div class="relative w-full h-[50vh] -mt-0 group z-0 bg-gray-200 overflow-hidden" 
             ontouchstart="window.UI.touchStartX = event.changedTouches[0].screenX"
             ontouchend="window.UI.touchEndX = event.changedTouches[0].screenX; window.UI.handleSwipe()">
            <img id="details-main-img" src="${UI.currentImages[0]}" class="w-full h-full object-cover transition-opacity duration-300 select-none pointer-events-none">
            <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 dark:from-[#0B1120] to-transparent"></div>
        </div>

        <div class="px-6 relative -mt-12 animate-enter pb-8 z-10">
            <div class="flex flex-col gap-3 mb-4">
                <span class="text-brand-accent font-bold text-xs uppercase tracking-wider bg-brand-accent/10 px-2 py-0.5 rounded w-fit">${p.type}</span>
                <div class="thumb-scroll w-full">
                     ${UI.currentImages.map((img, index) => `
                        <div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="window.UI.updateMainImage('${img}', this,${index})">
                            <img src="${img}" alt="thumb">
                        </div>
                     `).join('')}
                </div>
            </div>

            <h1 class="text-2xl font-display font-bold text-gray-900 dark:text-white leading-tight mt-2 mb-2">${p.title}</h1>
            <p class="text-3xl font-bold text-brand-primary dark:text-white mb-6">${p.price}</p>

            <div class="grid grid-cols-3 gap-3 mb-6">
                 <div class="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <span class="material-symbols-rounded text-brand-accent mb-1">verified_user</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm">${p.specs.beds}</p>
                    <p class="text-[10px] text-gray-400">รับประกัน</p>
                 </div>
                 <div class="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <span class="material-symbols-rounded text-brand-accent mb-1">schedule</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm">${p.specs.baths}</p>
                    <p class="text-[10px] text-gray-400">ระยะเวลาซ่อม</p>
                 </div>
                 <div class="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <span class="material-symbols-rounded text-brand-accent mb-1">inventory_2</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm px-1">${p.specs.sqft}</p>
                    <p class="text-[10px] text-gray-400">สถานะของ</p>
                 </div>
            </div>

             <div class="mb-8">
                <h3 class="font-bold text-lg mb-3 text-gray-900 dark:text-white">รายละเอียดบริการ</h3>
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
                    <div class="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 pb-2">
                        <span class="text-gray-500">สาขาที่ให้บริการ</span>
                        <span class="font-medium text-gray-900 dark:text-white text-right max-w-[60%] truncate">${p.address}</span>
                    </div>
                     <div class="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 pb-2">
                        <span class="text-gray-500">เกรดอะไหล่</span>
                        <span class="font-medium text-gray-900 dark:text-white">${p.details.map}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 pb-2">
                        <span class="text-gray-500">มาตรฐาน</span>
                        <span class="font-medium text-gray-900 dark:text-white">${p.details.parking}</span>
                    </div>
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500">ค่าบริการเพิ่มเติม</span>
                        <span class="font-medium text-brand-accent">${p.details.fee}</span>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h3 class="font-bold text-lg mb-3 text-gray-900 dark:text-white">ข้อมูลเพิ่มเติม</h3>
                <div id="desc-text" class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed prose line-clamp-3 overflow-hidden text-ellipsis">
                    ${UI.parseText(p.description)}
                </div>
                <button id="read-more-btn" onclick="window.UI.toggleReadMore()" class="text-brand-primary dark:text-brand-accent text-sm font-bold mt-2">ดูเพิ่มเติม</button>
            </div>
        </div>
    `;
}
