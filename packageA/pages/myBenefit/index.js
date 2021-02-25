// pages/myBenefit/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:'',
    searchLoadingComplete:false,
    searchLoading: false,
    page:1,
    parentThis: '',
    posts:'',
    shopId:''
  },
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    var that = this
    if (this.data.currentTab == cur) { return false; }
    else {
      this.setData({
        currentTab: cur,
        page: 1,
        posts: '',
        pageSize: ''
      })
      if (cur == 0) {
        var json = {
          page:1,
          count:20,
          state:4001
        }
        that.getBenefit(json)
      } else if (cur == 1) {
        var json = {
          page: 1,
          count: 20,
          state: 4002
        }
        that.getBenefit(json)
      } else {
        var json = {
          page: 1,
          count: 20,
          state: 4003
        }
        that.getBenefit(json)
      }

    }
  },


  getBenefit(json,put){
    var that = this;
    let url;
    if(this.data.shopId){
       url = app.util.getUrl('/benefits/coupons/shop/'+this.data.shopId, json)
    }else{
       url = app.util.getUrl('/benefits/coupons', json)
    }
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    app.util.request(that, {
      url: url,
      method: 'GET',
      header: app.globalData.token
    }).then((res)=>{

      wx.hideLoading();

      if(res.code == 200){
        if(put){
         var index = that.data.posts.length*1 - 1
          //console.log(that.data.posts.length)
          //console.log(res.result.items[0])
          if (that.data.posts[index].guestId == res.result.items[0].guestId){
           var coupons = that.data.posts[index].coupons.concat(res.result.items[0].coupons)
            that.data.posts[index].coupons = coupons
            res.result.items.splice(0,1)
          }
          //console.log(that.data.posts[index].coupons)
          that.setData({
            posts: that.data.posts.concat(res.result.items),
            pageSize: res.result.pageSize
          })
        }else{
          that.setData({
            posts: res.result.items,
            pageSize: res.result.pageSize
          })
        }
      }else{
        that.setData({
          posts: '',
          pageSize: ''
        })
      }
      }).catch(()=>{
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '网络超时',
          showCancel: false,
          confirmText: '重试',
          success(res) {
            if (res.confirm) {
              that.onLoad()
            }
          }
        })
      })
  },

  toCouponDetail: app.util.throttle(function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/coupon/index?id=" + id
    })
  }),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.setData({
      parentThis: this
    })
     var json = {
        page: 1,
        count: 20,
        state: 4001
     }
     if (options.shopId){
        this.setData({
           shopId: options.shopId
        })
     }
  

    that.getBenefit(json)
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
    var that = this
    this.setData({
      page: 1
    })
    if (this.data.currentTab == 0) {
      var json = {
        page: 1,
        count: 20,
        state: 4001
      }
      that.getBenefit(json)
    } else if (this.data.currentTab == 1) {
      var json = {
        page: 1,
        count: 20,
        state: 4002
      }
      that.getBenefit(json)
    } else {
      var json = {
        page: 1,
        count: 20,
        state: 4003
      }
      that.getBenefit(json)
    }
    var timer = setTimeout(function () {
      wx.stopPullDownRefresh();
      clearTimeout(timer)
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    this.setData({
      page: this.data.page+1
    })
    //console.log(this.data.page + "," + this.data.pageSize)
    if (this.data.page>this.data.pageSize){
      return false;
    }
    if (this.data.currentTab == 0) {
      var json = {
        page: that.data.page,
        count: 20,
        state: 4001
      }
      that.getBenefit(json,true)
    } else if (this.data.currentTab == 1) {
      var json = {
        page: that.data.page,
        count: 20,
        state: 4002
      }
      that.getBenefit(json, true)
    } else {
      var json = {
        page: that.data.page,
        count: 20,
        state: 4003
      }
      that.getBenefit(json, true)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})