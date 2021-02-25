const app = getApp();
var scrollTop = 0;

var tabheight;
var cardtop;
var shoptop;
var sharetop;
var tabtop;
var lock = false;
var timer;
var canvasTimer;
let canvasAvatar;
var times = 0;
//获取应用实例
const key = "86191bf891316ee5baec8a0d22b92b84"; //申请的高德地图key
let amapFile = require('../../utils/amap-wx.js');
// let QRCode =require('../../utils/weapp-qrcode.js');
var ctx = wx.createCanvasContext('shareCanvas');
let QRCode = require("../../utils/qrCode.js").default;
Page({
   /**
    * 页面的初始数据
    */
   data: {
      showLoading:true,
      pyq2: 'data:image/jpg;base64,' + wx.getFileSystemManager().readFileSync("/img/pyq3.png", 'base64'),
      weixin: 'data:image/jpg;base64,' + wx.getFileSystemManager().readFileSync("/img/weixin.png", 'base64'),
      hongBg: 'data:image/jpg;base64,' + wx.getFileSystemManager().readFileSync("/img/send_model_bg.png", 'base64'),
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
      cardList: '',
      allAmount: '',
      callCount: '',
      showPhonePop: false,
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
      has_no_auth_address: false, //拒绝授权位置弹窗 
      recipients_modal_show: true, //领取者弹窗
      location: {
         city: "021",
         name: "上海",
         longitude: "",
         latitude: "",
         location: '021'
      },
      citys: {},
      redId: '',
      send_money_modal: false,
      send_coupon_modal: false,
      picFlagArray: [], //图片是否加载标志
      count: 0,
      //-canvas
      canvasBox: true,
      canvamodel: false,
      savePop: false,
      canvasBg: null,
      canvasAvatar: '',
      canvasQrCode: '',
      qrCodeUrl: '',
      canvasBgFlag: false,
      sharePosters: '',
      picBg: '',
      avatarUrl: '',
      sendFlag: false,
      shareTitle: '',
      rebateTotal: 0,
      scene: 'fa',
      // 测试
      send_modal: false,
      send_modal_Flag: false,
      damoHeight: 250, //demo高度
      arry: [],
      containueFlag: false,
      QR: {},
      canvamodelBtns: false,
      savaSuccessTips: false,

      // 一进来就生成canvas的标志
      autoCanvas: true,
      picUrls_fake: [],
      picUrls_haibao: [],
      envelopesObj: {}
   },
   // 一键复制
   copyText: function(e) {
      console.log(e)
      wx.setClipboardData({
         data: e.currentTarget.dataset.text,
         success: function(res) {
            wx.getClipboardData({
               success: function(res) {
                  wx.showToast({
                     title: '复制成功'
                  })
               }
            })
         }
      })
   },

   showSend: app.util.throttle(function(e) {
      let that = this;
      wx.showLoading();
      if (!wx.getStorageSync('userInfo')) {
         that.setData({ scene: 'fa' })
         that.getUserInfo('showCanvas');
         that.setData({
            send_modal: false,
            send_modal_Flag: false,
            canvamodelBtns: false
         })
      } else {
         if (that.data.send_modal) {
            that.setData({
               send_modal: false,
               send_modal_Flag: false
            })
         };

         that.setData({
            autoCanvas: false,
         }, () => {
            // 有用户信息,发红包
            if(that.data.canva){
               that.setData({
                  savePop: true,
                  canvamodel: true,
                  savaSuccessTips: false,
                  canvamodelBtns: true
               })
               wx.hideLoading();
            }else{
               that.sendRedEnvelopes();
            }
         })

      }

   }),
   toCDetail: function(e) {
      //console.log(e)
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({
         url: "/pages/coupon/index?id=" + id + "&shop=true"
      })
   },
   claseRedEnvelopesModal() {
      this.setData({
         send_modal: false
      })
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

   //生成海报
   picture: app.util.throttle(function(e) {
    
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
               complete: function() {
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
         canvasTimer = setTimeout(function() {
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

         },1000)
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
               complete: function() {
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
   circleImg: function(ctx, img, x, y, r) {
      ctx.save();
      var d = 2 * r;
      var cx = x + r;
      var cy = y + r;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, x, y, d, d);
   },

   getCanvsImg: function(timer) {
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
               success: function(res) {
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
            success: function(res) {
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
            success: function(res) {
               that.setData({
                  sharePosters: res.path
               })
            }
         })
      }
      if (!that.data.canvasQrCode){
         wx.getImageInfo({
            src: wx.getStorageSync('arCodeUrl'),
            success: function(res) {
               that.setData({
                  canvasQrCode: res.path
               })
            }
         })

      }


      if (that.data.canvasBg && that.data.canvasAvatar && that.data.canvasQrCode) {
         clearTimeout(canvasTimer);
      }

   },
 
   //绘制海报
   drawPicture: function(e) { //生成图片
      var that = this;
      if (that.data.canva) {
         that.setData({
            canvamodelBtns: true,
            savaSuccessTips: false
         })
         wx.hideLoading()
         return false;
      }
      var timer = setTimeout(function() {
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
            success: function(res) {
               that.setData({
                  canvamodelBtns: true
               },()=>{
                  that.setData({
                     canva: res.tempFilePath
                     
                  })
               })
               wx.hideLoading();
               clearTimeout(canvasTimer);
            },
            fail: function(res) {
               // console.log(res)
               wx.hideLoading();
            }
         }, that)
         wx.hideLoading()
         clearTimeout(timer)
      }, 300)
   },
   //保存海报至相册
   saveImg: function(e) {
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
                  success: function(res) {
                     if (res.cancel) {
                        //console.info("1授权失败返回数据");
                        wx.hideLoading()
                     } else if (res.confirm) {
                        wx.openSetting({
                           success: function(data) {
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
                                          success: function() {

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
   // 保存商家多张海报
   saveHaiBaoImg: function(e) {
      var that = this;
      wx.getSetting({
         success: (res) => {
            if (res.authSetting['scope.writePhotosAlbum'] != undefined && res.authSetting['scope.writePhotosAlbum'] != true) { //非初始化进入该页面,且未授权
               console.log("保存图片提示")
               wx.showModal({
                  title: '是否授权保存到相册',
                  content: '需要获取您的保存到相册，请确认授权，否则海报将无法保存',
                  success: function(res) {

                     if (res.cancel) {
                        console.info("1授权失败返回数据");
                        wx.hideLoading()
                     } else if (res.confirm) {
                        wx.openSetting({
                           success: function(data) {
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
                                       success: function(res) {
                                          var localImg = res.path;
                                          wx.saveImageToPhotosAlbum({
                                             filePath: localImg,
                                             success(res) {},
                                             fail(res) {}
                                          })
                                       }
                                    })
                                 }
                                 if(that.data.picUrls_haibao){
                                    for (var i = 0; i < that.data.picUrls_haibao.length; i++) {
                                       wx.getImageInfo({
                                          src: that.data.picUrls_haibao[i],
                                          success: function(res) {
                                             var localImg = res.path;
                                             setTimeout(function() {
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
                     success: function(res) {
                        var localImg = res.path;
                        wx.saveImageToPhotosAlbum({
                           filePath: localImg,
                           success(res) {},
                           fail(res) {}
                        })
                     }
                  })
               }
               if(that.data.picUrls_haibao){
                  for (var i = 0; i < that.data.picUrls_haibao.length; i++) {
                     wx.getImageInfo({
                        src: that.data.picUrls_haibao[i],
                        success: function(res) {
                           var localImg = res.path;
                           setTimeout(function() {
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
         }
      })
   },
   // 判断手机号
   getPhone() {
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
   onShow() {

   },
   //   我的优惠券
   toMyBenefit() {
      wx.navigateTo({
         url: '/packageA/pages/myBenefit/index?shopId=' + this.data.id
      })
   },

   // 查看在本店的收益
   toMyIncome() {
      wx.navigateTo({
         url: '/pages/myIncome/index?shopId=' + this.data.id + "&shopName=" + this.data.posts.name + "&logo=" + this.data.posts.logo
      })
   },
   // 发红包
   sendRedEnvelopes: function(e) {
      let _self = this;
      let shopId = this.data.id;
      let json = {};
      // wx.showLoading({
      //    title: '正在加载数据'
      // })
      if (_self.data.posts && _self.data.posts.rebate) {
         json = {
            activityId: _self.data.posts.rebate.activityId
         }
      }
   
      app.util.request(_self, {
         url: app.util.getUrl('/rebates/shop/' + shopId),
         method: 'POST',
         header: app.globalData.token,
         data: json
      }).then((res) => {
         // wx.showLoading({
         //    title: '正在加载数据'
         // })
         if (res.code == 200) {

            _self.setData({
               redId: res.result.id,
               envelopesObj: res.result
            })
            //   小程序码
            let codeurl = res.result.arCodeUrl;
            wx.setStorageSync('arCodeUrl', res.result.arCodeUrl)
            if (codeurl) {
               setTimeout(function() {
               wx.getImageInfo({
                  src: wx.getStorageSync('arCodeUrl'),
                  success: function(res) {
                     _self.setData({
                        canvasQrCode: res.path
                     },()=>{
                        _self.picture()
                     })
                  }
               })
            }, 2000)
               // _self.QR.clear();
               // _self.QR.makeCode(codeurl);
               // setTimeout(function() {
               //    wx.canvasToTempFilePath({
               //       canvasId: 'myCanvas',
               //       complete: function(res) {
               //          var tempFilePath = res.tempFilePath;
               //          _self.setData({
               //             canvasQrCode: tempFilePath
               //          }, () => { _self.QR.clear()})
               //          console.log("小程序吗-----qrCodeUrl_fake-----成功" + _self.data.canvasQrCode)
               //          _self.picture()
               //       },
               //       fail: function(res) {
               //          console.log(res);
               //          console.log('小程序码----qrCodeUrl_fake-----失败')
               //       }
               //    });
               // }, 1000)
            } else {
               wx.hideLoading()
            }
         } else if (res.code == 403060) {
            // 没有授权手机号
            _self.setData({
               showPhonePop: true
            })
         } else if (res.code == '405088') {
            // 红包已经领完了

         }
      }).catch((res) => {
         wx.hideLoading();
         wx.showModal({
            title: '提示',
            content: '网络超时',
            showCancel: false,
            confirmText: '重试',
            success(res) {
               if (res.confirm) {
                  _self.onLoad();
                  _self.onShow();
               }
            }
         })
      })
   },
   
   previewImageCanvas: function(e) {
      let that = this;
      var current = e.target.dataset.src;
      wx.showToast({
         title: '长按图片分享',
         image: '/img/finger.png',
         duration: 1000
      })
      console.log(e)

      setTimeout(function() {
         wx.hideToast();
         if (current) {
            wx.previewImage({
               current: current,
               urls: [current],
               success:function(){
                  wx.showToast({
                     title: '成功',
                  })
               }
            })
            that.closeCanvas()
         }

      }, 1000)
      setTimeout(function() {
         wx.showModal({
            title: '提示',
            content: '请到分享的聊天记录里长按海报,领取红包',
            showCancel: false,
            confirmText: '确定',
         })
      },3000)
   },
   swichNav: function(e) {
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
            query.select("#point1").boundingClientRect(function(rect) {
               var target = rect.top + scrollTop - tabheight
               wx.pageScrollTo({
                  scrollTop: target,
                  duration: 0
               })
            }).exec()
         } else if (cur == 1) {
            query.select("#point2").boundingClientRect(function(rect) {
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
      // console.log(e)
      var index = e.detail.current
      this.setData({
         swiperIndex: index
      })
   },
   toShopAllTask: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/shopAllTask/index?id=' + this.data.id + "&callCount=" + this.data.callCount + "&allAmount=" + this.data.allAmount
      })
   }),
   toTaskDetail: app.util.throttle(function(e) {
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({
         url: '/pages/taskDetail/index?id=' + id + '&amount=' + this.data.allAmount + '&count=' + this.data.callCount
      })
   }),
   toBuyCard: app.util.throttle(function() {
      wx.navigateTo({
         url: '/packageA/pages/buyCard/index?id=' + this.data.id
      })
   }),
   //把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
   loadCity: function(latitude, longitude) {
      let _self = this;
      let myAmapFun = new amapFile.AMapWX({
         key: key
      });
      myAmapFun.getRegeo({
         location: '' + longitude + ',' + latitude + '', //location的格式为'经度,纬度'
         success: function(data) {
            let address = data[0].regeocodeData.addressComponent;
            //  console.log(address)
            var locCity = address.citycode;

            var locationCityNme = (address.city.length == 0) ? address.province : address.city;
            _self.setData({
               "location.location": locCity
            })
            var citys = _self.data.citys
            var openCityNme = _self.data.citys[locCity]
            console.log(openCityNme)
            if (openCityNme) {
               console.log("已开通")
               var storLoc = wx.getStorageSync("location")
               if ((!storLoc && locCity == '021') || (storLoc && locCity == storLoc.chooseCode)) {
                  console.log("一致")
                  _self.setData({
                     "location.city": locCity,
                     "location.name": openCityNme,
                  })
                  _self.saveLocation(longitude, latitude, locCity, openCityNme, locCity, locationCityNme)
                  // _self.getTaskList();
                  // _self.getCard();
               } else {
                  //选择城市与定位城市不一致,需要询问用户是否需要切换到定位城市
                  console.log("不一致")
                  wx.showModal({
                     title: '提示',
                     confirmText: '切换',
                     content: '检测到您当前定位在 ' + locationCityNme + ',是否切换到 ' + locationCityNme,
                     success(res) {
                        if (res.confirm) {
                           _self.setData({
                              "location.city": locCity,
                              "location.name": locationCityNme,
                           })
                           _self.saveLocation(longitude, latitude, locCity, openCityNme, locCity, locationCityNme)

                           // _self.getTaskList();
                           _self.getCard();
                        } else if (res.cancel) {
                           var storLoc = wx.getStorageSync("location")
                           console.log(storLoc.locationCode)
                           console.log(storLoc.city)
                           _self.setData({
                              "location.city": storLoc.chooseCode,
                              "location.name": storLoc.chooseName,
                           })
                           // _self.getTaskList();
                           // _self.getCard();
                        }
                     }
                  })
               }
            } else {
               console.log("未开通")
               //用户定位城市还未开通服务,则默认帮用户切换到上海
               wx.showModal({
                  title: '提示',
                  confirmText: '确认',
                  showCancel: 'false',
                  content: '您所在的城市[' + locationCityNme + ']暂未开通赛朋服务,我们将带您去上海',
                  success(res) {
                     if (res.confirm) {
                        _self.setData({
                           "location.city": "021",
                           "location.name": "上海",
                        })
                        _self.saveLocation(longitude, latitude, '021', '上海', locCity, locationCityNme)

                        _self.getTaskList();
                        _self.getCard();
                     }


                  }
               })


            }
         },
         fail: function(info) {
            // _self.getTaskList();
            _self.getCard();
            // console.log("解析失败")
         }
      });
   },
   saveLocation: function(longitude, latitude, chooseCode, chooseName, locationCode, locationName) {
      wx.setStorageSync('location', {
         longitude: longitude,
         latitude: latitude,
         chooseCode: chooseCode,
         chooseName: chooseName,
         locationCode: locationCode,
         locationName: locationName
      });
   },


   // 授权地址及
   to_auth_address: function() {
      // console.log('点击了')
      // this.getLocation();
      var that = this;
      wx.getSetting({
         success: (res) => {
            // console.log(res);
            // console.log(res.authSetting['scope.userLocation']);
            if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
               wx.openSetting({
                  success: function(data) {
                     // console.log(data);
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
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
      var that = this;
      console.log('onload')
      let obj = {
         parentThis: this
      };
  
      setTimeout(function() {
         wx.hideLoading()
      }, 1000)

      if (options.rebate) {
         obj.rebate = options.rebate
      }
      if (options.id) {
         obj.id = options.id;
      }

      if (options.scene) {
         let id = decodeURIComponent(options.scene);
         obj.id = id;
      }
      if (options.containueFlag) {
         this.setData({
            containueFlag: options.containueFlag
         })
      }
      // 从模板消息进入,扫描小程序码进入就弹窗,长按识别小程序码进入,
      if (options.orderDetail || options.orderDetail == 1 || app.globalData.scene == 1047 || app.globalData.scene == 1048 || app.globalData.scene == 1058 || app.globalData.scene == 1074 || app.globalData.scene == 1081) {
         setTimeout(function() {
            that.setData({
               send_modal_Flag: true
            }, 1500)
         })
      }

      this.setData(obj)
      // 获取地理位置
      // app.util.getLocation(that)
      // 获取手机信息
      let sysinfo = wx.getSystemInfoSync();
      console.log(sysinfo)
      let qrcode = new QRCode('myCanvas', {
         text: '',
         //获取手机屏幕的宽和长  进行比例换算
         // width: sysinfo.windowWidth * 660 / 3684,
         // height: sysinfo.windowHeight * 660 / 6184,
         width: 70,
         height: 70,
         //二维码底色尽量为白色， 图案为深色
         colorDark: '#000000',
         colorLight: '#ffffff',
         correctLevel: QRCode.correctLevel.H
      });
      //将一个局部变量共享
      this.QR = qrcode;


      // this.QR.clear();
      // this.QR.makeCode('http://weixin.qq.com/q/02_SONFlxmbIT19Y_eNu1t');


      this.getdata();

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
            // console.log(res)
            if (res.code == 200) {
               wx.hideLoading()
               that.showSend()
               that.setData({
                  user: res.result
               })
               wx.setStorageSync('userInfo', res.result);
               if (res.result.avatarUrl) {
                  wx.getImageInfo({
                     src: res.result.avatarUrl,
                     success: function(res) {
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

   // 获取商家详情
   getdata() {
      var storage = wx.getStorageSync('location')
      var that = this;

      var json = {
         shopId: this.data.id,
         location: storage.locationCode ? storage.locationCode : that.data.location.locationCode ? that.data.location.locationCode : '021',
         latitude: storage.latitude ? storage.latitude : that.data.location.latitude ? that.data.location.latitude : '',
         longitude: storage.longitude ? storage.longitude : that.data.location.longitude ? that.data.location.longitude : ''
      }
      var url = app.util.getUrl('/shops/' + this.data.id, json)
      wx.request({
         url: url,
         method: 'GET',
         header: app.globalData.token,
         success: function(res) {
            that.setData({showLoading:false})
            let data = res.data;
            if (data.code == 200) {
               let pic;
               let shareTitle;
               let sharePosters;
               if (data.result.rebate && data.result.rebate.total) {
                  console.log('有现金300')
                   //有现金300
                  that.setData({
                     send_money_modal: true
                  })
                  if (data.result.sharePosters && data.result.sharePosters['3002']) {
                     pic = data.result.sharePosters['3002'].picUrl
                  }
                  if (data.result.sharePosters && data.result.sharePosters['3004']) {
                     sharePosters = data.result.sharePosters['3004'].picUrl
                  }
                  shareTitle = '一试知真假,现金秒到无套路';
               } else {
                  console.log('无现金3001')
                  // 无现金3001
                  that.setData({
                     send_coupon_modal: true
                  })
                  if (data.result.sharePosters && data.result.sharePosters['3001']) {
                     pic = data.result.sharePosters['3001'].picUrl
                  }
                  if (data.result.sharePosters && data.result.sharePosters['3003']) {
                     sharePosters = data.result.sharePosters['3003'].picUrl
                  }
                  shareTitle = '见者有份, 限量折扣券';
               }
               wx.setStorageSync('canvasBg', pic)
               wx.setStorageSync('sharePosters', sharePosters)
               // start-----懒加载
            
               let picUrls_fake = [];
               if(data.result.picUrls){
                  for (var i = 0; i < data.result.picUrls.length; i++) {
                     picUrls_fake.push(data.result.picUrls[i].split('_org.').join('.'))
                  }
               }
             
               that.setData({
                  posts: data.result,
                  picBg: pic,
                  sharePicUrl: pic,
                  shareTitle: shareTitle,
                  picUrls_haibao: data.result.picUrls?data.result.picUrls.slice(0, 8):[],
                  picUrls_fake: picUrls_fake
               })
              
               // end-----懒加载
               if (data.result.video) {
                  that.setData({
                     videoheight: that.data.posts.video.height * 1 > that.data.posts.video.width * 1 ? "height:650rpx;" : "height:422rpx;"
                  })
                  that.getVideo();
               }
               const tenKm = 10000;
               if (data.result.distance) {
                  if (data.result.distance > tenKm) {
                     // 距离大于十公里
                     // this
                  }
               }
               that.getCanvsImg();
               if (that.data.send_modal_Flag && !that.data.send_modal) {
                  that.setData({
                     send_modal: true
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
            if (data.result.rebate) {
               that.setData({
                  autoCanvas: true,
                  scene: 'autoCanvas',
                  rebateTotal: parseInt(data.result.rebate.total)
               }, () => {
                  // 模拟发红包
                   that.sendRedEnvelopes()
               })
            }
            let inittimer = setTimeout(function() {
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
         success: function(res) {
            let data = res.data;
            console.log(res)
            if (data.code == 200) {
               that.setData({
                  video: data.result.url,
                  videoheight: data.result.height * 1 > data.result.width * 1 ? "height:650rpx;" : "height:422rpx;"
               })
               console.log(that.data.video)
            }
         }
      });
   },
   makePhone() {
      var that = this
      wx.makePhoneCall({
         phoneNumber: that.data.posts.tel,
         fail: function(res) {
            console.log(res)
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

   toHome: app.util.throttle(function(e) {
      var id = e.currentTarget.dataset.id;
      wx.switchTab({
         url: '/pages/home/home'
      })
   }),
   // 模糊图加载完成
   smallImgLoad(e) {
      var that = this
      var index = e.currentTarget.dataset.index;
      // console.log(index)
      let pictures = that.data.pictures;
      that.setData({
         ['pictures[' + index + '].smallPicFlag']: true,
      })
   },
   //高清图片加载完毕
   imgload(e) {
      var that = this
      // setTimeout(function () {
      //    var index = e.currentTarget.dataset.index;
      //    var loading = "loading" + index;
      //    var img = "img" + index;
      //    var imgerr = "imgerr" + index;
      //    var loadingobj = "load." + loading
      //    var imgobj = "load." + img
      //    var imgerrobj = "load." + imgerr
      //    that.setData({
      //       [loadingobj]: true,
      //       [imgobj]: false,
      //       [imgerrobj]: true
      //    })
      // }, 300)
      var index = e.currentTarget.dataset.index;
      // console.log(index)
      let pictures = that.data.pictures;
      if (pictures[index].smallPic) {
         pictures[index].smallPic = null
      }
      that.setData({
         ['pictures[' + index + '].smallPic']: null,

      })

      //console.log(that.data.pictures)
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

   },
   closePhonePop() {
      this.setData({
         showPhonePop: false
      })
   },
   //关闭海报
   closeCanvas: function() {
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
   // 领取红包
   // toCouponDetail: app.util.throttle(function() {
   //    wx.navigateTo({
   //       url: "/pages/coupondetail/index?id=" + this.data.posts.videoRedEnvelopes[0].id
   //    })
   // }),
   getPhoneNumber(e) {
      wx.showLoading({
         title: '加载中',
      })
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
               console.log("/phone/bind")
               console.log(res)
               wx.hideLoading();
               let data = res.data;
               if (data.code == 200) {
                  // 授权手机号成功,领取红包
                  _self.sendRedEnvelopes(e)
                  if (data.result) {
                     wx.setStorageSync('token', data.result.token);
                     app.globalData.token.token = data.result.token
                  }
                  _self.setData({
                     showPhonePop: false
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
   onPageScroll: function(res) {
      let _this = this;
      let scrollTop = res.scrollTop;
      // 懒加载
      var str = parseInt(scrollTop / _this.data.damoHeight);
      // console.log(str)
      _this.data.arry[str] = true;
      _this.setData({
         arry: _this.data.arry
      })
      // console.log(_this.data.arry)
   },


   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function() {
      //可以先初始化首屏需要展示的图片
      this.setData({
         count: 1
      })

      //开始监听节点，注意需要在onReady才能监听，此时节点才渲染
      // lazyload.observe();
      if (this.data.containueFlag) {
         console.log('真')

      }

   },




   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function() {
 
      clearTimeout(canvasTimer);
      wx.hideLoading()
   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function() {

      clearTimeout(canvasTimer);
      wx.hideLoading()
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
      let arr = this.data.arry;
      arr.fill(true);
      this.setData({
         arry: arr
      })
   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function(options) {
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
   },

})