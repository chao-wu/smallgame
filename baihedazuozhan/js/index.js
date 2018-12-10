//游戏容器
var body;

//UI变量
var mainContainer;
var menuContainer;
var gameContainer;
var infoContainer;
var overContainer;

//游戏变量
var validBallCount;//可用小球数量，随着关卡上升增加，有最大限制
var clearTimeoutId;//定时器标记
var clearIntervalId;//循环器标记
var levelBallsArr;//存放关卡小球数组
var score;//当前游戏得分
var level;//当前游戏关卡
var levelTime;//关卡游戏可用时间，随着关卡上升而减少，有最小限制
var gamePlaying;//游戏的状态

//执行队列
initHtml();
initUi();
initGame();


function initHtml() {
  // 插入 meta 标签
  var oMeta = document.createElement('meta');
  oMeta.content = "width=device-width,user-scalable=no";
  oMeta.name = "viewport";
  document.getElementsByTagName('head')[0].appendChild(oMeta);
  //设置rem
  var html = document.documentElement;
  var width = html.getBoundingClientRect().width;
  html.style.fontSize = width/15 + 'px';
  //设置百分比
  html.style.width = '100%';
  html.style.height = '100%';
}

//初始化UI
function initUi() {
  body = document.body;
  body.style.width = '100%';
  body.style.height = '100%';
  body.style.margin = '0';

  //主容器
  mainContainer = createContainer({
    id: 'main',
    width: '100%',
    height: '100%',
    background: "url('images/background.jpg') no-repeat",
    backgroundSize: 'cover',
    appendTo: body
  });

  //菜单容器
  menuContainer = createContainer({
    id: 'menu',
    background: 'rgba(50, 204, 254, .7)',
    width: '100%',
    height: '100%',
    fontSize: '1rem',
    color: '#fff',
    textAlign: 'center',
    boxSizing: 'border-box',
    paddingTop: '8rem',
    innerText: '百合大作战\n\n开始战斗',
    appendTo: mainContainer
  });

  //游戏结束容器
  overContainer = createContainer({
    id: 'over',
    background: 'rgba(50, 204, 254, .7)',
    width: '100%',
    height: '100%',
    fontSize: '1rem',
    textAlign: 'center',
    color: '#fff',
    boxSizing: 'border-box',
    paddingTop: '8rem',
    appendTo: mainContainer
  });

  //信息显示容器
  infoContainer = createContainer({
    id: 'info',
    background: 'rgba(251, 234, 146, .7)',
    width: '100%',
    height: '1.2rem',
    lineHeight: '1.2rem',
    fontSize: '0.6rem',
    color: '#72147E',
    textIndent: '0.4rem',
    textAlign: 'center',
    appendTo: mainContainer
  });

  //游戏进行中容器
  gameContainer = createContainer({
    id: 'game',
    background: 'rgba(255, 255, 255, .6)',
    borderRadius: '0.8rem',
    margin: '2rem auto',
    padding: '0.8rem',
    appendTo: mainContainer
  });

  //游戏初始时，显示： 开始菜单  隐藏： 结束界面、游戏中界面、信息栏
  setDisplay(menuContainer, true);
  setDisplay(overContainer, false);
  setDisplay(gameContainer, false);
  setDisplay(infoContainer, false);

  console.log('游戏UI初始化完成');

}

//更新UI
function updateUi() {
  //信息显示容器UI更新
  infoContainer.innerText = 'Level: ' + level + '    Score: ' + score + '    剩余时间: ' + (levelTime / 1000).toFixed(2) + '秒';
  if (levelTime <= 0) {
    //结束定时器
    clearInterval(clearIntervalId);
    //结束游戏
    gameOver();
  } else {
    levelTime = levelTime - 25;
  }
}

//初始化游戏逻辑
function initGame() {
  //监听事件绑定
  //点击开始菜单时，开始游戏
  menuContainer.addEventListener('click', startGame);
  //点击结束游戏时，开始游戏
  overContainer.addEventListener('click', startGame);
  //在游戏中点击时，检测是否是点击的小球
  gameContainer.addEventListener('click', onGameClick);

  console.log('游戏逻辑初始化完成');
}

//更新游戏逻辑
function updateGame() {
  var isSame = true;
  var ballType = levelBallsArr[0].ballType;
  console.log(ballType);
  for (var z = 1; z < levelBallsArr.length; z++) {
    if (levelBallsArr[z].ballType !== ballType) {
      isSame = false;
      break;
    }
  }
  if (isSame) {
    //播放得分乐
    new Audio('audios/score.mp3').play();
    //达成本关计算分数
    score += Math.max(1, parseInt(levelTime / 1000));
    //清空定时器
    clearInterval(clearIntervalId);
    clearTimeout(clearTimeoutId);
    clearTimeoutId = setTimeout(function () {
      //创建下一关
      createLevel(level + 1);
    }, 300);
  }
}

//逻辑函数
/**
 * 开始游戏
 * 显示游戏中界面和信息栏，隐藏其他。清除上局的小球，创建关卡1
 */
function startGame () {
  console.log('游戏开始');

  setDisplay(overContainer, false);
  setDisplay(menuContainer, false);
  setDisplay(gameContainer, true);
  setDisplay(infoContainer, true);

  createLevel(1);
}

