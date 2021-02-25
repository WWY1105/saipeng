// pages/shareCard/cardDetail/cardDetail.js
const app = getApp();
var QRCode = require('../../../utils/weapp-qrcode.js')
var qrcode;
Page({

   /**
    * 页面的初始数据
    */
   data: {
      showLoading:true,
      hasMoreData:false,
      page: 1,
      // 分页数量
      count: 20, //每页5条数据
      id: '',
      cardDesc: {},
      card: {}
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      if (options.id) {
         this.setData({
            id: options.id
         })
      }
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

      this.getCard();
      this.getCardDesc();

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
      if (this.data.page < this.data.pageSize) {
         this.setData({
            page: this.data.page + 1,
            hasMoreData: true
         })
         this.getCardDesc(true);
      } else {
         // 没有数据了
         this.setData({
            hasMoreData: false
         })
     
      }
   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function () {

   },

   getCardDesc() {
      let that = this;
      let id = this.data.activityId;
     
      if (!this.data.hasMoreData) {
         that.setData({
            page: 1
         })
      }

      let json = {
         "count": this.data.count,
         "page": this.data.page
      }
      app.util.request(that, {
         url: app.util.getUrl('/benefits/cards/' + this.data.id + '/grows', json),
         method: 'GET',
         header: app.globalData.token
      }).then((res) => {
         wx.hideLoading()
         if (res.code == 200) {
           this.setData({showLoading:false})
            if (this.data.hasMoreData) {
               that.setData({
                  pageSize: res.result.pageSize,
                  cardDesc: that.data.cardDesc.concat(res.result.items),
               })
            } else {
               that.setData({
                  pageSize: res.result.pageSize,
                  cardDesc: res.result.items,
                  init: false
               })
            }

         }
      })
   },

   getCard() {
      let that = this;
      let id = this.data.activityId;

      app.util.request(that, {
         url: app.util.getUrl('/benefits/cards/' + this.data.id),
         method: 'GET',
         header: app.globalData.token
      }).then((res) => {
         console.log(res)
         if (res.code == 200) {
            wx.hideLoading();
            if (res.result.id) {
               qrcode = new QRCode('canvas', {
                  text: res.result.id,
                  width: 160,
                  height: 160,
                  colorDark: "#000",
                  colorLight: "white",
                  correctLevel: QRCode.CorrectLevel.H,
               });


            }
            that.setData({
               card: res.result
            })

         }
      })
   },
})