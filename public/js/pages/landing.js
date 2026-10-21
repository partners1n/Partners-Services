export function renderLanding(view, header, Router) {
    header.innerHTML = '';
    view.innerHTML = `
    <!-- พื้นหลัง Dark Modern พร้อม Ambient Glow ที่นุ่มนวล -->
    <div class="absolute inset-0 z-0 bg-[#0B132B] flex items-center justify-center overflow-hidden">
         <div class="absolute w-[500px] h-[500px] bg-gradient-to-tr from-orange-500/15 to-blue-600/15 rounded-full blur-[140px] top-[-10%] right-[-10%] animate-pulse"></div>
         <div class="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] bottom-[-10%] left-[-10%]" ></div>
    </div>

    <div class="relative z-10 flex flex-col h-full px-8 pt-12 pb-8 justify-between max-w-md mx-auto w-full">
        
        <!-- ส่วนหัว: โลโก้ และ Brand Identity (เอาเอฟเฟกต์หลังโลโก้ออกแล้ว) -->
        <div class="text-center space-y-6 my-auto">
            <div class="relative inline-block">
                <div class="relative rounded-[2.3rem] overflow-hidden w-32 h-32 bg-gray-900 border border-white/10 shadow-2xl p-1 mx-auto">
                    <img src="logo.jpeg" alt="logo" class="w-full h-full object-cover rounded-[2rem]">
                </div>
            </div>
            
            <div class="space-y-2">
                <h1 class="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight">
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-orange-400 drop-shadow-[0_2px_10px_rgba(255,69,0,0.3)]">GuFix : กูซ่อมเอง</span>
                    <span class="block text-white mt-2 font-light tracking-[0.1em] text-xl sm:text-2xl opacity-90">หาวิธีซ่อมก่อนจะเสียเงิน</span>
                </h1>
                <div class="w-12 h-1 bg-gradient-to-r from-orange-500 to-blue-500 mx-auto rounded-full my-4 opacity-80"></div>
            </div>

            <!-- ปุ่ม "เริ่มต้นเช็คอาการเสีย" -->
            <div class="w-full pt-2">
                <div class="relative group">
                    <!-- แสงนีออนฟุ้งด้านหลังปุ่ม -->
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-rose-500 to-blue-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                    
                    <button onclick="window.Router.navigate('/check')" class="relative w-full h-14 rounded-2xl p-[1.5px] focus:outline-none active:scale-95 transition-transform duration-200 bg-gradient-to-r from-orange-500 via-rose-500 to-blue-600 shadow-xl">
                        <span class="flex items-center justify-center gap-3 w-full h-full bg-[#0F172A] rounded-[14px] text-white font-bold text-base sm:text-lg tracking-wide group-hover:bg-opacity-90 transition-all">
                            <span>เริ่มต้นเช็คอาการเสีย</span>
                            <span class="material-symbols-rounded bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent group-hover:translate-x-1.5 transition-transform duration-300">arrow_forward</span>
                        </span>
                    </button>
                </div>
            </div>

            <p class="text-xs sm:text-sm text-gray-400 font-normal tracking-wide pt-1">
                การซ่อมแซมเป็นสิ่งที่น่ายกย่อง
            </p>    
        </div>

        <!-- ส่วนล่าง: Footer มืออาชีพ (ย้ายมาอยู่ล่างสุดแบบจัดวางสมบูรณ์) -->
        <div class="w-full pt-4">
            <footer class="text-center pb-2">
                <a href="https://gufix.online" target="_blank" class="text-[11px] text-gray-400 hover:text-white transition-colors tracking-[0.25em] font-mono uppercase opacity-70 hover:opacity-100">
                    © 2026 GUFIX.ONLINE • ALL RIGHTS RESERVED
                </a>
            </footer>
        </div>
    </div>`;
}
