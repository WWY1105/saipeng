// pages/business/index.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        t:false,
        id: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideLoading();
        //  var json=options
        var json = {}
        if (options.q != null && options.q != '') {
            var src = decodeURIComponent(options.q);
            console.log('src')
            console.log(src)
            var a = src.split("?");
            if (a[1] != null && a[1] != '') {
                var b = a[1].split("&");
                for (var i = 0; i < b.length; i++) {
                    var bb = b[i].split("=")
                    if (bb[1] != null && bb[1] != '') {
                        json[bb[0]] = bb[1]
                    }
                }
            }
        }
        if (json.t) {
            this.setData({
                t:json.t
            })
        }
        if (json.id) {
            this.setData({
                id:json.id
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
        this.getData()
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
    getData: function () {
     
        let that = this;
        let url = '';
        if(!this.data.t){
            wx.redirectTo({
                url: '/pages/shareCard/buyCard/buyCard?activityId=' +this.data.id
            })
            return;
        }
        if (this.data.t == 'p') {
            url = '/business/promotes/' + this.data.id
        }
        if (this.data.t == 'd') {
            url = '/business/dynamics/' + this.data.id
        }
        app.util.request(that, {
            url: app.util.getUrl(url),
            method: 'GET',
            header: app.globalData.token
        },false).then((res) => {
            wx.hideLoading();
            if (res.code == 200) {
                if (res.result && res.result.business) {
                    switch (res.result.business) {
                        case '1010':
                            wx.redirectTo({
                                url: '/pages/shareCard/buyCard/buyCard?activityId=' + res.result.activityId + '&shopId=' + res.result.shopId,
                            })
                    }
                }
            }
        })
    }
})