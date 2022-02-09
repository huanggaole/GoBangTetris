// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    nextSprite: cc.Sprite = null;

    @property(cc.Sprite)
    boardSprite: cc.Sprite = null;

    @property(cc.Prefab)
    whitePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    blackPrefab: cc.Prefab = null;

    @property(cc.Button)
    upBtn: cc.Button = null;

    @property(cc.Button)
    downBtn: cc.Button = null;

    @property(cc.Button)
    leftBtn: cc.Button = null;

    @property(cc.Button)
    rightBtn: cc.Button = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    comboLabel: cc.Label = null;

    @property(cc.Label)
    levelLabel: cc.Label = null;

    @property([cc.SpriteFrame])
    exs = [];

    blocks = [
        [
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0]
        ],
        [
            [1,1],
            [1,1]
        ],
        [
            [1,0,0],
            [1,1,0],
            [0,1,0]
        ],
        [
            [0,1,0],
            [1,1,0],
            [1,0,0]
        ],
        [
            [1,0,0],
            [1,0,0],
            [1,1,0]
        ],
        [
            [0,1,0],
            [0,1,0],
            [1,1,0]
        ],
        [
            [0,1,0],
            [1,1,1],
            [0,0,0]
        ]
    ];
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    next = null;
    current = null;
    currentpieces = [];
    pos:cc.Vec2 = null;
    mapwidth = 10;
    mapheight = 23;
    map = [];
    mapPieces = [];
    levelnum = 1;
    speed = 0.5;
    blockIndex = 0;
    score = 0;
    times = 0;
    start () {
        // 初始化棋盘
        for(let i = 0; i < this.mapheight; i++){
            const line = [];
            const pline = [];
            for(let j = 0; j < this.mapwidth; j++){
                line.push(0);
                pline.push(null);
            }
            this.map.push(line);
            this.mapPieces.push(pline);
        }
        this.current = this.generateABlock();
        this.next = this.generateABlock();
        this.refreshNext(this.next);
        this.pos = new cc.Vec2(4,this.mapheight - 1);
        this.addNewBlock(this.current,this.pos);
        // 每隔 speed 毫秒方块下降一格
        this.scheduleOnce(()=>{this.onMove();},this.speed);
        this.registeButtons();
    }

    registeButtons(){
        this.upBtn.node.on("click", this.onUp, this);
        this.downBtn.node.on("click", this.onDown, this);
        this.leftBtn.node.on("click", this.onLeft, this);
        this.rightBtn.node.on("click", this.onRight, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    unregisteButtons(){
        this.upBtn.node.off("click", this.onUp, this);
        this.downBtn.node.off("click", this.onDown, this);
        this.leftBtn.node.off("click", this.onLeft, this);
        this.rightBtn.node.off("click", this.onRight, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event) {
        console.log(event);
        
        switch(event.keyCode){
            // W87 A65 S83 D68
            case 87:
                this.onUp();
                break;
            case 65:
                this.onLeft();
                break;
            case 83:
                this.onDown();
                break;
            case 68:
                this.onRight();
                break;
            case 38:
                this.onUp();
                break;
            case 37:
                this.onLeft();
                break;
            case 40:
                this.onDown();
                break;
            case 39:
                this.onRight();
                break;
        }
        
    }

    onDown(){
        cc.Tween.stopAll();
        this.unscheduleAllCallbacks();
        while(true){
            // 更新位置
            const newPos = new cc.Vec2(this.pos.x, this.pos.y - 1);
            // 判断是否到底
            const ifCollape = this.ifCollape(newPos);
            if(ifCollape){
                this.endRound(this.pos);
                break;
            }else{
                this.pos = newPos;
            }
        }
    }

    onUp(){
        const oldCurrent = [];
        for(let i = 0; i < this.current.length; i++){
            const line = [];
            for(let j = 0; j < this.current[0].length; j++){
                const value = this.current[i][j];
                line.push(value);
            }
            oldCurrent.push(line);
        }
        const n = this.current.length;
        for(let i=1; i<=n/2; i++){
            for(let j=i; j<n-i+1; j++){
                let t = this.current[i - 1][j - 1];
                this.current[i - 1][j - 1] = this.current[n - j][i - 1];
                this.current[n - j][i - 1] = this.current[n - i][n - j];
                this.current[n - i][n - j] = this.current[j - 1][n - i];
                this.current[j - 1][n - i] = t;
            }
        }
        // 判断是否到底
        const ifCollape = this.ifCollape(this.pos);
        if(ifCollape){
            this.current = oldCurrent;
        }else{
            for(let i=1; i<=n/2; i++){
                for(let j=i; j<n-i+1; j++){
                    let t = this.currentpieces[i - 1][j - 1];
                    this.currentpieces[i - 1][j - 1] = this.currentpieces[n - j][i - 1];
                    this.currentpieces[n - j][i - 1] = this.currentpieces[n - i][n - j];
                    this.currentpieces[n - i][n - j] = this.currentpieces[j - 1][n - i];
                    this.currentpieces[j - 1][n - i] = t;
                }
            }
            this.movePieces(this.pos);
        }
    }

    onLeft() {
        // 更新位置
        const newPos = new cc.Vec2(this.pos.x - 1, this.pos.y);
        // 判断是否到底
        const ifCollape = this.ifCollape(newPos);
        if(!ifCollape){
            this.pos = newPos;
            this.movePieces(this.pos);
        }
    }

    onRight() {
        // 更新位置
        const newPos = new cc.Vec2(this.pos.x + 1, this.pos.y);
        // 判断是否到底
        const ifCollape = this.ifCollape(newPos);
        if(!ifCollape){
            this.pos = newPos;
            this.movePieces(this.pos);
        }
    }


    onMove(){
        // 更新位置
        const newPos = new cc.Vec2(this.pos.x, this.pos.y - 1);
        // 判断是否到底
        const ifCollape = this.ifCollape(newPos);
        if(ifCollape){
            this.endRound(this.pos);
        }else{
            this.pos = newPos;
            this.movePieces(this.pos);
            this.scheduleOnce(()=>{this.onMove()},this.speed * 2);
        }
    }

    endRound(pos:cc.Vec2){
        cc.Tween.stopAll();
        this.unscheduleAllCallbacks();
        for(let i = 0; i < this.currentpieces.length; i++){
            for(let j = 0; j < this.currentpieces[0].length; j++){
                if(this.currentpieces[i][j] != null){
                    const newx = pos.x + j;
                    const newy = pos.y - i;
                    this.mapPieces[newy][newx] = this.currentpieces[i][j];
                    this.map[newy][newx] = this.current[i][j];
                    this.mapPieces[newy][newx].x = j * 8 - 36 + pos.x * 8,
                    this.mapPieces[newy][newx].y = - i * 8 + 96 - (this.mapheight - pos.y) * 8
                }
            }
        }
        // 判断是否可消除
        this.times = 0;
        const ifEliminated = this.Eliminated();
        // if(!ifEliminated){
        //    this.nextRound();
        // }
    }

    nextRound(){
        // 将现在的 block 加入地图
        this.current = [];
        for(let i = 0; i < this.next.length; i++){
            const line = [];
            for(let j = 0; j < this.next[0].length; j++){
                var value = this.next[i][j];
                line.push(value);
            }
            this.current.push(line);
        }
        this.next = this.generateABlock();
        this.refreshNext(this.next);
        this.pos = new cc.Vec2(4,this.mapheight - 1);
        this.addNewBlock(this.current,this.pos);
        const ifCollape = this.ifCollape(this.pos);
        if(ifCollape){
            // 游戏结束
            this.unregisteButtons();
        }else{
            this.scheduleOnce(()=>{this.onMove()},this.speed * 2);
            this.registeButtons();
        }
    }

    Eliminated(){
        let eliSets = [];
        const flagForRow = [];
        const flagForCol = [];
        const flagForDiaR = [];
        const flagForDiaL = [];
        const flagForEliminated = [];
        for(let i = 0; i < this.mapheight; i++){
            const lineForRow = [];
            const lineForCol = [];
            const lineForDiaR = [];
            const lineForDiaL = [];
            const lineForEliminated = [];
            for(let j = 0; j < this.mapwidth; j++){
                lineForRow.push(false);
                lineForCol.push(false);
                lineForDiaR.push(false);
                lineForDiaL.push(false);
                lineForEliminated.push(false);
            }
            flagForRow.push(lineForRow);
            flagForCol.push(lineForCol);
            flagForDiaR.push(lineForDiaR);
            flagForDiaL.push(lineForDiaL);
            flagForEliminated.push(lineForEliminated);
        }
        for(let i = 0; i < this.mapheight; i++){
            for(let j = 0; j < this.mapwidth; j++){
                const value = this.map[i][j];
                if(value != 0){
                    // 判断横向有无浏览过
                    if(flagForRow[i][j] == false){
                        const set = [];
                        for(let k = j; k < this.mapwidth; k++){
                            if(this.map[i][k] != value){
                                break;
                            }
                            flagForRow[i][k] = true;
                            set.push(new cc.Vec2(k,i));
                        }
                        if(set.length >= 5){
                            eliSets.push(set);
                        }
                    }
                    // 判断纵向有无浏览过
                    if(flagForCol[i][j] == false){
                        const set = [];
                        for(let k = i; k < this.mapheight; k++){
                            if(this.map[k][j] != value){
                                break;
                            }
                            flagForCol[k][j] = true;
                            set.push(new cc.Vec2(j,k));
                        }
                        if(set.length >= 5){
                            eliSets.push(set);
                        }
                    }
                    // 判断斜向右有无浏览过
                    if(flagForDiaR[i][j] == false){
                        const set = [];
                        for(let k = i,l = j; k < this.mapheight && l < this.mapwidth; k++,l++){
                            if(this.map[k][l] != value){
                                break;
                            }
                            flagForDiaR[k][l] = true;
                            set.push(new cc.Vec2(l,k));
                        }
                        if(set.length >= 5){
                            eliSets.push(set);
                        }
                    }
                    // 判断斜向左有无浏览过
                    if(flagForDiaL[i][j] == false){
                        const set = [];
                        for(let k = i,l = j; k < this.mapheight && l >= 0; k++,l--){
                            if(this.map[k][l] != value){
                                break;
                            }
                            flagForDiaL[k][l] = true;
                            set.push(new cc.Vec2(l,k));
                        }
                        if(set.length >= 5){
                            eliSets.push(set);
                        }
                    }
                }
            }
        }
        // 增加分数
        this.times += eliSets.length;
        let pieceNum = 0;
        if(eliSets.length == 0){
            this.nextRound();
            return false;
        }
        // 把 sets 中的点从 map 中移除
        for(let i = 0; i < eliSets.length; i++){
            const set = eliSets[i];
            for(let j = 0; j < set.length; j++){
                if(flagForEliminated[set[j].y][set[j].x] == false){
                    pieceNum++;
                }
                flagForEliminated[set[j].y][set[j].x] = true;
            }
        }
        if(this.times == 1){
            this.comboLabel.string = "    + " + pieceNum;
        }else{
            this.comboLabel.string = "    + " + this.times + " * " + pieceNum + "\nCombo * " + this.times;
        }
        
        this.unregisteButtons();
        // 棋子闪烁两下
        this.scheduleOnce(()=>{
            for(let i = 0; i < eliSets.length; i++){
                const set = eliSets[i];
                for(let j = 0; j < set.length; j++){
                    this.mapPieces[set[j].y][set[j].x].active = false;
                    this.comboLabel.node.active = false;
                }
            }
            this.scheduleOnce(()=>{
                for(let i = 0; i < eliSets.length; i++){
                    const set = eliSets[i];
                    for(let j = 0; j < set.length; j++){
                        this.mapPieces[set[j].y][set[j].x].active = true;
                        this.comboLabel.node.active = true;
                    }
                }
                this.scheduleOnce(()=>{
                    for(let i = 0; i < eliSets.length; i++){
                        const set = eliSets[i];
                        for(let j = 0; j < set.length; j++){
                            this.mapPieces[set[j].y][set[j].x].active = false;
                            this.comboLabel.node.active = false;
                        }
                    }
                    this.scheduleOnce(()=>{
                        for(let i = 0; i < eliSets.length; i++){
                            const set = eliSets[i];
                            for(let j = 0; j < set.length; j++){
                                this.mapPieces[set[j].y][set[j].x].active = true;
                                this.comboLabel.node.active = true;
                            }
                        }
                        this.scheduleOnce(()=>{
                            for(let i = 0; i < eliSets.length; i++){
                                const set = eliSets[i];
                                for(let j = 0; j < set.length; j++){
                                    this.mapPieces[set[j].y][set[j].x].getComponent(cc.Sprite).spriteFrame = this.exs[0];
                                }
                            }
                            this.scheduleOnce(()=>{
                                for(let i = 0; i < eliSets.length; i++){
                                    const set = eliSets[i];
                                    for(let j = 0; j < set.length; j++){
                                        this.mapPieces[set[j].y][set[j].x].getComponent(cc.Sprite).spriteFrame = this.exs[1];
                                    }
                                }
                                this.scheduleOnce(()=>{
                                    for(let i = 0; i < eliSets.length; i++){
                                        const set = eliSets[i];
                                        for(let j = 0; j < set.length; j++){
                                            this.mapPieces[set[j].y][set[j].x].getComponent(cc.Sprite).spriteFrame = this.exs[2];
                                        }
                                    }
                                    this.scheduleOnce(()=>{
                                        for(let i = 0; i < eliSets.length; i++){
                                            const set = eliSets[i];
                                            for(let j = 0; j < set.length; j++){
                                                this.mapPieces[set[j].y][set[j].x].getComponent(cc.Sprite).spriteFrame = this.exs[3];
                                            }
                                        }
                                        this.scheduleOnce(()=>{
                                            for(let i = 0; i < eliSets.length; i++){
                                                const set = eliSets[i];
                                                for(let j = 0; j < set.length; j++){
                                                    this.mapPieces[set[j].y][set[j].x].getComponent(cc.Sprite).spriteFrame = this.exs[4];
                                                }
                                            }
                                            this.scheduleOnce(()=>{
                                                for(let i = 0; i < eliSets.length; i++){
                                                    const set = eliSets[i];
                                                    for(let j = 0; j < set.length; j++){
                                                        this.map[set[j].y][set[j].x] = 0;
                                                        this.boardSprite.node.removeChild(this.mapPieces[set[j].y][set[j].x]);
                                                        this.mapPieces[set[j].y][set[j].x] = null;
                                                    }
                                                }
                                                this.comboLabel.node.active = false;
                                                this.score += pieceNum * this.times;
                                                this.scoreLabel.string = "Score: " + this.score;
                                                // this.nextRound();
                                                this.hangPiecesFall();
                                            },0.05);
                                        },0.05);
                                    },0.05);
                                },0.05);
                            },0.05);
                        },0.05);
                    },0.2);
                },0.2);
            },0.2);
        },0.2);
        return true;
    }

    hangPiecesFall(){
        // 判断是否有碎片
        const hangFlags = []
        const nothanglist = [];
        for(let i = 0; i < this.mapheight; i++){
            const line = [];
            for(let j = 0; j < this.mapwidth; j++){
                if(this.map[i][j] == 0){
                    line.push(0);
                }else{
                    // 将最后一行存在的棋子标注为2
                    if(i == 0){
                        line.push(2);
                        nothanglist.push(new cc.Vec2(j,i));
                    }else{
                        line.push(1);
                    }
                }
            }
            hangFlags.push(line);
        }
        // 利用广度优先搜索，所有与标记为2联通的棋子位置全部标记为2
        let visitedindex = 0;
        const delx = [0,0,-1,1];
        const dely = [1,-1,0,0];
        while(visitedindex < nothanglist.length){
            let P = nothanglist[visitedindex];
            visitedindex++;
            for(let i = 0; i < 4; i++){
                const newP = new cc.Vec2(P.x + delx[i],P.y + dely[i]);
                if(newP.x >= 0 && newP.y >= 0 && newP.x < this.mapwidth && newP.y < this.mapheight && hangFlags[newP.y][newP.x] == 1){
                    hangFlags[newP.y][newP.x] = 2;
                    nothanglist.push(newP);
                }
            }
        }
        // 将剩下的连通分量从3开始编号
        let adjIndex = 2;
        const breakenBlocks = [];
        while(true){
            const block = [];
            let ifHasHangingPieces = false;
            let visitedlist = [];
            visitedindex = 0;
            // 遍历所有的棋子
            for(let i = 0; i < this.mapheight; i++){
                for(let j = 0; j < this.mapwidth; j++){
                    if(hangFlags[i][j] == 1){
                        adjIndex++;
                        hangFlags[i][j] = adjIndex;
                        block.push(new cc.Vec2(j, i));
                        visitedlist.push(new cc.Vec2(j, i));
                        ifHasHangingPieces = true;
                        break;
                    }
                }
                if(ifHasHangingPieces){
                    break;
                }
            }
            if(ifHasHangingPieces == false){
                break;
            }
            while(visitedindex < visitedlist.length){
                let P = visitedlist[visitedindex];
                visitedindex++;
                for(let i = 0; i < 4; i++){
                    const newP = new cc.Vec2(P.x + delx[i],P.y + dely[i]);
                    if(newP.x >= 0 && newP.y >= 0 && newP.x < this.mapwidth && newP.y < this.mapheight && hangFlags[newP.y][newP.x] == 1){
                        hangFlags[newP.y][newP.x] = adjIndex;
                        visitedlist.push(newP);
                        block.push(newP);
                    }
                }
            }
            breakenBlocks.push(block);
        }
        this.continueFall(breakenBlocks, hangFlags);
    }

    continueFall(breakenBlocks, hangFlags){
        let ifAnyFall = false;
        for(let i = 0; i < breakenBlocks.length; i++){
            const block = breakenBlocks[i];
            const adjIndex = i + 3;
            let ifCanfall = true;
            for(let j = 0; j < block.length; j++){
                const pos = block[j];
                if(pos.y == 0 || (hangFlags[pos.y - 1][pos.x] != adjIndex && hangFlags[pos.y - 1][pos.x] != 0)){
                    ifCanfall = false;
                    break;
                }
            }
            if(ifCanfall){
                ifAnyFall = true;
                const newMap = [];
                const newPieces = [];
                for(let j = 0; j < block.length; j++){
                    const pos = block[j];
                    newMap.push(this.map[pos.y][pos.x]);
                    this.map[pos.y][pos.x] = 0;
                    hangFlags[pos.y][pos.x] = 0;
                    newPieces.push(this.mapPieces[pos.y][pos.x]);
                    this.mapPieces[pos.y][pos.x] = null;
                    block[j].y -= 1;
                }
                for(let j = 0; j < block.length; j++){
                    const pos = block[j];
                    this.map[pos.y][pos.x] = newMap[j];
                    hangFlags[pos.y][pos.x] = adjIndex;
                    this.mapPieces[pos.y][pos.x] = newPieces[j];
                    const node = this.mapPieces[pos.y][pos.x];
                    cc.tween(node).to(0.2,{
                        x: pos.x * 8 - 36,
                        y: pos.y * 8 - 88
                    })
                    .start();
                }
            }
        }
        if(ifAnyFall){
            this.scheduleOnce(()=>{this.continueFall(breakenBlocks, hangFlags);},0.4);
        }else{
            this.Eliminated();
        }
    }

    movePieces(pos:cc.Vec2){
        cc.Tween.stopAll();
        for(let i = 0; i < this.currentpieces.length; i++){
            for(let j = 0; j < this.currentpieces[0].length; j++){
                if(this.currentpieces[i][j] != null){
                    const node = this.currentpieces[i][j];
                    cc.tween(node).to(this.speed,{
                        x: j * 8 - 36 + pos.x * 8,
                        y: - i * 8 + 96 - (this.mapheight - pos.y) * 8
                    }).start();
                }
            }
        }
    }

    ifCollape(pos:cc.Vec2){
        const current = this.current;
        for(let i = 0; i < current.length; i++){
            for(let j = 0; j < current[0].length; j++){
                if(current[i][j] != 0){
                    const newx = pos.x + j;
                    const newy = pos.y - i;
                    // console.log(newx, newy);
                    if(newx < 0 || newx >= this.mapwidth || newy < 0 || newy > this.mapheight){
                        return true;
                    }
                    if(this.map[newy][newx]!=0){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    generateABlock(){
        let res = [];
        const mod = this.blocks[Math.floor(Math.random() * this.blocks.length)];
        for(let i = 0; i < mod.length; i++){
            const line = [];
            for(let j = 0; j < mod[0].length; j++){
                if(mod[i][j] == 0){
                    line.push(0);
                }else{
                    let type = Math.floor(Math.random() * 2);
                    if(type == 0){
                        line.push(1);
                    }else{
                        line.push(2);
                    }
                }
            }
            res.push(line);
        }
        return res;
    }

    refreshNext(block:[[]]){
        this.blockIndex++;
        this.levelnum = 1 + Math.floor(this.blockIndex / 20);
        this.levelLabel.string = "Level " + this.levelnum;
        this.speed = 0.5 * Math.pow(0.9,(this.levelnum - 1));
        this.nextSprite.node.removeAllChildren();
        for(let i = 0; i < block.length; i++){
            for(let j = 0; j < block[0].length; j++){
                var piece;
                if(block[i][j] == 1){
                    piece = cc.instantiate(this.whitePrefab);
                }else if(block[i][j] == 2){
                    piece = cc.instantiate(this.blackPrefab);
                }else{
                    continue;
                }
                piece.x = j * 8 - 8;
                piece.y = - i * 8 + 8;
                this.nextSprite.node.addChild(piece);
            }
        }
    }

    addNewBlock(block:[[]],pos:cc.Vec2){
        this.currentpieces = [];
        for(let i = 0; i < block.length; i++){
            const line = [];
            for(let j = 0; j < block[0].length; j++){
                var piece;
                if(block[i][j] == 1){
                    piece = cc.instantiate(this.whitePrefab);
                }else if(block[i][j] == 2){
                    piece = cc.instantiate(this.blackPrefab);
                }else{
                    line.push(null);
                    continue;
                }
                piece.x = j * 8 - 36 + pos.x * 8;
                piece.y = - i * 8 + 96 - (this.mapheight - pos.y) * 8;
                this.boardSprite.node.addChild(piece);
                line.push(piece);
            }
            this.currentpieces.push(line);
        }
    }
    // update (dt) {}
}
