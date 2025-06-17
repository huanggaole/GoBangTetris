import style from './style';
import Layout from './engine';

const __env = GameGlobal.wx || GameGlobal.tt || GameGlobal.swan;
const sharedCanvas = __env.getSharedCanvas();
const sharedContext = sharedCanvas.getContext('2d');

// 初始化时设置默认viewport
function initViewPort() {
    try {
        const systemInfo = __env.getSystemInfoSync();
        Layout.updateViewPort({
            x: 0,
            y: 0,
            width: systemInfo.screenWidth || sharedCanvas.width || 750,
            height: systemInfo.screenHeight || sharedCanvas.height || 1334
        });
        console.log('初始化viewport成功:', systemInfo.screenWidth, systemInfo.screenHeight);
    } catch (error) {
        console.log('获取系统信息失败，使用默认viewport:', error);
        Layout.updateViewPort({
            x: 0,
            y: 0,
            width: sharedCanvas.width || 750,
            height: sharedCanvas.height || 1334
        });
    }
}

// 初始化viewport
initViewPort();

__env.onMessage(data => {
    if (data.type !== 'engine') {
        console.warn('Open Context get wrong type:', data.type);
        return;
    }

    switch (data.event) {
        case 'viewport':
            updateViewPort(data);
            break;

        case 'level':
            showRankList('level');
            break;

        case 'showRank':
            // 显示排行榜 - 支持分数和关卡双重排序
            showRankList('score');
            break;

        case 'updateRank':
            // 更新排行榜数据
            console.log('更新排行榜数据:', data);
            showRankList('score');
            break;

        case 'hideRank':
            // 隐藏排行榜
            Layout.clear();
            break;

        default:
            break;
    }
});

function draw(template) {
    Layout.clear();
    Layout.init(template, style);

    // 确保在layout之前设置viewport
    if (!Layout.hasViewPortSet) {
        // 设置默认的viewport
        const systemInfo = __env.getSystemInfoSync();
        Layout.updateViewPort({
            x: 0,
            y: 0,
            width: systemInfo.screenWidth || sharedCanvas.width,
            height: systemInfo.screenHeight || sharedCanvas.height
        });
    }

    Layout.layout(sharedContext);
}

function updateViewPort(data) {
    Layout.updateViewPort({
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
    });
}

