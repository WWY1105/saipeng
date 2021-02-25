// pages/onlineOrder/submitOrder/submitOrder.js
const app = getApp()
Page({
   /**
    * 页面的初始数据
    */
   data: {
      editOrder: null,
      editFlag: false,
      orderId: '',
      order:{}
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      wx.hideLoading()
   
      if (options.orderId) {
         this.setData({
            orderId: options.orderId,
            
         })
      }
   },


   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {

   },
// 获取订单详情
getOrderDetail() {
   let that = this;
   let url = '/takeouts/orders/' + this.data.orderId;
   app.util.request(that, {
     url: app.util.getUrl(url, {
     }),
     method: 'GET',
     header: app.globalData.token,
   }).then((res) => {
     console.log(res)
     if (res.code == 200) {
     
       that.setData({
         order: res.result
       })
     } else {
      
     }
   })
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

   }
})