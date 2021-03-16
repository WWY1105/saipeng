// pages/shareCard/buySuccess/buySuccess.js
const app = getApp();
var timer;
var QRCode = require('../../../utils/weapp-qrcode.js')
var qrcode;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // ---------header
        nvabarData: {
            height: app.globalData.height * 2 + 28,
            title: '购卡成功', //导航栏 中间的标题
        },

        // ---------header
        mode: '2000', //同意
        orderId: false,
        showLoading: true,
        order: false,
        cardShow: true,
        QRImgUrl:'',
        avatarUrl:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let userinfo=wx.getStorageSync('userInfo')
        if (options.orderId) {
            this.setData({
                orderId: options.orderId
            }, () => {
                this.getData();
            })
        }
        this.setData({
            avatarUrl:userinfo.avatarUrl,
            sharePic: app.globalData.sharePic,
            showLoading: true
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            cardShow: false
        })

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        clearInterval(timer)
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        console.log(this.data.order)
        let discount = this.data.order.card.limit || '';
        let that = this;
        let url = "/pages/shareCard/joinShare/joinShare?id=" + this.data.order.id + "&type=card"+'&nickname='+this.data.userInfo.nickname;
        let title = '快领我的共享卡，和我共享全场' + discount + '折！'
        return {
            title: title,
            path: url,
            imageUrl: this.data.order.sharePicUrl,
            success: function (res) {
                console.log('成功')
                // 转发成功之后的回调
                if (res.errMsg == 'shareAppMessage:ok') {
                    that.setData({
                        cardShow: false
                    })
                }
            },
        }
    },
    hideModal() {
        this.setData({
            cardShow: false
        })
    },
    toIndex() {
        wx.reLaunch({
            url: '/pages/index/index',
        })
    },
    // 点击切换mode
    changeMode() {
        let mode = this.data.mode;
        let that = this;
        mode = mode == '1000' ? '2000' : '1000';
        console.log()
        let url = '/shares/' + that.data.order.id + '/mode';
        this.setData({
            mode
        }, () => {
            let data = {
                mode
            };
            app.util.request(that, {
                url: app.util.getUrl(url),
                method: 'POST',
                header: app.globalData.token,
                data: data
            }).then((res) => {
                if (res.code == 200) {

                } else {
                    wx.showToast({
                        title: res.message,
                        icon: "none",
                        duration: 2000
                    })
                }
            })
        });
    },
    // 查看我的卡
    seeMyCard() {
        wx.redirectTo({
            url: '/pages/shareCard/myCardDesc/myCardDesc?orderId=' + this.data.orderId
        })
    },
    saveCanvas() {
        wx.canvasToTempFilePath({
            canvasId: 'canvas',
            success: (res) => {
                console.log(res)
                this.setData({
                    QRImgUrl: res.tempFilePath
                })
            }
        })
    },
    // 获取数据
    getData() {
        let that = this;
        let url = '/shares/order/' + this.data.orderId;
        app.util.request(that, {
            url: app.util.getUrl(url, {}),
            method: 'GET',
            header: app.globalData.token
        }, false).then((res) => {
            clearInterval(timer)
            if (res.code == 200) {
                console.log(res.result.qrCodeUrl)
                if (res.result.qrCodeUrl) {
                    qrcode = new QRCode('canvas', {
                        text: res.result.qrCodeUrl,
                        width: 150,
                        height: 150,
                        colorDark: "#000",
                        colorLight: "white",
                        correctLevel: QRCode.CorrectLevel.H,
                    });
                }
                this.setData({
                    order: res.result,
                    cardShow: true,
                    showLoading: false
                })
            } else if (res.code == 404000) {
                timer = setInterval(() => {
                    console.log('执行')
                    that.getData();
                }, 1000)
            } else {
                wx.showToast({
                    title: res.message,
                })
            }

            setTimeout(() => {
                that.saveCanvas()
            }, 1000);

        })
    }
})