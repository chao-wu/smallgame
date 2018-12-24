cc.Class({
    extends: cc.Component,

    properties: {
        yuAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        id: 0,
        yuType: 0
    },

    toNextYu: function () {
        var Game = cc.find('Canvas').getComponent('Game');
        if (Number(this.yuType) < Game.vaildYuCount) {
            this.yuType = Number(this.yuType) + 1;
        } else {
            this.yuType = 1;
        }
        this.changeSprite();
        Game.levelYuObj[this.id] = this.yuType;
        Game.updateGame();
    },

    changeSprite: function () {
        this.getComponent(cc.Sprite).spriteFrame = this.yuAtlas.getSpriteFrame(this.yuType.toString());
    },

    onLoad () {
        this.changeSprite();
    },

    start () {

    },

    update (dt) {},
});
