// packageA/pages/orderDetail/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     parentThis:'',
     id:'',
     posts:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     let that=this;
     this.setData({
        parentThis: this
     })
     if(options.id){
        this.setData({
           id: options.id
        })
        that.getDetail(options.id)
     }
     wx.hideLoading()
  },
   // 防止多次点击
   toShopDetail: app.util.throttle(function (e) {
      var id = e.currentTarget.dataset.id;
      // 发起者
      wx.navigateTo({
         url: '/pages/shopDetail/index?id=' + id
      })

   }),
   againRequest() {
      this.getData(this.data.id)
   },

   getDetail(id){
      var url = app.util.getUrl('/rebates/obtainer/'+id);
      let that=this;
      wx.request({
         url: url,
         method: 'GET',
         header: app.globalData.token,
         success: function (res) {
            let data = res.data;
            if (data.code == 200) {
               that.setData({
                  posts:data.result
               })
            } else if (data.code == 403000) {
               wx.removeStorageSync('token')
            } else {
               if (data.message){
                  wx.showToast({
                     title: data.message,
                     duration: 2000
                  });
               }
               
            }
         }
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

  }
})