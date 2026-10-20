export let CheckData = { 
    brands: [], 
    deviceTypes: [],
    models: {}, // จะถูกโหลดและเก็บแยกตามแบรนด์
    issues: [], 
    parts: [] 
};

export const BankData = [
    { id: 'kbank', name: 'KBank', thName:'กสิกรไทย', abbr: 'KBank', rate: 0, mrr: 0, highlight: '0% 10 เดือน', bgGradient: 'from-green-50/80 to-white dark:from-green-900/20 dark:to-[#0f172a]' },
    { id: 'ktc', name: 'KTC', thName:'เคทีซี', abbr: 'KTC', rate: 0.74, mrr: 0, highlight: 'ดอกเบี้ยพิเศษ', bgGradient: 'from-blue-50/80 to-white dark:from-blue-900/20 dark:to-[#0f172a]' },
    { id: 'scb', name: 'SCB', thName:'ไทยพาณิชย์', abbr: 'SCB', rate: 0, mrr: 0, highlight: '0% 6 เดือน', bgGradient: 'from-purple-50/80 to-white dark:from-purple-900/20 dark:to-[#0f172a]' }
];

export const ThemeManager = {
    init() {
        this.applySystemTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            this.applySystemTheme(e.matches);
        });
    },
    applySystemTheme(isDark = window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
};

export const Store = {
    data: {
        properties: [],
        favorites: [1, 4],
        user: { name: "Guest User", avatar: "pictures/logo-w.png" }
    },
    checkState: {
        brand: null,
        deviceType: null,
        model: null,
        issue: null
    },
    currentIframeUrl: null,
    isPartsMode: false,
    
    async init() {
        try {
            ThemeManager.init();

            // โหลดข้อมูลหลักและข้อมูลโครงสร้างพื้นฐานพร้อมกัน
            const [propertiesRes, brandsRes, deviceTypesRes, issuesRes, partsRes] = await Promise.all([
                fetch('data.json'),
                fetch('data/brands.json'),
                fetch('data/device-types.json'),
                fetch('data/issues.json'),
                fetch('data/parts.json')
            ]);

            if (!propertiesRes.ok) throw new Error("Failed to load data.json");

            this.data.properties = await propertiesRes.json();
            CheckData.brands = brandsRes.ok ? await brandsRes.json() : [];
            CheckData.deviceTypes = deviceTypesRes.ok ? await deviceTypesRes.json() : [];
            CheckData.issues = issuesRes.ok ? await issuesRes.json() : [];
            CheckData.parts = partsRes.ok ? await partsRes.json() : [];

        } catch (error) {
            console.error("Error initializing store:", error);
            document.body.innerHTML = `<div class="p-10 text-center text-red-500">Error loading application data.</div>`;
        }
    },

    // ฟังก์ชันสำหรับ Lazy Load ข้อมูลรุ่นตามแบรนด์ที่ผู้ใช้เลือก (ช่วยประหยัด Bandwidth)
    async loadBrandModels(brandId) {
        if (CheckData.models[brandId]) {
            return CheckData.models[brandId]; // ถ้าเคยโหลดแล้วใช้จาก Cache ได้เลย
        }
        try {
            const res = await fetch(`data/brands/${brandId.toLowerCase()}.json`);
            if (!res.ok) throw new Error(`Failed to load models for ${brandId}`);
            const modelsData = await res.json();
            CheckData.models[brandId] = modelsData;
            return modelsData;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    get(id) { 
        return this.data.properties.find(p => p.id == id); 
    },
    
    toggleFav(id) {
        const index = this.data.favorites.indexOf(id);
        if (index > -1) {
            this.data.favorites.splice(index, 1);
        } else {
            this.data.favorites.push(id);
        }
        const favBtn = document.querySelector('.fav-btn-icon');
        if(favBtn) {
             favBtn.classList.toggle('text-red-500');
             favBtn.classList.toggle('text-gray-800');
             favBtn.classList.toggle('dark:text-white');
        }
    }
};
