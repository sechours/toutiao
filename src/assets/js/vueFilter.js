/*
 * vuejs 	过滤器
 */

import Vue from 'vue';
import accounting from 'accounting';

/**
  * 格式化数字，相当于vue1.0时的currency过滤器
  * @param value 		传进来的数字
  * @param symbol	 	货币称号，默认为人民币
  * @param dat	 		保留的小数点位数，默认为2位
  * @param return 
*/
Vue.filter('currency', function (value,symbol='¥',dat=2) {
  return accounting.formatMoney(value,symbol,dat);
})

/**
  * 格式化value 保留n位小数
*/
Vue.filter('decimal', function (value,num=2) {
  return Number(value).toFixed(num);
})