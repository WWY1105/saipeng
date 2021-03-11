// pages/shareCard/myCardDesc/myCardDesc.js
import tool from "../../../utils/util.js";
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        navbarData:{
            height:app.globalData.height,
            title:'',
            color:'#333333',
            backgroundColor:false
        },
        tagStyle: {
            span: 'height:auto;word-break:normal; width:auto;max-width:100%;white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;',
            p: 'height:auto;word-break:normal; width:auto;max-width:100%;white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;'
        },
        showLoading: true,
        purchase: '',
        orderId: false,
        id: false,
        data: {},
        showShopNum: 2,
        maxDiscount: 0,
        maxDiscount: 0,

        signModal:false,// 有待签收时候的弹框
       
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
        if (options.orderId) {
            this.setData({
                orderId: options.orderId
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
    onPageScroll: tool.debounce(function(res) {
        console.log(res[0].scrollTop)
        //结果： 延迟函数执行，不管触发多少次都只执行最后一次。
        if(res[0].scrollTop>this.data.navbarData.height){
            this.setData({'navbarData.backgroundColor':'#E1B78F'})
        }else{
            this.setData({'navbarData.backgroundColor':false})
        }
     },50),
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
   
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
       
        let discount = this.data.data.card.limit;
        let url = "/pages/shareCard/joinShare/joinShare?id=" + this.data.data.id + "&type=card";
        let title = '快领我的共享卡，和我共享全场' + discount + '折！'
        return {
            title: title,
            path: url,
            imageUrl: this.data.data.picUrl
        }
    },
    // 获取卡列表
    getCardDesc() {
        let that = this;
        let id = this.data.id;
        let orderId = this.data.orderId;
        let url = "";
        let json = {};
        url = '/shares/card'
        console.log(url)
        if (id) {
            json.cardId = id;
        } else if (orderId) {
            json.orderId = orderId;
        }

        app.util.request(that, {
            url: app.util.getUrl(url, json),
            method: 'GET',
            header: app.globalData.token
        }).then((res) => {
            this.setData({
                showLoading: false
            })
            if (res.code == 200) {
                wx.hideLoading()
                let maxDiscount = 0;
                if (res.result.card.orgAmount && res.result.card.limit) {
                    maxDiscount = res.result.card.orgAmount - res.result.card.limit;
                    maxDiscount = Math.round(maxDiscount * 100) / 100
                }

                // 设置标题
                if (res.result.card && res.result.card.name) {
                    wx.setNavigationBarTitle({
                        title: res.result.card.name,
                    })
                }
                // 有没有待签收
                let signModal=this.data.signModal;
                if(res.result.card.existSign){
                    signModal=true;
                }
                that.setData({
                    signModal,
                    maxDiscount,
                    data: res.result,
                    'navbarData.title': res.result.name
                })

            }
        })
    },
    // 查看卡详情
    seeCardDetail() {
        let url = '/pages/shareCard/cardDetail/cardDetail?id=' + this.data.data.id
        wx.navigateTo({
            url
        })
    },
    // 查看优惠券
    toCoupon() {
        let url = '/pages/shareCard/coupons/coupons?id=' + this.data.data.id
        wx.navigateTo({
            url
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
    // 签收列表
    toSignList(){
        let url='/pages/shareCard/signList/signList?id='+this.data.id;
        wx.navigateTo({
          url
        })
    },

    //   查看更多门店
    toMoreShop(){
        wx.navigateTo({
          url: "/pages/shareCard/shops/shops?id"+this.data.id,
        })
    }
})