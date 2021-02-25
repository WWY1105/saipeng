// pages/home/home.js
//获取应用实例
const app = getApp(),
   key = "86191bf891316ee5baec8a0d22b92b84"; //申请的高德地图key
let amapFile = require('../../utils/amap-wx.js');

var leftHstart = 0,
   rightHstart = 0; //加载下页瀑布流数据时，前面数据的左右盒子高度
var newImgData = []; //处理瀑布流所需变量
var timer_2=null;
var canLoadNextPage = false;
Page({
   /**
    * 页面的初始数据
    */
   data: {
      time: 0,
      showLoading: true,
      hasData: true,
      pubuliuResultsList: [],
      pubuliuNewArrData: false,
      shops: false,
      citys: {},
      userInfo: '',
      cardList: '',
      chooseCode: '',
      location: {
         city: "021",
         name: "上海",
         longitude: "",
         latitude: "",
         location: '021'
      },
      keyword:'',
      parentThis: '',

      pageSize: '',
      page: 1,
      lastPage: false,
      // 分页数量
      count: 20, //每页5条数据

      height: 0, //手机视口高度
      scrollTop: 0,
      scrollFlag: false,
      startX: 0,
      ongoingRebates: 0,
      damoHeight: '30', //demo高度
      array: [],
      total: 0,
   },

   //  获取用户详情
   getUserInfo() {
      let that = this;
      if (wx.getStorageSync('userInfo')) {
         wx.hideLoading()
      } else {
         app.util.request(that, {
            url: app.util.getUrl('/user'),
            method: 'GET',
            header: app.globalData.token
         }).then((res) => {
            if (res.code == 200) {
               wx.hideLoading()
               that.setData({
                  user: res.result
               })
               wx.setStorageSync('userInfo', res.result)

            }
         })
      }
   },

   scrollTopFn() {
      wx.pageScrollTo({
         scrollTop: 0
      })
   },
   // 获取容器高度，使页面滚动到容器底部
   pageScrollToBottom: function () {
      wx.pageScrollTo({
         scrollTop: this.data.scrollTop
      })
   },

   /**
    * 监听页面滚动
    */
   onPageScroll: function (e) {
      let scrollTop = e.scrollTop;
      this.setData({
         scrollTop
      })
      let _this = this;
      // 懒加载
      var str = parseInt(scrollTop / _this.data.damoHeight);
      _this.data.array[str] = true;
      _this.setData({
         array: _this.data.array
      })
   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function () {

      let This = this;
      if (!This.data.lastPage) {
         console.log('加载一下页');
         if (!canLoadNextPage) {
            return;
         }
         newImgData = [];
         This.setData({
            pubuliuNewArrData: [],
         }, () => {
            This.getshops(); //获取页面列表数据
         });
      }
   },
   shopInput(e){
      console.log(e)
      this.setData({keyword:e.detail.value})
   },
   // 获取商店列表
   getshops: function () {
      console.log('最后一页？' + this.data.lastPage)
      if (this.data.lastPage) return;
      let page = this.data.page
      let that = this;
      that.setData({
         showLoading: true
      })
      // encodeURI()
      let json = {
         "keyword":that.data.keyword,
         "location": that.data.location.location,
         "latitude": that.data.location.latitude,
         "longitude": that.data.location.longitude,
         "count": that.data.count,
         "page": page,
         "city": that.data.location.city || "021",
      }
      let header=app.globalData.token;
      wx.request({
         url: app.util.getUrl('/activities', json),
         method: 'GET',
         header:header,
         success: function (res) {
            that.setData({
               showLoading: false
            })
            let data = res.data;
            console.log(data);
            let shops = that.data.shops;
            console.log('shops')
            console.log(shops)
            if (data.code == 200) {
               let result = data.result.items;
               let lastPage = that.data.lastPage;
               let hasData = that.data.hasData;
               result.forEach(function (i, j) {
                  if (i.picUrl) {
                     i.smallPic = i.picUrl.split('_org').join('')
                  }
               })
               console.log('页码' + page + '最大=' + data.result.pageSize)
               page++;
               if (page > data.result.pageSize) {
                  lastPage = true;
                  hasData = true;
               } else {
                  lastPage = false;
                  hasData = false;
               }
               that.setData({
                  hasData: true,
                  page,
                  lastPage,
                  pubuliuNewArrData: app.setCurNewPubuImgData(result)
               })
               wx.hideLoading();
            } else if (data.code == 403000) {
               wx.removeStorageSync('token')
            } else if (data.code == 404000) {
               wx.hideLoading();
               console.log(that.data.lastPage)
               if (that.data.lastPage) {

               } else {
                  that.setData({
                     lastPage: true,
                     shops: [],
                     init: false,
                     hasData: false,
                  })
               }


            } else if (data.code == 403060) {
               wx.hideLoading();
               if (new Date().getTime() > 1562151607000) {
                  that.setData({
                     phonePop: true,
                     init: false
                  })
               }
            } else {
               that.setData({
                  shops: ''
               })
               wx.showToast({
                  title: data.message,
                  duration: 2000
               });
            }
            wx.hideLoading();
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
      });



   },

   againRequest() {

   },

   // 防止多次点击
   toShopDetail: app.util.throttle(function (e) {
      var id = e.currentTarget.dataset.id;
      // 发起者
      wx.navigateTo({
         url: '/pages/shopDetail/index?id=' + id
      })


   }),
   /**
    * 生命周期函数--监听页面加载
    */
   watch: {
      scrollTop: {
         handler(newValue) {
            if (newValue > 200) {
               this.setData({
                  scrollFlag: true
               })
            } else {
               this.setData({
                  scrollFlag: false
               })
            }
         },
         deep: true
      }
   },

   getCitys() {
      let that = this;
      app.util.ajax({
         url: '/dict/city',
         success: function (cityres) {
            let citydata = cityres.data;
            let city = {}
            if (citydata.code == 200) {
               for (var v in citydata.result) {
                  city[citydata.result[v].code] = citydata.result[v].name
               }
            }
            that.setData({
               citys: city
            })
         }
      })
   },
   //把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
   loadCity: function (latitude, longitude) {
      let that = this;
      var storLoc = wx.getStorageSync("location")
      let myAmapFun = new amapFile.AMapWX({
         key: key
      });
      myAmapFun.getRegeo({
         location: '' + longitude + ',' + latitude + '', //location的格式为'经度,纬度'
         success: function (data) {
            let address = data[0].regeocodeData.addressComponent;
            var locCity = address.citycode;
            var locationCityNme = (address.city.length == 0) ? address.province : address.city;
            that.setData({
               "location.location": locCity
            })
            var citys = that.data.citys
            var openCityNme = citys[locCity];
            if (openCityNme) {
               // console.log("已开通="+locCity)
               if (!storLoc.city) {
                  console.log("没有选择过城市，一致")
                  that.setData({
                     "location.city": locCity,
                     "location.name": openCityNme,
                  })
                  that.saveLocation(longitude, latitude, locCity, openCityNme, locCity, locationCityNme)

               } else if (storLoc.city) {
                  //选择城市与定位城市不一致,需要询问用户是否需要切换到定位城市
                  if (storLoc.city==storLoc.locationCode) {
                     console.log("一致")
                     that.setData({
                        "location.city": false,
                        "location.name": locationCityNme,
                        'city': locCity
                     })
                     that.saveLocation(longitude, latitude, locCity, openCityNme, locCity, locationCityNme)
                  } else {
                    
                     wx.showModal({
                        title: '提示',
                        confirmText: '切换',
                        content: '检测到您当前定位在 ' + locationCityNme + ',是否切换到 ' + locationCityNme,
                        success(res) {
                           // 点击切换
                           if (res.confirm) {
                              that.setData({
                                 "location.city":false,
                                 "location.name": locationCityNme,
                                 'location.chooseName':false
                              })
                              that.saveLocation(longitude, latitude, false, false, locCity, locationCityNme)
                           } else if (res.cancel) {
                              // 不切换
                              that.setData({
                                 "location.name": storLoc.chooseName,
                                 "location.city": storLoc.chooseCode,
                              }, () => {
                                 // longitude, latitude, chooseCode, chooseName, locationCode, locationName
                                 that.saveLocation(longitude, latitude, storLoc.chooseCode, storLoc.chooseName,locCity, locationCityNme)
                              })

                           }
                        }
                     })
                  }

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
                        that.setData({
                           "location.city": "021",
                           "location.name": "上海",
                        })
                        
                        that.saveLocation(longitude, latitude, '021', '上海', locCity, locationCityNme)

                     }
                  }
               })


            }
         },
         fail: function (info) {
            // console.log("解析失败")
         }
      });
   },
   saveLocation: function (longitude, latitude, chooseCode, chooseName, locationCode, locationName) {
     this.initFun()
      let json = {
         longitude: longitude,
         latitude: latitude,
         location:locationCode,
         chooseCode: chooseCode,
         chooseName: chooseName,
         locationCode: locationCode,
         locationName: locationName
      }

      this.setData({
         'location.longitude': longitude,
         'location.latitude': latitude,
         'location.name': chooseName,
         'location.city': chooseCode,
         'location.location': locationCode
      }, () => {
        
         this.getshops();
      })
      wx.setStorageSync('location', json);
   },
   getPhoneNumber(e) {
      wx.showLoading({
         title: '加载中',
         mask: true
      })

      if (new Date().getTime() < 1562234940000) {
         return;
      }


      var that = this
      if (e.detail.errMsg == 'getPhoneNumber:fail user deny' || e.detail.errMsg == 'getPhoneNumber:user deny') {
         wx.showModal({
            title: '提示',
            showCancel: false,
            content: '未授权',
            success: function (res) {
               wx.hideLoading();
               that.setData({
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
               console.log("/phone/bind")
               console.log(res)
               wx.hideLoading();
               let data = res.data;
               if (data.code == 200 || data.code == 405025) {
                  if (data.result) {
                     wx.setStorageSync('token', data.result.token);
                     app.globalData.token.token = data.result.token
                  }
                  that.setData({
                     phonePop: false
                  })
                  wx.showToast({
                     title: "授权成功",
                     duration: 2000
                  });
                  that.againRequest()
               } else {
                  // wx.showToast({
                  //   title: data.message,
                  //   duration: 2000
                  // });
               }
            }
         });
      }
   },

   redirectCity: function () {
      wx.navigateTo({
         url: '../city/city'
      })
   },
   login() {
      var that = this
      wx.login({
         success: res => {
            if (res.code) {
               that.setData({
                  code: res.code
               })
               //发起网络请求
               wx.request({
                  url: app.util.getUrl('/auth'),
                  method: 'POST',
                  header: app.globalData.token,
                  data: {
                     code: res.code
                  },
                  success: function (res) {
                     let data = res.data;
                     if (data.code == 200) {
                        if (data.result.token) {
                           wx.setStorageSync('token', data.result.token);
                           app.globalData.token.token = data.result.token;
                        }
                        // that.getUser();
                        that.setData({
                           toAuth: false
                        })
                     }
                  },
                  fail: function () {}
               })
            }
         },
         fail: function () {}
      })
   },
   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {
      // this.getUserInfo()
   },
   onHide() {
      // console.log('onHide')
   },
   onLoad: function (options) {
      console.log('重新onLoad')
     clearInterval(timer_2)
     this.initFun(); //初始化  清空 页面数据
     let location=wx.getStorageSync('location');
     if(location.chooseCode ){
      location.chooseCode=false;
     }
     if(location.chooseName ){
      location.chooseName=false;
     }
     if(location.city ){
      location.city=false;
     }
 
     wx.setStorageSync('location', location)
      this.getCitys();
      this.data.array[this.data.activeLazy] = true;
      this.setData({
         parentThis: this,
         time:0,
         array: this.data.array
      })
      let i = this.data.time;
      timer_2 = setInterval(() => {
         i++;
         this.setData({
            time: i
         },()=>{
            console.log(this.data.time)
         })
      }, 1000);



      this.getshops()
      app.locationCheck(res => {
         this.initFun(); //初始化  清空 页面数据
         if (res) {
            this.loadCity(res.latitude, res.longitude)
         } else {
            this.getshops()
         }
      },this)
    
   },
   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {
      var that = this;
      let location=wx.getStorageSync('location');
      console.log(location)
      let showModal=app.globalData.showModal;
      that.setData({showModal,location},()=>{
         app.globalData.showModal=false
      })
      console.log('app.globalData.reloca='+app.globalData.reloca)
      if(that.data.time>600){
         console.log('超时了')
       
         that.onLoad()
        
      }else if(location.city){
         console.log('没有超时')
         that.initFun();
         that.getshops()

      }
      
      // 获取我正在发的红包
      // this.getMyRed();
      // if (!wx.getStorageSync('token')) {
      //    that.login()
      // } else {
      //    //  that.getUser()
      //    that.setData({
      //       toAuth: false
      //    })
      // }
      // 获取系统信息
      wx.getSystemInfo({
         success: function (res) {
            // 获取可使用窗口宽度
            let clientHeight = res.windowHeight;
            // 获取可使用窗口高度
            let clientWidth = res.windowWidth;
            // 算出比例
            let ratio = 750 / clientWidth;
            // 算出高度(单位rpx)
            let height = clientHeight * ratio;
            // 设置高度
            that.setData({
               height: height
            });
         }
      })
      // ----------------------------------------------------------------------

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
      let that = this;
      this.initFun()
      this.setData({
         // pubuliuResultsList: [],
         pubuliuNewArrData: [],
         page: 1,
         phonePop: false,
         lastPage: false
      }, () => {
         var timer_ = setTimeout(function () {
            wx.stopPullDownRefresh();
            that.getshops()
            clearTimeout(timer_);
         }, 500)
      })


   },
   searchFn(){
      this.initFun();
      this.getshops()
   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function () {

   },


   closeModal() {
      this.setData({
         showModal: false
      })
   },
   toDetail(e) {
      let item = e.currentTarget.dataset.item;
      if (item.type == 2) {
         // 购买
         wx.navigateTo({
            url: '/pages/shareCard/buyCard/buyCard?shop=' + item.shopId + '&activityId=' + item.id,
         })
      } else {
         // 领取
         wx.navigateTo({
            url: '/pages/shareCard/joinShare/joinShare?id=' + item.id + '&type=card'
         })
      }
   },














   //初始化 / 清空 页面数据(页面加载时、筛选数据加载第一页时 调用)
   initFun: function () {
      let This = this;
      leftHstart = 0, rightHstart = 0; //加载下页瀑布流数据时，前面数据的左右盒子高度
      newImgData = []; //处理瀑布流所需变量

      This.setData({
         lastPage:false,
         page: 1, //页码
         pubuliuNewArrData: '',
         pubuliuResultsList: '',
      });
   },


   /*
   瀑布流相关处理:
   1、处理最新加载的瀑布流数据中图片，先显示，再根据 bindload 获取 并 存储 与 原来KEY 相对应的 等宽情况下的高度 数组
      => newImgData[key].h （key 与最新加载的JSON数据的 key 相同）
   2、根据所有图片加载完成后，调用app.js中方法，设置左、右两边数据
   */
   pubuImgLoad: function (e) {
      let This = this;
      let inListIndex = e.currentTarget.dataset.key;
      //console.log(e.detail.width);
      //console.log(inListIndex);
      newImgData[inListIndex] = {};
      newImgData[inListIndex].h = (300 / e.detail.width) * e.detail.height;
      if (newImgData.length == This.data.pubuliuNewArrData.length) {
         //防止最后一个数据中的图片先加载完成，这样lenth也相等
         for (let i = 0; i < newImgData.length; i++) {
            if (!newImgData[i]) {
               return;
            }
         }
         //newImgData 获取的最新数据 - newImgData[key].h （key 与最新加载的JSON数据的 key 相同）
         //This.data.pubuliuNewArrData 获取的最新数据（处理过的数组） - This.data.pubuliuNewArrData[key]. （key 与最新加载的JSON数据的 key 相同）
         //leftHstart 本次数据加载 前 的 左 边高度
         //rightHstart 本次数据加载 前 的 右 边高度
         app.setCurResultsPubuImgData(newImgData, This.data.pubuliuNewArrData, leftHstart, rightHstart, function (pubuliuResultsList, leftH, rightH) {
            console.log('pubuliuResultsList');
            console.log(pubuliuResultsList);
            leftHstart = leftH;
            rightHstart = rightH;

            if (This.data.pubuliuResultsList) {
               pubuliuResultsList.listL = This.data.pubuliuResultsList.listL.concat(pubuliuResultsList.listL);
               pubuliuResultsList.listR = This.data.pubuliuResultsList.listR.concat(pubuliuResultsList.listR);
            }
            This.setData({
               pubuliuResultsList: pubuliuResultsList,
               pubuliuNewArrData: '',
            });
            setTimeout(function () {
               canLoadNextPage = true;
            }, 500);
         })
      }
   },

})