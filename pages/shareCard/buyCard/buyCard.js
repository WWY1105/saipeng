// pages/buyCard/buyCard.js
import tool from "../../../utils/util.js";
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        navbarData: {
            height: app.globalData.height,
            title: '',
            color: '#333333',
            backgroundColor: false
        },

        tagStyle: {
            '._ul-bef':'display:none',
            span: 'height:auto;word-break:normal; width:auto;max-width:100%;white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;',
            p: 'height:auto;word-break:normal; width:auto;max-width:100%;white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;',
        },
        showLoading: true,
        selfCouponCount: 0,
        showShopNum: 2,
        orderId: '',
        showPhonePop: false,
        activityId: '',
        promoteId: '',
        shopId: '',
        data: false,
        parentThis: '',
        buySuccessModal: false, //购买成功弹框
        purchase: '',
        hasToken: false,
        maxDiscount: 0,
        acceptArr: [], //用户订阅消息
        type: 'self',// 券类型
        couponList: [],
        down1: 0,
        down2: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            parentThis: this
        })
        if (options.activityId) {
            this.setData({
                activityId: options.activityId
            })
        }
        if (options.promoteId) {
            this.setData({
                promoteId: options.promoteId
            })
        }
        if (options.shopId) {
            this.setData({
                shopId: options.shopId
            })
        }

    },
    onPageScroll: tool.debounce(function (res) {
        console.log(res[0].scrollTop)
        //结果： 延迟函数执行，不管触发多少次都只执行最后一次。
        if (res[0].scrollTop > this.data.navbarData.height) {
            this.setData({ 'navbarData.backgroundColor': '#E1B78F' })
        } else {
            this.setData({ 'navbarData.backgroundColor': false })
        }
    }, 50),

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let hasToken = this.data.hasToken;
        app.checkLogin().then(() => {
            hasToken = true;
            this.setData({
                hasToken
            }, () => {
                this.getActivity()
            })
        }, () => {
            hasToken = false;
            this.setData({
                hasToken
            }, () => {
                this.getActivity()
            })
        })


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

    },
    //   查看更多门店
    toMoreShop() {
        wx.navigateTo({
            url: "/pages/shareCard/shops/shops?id=" + this.data.card.id,
        })
    },
    // 获取活动详情
    getActivity() {
        let that = this;
        let url = '/cards/activity/' + this.data.activityId;

        app.util.request(that, {
            url: app.util.getUrl(url, {}),
            method: 'GET',
            header: app.globalData.token
        }, false).then((res) => {
            this.setData({
                showLoading: false
            })
            if (res.code == 200) {

                let maxDiscount = 0;
                if (res.result.card.orgAmount && res.result.card.limit) {
                    maxDiscount = res.result.card.orgAmount - res.result.card.limit;
                    maxDiscount = Math.round(maxDiscount * 100) / 100
                }

                // 计算自用优惠券
                let selfCouponCount = 0;
                if (res.result && res.result.benefits) {
                    res.result.benefits.map(i => {
                        selfCouponCount += i.count
                    })
                }

                // 设置标题
                if (res.result.card && res.result.card.name) {
                    wx.setNavigationBarTitle({
                        title: res.result.card.name,
                    })
                }
                let down1 = res.result.card.grows[0].value;
                let down2 = res.result.card.grows[1].value;
                that.setData({
                    selfCouponCount,
                    maxDiscount,
                    data: res.result,
                    'navbarData.title': res.result.name,
                    couponList: res.result.benefits,
                    down1,
                    down2
                })
            }
        })
    },
    againRequest() {
        this.setData({
            hasToken: true
        }, () => {
            this.toBuy()
        })

    },
    // 打电话
    makePhoneCall(e) {
        let phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone,
            success: function () {
                console.log('拨打成功')
            },
            fail: function () {
                console.log('拨打失败')
            }
        })
    },
    cancelPay(orderId) {
        let that = this;
        let url = '/pay/revoke/order/' + orderId;
        let data = {};
        app.util.request(that, {
            url: app.util.getUrl(url),
            method: 'POST',
            header: app.globalData.token,
            data: data
        }).then((res) => {
            if (res.code == 200) {
                that.setData({
                    buySuccessModal: false
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: "none",
                    duration: 2000
                })
            }
        })
    },
    //  订阅消息
    toSubscribe() {
        let that = this;
        let templateIds = that.data.data.templateIds || false;
        let acceptArr = []
        return new Promise((resolve, reject) => {
            if (that.data.data.templateIds) {
                wx.requestSubscribeMessage({
                    tmplIds: templateIds,
                    success: (res) => {

                        if (res.errMsg == 'requestSubscribeMessage:ok') {
                            for (let i in res) {
                                if (i != 'errMsg' && res[i] == 'accept') {
                                    acceptArr.push(i)
                                }
                            }
                        }
                        this.setData({
                            acceptArr
                        })
                    },
                    complete: () => {
                        resolve(acceptArr)
                    }
                })
            }
        })
    },
    // 去购买
    toBuy() {
        let url = "/cards";
        let that = this;

        wx.showLoading({
            title: '支付中',
            mask: true
        })
        if (!this.data.hasToken) {
            var pop;
            if (that.selectComponent("#authpop")) {
                pop = that.selectComponent("#authpop");
                wx.hideLoading();
                pop.showpop()
            }
            return;
        }
        // 如果有订阅消息
        this.toSubscribe().then(res => {
            let json = {
                id: this.data.shopId,
                goodsId: this.data.data.id, // 活动id
                count: 1,
                templateIds: res
            };
            if (this.data.promoteId) {
                json.promoteId = this.data.promoteId
            }
            app.util.request(that, {
                url: app.util.getUrl(url),
                method: 'POST',
                header: app.globalData.token,
                data: json
            }).then((res) => {
                wx.hideLoading();
                if (res.code == 200) {
                    // _wxPay
                    if (res.result.orderId) {
                        this.setData({
                            orderId: res.result.orderId
                        })
                    }
                    if (res.result) {
                        app._wxPay(res.result, function (data) {
                            // that.setData({
                            //     buySuccessModal: true
                            // })
                            // 支付成功
                            wx.navigateTo({
                                url: '/pages/shareCard/buySuccess/buySuccess?orderId=' + res.result.orderId,
                            })
                        }, () => {
                            console.log('支付失败')
                            that.cancelPay(res.result.orderId)
                        })
                    } else {
                        that.setData({
                            buySuccessModal: true
                        })
                    }
                } else if (res.code == 403060) {
                    that.setData({
                        showPhonePop: true
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: "none",
                        duration: 2000
                    })
                }
            })

        })
    },
    // 查询支付结果

    // 拒绝手机号
    closePhonePop() {
        this.setData({
            showPhonePop: false
        })
    },
    // 获取电话号
    getPhoneNumber(e) {
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        //console.log(e)
        var _self = this
        if (e.detail.errMsg == 'getPhoneNumber:fail user deny' || e.detail.errMsg == 'getPhoneNumber:user deny' || e.detail.errMsg == 'getPhoneNumber:fail:user deny') {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '未授权',
                success: function (res) {

                }
            })
            wx.hideLoading();
        } else {
            wx.request({
                url: app.util.getUrl('/phone/bind'),
                method: 'POST',
                data: {
                    "iv": e.detail.iv,
                    "encryptedData": e.detail.encryptedData,
                },
                header: app.globalData.token,
                success: function (res) {
                    wx.hideLoading();
                    let data = res.data;
                    if (data.code == 200) {
                        if (data.result) {
                            wx.setStorageSync('token', data.result.token);
                            app.globalData.token.token = data.result.token
                        }
                        _self.setData({
                            showPhonePop: false
                        }, () => {
                            _self.toBuy()
                        })
                        wx.showToast({
                            title: "授权成功",
                            duration: 2000
                        });
                    } else {
                        wx.showToast({
                            title: data.message,
                            icon: 'none',
                            duration: 2000
                        });
                    }
                }
            });
        }
    },

    // 关闭弹窗
    closeSuccess() {
        this.setData({
            buySuccessModal: false
        }, () => {
            wx.redirectTo({
                url: '/pages/shareCard/myCardDesc/myCardDesc?orderId=' + this.data.orderId,
            })
        })
    },
    // 查看所有门店
    showAllShop() {
        let length = this.data.data.shops.length;
        let showShopNum = this.data.showShopNum;
        if (showShopNum == 2) {
            showShopNum = length
        } else {
            showShopNum = 2
        }
        this.setData({
            showShopNum
        })
    },
    changeCouponTab(e) {
        this.setData({ couponList: [] }, () => {


            let { type } = this.data;
            console.log('当前' + type)
            const { participants, benefits } = this.data.data;

            let couponList = type == 'self' ? participants : benefits;
            console.log(couponList)
            type = type == 'self' ? 'friend' : 'self';
            console.log('后来' + type)
            this.setData({ type, couponList })
        })
    }
})