// packageA/pages/orderDetail/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:'',
    type:''
  },
  getBoughtOrder(id){
    var that = this
    wx.request({
      url: app.util.getUrl('/coin/order/' + id +"/bought"),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        //console.log(res)
        if (res.data.code == 200) {
          that.setData({
            order: res.data.result
          })

        } else {
          
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
  getBoughtDisplace(id) {
    var that = this
    wx.request({
      url: app.util.getUrl('/coin/order/' + id + "/displace"),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        //console.log(res)
        if (res.data.code == 200) {
          that.setData({
            order: res.data.result
          })

        } else {
          
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type
    })
    if (options.type == 601){
      this.getBoughtOrder(options.id)
    } else if (options.type == 602){
      this.getBoughtDisplace(options.id)
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})