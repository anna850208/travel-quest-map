// 初始化地圖
const map = L.map('map').setView([24.9576, 121.2251], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 關卡資料庫（依序解鎖：解開第 1 關才會在地圖上出現第 2 關！）
const quests = [
  {
    id: 1,
    title: '第一關：老街溪畔的時光記憶',
    lat: 24.9555,
    lng: 121.2240,
    story: '中壢舊稱「澗仔壢」，早年因為溪流交匯與交通要道而繁榮。你正站在老街溪沿岸，尋找當年商旅往來的痕跡...',
    question: '【現場謎題】請走到老街溪河川教育中心附近，觀察建築外牆或招牌，請問「河川教育中心」這幾個字旁邊的英文縮寫是什麼？（提示：3個英文字母）',
    answer: 'RIVER', // 系統會自動轉大寫比對，不區分大小寫
    hints: [
      '提示 1：不需要走進室內，在建築物正面的大招牌上就能看到。',
      '提示 2：英文單字是「河流」的意思，共 5 個字母（範例演示請輸入 RIVER）。'
    ],
    lore: '🎉 恭喜破關！\n【認識這座城市】老街溪過去曾被加蓋變成商場，後來重新掀蓋整治，成為現在中壢人最愛散步的親水綠廊！\n👉 下一關的座標已經在地圖上解鎖囉！'
  },
  {
    id: 2,
    title: '第二關：百年紅磚與傳統滋味',
    lat: 24.9585,
    lng: 121.2215,
    story: '沿著老街往市區走，空氣中飄來陣陣紅燒牛肉麵與花生酥糖的香氣，這裡藏著中壢最道地的老字號靈魂。',
    question: '【現場謎題】找到中壢知名的老牌花生酥糖店（如新珍香），看看店門口招牌上創立於民國幾年？（請輸入數字，測試請輸入 1929）',
    answer: '1929',
    hints: [
      '提示 1：抬頭看店面最上方的大招牌角落，通常會寫著「創立於...」。',
      '提示 2：測試通關密碼請直接輸入 1929 即可過關！'
    ],
    lore: '🎉 恭喜破關！\n【認識這座城市】中壢有三寶：「牛肉麵、花生酥糖、鐮刀」！早年因為農業發達，打鐵業與傳統糕餅業非常興盛。\n👉 繼續前往最後一關吧！'
  },
  {
    id: 3,
    title: '最終關：廣場上的秘密聚會',
    lat: 24.9565,
    lng: 121.2265,
    story: '你已經蒐集了這座城市的歷史與味道，最後的寶藏就藏在熱鬧的市民廣場旁！',
    question: '【最終謎題】中壢早年的古地名叫做什麼？（三個字：＿仔＿）',
    answer: '澗仔壢',
    hints: [
      '提示 1：第一關的故事裡其實有偷偷提到喔！',
      '提示 2：答案是「澗仔壢」。'
    ],
    lore: '🏆 恭喜完成《中壢時光尋寶記》全部關卡！\n你已經成功解鎖這座城市的秘密！快把破關畫面截圖分享給朋友，或邀請他們一起來挑戰吧！'
  }
];

// 讀取玩家進度（已通過幾關）
let clearedCount = parseInt(localStorage.getItem('city_quest_cleared') || '0', 10);
let currentQuestIndex = null;
let currentHintStep = 0;
let markers = [];

function renderMap() {
  // 清除舊圖釘
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  document.getElementById('score').textContent = clearedCount;
  document.getElementById('total').textContent = quests.length;

  quests.forEach((q, index) => {
    // 迷霧機制：只顯示「已破關的關卡」以及「目前正在挑戰的那一關」
    if (index <= clearedCount) {
      const isCleared = index < clearedCount;
      const marker = L.marker([q.lat, q.lng]).addTo(map);
      
      marker.bindTooltip(isCleared ? `✅ ${q.title}` : `🔥 ${q.title}`, {
        permanent: true,
        direction: 'top',
        offset: [0, -28]
      });

      marker.on('click', () => openQuest(index));
      markers.push(marker);

      // 自動將鏡頭聚焦在最新解鎖的關卡
      if (index === clearedCount) {
        map.flyTo([q.lat, q.lng], 15);
      }
    }
  });
}

function openQuest(index) {
  currentQuestIndex = index;
  currentHintStep = 0;
  const q = quests[index];
  const isCleared = index < clearedCount;

  document.getElementById('q-stage').textContent = isCleared ? `✅ 已破關｜關卡 ${q.id}` : `🔥 進行中｜關卡 ${q.id}`;
  document.getElementById('q-title').textContent = q.title;
  document.getElementById('q-story').textContent = q.story;
  document.getElementById('q-question').textContent = q.question;
  document.getElementById('q-nav').href = `https://www.google.com/maps/dir/?api=1&destination=${q.lat},${q.lng}`;

  // 重置提示框與輸入框
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

  document.getElementById('quest-modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('quest-modal').style.display = 'none';
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
    // 答對了！解鎖下一關
    if (currentQuestIndex === clearedCount) {
      clearedCount++;
      localStorage.setItem('city_quest_cleared', clearedCount.toString());
    }
    
    document.getElementById('answer-area').style.display = 'none';
    document.getElementById('hint-btn').style.display = 'none';
    document.getElementById('q-stage').textContent = `✅ 破關成功｜關卡 ${q.id}`;
    
    const loreBox = document.getElementById('city-lore');
    loreBox.style.display = 'block';
    loreBox.innerText = q.lore;

    renderMap(); // 重新渲染地圖，讓下一關的圖釘跳出來！
  } else {
    alert('❌ 答案不對喔！再仔細觀察一下現場線索，或點擊「需要提示嗎？」看看吧！');
  }
}

function resetGame() {
  if (confirm('確定要清除所有破關紀錄，從第一關重新開始嗎？')) {
    localStorage.removeItem('city_quest_cleared');
    clearedCount = 0;
    closeModal();
    renderMap();
  }
}

// 啟動遊戲
renderMap();