/**
 * 创建不全部重复小球
 * @param tempArr 临时数组
 * @param row     行数
 * @param col     列数
 * @param callback 成功回调函数
 */
function createNoAllRepeatBall(tempArr,row,col,callback) {
  var ballType = parseInt(Math.random() * validBallCount + 1);
  var temp = [];
  for (var l = 0; l < tempArr.length; l ++) {
    if (tempArr[l] === ballType) {
      temp.push(true);
    }
  }
  if (temp.length === (row * col - 1)) {
    createNoAllRepeatBall(tempArr,row,col,callback);
  } else {
    tempArr.push(ballType);
    callback(ballType);
  }
}

/**
 * 创建关卡
 * 根据传递的关卡创建相关关卡内容
 * @param lev 关卡
 */
function createLevel(lev) {
  level = lev;
  //如果是第一关，将分数清零
  if (level === 1) {
    score = 0;
  }
  //关卡可用时间算法
  levelTime = Math.max(5000, 30000 - (level - 1) * 1000);
  //更新UI信息层
  updateUi();
  //设置定时器
  clearIntervalId = setInterval(updateUi,40);
  //存放关卡小球的数组
  levelBallsArr = [];
  //清空游戏容器
  gameContainer.innerText = '';
  //可用小球数量
  validBallCount = Math.min(6, parseInt(level / 3) + 2);
  //小球行数
  var row = Math.min(7, 2 + parseInt(level / 2));
  //小球列数
  var col = Math.min(4, 2 + parseInt(level / 2));
  //根据行列和小球尺寸设置容器大小
  gameContainer.style.width = 2.92 * col + 'rem';
  gameContainer.style.height = 2.92 * row + 'rem';
  //使用一个嵌套循环来创建小球
  var tempArr = [];
  for(var i = 0; i < col * row; i++) {
    createNoAllRepeatBall(tempArr,row,col, function (ballType) {
      var img = new Image();
      img.style.verticalAlign = 'bottom';
      img.style.width = '2.92rem';
      img.style.height = '2.92rem';
      img.ballType = ballType;
      img.src = 'images/' + ballType + '.png';
      gameContainer.appendChild(img);
      levelBallsArr.push(img);
    });
  }

  //设置游戏状态
  gamePlaying = true;
  var logsArr = [
    '创建关卡:' + level,
    '行数:' + row,
    '列数:' + col,
    '可用小球数:' + validBallCount,
    '限时:' + levelTime / 1000 + '秒',
  ];

  console.log(logsArr.join(' '));
}


/**
 * 在游戏中点击时
 * @param event 传递点击的事件对象
 */
function onGameClick(event) {
  //获取被点击的dom信息
  var clickDom = event.target;
  //如果被点击的有balltype属性，说明是小球，就切换小球
  if (clickDom.ballType) {
    toNextBallType(clickDom);
  }
}

/**
 * @param ballImg 要切换类型的小球dom
 */
function toNextBallType(ballImg) {
  //先改变ballType属性  循环切换
  if (ballImg.ballType < validBallCount) {
    ballImg.ballType = ballImg.ballType + 1;
  } else {
    ballImg.ballType = 1;
  }

  //播放点击乐
  new Audio('audios/jump.mp3').play();

  //加载对应小球图片
  ballImg.src = 'images/' + ballImg.ballType + '.png';
  //更新游戏
  updateGame();
}


/**
 * 游戏结束
 * 显示游戏结束界面，显示最终得分，隐藏其他界面
 */
function gameOver(){
  console.log('游戏结束');
  gamePlaying = false;
  overContainer.innerText = '作战达成！\n\n 得分：' + score + '\n\n重赴战场=>';
  setDisplay(overContainer, true);
  setDisplay(gameContainer, false);
  setDisplay(infoContainer, false);
}


/**
 * 封装创建容器
 * @param options 通过options参数传递容器样式、文案、绑定父容器
 * @returns {*}
 */
function createContainer(options) {
  var div = document.createElement('div');
  options.id && (div.id = options.id);// 容器id
  options.background && (div.style.background = options.background);//背景
  options.backgroundSize && (div.style.backgroundSize = options.backgroundSize);//背景大小
  options.width && (div.style.width = options.width);//宽度
  options.height && (div.style.height = options.height);//高度
  options.lineHeight && (div.style.lineHeight = options.lineHeight);//行高
  options.color && (div.style.color = options.color);//字色
  options.fontSize && (div.style.fontSize = options.fontSize);//字号
  options.textAlign && (div.style.textAlign = options.textAlign);//文字对齐方式
  options.textIndent && (div.style.textIndent = options.textIndent);//文字缩进
  options.boxSizing && (div.style.boxSizing = options.boxSizing);//盒模型
  options.paddingTop && (div.style.paddingTop = options.paddingTop);//上内边距
  options.margin && (div.style.margin = options.margin);//外边距
  options.padding && (div.style.padding = options.padding);//内边距
  options.borderRadius && (div.style.borderRadius = options.borderRadius);//圆角
  options.innerText && (div.innerText = options.innerText);//文案
  options.appendTo && options.appendTo.append(div);//绑定父容器
  return div;//返回dom
}

/**
 * 设置容器的显示隐藏
 * @param container 设置的容器
 * @param show 是否显示 Boolean
 */
function setDisplay(container, show) {
  container.style.display = show ? 'block': 'none';
}