// pages/order/cardOrderDetail/cardOrderDetail.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoading: true,
        id: '',
        orderDetail: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.id) {
            this.setData({
                id: options.id
            })
        }
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
        this.getOrderDetail()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

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

    },
    getOrderDetail() {
        let that = this;
        let url = '/orders/' + this.data.id;
        app.util.request(that, {
            url: app.util.getUrl(url, {}),
            method: 'GET',
            header: app.globalData.token,
        }).then((res) => {
            this.setData({
                showLoading: false
            })
            if (res.code == 200) {
                let orderDetail = res.result;
                that.setData({
                    orderDetail
                })
            }
        })
    },
    refund() {
        let that = this;
        let url = '/refunds/' + this.data.id;
        wx.showModal({
            title: '申请退款',
            content: '确定要申请退款？',
            cancelText: "否", //默认是“取消”
            confirmText: "是", //默认是“确定”
            success: function (res) {
                if (res.cancel) {
                    //点击取消,默认隐藏弹框
                } else {
                    //点击确定
                    app.util.request(that, {
                        url: app.util.getUrl(url, {}),
                        method: 'POST',
                        header: app.globalData.token,
                    }).then((res) => {
                        wx.hideLoading()
                        if (res.code == 200) {
                            wx.showModal({
                                title: "退款成功",
                                complete: () => {
                                    wx.navigateBack()
                                }
                            })
                        }else{
                            wx.showModal({
                                title: '提示',
                                content:res.message,
                                confirmText: "我知道了",
                                showCancel: false
                             })
                          }
                    })
                }
            }
        })

    },
    //去使用
    toUse(e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/coupon/index?id=' + id,
        })
    }
})