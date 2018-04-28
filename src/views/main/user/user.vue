<template>
  <div>
    <div class="user" >
        hello world
    </div>
 
  </div>
</template>

<script>
export default {
  name: "user",
  components: {},
  data() {
    return {};
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
.user {
  font-size: 0.34rem;
  text-align: center;
  line-height: 2rem;
}
</style>
