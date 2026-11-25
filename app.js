// 關卡設定：x, y 為手繪地圖上的百分比位置 (0~100)
const quests = [
  {
    id: 1,
    shortName: '老街溪水岸',
    icon: '🏞️',
    x: 28, // 對應 SVG 座標 (84/300)
    y: 26, // 對應 SVG 座標 (104/400)
    lat: 24.9555,
    lng: 121.2240,
    title: '第一站：老街溪畔的時光記憶',
    story: '中壢舊稱「澗仔壢」，早年因為溪流交匯而繁榮。你正站在老街溪水岸旁，尋找當年商旅往來的痕跡...',
    question: '【現場謎題】請走到老街溪河川教育中心附近，觀察建築外牆或招牌，請問「河川」的英文單字是什麼？（測試通關請輸入 RIVER）',
    answer: 'RIVER',
    hints: [
      '提示 1：不需要走進室內，看建築物正面的英文標示。',
      '提示 2：共 5 個英文字母，直接輸入 RIVER 即可過關！'
    ],
    lore: '🎉 蓋章成功！獲得「水岸探索者」徽章！\n【城市小故事】老街溪過去曾被加蓋變成商場，後來重新掀蓋整治，變成現在中壢人最愛散步的親水綠廊！\n👉 手繪地圖上的虛線已經延伸到下一站囉！'
  },
  {
    id: 2,
    shortName: '百年酥糖鋪',
    icon: '🏮',
    x: 72, // 對應 SVG 座標 (216/300)
    y: 51, // 對應 SVG 座標 (204/400)
    lat: 24.9585,
    lng: 121.2215,
    title: '第二站：百年紅磚與傳統滋味',
    story: '穿過小橋沿著老街往市區走，空氣中飄來陣陣紅燒牛肉麵與花生酥糖的香氣，這裡藏著中壢最道地的老字號靈魂。',
    question: '【現場謎題】找到中壢知名的老牌花生酥糖店，看看店門口招牌上創立於西元哪一年？（測試通關請輸入 1929）',
    answer: '1929',
    hints: [
      '提示 1：抬頭看店面最上方的大招牌角落。',
      '提示 2：測試通關密碼請輸入 1929。'
    ],
    lore: '🎉 蓋章成功！獲得「老街美食家」徽章！\n【城市小故事】中壢有三寶：「牛肉麵、花生酥糖、鐮刀」！早年因為農業發達，打鐵業與傳統糕餅業非常興盛。'
  },
  {
    id: 3,
    shortName: '秘密市民廣場',
    icon: '🎪',
    x: 40, // 對應 SVG 座標 (120/300)
    y: 81, // 對應 SVG 座標 (324/400)
    lat: 24.9565,
    lng: 121.2265,
    title: '最終站：廣場上的寶藏聚會',
    story: '你已經蒐集了這座城市的歷史與味道，最後的寶藏箱就藏在熱鬧的市民廣場旁！',
    question: '【最終謎題】中壢早年的古地名叫做什麼？（三個字：＿仔＿）',
    answer: '澗仔壢',
    hints: [
      '提示 1：第一站的故事開頭有提到喔！',
      '提示 2：答案就是「澗仔壢」。'
    ],
    lore: '🏆 恭喜完成《澗仔壢尋寶手札》全部關卡！\n你已經成功解鎖這座城市的秘密！快把這張蓋滿印章的手繪地圖截圖分享給朋友吧！'
  }
];

let clearedCount = parseInt(localStorage.getItem('handdrawn_quest_cleared') || '0', 10);
let currentQuestIndex = null;
let currentHintStep = 0;

