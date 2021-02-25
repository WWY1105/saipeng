const app = getApp()
Page({

   /**
    * 页面的初始数据
    */
   data: {
      time: "",
      type: '',
      menus: [],
      total: 0,
      totalPrice: 0,
      addressList: [],
      order: null,
      orderId: ""
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      wx.hideLoading()
      let that = this;
      if (options.orderId) {
         this.setData({
            orderId: options.orderId
         })
      }
   },

   // 提交订单
   submit() {

   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {

   },
   againRequest() {
      this.getOrderDetail()
   },
   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {
      this.getOrderDetail()
      this.setData({
         parentThis: this
      })

   },
   // 获取订单
   getOrderDetail() {
      let that = this;
      app.util.request(that, {
         url: app.util.getUrl('/takeouts/order/' + this.data.orderId),
         method: 'GET',
         header: app.globalData.token
      },false).then((res) => {
         wx.hideLoading();
         if (res.code == 200) {
            that.setData({
               order: res.result
            })
         } else {
            wx.showModal({
               title: '提示',
               content: res.message,
               complete: () => {
                  let orderId = that.data.orderId;
                  wx.redirectTo({
                     url: '/packageA/pages/onlineOrder/orderDetail/orderDetail?orderId=' + orderId,
                  })
               }
            })
         }
      }).catch(() => {
         wx.hideLoading();
      })
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
   toSend() {
      setTimeout(() => {
         console.log('执行')
         wx.redirectTo({
            url: '/pages/index/index'
         })
      }, 1000)
   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function () {
      let path = '';
      let title = '';
      let names = '';
      let menus = this.data.order.menus;
      const MAX_LENGTH = 30;
      let str1 = '请确认付款【';
      menus.map((i) => {
         i.name = i.name + ','
         names += i.name;
      })
      // let str2=names;
      let str3 = '...';
      let str4 = '等' + this.data.order.total + '件商品】';
      let str5 = '￥' + this.data.order.amount;
      console.log(str1.length + names.length + str3.length + str4.length + str5.length)
      let nameLength = MAX_LENGTH - str1.length - str3.length - str4.length - str5.length;
      names = names.substr(0, nameLength);
      title = str1 + names + str3 + str4 + str5;
      console.log('nameLength' + nameLength);
      if (this.data.order.deliver.type == '1001' || this.data.order.deliver.type == 1001) {
         path = 'packageA/pages/onlineOrder/client/confirmOrderTakeout/index?orderId=' + this.data.orderId
      } else {
         path = 'packageA/pages/onlineOrder/client/confirmOrderSelf/index?orderId=' + this.data.orderId
      }
      return {
         title: title,
         path: path
      }
   }
})