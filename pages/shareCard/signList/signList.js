// pages/shareCard/signList/signList.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    showLoading: true,
    signList: [],
    signFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id || ''
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
    if (this.data.signFlag) {
      this.postSign().then(() => {
        this.getList();
      })
    } else {
      this.getList();
    }
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

    let discount = this.data.signList.toSign;
    let url = "/pages/shareCard/joinShare/joinShare?id=" + this.data.id + "&type=card";
    let title = '快领我的共享卡，和我共享全场' + discount + '折！'
    return {
      title: title,
      path: url,
      imageUrl: this.data.signList.picUrl
    }
  },

  // 获取记录
  getList() {
    const that = this;
    const url = '/shares/' + this.data.id + '/grows';
    app.util.request(that, {
      url: app.util.getUrl(url),
      method: 'GET',
      header: app.globalData.token
    }).then((res) => {
      this.setData({
        showLoading: false
      })
      if (res.code == 200) {
        that.setData({
          signList: res.result
        })
      }
    })
  },
  toSign(e) {
    const {
      id
    } = e.currentTarget.dataset;
    this.setData({
      signFlag: true,
      signId: id
    })
  },
  // 点击去领取
  postSign() {
    const that=this;
    return new Promise((resolve, reject) => {
      const url = '/shares/' + this.data.id + '/grows';
      app.util.request(that, {
        url: app.util.getUrl(url),
        method: 'POST',
        data:{id:that.data.signId},
        header: app.globalData.token
      }).then((res) => {
        if (res.code == 200) {
          wx.showToast({
            title: '签收成功',
          })
          that.setData({
            signFlag: false,
            signId: false
          })
        }
      })
      resolve();
    })
  }
})