import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, Events, LoadingController } from 'ionic-angular';
import { HttpService } from '../../providers/httpService';
import { Chart } from 'chart.js';
import { ServerSetupModal } from '../servers/server-setup';
import { HintsComponent } from '../../components/hints';
import { MessageComponent } from '../../components/message';


// https://www.joshmorony.com/adding-responsive-charts-graphs-to-ionic-2-applications/
@Component({
  selector: 'page-stats-details',
  templateUrl: 'stats-details.html',
  providers:[HintsComponent]
})
export class StatsDetailsPage {

  @ViewChild('heapChart') __heapChart;
  @ViewChild('externalChart') __externalChart;
  @ViewChild('osChart') __osChart;
  @ViewChild('cpuChart') __cpuChart;

  // Server properties from stats
  serverProperties:any = {nodeVersion:null, hostName:null, upTime:null};

  heapChart: any; // Heap
  heapLabels = [];
  heapUsed = [];
  heapTotal = [];
  rss = [];

  externalChart:any; // External
  externalLabels = [];
  external = [];

  osChart:any; // OS
  osLabels = [];
  osFreemem = [];

  cpuChart:any; // CPU
  cpuLabels = [];
  cpuProcessUser = [];
  cpuProcessSystem = [];

  serverName:string;
  server:any = {data:null};

  chartType:string; // heap, os, cpu
  timer:any;
  errorMsg:string;
  httpErrorFlag:boolean = false;
  loaded:boolean = false;
  showHints:boolean;


  constructor(public navCtrl: NavController,
      public httpService:HttpService,
      navParams:NavParams,
      public modalCtrl:ModalController,
      public events:Events,
      public loadingCtrl:LoadingController,
      private msg:MessageComponent) {

    this.server = navParams.get('server');
    this.serverName = this.server.name; // Need to draw title right away
    this.chartType = window.localStorage.getItem("noditor.lastChartType") || 'heap';
    this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');
  }


  ionViewDidEnter() {
    this.buildHeapChart(); // Init heapChart
    this.buildExternalChart(); // Init heapChart
    this.buildOsChart(); // Init osChart
    this.buildCpuChart(); // Init cpuChart

    let loader = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loader.present();
    this.load(loader);
    var self = this;
    this.timer = setInterval(function(){ self.load(null); }, 7000);
  }


  ionViewDidLoad(){
    try{
      this.events.subscribe('showHints:changed', this.setHintsFlagEventHandler);
    }
    catch(error){
      this.msg.showError('StatsDetailsPage.ionViewDidLoad', 'Failed to set events.', error);
    }
  }


  ionViewWillLeave(){
    try{
      clearInterval(this.timer);
    }
    catch(error){
      this.msg.showError('ServerSetupModal.ionViewWillLeave', 'Failed to clear interval.', error);
    }

  }


  ionViewWillUnload(){
    try{
      this.events.unsubscribe('showHints:changed', this.setHintsFlagEventHandler);
    }
    catch(error){
      this.msg.showError('ServerSetupModal.ionViewWillUnload', 'Failed to clear event.', error);
    }
  }

  /**
    *
    * data:boolean => flag
    */
  setHintsFlagEventHandler= (flag:any) => {
    console.log('ServerSetupModal.setHintsFlagEventHandler', flag)
    this.showHints = flag;
  }


