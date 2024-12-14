// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class SliderScript extends cc.Component {
    // 抖音侧边栏复访
    private isFromSidebar = false //状态，表示是否从侧边栏进入
    @property(cc.Node)
    public startBtn: cc.Node | null = null; // 开始游戏按钮

    @property(cc.Node)
    public btnSidebar: cc.Node | null = null; // 入口有礼按钮

    @property(cc.Node)
    public ndSidebar: cc.Node | null = null; // 侧边栏引导对话框

    @property(cc.Node)
    public btnGotoSidebar: cc.Node | null = null; //去侧边栏按钮

    @property(cc.Node)
    public btnCloseSidebar: cc.Node | null = null; // 关闭侧边栏引导对话框

    // 弹出侧边栏引导框
    private showDialogBox() {
        // 显示引导层，隐藏开始按钮
        this.ndSidebar.active = true;
        this.startBtn.active = false;
    }

    // 关闭侧边栏对话框
    private closeSidebar() {
        this.ndSidebar.active = false;
        this.startBtn.active = true;
    }

    // 自动跳转侧边栏
    private gotoSidebar() {
        this.ndSidebar.active = false;
        this.startBtn.active = true;

        // 抖音小游戏侧边栏跳转逻辑
        tt.navigateToScene({
            scene: "sidebar",
            success: (res) => {
                console.log("navigate to scene success");
                // 跳转成功回调逻辑
            },
            fail: (res) => {
                console.log("navigate to scene fail: ", res);
                // 跳转失败回调逻辑
            },
        });
    }

    start() {
        // --侧边栏按钮判断--//
        tt.onShow((res) => {
            //判断用户是否是从侧边栏进来的
            this.isFromSidebar = (res.launch_from == 'homepage' && res.location == 'sidebar_card')

            if (this.isFromSidebar) {
                //如果是从侧边栏进来的，隐藏“去侧边栏”
                this.btnSidebar.active = false
            }
            else {
                //否则 显示“去侧边栏”按钮
                this.btnSidebar.active = true
            }
        });

        //判断用户是否支持侧边栏进入功能，有些旧版的抖音没有侧边栏，这种情况就把入口有礼那个按钮给隐藏掉
        // 因为我引导层默认就是隐藏，所以这部分可以不用判断
        /*tt.checkScene({
            scene: "sidebar",
            success: (res) => {
                this.btnSidebar.node.active = true
            },
            fail: (res) => {
                this.btnSidebar.node.active = false
            }
        });*/
        // --侧边栏按钮判断--//

        // 显示侧边栏引导框
        this.btnSidebar.on('touchstart', this.showDialogBox, this);

        // 关闭侧边栏引导对话框
        this.btnCloseSidebar.on('touchstart', this.closeSidebar, this);

        // 点击进入抖音侧边栏
        this.btnGotoSidebar.on('touchstart', this.gotoSidebar, this);
    }
}
