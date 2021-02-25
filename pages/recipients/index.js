const app = getApp();
var scrollTop = 0;
var tabheight;
var cardtop;
var shoptop;
var sharetop;
var tabtop;
var lock = false;
var canvasTimer;
var times = 0;
//获取应用实例
const key = "86191bf891316ee5baec8a0d22b92b84"; //申请的高德地图key
let amapFile = require('../../utils/amap-wx.js');
// let QRCode = require("../../utils/qrCode.js").default;
var ctx = wx.createCanvasContext('shareCanvas');
Page({
   /**
    * 页面的初始数据
    */
   data: {
      pyq2: 'data:image/jpg;base64,' + wx.getFileSystemManager().readFileSync("/img/pyq3.png", 'base64'),
      redBg2: 'https://saler.ishangbin.com/img/shop/redBg2.png',
      loading_gif: 'data:image/jpg;base64,' + wx.getFileSystemManager().readFileSync("/img/waiting@2x.gif", 'base64'),
      text: '',
      posts: '',
      video: '',
      videoheight: '422rpx',
      id: '',
      load: {},
      init: true,
      currentTab: 0,
      swiperIndex: 0,
      intoId: 'share',
      scrolly: false,
      scrollb: "80vh",
      hide: false,

      arCodeUrl: '',
      qrCodeUrl: '',

      cardList: '',
      allAmount: '',
      callCount: '',
      showPhonePop: false,
      phonePop: false,
      parentThis: '',
      cardId: '',
      resourceType: {
         "1014": "充值金额",
         "1015": "积分",
         "1016": "券",
         "1017": "代用币",
         "1018": "红票",
         "1019": "储值卡"
      },
      // ----
      noGps: false,
      reLocation: false, // 已授权,但是定位失败
      has_no_auth_address: false, //拒绝授权位置弹窗 
      recipients_modal_show: false, //一进来,领取者弹窗
      too_far_modal: false, // 距离太远弹窗
      get_coupon_seccess: false, // 获取券成功弹窗
      get_coupon_seccess_nocash: false, // 获取券成功,没有现金弹窗
      get_coupon_seccess_cash: false, // 恭喜获得获得现金
      no_money_coupon_modal: false, // 钱和券都没了弹窗
      no_chance_modal: false, // 不能重复领取
      get_success_modal: false, // 领取成功
      animationFlag: false,
      hasCash: null,
      location: {
         city: "021",
         name: "上海",
         longitude: "",

         latitude: "",
         location: '021'
      },
      citys: {},
      distance: null,
      profits: null, //红包现金

      // redId: '5f1bc0b0e8288600117d59fd',
      redId: '',
      //-canvas
      canvasBox: true,
      canvamodel: false,
      savePop: false,
      canvasBg: '',
      canvasAvatar: '',
      canvasQrCode: '',
      canvasBgFlag: false,
      picBg: '',
      avatarUrl: '',
      sendFlag: false,
      shareTitle: '',
      sharePosters: '',
      rebateTotal: 0,
      obtained: null, //是否已经领取过红包
      scene: 'kai',
      isKai: false,
      //-canvas
      damoHeight: '300', //demo高度
      arry: [],
      listOfRecipients: {}, //领取者列表
      QR: {},
      canvamodelBtns: false,
      savaSuccessTips: false,


      // 一进来就生成canvas的标志
      autoCanvas: true,
      picUrls_fake: [],
      picUrls_haibao: [],
      envelopesObj: {}
   },
   // 查看大图
   previewImage(e) {
      var current = e.target.dataset.src;
      let imglist = [current]
      wx.previewImage({
         current: current, // 当前显示图片的http链接  
         urls: imglist // 需要预览的图片http链接列表  
      })
   },
   previewImageCanvas: function (e) {
      let that = this;
      var current = e.target.dataset.src;
      wx.showToast({
         title: '长按图片分享',
         image: '/img/finger.png',
         duration: 1000
      })
      console.log(e)

      setTimeout(function () {
         wx.hideToast();
         if (current) {
            wx.previewImage({
               current: current,
               urls: [current]
            })
            that.closeCanvas()
         }

      }, 1000)
      setTimeout(function () {
         wx.showModal({
            title: '提示',
            content: '请到分享的聊天记录里长按海报,领取红包',
            showCancel: false,
            confirmText: '确定',
         })
      }, 3000)
   },
   //   我的优惠券
   toMyBenefit() {
      wx.navigateTo({
         url: '/packageA/pages/myBenefit/index?shopId=' + this.data.id
      })
   },
   // 发红包
   sendRedEnvelopes: function (e) {
      let that = this;
      let shopId = this.data.id;
      let json = {};
      // wx.showLoading({
      //    title: '正在加载数据'
      // })
      console.log('autoCanvas====' + that.data.autoCanvas)

      if (that.data.posts && that.data.posts.rebate) {
         json = {
            activityId: that.data.posts.rebate.activityId
         }
      }
      app.util.request(that, {
         url: app.util.getUrl('/rebates/shop/' + shopId),
         method: 'POST',
         header: app.globalData.token,
         data: json
      }).then((res) => {
         // wx.hideLoading()
         // wx.showLoading({
         //    title: '正在加载数据'
         // })
         if (res.code == 200) {

            //   小程序码
            //   小程序码
            let arCodeUrl = false;
            let qrCodeUrl = false;
            if (res.result.arCodeUrl) {
               arCodeUrl = res.result.arCodeUrl;
            } else {
               qrCodeUrl = res.result.qrCodeUrl;
            }
            that.setData({
               arCodeUrl,
               qrCodeUrl,
               redId: res.result.id,
               envelopesObj: res.result
            })

            wx.setStorageSync('qrCodeUrl', qrCodeUrl);
            wx.setStorageSync('arCodeUrl', arCodeUrl);
            if (that.data.qrCodeUrl) {
               that.QR.clear();
               that.QR.makeCode(codeurl);
               setTimeout(function () {
                  wx.canvasToTempFilePath({
                     canvasId: 'myCanvas',
                     complete: function (res) {
                        var tempFilePath = res.tempFilePath;
                        that.setData({
                           canvasQrCode: tempFilePath
                        })
                     },
                     fail: function (res) {
                        console.log(res);
                     }
                  });
               }, 1000)
            } else {
               setTimeout(function() {
                  wx.getImageInfo({
                     src: wx.getStorageSync('arCodeUrl'),
                     success: function(res) {
                        that.setData({
                           canvasQrCode: res.path
                        },()=>{
                           that.picture()
                        })
                     }
                  })
               }, 2000)
            }
         } else if (res.code == 403060) {
            // 没有授权手机号
            that.setData({
               showPhonePop: true
            })
         } else if (res.code == '405088') {
            // 红包已经领完了

         }
      })
      // .catch((res) => {
      //    wx.hideLoading();
      //    wx.showModal({
      //       title: '提示',
      //       content: '网络超时',
      //       showCancel: false,
      //       confirmText: '重试',
      //       success(res) {
      //          if (res.confirm) {
      //             that.onLoad();
      //             that.onShow();
      //          }
      //       }
      //    })
      // })
   },

   showSendAgain: function () {
      console.log('点击了')
      let that = this;

      that.setData({
         get_success_modal: false
      })
      wx.showModal({
         title: '',
         content: '您已经领取过一个红包,此次发红包不能再领取现金',
         confirmText: '我知道了',
         showCancel: false,
         success: function () {

         }
      })
   },
   showSend: app.util.throttle(function (e) {
      let that = this;
      wx.showLoading();
      that.setData({
         has_no_auth_address: false, //拒绝授权位置弹窗 
         recipients_modal_show: false, //一进来,领取者弹窗
         too_far_modal: false, //距离太远弹窗
         get_coupon_seccess: false, // 获取券成功弹窗
         get_coupon_seccess_nocash: false, // 获取券成功,没有现金弹窗
         get_coupon_seccess_cash: false, // 恭喜获得获得现金
         no_money_coupon_modal: false, // 钱和券都没了弹窗
         no_chance_modal: false, // 不能重复领取
         get_success_modal: false, // 领取成功
      })
      if (!wx.getStorageSync('userInfo')) {
         that.setData({
            scene: 'fa'
         })
         that.getUserInfo('showCanvas')
      } else {
         that.setData({
            autoCanvas: false,
         }, () => {
            // 有用户信息,发红包
            if (that.data.canva) {
               that.setData({
                  savePop: true,
                  canvamodel: true,
                  savaSuccessTips: false,
                  canvamodelBtns: true
               })
               wx.hideLoading()
            } else {
               that.sendRedEnvelopes();
            }
         })



      }


   }),
   // 查看在本店的收益
   toMyIncome() {
      console.log('/pages/myIncome/index?shopId=' + this.data.id + "&shopName=" + this.data.posts.name + "&logo=" + this.data.posts.logo)
      wx.navigateTo({
         url: '/pages/myIncome/index?shopId=' + this.data.id + "&shopName=" + this.data.posts.name + "&logo=" + this.data.posts.logo
      })
   },

   //电话号授权
   getUserPhone() {
      let that = this;
      if (wx.getStorageSync('phoneNum')) {
         phoneNum: wx.getStorageSync('phoneNum')
      }
      else {
         app.util.request(that, {
            url: app.util.getUrl('/user'),
            method: 'GET',
            header: app.globalData.token
         }).then((res) => {
            console.log(res)
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
               // 判断地址是否合适--------------
            }
         })
      }

   },

   //  获取用户详情
   getUserInfo(state) {
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
               if (state == 'canvas') {
                  // 如果是canvas授权
                  // that.showSend()
               } else if (state == 'detail') {
                  that.getRedDetail()
               } else if (state == 'coupon') {
                  // 现在领券
                  that.toCoupon()
               } else {
                  // 领取授权
                  that.toCoupon()
               }



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
   // 判断位置
   //  现在领券
   toCoupon: app.util.throttle(function (e) {
      let that = this;
      console.log('现在领券')
      if (!wx.getStorageSync('userInfo')) {
         // 没有用户信息
         that.getUserInfo('coupon')
      } else {
         that.setData({
            has_no_auth_address: false
         })
         that.setData({
            isKai: true
         })
         that.getRedDetail();

      }
      console.log(this.data.redId)

   }),
   // 接收者  打开红包
   recipientOpen: app.util.throttle(function (e) {
      let that = this;
      console.log('执行了' + wx.getStorageSync('location').longitude);
      console.log(e)
      wx.showLoading({
         title: '',
      })
      that.setData({
         scene: 'kai'
      })
      if (!wx.getStorageSync('location').longitude && !that.data.location.latitude) {
         //   没有地理位置
         //判断是否获得了用户地理位置授权
         that.setData({
            has_no_auth_address: true
         })
         wx.hideLoading();
      } else {
         that.getRedDetail();
         setTimeout(function () {
            if (that.data.posts.rebate) {
               that.sendRedEnvelopes()
            }
         }, 5000)
         that.setData({
            has_no_auth_address: false
         })
      }
   }),
   // 重新定位
   reLocationFn: app.util.throttle(function () {
      let that = this;
      wx.showLoading({
         title: '加载中',
      })
      wx.getLocation({
         type: 'gcj02', //返回可以用于wx.openLocation的经纬度
         success: function (res) {
            wx.hideLoading()
            if (res.errMsg == "getLocation:ok") {
               console.log(res)
               that.data.location.latitude = res.latitude;
               that.data.location.longitude = res.longitude;
               that.saveLocation(res.longitude, res.latitude);

               console.log(wx.getStorageSync('location'))
               that.setData({
                  "location.longitude": res.longitude,
                  "location.latitude": res.latitude,
                  reLocation: false
               })
               // 有位置了,开红包
               that.getdata(that.recipientOpen())


            } else {
               //console.log("地理位置授权失败");
               that.saveLocation('', '', '021', '上海', '', '')
               wx.showToast({
                  title: "授权失败",
                  icon: 'none',
                  duration: 2000
               });
            }
         },
         fail(res) {
            console.log(res)
            wx.hideLoading()
            wx.showToast({
               title: "定位失败",
               icon: 'none',
               duration: 2000
            });
         }
      })

   }),
   // 查看领取详情列表
   getListofRecipients(id) {
      let _id = id || this.data.redId;
      let that = this;
      var url = app.util.getUrl('/rebates/' + _id + "/obtainer", {
         'pageSize': 999
      });
      if (_id) {
         wx.request({
            url: url,
            method: 'GET',
            header: app.globalData.token,
            success: function (res) {
               let data = res.data;
               if (data.code == 200) {
                  // 如果还没有shopId

                  that.setData({
                     listOfRecipients: data.result
                  })
                  console.log('领取者')
                  console.log(data.result)

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
      }

   },
   // 查看红包详情  开红包
   getRedDetail() {
      let id = this.data.redId;
      let that = this;
      var url = app.util.getUrl('/rebates/' + id);
      let storage = wx.getStorageSync('location');
      that.getListofRecipients()
      let json = {
         "city": storage.locationCode,
         "latitude": storage.latitude || that.data.location.latitude,
         "longitude": storage.longitude || that.data.location.longitude
      }
      that.setData({
         animationFlag: true
      }, () => {
         // var timeout = setTimeout(function() {
         wx.request({
            url: url,
            method: 'POST',
            data: json,
            header: app.globalData.token,
            success: function (res) {
               let data = res.data;
               wx.hideLoading();
               that.setData({
                  animationFlag: false,

               })
               if (data.code == 200) {
                  let result = data.result;
                  console.log('距离' + result.disOverLimit)
                  if (storage.latitude && result.disOverLimit && !that.data.too_far_modal) {
                     // 距离太远(已授权距离)
                     that.setData({
                        too_far_modal: true
                     })
                  } else if (!result.hasCash || result.disOverLimit) {
                     // 没有现金
                     that.setData({
                        hasCash: false,
                        get_coupon_seccess: true, // 只有券
                        profits: result.profits,
                        recipients_modal_show: false, //真现金无套路
                        get_success_modal: false,
                        too_far_modal: false
                     })

                  } else if (result.hasCash && !result.disOverLimit) {
                     // 有现金
                     that.setData({
                        hasCash: result.hasCash,
                        get_coupon_seccess_cash: true,
                        profits: result.profits,
                        recipients_modal_show: false, //真现金无套路
                        get_success_modal: false,
                        too_far_modal: false
                     })
                  }
                  // 
               } else if (data.code == 403060) {
                  that.setData({
                     showPhonePop: true,
                  })
               } else if (data.code == 403000) {
                  wx.removeStorageSync('token');
                  that.setData({
                     scene: 'detail'
                  })
                  // that.getUserInfo('detail')
                  // token过期
                  app.util.request(that, {
                     url: app.util.getUrl('/user'),
                     method: 'GET',
                     header: app.globalData.token
                  }).then((res) => {
                     if (res.code == 200) {
                        wx.setStorageSync('userInfo', res.result)
                        that.setData({
                           user: res.result
                        })
                        wx.hideLoading()
                        // 获取红包详情
                        that.getRedDetail()
                     }
                  })

               } else if (data.code == 405088) {

                  // 红包已经领完了
                  that.setData({
                     no_money_coupon_modal: true,
                     recipients_modal_show: false //真现金无套路
                  })
               } else if (data.code == 4050890) {
                  //     已经拆过了本品牌的红包
                  that.setData({
                     no_chance_modal: true,
                     recipients_modal_show: false, //真现金无套路
                     get_coupon_seccess_cash: false,
                     get_coupon_seccess: false,
                     autoCanvas: true,
                     scene: 'autoCanvas',
                  }, () => {
                     // 模拟发红包
                     // that.sendRedEnvelopes()
                  })


               } else if (data.code == 405089) {
                  // 已经领取过红包
                  that.setData({
                     no_chance_modal: true,
                     recipients_modal_show: false, //真现金无套路
                     get_coupon_seccess_cash: false,
                     get_coupon_seccess: false,
                     autoCanvas: true,
                     scene: 'autoCanvas',
                  }, () => {
                     // 模拟发红包
                     // that.sendRedEnvelopes()
                  })
               } else {
                  wx.showToast({
                     title: data.message,
                     icon: 'none',
                     duration: 2000
                  });
               }

            }
         })


      })


   },
   // 奖励到账,去发我的红包
   send_my_red() {
      let that = this;
      that.setData({
         has_no_auth_address: false, //拒绝授权位置弹窗 
         recipients_modal_show: false, //一进来,领取者弹窗
         too_far_modal: false, //距离太远弹窗
         get_coupon_seccess: false, // 获取券成功弹窗
         get_coupon_seccess_nocash: false, // 获取券成功,没有现金弹窗
         get_coupon_seccess_cash: false, // 恭喜获得获得现金
         no_money_coupon_modal: false, // 钱和券都没了弹窗
         no_chance_modal: false, // 不能重复领取
         get_success_modal: false, // 领取成功
      })
   },
   // 已经领取过红包,去发红包
   toShopDetail() {
      this.setData({
         has_no_auth_address: false, //拒绝授权位置弹窗 
         recipients_modal_show: false, //一进来,领取者弹窗
         too_far_modal: false, //距离太远弹窗
         get_coupon_seccess: false, // 获取券成功弹窗
         get_coupon_seccess_nocash: false, // 获取券成功,没有现金弹窗
         get_coupon_seccess_cash: false, // 恭喜获得获得现金
         no_money_coupon_modal: false, // 钱和券都没了弹窗
         no_chance_modal: false, // 不能重复领取
         get_success_modal: false, // 领取成功

      })
   },

   // 领取红包
   getMoneyOrCoupon: app.util.throttle(function (e) {
      let that = this;
      let storage = wx.getStorageSync('location')
      let id = that.data.redId;
      let json = {
         "city": storage.locationCode,
         "latitude": storage.latitude || that.data.location.latitude,
         "longitude": storage.longitude || that.data.location.longitude
      }
      app.util.request(that, {
         url: app.util.getUrl('/rebates/' + id + '/benefits'),
         method: 'POST',
         header: app.globalData.token,
         data: json
      }).then((res) => {
         if (res.code == 200 || res.code == "200") {
            that.setData({
               get_coupon_seccess: false,
               get_coupon_seccess_cash: false,
               recipients_modal_show: false, //真现金无套路
               get_success_modal: true, //奖励到账
               autoCanvas: true,
               scene: 'autoCanvas',
            }, () => {
               // 模拟发红包
               // that.sendRedEnvelopes()
            })

         } else if (res.code == 403060) {
            console.log('没有授权手机号')
            // 没有授权手机号
            that.setData({
               showPhonePop: true, // 没有授权手机号
               isKai: true
            })


         } else if (res.code == 4050890) {
            //     已经拆过了本品牌的红包
            that.setData({
               no_chance_modal: true,
               recipients_modal_show: false, //真现金无套路
               autoCanvas: true,
               scene: 'autoCanvas',
            }, () => {
               // 模拟发红包
               // that.sendRedEnvelopes()
            })
         } else if (res.code == 405089) {
            // 已经领取过红包
            that.setData({
               no_chance_modal: true,
               recipients_modal_show: false, //真现金无套路
               autoCanvas: true,
               scene: 'autoCanvas',
            }, () => {
               // 模拟发红包
               // that.sendRedEnvelopes()
            })
         }
      }).catch((res) => {
         wx.hideLoading();

      })

   }),
   // 关闭弹窗
   closeModal: function (e) {

      let that = this;
      let name = e.currentTarget.dataset.modalname;
      console.log(name)
      if (name == 'has_no_auth_address' || name == 'reLocation' || name == 'too_far_modal') {
         that.setData({
            [name]: false,
            recipients_modal_show: false
         })
      } else {
         that.setData({
            [name]: false
         })
      }

   },
   swichNav: function (e) {
      var query = wx.createSelectorQuery().in(this)
      var cur = e.target.dataset.current;
      var that = this
      if (false) {
         return false;
      } else {
         this.setData({
            currentTab: cur,
         })
         if (cur == 0) {
            query.select("#point1").boundingClientRect(function (rect) {
               var target = rect.top + scrollTop - tabheight
               wx.pageScrollTo({
                  scrollTop: target,
                  duration: 0
               })
            }).exec()
         } else if (cur == 1) {
            query.select("#point2").boundingClientRect(function (rect) {
               var target = rect.top + scrollTop - tabheight
               wx.pageScrollTo({
                  scrollTop: target,
                  duration: 0
               })
            }).exec()
         }

      }
   },
   selectSwiper(e) {
      console.log(e)
      var index = e.detail.current
      this.setData({
         swiperIndex: index
      })
   },

   //把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
   loadCity: function (latitude, longitude) {
      let that = this;
      let myAmapFun = new amapFile.AMapWX({
         key: key
      });
      myAmapFun.getRegeo({
         location: '' + longitude + ',' + latitude + '', //location的格式为'经度,纬度'
         success: function (data) {
            let address = data[0].regeocodeData.addressComponent;
            //console.log(address)
            var locCity = address.citycode;

            var locationCityNme = (address.city.length == 0) ? address.province : address.city;
            that.setData({
               "location.location": locCity
            })
            var citys = that.data.citys
            var openCityNme = that.data.citys[locCity]
            //console.log(openCityNme)
            if (openCityNme) {
               //console.log("已开通")
               var storLoc = wx.getStorageSync("location")

               if ((!storLoc && locCity == '021') || (storLoc && locCity == storLoc.chooseCode)) {
                  //console.log("一致")
                  that.setData({
                     "location.city": locCity,
                     "location.name": openCityNme,
                  })
                  that.saveLocation(longitude, latitude, locCity, openCityNme, locCity, locationCityNme)

               }

            } else {
               //console.log("未开通")
               //用户定位城市还未开通服务,则默认帮用户切换到上海
               // wx.showModal({
               //    title: '提示',
               //    confirmText: '确认',
               //    showCancel: 'false',
               //    content: '您所在的城市[' + locationCityNme + ']暂未开通赛朋服务,我们将带您去上海',
               //    success(res) {
               //       if (res.confirm) {
               //          that.setData({
               //             "location.city": "021",
               //             "location.name": "上海",
               //          })
               //          that.saveLocation(longitude, latitude, '021', '上海', locCity, locationCityNme)

               //       }


               //    }
               // })


            }
         },
         fail: function (info) {
            console.log("解析失败")
         }
      });
   },

   saveLocation: function (longitude, latitude, chooseCode, chooseName, locationCode, locationName) {
      wx.setStorageSync('location', {
         longitude: longitude,
         latitude: latitude,
         chooseCode: chooseCode,
         chooseName: chooseName,
         locationCode: locationCode,
         locationName: locationName
      });
   },

   // 靠近门店再领
   to_near() {
      this.setData({
         too_far_modal: false,
         recipients_modal_show: false
      })
   },
   // 授权地址及
   to_auth_address: app.util.throttle(function (e) {
      console.log('点击了')
      // this.getLocation();
      var that = this;
      wx.getSetting({
         success: (res) => {
            console.log(res);
            console.log(res.authSetting['scope.userLocation']);
            if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
               wx.openSetting({
                  success: function (data) {

                     if (data.authSetting["scope.userLocation"] == true) {
                        wx.showToast({
                           title: '授权成功',
                           icon: 'success',
                           duration: 5000
                        })
                        //再次授权，调用getLocationt的API

                        app.util.getLocation(that);

                        // setTimeout(function () {
                        //    that.recipientOpen()
                        // }, 500)

                     } else {
                        wx.showToast({
                           title: '授权失败',
                           icon: 'none',
                           duration: 2000
                        })
                     }
                  }
               })
            } else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
               app.util.getLocation(that);
            }
         }
      })
   }),
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      var that = this;
      console.log('onload')

      if (options.scene) {
         let redId = decodeURIComponent(options.scene);
         this.setData({
            redId
         })
      }
      wx.showLoading({
         title: '加载中',
      })
      if (options.id) {
         this.setData({
            id: options.id,
            parentThis: this
         })
      }
      if (options.redId) {
         // console.log('有红包Id' + options.redId)
         // 获取领取者详情
         that.getListofRecipients(options.redId)
         this.setData({
            redId: options.redId
         })

      } else {
         that.getListofRecipients()
      }
      let sysinfo = wx.getSystemInfoSync();
      console.log(sysinfo)
      // let qrcode = new QRCode('myCanvas', {
      //    text: '',
      //    width: 70,
      //    height: 70,
      //    colorDark: '#000000',
      //    colorLight: '#ffffff',
      //    correctLevel: QRCode.correctLevel.H
      // });
      //将一个局部变量共享
      // that.QR = qrcode;
      // that.QR.clear();
      // that.QR.makeCode('http://weixin.qq.com/q/02-GVAEkxmbIT14yENxu1V');



      // ----------------------------------------------------------------------
      var timer1 = setTimeout(function () {
         wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
               wx.hideLoading()
               console.log('哈哈哈哈')
               console.log(res)
               if (res.errMsg == "getLocation:ok") {
                  that.data.location.latitude = res.latitude;
                  that.data.location.longitude = res.longitude;
                  that.setData({
                     "location.longitude": res.longitude,
                     "location.latitude": res.latitude,
                  })
                  console.log(res)
                  // 授权地理位置
                  app.util.ajax({
                     url: '/dict/city',
                     success: function (cityres) {
                        let citydata = cityres.data;
                        if (citydata.code == 200) {
                           var city = {};
                           for (var v in citydata.result) {
                              city[citydata.result[v].code] = citydata.result[v].name
                           }
                           that.setData({
                              citys: city
                           })
                           wx.setStorageSync('citys', city)
                           that.loadCity(res.latitude, res.longitude);
                           var p = new Promise(function (resolve, reject) {
                              if (res.latitude && res.longitude) {
                              
                                 that.setData({
                                    // reLocation: false,
                                    has_no_auth_address: false
                                 })
                                 resolve(true)
                              } else {
                                 resolve(false)
                              }
                           });
                           p.then(function (data) {
                              that.getdata()
                           })


                        } else {
                           wx.showToast({
                              title: citydata.message,
                              icon: 'none',
                              duration: 2000
                           });
                        }

                     }
                  });

               } else {
                  //console.log("地理位置授权失败");
                  that.saveLocation('', '', '021', '上海', '', '')
                  wx.showToast({
                     title: "授权失败",
                     icon: 'none',
                     duration: 2000
                  });
               }
            },
            fail(res) {
               wx.hideLoading()
               that.saveLocation('', '', '021', '上海', '', '')
               console.log("地理位置获取失败")
               console.log(res)
               that.getdata()
               if (res.errMsg == 'getLocation:fail system permission denied') {
                  // 没有打开GPS
                  that.setData({
                     reLocation: true,
                     has_no_auth_address: false
                  })
               } else {
                  that.setData({
                     reLocation: false,
                     has_no_auth_address: true
                  })
               }
            }
         })
         clearTimeout(timer1)
      }, 1000)


   },

   saveLocation: function (longitude, latitude, chooseCode, chooseName, locationCode, locationName) {

      wx.setStorageSync('location', {
         longitude: longitude,
         latitude: latitude,
         chooseCode: chooseCode,
         chooseName: chooseName,
         locationCode: locationCode,
         locationName: locationName
      });
   },
   // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
   getRebates: function () {
      var json = {}
      var url = app.util.getUrl('/rebates/' + this.data.id, json)
      wx.request({
         url: url,
         method: 'GET',
         header: app.globalData.token,
         success: function (res) {
            let data = res.data;

            if (data.code == 200) {
               // 如果还没有shopId
               if (!this.data.id) {
                  this.setData({
                     id: data.result.id
                  })
               }
            } else if (data.code == 403000) {
               wx.removeStorageSync('token')
            } else {
               wx.showToast({
                  title: data.message,
                  duration: 2000
               });
            }
         }
      })
   },
   // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

   //生成海报
   picture: app.util.throttle(function (e) {

      console.log('生成海报' + this.data.autoCanvas)
      var that = this;
      // 是否有用户信息
      let userFlag = !wx.getStorageSync('userInfo') || !wx.getStorageSync('userInfo').avatarUrl;

      if (!that.data.autoCanvas) {
         that.setData({
            savePop: true,
            canvamodel: true,
            savaSuccessTips: false,
            canvamodelBtns: false
         })
      }
      // 如果没有用户信息
      if (userFlag) {
         if (!that.data.autoCanvas) {
            wx.showLoading({
               title: "海报生成中",
               complete: function () {
                  that.getUserInfo()
               }
            })
         } else {
            that.getUserInfo()
         }
         return false;
      }
      if (that.data.canvasBg && that.data.canvasAvatar && that.data.canvasQrCode) {
         times = 0;
         wx.hideLoading()
         clearTimeout(canvasTimer)
      } else {
         canvasTimer = setTimeout(function () {
            times++;
            console.log('还在执行' + times)
            if (!that.data.autoCanvas) {
               wx.showLoading({
                  title: "海报生成中"
               })
            }
            that.getCanvsImg(canvasTimer)
            if (that.data.canvasBg && that.data.canvasAvatar && that.data.canvasQrCode) {
               that.picture();
               clearTimeout(canvasTimer)
            }
            if (times > 30) {
               times = 0
               wx.hideLoading();
               clearTimeout(canvasTimer);
               wx.showToast({
                  title: '海报生成失败',
                  duration: 2000
               })
               that.setData({
                  canvamodel: false,
                  savePop: false,
                  canvamodelBtns: false
               })
               clearTimeout(canvasTimer)
               return false;
            }

         }, 2000)
         return false;
      }



      var pic;
      if (that.data.posts.poster) {
         pic = that.data.posts.poster
      } else {
         pic = that.data.posts.posters[that.data.num]
      }

      if (that.data.canvasBg) {
         ctx.drawImage(that.data.canvasBg, 0, 0, 600, 1000); //绘制背景图
      }
      if (that.data.canvasQrCode) {
         ctx.drawImage(that.data.canvasQrCode, 390.3, 710.5, 130, 130);
      }

      console.log('背景图')
      if (wx.getStorageSync('userInfo')) {
         ctx.setTextAlign('left');
         ctx.setFontSize(27);
         ctx.fillText(wx.getStorageSync('userInfo').nickname, 150, 750);
      } else {
         if (!that.data.autoCanvas) {
            wx.showLoading({
               title: "海报生成中",
               complete: function () {
                  that.getUserInfo()
               }
            })
         } else {
            that.getUserInfo()
         }
      }


      that.circleImg(ctx, that.data.canvasAvatar, 55, 700, 40);

      var timer3 = setTimeout(function () {
         ctx.draw(false, () => {
            setTimeout(function () {
               that.drawPicture(e)
            }, 200)
         }); //draw()的回调函数 
         clearTimeout(timer3);
      }, 200)

   }),
   circleImg: function (ctx, img, x, y, r) {
      ctx.save();
      var d = 2 * r;
      var cx = x + r;
      var cy = y + r;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, x, y, d, d);
   },
   getCanvsImg: function (timer) {
      var that = this;
      if (timer) {
         if (!that.data.autoCanvas) {
            wx.showLoading({
               title: "海报生成中"
            })
         }
      }
      if (!that.data.canvasAvatar) {
         if (!wx.getStorageSync('userInfo').avatarUrl) {
            that.getUserInfo()
         } else {
            wx.getImageInfo({
               src: wx.getStorageSync('userInfo').avatarUrl,
               success: function (res) {
                  that.setData({
                     canvasAvatar: res.path
                  })
               }
            })
         }

      }
      if (!that.data.canvasBg) {
         wx.getImageInfo({
            src: wx.getStorageSync('canvasBg'),
            success: function (res) {
               console.log('背景图好了')
               that.setData({
                  canvasBg: res.path,
                  canvasBgFlag: true
               })
            }
         })
      }
      if (!that.data.sharePosters) {
         wx.getImageInfo({
            src: wx.getStorageSync('sharePosters'),
            success: function (res) {
               that.setData({
                  sharePosters: res.path
               })
            }
         })
      }
      if (!that.data.canvasQrCode) {
         // wx.canvasToTempFilePath({
         //    canvasId: 'myCanvas',
         //    success: function (res) {
         //       var tempFilePath = res.tempFilePath;
         //       that.setData({
         //          canvasQrCode: tempFilePath
         //       })
         //       console.log("小程序吗-----arCodeUrl_fake-----成功" + that.data.canvasQrCode)
         //    },
         //    fail: function (res) {
         //       console.log(res);
         //       console.log('小程序码----arCodeUrl_fake-----失败')
         //    }
         // });
         wx.getImageInfo({
            src: wx.getStorageSync('arCodeUrl'),
            success: function (res) {
               console.log("小程序吗-----arCodeUrl_fake-----成功" + that.data.canvasQrCode)
               that.setData({
                  canvasQrCode: res.path,
                  canvasBgFlag: true
               })
            },
            fail: function (res) {
               console.log(res);
               console.log('小程序码----arCodeUrl_fake-----失败')
            }
         })
      }


      if (that.data.canvasBg && that.data.canvasAvatar && that.data.canvasQrCode) {
         clearTimeout(canvasTimer);
      }

   },
   //文本换行
   textWrap: function (obj, ctx) {
      // console.log('文本换行')
      var td = Math.ceil(obj.width / (obj.size));
      var tr = Math.ceil(obj.text.length / td);
      for (var i = 0; i < tr; i++) {
         var txt = {
            x: obj.x,
            y: obj.y + (i * obj.height),
            color: obj.color,
            size: obj.size,
            align: obj.align,
            baseline: obj.baseline,
            text: obj.text.substring(i * td, (i + 1) * td),
            bold: obj.bold
         };
         if (i < obj.line) {
            // this.drawText(txt, ctx);
         }
      }
   },
   //文本绘制
   drawText: function (obj, ctx) {
      console.log('渲染文字')
      ctx.save();
      ctx.setFillStyle(obj.color);
      ctx.setFontSize(obj.size);
      ctx.setTextAlign(obj.align);
      ctx.setTextBaseline(obj.baseline);
      if (obj.bold) {
         console.log('字体加粗')
         ctx.fillText(obj.text, obj.x, obj.y - 0.5);
         ctx.fillText(obj.text, obj.x - 0.5, obj.y);
         ctx.fillText(obj.text, obj.x, obj.y - 0.4);
         ctx.fillText(obj.text, obj.x - 0.4, obj.y);
         ctx.fillText(obj.text, obj.x, obj.y - 0.3);
         ctx.fillText(obj.text, obj.x - 0.3, obj.y);
         ctx.fillText(obj.text, obj.x, obj.y - 0.2);
         ctx.fillText(obj.text, obj.x - 0.2, obj.y);
         ctx.fillText(obj.text, obj.x, obj.y - 0.1);
         ctx.fillText(obj.text, obj.x - 0.1, obj.y);
      }
      ctx.setFillStyle(obj.color);
      ctx.fillText(obj.text, obj.x, obj.y);
      if (obj.bold) {
         ctx.fillText(obj.text, obj.x, obj.y + 0.5);
         ctx.fillText(obj.text, obj.x + 0.5, obj.y);
         ctx.fillText(obj.text, obj.x, obj.y + 0.4);
         ctx.fillText(obj.text, obj.x + 0.4, obj.y);
         ctx.fillText(obj.text, obj.x, obj.y + 0.3);
         ctx.fillText(obj.text, obj.x + 0.3, obj.y);
         ctx.fillText(obj.text, obj.x, obj.y + 0.2);
         ctx.fillText(obj.text, obj.x + 0.2, obj.y);
         ctx.fillText(obj.text, obj.x, obj.y + 0.1);
         ctx.fillText(obj.text, obj.x + 0.1, obj.y);
      }
      ctx.restore();
   },



   //绘制海报
   drawPicture: function (e) { //生成图片
      var that = this;
      if (that.data.canva) {
         that.setData({
            canvamodelBtns: true,
            savaSuccessTips: false
         })
         wx.hideLoading()
         return false;
      }
      var timer = setTimeout(function () {
         wx.canvasToTempFilePath({ //把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径
            x: 0,
            y: 0,
            width: 600,
            height: 1000,
            destWidth: 600 * 2, //输出的图片的宽度（写成width的两倍，生成的图片则更清晰）
            destHeight: 1000 * 2,
            fileType: 'jpg',
            quality: 1,
            canvasId: 'shareCanvas',
            success: function (res) {

               that.setData({
                  canvamodelBtns: true
               }, () => {
                  that.setData({
                     canva: res.tempFilePath
                  })
               })
               wx.hideLoading();
               console.log('--------------------------')
               console.log(that.data.canvamodelBtns)
               clearTimeout(canvasTimer);
            },
            fail: function (res) {
               // console.log(res)
               wx.hideLoading();
            }
         }, that)
         wx.hideLoading()
         clearTimeout(timer)
      }, 300)
   },
   // 保存商家多张海报
   saveHaiBaoImg: function (e) {
      var that = this;
      wx.getSetting({
         success: (res) => {
            if (res.authSetting['scope.writePhotosAlbum'] != undefined && res.authSetting['scope.writePhotosAlbum'] != true) { //非初始化进入该页面,且未授权
               console.log("保存图片提示")
               wx.showModal({
                  title: '是否授权保存到相册',
                  content: '需要获取您的保存到相册，请确认授权，否则海报将无法保存',
                  success: function (res) {

                     if (res.cancel) {
                        console.info("1授权失败返回数据");
                        wx.hideLoading()
                     } else if (res.confirm) {
                        wx.openSetting({
                           success: function (data) {
                              console.log("openSetting保存图片")
                              console.log(data);
                              if (data.authSetting["scope.writePhotosAlbum"] == true) {
                                 wx.showToast({
                                    title: '授权成功',
                                    icon: 'success',
                                    duration: 5000
                                 })
                                 //再次授权，调用getLocationt的API
                                 console.log(that.data.picUrls_haibao);
                                 wx.showLoading({
                                    title: '正在保存海报',
                                 })
                                 // 如果有专属海报
                                 if (that.data.canva) {
                                    wx.getImageInfo({
                                       src: that.data.canva,
                                       success: function (res) {
                                          var localImg = res.path;
                                          wx.saveImageToPhotosAlbum({
                                             filePath: localImg,
                                             success(res) {},
                                             fail(res) {}
                                          })
                                       }
                                    })
                                 }
                                 if (that.data.picUrls_haibao) {
                                    for (var i = 0; i < that.data.picUrls_haibao.length; i++) {
                                       wx.getImageInfo({
                                          src: that.data.picUrls_haibao[i],
                                          success: function (res) {
                                             var localImg = res.path;
                                             setTimeout(function () {
                                                wx.saveImageToPhotosAlbum({
                                                   filePath: localImg,
                                                   success(res) {
                                                      console.log("再次授权保存图片")
                                                      wx.hideLoading()
                                                      wx.showToast({
                                                         title: '保存成功',
                                                         icon: 'success',
                                                         duration: 1000
                                                      })
                                                   },
                                                   fail(res) {

                                                   }
                                                })
                                             }, 500)
                                          }
                                       })


                                    }
                                 }



                              } else {
                                 wx.showLoading()
                                 wx.showToast({
                                    title: '授权失败',
                                    icon: 'success',
                                    duration: 5000
                                 })
                              }
                           }
                        })
                     }
                  }
               })
               wx.hideLoading()
            } else {
               wx.hideLoading()
               // 如果有专属海报
               if (that.data.canva) {
                  wx.getImageInfo({
                     src: that.data.canva,
                     success: function (res) {
                        var localImg = res.path;
                        wx.saveImageToPhotosAlbum({
                           filePath: localImg,
                           success(res) {},
                           fail(res) {}
                        })
                     }
                  })
               }
               for (var i = 0; i < that.data.picUrls_haibao.length; i++) {
                  wx.getImageInfo({
                     src: that.data.picUrls_haibao[i],
                     success: function (res) {
                        var localImg = res.path;
                        setTimeout(function () {
                           wx.saveImageToPhotosAlbum({
                              filePath: localImg,
                              success(res) {
                                 console.log("再次授权保存图片");
                                 wx.hideLoading()
                                 wx.showToast({
                                    title: '保存成功',
                                    icon: 'success',
                                    duration: 1000
                                 })
                              },
                              fail(res) {}
                           })
                        }, 500)
                     }

                  })

               }
            }
         }
      })
   },
   //保存海报至相册
   saveImg: function (e) {
      var that = this;
      clearTimeout(canvasTimer);
      //console.log("保存图片")
      wx.getSetting({
         success: (res) => {
            if (res.authSetting['scope.writePhotosAlbum'] != undefined && res.authSetting['scope.writePhotosAlbum'] != true) { //非初始化进入该页面,且未授权
               //console.log("保存图片提示")
               wx.showModal({
                  title: '是否授权保存到相册',
                  content: '需要获取您的保存到相册，请确认授权，否则海报将无法保存',
                  success: function (res) {
                     if (res.cancel) {
                        //console.info("1授权失败返回数据");
                        wx.hideLoading()
                     } else if (res.confirm) {
                        wx.openSetting({
                           success: function (data) {
                              //console.log("openSetting保存图片")
                              //console.log(data);
                              if (data.authSetting["scope.writePhotosAlbum"] == true) {
                                 wx.showToast({
                                    title: '授权成功',
                                    icon: 'success',
                                    duration: 5000
                                 })
                                 //再次授权，调用getLocationt的API
                                 wx.saveImageToPhotosAlbum({
                                    filePath: that.data.canva,
                                    success(res) {
                                       //console.log("再次授权保存图片")
                                       wx.showToast({
                                          title: '保存成功',
                                          icon: 'success',
                                          duration: 1000,
                                          success: function () {

                                          }
                                       })
                                       that.setData({
                                          canvamodelBtns: false,
                                          savaSuccessTips: true,
                                          autoCanvas: false
                                       })
                                    },
                                    fail(res) {
                                       //console.log(res)
                                    }
                                 })
                              } else {
                                 wx.showToast({
                                    title: '授权失败',
                                    icon: 'success',
                                    duration: 5000
                                 })
                              }
                           }
                        })
                     }
                  }
               })
            } else {
               wx.saveImageToPhotosAlbum({
                  filePath: that.data.canva,
                  success(res) {
                     wx.showToast({
                        title: '保存成功',
                        icon: 'success',
                        duration: 2000
                     })
                     that.setData({
                        canvamodelBtns: false,
                        savaSuccessTips: true
                     })
                  },
                  fail(res) {
                     //console.log(res)
                  }
               })
            }
         }
      })

   },

   toCDetail: function (e) {
      console.log(e)
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({
         url: "/pages/coupon/index?id=" + id + "&shop=true"
      })
   },


   // 判断手机号
   getPhone() {
      let that = this;
      if (wx.getStorageSync('userInfo') && wx.getStorageSync('phoneNum')) {
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
            // console.log(res)
            if (res.code == 200) {
               that.setData({
                  user: res.result
               })
               wx.setStorageSync('userInfo', res.result);
               if (res.result.avatarUrl) {
                  wx.getImageInfo({
                     src: res.result.avatarUrl,
                     success: function (res) {
                        that.setData({
                           canvasAvatar: res.path
                        })
                     }
                  })
               }
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
   // 一键复制
   copyText: function (e) {
      console.log(e)
      wx.setClipboardData({
         data: e.currentTarget.dataset.text,
         success: function (res) {
            wx.getClipboardData({
               success: function (res) {
                  wx.showToast({
                     title: '复制成功'
                  })
               }
            })
         }
      })
   },
   // 获取商家详情
   getdata(fn, flag) {
      var storage = wx.getStorageSync('location')
      var that = this;
      var json = {
         shopId: that.data.id,
         location: storage.locationCode ? storage.locationCode : that.data.location.locationCode ? that.data.location.locationCode : '021',
         latitude: storage.latitude ? storage.latitude : that.data.location.latitude ? that.data.location.latitude : '',
         longitude: storage.longitude ? storage.longitude : that.data.location.longitude ? that.data.location.longitude : ''
      }

      var url;
      if (that.data.redId) {
         // 有红包id的时候用红包id获取商家详情
         url = app.util.getUrl('/rebates/' + that.data.redId + "/shop", json);
      } else {
         url = app.util.getUrl('/shops/' + that.data.id, json)
      }
      wx.request({
         url: url,
         method: 'GET',
         header: app.globalData.token,
         success: function (res) {

            let data = res.data;
            that.setData({
               init: false
            })
            if (data.code == 200) {
               if (fn) {
                  fn()
               }
               // 商家详情--------图
               var pictures = data.result.pictures;
               let length = pictures.length;
               let arry = that.data.arry;
               arry.length = length;
               arry.fill(false, 1)
               that.setData({
                  arry,
                  id: data.result.id
               })

               for (let i = 0; i < length; i++) {
                  let url;
                  // console.log(pictures[i].url)
                  if (pictures[i].url && pictures[i].url.indexOf('_org')) {
                     pictures[i].smallPic = pictures[i].url.split('_org').join('');
                  }
               }
               console.log(pictures)
               // 商家详情--------图
               let pic;
               let shareTitle;
               let sharePosters;
               // 有红包分享图
               if (data.result.rebate && data.result.rebate.total) {
                  // 有钱的红包分享图
                  if (data.result.sharePosters['3002']) {
                     pic = data.result.sharePosters['3002'].picUrl
                  }
                  if (data.result.sharePosters['3004']) {
                     sharePosters = data.result.sharePosters['3004'].picUrl
                  }
                  shareTitle = '一试知真假,现金秒到无套路';
               } else {
                  // 没有钱得红包分享图
                  if (data.result.sharePosters['3001']) {
                     pic = data.result.sharePosters['3001'].picUrl
                  }
                  if (data.result.sharePosters['3003']) {
                     sharePosters = data.result.sharePosters['3003'].picUrl
                  }
                  shareTitle = '见者有份, 限量折扣券';

               }
               // 判断有没有领取过红包
               let recipients_modal_show;
               let no_chance_modal;

               if (data.result.obtained) { // 已经领取过红包
                  recipients_modal_show = false;
                  no_chance_modal = true;
                  that.setData({
                     autoCanvas: true,
                     scene: 'autoCanvas',
                  }, () => {
                     // 模拟发红包
                     // that.sendRedEnvelopes()
                  })

               } else if (that.data.redId) {
                  recipients_modal_show = true;
                  no_chance_modal = false
               }
               // console.log(pictures)
               wx.setStorageSync('canvasBg', pic)
               // wx.setStorageSync('sharePosters', sharePosters)
               // start-----懒加载
               if (data.result.richContent) {
                  data.result.richContent = formatRichText(data.result.richContent)

                  function formatRichText(html) {
                     let newContent = html.replace(/<img[^>]*>/gi, function (match, capture) {
                        match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
                        match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
                        match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
                        return match;
                     });
                     newContent = newContent.replace(/style="[^"]+"/gi, function (match, capture) {
                        match = match.replace(/width:[^;]+;/gi, 'max-width:100%;').replace(/width:[^;]+;/gi, 'max-width:100%;');
                        return match;
                     });
                     newContent = newContent.replace(/<br[^>]*\/>/gi, '');
                     newContent = newContent.replace(/\<img/gi, '<img style="max-width:100%;width:auto;height:auto;display:block;margin-top:0;margin-bottom:0;"');
                     return newContent;
                  }

               }
               let picUrls_fake = [];
               if (data.result.picUrls) {
                  for (var i = 0; i < data.result.picUrls.length; i++) {
                     picUrls_fake.push(data.result.picUrls[i].split('_org.').join('.'))
                  }
               }

               that.setData({
                  posts: data.result,
                  pictures: pictures,
                  picBg: pic,
                  sharePicUrl: pic,
                  shareTitle: shareTitle,
                  recipients_modal_show,
                  no_chance_modal,
                  picUrls_haibao: data.result.picUrls.slice(0, 8),
                  picUrls_fake: picUrls_fake
               })
               if (data.result.rebate) {
                  that.setData({
                     autoCanvas: true,
                     scene: 'autoCanvas',
                     rebateTotal: parseInt(data.result.rebate.total)
                  })

               }
               // end-----懒加载
               if (data.result.video) {
                  that.setData({
                     videoheight: that.data.posts.video.height * 1 > that.data.posts.video.width * 1 ? "height:650rpx;" : "height:422rpx;"
                  })
                  that.getVideo();
               }
               that.getCanvsImg()
            } else if (data.code == 403000) {
               wx.removeStorageSync('token')
            } else {
               wx.showToast({
                  title: data.message,
                  duration: 2000
               });
            }

            let inittimer = setTimeout(function () {
               wx.hideLoading();
               that.setData({
                  init: false
               })
               clearTimeout(inittimer);
            }, 1000)
         }
      });
   },

   getVideo() {
      var that = this
      var jsons = {
         shopId: this.data.id
      }
      wx.request({
         url: app.util.getUrl('/videos', jsons),
         method: 'GET',
         header: app.globalData.token,
         success: function (res) {
            let data = res.data;
            //console.log(res)
            if (data.code == 200) {
               that.setData({
                  video: data.result.url,
                  videoheight: data.result.height * 1 > data.result.width * 1 ? "height:650rpx;" : "height:422rpx;"
               })
               //console.log(that.data.video)
            }
         }
      });
   },
   makePhone() {
      var that = this
      wx.makePhoneCall({
         phoneNumber: that.data.posts.tel,
         fail: function (res) {
            //console.log(res)
         }
      })
   },
   toMap() {
      var that = this
      wx.openLocation({
         latitude: that.data.posts.latitude,
         longitude: that.data.posts.longitude,
         scale: 18,
         name: that.data.posts.brandName + '(' + that.data.posts.name + ')',
         address: that.data.posts.address
      })
   },

   toHome: app.util.throttle(function (e) {
      var id = e.currentTarget.dataset.id;
      wx.switchTab({
         url: '/pages/home/home'
      })
   }),
   // 模糊图加载完成
   smallImgLoad(e) {
      var that = this
      var index = e.currentTarget.dataset.index;
      let pictures = that.data.pictures;
      that.setData({
         ['pictures[' + index + '].smallPicFlag']: true,
      })
   },
   //图片加载完毕
   imgload(e) {
      var that = this
      setTimeout(function () {
         var index = e.currentTarget.dataset.index;
         var loading = "loading" + index;
         var img = "img" + index;
         var imgerr = "imgerr" + index;
         var loadingobj = "load." + loading
         var imgobj = "load." + img
         var imgerrobj = "load." + imgerr
         that.setData({
            [loadingobj]: true,
            [imgobj]: false,
            [imgerrobj]: true
         })
      }, 300)
   },
   //loading加载完毕
   loadingload(e) {
      var index = e.currentTarget.dataset.index;
      var loading = "loading" + index;
      var img = "img" + index;
      var imgerr = "imgerr" + index;
      var loadingobj = "load." + loading
      var imgobj = "load." + img
      var imgerrobj = "load." + imgerr
      this.setData({
         [loadingobj]: false,
         [imgobj]: true,
         [imgerrobj]: true
      })
   },
   //imgerr加载完毕
   imgerrload(e) {
      var index = e.currentTarget.dataset.index;
      var loading = "loading" + index;
      var img = "img" + index;
      var imgerr = "imgerr" + index;
      var loadingobj = "load." + loading
      var imgobj = "load." + img
      var imgerrobj = "load." + imgerr
      this.setData({
         [imgerrobj]: true
      })
   },
   //图片加载失败
   loadingerr(e) {
      var index = e.currentTarget.dataset.index;
      var loading = "loading" + index;
      var img = "img" + index;
      var imgerr = "imgerr" + index;
      var loadingobj = "load." + loading
      var imgobj = "load." + img
      var imgerrobj = "load." + imgerr
      this.setData({
         [loadingobj]: true,
         [imgobj]: true,
         [imgerrobj]: false
      })
   },
   onloadimg(e) {
      var index = e.currentTarget.dataset.index;
      var loading = "loading" + index;
      var img = "img" + index;
      var imgerr = "imgerr" + index;
      var loadingobj = "load." + loading
      var imgobj = "load." + img
      var imgerrobj = "load." + imgerr
      var url = "posts.pictures[" + index + "].url"
      this.setData({
         [loadingobj]: false,
         [imgobj]: true,
         [imgerrobj]: true,
         [url]: this.data.posts.pictures[index].url + "?" + Math.random()
      })
   },
   //授权基本信息后再次执行
   againRequest() {
      // this.getBenefits();
      //  this.openEnvelopes()
   },
   closePhonePop() {
      this.setData({
         showPhonePop: false
      })
   },
   getBenefits(e) {
      var that = this
      var location = wx.getStorageSync("location")

      var json = {
         "longitude": location.longitude,
         "latitude": location.latitude,
         "city": location.locationCode
      }
      app.util.request(that, {
         url: app.util.getUrl('/videos/task/shop/' + that.data.id),
         method: 'POST',
         header: app.globalData.token,
         data: json
      }).then((res) => {
         if (res.code == 200) {
            wx.showToast({
               title: '领取成功',
               icon: 'success',
               duration: 2000
            })
         } else if (res.code == 403060) {
            that.setData({
               showPhonePop: true
            })
         }
      })
  
   },
 
   getPhoneNumber(e) {
      wx.showLoading({
         title: '加载中',
      })
      console.log('执行了授权手机号')
      var that = this
      if (e.detail.errMsg == 'getPhoneNumber:fail user deny' || e.detail.errMsg == 'getPhoneNumber:user deny' || e.detail.errMsg == 'getPhoneNumber:fail:user deny') {
         wx.showModal({
            title: '提示',
            showCancel: false,
            content: '未授权',
            success: function (res) {}
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
               console.log("/phone/bind")
               console.log(res)
               wx.hideLoading();
               let data = res.data;
               if (data.code == 200) {
                  // that.getBenefits(e)
                  if (data.result) {
                     wx.setStorageSync('token', data.result.token);
                     app.globalData.token.token = data.result.token
                  }
                  that.setData({
                     showPhonePop: false
                  })
                  wx.showToast({
                     title: "授权成功",
                     duration: 2000
                  });
                  console.log('that.data.isKai' + that.data.isKai)
                  // 是否是领红包---授权(授权完成直接领取红包)
                  if (that.data.isKai) {
                     that.getMoneyOrCoupon();
                  }
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
   onPageScroll: function (res) {
      let _this = this;
      let scrollTop = res.scrollTop;
  

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
      // ------------------------------------------
      let that = this;

      var timer3 = setTimeout(function () {
         wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
               wx.hideLoading()
               if (res.errMsg == "getLocation:ok") {
                  that.data.location.latitude = res.latitude;
                  that.data.location.longitude = res.longitude;
                  that.setData({
                     "location.longitude": res.longitude,
                     "location.latitude": res.latitude,
                  })
                  console.log(res)
               } else {
                  //console.log("地理位置授权失败");
                  that.saveLocation('', '', '021', '上海', '', '')
                  wx.showToast({
                     title: "授权失败",
                     icon: 'none',
                     duration: 2000
                  });
               }
            },
            fail(res) {
               wx.hideLoading()
               that.saveLocation('', '', '021', '上海', '', '')
               console.log("地理位置获取失败")

               if (that.data.recipients_modal_show == true) {
                  if (res.errMsg == 'getLocation:fail system permission denied') {
                     // 没有打开GPS
                     that.setData({
                        reLocation: true, //重新定位
                        has_no_auth_address: false
                     })
                  } else if (that.data.reLocation != true) {
                     that.setData({
                        reLocation: false,
                        has_no_auth_address: true
                     })
                  }
               }

            }
         })
         clearTimeout(timer3)
      }, 1000)

   },
   preventTouchMove: function (e) {

   },
   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function () {
      clearTimeout(canvasTimer);
      wx.hideLoading()
   },


   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function () {

      clearTimeout(canvasTimer);
      wx.hideLoading()
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
   //关闭海报
   closeCanvas: function () {
      wx.hideLoading();
      // times = 201;
      this.setData({
         canvamodel: false,
         savePop: false,
         canvamodelBtns: false,
         savaSuccessTips: false
      })
      clearTimeout(canvasTimer);

   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function () {
      this.closeCanvas()
      let url;

      if (this.data.redId) {
         url = '/pages/recipients/index?redId=' + this.data.redId + "&id=" + this.data.id
      } else {
         url = '/pages/recipients/index?' + "id=" + this.data.id
      }
      return {
         title: this.data.shareTitle,
         path: url,
         imageUrl: wx.getStorageSync('sharePosters')
      }
   }
})