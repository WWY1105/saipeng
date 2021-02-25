// packageA/pages/goldDetail/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goldNum:''
  },
  getGoldDetail(put) {
    var that = this
    wx.request({
      url: app.util.getUrl('/coin/record'),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        //console.log(res)
        if (res.data.code == 200) {
          if(put){
            that.setData({
              goldRecord: that.data.goldRecord.concat(res.data.result)
            })
          }else{
            that.setData({
              goldRecord: res.data.result.items
            })
          }
          
        }else{
          that.setData({
            goldRecord: ''
          })
        }
      },
      fail(res) {
        //console.log(res)
        wx.showToast({
          title: data.message,
          duration: 2000
        })
      }
    })
  },
  toShop: app.util.throttle(function () {
    wx.switchTab({
      url: '/pages/shop/index'
    })
  }),
  getGoldNum() {
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.util.getUrl('/coin'),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        wx.hideLoading();
        //console.log(res)
        if (res.data.code == 200) {
          that.setData({
            goldNum: res.data.result
          })
          wx.setStorageSync('goldNum', res.data.result)
        }
      }
    })
  },
  toOrderDetail: app.util.throttle(function (e) {
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/packageA/pages/orderDetail/index?id=' + id + "&type=" + type
    })
  }),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getStorageSync('goldNum')) {
      this.setData({
        goldNum: wx.getStorageSync('goldNum')
      })
    } else if (wx.getStorageSync('token')){
      this.getGoldNum();
    }
    this.getGoldDetail();
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
    this.setData({
      page: this.data.page + 1
    })
    if (this.data.page > this.data.pageSize) {
      return false;
    }
    this.getGoldDetail(true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})