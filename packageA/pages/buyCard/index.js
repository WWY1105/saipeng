// packageA/pages/buyCard/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardIndex:0,
    cardNum:1,
    cardInfo:'',
    showPhonePop:false
  },
  selectCard(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      cardIndex: index,
      cardInfo: this.data.cardList[index],
      cardNum:1
    })
  },
  minusCard() {
    if (this.data.cardNum>1){
      this.setData({
        cardNum: this.data.cardNum - 1
      })
    }   
  },
  addCard() {
    if (this.data.cardNum == 10) {
      wx.showToast({
        title: "一次最多购买10张",
        duration: 2000
      })
    }
    if (this.data.cardNum < this.data.cardInfo.stock && this.data.cardNum< 10){
      this.setData({
        cardNum: this.data.cardNum + 1
      })
    }
    
    
  },
  getShopCard() {
    var that = this
    var json = {
      shopId: this.data.id,
      page: 1
    }
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.request({
      url: app.util.getUrl('/resources/detail/shop/' + this.data.id, json),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          that.setData({
            cardList: res.data.result,
            cardInfo: res.data.result[0]
          })
        } else {
          that.setData({
            cardList: ''
          })
        }
      },
      fail(res) {
        //console.log(res)
        wx.hideLoading();
        wx.showToast({
          title: data.message,
          duration: 2000
        })
      }
    })
  },
  getUserInfo() {
    var that =this
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('phoneNum')) {
      that.setData({
        user: wx.getStorageSync('userInfo'),
        phoneNum: wx.getStorageSync('phoneNum')
      })
    } else {
      app.util.request(that, {
        url: app.util.getUrl('/user'),
        method: 'GET',
        header: app.globalData.token
      }).then((res) => {
        console.log(res)
        if (res.code == 200) {
          that.setData({
            user: res.result,
            phoneNum: res.result.phone
          })
          wx.setStorageSync('userInfo', res.result)
          if (res.result.phone) {
            wx.setStorageSync('phoneNum', res.result.phone)
            
          } else {
            wx.setStorageSync('phoneNum', false)
          }
        }
      })
    }
    
  },
  againRequest() {
    this.getUserInfo()
  },
  getPhoneNumber(e) {
    wx.showLoading({
      title: '加载中',
    })
    //console.log(e)
    var _self = this
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny' || e.detail.errMsg == 'getPhoneNumber:user deny' || e.detail.errMsg == 'getPhoneNumber:fail:user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function (res) {

        }
      })
      wx.hideLoading();
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
          } else {
            wx.showToast({
              title: data.message,
              icon: 'none',
              duration: 2000
            });
          }
        }
      });
    }
  },
  postBuyCard: app.util.throttle(function (e) {
    var that = this
    if (!this.data.phoneNum) {
      wx.showToast({
        title: "请填写手机号",
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.util.getUrl('/resources/shop/' + that.data.id + '/buy'),
      method: 'POST',
      header: app.globalData.token,
      data: {
        goodsId: that.data.cardInfo.id,
        count: that.data.cardNum
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          var payInfo = res.data.result.pay
          wx.requestPayment({
            timeStamp: payInfo.timestamp,
            nonceStr: payInfo.nonceStr,
            package: payInfo.package,
            signType: payInfo.signType,
            paySign: payInfo.paySign,
            success() {
              that.getPayResult(res.data.result.orderId)

            },
            fail() {
              that.getPayRevoke(res.data.result.orderId)
            }
          })
        } else if (res.data.code == 403060) {
          wx.hideLoading();
          that.setData({
            phonePop: true
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: "none",
            duration: 2000
          })
        }

      },
      fail(res) {
        wx.hideLoading();
        wx.showToast({
          title: "网络错误,请稍后重试",
          icon: 'none',
          duration: 2000
        })

      }
    })
  }),
  // postBuyCard() {
  //   var that = this
  //   if(!this.data.phoneNum){
  //     wx.showToast({
  //       title: "请填写手机号",
  //       icon: 'none',
  //       duration: 2000
  //     })
  //     return false;
  //   }
  //   wx.showLoading({
  //     title: '加载中',
  //     mask: true
  //   })
  //   wx.request({
  //     url: app.util.getUrl('/resources/shop/' + that.data.id + '/buy'),
  //     method: 'POST',
  //     header: app.globalData.token,
  //     data: {
  //       goodsId: that.data.cardInfo.id,
  //       count: that.data.cardNum
  //     },
  //     success: function (res) {
  //       wx.hideLoading();
  //       if (res.data.code == 200) {
  //         var payInfo = res.data.result.pay
  //         wx.requestPayment({
  //           timeStamp: payInfo.timestamp,
  //           nonceStr: payInfo.nonceStr,
  //           package: payInfo.package,
  //           signType: payInfo.signType,
  //           paySign: payInfo.paySign,
  //           success() {
  //             that.getPayResult(res.data.result.orderId)

  //           },
  //           fail() {
  //             that.getPayRevoke(res.data.result.orderId)
  //           }
  //         })
  //       } else if (res.data.code == 403060) {
  //         wx.hideLoading();
  //         that.setData({
  //           phonePop: true
  //         })
  //       } else {
  //         wx.showToast({
  //           title: res.message,
  //           icon: "none",
  //           duration: 2000
  //         })
  //       }

  //     },
  //     fail(res) {
  //       wx.hideLoading();
  //       wx.showToast({
  //         title: "网络错误,请稍后重试",
  //         icon: 'none',
  //         duration: 2000
  //       })

  //     }
  //   })
  // },
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
          wx.showToast({
            title: '支付成功',
            icon: "none",
            duration: 2000
          })
          wx.navigateTo({
            url: '/packageA/pages/payOff/index?id=' + orderId + "&price=" + that.data.cardInfo.price + "&cardNum=" + that.data.cardNum
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
              that.onLoad()
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
        if (res.data.code == 200) {
          wx.showToast({
            title: '支付失败',
            icon: "none",
            duration: 2000
          })
        } else {
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
              that.onLoad()
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      parentThis: this
    })
    this.getShopCard()
    this.getUserInfo()
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