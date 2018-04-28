import Vue from 'vue'
import Lib from "@/assets/js/Lib";
import VueRouter from 'vue-router'
import routes from '@/router/home.js'
import '@/statistics/baidu.js' // 百度统计

Vue.use(VueRouter)

const router = new VueRouter({
  routes: routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + " - 超级头条";
  }
  /**
   * 百度统计设置
   * [资讯详情，视频详情，新手课堂]
   */
  let bdpages = ['articleDetail', 'articleDetailClear', 'videoDetail', 'videoDetailClear', 'faq'];
  if (bdpages.includes(to.name)) {
    bdTongji.apply(to.path);
  }
  next();
})


new Vue({
  router: router
}).$mount('#app')