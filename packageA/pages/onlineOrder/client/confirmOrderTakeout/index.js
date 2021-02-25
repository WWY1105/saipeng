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
      hideModal: true, //模态框的状态  true-隐藏  false-显示
      animationData: {}, //
      defaultAddress: null,
      carriageFee: 0
   },
   // 去支付
   toPay() {
      let that = this;
      let url = '/takeouts/order/' + this.data.orderId;
      if (!this.data.defaultAddress || !this.data.defaultAddress.id) {
         wx.showToast({
            title: '请填写收货地址',
            icon: 'none',
            duration: 3000
         })
         return;
      }
      let data = {
         addressId: this.data.defaultAddress.id
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
               // wx.setStorageSync('orderFinish', true)
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
               duration: 5000
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
   // 新增地址
   newAddress() {
      this.setData({
         hideModal: true
      }, () => {
         wx.navigateTo({
            url: "/packageA/pages/onlineOrder/newAddress/newAddress"
         })
      })

   },
   // 编辑地址
   editAddress(e) {
      let editObj = JSON.stringify(e.currentTarget.dataset.item)
      wx.navigateTo({
         url: "/packageA/pages/onlineOrder/newAddress/newAddress?editObj=" + editObj
      })
   },
   changeDefaultAddress(e) {
      let defaultAddress = {};
      let addressList = this.data.addressList;
      console.log(addressList);
      let index = JSON.stringify(e.currentTarget.dataset.index)
      addressList.items.map((i) => {
         console.log(i)
         i.defaultAddress = false;
      })
      addressList.items[index].defaultAddress = true;
      defaultAddress = addressList.items[index];
      console.log(defaultAddress);
      // return;
      this.setData({
         defaultAddress,
         addressList
      }, () => {
         this.setDefault()
      })
   },
   //    设置默认地址
   setDefault() {
      let url = "/user/address/" + this.data.defaultAddress.id + "/default";
      let that = this;
      let data = {};
      app.util.request(that, {
         url: app.util.getUrl(url),
         method: 'POST',
         header: app.globalData.token,
         data: data
      }).then((res) => {
         wx.hideLoading()
         if (res.code == 200) {
            that.hideModal();
            that.getCarriageFee();
         } else {
            wx.showToast({
               title: res.message,
               icon: "none",
               duration: 2000
            })
         }
      })
   },
   // 获取运费
   getCarriageFee() {
      let that = this;
      if (this.data.defaultAddress && this.data.defaultAddress.id) {
         let addressId = this.data.defaultAddress.id;
         wx.request({
            url: app.util.getUrl('/takeouts/order/' + that.data.orderId + '/address/' + addressId),
            method: 'GET',
            header: app.globalData.token,
            success: function (res) {
               wx.hideLoading();
               if (res.data.code == 200) {
                  let carriageFee = res.data.result.amount - 0
                  // 加上运费
                  let order = that.data.order;
                  if (order.amount && carriageFee) {
                     order.amount = Number(order.amount) + Number(carriageFee);
                  }
                  that.setData({
                     carriageFee,
                     order
                  })
               } else if (res.code == 4050101) {
                  wx.showModal({
                     title: '提示',
                     content: '订单已支付成功',
                     complete: () => {
                        let orderId = that.data.orderId;
                        wx.redirectTo({
                           url: '/packageA/pages/onlineOrder/orderDetail/orderDetail?orderId=' + orderId,
                        })
                     }
                  })
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
            }

         })
      }
   },

   // 新建地址
   toNewAddress() {
      wx.navigateTo({
         url: '/packageA/pages/onlineOrder/newAddress/newAddress',
      })
   },

   // 显示遮罩层
   showModal: function () {
      var that = this;
      that.setData({
         hideModal: false
      })
      var animation = wx.createAnimation({
         duration: 600, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
         timingFunction: 'ease', //动画的效果 默认值是linear
      })
      this.animation = animation
      setTimeout(function () {
         that.fadeIn(); //调用显示动画
      }, 200)
   },

   // 隐藏遮罩层
   hideModal: function () {
      var that = this;
      var animation = wx.createAnimation({
         duration: 800, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
         timingFunction: 'ease', //动画的效果 默认值是linear
      })
      this.animation = animation
      that.fadeDown(); //调用隐藏动画   
      setTimeout(function () {
         that.setData({
            hideModal: true
         })
      }, 720) //先执行下滑动画，再隐藏模块

   },

   //动画集
   fadeIn: function () {
      this.animation.translateY(0).step()
      this.setData({
         animationData: this.animation.export() //动画实例的export方法导出动画数据传递给组件的animation属性
      })
   },
   fadeDown: function () {
      this.animation.translateY(600).step()
      this.setData({
         animationData: this.animation.export(),
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
         that.setData({
            orderId: options.orderId,
            parentThis: this
         },()=>{
            that.getOrderDetail()
         })
      } else if (wx.getStorageSync('orderId')) {
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

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {
      this.setData({
         parentThis: this
      })
   },
   againRequest() {
      this.getOrderDetail()
   },
   // 获取订单
   getOrderDetail() {
      let that = this;

      app.util.request(that, {
         url: app.util.getUrl('/takeouts/order/' + that.data.orderId),
         method: 'GET',
         header: app.globalData.token
      }, false).then((res) => {

         if (res.code == 200) {
            let defaultAddress = {};
            if (res.result.deliver.address) {
               defaultAddress.address = res.result.deliver.address;
               defaultAddress.nickname = res.result.deliver.nickname;
               defaultAddress.phone = res.result.deliver.phone;
               defaultAddress.id = res.result.deliver.addressId;
            }
            that.setData({
               order: res.result,
               defaultAddress
            });
            // 订单里有地址，显示在顶部

         } else if (res.code == 4050101) {
            // if (wx.getStorageSync('orderFinish')){
            //    return;
            // }
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
   // 查询地址
   getAddress() {
      let that = this;
      app.util.request(that, {
         url: app.util.getUrl('/user/address'),
         method: 'GET',
         header: app.globalData.token
      }).then((res) => {
         wx.hideLoading();
         if (res.code == 200) {
            if (res.result.total > 0) {
               that.showModal()
            } else {
               that.toNewAddress();
            }
            that.setData({
               addressList: res.result
            })
         } else {
            that.toNewAddress()
         }
      }).catch(() => {
         wx.hideLoading();
      })
   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function () {
      // wx.setStorageSync('orderFinish', false)
      this.setData({
         hideModal: true
      })
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