import { UI, restartBtnHtml } from '../core/ui.js';

export function renderProfile(view, header) { 
    UI.currentImgIndex = 0;

    header.innerHTML = `
        <div class="flex items-center gap-3 flex-1 overflow-hidden pointer-events-auto">
            <h2 id="header-title-text" class="text-sm font-bold dark:text-white truncate transition-all duration-300 flex-1 pl-2">
                รายละเอียดร้าน
            </h2>
        </div>
        ${restartBtnHtml}
    `;

    view.innerHTML = `
        <div class="relative w-full h-[40vh] -mt-0 group z-0 bg-gray-200 dark:bg-[#0B1120] overflow-hidden flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
            <img src="logo.jpeg" class="w-40 h-40 object-contain drop-shadow-xl z-10 relative">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
            <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 dark:from-[#0B1120] to-transparent z-10"></div>
        </div>

        <div class="px-6 relative -mt-12 animate-enter pb-32 z-10">
            <div class="flex flex-col gap-3 mb-4">
                <span class="text-brand-accent font-bold text-xs uppercase tracking-wider bg-brand-accent/10 px-2 py-0.5 rounded w-fit">ศูนย์ซ่อมมาตรฐาน</span>
            </div>

            <h1 class="text-2xl font-display font-bold text-gray-900 dark:text-white leading-tight mt-2 mb-2">iFix <span style="color: OrangeRed;">Partners</span></h1>
            <p class="text-xl font-bold text-brand-primary dark:text-white mb-6">ติดต่อเรา: 090-330-0465</p>

            <div class="grid grid-cols-3 gap-3 mb-6">
                 <div class="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <span class="material-symbols-rounded text-brand-accent mb-1">verified_user</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm">100%</p>
                    <p class="text-[10px] text-gray-400">รับประกัน</p>
                 </div>
                 <div class="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <span class="material-symbols-rounded text-brand-accent mb-1">schedule</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm">รวดเร็ว</p>
                    <p class="text-[10px] text-gray-400">รอรับได้เลย</p>
                 </div>
                 <div class="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <span class="material-symbols-rounded text-brand-accent mb-1">star</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm px-1">5 ดาว</p>
                    <p class="text-[10px] text-gray-400">รีวิวลูกค้า</p>
                 </div>
            </div>

             <div class="mb-8">
                <h3 class="font-bold text-lg mb-3 text-gray-900 dark:text-white">ช่องทางการติดต่อ</h3>
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
                    <div class="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 pb-2">
                        <span class="text-gray-500">เบอร์โทรศัพท์</span>
                        <span class="font-medium text-gray-900 dark:text-white text-right">090-330-0465</span>
                    </div>
                    <div class="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 pb-2">
                        <span class="text-gray-500">อีเมล</span>
                        <span class="font-medium text-gray-900 dark:text-white">partners.business.co.th@gmail.com</span>
                    </div>
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500">ที่ตั้ง</span>
                        <span class="font-medium text-brand-accent text-right">เชียงใหม่</span>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h3 class="font-bold text-lg mb-3 text-gray-900 dark:text-white">เกี่ยวกับเรา</h3>
                <div id="desc-text" class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed prose line-clamp-3 overflow-hidden text-ellipsis">
                    บริการซ่อมมือถือทุกอาการเสีย เปลี่ยนจอ เปลี่ยนแบตเตอรี่ เครื่องเปิดไม่ติด ชาร์จไม่เข้า ตกน้ำ และอื่นๆ ด้วยอะไหล่คุณภาพมาตรฐาน พร้อมการรับประกันงานซ่อม ยินดีให้คำปรึกษาและประเมินราคาฟรี
                </div>
                <button id="read-more-btn" onclick="window.UI.toggleReadMore()" class="text-brand-primary dark:text-brand-accent text-sm font-bold mt-2">ดูเพิ่มเติม</button>
            </div>
        </div>
        
        <div class="fixed bottom-[calc(var(--nav-height)+24px)] left-0 right-0 px-4 z-30 flex justify-between gap-3 pointer-events-none">
             <button onclick="window.location.href='mailto:partners.business.co.th@gmail.com'" class="pointer-events-auto flex-1 max-w-[160px] py-2 bg-white dark:bg-gray-800 text-brand-primary dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span class="material-symbols-rounded text-lg">mail</span> ส่งอีเมล
             </button>
             <button onclick="window.location.href='tel:0903300465'" class="pointer-events-auto flex-1 max-w-[160px] py-2 bg-brand-primary text-white rounded-full font-bold text-xs shadow-lg shadow-brand-primary/30 flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-colors active:scale-95">
                <span class="material-symbols-rounded text-lg">call</span> โทรเลย
             </button>
        </div>
    `;
}
