const app = getApp()
Component({
  properties: {
    navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {}
    },
  },
  data: {
   
    currentPage:'',
    height: app.globalData.height,
    //默认值  默认显示左上角
    navbarData: {
    }
  },

  methods: {
  // 返回上一页面
    _navback() {
      wx.navigateBack()
    },
  //返回到首页
    _backhome() {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  lifetimes:{
    attached(){
      if(this.properties.background){
        this.setData({background:this.properties.background})
      }
      this.setData({
        currentPage: getCurrentPages().length 
      })
     console.log(getCurrentPages().length)
    },
    detached(){},
    ready: function () {
     
    } 
  },
   
  
}) 