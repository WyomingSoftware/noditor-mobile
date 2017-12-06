import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Events, LoadingController } from 'ionic-angular';
import { HttpService } from '../../providers/httpService';
import { UTILS } from '../../providers/utils';
import { Chart } from 'chart.js';
import { HintsComponent } from '../../components/hints';
import { MessageComponent } from '../../components/message';


// https://www.joshmorony.com/adding-responsive-charts-graphs-to-ionic-2-applications/
@Component({
  selector: 'page-stats-details',
  templateUrl: 'stats-details.html',
  providers:[HintsComponent]
})


/**
 * Display stats for a named server.
 * @type {View}
 */
export class StatsDetailsPage {


  // Do not use a double underscore in names of viewchild elements
  // This causes an undefined error when using the --prod flag for ionic build
  @ViewChild('heapChart') _heapChart: ElementRef;
  @ViewChild('externalChart') _externalChart: ElementRef;
  @ViewChild('osChart') _osChart: ElementRef;
  @ViewChild('cpuChart') _cpuChart: ElementRef;

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
  timeoutValue:number = 7;
  errorMsg:string;
  errorHints:boolean = false;
  loaded:boolean = false;
  showHints:boolean;


  /**
   * Class constructor.
   * @param  {NavController}     navCtrl     Ionic navigation controller
   * @param  {HttpService}       httpService Common service for http calls
   * @param  {NavParams}         navParams   Ionic parmeters
   * @param  {Events}            events      Ionic event
   * @param  {LoadingController} loadingCtrl Ionic loading controller
   * @param  {MessageComponent}  msg         Common service for alerts
   * @param  {UTILS}             utils       Common functions
   */
  constructor(public navCtrl: NavController,
      public httpService:HttpService,
      navParams:NavParams,
      public events:Events,
      public loadingCtrl:LoadingController,
      private msg:MessageComponent,
      private utils:UTILS) {

    this.server = navParams.get('server');
    this.serverName = this.server.name; // Need to draw title right away
    this.chartType = window.localStorage.getItem("noditor.lastChartType") || 'heap';
    this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');
    this.timeoutValue = parseInt(window.localStorage.getItem("noditor.statsRefresh")) || 7;
  }


  /**
   * Fires each time the view come to front. Preps the charts, loads the first chart
   * and sets the redraw timer.
   */
  ionViewDidEnter():void{ // ngAfterViewInit
    try{
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
      this.timer = setInterval(function(){ self.load(null); }, this.timeoutValue*1000);
    }
    catch(error){
      this.msg.showError('ServerSetupModal.ionViewDidEnter', 'Failed to init charts, load or start timer.', error);
    }
  }


  /**
   * Fires before leaving the view. Ends the redraw timer.
   */
  ionViewWillLeave():void{
    try{
      clearInterval(this.timer);
    }
    catch(error){
      this.msg.showError('ServerSetupModal.ionViewWillLeave', 'Failed to clear interval.', error);
    }
  }

  /**
   * Fires once when the view loads. Adds event subscriptions.
   */
  ionViewDidLoad():void{
    try{
      this.events.subscribe('showHints:changed', this.setHintsFlagEventHandler);
      this.events.subscribe('statsRefresh:changed', this.statsRefreshFlagEventHandler);
    }
    catch(error){
      this.msg.showError('StatsDetailsPage.ionViewDidLoad', 'Failed to set events.', error);
    }
  }

  /**
   * Fires once when the view loads. Removes event subscriptions.
   */
  ionViewWillUnload():void{
    try{
      this.events.unsubscribe('showHints:changed', this.setHintsFlagEventHandler);
      this.events.unsubscribe('statsRefresh:changed', this.statsRefreshFlagEventHandler);
    }
    catch(error){
      this.msg.showError('StatsDetailsPage.ionViewWillUnload', 'Failed to clear event.', error);
    }
  }

  /**
   * Event handler to change the showHints flag.
   */
  setHintsFlagEventHandler= (flag:any):void => {
    this.showHints = flag;
  }


