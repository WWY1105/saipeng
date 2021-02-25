// pages/my/my.js
const app = getApp()
Page({

   /**
    * 页面的初始数据
    */
   data: {
      parentThis: '',
      order: '',
      type:'',

      // // 测试
      // order:'5ddcff8f652205001145fcad',
      // type: '901',
      data:{},
      totalNum:0,

      // 广告
      money_modal:false,
      coupon_modal:false
   },


   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
      wx.hideLoading();
      this.setData({
         parentThis: this
      })
      if (options.order) {
         this.setData({
            order: options.order
         })
      }
      if (options.type) {
         this.setData({
            type: options.type
         })
      }
   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function() {

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function() {
      this.getData()
   },
   // 跳转订单详情
   toShopDetail(e){
      wx.navigateTo({
         url: '/pages/shopDetail/index?id=' + e.currentTarget.dataset.shopid + "&orderDetail=true"
      })
   },
   againRequest() {
      this.getData()
   },
   // 获取订单详情
   getData(){
      let that=this;
      // 
      let url = '/orders/' + that.data.order 
      app.util.request(that, {
         url: app.util.getUrl(url,{
            type: that.data.type
         }),
         method: 'GET',
         header: app.globalData.token,
         
      }).then((res) => {
         let data = res;
         console.log('结果')
         console.log(res)
         if (data.code == 200) {
            let num=0;
            let totalNum=0;
            if (data.result.reduceAmount){
               num = data.result.amount - data.result.reduceAmount;
               totalNum = Math.floor(num * 100) / 100 
            }else{
               totalNum = Math.floor(data.result.amount  * 100) / 100 
            }
            // 广告
            if (data.result.profits){
               that.setData({ money_modal:true})
            }
            if (data.result.redEnvelope){
               that.setData({ coupon_modal: true })
            }
            that.setData({
               data: data.result,
               totalNum
            })
         } else if (data.code == 403000) {
            wx.removeStorageSync('token')
         } else {
            wx.showToast({
               title: data.message,
               duration: 2000
            });
         }

      })
   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function() {

   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function() {

   },

   /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
   onPullDownRefresh: function() {

   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function() {

   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function() {

   }

})