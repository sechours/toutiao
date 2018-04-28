<template>
  <div>
    <vue-progress-bar></vue-progress-bar>
    <!-- 全局header -->
    <nv-head ref="head" :show-head="false" :fix-head="false" page-name="阅读收益">
    </nv-head>
    <nv-loading :loading="loading"></nv-loading>
    <div v-show="!loading" class="readProgress">
        <div class="description">
            <ul>
                <li class="table"> <div class="cicle table-cell"></div> <div class="table-cell t-l">阅读资讯30秒，即可获得最高50金币奖励</div></li>
                <li class="table"><div class="cicle table-cell"></div><div class="table-cell t-l">分享收徒，首次收徒奖励1元，徒弟每日可进贡1000金币，徒弟越多进贡越多</div></li>
                <li class="table"><div class="cicle table-cell"></div><div class="table-cell t-l">额外奖励<span class="clock" v-if="extratime>0">{{extratime | timeformat(1)}}</span><span class="complete" v-else>&nbsp;</span><br>当天阅读资讯满1小时，额外奖励500金币</div></li>
            </ul>
        </div>
        <div class="today">
            <div class="title">
                <i class="ico today"></i>
                今日数据
            </div>
            <div class="desc">
                阅读时长：<span class="time">{{today.time | timeformat}}</span>，获得 <span class="gold">{{today.coin}}金币</span>
            </div>
        </div>
        <div class="yestoday">
            <div class="title">
                <i class="ico yestoday"></i>
                昨日数据
            </div>
            <div class="desc">
                阅读时长：<span class="time">{{yestoday.time | timeformat}}</span>，获得 <span class="gold">{{yestoday.coin}}金币</span>
            </div>
        </div>
        <div class="bottom">
            <ul class="clear">
                <li class="left" @click="navigator('任务中心','/activities/taskcenter.html')"><i class="ico gold"></i>赚取更多金币</li>
                <li class="left" @click="navigator('邀请收徒','/main/user.html#/invitepupil')"><i class="ico redbag"></i>邀请收徒，拿红包</li>
            </ul>
        </div>
    </div>
  </div>
