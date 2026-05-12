let video;
let facemesh;
let predictions = [];

function setup() {
  // 第一步驟：產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // 隱藏原始的 HTML 影片元素
  
  // 初始化最新版 ml5.js FaceMesh 模型
  facemesh = ml5.faceMesh({ maxFaces: 1 });
  facemesh.detectStart(video, results => {
    predictions = results;
  });
}

function draw() {
  // 畫布的背景顏色為 e7c6ff
  background("#e7c6ff");
  
  // 顯示的影像寬高為整個畫布寬高的 50%
  let drawW = width * 0.5;
  let drawH = height * 0.5;
  
  // 擷取的影像產生在畫布的中間
  let drawX = (width - drawW) / 2;
  let drawY = (height - drawH) / 2;
  
  // 在置中上方加入文字
  push();
  fill(0); // 黑色文字
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  text("414730498許銘緯", width / 2, drawY / 2 - 20);
  text("作品為影像辨識_耳環臉譜", width / 2, drawY / 2 + 20);
  pop();

  // 顯示的畫面需要做左右顛倒處理
  push();
  translate(drawX + drawW, drawY);
  scale(-1, 1);
  image(video, 0, 0, drawW, drawH);
  pop();
  
  // 辨識耳垂並畫出耳環
  drawEarrings(drawX, drawY, drawW, drawH);
}

function drawEarrings(drawX, drawY, drawW, drawH) {
  let vw = video.width || 640;
  let vh = video.height || 480;

  for (let i = 0; i < predictions.length; i += 1) {
    let face = predictions[i];
    let leftEarlobe, rightEarlobe;
    
    // 取得左右耳垂座標，177 與 401 分別對應 FaceMesh 的左右耳垂索引（適用於最新版 ml5.js）
    leftEarlobe = [face.keypoints[177].x, face.keypoints[177].y];
    rightEarlobe = [face.keypoints[401].x, face.keypoints[401].y];

    if (leftEarlobe && rightEarlobe) {
      // 計算在畫布上的實際座標（考量到影像已經左右顛倒與 50% 縮放比例）
      let leftX = drawX + drawW - (leftEarlobe[0] / vw) * drawW;
      let leftY = drawY + (leftEarlobe[1] / vh) * drawH;
      
      let rightX = drawX + drawW - (rightEarlobe[0] / vw) * drawW;
      let rightY = drawY + (rightEarlobe[1] / vh) * drawH;
      
      // 在耳垂位置畫出三個黃色圓圈
      drawThreeCircles(leftX, leftY);
      drawThreeCircles(rightX, rightY);
    }
  }
}

function drawThreeCircles(x, y) {
  fill(255, 255, 0); // 黃色
  noStroke();
  let d = 12; // 圓圈直徑
  let spacing = 15; // 圓圈垂直間距
  
  // 由耳垂位置往下顯示三個圓圈，類似一個耳環樣子
  for (let j = 0; j < 3; j++) {
    circle(x, y + j * spacing, d);
  }
}

function windowResized() {
  // 確保視窗大小改變時，畫布大小也會跟著調整
  resizeCanvas(windowWidth, windowHeight);
}
