<template>
    <div class="loading" v-show="loading" >
    	<div class="indicator" style="display:none;">
            <div class="indicator-water">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div> 
            <div class="indicator-mask"></div>
        </div>
    </div>
</template>
<script>
export default {
  replace: true,
  data() {
    return {};
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  mounted() {},
  methods: {}
};
</script>
<style  lang="less" scoped>
.indicator {
  transition: opacity 0.2s linear;
}
.indicator-water{
  position: fixed;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  text-align: center;
  line-height: 120px;
  span{
    display: inline-block;
    vertical-align: middle;
    width: 8px;
    border-radius: 4px;
    background: transparent;
    animation: water 1s ease infinite;
    -webkit-animation: water 1s ease infinite;
    &:nth-child(2){
        animation-delay:0.2s;
    }
    &:nth-child(3){
        animation-delay:0.4s;
    }
    &:nth-child(4){
        animation-delay:0.6s;
    }
    &:nth-child(5){
        animation-delay:0.8s;
    }
  }
}
.indicator-wrapper {
  top: 50%;
  left: 50%;
  position: fixed;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.65);
  color: white;
  box-sizing: border-box;
  text-align: center;
  width: 120px;
  height: 120px;
}
.indicator-spin {
  display: inline-block;
  text-align: center;
  margin: 25px auto 0;
}
.indicator-text {
  display: block;
  color: #fff;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  word-break: break-all;
  word-wrap: break-word;
  white-space: normal;
}

@keyframes water{
    0%,100%{
        height: 40px;
        background: #eee;
    }
    50%{
        height: 70px;
        margin: -15px 0;
        background: #ddd;
    }
}

@keyframes spinner-rotate {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-webkit-keyframes spinner-rotate {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
.spinner-snake {
  -webkit-animation: spinner-rotate 0.8s infinite linear;
  animation: spinner-rotate 0.8s infinite linear;
  border: 4px solid transparent;
  border-radius: 50%;
}
.indicator-mask {
  top: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  opacity: 0;
  background: transparent;
}
</style>