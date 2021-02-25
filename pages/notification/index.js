// pages/my/my.js
const app = getApp()
Page({

   /**
    * 页面的初始数据
    */
   data: {
      parentThis: '',
      guestId: '',
      type:'',
      param:'',


      //  测试
      // guestId:'e00d8d7d90f849799ac886491b9f042b',
      // type: '911',
      //  param: '5dd60a3d7d560d0011842c13',
      // type: '904',
      // param: '9032b063fd4f489ca32098a7d626ebeb',
      data:{},
      totalNum:0
   },


   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
      wx.hideLoading();
      this.setData({
         parentThis: this
      })
      if (options.guest) {
         this.setData({
            guestId: options.guest
         })
      }
      if (options.type) {
         this.setData({
            type: options.type
         })
      }
      if (options.param) {
         this.setData({
            param: options.param
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
      wx.hideLoading()
   },
   // 跳转订单详情
   toShopDetail(e){
      wx.navigateTo({
         url: '/pages/shopDetail/index?id=' + e.currentTarget.dataset.shopid + "&orderDetail=true"
      })
   },
   // 获取订单详情
   getData(){
      let that=this;
      // 
      let url = '/orders/notice';
      let json={
         type: that.data.type,
         guestId: that.data.guestId,
      }
      if (that.data.param){
         json.param = that.data.param
      }
      app.util.request(that, {
         url: app.util.getUrl(url,json),
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
            let benefitsArr=[];
            if (data.result.benefits&&data.result.benefits.indexOf('，')>-1){
               benefitsArr = data.result.benefits.split('，');
            }
            if (!data.result.benefits){
               data.result.benefits=''
            }
            data.result.benefitsArr = benefitsArr;
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
   againRequest() {
      this.getData()
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