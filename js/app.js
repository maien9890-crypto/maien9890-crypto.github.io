/**
 * Main Application
 * 게시글 목록 로딩 및 필터링
 */

(function() {
    'use strict';

    // 상태 관리
    let allPosts = [];
    let filteredPosts = [];
    let activeTag = null;

    // DOM 요소
    const postsContainer = document.getElementById('posts-container');
    const tagsContainer = document.getElementById('tags-container');
    const loadingElement = document.getElementById('loading');
    const noResultsElement = document.getElementById('no-results');

    /**
     * 날짜 포맷팅
     * @param {string} dateStr - ISO 날짜 문자열
     * @returns {string} 포맷된 날짜
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    /**
     * 게시글 카드 HTML 생성
     * @param {Object} post - 게시글 데이터
     * @returns {string} HTML 문자열
     */
    function createPostCard(post) {
        const tagsHtml = post.tags
            .map(tag => `<span class="post-item-tag">${tag}</span>`)
            .join('');

        return `
            <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-item">
                <div class="post-item-header">
                    <h2 class="post-item-title">${escapeHtml(post.title)}</h2>
                    <time class="post-item-date">${formatDate(post.date)}</time>
                </div>
                ${post.excerpt ? `<p class="post-item-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
                <div class="post-item-footer">
                    ${post.category ? `<span class="post-item-category">${escapeHtml(post.category)}</span>` : ''}
                    <div class="post-item-tags">${tagsHtml}</div>
                </div>
            </a>
        `;
    }

    /**
     * HTML 이스케이프
     * @param {string} text - 원본 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 태그 목록 추출 및 카운트
     * @param {Array} posts - 게시글 배열
     * @returns {Array} 태그 객체 배열 [{name, count}]
     */
    function extractTags(posts) {
        const tagCounts = {};
        
        posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(tagCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * 태그 버튼 생성
     * @param {Object} tag - 태그 객체
     * @returns {HTMLElement} 태그 버튼 요소
     */
    function createTagButton(tag) {
        const button = document.createElement('button');
        button.className = 'tag';
        button.dataset.tag = tag.name;
        button.innerHTML = `${tag.name}<span class="tag-count">${tag.count}</span>`;
        
        button.addEventListener('click', () => {
            toggleTagFilter(tag.name);
        });

        return button;
    }

    /**
     * 태그 필터 토글
     * @param {string} tagName - 태그 이름
     */
    function toggleTagFilter(tagName) {
        if (activeTag === tagName) {
            activeTag = null;
        } else {
            activeTag = tagName;
        }

        updateTagButtons();
        filterPosts();
    }

    /**
     * 태그 버튼 상태 업데이트
     */
    function updateTagButtons() {
        const tagButtons = tagsContainer.querySelectorAll('.tag');
        tagButtons.forEach(button => {
            if (button.dataset.tag === activeTag) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * 게시글 필터링
     * @param {string} searchQuery - 검색어 (선택적)
     */
    function filterPosts(searchQuery = '') {
        const query = searchQuery.toLowerCase().trim();

        filteredPosts = allPosts.filter(post => {
            // 태그 필터
            if (activeTag && (!post.tags || !post.tags.includes(activeTag))) {
                return false;
            }

            // 검색어 필터
            if (query) {
                const titleMatch = post.title.toLowerCase().includes(query);
                const excerptMatch = post.excerpt && post.excerpt.toLowerCase().includes(query);
                const tagMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(query));
                const categoryMatch = post.category && post.category.toLowerCase().includes(query);

                return titleMatch || excerptMatch || tagMatch || categoryMatch;
            }

            return true;
        });

        renderPosts();
    }

    /**
     * 게시글 렌더링
     */
    function renderPosts() {
        if (filteredPosts.length === 0) {
            postsContainer.innerHTML = '';
            noResultsElement.style.display = 'block';
        } else {
            noResultsElement.style.display = 'none';
            postsContainer.innerHTML = filteredPosts.map(createPostCard).join('');
        }
    }

    /**
     * 태그 렌더링
     */
    function renderTags() {
        const tags = extractTags(allPosts);
        tagsContainer.innerHTML = '';
        
        tags.forEach(tag => {
            tagsContainer.appendChild(createTagButton(tag));
        });
    }

    /**
     * 게시글 데이터 로드
     */
    async function loadPosts() {
        try {
            const response = await fetch('posts.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            allPosts = await response.json();
            filteredPosts = [...allPosts];

            // 로딩 숨기기
            loadingElement.style.display = 'none';

            // 렌더링
            renderTags();
            renderPosts();

        } catch (error) {
            console.error('게시글 로딩 실패:', error);
            loadingElement.innerHTML = `
                <p>게시글을 불러오는 데 실패했습니다.</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">posts.json 파일을 확인해주세요.</p>
            `;
        }
    }

    /**
     * 초기화
     */
    function init() {
        loadPosts();

        // 검색 기능을 위한 전역 API 노출
        window.BlogApp = {
            filterPosts: filterPosts,
            getAllPosts: () => allPosts,
            getFilteredPosts: () => filteredPosts,
            clearTagFilter: () => {
                activeTag = null;
                updateTagButtons();
                filterPosts();
            }
        };
    }

    // DOM 준비 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

