/**
 * Search Module
 * 클라이언트 사이드 검색 기능
 */

(function() {
    'use strict';

    // DOM 요소
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');

    // 디바운스 타이머
    let debounceTimer = null;
    const DEBOUNCE_DELAY = 300;

    /**
     * 검색 실행
     * @param {string} query - 검색어
     */
    function performSearch(query) {
        if (window.BlogApp && typeof window.BlogApp.filterPosts === 'function') {
            window.BlogApp.filterPosts(query);
        }
    }

    /**
     * 디바운스된 검색
     * @param {string} query - 검색어
     */
    function debouncedSearch(query) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(query);
        }, DEBOUNCE_DELAY);
    }

    /**
     * 검색어 지우기 버튼 표시/숨김
     * @param {string} query - 현재 검색어
     */
    function toggleClearButton(query) {
        if (searchClear) {
            searchClear.style.display = query.length > 0 ? 'flex' : 'none';
        }
    }

    /**
     * 검색어 지우기
     */
    function clearSearch() {
        if (searchInput) {
            searchInput.value = '';
            toggleClearButton('');
            performSearch('');
            searchInput.focus();
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    function setupEventListeners() {
        if (searchInput) {
            // 입력 이벤트
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                toggleClearButton(query);
                debouncedSearch(query);
            });

            // 키보드 이벤트
            searchInput.addEventListener('keydown', (e) => {
                // Escape 키로 검색어 지우기
                if (e.key === 'Escape') {
                    clearSearch();
                }
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', clearSearch);
        }

        // 키보드 단축키 (/ 키로 검색창 포커스)
        document.addEventListener('keydown', (e) => {
            // 입력 필드에 포커스가 없을 때만
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    /**
     * URL 파라미터에서 검색어 가져오기
     */
    function getSearchQueryFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('q') || '';
    }

    /**
     * 초기화
     */
    function init() {
        setupEventListeners();

        // URL에서 검색어 가져와서 적용
        const urlQuery = getSearchQueryFromURL();
        if (urlQuery && searchInput) {
            searchInput.value = urlQuery;
            toggleClearButton(urlQuery);
            
            // BlogApp이 로드된 후 검색 실행
            const checkBlogApp = setInterval(() => {
                if (window.BlogApp) {
                    clearInterval(checkBlogApp);
                    performSearch(urlQuery);
                }
            }, 100);

            // 5초 후 타임아웃
            setTimeout(() => clearInterval(checkBlogApp), 5000);
        }
    }

    // DOM 준비 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 전역 API 노출
    window.SearchModule = {
        search: performSearch,
        clear: clearSearch
    };
})();

