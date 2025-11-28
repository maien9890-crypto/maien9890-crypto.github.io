/**
 * Theme Manager
 * 다크/라이트 모드 전환 및 시스템 설정 감지
 */

(function() {
    'use strict';

    const THEME_KEY = 'blog-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    /**
     * 현재 테마 가져오기
     * @returns {string} 'dark' 또는 'light'
     */
    function getStoredTheme() {
        return localStorage.getItem(THEME_KEY);
    }

    /**
     * 시스템 테마 설정 감지
     * @returns {string} 'dark' 또는 'light'
     */
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK_THEME;
        }
        return LIGHT_THEME;
    }

    /**
     * 현재 적용할 테마 결정
     * @returns {string} 'dark' 또는 'light'
     */
    function getCurrentTheme() {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        return getSystemTheme();
    }

    /**
     * 테마 적용
     * @param {string} theme - 'dark' 또는 'light'
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Giscus 테마도 업데이트 (댓글 시스템)
        updateGiscusTheme(theme);
    }

    /**
     * Giscus 댓글 테마 업데이트
     * @param {string} theme - 'dark' 또는 'light'
     */
    function updateGiscusTheme(theme) {
        const giscusFrame = document.querySelector('iframe.giscus-frame');
        if (giscusFrame) {
            const giscusTheme = theme === DARK_THEME ? 'dark' : 'light';
            giscusFrame.contentWindow.postMessage(
                { giscus: { setConfig: { theme: giscusTheme } } },
                'https://giscus.app'
            );
        }
    }

    /**
     * 테마 토글
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || getCurrentTheme();
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
    }

    /**
     * 테마 토글 버튼 초기화
     */
    function initThemeToggle() {
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleTheme);
        }
    }

    /**
     * 시스템 테마 변경 감지
     */
    function watchSystemTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // 사용자가 직접 설정한 테마가 없을 때만 시스템 테마 따르기
                if (!getStoredTheme()) {
                    applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
                }
            });
        }
    }

    /**
     * 초기화
     */
    function init() {
        // 페이지 로드 전 테마 적용 (깜빡임 방지)
        applyTheme(getCurrentTheme());
        
        // DOM 준비 후 이벤트 리스너 추가
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initThemeToggle();
                watchSystemTheme();
            });
        } else {
            initThemeToggle();
            watchSystemTheme();
        }
    }

    // 즉시 초기화
    init();

    // 전역 API 노출 (필요시 외부에서 사용)
    window.ThemeManager = {
        toggle: toggleTheme,
        get: getCurrentTheme,
        set: function(theme) {
            if (theme === DARK_THEME || theme === LIGHT_THEME) {
                localStorage.setItem(THEME_KEY, theme);
                applyTheme(theme);
            }
        }
    };
})();

