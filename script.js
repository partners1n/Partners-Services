// --- 1. ระบบจัดการสถานะและแคช (State & Memory Management) ---
let currentViewId = 'view-home';
const historyStack = [{ view: 'view-home', params: {} }];

// ใช้ Map เป็น Hash Table เพื่อ Time Complexity O(1) ในการดึงข้อมูลที่เคยโหลดแล้ว
const memoryCache = new Map();

// --- 2. ฟิสิกส์และระบบนำทาง (Kinematics & Routing) ---
function navigateTo(viewId, params = {}, isBack = false) {
    const currentView = document.getElementById(currentViewId);
    const targetView = document.getElementById(viewId);

    if (!targetView || currentView === targetView) return;

    if (!isBack) {
        historyStack.push({ view: viewId, params: params });
    }

    currentView.classList.remove('active', 'slide-in-left', 'slide-in-right');
    targetView.classList.add('active');

    // บังคับ Reflow เพื่อรีเซ็ตวงรอบแอนิเมชัน (DOM Render Cycle)
    void targetView.offsetWidth; 

    targetView.classList.add(isBack ? 'slide-in-left' : 'slide-in-right');
    currentViewId = viewId;

    // Asynchronous Dispatch
    if (viewId === 'view-category') {
        renderCategory(params.cat);
    } else if (viewId === 'view-search') {
        renderSearch(params.id, params.cat);
    }
}

function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop();
        const previous = historyStack[historyStack.length - 1];
        navigateTo(previous.view, previous.params, true);
    } else {
        navigateTo('view-home', {}, true);
    }
}

// --- 3. การประมวลผลข้อมูลความเร็วสูง (High-Performance Fetching) ---
async function fetchWithCache(url) {
    if (memoryCache.has(url)) {
        return memoryCache.get(url); // O(1) Lookup
    }
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network Response Error");
        const data = await res.json();
        memoryCache.set(url, data); // เก็บลง Hash Table
        return data;
    } catch (err) {
        console.error("Fetch Error:", err);
        throw err;
    }
}

// --- 4. การจัดการ DOM (DOM Manipulation) ---
function focusSearch() {
    document.getElementById('searchInput').focus();
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        const inputEl = document.getElementById('searchInput');
        const query = inputEl.value.trim().toLowerCase();
        
        const validCoins = new Set(['btc', 'eth', 'sol', 'soh', 'hbar']); // O(1) Lookup
        
        if (validCoins.has(query)) {
            const coin = (query === 'soh') ? 'sol' : query; 
            inputEl.value = ''; 
            navigateTo('view-search', { id: coin, cat: 'crypto' });
        } else if (query !== "") {
            alert('กรุณาค้นหาด้วยคำว่า: btc, eth, sol หรือ hbar');
        }
    }
}

const catSettings = {
    'crypto': { title: 'คริปโต', file: 'btc.json' },
    'it': { title: 'ไอที / โค้ด', file: 'it.json' },
    'realestate': { title: 'อสังหาฯ', file: 'realestate.json' },
    'repair': { title: 'ซ่อมมือถือ', file: 'repair.json' }
};

async function renderCategory(cat) {
    const currentCat = catSettings[cat] || catSettings['crypto'];
    document.getElementById('catTitle').innerText = currentCat.title;
    const listContainer = document.getElementById('itemList');
    
    listContainer.innerHTML = '<div class="status-message"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 12px; color: #3b82f6;"></i><p>กำลังดึงข้อมูล...</p></div>';

    try {
        const data = await fetchWithCache(currentCat.file);
        
        // ใช้ DocumentFragment เพื่อลดภาระการทำ Repaint ของบราวเซอร์
        const fragment = document.createDocumentFragment();
        const keys = Object.keys(data);
        
        if (keys.length === 0) {
            listContainer.innerHTML = '<div class="status-message">ไม่มีข้อมูลในหมวดหมู่นี้</div>';
            return;
        }

        for (const key of keys) {
            const val = data[key];
            const imgUrl = val.images?.length > 0 ? val.images[0] : 'https://via.placeholder.com/150?text=No+Image';
            
            const div = document.createElement('div');
            div.className = 'list-item';
            div.onclick = () => navigateTo('view-search', {id: key, cat: cat});
            div.innerHTML = `
                <img src="${imgUrl}" class="list-img" alt="${val.title}" loading="lazy">
                <div class="list-info">
                    <div class="list-title">${val.title}</div>
                    <div class="list-subtitle">${val.answer_text}</div>
                </div>
                <div class="chevron-icon"><i class="fa-solid fa-chevron-right"></i></div>
            `;
            fragment.appendChild(div);
        }
        
        listContainer.innerHTML = '';
        listContainer.appendChild(fragment); // Render ลง DOM ครั้งเดียว
    } catch (err) {
        listContainer.innerHTML = `
            <div class="status-message">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 32px; margin-bottom: 12px; color: #ef4444;"></i>
                <p>ไม่พบข้อมูล (ต้องสร้างไฟล์ ${currentCat.file})</p>
            </div>`;
    }
}

