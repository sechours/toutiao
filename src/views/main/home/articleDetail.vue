<template>
  <!-- <iscroll-view ref="scrollView" class="scroll-view" @scrollStart="log"> -->
  <div>
    <!-- 全局header -->
    <nv-head ref="head" :show-head="false" :fix-head="false" :page-name="$route.meta.title">
    </nv-head>
    <nv-loading :loading="loading"></nv-loading>
    <div class="articleDetail" v-show="!loading">
      <div class="content">
        <h1>{{detail.title}}</h1>
        <div class="nav" v-show="detail.region">
          <div class="region clear">
            <div class="face left" @click="jumpHomepage">
              <img :src="detail.headimg">
            </div>
            <div class="desc left">
              <p class="name" @click="jumpHomepage">{{detail.region}}</p>
              <p class="time">{{detail.push_date}}</p>
            </div>
            <div class="focus right">
              <button @click="doAttention" :class="{active:isAttention}" v-show="showAttention">{{isAttention?'主页':'关注'}}</button>
            </div>
          </div>
        </div>
        <div class="all_content"  ref="contentHeight" >
          <!-- <v-pviewer :complete="complete" selector="img"> -->
          <div class="article_content" v-html="detail.content"></div>
          <!-- </v-pviewer> -->
          <div class="share" v-show="showShare">
            <div class="tips">
              <span class="red">分享赢好礼</span>
            </div>
            <div class="shareBox clear">
              <div class="share_item pyq left">
                <div class="img" @click="pyqshare">
                  <img src="../../../assets/images/pyq.png">
                </div>
                <div>朋友圈</div>
              </div>
              <div class="share_item weixin left">
                <div class="img" @click="wxshare">
                  <img src="../../../assets/images/wx.png">
                </div>
                <div>微信好友 / 群</div>
              </div>
            </div>
          </div>
        </div>
        <div class="load_all" v-show="!loadall">
          <a @click="showall">展开阅读全文
            <i class="zhankai"></i>
          </a>
          <em></em>
        </div>
      </div>
      <!-- <div class="spacer"></div> -->
      <div class="others infors">
        <div class="title">
          <span>相关资讯</span>
        </div>
        <div class="con" >
          <ul>
            <li v-for="(item,$index) in relates" :key="$index">
              <a @click="openother(item)" v-if="item.pit_type==1">
                <div class="pic">
                  <img  v-lazy="item.piturl" width="100%">
                </div>
                <div class="name">
                  {{item.title}}
                  <p>
                    <span>{{item.region}}</span><span class="hits">{{item.hits}}观看</span>
                  </p>
                </div>
              </a>
              <a @click="openother(item)" v-if="item.pit_type==2 && item.piturl_list.length > 2">
                <div class="threeName">{{item.title}}</div>
                <div class="threePic clear">
                  <div class="imgBox left">
                    <img v-lazy="item.piturl_list[0]">
                  </div>
                  <div class="imgBox left">
                    <img v-lazy="item.piturl_list[1]">
                  </div>
                  <div class="imgBox left">
                    <img v-lazy="item.piturl_list[2]">
                  </div>
                </div>
                <p class="threeP">
                  <span>{{item.region}}</span><span class="hits">{{item.hits}}观看</span>
                </p>
              </a>
            </li>
          </ul>
          <div class="j_loading" ref="j_loading" v-show="j_loading">
            <div class="spinner">
              <div class="bounce1"></div>
              <div class="bounce2"></div>
              <div class="bounce3"></div>
            </div>
            <p class="txt">数据加载中</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- </iscroll-view> -->
</template>
<script>
import nvHead from "@/components/header.vue";
import nvLoading from "@/components/loading.vue";
import ajax from "@/assets/js/ajax";
import appcall from "@/assets/js/appcall";
// import VPviewer from "vue-photo-viewer";
// import "vue-photo-viewer/dist/pviewer.css";

