// packageA/pages/buyGold/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    selectRadio:true,
    rulePop:false,
    rulePop2: false,
    buyList:'',
    payInfo: '',
    phonePop:false,
    parentThis:'',
    goldNum:'',
    shops:'',
    listIndex:''
  },
  selectBtn(e){
    var cur = e.target.dataset.current;
    this.setData({
      payInfo: e.target.dataset.payinfo
    })
    
    var that = this
    console.log(e)
    if (this.data.currentTab == cur) { return false; }
    else {
      this.setData({
        currentTab: cur,
      })
    }
  },
  selectRadio() {
    this.setData({
      selectRadio: !this.data.selectRadio
    })
  },
  openRule() {
    this.setData({
      rulePop:true
    })
  },
  openRule2() {
    this.setData({
      rulePop2: true
    })
  },
  closeRule(){
    this.setData({
      rulePop: false,
      rulePop2: false
    })
  },
  toGoldDetail: app.util.throttle(function () {
    wx.navigateTo({
      url: '/packageA/pages/goldDetail/index'
    })
  }),
  toUseGoldShop: app.util.throttle(function () {
    wx.navigateTo({
      url: '/packageA/pages/useGoldShop/index'
    })
  }),

  againRequest() {
    this.postBuyGold();
  },
  getGoldNum() {
    var that = this
    wx.request({
      url: app.util.getUrl('/coin'),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        //console.log(res)
        if (res.data.code == 200) {
          that.setData({
            goldNum: res.data.result
          })
          wx.setStorageSync('goldNum', res.data.result)
        }
      }
    })
  },
  getBuyList() {
    var that = this
    wx.request({
      url: app.util.getUrl('/coin/shelves'),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          that.setData({
            buyList: res.data.result
          })
          if (that.data.listIndex){
            that.setData({
              payInfo: res.data.result[that.data.listIndex],
              currentTab: that.data.listIndex
            })
          }else{
            that.setData({
              payInfo: res.data.result[0]
            })
          }
        }
      },
      fail(res) {
        //console.log(res)
        wx.showToast({
          title: data.message,
          duration: 2000
        })
      }
    })
  },
  postBuyGold() {
    var that = this
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    app.util.request(that,{
      url: app.util.getUrl('/coin/buy'),
      method: 'POST',
      header: app.globalData.token,
      data: {
        goodsId: that.data.payInfo.id
      }
    }).then((res)=>{
      wx.hideLoading()
       if (res.code == 200) {
         var payInfo = res.result.pay
         wx.requestPayment({
           timeStamp: payInfo.timestamp,
           nonceStr: payInfo.nonceStr,
           package: payInfo.package,
           signType: payInfo.signType,
           paySign: payInfo.paySign,
           success() { 
             that.getPayResult(res.result.orderId)

           },
           fail() { 
             that.getPayRevoke(res.result.orderId)
            }
         })
        } else if (res.code == 403060){
          that.setData({
            phonePop:true
          })
        }else{
          wx.showToast({
            title: res.message,
            icon:"none",
            duration: 2000
          })
        }
    }).catch((res)=>{
      wx.hideLoading()
      if (res.code == 403060) {
        that.setData({
          phonePop: true
        })
      }else {
        wx.showToast({
          title: res.message,
          icon: "none",
          duration: 2000
        })
      }
    })
    
  },

  closePhonePop() {
    this.setData({
      phonePop: false
    })
  },
  getPayResult(orderId) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this
    wx.request({
      url: app.util.getUrl('/pay/result/order/' + orderId),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        wx.hideLoading();
        console.log(res)
        if (res.data.code == 200) {
          that.getGoldNum();
          wx.showToast({
            title: '支付成功',
            icon: "none",
            duration: 2000
          })
          
          wx.navigateTo({
            url: '/packageA/pages/payOff/index?id=' + orderId + "&price=" + that.data.payInfo.price + "&coin=" + (that.data.payInfo.goods.principal * 1 + (that.data.payInfo.goods.given * 1 || 0))
          })
        } else {
          
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '网络超时',
          showCancel: false,
          confirmText: '重试',
          success(res) {
            if (res.confirm) {
              that.onShow()
            }
          }
        })
      }
    })
  },
  getPayRevoke(orderId) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this
    wx.request({
      url: app.util.getUrl('/pay/revoke/order/' + orderId),
      method: 'POST',
      header: app.globalData.token,
      success: function (res) {
        wx.hideLoading();
        console.log(res)
          if(res.data.code==200){
            wx.showToast({
              title: '支付失败',
              icon: "none",
              duration: 2000
            })
          }else{
            wx.showToast({
              title: res.data.message,
              icon: "none",
              duration: 2000
            })
          }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '网络超时',
          showCancel: false,
          confirmText: '重试',
          success(res) {
            if (res.confirm) {
              that.onShow()
            }
          }
        })
      }
    })
  },

  getPhoneNumber(e) {
    // wx.showLoading({
    //   title: '加载中',
    //   mask:true
    // })
    console.log(e)
    var _self = this
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny' || e.detail.errMsg == 'getPhoneNumber:user deny' || e.detail.errMsg == 'getPhoneNumber:fail:user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function (res) {
          wx.hideLoading();
          _self.setData({
            phonePop: true
          })
        }
      })
    } else {

      wx.request({
        url: app.util.getUrl('/phone/bind'),
        method: 'POST',
        data: {
          "iv": e.detail.iv,
          "encryptedData": e.detail.encryptedData,
        },
        header: app.globalData.token,
        success: function (res) {
          //console.log("/phone/bind")
          //console.log(res)
          wx.hideLoading();
          let data = res.data;
          if (data.code == 200) {
            if (data.result) {
              wx.setStorageSync('token', data.result.token);
              app.globalData.token.token = data.result.token
            }
            _self.setData({
              phonePop: false
            })
            wx.showToast({
              title: "授权成功",
              duration: 2000
            });
            _self.postBuyGold();
          } else {
            wx.showToast({
              title: data.message,
              icon: 'none',
              duration: 2000
            });
          }
        },fail(){
          wx.hideLoading();
        }
      });
    }
  },
  getShops() {
    var that = this
    var storge = wx.getStorageSync("location")
    var json = {
      city: storge.chooseCode,
      count:5
    }
    wx.request({
      url: app.util.getUrl('/coin/shops', json),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        wx.hideLoading();
        console.log(res)
        if (res.data.code == 200) {
          that.setData({
            shops: res.data.result.items
          })
        } 
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      parentThis: this
    })
    if (options.index){
      this.setData({
        listIndex: options.index
      })
    }
    this.getShops();
    this.getBuyList();
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
    
    if (wx.getStorageSync('goldNum')) {
      this.setData({
        goldNum: wx.getStorageSync('goldNum')
      })
    } else if (wx.getStorageSync('token')){
      this.getGoldNum();
    }
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