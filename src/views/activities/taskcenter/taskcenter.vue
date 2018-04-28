<template>
  <div>
    <vue-progress-bar></vue-progress-bar>
    <!-- 全局header -->
    <nv-head ref="head" :show-head="false" :fix-head="false" page-name="$route.meta.title">
    </nv-head>
    <nv-loading :loading="loading"></nv-loading>
    <div class="taskCenter" v-show="!loading">
      <div class="taskCenter_top">
        <div class="maskLayer" v-if="!iospedding"></div>
        <nv-marquee :duration="800" :interval="2000" :play="marqueePlay"  class="flushCroll" v-show="!iospedding" ref="flushCroll">
          <li v-for="(item,$index) in scrollbarData" :key="$index">
            恭喜{{item.userid}}兑换了{{item.product_name}}奖励
          </li>
        </nv-marquee>
        <div class="tips">
          <a class="signInBtn" @click="sign" :class="{'signed':detail.is_sign,'notLogin':!isLogin}">{{btnStr}}</a>
          <div class="signTips" >{{signTips}}</div>
        </div>        
        <div class="sevenDays">
          <ul class="signList clearfix">
            <li v-for="(item,$index) in sevenDays" :key="$index" class="clearfix">
              <div class="circle" :class="{'yellow':$index < signCount}">
                <button class="coin"><span>{{item.coin}}</span></button>
              </div>
              <div class="day" v-if="$index >= signCount ">{{$index+1}}天</div>
              <div class="day yellow" v-if="$index < signCount">{{$index+1}}天</div>
              <div :class="{'progressBar':$index < signCount}"></div>
            </li>
          </ul>
        </div>
      </div>
      <div class="taskCenter_swiper" v-if="!iospedding && urlList.length>0">
        <div class="oneImg" v-if="urlList.length == 1">
          <img :src="urlList[0].image_url" @click="adJump(urlList[0])">
        </div>
        <swiper :options="swiperOption" ref="mySwiper" v-if="urlList.length > 1">
          <!-- slides -->
          <swiper-slide v-for="(item,$index) in urlList" :key="$index" >
            <img :src="item.image_url" @click="adJump(item)">
          </swiper-slide>
          <div class="swiper-pagination" slot="pagination"></div>
        </swiper>
      </div>
      <div class="taskCenter_tasks" v-show="!iospedding">
        <div class="task" v-show="isNewer">
          <div class="title">
            <i class="icoNew"></i>新手任务
          </div>
        </div>
        <ul class="taskList newer" v-show="isNewer">
          <li v-for="(item,$index) in newerTasks" :key="$index">
            <div class="taskTitle" :class="{'down':!item.show,'up':item.show}" @click="togglenewer($event,$index)">
              <div class="title clearfix">{{item.task_name}}</div>
              <i class="iconfont clearfix" :class="{'down':!item.show,'up':item.show}">&#xe6a6;</i>
              <div class="earn clearfix">
                <span>{{item.award_desc}}</span>
                <i :class="{earn_coin:item.units_style == 'coin',earn_cash:item.units_style == 'cash'}"></i>
              </div>
            </div>
            <div class="taskContent" v-show="item.show">
              <div class="box">
                <div class="toggleItem">
                  <div class="table">
                    <div class="table-cell">{{item.task_conent}}</div>
                  </div>
                </div>
                <button class="toDo" :class="{'red':item.task_status==0 || item.task_status==1 || item.task_status==3 ,'orange':item.task_status==2}" @click="toDo($event,item)">{{item.btn}}</button>
              </div>
            </div>
          </li>
        </ul>
        <div class="task">
          <div class="title">
            <i class="icoDaily"></i>日常任务
          </div>
          <!-- <div class="ios_tips" v-show="isios">注：本活动与苹果公司无关</div> -->
        </div>
        <ul class="taskList">
          <li v-for="(item,$index) in tasks" :key="$index" v-if="item.task_status!=4">
            <div class="taskTitle" :class="{'down':!item.show,'up':item.show}" @click="toggle($event,$index)">
              <div class="title clearfix">
                <span >{{item.task_name}}</span>
                <span class="count" v-if="item.task_keys=='share_article'">{{item.incr_num+'/5篇'}}</span>
                <span class="count" v-if="item.task_keys=='yqhy_more'">{{item.incr_num+'/无上限'}}</span>
              </div>
              <i class="iconfont clearfix" :class="{'down':!item.show,'up':item.show}">&#xe6a6;</i>
              <div class="earn clearfix" v-if="item.task_status==0 || item.task_status==1 || item.task_status==2 ">
                <span>{{item.award_desc}}</span>
                <i :class="{earn_coin:item.units_style == 'coin',earn_cash:item.units_style == 'cash'}"></i>
              </div>
              <div class="done clearfix" v-if="item.task_status==3">
                <i></i>
              </div>
            </div>
            <div class="taskContent" v-show="item.show">
              <div class="box">
                <div class="toggleItem">
                  <div class="table">
                    <div class="table-cell">{{item.task_conent}}</div>
                  </div>
                </div>
                <button class="toDo " :class="{'red':item.task_status==0 || item.task_status==1 ||item.task_status==3 ,'orange':item.task_status==2}" @click="toDo($event,item)">{{item.btn}}</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="modal" v-show="goLoginModalShow" @touchmove.prevent>
        <div class="goLoadingModal">
          <div class="tipsBox">
            登录后才可以获取金币哦，去登录？
          </div>
          <div class="btnbox">
            <div class="cancel clearfix" @click="close">取消</div>
            <div class="ok clearfix" @click="goLogin">确认</div>
          </div>
        </div>
      </div>
      <div class="modal" v-show="signModalShow && !iospedding" @touchmove.prevent>
        <div class="signModal">
          <div class="content">
            <i class="iconfont close" @click="close">&#xe685;</i>
            <div class="title">签到成功</div>
            <div class="tips">
              <i></i>
              <span><span class="todayCoin">+{{todayCoin}}</span>金币</span>
              <p>—恭喜你获得一次 收益暴涨机会—</p>
            </div> 
            <div class="hotArticle" @click="goToArticle(hotArticle.id)">
              <div class="img clearfix">
                <img :src="hotArticle.piturl" width="100%" />
              </div>
              <div class="title clearfix">
                <div class="name">{{hotArticle.title | title}}</div>
                <div class="reader">阅读 {{hotArticle.hits}}次</div>
              </div> 
            </div>   
            <div class="shareTips">分享热文到朋友圈并写下<span>“这一刻的想法”</span>,可获得100金币，每天最高获得500金币</div>       
          </div>
          <div class="btn"  @click="pyqshareArticle(hotArticle.id)">分享赚<span>+100金币</span></div>
        </div>
      </div>
      <div class="modal" v-show="getCoinsShow" @touchmove.prevent>
        <div class="getCoins">
          <span class="num">{{taskGetAward.coin?taskGetAward.coin:taskGetAward.cash}}</span>
          <span class="unit">{{taskGetAward.coin?'金币':'元'}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
require("swiper/dist/css/swiper.css");
import { swiper, swiperSlide } from "vue-awesome-swiper";
import nvHead from "@/components/header.vue";
import nvLoading from "@/components/loading.vue";
import nvMarquee from "@/components/marquee";
import ajax from "@/assets/js/ajax";
import appcall from "@/assets/js/appcall";

export default {
  name: "taskCenter",
  data() {
    return {
      loading: false,
      sevenDays: [],
      newerTasks: [],
      isNewer: false,
      tasks: [],
      detail: {},
      btnStr: "签到",
      signTips: "",
      iospedding: false,
      goLoginModalShow: false,
      signModalShow: false,
      getCoinsShow: false,
      getCoin: 0,
      taskGetAward: {},
      todayCoin: 0,
      hotArticle: {},
      scrollbarData: [],
      marqueePlay: false,
      isLogin: false,
      swiperOption: {
        loop: false,
        speed: 1000,
        pagination: ".swiper-pagination",
        paginationClickable: true
        // autoplay:3000,
      },
      urlList: [],
      sharetxt:
        "免费送钱啦！看新闻能赚零花！随便攒攒就可以马上提现了~还等什么，感兴趣的朋友，可以扫／码一起来玩",
      sharetxtlist: [
        "在这看资讯给[愉快]钱，真是棒[强]极了！根本放不[飞吻]下，过段时间就能提[色]现。我做得到，相信你[强]也可以的！赶紧一起来[色]扫／码玩吧",
        "我[跳跳]自己试过了，真的可以赚[色]钱！大家来试试，在这里看新闻就有钱，[强]真的讲信用！完全免费扫[调皮]码参与的，[憨笑]就放心随便看吧",
        "可以天天赚[坏笑]零花的好福利，你要不要[傲慢]在这里免费看喜欢的新闻就能赚[悠闲]零花，看得多赚的更多~还能提[色]现，赶紧抓住机会试试[笑]",
        "[咖啡]空闲时间别浪费，快来[阴险]这里看资讯吧，边看还能边赚[愉快]零花，相信[奋斗]我就对了！快来扫[呲牙]-码一起玩，免费无风险[啤酒]放心",
        "真是又可靠的好[色]福利，看资讯给零[强]花，还能培养[跳跳]自己好的阅读习惯。每天[奋斗]都会更新，来扫[愉快]码试试看吧,[憨笑]包你满意",
        "这个免[色]费赚[奋斗]零花的机会要把握，[憨笑]看看新闻就可以，更可以微信提[西瓜]现！绝对[啤酒]靠谱！介绍大家扫[坏笑]码试试，[强]绝对好用",
        "看新闻看[奋斗]的停不下来，就每天来看看喜欢[色]的资讯，就有零花钱入[调皮]账扫[抠鼻]码加入很简单，看了可不白[得意]看哦～真的能够提[胜利]现！",
        "这里免费[愉快]看新闻真的能赚-[月亮]钱！既能涨知识，又能赚-[拳头]钱，分分钟有收[拥抱]益！识别我的截图，提-[鼓掌]现可以到账哦！",
        "身边的[爱心]朋友都在玩，扫-码免[啤酒]费看文章送零花，让你提升知识面学到更多[嘿哈]知识呢。新闻看的越多零用钱[礼物]赚的就越快～",
        "走过路过[啤酒]来看新闻啦！看新闻就能赚零[跳跳]花~完全免[强]费加入的，只在这里有这福[耶]利，信息时代要跟上步伐啊",
        "天天来看[得意]新闻，免费看还能赚[爱心]零花，这可是真钱[飞吻]哦～你可以兑换礼品，也可以提现。是不是很[嘿哈]诱人？！赶快扫[蛋糕]／码吧",
        "这里我很喜欢！免费看新闻[玫瑰]还给钱，真是天大的好事。我提现已经[礼物]到账了，真棒！一样看新闻，扫／码在这看吧～还能赚-[飞吻]钱！",
        "身边的[得意]朋友都在玩，扫-码免[呲牙]费看新闻送零花，让你提升[跳跳]知识面学到更[强]多知识呢。新闻看的越多零用钱[拥抱]赚的就越快～",
        "这里看[可怜]新闻不吃亏不上当！内容丰富，覆盖[耶]面广，看了还能得奖励！我已经扫-码[月亮]在看了，让你更有阅读[礼物]的动力，还挺有意思的",
        "每天新闻看几篇，金[啤酒]币自动进钱包。会自动换[愉快]钱，真钱哦～还可以微信提现。[爱心]是不是心动啦？！赶快动动手指扫／[嘿哈]码吧",
        "看新闻得奖[呲牙]励，别的地方可没这种福[拳头]利！所以最近喜欢看新闻，原因就是这个。推荐大家扫[强]-码试试，非常好玩",
        "每天新闻看几篇，金币自动进钱[玫瑰]包。会自动换[拥抱]钱，真钱哦～还可以微信提[耶]现。是不是心动啦？！赶快动动手指扫[月亮]／码吧",
        "发现了一个好福[嘿哈]利，免费看新闻，而且看了还有惊喜！完全免[蛋糕]费的，扫／[跳跳]码就能加入。收益达到要求，可以提[拳头]现都哦！",
        "约对福[拥抱]利～白看新闻还给钱！信息时代来钱[月亮]快，太给力了。看看文章就可以了，收[礼物]益不断积累你可兑换商品。扫[愉快]码试试吧",
        "最近特别喜欢看新闻，看了能赚[拥抱]金币，金币还能换成[月亮]钱！推荐给大家扫／[啤酒]码试试，我用到现在了，没毛病！",
        "随便看看这个，就能赚[悠闲]到钱！一样要看新闻，还不如试试这个。新闻照样看，还能赚点零[玫瑰]花钱，多好的事还不快扫[可怜]-码试试",
        "扫•[月亮]码看新闻资讯，大家可以来这。内容丰富，覆盖面广，看了还能得奖[礼物]金！我每天都看，让你更有阅[愉快]读的动力，还挺有意思的",
        "在这看[得意]资讯不简单，看完有惊喜！看了就停不下来，我一有[鼓掌]空就会看。随便看看文章就有钱[跳跳]，还不赶快扫／[玫瑰]码试试",
        "闲暇时看看[拥抱]文章就能赚零花，反正我选这个，感觉在这看最划[可怜]算！别的平台没这样的福[月亮]利哦，不知不觉就有收[嘿哈]益~",
        "时间就是金[飞吻]钱！一个真正可以看新闻就能赚[玫瑰]钱的平台，抓住机会试试[拳头]！",
        "大家有空的时候看看[呲牙]新闻吧~这里看文章不花[跳跳]钱还会给你[悠闲]钱！只要认真阅读就发福[拥抱]利，识别二[礼物]维码，快快行动吧",
        "真的免费送福[愉快]利～看了资讯还送[爱心]钱。玩法也简单，就看看文章。完全免费扫-[嘿哈]码的，就放心看吧！保持平常心，收[啤酒]益会满满增长",
        "这个真心不错，免[愉快]费看资讯还赚[月亮]零花，让你轻松爱上阅读！免费有[爱心]诚信，资讯内容高端、上档次，赶紧扫-[蛋糕]码试试",
        "看新闻资讯也能赚[啤酒]钱，这个绝对靠谱！识别我发的二[玫瑰]维码，已经提现了哦！完全免[可怜]费的，没有任何风险，真的会给[啤酒]钱哦～",
        "看新闻，涨知识，扫•[呲牙]码免费看真划算，重要的是可以赚-[拳头]钱！是不是很诱人？！我已经赚[礼物]到钱了，你们也来试试，真[飞吻]棒！",
        "赚钱的套路有很多，[玫瑰]看资讯能赚钱，[转圈]我还是刚知道！免费看资讯，[害羞]增长了见识，还可以给钱！[色]扫码加入吧，真是天大的便宜啊！[愉快]",
        "推荐[嘴唇]你一个免费看新闻的[爱心]，扫-码[鼓掌]看资讯还给钱，海量资讯等你来，肯定有你喜欢的！[握手]赶紧抓住机会试试，可别错过了",
        "找了好久[抱拳]的资讯平台，这个[强]看资讯送金币！[胜利]"
      ],
      flag: false
    };
  },
  components: {
    nvHead,
    nvLoading,
    nvMarquee,
    swiper,
    swiperSlide
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.swiper;
    }
  },
  async created() {
    this.$Progress.start();
    this.iospedding = await appcall.getReviewStatus();
    this.pullDown();
  },
  watch: {},
  mounted() {
    //下拉获取新数据调用
    window.afterPullDown = function(sizeType) {
      this.pullDown();
    }.bind(this);
  },
  methods: {
    /**
     * 下拉获取新数据
     */
    async pullDown() {
      this.close();
      this.iospedding = await appcall.getReviewStatus();
      let appdata = await appcall.getAppData();
      if (!appdata.uid || !appdata.token) {
        this.isLogin = false;
        this.btnStr = "未登录";
        this.signTips = "连续签到有更多惊喜哦~";
      } else {
        this.isLogin = true;
      }
      this.getSignInState();
      if (!this.iospedding) {
        this.getNewerTasks();
        this.getTasks();
        this.getTaskAd();
        this.scrollbar();
      }
    },

    /**
     * 获取签到状态
     */
    async getSignInState() {
      let params = {};
      let comm = await appcall.getRequestData(params);

      let rs = await ajax(
        "post",
        this.$apiurl + "/sign/get_signin_detail",
        comm,
        params
      );
      this.$Progress.finish();
      if (rs && rs.code === 1001) {
        this.loading = false;
        this.detail = rs.data;
        this.signCount = rs.data.sign_count;
        if (this.isLogin) {
          this.signTips = rs.data.is_sign_str;
          if (rs.data.is_sign > 0) {
            this.btnStr = "已签到";
          } else {
            this.btnStr = "签到";
          }
        }
        let sevenDays = [];
        this.detail.sign_coin.forEach((n, i) => {
          sevenDays.push(n);
        });
        this.sevenDays = sevenDays;
      } else {
        this.$alert(rs.msg);
      }
    },
    /*
       * 获取广告
       */
    async getTaskAd() {
      let params = {};
      let comm = await appcall.getRequestData(params);

      let rs = await ajax(
        "post",
        this.$apiurl + "/activity/get_task_ad",
        comm,
        params
      );

      if (rs && rs.code === 1001 && rs.data) {
        this.urlList = rs.data.list;
        if (rs.data.list.length > 1) {
          // this.swiperOption.loop=true;
        }
      }
    },
    /*
       * 广告跳转
       */
    adJump(item) {
      switch (item.kind) {
        case 1:
        case 2:
          appcall.navigator({
            title: item.activity_name,
            url: this.$h5url + item.jump_url
          });
          break;
        case 3:
          appcall.articles({ sc_catid: item.sc_catid });
          break;
        case 4:
          appcall.videos({ sc_catid: item.sc_catid });
          break;
      }
    },
    /*
       * 获取新手任务列表
       */
    async getNewerTasks() {
      let params = {};
      let comm = await appcall.getRequestData(params);
      let rs = await ajax(
        "post",
        this.$apiurl + "/task/get_newer_lists",
        comm,
        params,
        false
      );
      if (rs && rs.code === 1001 && rs.data) {
        this.isNewer =
          rs.data.is_newer === 1 && rs.data.list.length > 0 ? true : false;
        if (this.isNewer) {
          rs.data.list.forEach((n, i) => {
            if (n.task_status == 2) {
              n.show = true;
            } else {
              n.show = false;
            }
            n.isNewer = true;
          });
          this.newerTasks = rs.data.list;
        }
      } else if (rs && rs.code === 1005) {
        this.$alert(rs.msg).then(ok => {
          appcall.login();
        });
      } else {
        this.$alert(rs.msg);
      }
    },

    /**
     * 获取日常任务列表
     */
    async getTasks() {
      let params = {};
      let comm = await appcall.getRequestData(params);

      let rs = await ajax(
        "post",
        this.$apiurl + "/task/get_tasks_lists",
        comm,
        params,
        false
      );
      if (rs && rs.code === 1001 && rs.data) {
        rs.data.forEach((n, i) => {
          if (n.task_status == 2) {
            n.show = true;
          } else {
            n.show = false;
          }
        });
        this.tasks = rs.data;
      } else {
        this.$alert(rs.msg);
      }
    },
    toggle(event, index) {
      this.tasks[index].show = !this.tasks[index].show;
    },
    togglenewer(event, index) {
      this.newerTasks[index].show = !this.newerTasks[index].show;
    },
    /*
       * 任务按钮动作
       */
    toDo(event, item) {
      if (this.isLogin) {
        if (!this.flag) {
          this.flag = true;
          if (item.action_type && item.task_status == 2) {
            this.taskSuccessed(item);
          } else if (
            item.task_status == 0 ||
            item.task_status == 1 ||
            item.task_status == 3
          ) {
            this.judge(item);
          } else {
          }
          setTimeout(() => {
            this.flag = false;
          }, 2000);
        }
      } else {
        this.goLoginModalShow = true;
      }
    },

    /**
     * 根据isLogin跳转
     */
    judge(item) {
      if (item.task_type == "webview") {
        if (item.task_keys == "first_alipay") {
          if (!item.pop_word) {
            appcall.navigator({
              title: item.task_name,
              url: item.url
            });
          } else {
            this.$alert(item.pop_word);
          }
        } else {
          appcall.navigator({
            title: item.task_name,
            url: item.url
          });
        }
      } else if (item.task_type == "module") {
        this.doModuleClassify(item);
      } else if (item.task_type == "simple") {
      } else {
        // 默认去主页
        appcall.articles();
      }
    },
    /**
     * 根据module分类跳转
     */
    doModuleClassify(item) {
      switch (item.module) {
        case "article_list":
          let params = item.module_params ? JSON.parse(item.module_params) : "";
          appcall.articles(params);
          break;
        case "video_list":
          appcall.videos();
          break;
        case "bind_alipay":
        case "bind_wechat":
          appcall.bindzfb();
          break;
        case "share_weixin_timeline":
          this.pyqshare();
          break;
        case "share_weixin":
          this.wxshare();
          break;
        default:
          appcall.articles();
          break;
      }
    },
    /**
     * 签到动作
     */
    async sign() {
      if (this.isLogin) {
        let params = {};
        let comm = await appcall.getRequestData(params);

        if (this.detail.is_sign != 1) {
          let rs = await ajax(
            "post",
            this.$apiurl + "/sign/signin",
            comm,
            params
          );
          if (rs && rs.code === 1001) {
            this.detail.is_sign++;
            this.signCount++;
            this.btnStr = "已签到";
            this.signTips = rs.msg;
            if (this.iospedding) {
              this.$toast("签到成功");
            } else {
              this.signModalShow = true;
              this.todayCoin = rs.data.today_coin;
              this.getInformationList();
            }
          } else {
            this.$alert(rs.msg);
          }
        }
      } else {
        this.goLoginModalShow = true;
      }
    },
    /**
     * 头部滚动条
     */
    async scrollbar() {
      let params = {};
      let comm = await appcall.getRequestData(params);

      let rs = await ajax(
        "post",
        this.$apiurl + "/tasks/get_user_withdraw",
        comm,
        params
      );
      if (rs && rs.code === 1001) {
        this.scrollbarData = rs.data.list;

        setTimeout(() => {
          this.marqueePlay = true;
        }, 0); //用setTimeout0来代替进程同步，坑!!!
      } else if (rs && rs.code === 1008) {
        // 暂无数据
        this.scrollbarData = [];
      } else {
        this.$alert(rs.msg);
      }
    },
    /**
     * 签到成功获取相关资讯
     */
    async getInformationList() {
      let params = {
        num: 3
      };
      let comm = await appcall.getAppData();

      let rs = await ajax(
        "post",
        this.$apiurl + "/sign/get_sign_recomm_article",
        comm,
        params
      );
      if (rs && rs.code == 1001 && rs.data) {
        this.hotArticle = rs.data.list[0];
        this.hotArticle.hits = this.RandomNum(3000, 30000);
      } else if (rs.code === 1008) {
        this.hotArticle = [];
      } else {
        this.$alert(rs.msg);
      }
    },
    /**
     * 任务完成领取动作
     */
    async taskSuccessed(item) {
      let params = { task_keys: item.task_keys };
      let comm = await appcall.getRequestData(params);

      let rs = await ajax(
        "post",
        this.$apiurl + "/" + item.action_type,
        comm,
        params,
        false
      );
      if (rs && rs.code == 1001 && rs.data) {
        this.taskGetAward = rs.data;
        this.getCoinsShow = true;
        this.refresh(item, 0);
        clearTimeout(this.timer1);
        this.timer1 = setTimeout(() => {
          this.getCoinsShow = false;
        }, 1500);
      } else {
        this.$alert(rs.msg);
        this.refresh(item, 0);
      }
    },
    /**
     * 去阅读分享文章
     */
    goToArticle(id) {
      this.signModalShow = false;
      appcall.gotoarticle({
        id: id
      });
    },

    /**
     * 迟刷新状态
     */
    refresh(item, times) {
      clearTimeout(this.time2);
      this.timer2 = setTimeout(() => {
        if (item.isNewer) {
          this.getNewerTasks();
        } else {
          this.getTasks();
        }
      }, times);
    },

    /**
     * 关闭弹窗
     */
    close() {
      this.goLoginModalShow = false;
      this.signModalShow = false;
    },
    /**
     * 去登陆
     */
    goLogin() {
      this.goLoginModalShow = false;
      appcall.login();
    },
    /**
     * 分享文章到朋友圈
     */
    pyqshareArticle(id) {
      this.signModalShow = false;
      let params = {
        type: 2,
        sc_catid: id
      };
      appcall.shareArticle(params);
    },
    /**
     * 微信朋友圈邀请
     */
    async pyqshare() {
      this.randomSharetxt();
      let params = {
        share_where: 1
      };
      let comm = await appcall.getRequestData(params);
      let rs = await ajax(
        "post",
        this.$apiurl + "/task/share_invitation",
        comm,
        params
      );
      if (rs && rs.code === 1001) {
        let images = rs.data.image.join(";");
        let params = {
          type: 2,
          title: "",
          url: "",
          desc: this.sharetxt,
          images: images
        };
        clearTimeout(this.timer3);
        this.timer3 = setTimeout(() => {
          this.getTasks();
        }, 3000);
        appcall.invite(params);
      } else {
        this.$alert(rs.msg);
      }
    },
    /**
     * 微信好友邀请
     */
    async wxshare() {
      let params = {};
      let comm = await appcall.getRequestData(params);
      let rs = await ajax(
        "post",
        this.$apiurl + "/task/get_share_wechat_url",
        comm,
        params
      );
      if (rs && rs.code === 1001) {
        let url = rs.data;
        let params = {
          type: 1,
          title: "我刚加入了超级头条，还不错，邀请你加入",
          url: rs.data + "/register?uid=" + comm.uid,
          desc: "看资讯还能赚零花钱~ 绝对靠谱，抓住机会了，来试试",
          images: ""
        };
        clearTimeout(this.timer4);
        this.timer4 = setTimeout(() => {
          this.getTasks();
        }, 3000);
        appcall.invite(params);
      } else {
        this.$alert(rs.msg);
      }
    },
    /**
     * sharetxt随机
     */
    randomSharetxt() {
      this.sharetxt = this.sharetxtlist[
        Math.floor(Math.random() * (this.sharetxtlist.length - 1))
      ];
    },
    /**
     * 随机数
     */
    RandomNum(Min, Max) {
      var Range = Max - Min;
      var Rand = Math.random();
      var num = Min + Math.floor(Rand * Range); //舍去
      return num;
    }
  },
  filters: {
    title(value) {
      if (value) {
        value = value.length < 17 ? value : value.substr(0, 17) + "...";
      }
      return value;
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../../assets/css/colors";
.taskCenter {
  background: #f5f5f5;
  .taskCenter_top {
    width: 100%;
    height: 4.74rem;
    background-image: url("../../../assets/images/taskcenter/taskcenter_bg.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    position: relative;
    margin-bottom: 0.16rem;
    .maskLayer {
      height: 0.56rem;
      line-height: 0.56rem;
      background: rgba(0, 0, 0, 0.09);
      overflow: hidden;
    }
    .flushCroll {
      position: absolute;
      bottom: 0;
      top: 0;
      left: 0;
      right: 0;
      text-align: center;
      overflow: hidden;
      z-index: -1;
      height: 0.56rem !important;
      ul {
        height: 0.56rem !important;
      }
      li {
        height: 0.56rem !important;
        line-height: 0.56rem !important;
        font-size: 0.32rem;
        color: #fff;
      }
    }
    .tips {
      position: absolute;
      top: 1.06rem;
      right: 0.6rem;
      text-align: center;
      .signInBtn {
        height: 0.92rem;
        line-height: 0.92rem;
        width: 2.8rem;
        text-align: center;
        border-radius: 1rem;
        background: #ffffff;
        color: #fa2927;
        font-size: 0.4rem;
        display: inline-block;
        margin-bottom: 0.24rem;
        &.signed {
          background: rgba(255, 255, 255, 0.6);
        }
        &:active {
          background: rgba(255, 255, 255, 0.9);
        }
        &.notLogin {
          background-image: url("../../../assets/images/taskcenter/btn_bg.png");
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }
      }
      .signTips {
        color: #ffffff;
        font-size: 0.28rem;
      }
    }
  }

  .sevenDays {
    width: 100%;
    text-align: center;
    position: absolute;
    top: 3.3rem;
    .signList {
      width: 6.94rem;
      text-align: center;
      margin: 0 auto;
      position: relative;
      &:before {
        content: "";
        position: absolute;
        display: block;
        height: 0.1rem;
        background: #ffffff;
        opacity: 0.35;
        top: 50%;
        margin-top: -0.05rem;
        left: 5%;
        width: 90%;
      }
      li {
        width: 0.8rem;
        height: 0.8rem;
        float: left;
        position: relative;
        margin-right: 0.22rem;
        z-index: 1;
        .progressBar {
          position: absolute;
          display: block;
          height: 0.1rem;
          background: #fbd92e;
          top: 50%;
          margin-top: -0.05rem;
          left: -0.13rem;
          z-index: -1;
          width: 1.02rem;
        }
        &:first-child {
          .progressBar {
            left: 0.4rem;
            width: 0.5rem;
          }
        }
        &:last-child {
          margin-right: 0;
          .progressBar {
            width: 0.5rem;
          }
        }
        .circle {
          width: 0.76rem;
          height: 0.76rem;
          background: rgba(255, 255, 255, 0.68);
          border-radius: 50%;
          margin: auto;
          .coin {
            width: 0.66rem;
            height: 0.66rem;
            background: rgb(255, 255, 255);
            border-radius: 50%;
            margin: 0.05rem;
            span {
              font-size: 0.26rem;
              color: #e82422;
            }
          }
          &.yellow {
            background: rgba(251, 222, 62, 0.68);
            .coin {
              background: #fbd92e;
            }
          }
        }
        .day {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          font-size: 0.24rem;
          margin-top: 0.1rem;
          color: #ffffff;
          &.red {
            color: @mcolor;
          }
          &.yellow {
            color: #fbd92e;
          }
        }
      }
    }
  }

  @keyframes bxshake {
    from,
    to,
    36% {
      transform: rotate(0deg) translate(0, 0);
    }
    10%,
    13% {
      transform: rotate(10deg) translate(0, -0.05rem);
    }
    16%,
    19% {
      transform: rotate(-10deg) translate(0, -0.1rem);
    }
    21%,
    24% {
      transform: rotate(10deg) translate(0, -0.05rem);
    }
    27%,
    30% {
      transform: rotate(-10deg) translate(0, 0);
    }
  }

  .taskCenter_swiper {
    width: 100%;
    height: 2.26rem;
    margin-bottom: 0.16rem;
    .oneImg {
      width: 100%;
      height: 100%;
    }
    .swiper-container {
      width: 100%;
      height: 100%;
      img {
        height: 100%;
        width: 100%;
      }
    }
  }
  .taskCenter_tasks {
    padding: 0 0 0.16rem;
    .task {
      position: relative;
      padding: 0.32rem 0.28rem 0.32rem;
      background: #ffffff;
      overflow: hidden;
      &:after {
        content: "";
        display: block;
        position: absolute;
        left: -50rem;
        bottom: 0;
        width: 100rem;
        height: 1px;
        background: #e9e9e6;
        transform: scale(0.5);
        -webkit-transform: scale(0.5);
      }
      .title {
        height: 0.36rem;
        padding-left: 0.44rem;
        line-height: 0.36rem;
        font-size: 0.3rem;
        color: #282a2f;
        position: relative;
        .icoDaily {
          position: absolute;
          left: 0;
          top: 0;
          width: 0.36rem;
          height: 0.36rem;
          background: url(../../../assets/images/taskcenter/ico_task_daily.png)
            no-repeat center center;
          background-size: 100%;
        }
        .icoNew {
          position: absolute;
          left: 0;
          top: 0;
          width: 0.36rem;
          height: 0.36rem;
          background: url(../../../assets/images/taskcenter/ico_task_new.png)
            no-repeat center center;
          background-size: 100%;
        }
      }
      .ios_tips {
        position: absolute;
        top: 0;
        right: 0.4rem;
        height: 0.42rem;
        line-height: 0.42rem;
        color: #999;
        font-size: 0.16rem;
      }
    }
    .taskList {
      background: #ffffff;
      margin-bottom: 0.16rem;
      &:last-child {
        margin-bottom: 0;
      }
      & > li {
        width: 7.5rem;
        overflow: hidden;
        position: relative;
        &:after {
          content: "";
          display: block;
          position: absolute;
          left: -50rem;
          bottom: 0;
          width: 100rem;
          height: 1px;
          background: #e9e9e6;
          transform: scale(0.5);
          -webkit-transform: scale(0.5);
        }
        .taskTitle {
          position: relative;
          padding: 0 0.26rem 0 20px;
          width: 100%;
          height: 1rem;
          line-height: 1rem;
          cursor: pointer;
          &:before {
            content: "";
            display: block;
            position: absolute;
            top: 50%;
            left: 0;
            width: 10px;
            height: 10px;
            margin: -0.1rem 0 0 15px;
            background: #e2e1e0;
            border-radius: 10px;
          }
          &:after {
            content: "";
            display: block;
            position: absolute;
            top: 0;
            left: 19.5px;
            width: 1px;
            height: 100%;
            background: #e2e1e0;
          }
          .title {
            font-size: 0.3rem;
            height: 1rem;
            line-height: 1rem;
            padding-left: 0.34rem;
            float: left;
            letter-spacing: 0.01rem;
            .count {
              margin-left: 0.2rem;
              color: #5dc3ef;
            }
          }
          .earn {
            font-size: 0.28rem;
            color: #fa2927;
            padding-right: 0.12rem;
            height: 1rem;
            line-height: 1rem;
            float: right;
            & span {
              color: #fa2927;
            }
            .earn_coin {
              display: inline-block;
              width: 0.36rem;
              height: 0.36rem;
              background: url(../../../assets/images/taskcenter/ico_task_coin.png)
                no-repeat center center;
              background-size: 100%;
              vertical-align: sub;
            }
            .earn_cash {
              display: inline-block;
              width: 0.36rem;
              height: 0.36rem;
              background: url(../../../assets/images/taskcenter/ico_task_cash.png)
                no-repeat center center;
              background-size: 100%;
              vertical-align: sub;
            }
            &.red {
              color: @mcolor;
            }
          }
          .done {
            color: #fa2927;
            padding-right: 0.12rem;
            height: 1rem;
            float: right;
            i {
              display: inline-block;
              width: 0.76rem;
              height: 0.42rem;
              background: url(../../../assets/images/taskcenter/ico_task_done.png)
                no-repeat center center;
              background-size: 100%;
              vertical-align: middle;
            }
          }
          & > .iconfont {
            line-height: 1rem;
            height: 1rem;
            float: right;
            font-size: 0.32rem;
            color: #bbb;
            transform: rotate(-90deg);
            transition: 0.5s transform;
            &.up {
              transform: rotate(0deg);
            }
          }
          &:active {
            background: #f5f5f5;
          }
        }
      }
      .taskContent {
        position: relative;
        background: #f5f5f5;
        padding-left: 20px;
        padding-right: 0.3rem;
        &:after {
          content: "";
          display: block;
          position: absolute;
          top: 0;
          left: 19.5px;
          width: 1px;
          height: 100%;
          background: #e2e1e0;
        }
        .box {
          position: relative;
          padding: 0.48rem 0 0.48rem 0.34rem;
          border-radius: 0.2rem;
        }
        .toggleItem {
          padding-right: 2rem;
          line-height: 0.3rem;
          color: #666;
          .table {
            min-height: 0.6rem;
            .table-cell {
              text-align: justify;
              line-height: 0.4rem;
              font-size: 0.28rem;
              color: #585757;
            }
          }
        }
        .toDo {
          width: 1.32rem;
          height: 0.56rem;
          position: absolute;
          top: 50%;
          margin-top: -0.28rem;
          right: 0;
          border-radius: 0.1rem;
          color: #fff;
          font-size: 0.26rem;
          border: 0;
          &:active {
            transform: scale(0.95);
          }
          &.red {
            background: #fb2926;
          }
          &.orange {
            background: #ff7a00;
          }
        }
      }
      li:first-child {
        .taskTitle {
          &:after {
            top: 50%;
            height: 50%;
          }
        }
      }
      li:last-child:not(:first-child){
        .taskTitle {
          &.down:after {
            top: 0;
            height: 50%;
          }
          &.up:after {
            top: 0;
            height: 100%;
          }
        }
      }
    }
  }

  .modal {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2;
    .goLoadingModal {
      position: absolute;
      background-color: #fff;
      display: block;
      width: 5.8rem;
      height: 3.66rem;
      top: 50%;
      margin-top: -1.83rem;
      left: 50%;
      margin-left: -2.9rem;
      border-radius: 0.12rem;
      .tipsBox {
        text-align: justify;
        font-size: 0.36rem;
        color: #282a2f;
        line-height: 0.58rem;
        padding: 0.6rem 0.4rem 0;
      }
      .btnbox {
        width: 100%;
        height: 1.08rem;
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        border-top: 1px solid #e9e9e6;
        position: absolute;
        bottom: 0;
        left: 0;
        .cancel,
        .ok {
          width: 50%;
          height: 100%;
          float: left;
          text-align: center;
          line-height: 1.08rem;
          color: #97999d;
          font-size: 0.32rem;
          border-right: 1px solid #e9e9e6;
        }
        .ok {
          border: 0;
          color: #282a2f;
        }
      }
    }
    .signModal {
      position: absolute;
      display: block;
      width: 6.2rem;
      height: 6.91rem;
      background-image: url("../../../assets/images/taskcenter/signModal_bg.png");
      background-size: 100% 100%;
      background-repeat: no-repeat;
      top: 50%;
      margin-top: -3.455rem;
      left: 50%;
      margin-left: -3.095rem;
      .content {
        width: 5.62rem;
        background: #ffffff;
        height: 4.49rem;
        margin: 0.31rem auto 0;
        border-top-right-radius: 0.3rem;
        border-top-left-radius: 0.3rem;
        position: relative;
        letter-spacing: 0.01rem;
        i.close {
          position: absolute;
          top: 0;
          right: 0;
          font-size: 0.3rem;
          color: #cccccc;
          display: inline-block;
        }
        .title {
          font-size: 0.32rem;
          text-align: center;
          color: #333333;
        }
        .tips {
          text-align: center;
          margin-bottom: 0.15rem;
          i {
            width: 0.69rem;
            height: 0.59rem;
            display: inline-block;
            background: url("../../../assets/images/taskcenter/signModal_coin.png")
              no-repeat center center;
            background-size: 100% 100%;
            vertical-align: text-bottom;
          }
          span {
            color: #ef4d50;
            font-size: 0.3rem;
            margin-top: 0.05rem;
            margin-bottom: 0.15rem;
            display: inline-block;
            .todayCoin {
              font-size: 0.72rem;
            }
          }
          p {
            color: #28adff;
            font-size: 0.32rem;
          }
        }
        .hotArticle {
          width: 5.34rem;
          height: 1.18rem;
          background: #f4f4f4;
          margin: 0 auto;
          .img {
            width: 1.74rem;
            float: left;
            height: 100%;
            overflow: hidden;
            background: #e5e5e5;
            img {
              width: 100%;
            }
          }
          .title {
            float: left;
            width: 3.6rem;
            height: 100%;
            padding: 0 0.17rem 0 0.3rem;
            text-align: left;
            position: relative;
            .name {
              font-size: 0.26rem;
              color: #333;
              overflow: hidden;
              text-align: justify;
              width: 100%;
              height: 0.85rem;
              padding-top: 0.1rem;
            }
            .reader {
              height: 0.32rem;
              position: absolute;
              bottom: 0.05rem;
              left: 0.3rem;
              font-size: 0.24rem;
              color: #999999;
            }
          }
        }
        .shareTips {
          width: 5.34rem;
          margin: 0.2rem auto 0;
          font-size: 0.24rem;
          color: #999999;
          text-align: justify;
          span {
            color: #f44b50;
          }
        }
      }
      .btn {
        width: 5rem;
        height: 0.88rem;
        border-radius: 0.88rem;
        background: #fde03d;
        box-shadow: 0 -0.08rem #f7a81d inset;
        position: absolute;
        bottom: 0.44rem;
        left: 50%;
        margin-left: -2.5rem;
        text-align: center;
        line-height: 0.88rem;
        font-size: 0.36rem;
        color: #a44a00;
        span {
          color: #f44b50;
        }
      }
    }
    .getCoins {
      position: absolute;
      display: block;
      width: 3.28rem;
      height: 2.58rem;
      background-image: url("../../../assets/images/taskcenter/getcoins.png");
      background-size: 100% 100%;
      background-repeat: no-repeat;
      left: 50%;
      margin-left: -1.64rem;
      top: 50%;
      margin-top: -1.29rem;
      text-align: center;
      .num,
      .unit {
        color: #e82422;
        display: block;
        font-size: 0.28rem;
      }
      .num {
        margin-top: 0.55rem;
        font-size: 0.48rem;
      }
    }
  }
}
</style>
