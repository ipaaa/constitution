const DISCUSSIONS_DATA = [
    {
        tag: "司改會",
        title: "司改會",
        desc: "司改會憲庭協助策警察的短影者，因此有祕會文流會飽的文法重訓議。",
        linkText: "觀看短影音 >",
        link: "https://www.facebook.com/reel/1702284921181677"
    },
    {
        tag: "法白",
        title: "法白",
        desc: "法白憲庭教育幾者，加人學看知識，法官遊白影響。",
        linkText: "查看貼文 >",
        link: "#"
    },
    {
        tag: "經民連",
        title: "經民連",
        desc: "經民連主要外流程，講座政府的讓人誰言，並組同期不關察，官看更新的績。",
        linkText: "查看貼文 >",
        link: "#"
    },
    {
        tag: "憲法法庭",
        title: "憲法法庭",
        desc: "了解憲法法庭的基本運作與最新公告，掌握判決背後的法律精神。",
        linkText: "進入法庭 >",
        link: "#"
    }
];

function renderArticles() {
    const container = document.getElementById('articles-container');
    if (!container) return;

    // We keep the first static card in HTML and append the dynamic ones
    DISCUSSIONS_DATA.forEach(item => {
        const card = document.createElement('div');
        card.className = 'content-card';
        
        card.innerHTML = `
            <div class="tag-badge">${item.tag}</div>
            <div class="card-title-box">
                <h3>${item.title}</h3>
            </div>
            <div class="card-desc">
                <p>${item.desc}</p>
            </div>
            <a href="${item.link}" target="_blank" class="btn-more">${item.linkText}</a>
        `;
        
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', renderArticles);
