//index.js
//获取应用实例
const app = getApp();
let key = "86191bf891316ee5baec8a0d22b92b84"; //申请的高德地图key
let amapFile = require('../../utils/amap-wx.js');
Page({
   data: {
      data: '',
      location: {
         city: "021",
         name: "上海",
         longitude: "",
         latitude: "",
         location: '021'
      }, //定位获取的地址，
      choose: {}, //上次选择的城市
      citys: {},
   },
   onShow() {
      let that = this;
      var storgeLoc = wx.getStorageSync('location');
   
      this.setData({
         "location.code": storgeLoc.locationCode,
         "location.name": storgeLoc.locationName,
         "choose.code": storgeLoc.chooseCode,
         "choose.name": storgeLoc.chooseName

      })

      app.util.ajax({
         url: '/dict/city',
         success: function(res) {
            let data = res.data;
            if (data.code == 200) {
               that.setData({
                  data: data.result,
               })
            } else {
               wx.showToast({
                  title: data.message,
                  icon: 'none',
                  duration: 2000
               });
            }
         }
      });
   },
   getdata() {},
   // 授权地址及
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
                     success: function (data) {
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
         var locCity = address.citycode;
         var locationCityNme = (address.city.length == 0) ? address.province : address.city;
         that.setData({
            "location.location": locCity
         })
         var citys = that.data.citys
         var openCityNme = citys[locCity];
         if (openCityNme) {
            console.log("已开通")
            var storLoc = wx.getStorageSync("location")
            if ((!storLoc && locCity == '021') || (storLoc && locCity == storLoc.chooseCode)) {

               that.setData({
                  "location.city": locCity,
                  "location.name": openCityNme,
               })
               that.saveLocation(longitude, latitude, locCity, openCityNme, locCity, locationCityNme)


            } else {
               //选择城市与定位城市不一致,需要询问用户是否需要切换到定位城市
               //console.log("不一致")
               if (!that.data.switchConfirm) {
                  return false;
               }
               console.log('是否切换' + that.data.switchConfirm)
               wx.showModal({
                  title: '提示',
                  confirmText: '切换',
                  content: '检测到您当前定位在 ' + locationCityNme + ',是否切换到 ' + locationCityNme,
                  success(res) {
                     // 点击切换
                     if (res.confirm) {
                        that.setData({
                           "location.city": locCity,
                           "location.name": locationCityNme,
                           'chooseCode': locCity,
                           'switchConfirm': true
                        })
                        that.saveLocation(longitude, latitude, locCity, openCityNme, locCity, locationCityNme)


                     } else if (res.cancel) {
                        // 不切换
                        var storLoc = wx.getStorageSync("location")
                        //console.log(storLoc.locationCode)
                        //console.log(storLoc.city)
                        that.setData({
                           "location.city": storLoc.chooseCode,
                           "location.name": storLoc.chooseName,
                           'switchConfirm': false
                        })
                        // that.getTaskList();
                        // that.getCard();
                     }
                  }
               })
            }
         } else {
            //console.log("未开通")
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
         console.log("解析失败")
      }
   });
},
saveLocation: function (longitude, latitude, chooseCode, chooseName, locationCode, locationName) {
   let json = {
      longitude: longitude,
      latitude: latitude,
      chooseCode: chooseCode,
      chooseName: chooseName,
      locationCode: locationCode,
      locationName: locationName
   }
   console.log('执行')
  console.log(json)
   this.setData({
      'location.longitude': longitude,
      'location.latitude': latitude,
      'location.name': chooseName,
      'location.city': chooseCode,
      'location.location': locationCode
   }, () => {
    
   })
   wx.setStorageSync('location', json);
},


   directFn: function(e) {
      var storgeLoc = wx.getStorageSync('location')
      wx.setStorageSync('location', {
         longitude: storgeLoc.longitude,
         latitude: storgeLoc.latitude,
         location: storgeLoc.locationCode,
         locationCode: storgeLoc.locationCode,
         locationName: storgeLoc.locationName,
         city: e.currentTarget.dataset.code,
         chooseCode: e.currentTarget.dataset.code,
         chooseName: e.currentTarget.dataset.name
      });
      wx.switchTab({
         url: '../home/home'
      })
   }
})