// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

// 微信小游戏API类型声明
declare var wx: any;

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Button)
    startBtn: cc.Button = null;

    @property(cc.Label)
    highScoreLabel: cc.Label = null;

    @property(cc.Button)
    rankBtn: cc.Button = null;

    @property(cc.Button)
    closeRankBtn: cc.Button = null;

    @property(cc.Node)
    rankPageNode: cc.Node = null; // 排行榜页面物体，手动赋值

    // 微信开放数据域相关
    private _openContext: any; // 子域对象

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // 初始化微信开放数据域
        this.initOpenContext();

        this.startBtn.node.on("click", () => {
            cc.director.loadScene("MainScene");
        });

        // 排行榜按钮事件
        if (this.rankBtn) {
            this.rankBtn.node.on("click", () => {
                this.showRankList();
            });
        }

        // 关闭排行榜按钮事件
        if (this.closeRankBtn) {
            this.closeRankBtn.node.on("click", () => {
                this.hideRankList();
            });
            // 初始时隐藏关闭按钮
            this.closeRankBtn.node.active = false;
        }

        // 显示历史最高分
        this.showHighScore();
    }

    // 显示历史最高分
    showHighScore() {
        if (typeof wx !== 'undefined') {
            // 微信小游戏环境，使用微信API
            const highScore = wx.getStorageSync("highScore") || 0;
            if (this.highScoreLabel) {
                this.highScoreLabel.string = "历史最高分: " + highScore;
            }
        } else {
            // 非微信环境，使用浏览器localStorage
            const highScore = cc.sys.localStorage.getItem("highScore") || "0";
            if (this.highScoreLabel) {
                this.highScoreLabel.string = "历史最高分: " + highScore;
            }
        }
    }

    // 初始化微信开放数据域
    initOpenContext() {
        if (typeof wx !== 'undefined') {
            // 获取开放数据域
            this._openContext = wx.getOpenDataContext();
        }
    }

    // 显示排行榜
    showRankList() {
        console.log("显示排行榜");

        // 显示排行榜页面物体
        if (this.rankPageNode) {
            this.rankPageNode.active = true;
            console.log("显示排行榜页面物体");
        }

        // 显示关闭按钮
        if (this.closeRankBtn) {
            this.closeRankBtn.node.active = true;
        }

        // 发送消息到子域
        if (this._openContext) {
            this._openContext.postMessage({
                type: 'engine',
                event: 'showRank'
            });
        } else {
            console.log("排行榜功能仅在微信小游戏环境中可用");
        }
    }

    // 隐藏排行榜
    hideRankList() {
        console.log("隐藏排行榜");

        // 隐藏排行榜页面物体
        if (this.rankPageNode) {
            this.rankPageNode.active = false;
            console.log("隐藏排行榜页面物体");
        }

        // 隐藏关闭按钮
        if (this.closeRankBtn) {
            this.closeRankBtn.node.active = false;
        }

        // 发送消息到子域
        if (this._openContext) {
            this._openContext.postMessage({
                type: 'engine',
                event: 'hideRank'
            });
        }
    }



    // update (dt) {}
}