async function renderSearch(queryId, categoryStr) {
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px;"></i></div>';

    try {
        const targetJsonFile = catSettings[categoryStr]?.file || 'btc.json';
        const allData = await fetchWithCache(targetJsonFile);
        const data = allData[queryId];

        if (data) {
            // ใช้ Template Literal อย่างเป็นระเบียบ
            const imagesHtml = data.images.map(img => `<img src="${img}" alt="Image" loading="lazy">`).join('');
            const sourcesHtml = data.sources.map(source => `
                <a href="#" class="source-card">
                    <div class="source-header" style="display:flex; justify-content:space-between; width:100%;">
                        <span style="display:flex; align-items:center; gap:6px;"><i class="${source.icon}"></i> ${source.title}</span>
                        ${source.is_pro ? `<div class="pro-badge"><i class="fa-solid fa-circle-play"></i> โปร</div>` : ''}
                    </div>
                    <div class="source-subtitle">${source.subtitle}</div>
                </a>`).join('');
            const relatedHtml = data.related_questions.map(q => `
                <div class="related-item">
                    <span>${q}</span>
                    <i class="fa-solid fa-arrow-right" style="color:#9ca3af;"></i>
                </div>`).join('');

            appContent.innerHTML = `
                <h1 class="main-title">${data.title}</h1>
                <div class="gallery">${imagesHtml}</div>
                <div class="feedback-box">
                    <p>${data.feedback_text}</p>
                    <div class="feedback-btns">
                        <button class="feedback-btn">${data.feedback_options[0]}</button>
                        <button class="feedback-btn">${data.feedback_options[1]}</button>
                    </div>
                </div>
                <div class="section-title"><i class="fa-solid fa-link"></i> อัพเดทข่าวสาร</div>
                <div class="sources-grid">
                    ${sourcesHtml}
                    <a href="#" class="source-card more">
                        <div class="source-header">${data.more_sources_text}</div>
                        <div class="pro-badge"><i class="fa-solid fa-circle-play"></i> โปร</div>
                    </a>
                </div>
                <div class="section-title" style="font-size:16px; color:#000;"><i class="fa-solid fa-magnifying-glass"></i> คำตอบ</div>
                <div class="answer-text">${data.answer_text}</div>
                <div class="action-btns">
                    <button class="icon-btn"><i class="fa-regular fa-thumbs-up"></i></button>
                    <button class="icon-btn"><i class="fa-regular fa-thumbs-down"></i></button>
                    <button class="icon-btn"><i class="fa-regular fa-copy"></i></button>
                </div>
                <div class="section-title" style="margin-top:24px; font-size:16px; color:#000;"><i class="fa-solid fa-list"></i> คำถามที่เกี่ยวข้อง</div>
                <div class="related-list">${relatedHtml}</div>
            `;
        } else {
            appContent.innerHTML = `
                <div style="padding: 40px 16px; text-align: center; color: #6b7280;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 40px; margin-bottom: 16px;"></i>
                    <p>ไม่พบข้อมูลสำหรับ "${queryId}"</p>
                </div>`;
        }
    } catch (error) {
        appContent.innerHTML = '<p style="padding:16px;color:red;text-align:center;">ไม่สามารถโหลดข้อมูล JSON ได้ กรุณารันผ่าน Local Server</p>';
    }
}