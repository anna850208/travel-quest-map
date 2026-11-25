// 初始化地圖（預設中心點設在桃園中壢附近，可自行替換座標）
const map = L.map('map').setView([24.9576, 121.2251], 13);

// 載入免費開源的 OpenStreetMap 圖層
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 關卡／足跡資料清單
const checkpoints = [
  {
    id: 'spot-1',
    title: '第一站：中壢老街探索',
    lat: 24.9555,
    lng: 121.2240,
    clue: '找出老街旁最具代表性的傳統小吃店，在心裡默念店名就算完成！'
  },
  {
    id: 'spot-2',
    title: '第二站：綠意公園打卡點',
    lat: 24.9620,
    lng: 121.2180,
    clue: '拍下一張公園裡的光影照片，記錄你的探索足跡。'
  }
];

// 從瀏覽器 localStorage 讀取已解鎖紀錄
const unlocked = new Set(JSON.parse(localStorage.getItem('unlocked_spots') || '[]'));

function updateCounter() {
  document.getElementById('score').textContent = unlocked.size;
  document.getElementById('total').textContent = checkpoints.length;
}

checkpoints.forEach((spot) => {
  const marker = L.marker([spot.lat, spot.lng]).addTo(map);
  const isDone = unlocked.has(spot.id);

  const popupContent = `
    <div>
      <strong>${spot.title}</strong><br/>
      <p style="margin:6px 0;">${spot.clue}</p>
      <button onclick="completeSpot('${spot.id}')" style="padding:6px 10px;cursor:pointer;">
        ${isDone ? '✅ 已完成解鎖' : '完成此關卡'}
      </button>
    </div>
  `;
  marker.bindPopup(popupContent);
});

window.completeSpot = function (id) {
  unlocked.add(id);
  localStorage.setItem('unlocked_spots', JSON.stringify([...unlocked]));
  updateCounter();
  alert('關卡解鎖成功！足跡已保存在你的瀏覽器中。');
};

updateCounter();
