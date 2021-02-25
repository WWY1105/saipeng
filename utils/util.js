//   const formatTime = date => {
//   const year = date.getFullYear()
//   const month = date.getMonth() + 1
//   const day = date.getDate()
//   const hour = date.getHours()
//   const minute = date.getMinutes()
//   const second = date.getSeconds()

//   return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }

// const formatNumber = n => {
//   n = n.toString()
//   return n[1] ? n : '0' + n
// }

// module.exports = {
//   formatTime: formatTime
// }


const md5 = require('./md5.js');

const formatTime = date => {
   //console.log(date);
   let weekArr = ['日', '一', '二', '三', '四', '五', '六'];
   let str = date.split("-")[1] + "." + date.split("-")[1] + "/";
   date = new Date(date);
   if (date.toDateString() === new Date().toDateString()) {
      str = '今天';
   } else {
      str = "周" + weekArr[date.getDay()];
   }
   return str;
}
const getDistance = distance => {
   let str = "";
   if (distance < 1000) {
      str += "m"
   } else {
      distance = distance / 1000;
      str = parseInt(distance) + "km";
   }
   return str;
}
const getUrl = function (url, para = {}) {
   const app = getApp();
   //origin
   url += "?";
   const password = "037925fa578c4ed98885d7b28ade5462";
   let j = JSON.parse(JSON.stringify(para));//param's json
   j.timestamp = (new Date).getTime();
   let key_json = Object.keys(j);
   key_json.sort();
   let encode_str = "";
   for (let h in key_json) {
      encode_str += key_json[h] + "=" + j[key_json[h]];
      url += key_json[h] + "=" + j[key_json[h]] + "&";
   }

   let i = md5.hexMD5(encode_str + password), m = "";
   for (let o = 0; o < i.length; o += 2) m += i.charAt(o);
   for (let s = 1; s < i.length; s += 2) m += i.charAt(s);
   return app.globalData.ajaxOrigin + url + "signature=" + m;
};
//json={url，method,success}
let goon = true;
const ajax = function (json) {
   if (!goon) return;
   if (json.method == 'POST') {
      json.url = getUrl(json.url)
   } else {
      json.url = getUrl(json.url, json.data);
      json.data = {};
   }
   const app = getApp();
  
   wx.request({
      url: json.url,
      header: app.globalData.token,
      method: json.method || 'GET',
      data: json.data,
      success: function (res) {
         let data = res.data;
         if (data.code == 403000) {
            goon = false;
            wx.removeStorageSync('token');
            //login
            if (!wx.getStorageSync('token')) {
               wx.login({
                  success: res => {
                     // 发送 res.code 到后台换取 openId, sessionKey, unionId
                     if (res.code) {
                        //发起网络请求
                        wx.request({
                           url: getUrl('/auth'),
                           method: 'POST',
                           header: app.globalData.token,
                           data: {
                              code: res.code
                           },
                           success: function (res) {
                              let data = res.data;
                              if (data.code == 200) {
                                 goon = true;
                                 if (data.result.token) {
                                    wx.setStorageSync('token', data.result.token);
                                    //console.log("setStorageSync")
                                    //console.log(data.result.token)
                                    app.globalData.token.token = data.result.token;
                                 }
                                 if (getCurrentPages().length != 0) {
                                    //刷新当前页面的数据
                                    //console.log(1)
                                    getCurrentPages()[getCurrentPages().length - 1].onShow()
                                 }
                              } else {
                                 wx.showToast({
                                    title: data.message,
                                    icon: 'none',
                                    duration: 2000
                                 });
                              }
                           }
                        })
                     } else {
                        //console.log('登录失败！' + res.errMsg)
                     }
                  }
               })
            }else{
               login();
            }
          
         } else {
            json.success(res);
         }
      }
   });

}

function isHttpSuccess(status) {
   return status >= 200 && status < 300 || status === 304;
}

function requestP(options = {}) {
   const {
      success,
      fail,
   } = options;

   // let header = Object.assign({
   //   token: wx.getStorageSync('token')
   // }, options.header);

   return new Promise((res, rej) => {
      wx.request(Object.assign(
         {},
         options,
         {
            success(r) {
               //console.log(r)
               const isSuccess = isHttpSuccess(r.statusCode);
               if (isSuccess) {  // 成功的请求状态
                  res(r.data);
               } else {
                  rej({
                     msg: `网络错误:${r.statusCode}`,
                     detail: r
                  });
               }
            },
            fail: rej,
         },
      ));
   });
}

function getSessionId() {
   return new Promise((res, rej) => {
      // 本地sessionId缺失，重新登录
      if (!wx.getStorageSync('token')) {
         //console.log('没token')
         login()
            .then((r1) => {
               res(r1);

            })
            .catch(rej);
      } else {
         res();
      }
   });
}
function authSuccess(fn){
   fn()
}

