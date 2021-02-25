//app.js
const util = require('./utils/util.js');

App({
  onShow: function (options) {
    var _this = this;
    this.globalData.scene = options.scene;
  },
  onLaunch: function (options) {
    var that = this;
  
    this.globalData.scene = options.scene;
    this.getSystemInfo()
    if (wx.getStorageSync('token')) {
      this.globalData.token.token = wx.getStorageSync('token');
    } else {
    }

    //console.log("检查版本更新是否支持")
    if (!wx.canIUse("getUpdateManager")) return;
    //console.log("支持")
    let updateManager = wx.getUpdateManager();
    // 获取全局唯一的版本更新管理器，用于管理小程序更新
    //console.log("调用api")
    updateManager.onCheckForUpdate(function (res) {
      // 监听向微信后台请求检查更新结果事件 
      //console.log("是否有新版本：" + res.hasUpdate);
      if (res.hasUpdate) {
        //如果有新版本                
        // 小程序有新版本，会主动触发下载操作        
        updateManager.onUpdateReady(function () {
          //当新版本下载完成，会进行回调          
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，单击确定重启小程序',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启小程序               
                updateManager.applyUpdate();
              }
            }
          })
        })
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）        
        updateManager.onUpdateFailed(function () {
          //当新版本下载失败，会进行回调          
          wx.showModal({
            title: '提示',
            content: '检查到有新版本，但下载失败，请稍后尝试',
            showCancel: false,
          })
        })
      }
    });
  },
  checkLogin() {
    let that = this;
    return new Promise((successFn, failFn) => {
      if (wx.getStorageSync('token')) {
        wx.checkSession({
          success() {
            console.log('wx.checkSession')
            successFn()
          },
          fail() {
            wx.login({
              success: res => {
                if (res.code) {
                  //发起网络请求
                  wx.request({
                    url: that.util.getUrl('/auth'),
                    method: 'POST',
                    header: that.globalData.token,
                    data: {
                      code: res.code
                    },
                    success: function (res) {
                      let data = res.data;
                      if (data.code == 200) {
                        if (data.result.token) {
                          wx.setStorageSync('token', data.result.token);
                          that.globalData.token.token = data.result.token;
                        }
                        successFn()
                      } else {
                        failFn()
                      }
                    }
                  })
                } else {
                  successFn()
                }
              }
            })
          }
        })
      } else {
        wx.login({
          success: res => {
            if (res.code) {
              //发起网络请求
              wx.request({
                url: that.util.getUrl('/auth'),
                method: 'POST',
                header: that.globalData.token,
                data: {
                  code: res.code
                },
                success: function (res) {
                  let data = res.data;
                  if (data.code == 200) {
                    if (data.result.token) {
                      wx.setStorageSync('token', data.result.token);
                      that.globalData.token.token = data.result.token;
                    }
                    successFn()
                  } else {
                    failFn()
                  }
                },
                fail(){
                  failFn()
                }
              })
            } else {
              //console.log('登录失败！' + res.errMsg)
            }
          }
        })

      }
    })

  },
  checksession: function () {
    wx.checkSession({
      success: function (res) {
        //console.log(res, '登录未过期')
        wx.showToast({
          title: '登录未过期了',
        })
      },
      fail: function (res) {

        //再次调用wx.login()
        wx.login({
          success: function (res) {

          }
        })
      }
    })
  },
  onHide: () => {

  },
  //处理设置最新获取到的瀑布流数据
  setCurNewPubuImgData: function (oldImgDataJson) {
    let oldImgData = [];
    for (var item in oldImgDataJson) {
      oldImgData[item] = oldImgDataJson[item];
    }
    return oldImgData;
  },
  //处理存储瀑布流左右两边数据
  setCurResultsPubuImgData(newImgData, oldData, leftH, rightH ,callback) {
    //let leftH = 0;
    //let rightH = 0;
 
    let resultsList = {
      listL: [],
      listR: [],
    }
 
    let leftStart = 0;
    let rightStart = 0;
 
    for (var item in newImgData) {
      //console.log(leftH, rightH, newImgData[item].h);
      //console.log(leftH <= rightH);
      if (leftH <= rightH){
        resultsList.listL[leftStart] = oldData[item];
        leftStart ++;
        leftH += newImgData[item].h;
      }else{
        resultsList.listR[rightStart] = oldData[item];
        rightStart ++;
        rightH += newImgData[item].h;
      }
    }
    callback(resultsList , leftH, rightH);
  },

  /**
   * 监听属性 并执行监听函数
   */
  observe(obj, key, watchFun, deep, page) {
    var val = obj[key];
    // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
    if (deep && val != null && typeof val === 'object') {
      Object.keys(val).forEach(childKey => { // 遍历val对象下的每一个key
        this.observe(val, childKey, watchFun, deep, page); // 递归调用监听函数
      })
    }
    var that = this;
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        // 用page对象调用,改变函数内this指向,以便this.data访问data内的属性值
        watchFun.call(page, value, val); // value是新值，val是旧值
        val = value;
        if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
          that.observe(obj, key, watchFun, deep, page);
        }
      },
      get: function () {
        return val;
      }
    })
  },

  _wxPay: function (payData, callback, failCallback) {
    let that = this
    wx.requestPayment({
      timeStamp: payData.pay.timestamp,
      nonceStr: payData.pay.nonceStr,
      package: payData.pay.package,
      signType: payData.pay.signType,
      paySign: payData.pay.paySign,
      success: function (result) {
        if (result.errMsg == 'requestPayment:ok') {
          let data = {
            orderId: payData.orderId,
          }
          if (callback) {
            that.payResult(payData.orderId, callback())
          } else {
            that.payResult(payData.orderId)
          }

        } else {
          wx.showToast({
            title: '支付异常' + result.errMsg,
            icon: 'none',
            mask: true
          });
        }
      },
      fail: function (e) {
        // 取消支付
        console.info(e)
        failCallback()
        if (e == 'requestPayment:fail cancel') {

        }
      },
    })

  },
  payResult(orderId, successFn) {
    let that = this;
    let oId=orderId;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: that.util.getUrl('/pay/result/order/' + oId),
      method: 'GET',
      header: that.globalData.token,
      data: {},
      success: function (res) {
        let data = res.data;
        if (data.code == 200) {
          if (successFn) {
            successFn()
          }
        } else {
          wx.showModal({
            title: '提示',
            showCancel: false,
            conttent: data.message
          })
        }
      },
      complete(){
        wx.hideLoading()
      }
    })
  },















  locationCheck: function (callback,currentPage) {//校验用户定位权限
    let that = this
    wx.getSetting({//检查用户授予权限
      success: function (res) {
       
        if (!res.authSetting) {//如果请求过用户权限
          console.log('如果请求过用户权限')
          if (res.authSetting['scope.userLocation']) {//如果有权限直接获取经纬度
            console.log('如果有权限直接获取经纬度')
            that.getLocation(callback)
          } else {//如果没有权限直接让用户设置
            console.log('如果没有权限直接让用户设置')
            wx.showModal({
              title: '提示',
              content: '请授权位置信息，点击确定去授权',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success(res) {
                      console.log(res.authSetting)
                      // res.authSetting = {
                      //   "scope.userInfo": true,
                      //   "scope.userLocation": true
                      // }
                    }
                  })
                }
              }
            })
          }
        } else {//没请求过则直接请求弹窗权限
          if(currentPage){
          that.getLocation(callback,currentPage)
          }else{
            that.getLocation(callback)
          }
        }
      },
      fail: function () {
        
      }
    })
  },
  getLocation: function (callback,currentPage) {//获取用户定位
    var _that = this
    wx.getLocation({
      type: 'gcj02',   //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标 
      success: function (res) {
        console.log('获取定位成功')
        console.log(res)
        if (callback) {
          callback(res)
        } 
      },
      fail: function () {//如果不授权，直接设置默认城市
        wx.showModal({
          title: '提示',
          content: '请您打开定位并授权，否则无法使用定位',
          confirmText: '去授权',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  console.log('执行到这里，没有授权')
                  console.log(res)
                  if(res.errMsg=="openSetting:ok"){
                    if(currentPage){
                      currentPage.onLoad()
                    }
                    
                    // _that.getLocation()
                  }
                  // if (callback) {
                  //   callback(res)
                  // } 
                }
              })
            } else {
            console.log('继续取消授权')
              // if (callback) {
              //   callback()
              // }
            }
          }
        })
      },
    })
  },
  getSystemInfo: function () {//获取用户手机机型
    let _that = this
    wx.getSystemInfo({
      success: (e) => {
        this.globalData.height = e.statusBarHeight
        _that.globalData.thisPhoneSystem = e;
        if (e.model.indexOf("iPhone X") != -1) _that.globalData.thisPhoneModel = 'isIphoneX'
      }
    })
  },
  globalData: {
    reloca:false,
    sharePic:'https://saler.ishangbin.com/img/shareCard/buySuccess/faceToFaceBg.png',
    showModal:false,
    userInfo: null,
    userPhone: null,
    token: {
      'apiKey': '6b774cc5eb7d45818a9c7cc0a4b6920f'
    },
    scene: '',
    location: {},
    // //  测试
    ajaxOrigin: "https://saler.sharejoy.cn",
    urlOrigin: "https://saler.sharejoy.cn",


    // //  正式
    // ajaxOrigin: "https://saler.ishangbin.com",
    // urlOrigin: "https://saler.ishangbin.com"
  },
  util: util
})