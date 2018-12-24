cc.Class({
    extends: cc.Component,

    properties: {
        bgMusic: {
            type: cc.AudioClip,
            default: null
        }
    },

    onLoad () {
        cc.game.addPersistRootNode(this.node);
        cc.audioEngine.play(this.bgMusic, true, 0.4);
    },

    start () {

    },
});