export default {
  name: "articleDetail",
  data() {
    return {
      loading: true,
      popshow: false,
      loadall: true,
      detail: {},
      relates: [],
      id: 0,
      region_id: 0,
      isAttention: false,
      showAttention: true,
      showShare: false,
      complete: false,
      j_loading: false,
      pager: 1,
      isempty: false
    };
  },
  components: {
    nvHead,
    nvLoading,
    // VPviewer
  },
  created() {
    this.$Progress.start();
  },
  computed: {},
  mounted() {
    this.id = this.$route.params.id;
    this.getdetail();
    this.setFontsize();
    // 设置字体大小调用
    window.afterSetSize = function(sizeType) {
      this.setFontsize(sizeType);
    }.bind(this);

    // 设置关注状态
    window.afterAttention = function(type) {
      if (!!type) {
        this.isAttention = true;
      } else {
        this.isAttention = false;
      }
    }.bind(this);

    window.addEventListener("scroll", this.scrollBottom);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.scrollBottom);
  },
  methods: {
    getClientHeight() {
      return document.body.clientHeight && document.documentElement.clientHeight
        ? document.body.clientHeight < document.documentElement.clientHeight
          ? document.body.clientHeight
          : document.documentElement.clientHeight
        : document.body.clientHeight > document.documentElement.clientHeight
          ? document.body.clientHeight
          : document.documentElement.clientHeight;
    },
    async scrollBottom() {
      var scrollHeight = Math.max(
        document.body && document.body.scrollHeight,
        document.documentElement && document.documentElement.scrollHeight
      );
      var window_height =
        this.getClientHeight() +
        Math.max(
          window.pageYOffset,
          document.documentElement && document.documentElement.scrollTop,
          document.body && document.body.scrollTop
        );
      if (
        window_height > scrollHeight - 100 &&
        !this.j_loading &&
        this.pager < 20 &&
        !this.isempty
      ) {
        if (this.j_loading) return false;
        this.j_loading = true;
        await this.getrelates();
        this.j_loading = false;
        this.pager++;
      }
    },
    /**
     * 获取资讯详情
     */
    async getdetail() {
      let params = {
        id: this.id
      };
      let comm = await appcall.getAppData();
      let rs = await ajax(
        "post",
        this.$apiurl + "/article/get_detail",
        comm,
        params
      );
      this.$Progress.finish();
      if (rs && rs.code === 1001 && rs.data) {
        this.loading = false;
        this.detail = rs.data;
        this.detail.content = this.detail.content.replace(/&nbsp;/g, "");
        this.cid = rs.data.sc_catid;
        this.region_id = rs.data.region_id;
        this.showShare = true;
        this.complete = true;
        this.getUserAttention();
        this.getrelates();
        this.dynamicHeight();
      } else {
        //this.$alert(rs.msg);
        appcall.showToast(rs.msg);
      }
    },
    /**
     * 获取相关资讯
     */
    async getrelates() {
      let params = {
        aid: this.id,
        cid: this.cid
      };
      let comm = await appcall.getAppData();
      let rs = await ajax(
        "post",
        this.$apiurl + "/article/get_related_article_lists",
        comm,
        params,
        false
      );
      console.log(rs);
      if (rs && rs.code === 1001 && rs.data) {
        this.relates = this.relates.concat(rs.data.list);
      } else if (rs && rs.code === 1008) {
        this.relates = [];
        this.isempty = true;
      } else {
        //this.$alert(rs.msg);
        appcall.showToast(rs.msg);
      }
    },
    /*
     * 设置字体大小
     */
    async setFontsize(size) {
      let cwidth = document.documentElement.clientWidth || 375;
      let fsize = 100 * cwidth / 750;
      let sizeType = size;
      if (!size) {
        let rs = await appcall.getFontSize();
        sizeType = Number(rs.type);
      }
      switch (sizeType) {
        case 1:
          document.documentElement.style.fontSize = fsize * 0.9 + "px";
          break;
        case 3:
          document.documentElement.style.fontSize = fsize * 1.1 + "px";
          break;
        case 4:
          document.documentElement.style.fontSize = fsize * 1.2 + "px";
          break;
        case 2:
        default:
          document.documentElement.style.fontSize = fsize + "px";
          break;
      }
    },
    /**
     * 动态设置元素高度
     */
    async dynamicHeight() {
      setTimeout(() => {
        let height = this.$refs.contentHeight.offsetHeight;
        //console.log(height);
        if (height < 750) {
          this.loadall = true;
        } else {
          this.$refs.contentHeight.style.height = "15rem";
          this.loadall =false;
        }
      }, 500);
    },

    /**
     * 展开阅读全文
     */
    showall() {
      this.$refs.contentHeight.style.height = "auto";
      this.loadall = true;
    },
    /**
     * 查看相关资讯
     */
    openother(item) {
      appcall.openother({
        type: 1,
        id: item.id,
        sc_catid: this.cid
      });
    },
    /*
       * 获取用户关注状态
       */
    async getUserAttention() {
      let params = {
        region_id: this.region_id
      };
      let comm = await appcall.getRequestData(params);
      let rs = await ajax(
        "post",
        this.$apiurl + "/attention/get_user_attention",
        comm,
        params
      );
      if (rs && rs.code === 1001) {
        // 已登录
        this.islogin = true;
        this.isAttention = rs.data.is_attention == 1 ? true : false;
      } else if (rs && rs.code === 1005) {
        // 未登录
        this.islogin = false;
      } else {
        //this.$alert(rs.msg);
        appcall.showToast(rs.msg);
      }
    },
    /*
       * 执行关注操作
       */
    async doAttention() {
      if (!this.islogin) {
        appcall.login();
      } else {
        if (!this.isAttention) {
          // 执行关注操作
          let params = {
            region_ids: this.region_id
          };
          let comm = await appcall.getRequestData(params);
          let rs = await ajax(
            "post",
            this.$apiurl + "/attention/add",
            comm,
            params
          );
          if (rs && rs.code === 1001) {
            this.isAttention = true;
            appcall.showToast("关注成功");
          } else if (rs && rs.code === 1005) {
            // 未登录
            appcall.login();
          } else {
            //this.$alert(rs.msg);
            appcall.showToast(rs.msg);
          }
        } else {
          // 跳转公众号首页
          this.jumpHomepage();
        }
      }
    },

    /*
       * 微信朋友圈分享
       */
    pyqshare() {
      let params = {
        type: 2
      };
      appcall.shareArticle(params);
    },

    /*
       * 微信好友分享
       */
    wxshare() {
      let params = {
        type: 1
      };
      appcall.shareArticle(params);
    },

    /*
       * 跳转公众号首页
       */
    jumpHomepage() {
      appcall.regionHomepage({
        region_id: this.region_id
      });
    }
  },
  watch: {},
  filters: {
    pinglun(value) {
      value = value.length < 18 ? value : value.substr(0, 18) + "...";
      return value;
    }
  }
};
</script>
<style type="text/css">
.v-pviewer-wrap .v-pviewer-zoom,
.v-pviewer-wrap .v-pviewer-slider,
.v-pviewer-wrap .v-pviewer-list,
.v-pviewer-wrap .v-pviewer-zoom img {
  z-index: 1000;
}
.v-pviewer-wrap .v-pviewer-box {
  background: #000;
}
.v-pviewer-wrap .v-pviewer-header .v-pviewer-index,
.v-pviewer-wrap .v-pviewer-header .v-pviewer-index a {
  color: #fff;
}
</style>
<style scoped>
.article_content,
.article_content>>>* {
  font-size: 0.38rem !important;
  line-height: 0.7rem !important;
  /*color: #333!important;*/
  background: none !important;
  font-family: "Helvetica Neue", Helvetica, "STHeiTi", "Microsoft YaHei",
    sans-serif !important;
  font-weight: normal !important;
  text-align: left !important;
}

