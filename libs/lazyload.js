export default class LazyLoad {
   constructor(context, opt = {}) {
      this.page = context;

      this.classNote = opt.classNote || 'item-';
      this.initNum = opt.initNum || 5;
      this.limit = opt.limit || 5;
      console.log('opt.initNum' + opt.initNum)
      this.intersectionObserver = {};

      this.page.setData({
         __LAZT_LOAD_COUNT: this.initNum
      })
      console.log('__LAZT_LOAD_COUNT' + opt.initNum)
      console.log('this.limit ' + this.limit )
      if (!this.isSupport()) console.error('wx.createIntersectionObserver is not a function')

   }

   observe() {
      console.log('执行啊啊啊啊')
      if (!this.isSupport()) return;
      const that = this;
      this.intersectionObserver = wx.createIntersectionObserver();

      this.intersectionObserver.relativeToViewport({
         bottom: 100
      }).observe(this.classNote + this.page.data.__LAZT_LOAD_COUNT, (res) => {
         if (res.boundingClientRect.top > 0) {
            that.intersectionObserver.disconnect()
            let num = that.page.data.__LAZT_LOAD_COUNT + that.limit
            that.page.setData({
               __LAZT_LOAD_COUNT: num
            })
            console.log('hahaha '+that.limit)
            console.log(that.page.data.__LAZT_LOAD_COUNT)
            that.observe();
         }
      })
   }

   isSupport() {
      return !!wx.createIntersectionObserver
   }
}