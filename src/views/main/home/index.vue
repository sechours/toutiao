<template>
  <div>
    <!-- 全局header -->
    <nv-head ref="head" :show-head="false" :fix-head="false" page-name="$route.meta.title">
    </nv-head>
    <div class="index" >
      hello world
    </div>
  </div>
</template>

<script>
import nvHead from "@/components/header.vue";

import ajax from "@/assets/js/ajax";
import appcall from "@/assets/js/appcall";

export default {
  name: "index",
  components: {
    nvHead,
  },
  data() {
    return {
    };
  },
  mounted() {
    try {
      window.console &&
        window.console.log &&
        (console.log(`加入超级头条前端研发部，你，可以影响世界。\n`),
        console.log("职位介绍 %c http://www.mokasz.com/job/", "color:#009a61"));
    } catch (e) {}
  },
  methods: {}
};
</script>

<style lang="less">
@import "../../../assets/css/colors";
.index {
  font-size: 0.34rem;
  text-align: center;
  line-height: 2rem;
}
</style>