.article_content>>>img {
  max-width: 100%;
  height: auto !important;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
}

.article_content>>>iframe {
  width: 100% !important;
  max-width: 100%;
  height: auto !important;
}

.article_content>>>blockquote,
.article_content>>>p {
  margin: 0 auto 0.25rem;
}
</style>
<style lang="less" scoped>
@import "../../../assets/css/colors";
.vDetail {
  background: #fbf9f9;
}

.content {
  background: #fff;
  overflow: hidden;
  padding: 0.26rem 0.3rem 0.3rem;
  h1 {
    font-size: 0.5rem;
    line-height: 0.68rem;
    color: #333;
    font-weight: 600;
    margin-bottom: 0.2rem;
  }
  .nav {
    line-height: 0.45rem;
    position: relative;
    margin-bottom: 0.2rem;
    height: 0.9rem;
    .region {
      color: #333;
      font-size: 0.32rem;
      .face {
        width: 0.8rem;
        height: 0.8rem;
        background: url(../../../assets/images/head_mr.png) no-repeat center
          center;
        background-size: 100%;
        border-radius: 0.8rem;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .desc {
        margin-left: 0.2rem;
        .name {
          font-size: 0.32rem;
        }
        .time {
          color: #999;
          font-size: 0.26rem;
        }
      }
      .focus {
        button {
          width: 1.2rem;
          height: 0.6rem;
          margin-top: 0.15rem;
          vertical-align: middle;
          border-radius: 0.1rem;
          background: @mcolor;
          color: #fff;
          font-size: 0.34rem;
          &.active {
            background: #fff;
            color: @mcolor;
            border: 1px solid @mcolor;
          }
        }
      }
    }
  }
  .all_content {
    overflow: hidden;
    .article_content {
      overflow: hidden;
      position: relative;
    }
    .share {
      font-size: 0.3rem !important;
      overflow: hidden !important;
      margin-top: 0.2rem !important;
      text-align: center !important;
      .tips {
        line-height: 0.3rem !important;
        &:before {
          content: "";
          display: block;
          height: 1px;
          width: 4.64rem;
          background-color: #dddddd;
          position: relative;
          top: 0.16rem;
          margin: auto;
        }
        .red {
          display: inline-block;
          background-color: #fff;
          padding: 0 0.3rem;
          position: relative;
          color: #d53c3e;
        }
      }
      .shareBox {
        .share_item {
          width: 50%;
          color: #444444;
          div.img {
            width: 1rem;
            height: 1rem;
            border: 1px solid #e1e1e1;
            border-radius: 100%;
            margin: 0.42rem auto 0.3rem;
            background-color: #f7f7f7;
          }
          img {
            width: 0.6rem;
            margin: 0.2rem auto;
          }
        }
      }
    }
  }
  .load_all {
    position: relative;
    padding: 0 0.65rem;
    a {
      border: 1px solid @mcolor;
      border-radius: 0.9rem;
      display: block;
      background: #ffe6e6;
      font-size: 0.4rem;
      text-align: center;
      color: @mcolor;
      line-height: 0.9rem;
      position: relative;
      z-index: 1;
      &:after {
        content: "";
        display: inline-block;
        border-top: 0.2rem solid @mcolor;
        border-left: 0.1rem solid transparent;
        border-right: 0.1rem solid transparent;
        position: relative;
        top: -0.05rem;
      }
      &:active {
        background: rgba(255, 230, 230, 0.7);
      }
    }
    em {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      display: block;
      height: 3rem;
      background: -webkit-linear-gradient(
        top,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.8) 50%,
        rgba(255, 255, 255, 0.9) 55%,
        rgba(255, 255, 255, 0.93) 60%,
        rgba(255, 255, 255, 0.96) 65%,
        #fff 100%
      );
    }
  }
}

