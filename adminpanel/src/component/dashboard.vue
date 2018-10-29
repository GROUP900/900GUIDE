<template>
<div class="panels" v-if='display'>
  <h3>统计</h3>
  <div class="statistics">
    <p><span>周统计</span>Posts +{{count.week.posts}} / Comments +{{count.week.comments}} / Contributer +{{count.week.contributer}}</p>
    <p><span>总计</span>Posts {{count.total.posts}} / Comments {{count.total.comments}} / Contributers {{count.total.users}} / Tags {{count.total.tags}}</p>
  </div>
  <h3>日志</h3>
  <div class="log" v-for="log in logs" :key="log._id">
    <span class="type" v-once>{{log.type}}</span><span class="time">{{log.time}}</span>{{log.message}}
  </div>
  <button class="listbutton" @click="loadlogs">读取50条</button>
</div>
</template>

<script>
export default {
  name: 'dashboard',
  data() {
    return {
      logs: null,
      logpage: 0,
      count:{},
      display:false
    }
  },
  created: function() {
    this.ajax(this.apiUrl + 'su/logs/' + this.logpage).then((res) => {
      for(var i in res.data){
        res.data[i].time = new Date(res.data[i].time).toLocaleString().slice(5);
      }
      this.logs = res.data;
    })
    this.ajax(this.apiUrl + 'su/count/').then((res) => {
      this.count = res.data;
      this.display = true;
    })
  },
  methods: {
    loadlogs: function() {
      this.logpage++;
        this.ajax(this.apiUrl + 'su/logs/' + this.logpage).then((res) => {
          this.logs = this.logs.concat(res.data);
        })
    }
  }

}
</script>

<style scoped>
.dashedlink {
  margin-top: 20px;
}

h3 {
  margin: 20px 0 0 0!important;
}
</style>
