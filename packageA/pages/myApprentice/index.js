// pages/myApprentice/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectBtn:1,
    page:1,
    total: 0,
    pageSize: '',
    init:true
  },
  selectType(e) {
    if (e.currentTarget.dataset.num == this.data.selectBtn) {
      return
    }
    this.setData({
      selectBtn: e.currentTarget.dataset.num,
      page:1
    })
    if (this.data.selectBtn == 1) {
      this.getDisciple();
    }else{
      if (this.data.total != 0){
        this.getGrandson();
      }
      
    }

  },
  getDisciple(put) {
    var that = this
    var json = {
      page: 1,
      count: 5
    }
    if(put){
      that.setData({
        page: that.data.page+1
      })
      var json = {
        page: that.data.page,
        count: 5
      }
      if (that.data.page > that.data.pageSize) {
        wx.hideLoading();
        return false;
      }
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.util.getUrl('/spotter/disciple', json),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        var timer = setTimeout(function () {
          that.setData({
            init: false
          })
          wx.hideLoading();
          clearTimeout(timer)
        }, 500)
        
        let data = res.data;
        //console.log(data)
        if (data.code == 200) {
          if(put){
            that.setData({
              posts: that.data.posts.concat(data.result.items),
              total: data.result.total,
              pageSize: data.result.pageSize
            })            
          }else{
            that.setData({
              posts: data.result.items,
              total: data.result.total,
              pageSize: data.result.pageSize
            })
          }

        } else {
          // wx.showToast({
          //   title: data.message,
          //   duration: 2000
          // });
        }

      },
      fail: function (res) {
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
      }
    });
  },
  getGrandson(put) {
    var that = this
    var json = {
      page: 1,
      count: 5
    }
    if (put) {
      that.setData({
        page: that.data.page + 1
      })
      var json = {
        page: that.data.page,
        count: 5
      }
      if (that.data.page > that.data.pageSize) {
        return false;
      }
    }
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.util.getUrl('/spotter/grandson', json),
      method: 'GET',
      header: app.globalData.token,
      success: function (res) {
        let data = res.data;
        //console.log(data)
        wx.hideLoading();
        if (data.code == 200) {
          if (put) {
            that.setData({
              posts: that.data.posts.concat(data.result.items),
              total: data.result.total
            })
          } else {
            that.setData({
              posts: data.result.items,
              total: data.result.total
            })
          }

        } else {
          that.setData({
            posts: '',
            total: 0
          })
        }

      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDisciple();
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
    if (this.data.selectBtn == 1) {
      this.getDisciple(true);
    } else {
      this.getGrandson(true);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})