function login() {
   const app = getApp();
   return new Promise((res, rej) => {
      // 微信登录
      wx.login({
         success(r1) {
            if (r1.code) {
               //console.log('调auth')
               // 获取sessionId
               requestP({
                  url: getUrl('/auth'),
                  header: app.globalData.token,
                  data: {
                     code: r1.code,
                  },
                  method: 'POST'
               })
                  .then((r2) => {
                     if (r2.code == 200) {
                        if (r2.result.token) {
                           // 登陆后设置token
                           wx.setStorageSync('token', r2.result.token);
                           app.globalData.token.token = r2.result.token;
                        }

                        res(r2)
                     } else {
                        res(r2)
                     }
                  })
                  .catch((err) => {
                     rej(err);
                  });
            } else {
               rej({
                  msg: '获取code失败',
                  detail: r1
               });
            }
         },
         fail: rej,
      });
   });
}

function request(that, options = {}, keepLogin = true) {
   if (keepLogin) {
      return new Promise((res, rej) => {
         getSessionId()
            .then((r1) => {
               //console.log(r1)
               // 获取sessionId成功之后，发起请求
               if (r1 && r1.code == 403000) {
                  //授权弹窗
                  console.log("授权弹窗")
                  console.log(that.selectComponent("#authpop"))
                  wx.hideLoading();
                  var pop;
                  if (that.selectComponent("#authpop")) {
                     pop = that.selectComponent("#authpop");
                     console.log(pop)
                     pop.showpop()
                  }
               } else {
                  requestP(options)
                     .then((r2) => {
                        //console.log(r2.code)
                        if (r2.code == 403000) {
                           // 登录状态无效，则重新走一遍登录流程
                           // 销毁本地已失效的sessionId
                           wx.removeStorageSync('token')
                           getSessionId()
                              .then((r3) => {
                                 if (r3.code == 403000) {
                                    //调起授权弹窗
                                    var pop;
                                    if (that.selectComponent("#authpop")) {
                                       pop = that.selectComponent("#authpop");
                                       wx.hideLoading();
                                       pop.showpop()
                                    }

                                 } else if (r3.code === 200) {
                                    var pop;
                                    if (that.selectComponent("#authpop")) {
                                       pop = that.selectComponent("#authpop");
                                       pop.hiddenpop();
                                       
                                       requestP(options)
                                          .then(res)
                                          .catch(rej);
                                    }
                                 }

                              });
                        } else if (r2.code == 200) {
                           var pop;
                           if (that.selectComponent("#authpop")) {
                              pop = that.selectComponent("#authpop");
                              pop.hiddenpop()
                           }
                           res(r2)
                        } else {
                           res(r2)
                        }
                     })
                     .catch(rej);
               }

            })
            .catch(rej);
      });
   } else {
      // 不需要sessionId，直接发起请求
      return requestP(options);
   }
}

function throttle(fn, gapTime) {
   if (gapTime == null || gapTime == undefined) {
      gapTime = 2000
   }
   let _lastTime = null
   return function () {
      let _nowTime = + new Date()
      if (_nowTime - _lastTime > gapTime || !_lastTime) {
         // 将this和参数传给原函数
         fn.apply(this, arguments)
         _lastTime = _nowTime
      }
   }
}

// 授权地理位置---------------------------------
function getLocation(that) {
   // 再一次获取商家信息(根据地理位置)
   var pages = getCurrentPages() //获取加载的页面
   var currentPage = pages[pages.length - 1] //获取当前页面的对象
   var curl = currentPage.route //当前页面url
   wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
         wx.hideLoading()
         if (res.errMsg == "getLocation:ok") {
            console.log(res)
            that.saveLocation(res.longitude, res.latitude);
            console.log(wx.getStorageSync('location'))
            that.setData({
               "location.longitude": res.longitude,
               "location.latitude": res.latitude,
            })
            // 授权地理位置
            ajax({
               url: '/dict/city',
               success: function (cityres) {
                  let citydata = cityres.data;
                  if (citydata.code == 200) {
                     var city = {};
                     for (var v in citydata.result) {
                        city[citydata.result[v].code] = citydata.result[v].name
                     }
                     that.setData({
                        citys: city,
                        has_no_auth_address: false
                     })
                     wx.setStorageSync('citys', city)
                     console.log(curl)
                     if (curl == 'pages/home/home' || curl == 'pages/city/city' || curl == 'pages/recipients/index'){
                        // 切换当前位置
                        that.loadCity(res.latitude, res.longitude);
                     }
                     that.getdata()
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
         // 未授权地理位置
         // that.setData({
         //    has_no_auth_address: true
         // })
        
      }
   })

}


module.exports = {
   // formatTime: formatTime,
   getUrl: getUrl,
   // getDistance: getDistance,
   ajax: ajax,
   request: request,
   login: login,
   throttle: throttle,
   getLocation: getLocation
}