  /**
   * Event handler to change the refresh timerValue. The timer will
   * reset with the new value as the view comes to the front if the user
   * stepped out to setting.
   */
  statsRefreshFlagEventHandler= (val:any):void => {
    this.timeoutValue = parseInt(val);
  }


  /**
   * Create an instance of the heap chart.
   */
  buildHeapChart():void{
    this.heapChart = new Chart(this._heapChart.nativeElement, {
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
            },
            scaleLabel: {
              display: true,
              labelString: 'MB',
            }
          }],
          xAxes: [{
            gridLines: {
              display: true
            },
            scaleLabel: {
              display: true,
              labelString: 'Time (min/secs)',
            }
          }]
        }
      }
    });
  }


  /**
   * Create an instance of the external chart.
   */
  buildExternalChart():void{
    this.externalChart = new Chart(this._externalChart.nativeElement, {
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
            },
            scaleLabel: {
              display: true,
              labelString: 'MB',
            }
          }],
          xAxes: [{
            gridLines: {
              display: true
            },
            scaleLabel: {
              display: true,
              labelString: 'Time (min/secs)',
            }
          }]
        }
      }
    });
  }


  /**
   * Create an instance of the os chart.
   */
  buildOsChart():void{
    this.osChart = new Chart(this._osChart.nativeElement, {
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
            },
            scaleLabel: {
              display: true,
              labelString: 'GB',
            }
          }],
          xAxes: [{
            gridLines: {
              display: true
            },
            scaleLabel: {
              display: true,
              labelString: 'Time (min/secs)',
            }
          }]
        }
      }
    });
  }


  /**
   * Create an instance of the cpu chart.
   */
  buildCpuChart():void{
    this.cpuChart = new Chart(this._cpuChart.nativeElement, {
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
            },
            scaleLabel: {
              display: true,
              labelString: 'Seconds',
            }
          }],
          xAxes: [{
            gridLines: {
              display: true
            },
            scaleLabel: {
              display: true,
              labelString: 'Time (min/secs)',
            }
          }]
        }
      }
    });
  }


  /**
   * Gets the stats for the server.
   * @param {LoadingController} loader diplays the loading controller if not null
   */
  load(loader):void{
    this.errorMsg = null;
    this.errorHints = false;

    // The path or passcode cannot be null
    var path = this.server.path;
    if(!this.server.path) path = '-';
    var passcode = this.server.passcode;
    if(!this.server.passcode) passcode = '-';

    this.httpService.get(this.server.url+'/noditor/'+path+'/'+passcode+'/stats', 5)
    .then((data: any) => {
      try{
        //console.log('StatsDetailsPage.load DATA', 'timer value >', this.timeoutValue, data)
        this.server.data = data;

        if(this.server.data.stats){ // stats may not have loaded at the server right at its startup
          this.server.data.peaks.peakHeapTotal = this.utils.convertToMB(this.server.data.peaks.peakHeapTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          this.server.data.peaks.peakHeapUsed = this.utils.convertToMB(this.server.data.peaks.peakHeapUsed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          this.server.data.peaks.peakHeapTotalDttm = new Date(this.server.data.peaks.peakHeapTotalDttm);
          this.server.data.peaks.peakHeapUsedDttm = new Date(this.server.data.peaks.peakHeapUsedDttm);

          for(let i=0; i<this.server.data.stats.length; i++){
            this.server.data.stats[i].memoryUsage.heapUsed = this.utils.convertToMB(this.server.data.stats[i].memoryUsage.heapUsed);
            this.server.data.stats[i].memoryUsage.heapTotal = this.utils.convertToMB(this.server.data.stats[i].memoryUsage.heapTotal);
            this.server.data.stats[i].memoryUsage.rss = this.utils.convertToMB(this.server.data.stats[i].memoryUsage.rss);
            this.server.data.stats[i].memoryUsage.external = this.utils.convertToMB(this.server.data.stats[i].memoryUsage.external);

            this.server.data.stats[i].osFreemem = this.utils.convertToGB(this.server.data.stats[i].osFreemem);
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
        if(loader) loader.dismiss();
        this.loaded = false;
        this.errorMsg = error.toString();
        this.errorHints = true;
      }
    }).catch(error => {
      if(loader) loader.dismiss();
      this.loaded = false;
      this.server.data = {status:error.status, statusText:error.statusText};
      if(error.name && error.name === 'TimeoutError'){
        this.errorMsg = error.name+' - Timeout error trying to connect';
        this.errorHints = true;
      }
      else if(error.status === 0) {
        this.errorMsg = this.server.data.status+' - Unable to connect';
        this.errorHints = true;
      }
      else if(error.status === 403) {
        this.errorMsg = this.server.data.status+' - '+JSON.parse(error._body).why; // No error Hints
      }
      else if(error.status === 409) {
        this.errorMsg = this.server.data.status+' - '+JSON.parse(error._body).why; // No error Hints
      }
      else if(error.status === 500) {
        this.errorMsg = this.server.data.status+' - '+JSON.parse(error._body).why; // No error Hints
      }
      else{
        this.errorMsg = this.server.data.status+' - '+this.server.data.statusText;
        this.errorHints = true;
      }
    });
  }


  /**
   * Populates the instance of the heap chart with data.
   */
  graphHEAP():void{
    this.heapLabels = [];
    this.heapUsed = [];
    this.heapTotal = [];
    this.rss = [];

    for(let i=0; i<this.server.data.stats.length; i++){
      this.heapLabels.push( this.utils.convertTimestamp(this.server.data.stats[i].dttm) );
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


  /**
   * Populates the instance of the external chart with data.
   */
  graphEXTERNAL():void{
    this.externalLabels = [];
    this.external = [];

    for(let i=0; i<this.server.data.stats.length; i++){
      this.externalLabels.push( this.utils.convertTimestamp(this.server.data.stats[i].dttm) );
      this.external.push(Number(this.server.data.stats[i].memoryUsage.external));
    }
    this.externalChart.data.labels = this.externalLabels;
    this.externalChart.data.datasets[0].data = this.external;

    this.externalChart.update();
  }


  /**
   * Populates the instance of the os chart with data.
   */
  graphOS():void{
    this.osLabels = [];
    this.osFreemem = [];

    for(let i=0; i<this.server.data.stats.length; i++){
      this.osLabels.push( this.utils.convertTimestamp(this.server.data.stats[i].dttm) );
      this.osFreemem.push(Number(this.server.data.stats[i].osFreemem));
    }
    this.osChart.data.labels = this.osLabels;
    this.osChart.data.datasets[0].data = this.osFreemem;

    this.osChart.update();
  }


  /**
   * Populates the instance of the cpu chart with data.
   */
  graphCPU():void{
    this.cpuLabels = [];
    this.cpuProcessUser = [];
    this.cpuProcessSystem = [];

    for(let i=0; i<this.server.data.stats.length; i++){
      this.cpuLabels.push( this.utils.convertTimestamp(this.server.data.stats[i].dttm) );
      this.cpuProcessUser.push(this.server.data.stats[i].process.user);
      this.cpuProcessSystem.push(this.server.data.stats[i].process.system);
    }
    this.cpuChart.data.labels = this.cpuLabels;
    this.cpuChart.data.datasets[0].data = this.cpuProcessUser;
    this.cpuChart.data.datasets[1].data = this.cpuProcessSystem;

    this.cpuChart.update();
  }


  /**
   * Changes the view segment between charts. Remebers the last segment displayed.
   * @param {Event} event Ionic event payload, ignored
   */
  segmentChanged(event:Event):void{
    try{
      let loader = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loader.present();
      this.load(loader);

      window.localStorage.setItem("noditor.lastChartType", this.chartType);
    }
    catch(error){
      this.msg.showError('StatsDetailsPage.segmentChanged', 'Failed to change segment.', error);
    }
  }


}
