/**
 * Post Loader
 * 마크다운 게시글 로딩 및 파싱
 */

(function() {
    'use strict';

    // DOM 요소
    const postTitle = document.getElementById('post-title');
    const postDate = document.getElementById('post-date');
    const postCategory = document.getElementById('post-category');
    const postTags = document.getElementById('post-tags');
    const postContent = document.getElementById('post-content');
    const postNav = document.getElementById('post-nav');
    const prevPostLink = document.getElementById('prev-post');
    const nextPostLink = document.getElementById('next-post');

    /**
     * URL에서 파일명 파라미터 가져오기
     * @returns {string|null} 파일명
     */
    function getFileFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('file');
    }

    /**
     * Front Matter 파싱
     * @param {string} content - 마크다운 전체 내용
     * @returns {Object} { metadata, content }
     */
    function parseFrontMatter(content) {
        // UTF-8 BOM 제거
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }

        const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        
        if (!frontMatterMatch) {
            return { metadata: {}, content: content };
        }

        const frontMatter = frontMatterMatch[1];
        const postContent = frontMatterMatch[2];
        const metadata = {};

        // 라인별 파싱
        const lines = frontMatter.split(/\r?\n/);
        lines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();

                // 따옴표 제거
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                // 배열 파싱 (tags)
                if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
                    try {
                        value = JSON.parse(value);
                    } catch {
                        value = value.slice(1, -1)
                            .split(',')
                            .map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
                    }
                }

                metadata[key] = value;
            }
        });

        return { metadata, content: postContent };
    }

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
        return `${year}년 ${month}월 ${day}일`;
    }

    /**
     * Marked.js 설정
     */
    function configureMarked() {
        if (typeof marked === 'undefined') {
            console.error('marked.js가 로드되지 않았습니다.');
            return;
        }

        marked.setOptions({
            highlight: function(code, lang) {
                if (typeof Prism !== 'undefined' && lang && Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            },
            breaks: true,
            gfm: true
        });
    }

    /**
     * 마크다운을 HTML로 변환
     * @param {string} markdown - 마크다운 문자열
     * @returns {string} HTML 문자열
     */
    function renderMarkdown(markdown) {
        if (typeof marked === 'undefined') {
            return `<pre>${markdown}</pre>`;
        }
        return marked.parse(markdown);
    }

    /**
     * 게시글 메타데이터 렌더링
     * @param {Object} metadata - 메타데이터 객체
     */
    function renderMetadata(metadata) {
        // 제목
        const title = metadata.title || '제목 없음';
        postTitle.textContent = title;
        document.title = `${title} | maien9890-crypto`;

        // 날짜
        if (metadata.date) {
            postDate.textContent = formatDate(metadata.date);
        }

        // 카테고리
        if (metadata.category) {
            postCategory.textContent = metadata.category;
            postCategory.style.display = 'block';
        } else {
            postCategory.style.display = 'none';
        }

        // 태그
        if (metadata.tags && Array.isArray(metadata.tags)) {
            postTags.innerHTML = metadata.tags
                .map(tag => `<span class="post-tag">${tag}</span>`)
                .join('');
        }

        // 메타 설명
        if (metadata.description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = metadata.description;
            }
        }
    }

    /**
     * 코드 하이라이팅 적용
     */
    function highlightCode() {
        if (typeof Prism !== 'undefined') {
            // Prism autoloader가 언어를 자동 로드하도록 설정
            Prism.highlightAll();
        }
    }

    /**
     * 이전/다음 게시글 네비게이션 설정
     * @param {string} currentFile - 현재 게시글 파일명
     */
    async function setupPostNavigation(currentFile) {
        try {
            const response = await fetch('posts.json');
            if (!response.ok) return;

            const posts = await response.json();
            const currentIndex = posts.findIndex(p => p.file === currentFile);

            if (currentIndex === -1) return;

            postNav.style.display = 'grid';

            // 다음 글 (더 최신 글)
            if (currentIndex > 0) {
                const nextPost = posts[currentIndex - 1];
                nextPostLink.href = `post.html?file=${encodeURIComponent(nextPost.file)}`;
                nextPostLink.querySelector('.post-nav-title').textContent = nextPost.title;
                nextPostLink.style.display = 'flex';
            } else {
                nextPostLink.style.display = 'none';
            }

            // 이전 글 (더 오래된 글)
            if (currentIndex < posts.length - 1) {
                const prevPost = posts[currentIndex + 1];
                prevPostLink.href = `post.html?file=${encodeURIComponent(prevPost.file)}`;
                prevPostLink.querySelector('.post-nav-title').textContent = prevPost.title;
                prevPostLink.style.display = 'flex';
            } else {
                prevPostLink.style.display = 'none';
            }

        } catch (error) {
            console.error('네비게이션 로딩 실패:', error);
        }
    }

    /**
     * Giscus 댓글 로드
     */
    function loadGiscus() {
        const container = document.getElementById('giscus-container');
        if (!container) return;

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'maien9890-crypto/maien9890-crypto.github.io');
        script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // TODO: giscus.app에서 값 복사
        script.setAttribute('data-category', 'General');
        script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // TODO: giscus.app에서 값 복사
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '1');
        script.setAttribute('data-input-position', 'top');
        script.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || 'light');
        script.setAttribute('data-lang', 'ko');
        script.setAttribute('data-loading', 'lazy');
        script.crossOrigin = 'anonymous';
        script.async = true;

        container.appendChild(script);
    }

    /**
     * 게시글 로드
     */
    async function loadPost() {
        const filename = getFileFromURL();

        if (!filename) {
            postContent.innerHTML = `
                <div class="no-results">
                    <p>게시글을 찾을 수 없습니다.</p>
                    <a href="index.html" class="nav-link">목록으로 돌아가기</a>
                </div>
            `;
            return;
        }

        try {
            const response = await fetch(`pages/${filename}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawContent = await response.text();
            const { metadata, content } = parseFrontMatter(rawContent);

            // Marked.js 설정
            configureMarked();

            // 메타데이터 렌더링
            renderMetadata(metadata);

            // 본문 렌더링
            postContent.innerHTML = renderMarkdown(content);

            // 코드 하이라이팅
            highlightCode();

            // 네비게이션 설정
            setupPostNavigation(filename);

            // Giscus 댓글 로드
            loadGiscus();

        } catch (error) {
            console.error('게시글 로딩 실패:', error);
            postContent.innerHTML = `
                <div class="no-results">
                    <p>게시글을 불러오는 데 실패했습니다.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">파일: ${filename}</p>
                    <a href="index.html" class="nav-link" style="margin-top: 1rem; display: inline-block;">목록으로 돌아가기</a>
                </div>
            `;
        }
    }

    /**
     * 초기화
     */
    function init() {
        loadPost();
    }

    // DOM 준비 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

