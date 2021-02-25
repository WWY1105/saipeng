// pages/my/my.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parentThis:'',
    recordList:[],
    total:0,
   //  -----------------------
     page: 1,
     pageSize:0,
     // 分页数量
     count: 20, //每页5条数据
     hasMoreData: false,
     isRefreshing: true,
     isLoadingMoreData: false,
     //  -----------------------
  },
   // 查看在本店的收益
   toMyIncome(e) {
       let data=e.currentTarget.dataset;
      console.log(e)
      wx.navigateTo({
         url: '/pages/myIncome/index?shopId=' + data.id 
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
     console.log(options)
     if (options.total){
        this.setData({ total: options.total})
     }
     
   //  获取我的收益记录
   this.getRecordList()
  },
   getRecordList:function(put){
      let that=this;
      if (!put) {
         that.setData({
            page: 1
         })
      }
      let json = {
         "count": this.data.count,
         "page": this.data.page
      }
      app.util.request(that, {
         url: app.util.getUrl('/profits/shop',json),
         method: 'GET',
         header: app.globalData.token
      }).then((res) => {
         console.log(res)
         if (res.code == 200) {
            wx.hideLoading()
            if (put) {
               that.setData({
                  pageSize: res.result.pageSize,
                  recordList: that.data.recordList.concat(res.result.items),
               })
            } else {
               that.setData({
                  pageSize: res.result.pageSize,
                  recordList: res.result.items,
                  
               })
            }
         } else if (res.code =='404000'){
            // 没有数据
            that.setData({
               recordList: []
            })
         }
      })
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
        isRefreshing:false
     })
     if (this.data.page < this.data.pageSize) {
        this.setData({
           page: this.data.page + 1
        })
        this.getRecordList(true);
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