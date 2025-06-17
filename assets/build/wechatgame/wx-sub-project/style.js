// styles.js
module.exports = {
    container: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        backgroundColor: '#ffffff',
        padding: 20,
    },

    rankList: {
        width: '85%',
        height: '85%',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
    },

    list: {
        width: '100%',
        height: '100%',
    },

    listItem: {
        width: '100%',
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        marginBottom: 10,
        paddingHorizontal: 20,
    },

    listItemUserData: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,  // 避免强制固定宽度
    },


    listItemTop3Img: {
        width: 64,
        height: 64,
        marginRight: 16,
    },

    listHeadImg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginLeft: 10,
        borderWidth: 2,
        borderColor: '#dddddd',
    },

    listItemName: {
        fontSize: 20,
        color: '#222222',
        fontWeight: '500',
        marginLeft: 0,
        marginBottom: 10,
        width: 100,
    },

    listItemScore: {
        fontSize: 20,
        color: '#007acc',
        fontWeight: 'bold',
        marginRight: 10,
        width: 100,
        textAlign: 'right',
        borderWidth: 10, // 用于调试
    },

    listItemLevel: {
        fontSize: 20,
        color: '#555555',
        fontWeight: 'bold',
        marginRight: 10,
        width: 100,
        textAlign: 'right',
        borderWidth: 10, // 用于调试
    },

    listItemNum: {
        fontSize: 20,
        color: '#555555',
        marginLeft: 30,
        width: 100,
        textAlign: 'left',
        borderWidth: 10, // 用于调试
    },

};
