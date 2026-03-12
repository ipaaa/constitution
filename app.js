const DISCUSSIONS_DATA = [
    {
        "author": "黃丞儀",
        "title": "台灣民主的潘朵拉盒子 —— 憲法法庭面臨的正當性危機",
        "date": "2025/12/30",
        "summary": "分析憲法法庭在政治與法律拉扯中的正當性挑戰。",
        "type": "深度評論"
    },
    {
        "author": "蘇彥圖",
        "title": "《114年憲判字第1號判決》的艱難：一個初步的評論",
        "date": "2026/1/2",
        "summary": "針對本次判決的程序難點與法律解釋進行初步反思。",
        "type": "專業短評"
    },
    {
        "author": "張娟芬",
        "title": "憲法法庭，歡迎回來 —— 兼評114年憲判字第1號判決",
        "date": "2026/1/14",
        "summary": "專欄評述憲法法庭的回歸與本次判決的實質意義。",
        "type": "專欄文章"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderArticles(DISCUSSIONS_DATA);
});

function renderArticles(data) {
    const container = document.getElementById('articles-container');
    if (!container) return;
    container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            <div class="card-meta">
                <span class="type-tag">${item.type}</span>
                <span class="date">${item.date}</span>
            </div>
            <h4 class="card-title">${item.title}</h4>
            <div class="author-info">
                <strong>作者：${item.author}</strong>
            </div>
            <p class="card-summary">${item.summary}</p>
            <a href="#" class="btn-read">閱讀全文 →</a>
        `;
        container.appendChild(card);
    });
}
