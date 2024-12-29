let sprites = {
  player1: {
    idle: {
      img: null,
      width: 81,
      height: 93,
      frames: 9
    },
    walk: {
      img: null,
      width: 44,
      height: 90,
      frames: 7
    },
    jump: {
      img: null,
      width: 79,
      height: 91,
      frames: 8
    }
  },
  player2: {
    idle: {
      img: null,
      width: 63,
      height: 54,
      frames: 5
    },
    walk: {
      img: null,
      width: 94,
      height: 46,
      frames: 8
    },
    jump: {
      img: null,
      width: 68,
      height: 59,
      frames: 7
    }
  }
};

// 添加背景设定
let backgrounds = {
  far: {
    img: null,
    x: 0,
    speed: 0.3
  }
};

// 角色狀態設定
let characters = {
  player1: {
    x: 200,
    y: 300,
    currentAction: 'idle',
    currentFrame: 0,
    direction: 1,
    hp: 100
  },
  player2: {
    x: 600,
    y: 300,
    currentAction: 'idle',
    currentFrame: 0,
    direction: -1,
    hp: 100
  }
};

let isLoading = true;
let loadingErrors = false;

// 在 sprites 對象後添加子彈設定
let bullets = [];

function preload() {
  console.log('開始載入圖片...');
  
  try {
    // 載入背景
    backgrounds.far.img = loadImage('assets/bg.png',
      () => console.log('背景載入成功'),
      () => {
        console.log('背景載入失敗');
        loadingErrors = true;
      }
    );
    
    // 簡化載入過程，先只載入基本動作
    sprites.player1.idle.img = loadImage('assets/1.png', 
      () => console.log('player1 idle loaded'),
      () => {
        console.log('player1 idle 載入失敗');
        loadingErrors = true;
      }
    );
    sprites.player1.walk.img = loadImage('assets/3.png', 
      () => console.log('player1 walk loaded'),
      () => {
        console.log('player1 walk 載入失敗');
        loadingErrors = true;
      }
    );
    
    sprites.player2.idle.img = loadImage('assets/2.png',
      () => console.log('player2 idle loaded'),
      () => {
        console.log('player2 idle 載入失敗');
        loadingErrors = true;
      }
    );
    sprites.player2.walk.img = loadImage('assets/4.png',
      () => console.log('player2 walk loaded'),
      () => {
        console.log('player2 walk 載入失敗');
        loadingErrors = true;
      }
    );
  } catch(e) {
    console.error('載入過程發生錯誤:', e);
    loadingErrors = true;
  }
}

function setup() {
  createCanvas(800, 600);
  imageMode(CENTER);
  frameRate(60);
  isLoading = false;
}

