// pages/component/buyCardPop.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showPop: {
      type: Boolean,
      value: false
    },
    cardId: {
      type: String,
      value: ''
    },
    parentThis: {
      type: Object,
      value: ''
    },
    shopId: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    popThis:'',
    cardId:"",
    cardInfo:'',
    showConfirmPop:false,
    lackGoldPop:false,
    selectRadio:false,
    currentTab:0,
    buyList:'',
    rulePop:false,
    rulePop2:false,
    shopId:'',
    selectRadio:true,
    payInfo:'',
    resourceType: { "1014": "充值金额", "1015": "积分", "1016": "券", "1017": "代用币", "1018": "红票", "1019": "储值卡" }
  },
  attached() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    this.setData({
      popThis: this
    })
    var that = this
    wx.request({
      url: app.util.getUrl('/resources/' + that.data.cardId),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        //console.log(res)
        wx.hideLoading();
        if (res.data.code == 200) {
          wx.hideLoading();
          console.log(res.data.result)
          that.setData({
            cardInfo: res.data.result
          })
        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      },fail(){
        wx.hideLoading();
        wx.showToast({
          title: "网络错误,请稍后再试",
          icon: 'none',
          duration: 2000
        })
      }
    })

    // app.util.request(that, {
    //   url: app.util.getUrl('/cards/' + that.data.cardId),
    //   method: 'GET',
    //   header: app.globalData.token
    // }).then((res) => {
    //   wx.hideLoading();
    //   if (res.code == 200) {
    //     wx.hideLoading();
    //     that.setData({
    //       cardInfo: res.result
    //     })
    //     wx.request({
    //       url: app.util.getUrl('/coin'),
    //       method: 'GET',
    //       header: app.globalData.token,
    //       success: function (res) {
    //         //console.log(res)
    //         if (res.data.code == 200) {
    //           that.setData({
    //             goldNum: res.data.result
    //           })
    //         }
    //       }
    //     })
    //   }
    // })
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    againRequest() {
      this.getCoin();
      this.setData({
        showConfirmPop: true
      })
    },
    openConfirmPop() {
      var that = this
      wx.showLoading({
        title: '加载中',
        mask:true
      })
      app.util.request(that, {
        url: app.util.getUrl('/coin'),
        method: 'GET',
        header: app.globalData.token
      }).then((res) => {
        wx.hideLoading();
        if (res.code == 200) {
          that.setData({
            goldNum: res.result
          })
          if (that.data.cardInfo.price > that.data.goldNum){
            that.setData({
              lackGoldPop: true
            })
          }else{
            that.setData({
              showConfirmPop: true
            })
          }
        }
      }).catch(()=>{
        wx.hideLoading();
      })
      
    },
    openRule() {
      this.setData({
        rulePop: true
      })
    },
    openRule2() {
      this.setData({
        rulePop2: true
      })
    },
    openBuyGoldPop() {
      this.getBuyList();
      
    },
    closeRule() {
      this.setData({
        rulePop: false,
        rulePop2: false
      })
    },
    closeConfirmPop() {
      this.setData({
        showConfirmPop: false
      })
    },
    closeShowPop() {
      this.data.parentThis.closeBuyCardPop()
    },
    closeLackGoldPop() {
      this.setData({
        lackGoldPop: false,
        showConfirmPop: false
      })
    },
    closeBuyGoldPop() {
      this.closeLackGoldPop();
      this.setData({
        buyGoldPop: false
      })
    },
    closeSuccessPop() {
      this.setData({
        successPop: false
      })
      var that = this
      wx.request({
        url: app.util.getUrl('/resources/' + that.data.cardId),
        method: 'GET',
        header: app.globalData.token,
        success: function (res) {
          //console.log(res)
          wx.hideLoading();
          if (res.data.code == 200) {
            wx.hideLoading();
            console.log(res.data.result)
            that.setData({
              cardInfo: res.data.result
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    },
    postBuyCard() {
      var that = this
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.util.getUrl('/resources/shop/' + that.data.shopId + '/buy'),
        method: 'POST',
        header: app.globalData.token,
        data: {
          goodsId: that.data.cardInfo.id
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
    },
    closeSuccessPop2() {
      this.setData({
        successPop2: false
      })
    },
    postBuyGold() {
      var that = this
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      app.util.request(that, {
        url: app.util.getUrl('/coin/buy'),
        method: 'POST',
        header: app.globalData.token,
        data: {
          goodsId: that.data.payInfo.id
        }
      }).then((res) => {
        wx.hideLoading();
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
        } else if (res.code == 403060) {
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
      }).catch((res) => {
        wx.hideLoading();
        if (res.code == 403060) {
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
      })

    },
    againBuyCard() {
      this.setData({
        successPop2: false,
        showConfirmPop: true
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
            wx.showToast({
              title: '支付成功',
              icon: "none",
              duration: 2000
            })
            that.getCoin();
            that.setData({
              successPop2:true,
              buyGoldPop:false,
              lackGoldPop:false
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
                that.onShow()
              }
            }
          })
        }
      })
    },
    getCoin() {
      var that = this
      app.util.request(that, {
        url: app.util.getUrl('/coin'),
        method: 'GET',
        header: app.globalData.token
      }).then((res) => {
        wx.hideLoading();
        if (res.code == 200) {
          wx.hideLoading();
          that.setData({
            goldNum: res.result
          })
        }
      })
    },
    selectBtn(e) {
      var cur = e.target.dataset.current;
      this.setData({
        payInfo: e.target.dataset.payinfo
      })
      console.log(this.data.payInfo)
      var that = this
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
    postCard() {
      var that = this
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.util.getUrl('/resources/shop/' + that.data.shopId+'/displace'),
        method: 'POST',
        header: app.globalData.token,
        data:{
          id: that.data.cardInfo.id
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 200) {
            
            console.log(res.data.result)
            that.getCoin();
            that.setData({
              successPop: true
            })
          }
          if(res.data.code == 405920) {
            that.setData({
              lackGoldPop:true
            })
          }
          if (res.data.code == 405901) {
            wx.showToast({
              title: res.data.message,
              icon:'none',
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
    },
    getBuyList() {
      var that = this
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.util.getUrl('/coin/shelves'),
        method: 'GET',
        header: app.globalData.token,
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 200) {
            that.setData({
              buyList: res.data.result,
              payInfo: res.data.result[0],
              buyGoldPop: true
            })
          }else{
            wx.showToast({
              title: '金币暂已售完',
              icon:'none',
              duration: 2000
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
    toMyCard: app.util.throttle(function () {
      wx.navigateTo({
        url: '/packageA/pages/myCard/index'
      })
    }),
    toMyCardDetail: app.util.throttle(function () {
      wx.navigateTo({
        url: '/packageA/pages/myCardDetail/index?id=' + this.data.cardId
      })
    }),
    closePhonePop() {
      this.setData({
        phonePop: false
      })
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
            wx.hideLoading();
            this.setData({
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
  }
})
