let video;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let accImgs = {};
let currentAcc = 1; // 預設顯示第一個耳環

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1 });
  handPose = ml5.handPose({ maxHands: 1 });
  
  // 預先載入指定的五張耳環圖片
  accImgs[1] = loadImage('pic/acc/acc1_ring.png');
  accImgs[2] = loadImage('pic/acc/acc2_pearl.png');
  accImgs[3] = loadImage('pic/acc/acc3_tassel.png');
  accImgs[4] = loadImage('pic/acc/acc4_jade.png');
  accImgs[5] = loadImage('pic/acc/acc5_phoenix.png');
}

function setup() {
  // 第一步驟：產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  let constraints = { audio: false, video: { facingMode: 'user' } };
  video = createCapture(constraints, () => {
    faceMesh.detectStart(video, gotFaces);
    handPose.detectStart(video, gotHands);
  });
  video.hide();
}

// 取得臉部特徵點資料
function gotFaces(results) {
  faces = results;
}

// 取得手部特徵點資料並計算伸出的手指數量
function gotHands(results) {
  hands = results;
  if (hands.length > 0) {
    let hand = hands[0];
    let fingers = 0;
    
    // 食指、中指、無名指、小拇指 (指尖索引 8, 12, 16, 20；第二關節 6, 10, 14, 18)
    // 如果指尖的 Y 座標比關節的 Y 座標小（表示朝上伸直），就算一根手指
    let tips = [8, 12, 16, 20];
    let pips = [6, 10, 14, 18];
    for (let i = 0; i < 4; i++) {
      if (hand.keypoints[tips[i]].y < hand.keypoints[pips[i]].y) {
        fingers++;
      }
    }
    
    // 大拇指 (計算指尖到手腕距離，大於拇指根部到手腕的距離，視為伸直)
    let dTip = dist(hand.keypoints[4].x, hand.keypoints[4].y, hand.keypoints[0].x, hand.keypoints[0].y);
    let dBase = dist(hand.keypoints[2].x, hand.keypoints[2].y, hand.keypoints[0].x, hand.keypoints[0].y);
    if (dTip > dBase * 1.3) {
      fingers++;
    }
    
    // 依據手指數量 1~5 切換目前選擇的耳環
    if (fingers >= 1 && fingers <= 5) {
      currentAcc = fingers;
    }
  }
}

function draw() {
  // 第一步驟：畫布背景顏色為 e7c6ff
  background('#e7c6ff');

  // 第三步驟：置中上方顯示指定文字
  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(32);
  text("123456789陳OO", width / 2, 30);
  textSize(24);
  text("作品為影像辨識_耳環臉譜", width / 2, 70);

  if (!video || video.elt.videoWidth === 0) {
    return;
  }

  let vw = video.elt.videoWidth;
  let vh = video.elt.videoHeight;
  
  // 影像寬高為整個畫布寬高的 50%
  let drawW = width * 0.5;
  let drawH = height * 0.5;

  push();
  translate(width / 2, height / 2);
  // 左右顛倒處理 (Mirror)
  scale(-1, 1);
  imageMode(CENTER);
  image(video, 0, 0, drawW, drawH);

  if (faces.length > 0) {
    let face = faces[0];
    // 取得右耳垂 (177) 與左耳垂 (401)
    let rightEar = face.keypoints[177];
    let leftEar = face.keypoints[401];

    if (rightEar && leftEar) {
      let faceCenter = (rightEar.x + leftEar.x) / 2;
      let img = accImgs[currentAcc];

      // 定義一個函式來畫耳環
      let drawEarring = (earPt) => {
        // 將影片座標 mapping 到我們縮放的繪製座標上
        let ex = map(earPt.x, 0, vw, -drawW / 2, drawW / 2);
        let ey = map(earPt.y, 0, vh, -drawH / 2, drawH / 2);
        
        // 用兩耳之間的距離當作基準比率，計算耳環大小
        let faceWidthDist = dist(rightEar.x, rightEar.y, leftEar.x, leftEar.y);
        let realFaceW = faceWidthDist * (drawW / vw); // 轉換為畫布尺度
        let accSize = realFaceW * 0.4; // 耳環大小比例
        
        // 往外移動：如果在影片中 x > 中心，表示是人臉左邊(畫面上右邊)，要再加 X 往外。
        let dirX = (earPt.x > faceCenter) ? 1 : -1;
        let shiftX = realFaceW * 0.06 * dirX; 
        // 往上移動 (螢幕 y 往上是負)
        let shiftY = -realFaceW * 0.05;
        
        if (img) {
          image(img, ex + shiftX, ey + shiftY, accSize, accSize);
        }
      };

      drawEarring(rightEar);
      drawEarring(leftEar);
    }
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}