function draw() {
  // 替换 background(220) 为背景图绘制
  if (backgrounds.far.img) {
    let bgRatio = backgrounds.far.img.width / backgrounds.far.img.height;
    let screenRatio = width / height;
    
    if (screenRatio > bgRatio) {
      // 如果螢幕比較寬，以寬度為基準
      image(backgrounds.far.img, width/2, height/2, width, width/bgRatio);
    } else {
      // 如果螢幕比較高，以高度為基準
      image(backgrounds.far.img, width/2, height/2, height*bgRatio, height);
    }
  } else {
    background(220);
  }
  
  if (loadingErrors) {
    fill(255, 0, 0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text('圖片載入失敗！', width/2, height/2);
    return;
  }
  
  if (isLoading) {
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text('載入中...', width/2, height/2);
    return;
  }
  
  // 處理移動輸入
  handleMovement();
  
  // 繪製角色
  drawCharacter('player1');
  drawCharacter('player2');
  
  // 顯示控制說明
  fill(0);
  noStroke();
  textSize(16);
  text('Player1: A,D移動, F發射', 10, 30);
  text('Player2: ←,→移動, /發射', 10, 50);
  
  // 更新和繪製子彈
  updateBullets();
  
  // 顯示生命值
  drawHP();
}

function drawCharacter(playerType) {
  let char = characters[playerType];
  let spriteData = sprites[playerType][char.currentAction];
  
  if (!spriteData || !spriteData.img) {
    // 如果圖片未載入，畫一個佔位方塊
    fill(playerType === 'player1' ? 'red' : 'blue');
    rect(char.x - 25, char.y - 25, 50, 50);
    return;
  }
  
  push();
  translate(char.x, char.y);
  scale(char.direction, 1);
  
  image(spriteData.img,
    0, 0,
    spriteData.width, spriteData.height,
    char.currentFrame * spriteData.width, 0,
    spriteData.width, spriteData.height
  );
  pop();
  
  // 更新動畫幀
  if (frameCount % 6 === 0) {
    char.currentFrame = (char.currentFrame + 1) % spriteData.frames;
  }
}

function handleMovement() {
  // 玩家1控制 (A,D 左右移動)
  if (keyIsDown(65)) { // A鍵
    characters.player1.x -= 5;
    characters.player1.direction = -1;
    characters.player1.currentAction = 'walk';
  } else if (keyIsDown(68)) { // D鍵
    characters.player1.x += 5;
    characters.player1.direction = 1;
    characters.player1.currentAction = 'walk';
  } else {
    characters.player1.currentAction = 'idle';
  }
  
  // 玩家2控制 (左右方向鍵)
  if (keyIsDown(LEFT_ARROW)) {
    characters.player2.x -= 5;
    characters.player2.direction = -1;
    characters.player2.currentAction = 'walk';
  } else if (keyIsDown(RIGHT_ARROW)) {
    characters.player2.x += 5;
    characters.player2.direction = 1;
    characters.player2.currentAction = 'walk';
  } else {
    characters.player2.currentAction = 'idle';
  }
  
  // 確保角色不會超出畫面
  characters.player1.x = constrain(characters.player1.x, 50, width - 50);
  characters.player2.x = constrain(characters.player2.x, 50, width - 50);
  
  // 發射控制
  if (keyIsDown(70)) { // F鍵發射 (玩家1)
    if (frameCount % 15 === 0) { // 降低發射頻率
      shoot('player1');
    }
  }
  
  if (keyIsDown(191)) { // /鍵發射 (玩家2)
    if (frameCount % 15 === 0) {
      shoot('player2');
    }
  }
}

// 添加發射子彈的函數
function shoot(player) {
  let char = characters[player];
  let bullet = {
    x: char.x + (char.direction * 30), // 從角色前方發射
    y: char.y,
    speed: 10 * char.direction,
    size: 10,
    owner: player
  };
  bullets.push(bullet);
}

// 添加子彈更新和碰撞檢測函數
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.speed;
    
    // 根據發射者改變子彈顏色
    fill(b.owner === 'player1' ? '#FF4444' : '#4444FF');
    circle(b.x, b.y, b.size);
    
    // 檢查是否擊中對手
    let target = b.owner === 'player1' ? characters.player2 : characters.player1;
    if (dist(b.x, b.y, target.x, target.y) < 30) {
      // 擊中，扣血
      target.hp -= 10;
      bullets.splice(i, 1);
      continue;
    }
    
    // 移除超出畫面的子彈
    if (b.x < 0 || b.x > width) {
      bullets.splice(i, 1);
    }
  }
}

// 添加生命值顯示函數
function drawHP() {
  // 玩家1血條
  fill(0);
  text('P1 HP:', 10, 80);
  fill(255, 0, 0);
  rect(70, 65, characters.player1.hp, 20);
  
  // 玩家2血條
  fill(0);
  text('P2 HP:', width - 170, 80);
  fill(255, 0, 0);
  rect(width - 110, 65, characters.player2.hp, 20);
  
  // 檢查遊戲結束
  if (characters.player1.hp <= 0 || characters.player2.hp <= 0) {
    let winner = characters.player1.hp <= 0 ? 'Player 2' : 'Player 1';
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0);
    text(winner + ' Wins!', width/2, height/2);
    noLoop(); // 停止遊戲
  }
}