  buildHeapChart(){
    this.heapChart = new Chart(this.__heapChart.nativeElement, {
      type: 'bar',
      maintainAspectRatio: false,
      data: {
          labels:this.heapLabels,
          datasets: [{
              label: 'Used',
              data: this.heapUsed,
              backgroundColor: "#A8A8A8"
          },
          {
              label: 'Total',
              data: this.heapTotal,
              type: 'line',
              fill:false,
              backgroundColor: "black",
              borderColor: "pink"
          },
          {
              label: 'RSS',
              data: this.rss,
              type: 'line',
              fill:false,
              hidden: true,
              backgroundColor: "blue",
              borderColor: "silver"
          }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            stacked: false,
            gridLines: {
              display: true,
              color: "rgba(255,99,132,0.2)"
            }
          }],
          xAxes: [{
            gridLines: {
              display: true
            }
          }]
        }
      }
    });
  }


  buildExternalChart(){
    this.externalChart = new Chart(this.__externalChart.nativeElement, {
      type: 'bar',
      maintainAspectRatio: false,
      data: {
          labels:this.externalLabels,
          datasets: [
          {
              label: 'External',
              data: this.external,
              backgroundColor: "pink",
              borderColor: "silver"
          }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            stacked: false,
            gridLines: {
              display: true,
              color: "rgba(255,99,132,0.2)"
            }
          }],
          xAxes: [{
            gridLines: {
              display: true
            }
          }]
        }
      }
    });
  }


  buildOsChart(){
    this.osChart = new Chart(this.__osChart.nativeElement, {
      type: 'line',
      maintainAspectRatio: false,
      data: {
          labels:this.osLabels,
          datasets: [
          {
              label: 'Free Memory GB',
              data: this.osFreemem,
              type: 'line',
              fill:false,
              backgroundColor: "black",
              borderColor: "pink"
          }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            stacked: true,
            gridLines: {
              display: true,
              color: "rgba(255,99,132,0.2)"
            }
          }],
          xAxes: [{
            gridLines: {
              display: true
            }
          }]
        }
      }
    });
  }


  buildCpuChart(){
    this.cpuChart = new Chart(this.__cpuChart.nativeElement, {
      type: 'line',
      maintainAspectRatio: false,
      data: {
          labels:this.cpuLabels,
          datasets: [
          {
              label: 'User Process',
              data: this.cpuProcessUser,
              type: 'line',
              fill:false,
              backgroundColor: "blue",
              borderColor: "pink"
          }, {
              label: 'System Process',
              data: this.cpuProcessSystem,
              type: 'line',
              fill:false,
              backgroundColor: "green",
              borderColor: "pink"
          }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            stacked: true,
            gridLines: {
              display: true,
              color: "rgba(255,99,132,0.2)"
            }
          }],
          xAxes: [{
            gridLines: {
              display: true
            }
          }]
        }
      }
    });
  }


  convertToMb = function(data) {
    try{
      return (data/1024/1024).toFixed(2);
    }
    catch(err){
      throw err;
    }
  };

  convertToGb = function(data) {
    try{
      return (data/1024/1024/1024).toFixed(2);
    }
    catch(err){
      throw err;
    }
  };


  convertTimestamp = function(millis) {
    try{
      millis =1000*Math.round(millis/1000); // round to nearest second
      var d = new Date(millis);

      var minutes = ("0" + d.getUTCMinutes()).slice(-2);
      var seconds = ("0" + d.getUTCSeconds()).slice(-2);
      return String(minutes + ':' + seconds);
    }
    catch(err){
      throw err;
    }
  }


  load(loader){
    this.errorMsg = null;
    this.httpErrorFlag = false;
    this.httpService.get(this.server.url+'/noditor/'+this.server.path+'/'+this.server.passcode+'/stats', 5)
    .then((data: any) => {
      try{
        console.log('StatsDetailsPage.load DATA', data)
        this.server.data = data;

        if(this.server.data.stats){ // stats may not have loaded at the server right at its startup
          this.server.data.peaks.peakHeapTotal = this.convertToMb(this.server.data.peaks.peakHeapTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          this.server.data.peaks.peakHeapUsed = this.convertToMb(this.server.data.peaks.peakHeapUsed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          this.server.data.peaks.peakHeapTotalDttm = new Date(this.server.data.peaks.peakHeapTotalDttm);
          this.server.data.peaks.peakHeapUsedDttm = new Date(this.server.data.peaks.peakHeapUsedDttm);

          for(let i=0; i<this.server.data.stats.length; i++){
            this.server.data.stats[i].memoryUsage.heapUsed = this.convertToMb(this.server.data.stats[i].memoryUsage.heapUsed);
            this.server.data.stats[i].memoryUsage.heapTotal = this.convertToMb(this.server.data.stats[i].memoryUsage.heapTotal);
            this.server.data.stats[i].memoryUsage.rss = this.convertToMb(this.server.data.stats[i].memoryUsage.rss);
            this.server.data.stats[i].memoryUsage.external = this.convertToMb(this.server.data.stats[i].memoryUsage.external);

            this.server.data.stats[i].osFreemem = this.convertToGb(this.server.data.stats[i].osFreemem);
            this.server.data.stats[i].process.user = (this.server.data.stats[i].process.user/1000000);
            this.server.data.stats[i].process.system = (this.server.data.stats[i].process.system/1000000);

            this.serverProperties.nodeVersion = this.server.data.stats[i].nodeVersion;
            this.serverProperties.hostName = this.server.data.stats[i].hostname;
            this.serverProperties.upTime = ( ((this.server.data.stats[i].uptime/60)/60)/24 ).toFixed(2); // days
          }

          if(this.chartType === 'heap'){this.graphHEAP();}
          else if(this.chartType === 'external'){this.graphEXTERNAL();}
          else if(this.chartType === 'os'){this.graphOS();}
          else if(this.chartType === 'cpu'){this.graphCPU();}



          this.loaded = true;
          if(loader) loader.dismiss();
        }
      }
      catch(error){
        console.log('HTTP.inner.error', error);
        if(loader) loader.dismiss();
        this.loaded = false;
        this.errorMsg = error.toString();
      }
    }).catch(error => {
      console.log('HTTP.outer.error ---', error);
      if(loader) loader.dismiss();
      this.loaded = false;
      this.server.data = {status:error.status, statusText:'Unknown error'};
      if(error.status === 0) this.server.data.statusText = "Unable to connect to the target server.";
      this.errorMsg = error.toString();
      this.httpErrorFlag = true;
    });
  }


  graphHEAP(){
    console.log('GRAPH HEAP');
    this.heapLabels = [];
    this.heapUsed = [];
    this.heapTotal = [];
    this.rss = [];

    for(let i=0; i<this.server.data.stats.length; i++){
      this.heapLabels.push( this.convertTimestamp(this.server.data.stats[i].dttm) );
      this.heapUsed.push(Number(this.server.data.stats[i].memoryUsage.heapUsed));
      this.heapTotal.push(Number(this.server.data.stats[i].memoryUsage.heapTotal));
      this.rss.push(Number(this.server.data.stats[i].memoryUsage.rss));
    }
    this.heapChart.data.labels = this.heapLabels;
    this.heapChart.data.datasets[0].data = this.heapUsed;
    this.heapChart.data.datasets[1].data = this.heapTotal;
    this.heapChart.data.datasets[2].data = this.rss;

    this.heapChart.update();
  }

  graphEXTERNAL(){
    console.log('GRAPH EXTERNAL');
    this.externalLabels = [];
    this.external = [];

    for(let i=0; i<this.server.data.stats.length; i++){
      this.externalLabels.push( this.convertTimestamp(this.server.data.stats[i].dttm) );
      this.external.push(Number(this.server.data.stats[i].memoryUsage.external));
    }
    this.externalChart.data.labels = this.externalLabels;
    this.externalChart.data.datasets[0].data = this.external;

    this.externalChart.update();
  }


  graphOS(){
    console.log('GRAPH OS');
    this.osLabels = [];
    this.osFreemem = [];

    for(let i=0; i<this.server.data.stats.length; i++){
      this.osLabels.push( this.convertTimestamp(this.server.data.stats[i].dttm) );
      this.osFreemem.push(Number(this.server.data.stats[i].osFreemem));
    }
    this.osChart.data.labels = this.osLabels;
    this.osChart.data.datasets[0].data = this.osFreemem;

    this.osChart.update();
  }

  graphCPU(){
    console.log('GRAPH CPU');
    this.cpuLabels = [];
    this.cpuProcessUser = [];
    this.cpuProcessSystem = [];

    for(let i=0; i<this.server.data.stats.length; i++){
      this.cpuLabels.push( this.convertTimestamp(this.server.data.stats[i].dttm) );
      this.cpuProcessUser.push(this.server.data.stats[i].process.user);
      this.cpuProcessSystem.push(this.server.data.stats[i].process.system);
    }
    this.cpuChart.data.labels = this.cpuLabels;
    this.cpuChart.data.datasets[0].data = this.cpuProcessUser;
    this.cpuChart.data.datasets[1].data = this.cpuProcessSystem;

    this.cpuChart.update();
  }


  segmentChanged(event){
    console.log(event._value, this.chartType);
    this.load(null);

    window.localStorage.setItem("noditor.lastChartType", this.chartType);
  }


}
