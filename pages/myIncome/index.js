// pages/my/my.js
const app = getApp()
Page({

   /**
    * 页面的初始数据
    */
   data: {
      parentThis: '',
      user: {},
      incomeList:[],
      logo: '',
      name: '',
      profits:0,
      shopId:'',
      totalNum:0,
      //  -----------------------
      page: 1,
      pageSize: 0,
      // 分页数量
      count: 20, //每页5条数据
      hasMoreData: false,
      isRefreshing: true,
      isLoadingMoreData: false,
     //  -----------------------
   },


   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
      console.log(options)
      wx.hideLoading();
      this.setData({
        parentThis: this
      })
      let user = wx.getStorageSync('userInfo');
      this.setData({
         user
      })
      // if (options.shopName) {
      //    this.setData({ shopName: options.shopName })
      // }
      // if (options.logo) {
      //    this.setData({ logo: options.logo })
      // }
      if (options.shopId){
         this.setData({ shopId: options.shopId })
      }


      this.getMyIncone(options.shopId)
      this.getTotalNum(options.shopId)
   },
   // 继续发送
   toShopDetail(){
      wx.navigateTo({
         url: '/pages/shopDetail/index?id=' + this.data.shopId
      })
   },
   // 获取我的收益总数
   getTotalNum(shopId){
      let that = this;
      var url = app.util.getUrl('/profits/shop/' + shopId+'/summary')
      // wx.request({
      //    url: url,
      //    method: 'GET',
      //    header: app.globalData.token,
      //    success: function (res) {
      app.util.request(that, {
         url: url,
         method: 'GET',
         header: app.globalData.token
      }).then((res) => {
            let data = res;
            console.log('结果')
            console.log(res)
            if (data.code == 200) {
               that.setData({
                  logo: data.result.logo,
                  name: data.result.name,
                  profits: data.result.profits
               })
            } else if (data.code == 403000) {
               wx.removeStorageSync('token')
            } else {
               // wx.showToast({
               //    title: data.message,
               //    duration: 2000
               // });
            }
         
      })
   },
   //   获取我的收益
   getMyIncone(shopId,put) {
      let that = this;
      that.setData({
         shopId
      })
      if (!put) {
         that.setData({
            page: 1
         })
      }
      var json = {
         state: 1,
         page: that.data.page
      };
      var url = app.util.getUrl('/profits/shop/' + shopId, json)
      wx.request({
         url: url,
         method: 'GET',
         header: app.globalData.token,
         success: function (res) {
            let data = res.data;
            if (data.code == 200) {
               // that.setData({
               //    incomeList:data.result.items
               // })
               if (put) {
                  that.setData({
                     pageSize: data.result.pageSize,
                     incomeList: that.data.incomeList.concat(data.result.items),
                  })
               } else {
                  that.setData({
                     pageSize: data.result.pageSize,
                     incomeList: data.result.items,

                  })
               }
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
   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function() {

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function(options) {
      console.log(options)
      // 
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

   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function() {
      this.setData({
         isRefreshing: false
      })
      if (this.data.page < this.data.pageSize) {
         this.setData({
            page: this.data.page + 1
         })
         this.getMyIncone(this.data.shopId,true);
      } else {
         // 没有数据了
         this.setData({
            hasMoreData: false,
            isLoadingMoreData: false
         })
         return false;
      }
   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function() {

   }
})