.others {
  background: #fff;
  padding: 0 0.3rem;
  .title {
    padding: 0.38rem 0 0;
    text-align: left;
    border-bottom: 1px solid #e2e1e0;
    span{
      position: relative;
      color: #282a2f;
      font-size: 0.28rem;
      line-height: .5rem;
      width: 1.28rem;
      margin: auto;
      // &::before{
      //   content: "";
      //   display: block;
      //   height: 1px;
      //   width: .64rem;
      //   position: absolute;
      //   top: .25rem;
      //   left: -.64rem;       
      //   background: #282A2E;
      //   transform: scale(0.5);
      // }
      &::after{ 
        content: "";
        display: block;
        height: 1px;
        width: 2.46rem;
        position: absolute;
        left:-.64rem;       
        background: #282a2e;
        transform: scale(0.5);
      }
    }
  }
}
.infors .con {
  .j_loading {
    font-size: 0.6rem;
    padding: 0.24rem 16px 0.24rem;
    background-color: #fff;
    .spinner {
      width: 1.5rem;
      margin: 0 auto;
      text-align: center;
      div {
        display: inline-block;
        width: 0.16rem;
        height: 0.16rem;
        -webkit-animation: bouncedelay 1.4s infinite ease-in-out;
        animation: bouncedelay 1.4s infinite ease-in-out;
        border-radius: 100%;
        background-color: #999;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
      }
      .bounce1 {
        margin-right: 0.08rem;
        animation-delay: -0.32s;
      }
    }
    .txt {
      font-size: 0.24rem;
      padding: 0.1rem 0;
      text-align: center;
      color: #999;
    }
  }
  @keyframes bouncedelay {
    0%,
    100%,
    80% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }
    40% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }
  li {
    position: relative;
    &::after{
      content: "";
      display: block;
      height: 1px;
      width: 13.8rem;
      position: absolute;
      bottom:0;
      left:-3.45rem;       
      background: #e2e1e0;
      transform: scale(0.5);
    } 
    // border-top: 1px solid #eee;
    &:first-child {
      border-top: 0;
    }
    a {
      display: block;
      padding: 0.3rem 0;
      width: 6.9rem;
      &:active {
        background: #eee;
      }
    }
    .pic {
      border:0.5px solid #e5e7eb;
      width: 2.26rem;
      height: 1.48rem;
      overflow: hidden;
      float: left;
      img {
        display: block;
        width: 100%;
      }
    }
    .name {
      margin-left: 2.56rem;
      font-size: 0.32rem;
      color: #282a2f;
      line-height: 0.42rem;
      min-height: 1.48rem;
      word-break : normal;
      overflow: hidden;
      text-align: justify;
      p{
        margin-top: .12rem;
        span{
          font-size: .24rem;
          color: #97999d;
          &.hits{
            margin-left: .18rem;
          }
        }
        
      }
    }
    .threeName{
      width: 6.9rem;
      font-size: 0.32rem;
      color: #282a2f;
      line-height: 0.42rem;
      word-break : normal;
      text-align: justify;
    }
    .threePic{
      width: 6.9rem;
      padding: .12rem 0 .08rem; 
      .imgBox{
        width: 2.26rem;
        height: 1.48rem;
        overflow: hidden;
        display: inline-block;
        margin-right:.06rem;
        border:0.5px solid #e5e7eb;
        &:last-child{
          margin-right:0;
        } 
        img{
          width: 100%;
        }   
      }
    }
    .threeP{
      span{
        font-size: .24rem;
        color: #97999d;
        &.hits{
          margin-left: .18rem;
        }
      }
    }
  }
}
.scroll-view {
  /* -- Attention: This line is extremely important in chrome 55+! -- */
  touch-action: none;
  /* -- Attention-- */
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>
