export function renderLanding(view, header, Router) {
    header.innerHTML = '';
    view.innerHTML = `
    <div class="absolute inset-0 z-0 bg-[#0F172A] flex items-center justify-center overflow-hidden">
         <div class="absolute w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] top-[-20%] right-[-20%] animate-pulse"></div>
    </div>

    <div class="relative z-10 flex flex-col h-full px-8 pt-24 pb-12 justify-between">
        <div class="text-center space-y-8">
            <div class="inline-flex rounded-[2rem] overflow-hidden w-28 h-28 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-500/20 mb-2">
                <img src="logo.jpeg" alt="logo" class="w-full h-full object-cover">
            </div>
            <h1 class="text-5xl font-display font-bold text-white leading-[1.1]">
                fix
            </h1>
            <p class="text-gray-400 text-sm font-light leading-relaxed max-w-[250px] mx-auto">
                เช็คราคาอะไหล่ ประเมินค่าซ่อม<br>การซ่อมแซมเป็นสิ่งที่น่ายกย่อง
            </p>
        </div>

        <div class="space-y-4 w-full">
            <button onclick="window.Router.navigate('/check')" class="w-full h-14 bg-white text-[#0F172A] rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group">
                เริ่มต้นเช็คอาการ <span class="material-symbols-rounded group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
        </div>
    </div>`;
}
