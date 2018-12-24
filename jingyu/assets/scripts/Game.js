cc.Class({
    extends: cc.Component,

    properties: {
        container: {
            default: null,
            type: cc.Node
        },
        level: {
            default: null,
            type: cc.Label
        },
        score: {
            default: null,
            type: cc.Label
        },
        time: {
            default: null,
            type: cc.Label
        },
        Yu: {
            default: null,
            type: cc.Prefab
        },
        reStart: {
            default: null,
            type: cc.Node
        },
        vaildYuCount: 0,
        levelYuObj: null,
        levelTime: 0,
        clearTimeId: null,
        clearInterId: null,

    },

    overGame: function () {
        this.reStart.active = true;
        this.container.active = false;
    },
    startGame: function () {
        this.reStart.active = false;
        this.container.active = true;
        this.createLevel(1);
    },

    updateTime: function () {
        this.time.string = (Number(this.levelTime) / 1000).toFixed(2) + '秒';
        if (this.levelTime <= 0) {
            clearInterval(this.clearInterId);
            this.overGame();
        } else {
            this.levelTime -= 25;
        }
    },

    updateGame: function () {
        var isSame = true;
        for (var k in this.levelYuObj) {
            if (this.levelYuObj[k] != this.levelYuObj[0]) {
                isSame = false;
                break;
            }
        }
        if (isSame) {
            //待做得分音乐
            this.score.string = Math.max(1, parseInt(Number(this.levelTime) / 1000)) + Number(this.score.string);
            clearInterval(this.clearInterId);
            clearTimeout(this.clearTimeId);
            this.clearTimeId = setTimeout(function () {
                this.createLevel(Number(this.level.string) + 1);
            }.bind(this), 300);
        }
    },

    createRandomYu: function (tempArr, allNum, callback) {
        var yuType = parseInt(Math.random() * this.vaildYuCount + 1);
        var temp = [];
        for (var i=0;i<tempArr.length;i++) {
            if (tempArr[i] === yuType) {
                temp.push(true);
            }
        }
        if (temp.length === (allNum - 1)) {
            this.createRandomYu(tempArr, allNum, callback);
        } else {
            tempArr.push(yuType);
            callback(yuType);
        }
    },

    createLevel: function (level) {
        var that = this;
        this.level.string = level;
        if (level === 1) {
            this.score.string = 0;
        }
        this.levelTime = Math.max(5000, 30000 - (level - 1) * 1000);
        this.updateTime();
        this.clearInterId = setInterval(this.updateTime.bind(this), 40);
        this.container.removeAllChildren();
        this.levelYuObj = {};
        this.vaildYuCount = Math.min(6, parseInt(level / 3) + 2);
        var allNum = Math.min(7, 2 + parseInt(level / 2)) * Math.min(4, 2 + parseInt(level / 2));
        var tempArr = [];
        for (var i=0;i<allNum;i++) {
            this.createRandomYu(tempArr, allNum, function (yuType) {
                let newYu = cc.instantiate(that.Yu);
                newYu.getComponent('toNextYu').id = i;
                newYu.getComponent('toNextYu').yuType = yuType;
                that.levelYuObj[i] = yuType;
                that.container.addChild(newYu);
            });
        }
    },

    onLoad () {
        this.startGame();
        this.reStart.on('touchend', this.startGame.bind(this));
    },

    start () {

    },

    update (dt) {

    },
});