function renderGameMap() {
  const container = document.getElementById('nodes-container');
  container.innerHTML = '';

  document.getElementById('score').textContent = clearedCount;
  document.getElementById('total').textContent = quests.length;

  // 點亮已走過的尋寶虛線路徑
  const path12 = document.getElementById('path-1-2');
  const path23 = document.getElementById('path-2-3');
  if (path12) path12.setAttribute('stroke', clearedCount >= 1 ? '#f59e0b' : '#cbbba0');
  if (path23) path23.setAttribute('stroke', clearedCount >= 2 ? '#f59e0b' : '#cbbba0');

  quests.forEach((q, index) => {
    const isCleared = index < clearedCount;
    const isActive = index === clearedCount;
    const isLocked = index > clearedCount;

    const node = document.createElement('div');
    node.className = 'map-node ' + (isCleared ? 'node-cleared' : isActive ? 'node-active' : 'node-locked');
    node.style.left = q.x + '%';
    node.style.top = q.y + '%';

    // 未解鎖關卡顯示問號迷霧，解鎖後顯示可愛手繪圖示
    const displayIcon = isLocked ? '❓' : q.icon;
    const displayLabel = isLocked ? `關卡 ${q.id}（未解鎖）` : q.shortName;
    const stampHtml = isCleared ? `<div class="stamp-badge">已破關</div>` : '';

    node.innerHTML = `
      <div class="node-icon">
        ${displayIcon}
        ${stampHtml}
      </div>
      <div class="node-label">${displayLabel}</div>
    `;

    node.onclick = () => {
      if (isLocked) {
        alert('🔒 這個地點還在迷霧中！請先解開上一關的謎題喔！');
        return;
      }
      openQuest(index);
    };

    container.appendChild(node);
  });
}

function openQuest(index) {
  currentQuestIndex = index;
  currentHintStep = 0;
  const q = quests[index];
  const isCleared = index < clearedCount;

  document.getElementById('q-stage').textContent = isCleared ? `✅ 已獲得徽章｜第 ${q.id} 站` : `🔥 探索中｜第 ${q.id} 站`;
  document.getElementById('q-title').textContent = q.title;
  document.getElementById('q-story').textContent = q.story;
  document.getElementById('q-question').textContent = q.question;
  document.getElementById('q-nav').href = `https://www.google.com/maps/dir/?api=1&destination=${q.lat},${q.lng}`;

  const hintBox = document.getElementById('hint-box');
  hintBox.style.display = 'none';
  hintBox.innerHTML = '';
  document.getElementById('hint-btn').style.display = isCleared ? 'none' : 'inline-block';

  const loreBox = document.getElementById('city-lore');
  const answerArea = document.getElementById('answer-area');

  if (isCleared) {
    answerArea.style.display = 'none';
    loreBox.style.display = 'block';
    loreBox.innerText = q.lore;
  } else {
    answerArea.style.display = 'flex';
    document.getElementById('q-input').value = '';
    loreBox.style.display = 'none';
  }

  document.getElementById('modal-backdrop').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-backdrop').style.display = 'none';
}

function showNextHint() {
  const q = quests[currentQuestIndex];
  const hintBox = document.getElementById('hint-box');
  hintBox.style.display = 'block';

  if (currentHintStep < q.hints.length) {
    hintBox.innerHTML += `<div>• ${q.hints[currentHintStep]}</div>`;
    currentHintStep++;
  } else {
    hintBox.innerHTML += `<div>• <strong>終極解答：${q.answer}</strong></div>`;
    document.getElementById('hint-btn').style.display = 'none';
  }
}

function checkAnswer() {
  const q = quests[currentQuestIndex];
  const userAns = document.getElementById('q-input').value.trim().toUpperCase();
  const correctAns = q.answer.trim().toUpperCase();

  if (!userAns) {
    alert('請先輸入你的答案喔！');
    return;
  }

  if (userAns === correctAns) {
    if (currentQuestIndex === clearedCount) {
      clearedCount++;
      localStorage.setItem('handdrawn_quest_cleared', clearedCount.toString());
    }

    document.getElementById('answer-area').style.display = 'none';
    document.getElementById('hint-btn').style.display = 'none';
    document.getElementById('q-stage').textContent = `✅ 破關蓋章｜第 ${q.id} 站`;

    const loreBox = document.getElementById('city-lore');
    loreBox.style.display = 'block';
    loreBox.innerText = q.lore;

    renderGameMap(); // 重新畫地圖：蓋上紅印章、點亮橘色虛線、解鎖下一站！
  } else {
    alert('❌ 密碼不對喔！再觀察一下線索，或點擊「偷看錦囊提示」吧！');
  }
}

function resetGame() {
  if (confirm('確定要清除所有徽章與破關紀錄，重新開始尋寶嗎？')) {
    localStorage.removeItem('handdrawn_quest_cleared');
    clearedCount = 0;
    closeModal();
    renderGameMap();
  }
}

// 啟動手繪尋寶地圖
renderGameMap();