</template>
<script>
import nvHead from "@/components/header.vue";
import nvLoading from "@/components/loading.vue";
import ajax from "@/assets/js/ajax";
import appcall from "@/assets/js/appcall";
export default {
  name: "readProgress",
  data() {
    return {
      loading: true,
      extratime: 3600,
      type:1,
      today: {
        time: 0,
        coin: 0
      },
      yestoday: {
        time: 0,
        coin: 0
      }
    };
  },
  components: {
    nvHead,
    nvLoading
  },
  created() {
    this.$Progress.start();
    this.type = this.$utils.getUrlQuery('type')?this.$utils.getUrlQuery('type'):1;
    this.getdetail();
  },
  mounted() {},
  methods: {
    /**
     * 获取详细信息
     */
    async getdetail() {
      let params = {};
      let comm = await appcall.getRequestData(params);

      let rs = await ajax(
        "post",
        this.$apiurl + "/user_read/user_read_detail",
        comm,
        params
      );
      this.$Progress.finish();
      if (rs && rs.code === 1001 && rs.data) {
        this.loading = false;
        let data = rs.data;
        this.extratime = data.count_down;
        this.today.time = this.type==1?data.today_read_time:data.today_video_time;
        this.today.coin = this.type==1?data.today_read_coin:data.today_video_coin;
        this.yestoday.time = this.type==1?data.yesterday_read_time:data.yesterday_view_time;
        this.yestoday.coin = this.type==1?data.yesterday_read_coin:data.yesterday_view_coin;
      } else if (rs && (rs.code === 1004 || rs.code === 1005)) {
        this.$alert(rs.msg).then(rs => {
          appcall.login();
        });
      } else {
        this.$alert(rs.msg);
      }
    },
    /**
     * 跳转页面
     */
    navigator(title, url) {
      appcall.navigator({
        title: title,
        url: this.$h5url + url
      });
      //location.href = this.$h5url + url;
    }
  },
  filters: {
    timeformat(value, type) {
      let h = Math.floor((value / 3600) % 24);
      let m = Math.floor((value / 60) % 60);
      let s = value - h * 3600 - m * 60;
      if (type) {
        return (
          (h < 10 ? "0" + h : h) +
          ":" +
          (m < 10 ? "0" + m : m) +
          ":" +
          (s < 10 ? "0" + s : s)
        );
      } else {
        if (h > 0) {
          return h + "小时" + m + "分钟" + s + "秒";
        } else {
          if (m > 0) {
            return m + "分钟" + s + "秒";
          } else {
            return s + "秒";
          }
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import "../../../assets/css/colors";
.readProgress {
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  padding: 0.3rem;
  .description {
    background: #ebe7d9;
    padding: 0.3rem;
    font-size: 0.28rem;
    .t-l {
      text-align: left;
      line-height: 0.48rem;
      padding-left: 0.15rem;
    }
    ul li {
      margin: 0 auto 0.2rem;
      .cicle {
        vertical-align: 50%;
      }
      .cicle:before {
        content: "";
        width: 8px;
        height: 8px;
        background: #d0ab8f;
        border-radius: 8px;
        display: inline-block;
        margin-top:6px;
      }
      span.clock {
        background: url(../../../assets/images/readprogress/ico_clock.png)
          no-repeat left center;
        background-size: 0.36rem 0.36rem;
        display: inline-block;
        margin-left: 0.1rem;
        text-indent: 0.45rem;
        color: #fa2927;
      }
      span.complete {
        width: 0.76rem;
        line-height: 0.45rem;
        background: url(../../../assets/images/readprogress/ico_complete.png)
          no-repeat center center;
        background-size: 0.76rem 0.42rem;
        display: inline-block;
        margin-left: 0.1rem;
      }
    }
    ul li:last-child {
      margin-bottom: 0;
    }
  }
  .today {
    margin-top: 0.3rem;
    .title {
      height: 0.84rem;
      line-height: 0.84rem;
      color: #fff;
      font-size: 0.32rem;
      background: #fb2926;
      position: relative;
      text-indent: 0.8rem;
      .ico.today {
        width: 0.34rem;
        height: 0.34rem;
        background: url(../../../assets/images/readprogress/ico_today.png)
          no-repeat center center;
        background-size: 100%;
        position: absolute;
        margin: auto;
        top: 0.25rem;
        left: 0.3rem;
      }
    }
    .desc {
      background: #fff;
      padding: 0.44rem 0.3rem;
      font-size: 0.28rem;
      span.time {
        color: #0d59a7;
      }
      span.gold {
        color: #0d59a7;
      }
    }
  }
  .yestoday {
    margin-top: 0.3rem;
    .title {
      height: 0.84rem;
      line-height: 0.84rem;
      color: #fff;
      font-size: 0.32rem;
      background: #fb2926;
      position: relative;
      text-indent: 0.8rem;
      .ico.yestoday {
        width: 0.38rem;
        height: 0.42rem;
        background: url(../../../assets/images/readprogress/ico_yestoday.png)
          no-repeat center center;
        background-size: 100%;
        position: absolute;
        margin: auto;
        top: 0.16rem;
        left: 0.3rem;
      }
    }
    .desc {
      background: #fff;
      padding: 0.44rem 0.3rem;
      font-size: 0.28rem;
      span.time {
        color: #0d59a7;
      }
      span.gold {
        color: #0d59a7;
      }
    }
  }
  .bottom {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    background: #fff;
    border-top: 1px solid #e9e9e6;
    ul li {
      width: 50%;
      line-height: 1rem;
      font-size: 0.32rem;
      text-indent: 0.9rem;
      position: relative;
      .ico.gold {
        width: 0.48rem;
        height: 0.48rem;
        background: url(../../../assets/images/readprogress/bottom_gold.png)
          no-repeat center center;
        background-size: 100%;
        position: absolute;
        margin: auto;
        top: 0.26rem;
        left: 0.6rem;
      }
      .ico.redbag {
        width: 0.46rem;
        height: 0.48rem;
        background: url(../../../assets/images/readprogress/bottom_redbag.png)
          no-repeat center center;
        background-size: 100%;
        position: absolute;
        margin: auto;
        top: 0.26rem;
        left: 0.3rem;
      }
    }
    ul li:first-child {
      text-indent: 1.2rem;
    }
    ul li:last-child:before {
      content: "";
      width: 1px;
      height: 0.6rem;
      position: absolute;
      left: 0;
      top: 0.2rem;
      background: #e9e9e6;
    }
  }
}
</style>