const app = getApp()
Page({

   /**
    * 页面的初始数据
    */
   data: {
      parentThis: this,
      time: "",
      type: '',
      menus: [],
      total: 0,
      totalPrice: 0,
      addressList: [],
      order: null,
      orderId: "",
      description: '',
      phone: ''
   },
   descInput(e) {
      let description = e.detail.value;
      this.setData({
         description
      })
   },
   phoneInput(e) {
      let phone = e.detail.value;
      this.setData({
         phone
      })
   },
   //导航
   nav: function () {
      let that = this;
      //使用微信内置地图查看位置，地点的经纬度可用腾讯地图坐标拾取器获取（https://lbs.qq.com/tool/getpoint/）
      wx.getLocation({ //获取当前经纬度
         type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息
         success: function (res) {
            wx.openLocation({ //?使用微信内置地图查看位置。
               latitude: that.data.order.deliver.latitude, //要去地点的纬度
               longitude: that.data.order.deliver.longitude, ///要去地点的经度-地址
               name: " ", //
               address: ' '
            })
         },
      })
   },
   //  获取用户详情
   getUserInfo() {
      let that = this;
      if (wx.getStorageSync('userInfo') && wx.getStorageSync('phoneNum')) {
         wx.hideLoading()
         that.setData({
            user: wx.getStorageSync('userInfo'),
            phonePop: false
         })
      } else {
         app.util.request(that, {
            url: app.util.getUrl('/user'),
            method: 'GET',
            header: app.globalData.token
         }).then((res) => {
            console.log(res)

            if (res.code == 200) {
               wx.setStorageSync('userInfo', res.result)
               that.setData({
                  user: res.result
               })
               wx.hideLoading()
               // 去支付
               that.toPay()
               if (res.result.phone) {
                  wx.setStorageSync('phoneNum', res.result.phone)
                  that.setData({
                     phonePop: false
                  })
               } else {
                  wx.setStorageSync('phoneNum', false)
                  that.setData({
                     phonePop: true
                  })
               }

            }
         })
      }
   },
   // 去支付
   toPay() {
      let that = this;
      let url = '/takeouts/order/' + this.data.orderId;
      if (!this.checkoutPhone(this.data.phone)) {
         wx.showToast({
            title: '请输入正确格式的手机号码',
            duration: 2000,
            icon: 'none'
         })
         return false;
      }
      let data = {
         description: this.data.description,
         phone: this.data.phone
      }
      app.util.request(that, {
         url: app.util.getUrl(url),
         method: 'POST',
         header: app.globalData.token,
         data: data
      }).then((res) => {
         wx.hideLoading()
         if (res.code == 200) {
            app._wxPay(res.result.pay, () => {
               // 支付成功了
               wx.redirectTo({
                  url: '/packageA/pages/onlineOrder/paySuccess/paySuccess',
               })
            }, () => {
               that.cancelPay()
            })

         } else {
            wx.showToast({
               title: res.message,
               icon: "none",
               duration: 2000
            })
         }
      })
   },
   cancelPay() {
      let that = this;
      let url = '/pay/revoke/order/' + this.data.orderId;
      let data = {};
      app.util.request(that, {
         url: app.util.getUrl(url),
         method: 'POST',
         header: app.globalData.token,
         data: data
      }).then((res) => {
         if (res.code == 200) {} else {
            wx.showToast({
               title: res.message,
               icon: "none",
               duration: 2000
            })
         }
      })
   },
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      wx.hideLoading()
      let that = this;
      if (options.orderId) {
         wx.setStorageSync('orderId', options.orderId)
         this.setData({
            orderId: options.orderId,
            parentThis: this
         }, () => {
            that.getOrderDetail()
         })
      }else if (wx.getStorageSync('orderId')) {
         that.setData({
            orderId: wx.getStorageSync('orderId'),
            parentThis: that
         },()=>{
            that.getOrderDetail()
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
      this.mapCtx = wx.createMapContext('myMap')
   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {
      // this.getOrderDetail();

   },
   againRequest() {
      this.toPay()
   },
   // 获取订单
   getOrderDetail() {
      let that = this;
      app.util.request(that, {
         url: app.util.getUrl('/takeouts/order/' + this.data.orderId),
         method: 'GET',
         header: app.globalData.token
      }, false).then((res) => {
         wx.hideLoading();
         if (res.code == 200) {

            that.setData({
               order: res.result
            })
         } else if (res.code == 4050101) {
            if (app.globalData.scene == 1007 || app.globalData.scene == 1008) {
               wx.showModal({
                  title: '提示',
                  content: '订单已支付成功',
                  confirmText: "我知道了",
                  showCancel: false,
                  complete: () => {
                     let orderId = that.data.orderId;
                     let url = '/packageA/pages/onlineOrder/order/order';
                     wx.redirectTo({
                        url
                     })
                  }
               })
            }
         } else {
            wx.showModal({
               title: '提示',
               content: '订单已结束',
               confirmText: "我知道了",
               showCancel: false,
               complete: () => {
                  wx.redirectTo({
                     url: '/pages/index/index',
                  })
               }
            })
         }
      }).catch(() => {
         wx.hideLoading();
      })
   },
   checkoutPhone(tel) { //校验电话
      if (tel != "") {
         var strRegex = /^(13|14|15|17|18)\d{9}$/;
         if (!strRegex.test(tel)) {
            return false;
         }
      } else {
         return false;
      }
      return true;
   },


   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function () {
      // wx.setStorageSync('orderFinish', false)

   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function () {},

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