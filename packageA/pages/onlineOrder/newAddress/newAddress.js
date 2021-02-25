// packageA/pages/onlineOrder/newAddress.js
const app = getApp()
Page({
   /**
    * 页面的初始数据
    */
   data: {
      latitude: 0,
      longitude: 0,
      address: "",
      addressDetail: "",
      nickname: "",
      phone: "",
      defaultAddress: false,
      editObj: null
   },
   nicknameInput(e) {
      let nickname = e.detail.value;
      this.setData({
         nickname
      })
   },
   addressDetailInput(e) {
      let addressDetail = e.detail.value;
      this.setData({
         addressDetail
      })
   },
   phoneInput(e) {
      let phone = e.detail.value;
      this.setData({
         phone
      })
   },
   // 重新授权地址
   to_auth_address: function() {
      console.log('点击了')
      // this.getLocation();
      var that = this;
      wx.getSetting({
         success: (res) => {
            console.log(res);
            console.log(res.authSetting['scope.userLocation']);
            if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
               wx.openSetting({
                  success: function(data) {
                     console.log(data);
                     if (data.authSetting["scope.userLocation"] == true) {
                        wx.showToast({
                           title: '授权成功',
                           icon: 'success',
                           duration: 5000
                        })
                        //再次授权，调用getLocationt的API
                        app.util.getLocation(that);
                     } else {
                        wx.showToast({
                           title: '授权失败',
                           icon: 'success',
                           duration: 5000
                        })
                     }
                  }
               })
            } else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
               app.util.getLocation(that);
            }
         }
      })
   },
   againRequest() {
      this.submit()
   },
   // 提交信息
   submit() {
      let that = this;
      let data = {
         latitude: this.data.latitude,
         longitude: this.data.longitude
      };
      if (!this.data.address) {
         wx.showToast({
            title: '提示',
            content: '请输入收货地址',
            icon: 'none'
         })
      } else {
         data.address = this.data.address;
      }
      if (!this.data.addressDetail) {
         wx.showToast({
            title: '提示',
            content: '请输入门牌号',
            icon: 'none'
         })
      } else {
         data.addressDetail = this.data.addressDetail;
      }
      if (!this.data.nickname) {
         wx.showToast({
            title: '提示',
            content: '请输入联系人姓名',
            icon: 'none'
         })
      } else {
         data.nickname = this.data.nickname;
      }
      if (!this.checkoutPhone(this.data.phone)) {
         wx.showToast({
            title: '请输入正确格式的手机号码',
            duration: 2000,
            icon: 'none'
         })
         return false;
      } else {
         data.phone = this.data.phone;
      }
      // 修改地址 
      if (this.data.editObj) {
         app.util.request(that, {
            url: app.util.getUrl('/user/address/' + this.data.editObj.id),
            method: 'PUT',
            header: app.globalData.token,
            data: data
         }).then((res) => {
            wx.hideLoading()
            if (res.code == 200) {
               wx.redirectTo({
                  url: '/packageA/pages/onlineOrder/client/confirmOrderTakeout/index',
               })
            } else {
               wx.showToast({
                  title: res.message,
                  icon: "none",
                  duration: 2000
               })
            }
         })
      } else {
         //新增地址
         app.util.request(that, {
            url: app.util.getUrl('/user/address'),
            method: 'POST',
            header: app.globalData.token,
            data: data
         }).then((res) => {
            wx.hideLoading()
            if (res.code == 200) {
               let editObj = {};
               editObj.id = res.result.id;
               that.setData({
                  editObj
               }, () => {
                  that.switch2Change()
               })
            } else {
               wx.showToast({
                  title: res.message,
                  icon: "none",
                  duration: 2000
               })
            }
         })
      }

   },
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
      wx.hideLoading()
      this.setData({
         parentThis: this
      })
      if (options.editObj) {
         wx.setNavigationBarTitle({
            title: '修改收货地址',
         })
         let editObj = JSON.parse(options.editObj)
         this.setData({
            editObj: editObj,
            address: editObj.address,
            addressDetail: editObj.addressDetail,
            nickname: editObj.nickname,
            phone: editObj.phone,
            defaultAddress: editObj.defaultAddress
         })
         console.log(options.editObj)
      }
   },
   //    设置默认地址
   setDefault() {
      let url = "/user/address/" + this.data.editObj.id + "/default";
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
            
            setTimeout(() => {
               wx.redirectTo({
                  url: '/packageA/pages/onlineOrder/client/confirmOrderTakeout/index',
               })
            }, 1000)

         } else {
            wx.showToast({
               title: res.message,
               icon: "none",
               duration: 2000
            })
         }
      })
   },

   switch2Change(e) {
      this.setDefault()
   },
   // switch2Change(e){
   //     console.log(e.detail.value)
   // },
   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function() {

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
    * 生命周期函数--监听页面显示
    */
   onShow: function() {
      // app.locationCheck();
      wx.hideLoading();
   },
   toGetAddress() {
      let that = this;
      wx.hideLoading();
      let latitude = wx.getStorageSync('latitude');
      let longitude = wx.getStorageSync('longitude');
      if (!longitude || !latitude) {
         this.to_auth_address();
         return;
      }
      // app.locationCheck(() => {
      //    this.setData({
      //       latitude,
      //       longitude
      //    })
      //    wx.chooseLocation({
      //       latitude,
      //       longitude,
      //       success: function(res) {
      //          let address = res.address + res.name;
      //          that.setData({
      //             address
      //          })
      //       },
      //    })
      // })

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