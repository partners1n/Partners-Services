import { Store } from './store.js';
import { UI } from './ui.js';
import { renderHome } from '../pages/home.js';
import { renderCheck } from '../pages/check.js';
import { renderDetails } from '../pages/details.js';
import { renderSupport } from '../pages/support.js';
import { renderChat } from '../pages/chat.js';
import { renderProfile } from '../pages/profile.js';
import { renderLanding } from '../pages/landing.js';

export const Router = {
    init() {
        window.addEventListener('popstate', () => this.resolve());
        this.resolve();
    },
    
    navigate(path) {
        if (path === '/contact') path = '/chat';
        if (path === '/wizard') path = '/check';
        window.history.pushState({}, "", path);
        this.resolve();
    },

    refresh() { this.resolve(); },

    resolve() {
        let path = window.location.pathname;
        if (path === '/index.html') path = '/';
        
        if (path === '/contact') path = '/chat';
        if (path === '/wizard') path = '/check';
        
        const view = document.getElementById('main-view');
        const header = document.getElementById('header');
        const nav = document.getElementById('bottom-nav');
        
        if (header) {
            header.classList.remove('hidden');
            header.style.transform = '';
            header.style.transition = '';
            header.style.zIndex = '';
        }

        document.querySelectorAll('.nav-btn').forEach(btn => {
            const datasetPath = btn.dataset.path;
            const isActive = datasetPath === path || 
                             (datasetPath === '/contact' && path === '/chat') ||
                             (datasetPath === '/wizard' && path === '/check');
            if(isActive) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        if(path === '/landing' || path === '/check') {
            nav.style.transform = "translateY(200%)";
        } else {
            nav.style.transform = "translateY(0)";
        }

        view.classList.remove('loaded');
        
        setTimeout(() => {
            try {
                if (path === '/') renderHome(view, header, this);
                else if (path.startsWith('/details/')) {
                    const id = path.split('/')[2];
                    renderDetails(view, header, id, this);
                }
                else if (path === '/support') renderSupport(view, header, this);
                else if (path === '/chat') renderChat(view, header, this);
                else if (path === '/profile') renderProfile(view, header, this);
                else if (path === '/landing') renderLanding(view, header, this);
                else if (path === '/check') renderCheck(view, header, this);
                else renderHome(view, header, this);
                
                if(path !== '/check' && path !== '/chat') UI.initScrollListener(view);
                view.scrollTop = 0;
                view.classList.add('loaded'); 
            } catch (error) {
                console.error("Rendering Error:", error);
                window.history.replaceState({}, "", "/");
                renderHome(view, header, this);
            }
        }, 200);
    }
};

// ผูกกับ Global เพื่อให้ HTML Inline Callbacks ทำงานร่วมกับ ES Modules ได้อย่างลื่นไหล
window.Router = Router;
window.UI = UI;
window.Store = Store;

document.addEventListener('DOMContentLoaded', async () => {
    await Store.init();
    Router.init();
});
