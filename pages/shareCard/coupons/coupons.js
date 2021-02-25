// pages/shareCard/coupons/coupons.js
const app=getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoading:true,
        shareId:'',
        id:'',
        coupons:null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideLoading()
       if(options.id){
           this.setData({id:options.id})
       }
       if(options.shareId){
           this.setData({shareId:options.shareId})
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
        let url="/pages/shareCard/joinShare/joinShare?id="+ this.data.id+"&type=coupon";
        let title='这是一张共享优惠券，名额有限，速领！';
        console.log(url)
        return {
            title: title,
            path:url,
            imageUrl:this.data.coupons.share.picUrl
        }
    },
    // 获取数据
    getData(){
        let that = this;
        let id = this.data.activityId;
        app.util.request(that, {
            url: app.util.getUrl('/shares/'+this.data.id+'/coupons'),
            method: 'GET',
            header: app.globalData.token
        }).then((res) => {
            this.setData({showLoading:false})
            if (res.code == 200) {
                wx.hideLoading()
                that.setData({
                    coupons: res.result
                })
  
            }
        })
    },
    //去使用
    toUse(e){
        let id=e.currentTarget.dataset.id;
        wx.navigateTo({
          url: '/pages/coupon/index?id='+id,
        })
    } 
})