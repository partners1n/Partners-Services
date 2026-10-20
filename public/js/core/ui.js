import { CheckData, BankData, Store } from './store.js';

export const UI = {
    currentNumericPrice: 0,
    currentImgIndex: 0,
    currentImages: [],
    touchStartX: 0,
    touchEndX: 0,

    parseText(text) {
        if (!text) return "";
        const safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return safeText.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    },
    parsePrice(priceStr) {
        if(!priceStr) return 0;
        return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    },

    openModal(modalId, priceStr = null) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById(modalId + 'Backdrop');
        const panel = document.getElementById(modalId + 'Panel');

        if (modalId === 'loanModal') {
            panel.classList.remove('h-[75vh]', 'max-h-[85vh]', 'h-[85vh]', 'h-[45vh]'); 
            panel.classList.add('h-[75vh]');
            
            if (priceStr) {
                const numericPrice = this.parsePrice(priceStr);
                this.currentNumericPrice = numericPrice;
                this.renderBankList();
            }
        }

        modal.classList.remove('hidden');
        void modal.offsetWidth; 
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('translate-y-full');
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById(modalId + 'Backdrop');
        const panel = document.getElementById(modalId + 'Panel');
        
        backdrop.classList.add('opacity-0');
        panel.classList.add('translate-y-full');
        setTimeout(() => modal.classList.add('hidden'), 400);
    },

    openModalChat(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById(modalId + 'Backdrop');
        const panel = document.getElementById(modalId + 'Panel');
        if(modal && backdrop && panel) {
            modal.classList.remove('hidden');
            void modal.offsetWidth;
            backdrop.classList.remove('opacity-0');
            panel.classList.remove('translate-y-full');
        }
    },

    closeModalChat(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById(modalId + 'Backdrop');
        const panel = document.getElementById(modalId + 'Panel');
        if(modal && backdrop && panel) {
            backdrop.classList.add('opacity-0');
            panel.classList.add('translate-y-full');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    },

    selectIssueChat(issueName) {
        if(!issueName || issueName.trim() === '') return;
        this.closeModalChat('issuesModalChat');
        this.handleSupportSearch(issueName, false, true); 
    },

    toggleReadMore() {
        const desc = document.getElementById('desc-text');
        const btn = document.getElementById('read-more-btn');
        if (desc.classList.contains('line-clamp-3')) {
            desc.classList.remove('line-clamp-3');
            btn.innerText = "ย่อลง";
        } else {
            desc.classList.add('line-clamp-3');
            btn.innerText = "ดูเพิ่มเติม";
        }
    },

    updateMainImage(src, element, index) {
        const mainImg = document.getElementById('details-main-img');
        if(mainImg) {
            mainImg.style.opacity = '0';
            setTimeout(() => {
                mainImg.src = src;
                mainImg.style.opacity = '1';
            }, 150);
        }
        
        if (index !== undefined) {
            this.currentImgIndex = index;
        }

        document.querySelectorAll('.thumb-item').forEach((el, i) => {
            el.classList.remove('active');
            if (i === this.currentImgIndex) el.classList.add('active');
        });
        
        const thumbContainer = document.querySelector('.thumb-scroll');
        const activeThumb = document.querySelectorAll('.thumb-item')[this.currentImgIndex];
        if (activeThumb && thumbContainer) {
            const scrollLeft = activeThumb.offsetLeft - (thumbContainer.offsetWidth / 2) + (activeThumb.offsetWidth / 2);
            thumbContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    },

    handleSwipe() {
        const swipeThreshold = 50; 
        const diffX = this.touchStartX - this.touchEndX;

        if (Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                this.currentImgIndex = (this.currentImgIndex + 1) % this.currentImages.length;
            } else {
                this.currentImgIndex = (this.currentImgIndex - 1 + this.currentImages.length) % this.currentImages.length;
            }
            this.updateMainImage(this.currentImages[this.currentImgIndex], null, this.currentImgIndex);
        }
    },

    renderBankList() {
        const loanAmount = this.currentNumericPrice;
        document.getElementById('monthlyPaymentDisplay').innerText = '฿' + Math.round(loanAmount / 10).toLocaleString();
        
        const container = document.getElementById('bankListSimple');
        container.innerHTML = BankData.map(b => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">${b.abbr}</div>
                    <div>
                        <p class="font-bold text-sm dark:text-white">${b.thName}</p>
                        <p class="text-[10px] text-gray-400">${b.highlight}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-brand-primary dark:text-brand-accent">฿${Math.round(loanAmount/10).toLocaleString()}/ด.</p>
                </div>
            </div>
        `).join('');
    },

    initScrollListener(viewElement) {
        const header = document.getElementById('header');
        const headerTitle = document.getElementById('header-title-text');
        
        viewElement.onscroll = null;
        viewElement.onscroll = () => {
            if (viewElement.scrollTop > 10) {
                header.classList.add('header-scrolled', 'py-2');
                header.classList.remove('py-4');
                header.classList.remove('rounded-b-[2rem]');
                header.classList.add('rounded-none');
            } else {
                header.classList.remove('header-scrolled', 'py-2');
                header.classList.add('py-4');
                header.classList.remove('rounded-none');
                header.classList.add('rounded-b-[2rem]');
            }

            if (headerTitle) {
                if (viewElement.scrollTop > 200) {
                    headerTitle.classList.remove('opacity-0', '-translate-x-2');
                    headerTitle.classList.add('opacity-100', 'translate-x-0');
                } else {
                    headerTitle.classList.add('opacity-0', '-translate-x-2');
                    headerTitle.classList.remove('opacity-100', 'translate-x-0');
                }
            }
        };
    },

    handleSupportSearch(keyword, isPart = false, updateIframe = false) {
        Store.isPartsMode = false;
        const brand = Store.checkState.brand || '';
        const model = Store.checkState.model || '';
        
        let finalUrl = '';
        const longParams = '&igu=1&ctxs=2&sxsrf=AE3TifOHvDnV3Oa3M9AQi9AuKOQ__k588A%3A1765292428919&udm=50&fbs=AIIjpHwddnRuQwBQAoDsj65ELSF9yGu060Z-lkCw7g1ls5fw2O_ps2fUc9o1ak7M1c47jft4Y00BQlFbRUGbccoThZEmRL5V_bpxDF8a-iz--7RMRknC7FrP4B6SFf1Wfo4iOX-_LRH6tATEpV7UBnjuM6Eo_HGZCViblcBm-3dEQyajOv2lvq4PmJkmJjvphKWPLC8Sq__aXxQCYlXw-01XnKpzq3RoWhjuWlK3dGu1DwKcXvhSmXpdHxq6VhvPcs71yXXxXhg8gTozIuTsF04VZU0r_oZN6DnP9odQU51OVwLYhd8TsjAwYRCBiR_uvoATKb_cOI2p&aep=1&ntc=1&sa=X&ved=2ahUKEwjn5pnh4rCRAxVYla8BHW05MdoQ2J8OegQIDhAE&biw=411&bih=711&dpr=1.75&mstk=AUtExfAfz6C8DNpa9RiWdt9drdAf7iPRYyNOAlo5KEQGdXvUWmhchh6tXhM67JGDmBRNpdbqFVQsMW8IBY1OsDOs6oWZeRYLIJ0l90c7RqTYyUNp32Z47XjF0AYNkOgQontzyiZN72DbTVAKpGv_N43jNObVeV-NokZGWUPAv3zmIjs-YYgMzL8UipdhuLt3vPFVZLrDvWkrp8_lN9kItrf2FPEa5dlHy_Aw6Loks5ZCYIfmHT4l0zeqBtbIMqKDZIfjyDRY9YmyKQ1wtIlfJFRNPEROw9rLB-6bbn0LQMspL2EZD0ESjsHgm16zi5lg5doC9Bvq2Qi3iT-j2dmB3g9FEagKdILBGPIxIA&csuir=1&mtid=kTk4aaf4KNS64-EPiMqC2Qc&fbclid=IwY2xjawOmXrJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAwzNTA2ODU1MzE3MjgAAR46uzbOqMT3qZtl34iFLFwuDbsimCT8ycKCcMHOJ7JVeQXDtwJEfNJG5SARNA_aem_qpivVRV9PEQwM3pRH4FN3g&sei=Y385aeCJIKLM1e8Pl--N0AE';
        
        if (isPart) {
            const query = `${brand} ${model} ${keyword}`.trim();
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}${longParams}`;
        } else {
            const query = `ซ่อม${brand}${model}${keyword}`.trim();
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}${longParams}`;
        }
        
        Store.currentIframeUrl = finalUrl;
        
        import('./router.js').then(({ Router }) => {
            if (updateIframe && window.location.pathname === '/chat') {
                document.getElementById('chat-iframe').src = finalUrl;
                const bar = document.getElementById('chat-parts-bar');
                if (bar) {
                    bar.className = "fixed top-[70px] left-0 right-0 z-30 px-3 py-2 bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 pointer-events-none hidden opacity-0 -translate-y-2";
                }
            } else {
                Router.navigate('/chat'); 
            }
        });
    },

    handlePartsExactSearch(partName) {
        Store.isPartsMode = true; 
        const brand = Store.checkState.brand || '';
        const model = Store.checkState.model || '';
        const query = `${brand} ${model} ราคา ${partName}`.trim();
        const exactUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&sa=X&sca_esv=fd565832262b37c0&igu=1&ctxs=2&aep=1&biw=411&bih=711&udm=28&fbs=ADc_l-Y1I2pvDmp9BP3jS3uYkUeH2h30s3FsK22xOObGBADt2X_YI7R-ie97AkUceZp_m9oFy-IPUi74BZ9zQbKaF_CiTIjnMubqi13Dld-MqdUjfo8LGweymTs4VD0FQ097jLEYWt1KqB99EM3tIANv-bcgRlSw2RanhY2B9HJ9jlhUMGmr14OlnOg1dIkMYWtMr8EPdDsN10M0tA_WApWqGRFBSRhyvevg-kRoBLcgXnr10ubQfas4peQ7Qt3MBzwCv5xFWmPJ4ern9ioOUd-QwcE5m0082pzhio6cTvwBNrV9nPRzx1PyS7FR9AfqicmGLoT6NFF6&ved=1t:220175&ictx=111`;
        
        Store.currentIframeUrl = exactUrl;
        this.closeModalChat('partsModalChat');
        
        import('./router.js').then(({ Router }) => {
            if (window.location.pathname === '/chat') {
                document.getElementById('chat-iframe').src = exactUrl;
                const bar = document.getElementById('chat-parts-bar');
                if (bar) {
                    bar.className = "fixed top-[70px] left-0 right-0 z-30 px-3 py-2 bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 pointer-events-auto opacity-100 translate-y-0";
                }
            } else {
                Router.navigate('/chat');
            }
        });
    }
};

export const restartBtnHtml = `
    <button onclick="window.Router.navigate('/landing')" class="px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center border border-gray-100 dark:border-gray-700 pointer-events-auto active:scale-90 transition-transform text-xs font-bold gap-1 text-brand-primary ml-auto shrink-0">
        <span class="material-symbols-rounded text-sm">restart_alt</span> เช็คใหม่
    </button>
`;
