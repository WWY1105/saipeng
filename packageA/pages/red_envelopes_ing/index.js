// pages/my/my.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parentThis:'',
    list:[],
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
   // 继续发送
   toShopDetail(e) {
      console.log(e)
      wx.navigateTo({
         url: '/pages/shopDetail/index?id=' + e.currentTarget.dataset.shopid+"&containueFlag=true"
      })
   },
   // 获取我的红包数量
   getMyRed(put) {
      let that = this;
      if (!put) {
         that.setData({
            page: 1
         })
      }
      var json = {
         state: 1,
         page: that.data.page
      };
      // let state=0;//已结束
    
      var url = app.util.getUrl('/rebates', json)
      wx.request({
         url: url,
         method: 'GET',
         header: app.globalData.token,
         success: function (res) {
            let data = res.data;
            if (data.code == 200) {
               if (put) {
                  that.setData({
                     pageSize: data.result.pageSize,
                     list: that.data.list.concat(data.result.items),
                  })
               } else {
                  that.setData({
                     pageSize: data.result.pageSize,
                     list: data.result.items,

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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideLoading();
    this.setData({
      parentThis: this
    })
     // 获取我的红包
     this.getMyRed()
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
     console.log('到底不了')
     this.setData({
        isRefreshing: false
     })
     if (this.data.page < this.data.pageSize) {
        this.setData({
           page: this.data.page + 1
        })
        this.getMyRed(true);
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
  onShareAppMessage: function () {

  }
})