function layoutOf(itemsList) {
    console.log('生成完整排行榜面板布局');

    // 开始构建完整的排行榜面板
    let out = '<view class="container" id="main"> <view class="rankList"> ';

    // 添加标题
    out += '<view class="gameTitle">🏆 好友排行榜 🏆</view>';

    // 添加列表容器
    out += '<scrollview class="list" scrollY="true"> ';

    const datas = itemsList.data;

    if (datas && datas.length > 0) {
        console.log('显示', datas.length, '位好友的排行数据');

        // 显示实际的排行数据
        let item, index = -1;
        const len = datas.length - 1;
        while (index < len) {
            item = datas[index += 1];
            out += ' ';

            if (index < 3) {
                // 前三名使用皇冠图标
                let rankIcon = '';
                let crownImageSrc = '';
                switch (index) {
                    case 0:
                        rankIcon = '🥇';
                        crownImageSrc = 'wx-sub-project/Leaderboard_GoldCrown.png';
                        break;
                    case 1:
                        rankIcon = '🥈';
                        crownImageSrc = 'wx-sub-project/Leaderboard_SilverCrown.png';
                        break;
                    case 2:
                        rankIcon = '🥉';
                        crownImageSrc = 'wx-sub-project/Leaderboard_BronzeCrown.png';
                        break;
                    default: break;
                }

                out += ' <view class="listItem"> ';
                out += ' <view id="listItemUserData"> ';
                // 使用皇冠图片而不是文字图标
                out += ' <image class="listItemCrownIcon" src="' + crownImageSrc + '"></image> ';
                out += ' <image class="listHeadImg" src="' + (item.avatarUrl)
                    + '"></image> <text class="listItemName" value="' + (item.nickname)
                    + '"></text> </view> <view class="scoreContainer"> <text class="listItemScore" value="' + (item.score || 0)
                    + '"></text> <text class="listItemLevel" value="' + '第' + (item.level || 1) + '关'
                    + '"></text> </view> </view> ';
            } else {
                // 第四名及以后使用数字
                out += ' <view class="listItem"> ';
                out += ' <view id="listItemUserData"> <text class="listItemNum" value="' + (index + 1)
                    + '"></text> <image class="listHeadImg" src="' + (item.avatarUrl)
                    + '"></image> <text class="listItemName" value="' + (item.nickname)
                    + '"></text> </view> <view class="scoreContainer"> <text class="listItemScore" value="' + (item.score || 0)
                    + '"></text> <text class="listItemLevel" value="' + '第' + (item.level || 1) + '关'
                    + '"></text> </view> </view> ';
            }
        }

        // 如果数据少于8条，添加占位条目来填充面板
        const minDisplayItems = 8;  // 最少显示8个条目来填充面板
        if (datas.length < minDisplayItems) {
            console.log('添加', (minDisplayItems - datas.length), '个占位条目');
            for (let i = datas.length; i < minDisplayItems; i++) {
                out += ' <view class="listItem"> ';
                out += ' <view id="listItemUserData"> <text class="listItemNum" value="' + (i + 1)
                    + '"></text> <text class="listItemName" value="暂无玩家"></text> ';
                out += ' </view> <view class="scoreContainer"> <text class="listItemScore" value="---"></text> ';
                out += ' <text class="listItemLevel" value="---"></text> </view> </view> ';
            }
        }
    } else {
        console.log('无排行数据，显示空状态');
        // 显示空状态，但仍然是完整面板
        out += ' <view class="emptyState"> ';
        out += ' <text class="emptyText" value="🎮 暂无排行数据"></text> ';
        out += ' <text class="emptyHint" value="邀请好友一起游戏吧！"></text> ';
        out += ' </view> ';
    }

    // 关闭标签
    out += ' </scrollview></view></view>';

    console.log('完整排行榜面板布局生成完成');
    return out;
}

function showRankList(primaryKey = 'score') {
    console.log('显示排行榜，主要排序键:', primaryKey);
    __env.getFriendCloudStorage({
        keyList: ['score', 'level'], // 获取分数和关卡两个数据
        success: res => {
            if (!res.data) {
                console.log('排行榜数据为空!');
                // 显示空数据提示
                const emptyData = { data: [] };
                draw(layoutOf(emptyData));
                return;
            }

            const friendsData = { data: [] };
            for (let i = 0; i < res.data.length; i++) {
                const userData = res.data[i];
                const item = {};

                // 获取分数和关卡数据
                let score = 0;
                let level = 1;

                if (userData.KVDataList && userData.KVDataList.length > 0) {
                    for (let j = 0; j < userData.KVDataList.length; j++) {
                        const kv = userData.KVDataList[j];
                        if (kv.key === 'score') {
                            score = parseInt(kv.value) || 0;
                        } else if (kv.key === 'level') {
                            level = parseInt(kv.value) || 1;
                        }
                    }
                }

                item.score = score;
                item.level = level;
                item.avatarUrl = userData.avatarUrl;
                item.nickname = userData.nickname;

                // 只显示有分数的玩家
                if (score > 0) {
                    friendsData.data.push(item);
                }
            }

            // 按分数排序，分数相同时按关卡排序
            friendsData.data.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; // 分数降序
                }
                return b.level - a.level; // 关卡降序
            });

            draw(layoutOf(friendsData));
            console.log('排行榜显示成功，共', friendsData.data.length, '位好友');
        },

        fail: err => {
            console.log('获取排行榜数据失败:', err);
            // 显示错误提示
            const errorData = { data: [] };
            draw(layoutOf(errorData));
        }
    });
}
