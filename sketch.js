let video;
let noCamera = false;
let errorMsg = '';
let faceMesh;
let faces = [];

function preload() {
  // 推薦在 preload 中預先載入 ml5 v1.0 的模型
  faceMesh = ml5.faceMesh({ maxFaces: 1 });
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 指定前鏡頭並明確設定 audio: false
  // 避免在沒有麥克風的裝置上導致 createCapture 失敗，使畫面無法顯示
  let constraints = { audio: false, video: { facingMode: 'user' } };
  video = createCapture(constraints, () => {
    // video 準備好之後開始偵測
    faceMesh.detectStart(video, gotFaces);
  });

  video.elt.addEventListener('error', () => {
    noCamera = true;
    errorMsg = '無法開啟攝影機';
  });
  video.hide();
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background('#e7c6ff');

  if (noCamera) {
    fill(80);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text(errorMsg, width / 2, height / 2);
    return;
  }

  // 確保 video 已經載入且有影像尺寸，避免讀取到 0 造成畫面異常
  if (!video || video.elt.videoWidth === 0) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("載入中...", width / 2, height / 2);
    return;
  }

  // 使用實際影像解析度做座標映射
  let vw = video.elt.videoWidth;
  let vh = video.elt.videoHeight;

  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  imageMode(CENTER);
  image(video, 0, 0, width * 0.5, height * 0.5);

  if (faces.length > 0 && vw > 0) {
    // 177 右耳垂，401 左耳垂（MediaPipe FaceMesh 標準索引）
    let earlobes = [faces[0].keypoints[177], faces[0].keypoints[401]];

    fill(255, 255, 0);
    noStroke();

    for (let ear of earlobes) {
      if (!ear) continue;

      let x = map(ear.x, 0, vw, -width * 0.25, width * 0.25);
      let y = map(ear.y, 0, vh, -height * 0.25, height * 0.25);

      for (let i = 1; i <= 3; i++) {
        circle(x, y + i * 15, 10);
      }
    }
  }
  pop();

  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(32);
  text("414730936 陸柏安", width / 2, 30);
  textSize(24);
  text("作品為影像辨識_耳環臉譜", width / 2, 70);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}