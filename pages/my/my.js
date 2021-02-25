
// pages/my/my.js
const app = getApp()
Page({

   /**
    * 页面的初始数据
    */
   data: {
      showLoading:false,
      parentThis: '',
      code: '',
      user: '',
      info: '',
      phonePop: false,
      showPhonePop: false,
      codepop: false,
      myProfits:0,
      imgNum:0,// 正在发
      endNum:0,// 已结束
     ongoingRebates: 0,
     hasToken:false
   },
   againRequest() {
        //  获取用户详情
        this.getUserInfo()

        // 我的共享卡
        this.getCardList()
   },
   // 点击去登陆
   toLogin(e){
      let _self=this;
      wx.login({
         success: res => {
            console.log(res)
            wx.request({
               url: app.util.getUrl('/auth/sign'),
               method: 'POST',
               header: {
                  'apiKey': '6b774cc5eb7d45818a9c7cc0a4b6920f' // 默认值
               },
               data: {
                  'code': res.code,
                  "iv": e.detail.iv,
                  "encryptedData": e.detail.encryptedData,
               },
               success: function (res) {
                  wx.hideLoading();
                  let data = res.data;
                  if (data.code == 200) {
                     if (data.result.token) {
                        _self.setData({hasToken:true})
                        wx.setStorageSync('token', data.result.token);
                        app.globalData.token.token = data.result.token;
                     }

                     // ----------------
                     app.util.request(_self, {
                        url: app.util.getUrl('/user'),
                        method: 'GET',
                        header: app.globalData.token
                     }).then((res) => {
                        console.log(res)
                        if (res.code == 200) {
                           wx.hideLoading()
                           app.globalData.userInfo = res.result
                           wx.setStorageSync('userInfo', res.result)
                           _self.setData({
                              showImg: false,
                              lock: false
                           })
                           wx.showToast({
                              title: '授权成功',
                              duration: 1000
                           });

                        } else {
                           wx.showToast({
                              title: res.message ,
                              duration: 2000
                           });
                          
                        }
                     })
                     // ----------------
                        //刷新当前页面的数据
                        _self.data.parentThis.againRequest()
                  } else {
                     wx.showToast({
                        title: data.message ,
                        duration: 2000
                     });
                    
                  }
               },
               fail: function (res) {
                  wx.hideLoading();
                  let data = res.data;
                  wx.showToast({
                     title: data.message,
                     duration: 2000
                  });

               }
            })
         }
      })

   },
   // 跳转
   goto: app.util.throttle(function(e) {
      let name = e.currentTarget.dataset.navname;
      let that=this;
      // wx.
      let url;
      if (name == 'myBenefit' || name == 'red_envelopes_ing' || name =='red_envelopes_ed') {
         url = '/packageA/pages/' + name + '/index';
      } else if (name =='incomeRecord'){
         url = '/pages/' + name + '/index?total=' + this.data.myProfits;
      }else if (name =='order'){
         // url = '/packageA/pages/onlineOrder/order/order';
         url="/pages/order/cardOrder/cardOrder"
      }else if(name =='myCardList'){
         url='/pages/shareCard/myCardList/myCardList'
      }else{
         url = '/pages/' + name + '/index';
      }

      wx.navigateTo({
         url: url
      })
   }),
   // 获取电话号
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
            success: function(res) {

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
            success: function(res) {
               wx.hideLoading();
               let data = res.data;
               if (data.code == 200) {
                  if (data.result) {
                     wx.setStorageSync('token', data.result.token);
                     app.globalData.token.token = data.result.token
                  }
                  wx.setStorageSync('userInfo', false)
                  _self.setData({
                     hasToken:true,
                     showPhonePop: false,
                     codepop: true,
                     phonePop: true
                  })
                  wx.showToast({
                     title: "授权成功",
                     duration: 2000
                  });
                  _self.onShow()
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
   toGradeRule: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/gradeRule/index'
      })
   }),
   toMyCard: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/myCard/index'
      })
   }),
   toMyApprentice: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/myApprentice/index'
      })
   }),
   toProfit: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/profit/profit'
      })
   }),
   toMyBenefit: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/myBenefit/index'
      })
   }),
   toMyTask: app.util.throttle(function() {
      wx.navigateTo({
         url: '/pages/mytask/index'
      })
   }),
   toBuyGold: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/buyGold/index'
      })
   }),
   toGoldDetail: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/goldDetail/index?goldNum=' + this.data.goldNum
      })
   }),
   toRanking: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/ranking/index'
      })
   }),
   showToast() {
      wx.showToast({
         title: '更多功能, 敬请期待',
         icon: 'none',
         duration: 2000
      })
   },
   hiddenPop() {
      this.setData({
         codepop: false,
         code: ''
      })
   },
   showPop() {
      if (this.data.phonePop) {
         this.setData({
            showPhonePop: true
         })
      } else {
         this.setData({
            codepop: true
         })
      }

   },
   getValue(e) {
      this.setData({
         code: e.detail.value
      })
   },
   postCode() {
      var that = this
      if (!this.data.code) {
         wx.showToast({
            title: '不能为空',
            icon: 'none',
            duration: 2000
         })
         return false;
      }
      var json = {
         code: this.data.code
      }
      wx.showLoading({ 
         title: '加载中',
         mask: true
      })
      //console.log(this.data.code)
      wx.request({
         url: app.util.getUrl('/spotter/cdkey'),
         method: 'POST',
         data: json,
         header: app.globalData.token,
         success: function(res) {
            //console.log(res)
            //console.log(res.data.code)
            wx.hideLoading();
            if (res.data.code == 200) {
               wx.showToast({
                  title: '使用成功',
                  icon: 'success',
                  duration: 2000
               })

               var timer = setTimeout(function() {
                  that.hiddenPop();
                  clearTimeout(timer)
                  that.onShow()
               }, 1000)
            } else {
               wx.showModal({
                  title: '提示',
                  content: res.data.message + ''
               })
            }
         },
         fail: function(res) {
            wx.showModal({
               title: '提示',
               content: res.data.message + ''
            })
         }
      })
   },
   closePhonePop() {
      this.setData({
         showPhonePop: false
      })
   },
   getGoldNum() {
      var that = this
      wx.request({
         url: app.util.getUrl('/coin'),
         method: 'GET',
         header: app.globalData.token,
         success: function(res) {
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

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
      let that = this;
      this.setData({
         parentThis: this
      })
     

   },

   //  获取用户详情
   getUserInfo() {
      let that=this;
      if (wx.getStorageSync('userInfo')) {
         wx.hideLoading()
         that.setData({
            user: wx.getStorageSync('userInfo'),
            phonePop: false
         })
      } else {
         console.log('执行')
         that.data.showLoading=true;
         app.util.request(that, {
            url: app.util.getUrl('/user'),
            method: 'GET',
            header: app.globalData.token
         }).then((res) => {
            this.setData({showLoading:false})
            if (res.code == 200) {
               wx.hideLoading()
               that.setData({
                  user: res.result
               })
               wx.setStorageSync('userInfo', res.result)
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
   // 我的总收益
   getMyProfits(){
      let _self=this
      var url = app.util.getUrl('/profits')
      wx.request({
         url: url,
         method: 'GET',
         header: app.globalData.token,
         success: function (res) {
            let data = res.data;
            if (data.code == 200) {
               console.log(data.result)
               _self.setData({
                  myProfits: data.result.amount
               })
            } else if (data.code == 403000) {
               wx.removeStorageSync('token')
            } else {
               // wx.showToast({
               //    title: data.message,
               //    duration: 2000
               // });
            }
         }
      })
   },
   // 获取我的红包数量
   getMyRed() {
      var that = this;
      var url = app.util.getUrl('/spotter')
      wx.request({
         url: url,
         method: 'GET',
         header: app.globalData.token,
         success: function (res) {
            let data = res.data;
            if (data.code == 200) {
               that.setData({
                  ongoingRebates: data.result.ongoingRebates
               })

            } else if (data.code == 403000) {
               wx.removeStorageSync('token')
            } else {

            }
         }
      })
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
      var that = this
     
      // 获取我发的红包
      // this.getMyRed(0);
      // this.getMyRed(1)
      // 获取我的总收益
      // this.getMyProfits()
      app.checkLogin().then(()=>{
         this.setData({hasToken:true})
         //  获取用户详情
         this.getUserInfo()
         // 我的共享卡
         this.getCardList()
      },()=>{
         this.setData({hasToken:false})
      })
    

   },
  // 获取卡列表
  getCardList() {
   let that = this;
   app.util.request(that, {
       url: app.util.getUrl('/benefits/cards'),
       method: 'GET',
       header: app.globalData.token
   }).then((res) => {
      this.setData({showLoading:false})
       if (res.code == 200) {
           wx.hideLoading()
           that.setData({
               cardList: res.result
           })

       }else {
         that.setData({
            cardList: false
        })
       }
   })
},
// 查看卡详情
toCardDetail(e) {
  let id = e.currentTarget.dataset.id;
  wx.navigateTo({
    url: '/pages/shareCard/myCardDesc/myCardDesc?id='+id,
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
      var that = this
      this.onShow()
      var timer = setTimeout(function() {
         wx.stopPullDownRefresh();
         clearTimeout(timer)
      }, 1000)
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