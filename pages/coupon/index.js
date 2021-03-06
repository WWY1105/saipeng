// pages/coupon/coupon.js


//index.js
//获取应用实例
const app = getApp();
var QRCode = require('../../utils/weapp-qrcode.js')
var qrcode;
let id = "";
let shop=false;
let url;

Page({
  data: {
    data: '',
    code: '',
    isShow: ''
  },
  onLoad: function (options) {
    //页面加载时触发。一个页面只会调用一次，可以在 onLoad 的参数中获取打开当前页面路径中的参数。
    id = options.id; //  券id

     console.log(options)
     if (options.shop) {
       //   从商家详情过来
        url = '/coupons/' + id
     } else {
        url = '/benefits/coupons/' + id
     }
  },
  onShow: function () {
    let _self = this;
    
   this.getCouponDetail()
    

  },

  getCouponDetail(){
    
     let _self=this;
    
     app.util.ajax({
        url: url,
        success: function (res) {
           let data = res.data;
           if (data.code == 200) {
              _self.setData({
                 data: data.result,
              })
              if (data.result.code) {
                 qrcode = new QRCode('canvas', {
                    text: data.result.code,
                    width: 150,
                    height: 150,
                    colorDark: "#000",
                    colorLight: "white",
                    correctLevel: QRCode.CorrectLevel.H,
                 });

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
  },
  tapHandler: function () {
    // 传入字符串生成qrcode
    this.setData({
      isShow: true
    })
  },
  closebtn: function () {
    this.setData({
      isShow: false
    })
  }

})
