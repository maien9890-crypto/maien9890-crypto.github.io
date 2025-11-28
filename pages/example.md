---
title: "GitHub Pages 블로그에 오신 것을 환영합니다"
date: 2025-01-26
tags: ["Blog", "GitHub Pages", "Markdown"]
category: "Getting Started"
description: "GitHub Pages와 마크다운으로 만든 정적 블로그입니다."
---

# 블로그에 오신 것을 환영합니다! 🎉

이 블로그는 **GitHub Pages**와 순수 **HTML, CSS, JavaScript**로 만들어졌습니다.
별도의 빌드 도구나 프레임워크 없이 마크다운 파일만으로 게시글을 작성할 수 있습니다.

## 주요 기능

### 1. 마크다운 지원

일반 마크다운 문법을 모두 지원합니다:

- **굵은 글씨**와 *기울임*
- [링크](https://github.com)
- 리스트와 번호 목록
- 인용구와 코드 블록

### 2. 코드 하이라이팅

Prism.js를 사용하여 다양한 언어의 코드 하이라이팅을 지원합니다:

```javascript
// JavaScript 예제
function greet(name) {
    console.log(`Hello, ${name}!`);
}

greet('World');
```

```python
# Python 예제
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120
```

```css
/* CSS 예제 */
.container {
    max-width: 720px;
    margin: 0 auto;
    padding: 1.5rem;
}
```

### 3. 다크/라이트 모드

우측 상단의 테마 토글 버튼을 클릭하거나, 시스템 설정에 따라 자동으로 테마가 전환됩니다.

### 4. 댓글 시스템

[Giscus](https://giscus.app)를 통해 GitHub Discussions 기반의 댓글 시스템을 사용합니다.
GitHub 계정으로 로그인하여 댓글을 남길 수 있습니다.

## 새 게시글 작성하기

1. `pages/` 폴더에 `.md` 파일을 생성합니다.
2. 파일 상단에 Front Matter를 작성합니다:

```markdown
---
title: "게시글 제목"
date: 2025-01-26
tags: ["태그1", "태그2"]
category: "카테고리"
description: "게시글 설명"
---

본문 내용...
```

3. `git push`하면 GitHub Actions가 자동으로 배포합니다.

## 인용구

> 코드는 한 번 작성하면 여러 번 읽힌다.
> 따라서 읽기 쉽게 작성하는 것이 중요하다.

## 테이블

| 기능 | 설명 | 지원 |
|------|------|------|
| 마크다운 | marked.js 사용 | ✅ |
| 코드 하이라이팅 | Prism.js 사용 | ✅ |
| 댓글 | Giscus 사용 | ✅ |
| 검색 | 클라이언트 사이드 | ✅ |

## 마무리

이 블로그는 완전히 정적인 사이트로, 서버가 필요 없고 GitHub Pages에서 무료로 호스팅됩니다.
마음껏 커스터마이징하고 자신만의 블로그를 만들어보세요!

즐거운 블로깅 되세요! 🚀

