import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { HttpService } from '../../providers/httpService';
import { Chart } from 'chart.js';
import { ServerSetupModal } from '../servers/server-setup';


// https://www.joshmorony.com/adding-responsive-charts-graphs-to-ionic-2-applications/
@Component({
  selector: 'page-stats-details',
  templateUrl: 'stats-details.html'
})
export class StatsDetailsPage {

  @ViewChild('barCanvas') barCanvas;
  barChart: any;

  //serverURL:any;
  serverName:string;
  server:any = {data:null};
  heapUsed = [];
  chartType:string;
  timer:any;

  labels = ["4:15", "5:00", "5:15", "5:30", "5:45", "6:00", "6:15","5:45", "6:00", "6:15"];

  constructor(public navCtrl: NavController,
      public httpService:HttpService,
      navParams:NavParams,
      public modalCtrl:ModalController,
      public events:Events) {

    this.server = navParams.get('server');
    this.serverName = this.server.name; // Need to draw title right away
    console.log('>>>>>>> StatsDetailsPage', this.server)
    this.chartType = window.localStorage.getItem("lastChartType") || 'process';
  }


  ionViewDidLoad(){
    this.events.subscribe('server:changed', this.serverChangedHandler);
  }

  ionViewDidEnter() {
    this.load();
    var self = this;
    this.timer = setInterval(function(){ self.load(); }, 7000);
  }


  ionViewWillLeave(){
    clearInterval(this.timer);
    this.events.unsubscribe('server:changed', this.serverChangedHandler);
  }


  serverChangedHandler = (server:any) => {
    console.log('StatsDetailsPage.serverChangedHandler', server)
    this.server.name = server.name;
    this.server.url = server.url;
    this.server.path = server.path;
    this.server.passcode = server.passcode;
  }


  buildChart(){
    /*var options = {
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
            display: false
          }
        }]
      }
    };*/
    //console.log(4, this.heapUsed)

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      maintainAspectRatio: false,
      data: {
          labels:this.labels,
          datasets: [{
              label: 'Process Memory',
              data: this.heapUsed,
              backgroundColor: "green",
              borderColor: "rgba(255, 99, 132, 2)"
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
              display: false
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


  load(){
    //console.log('StatsDetailsPage.load()', this.server.url+'/noditor/'+this.server.path+'/'+this.server.passcode+'/stats');
    this.httpService.get(this.server.url+'/noditor/'+this.server.path+'/'+this.server.passcode+'/stats', 5)
    .then((data: any) => {
      try{
        //console.log('StatsDetailsPage.load DATA', data)
        this.server.data = data;
        if(this.server.data.status != "200"){
          throw {statusText:"API did not return 200. "+this.server.data.status};
        }
        else{
            if(this.server.data.stats){ // stats may not have loaded at the server right at its startup
              this.server.data.peaks.peakHeapTotal = this.convertToMb(this.server.data.peaks.peakHeapTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              this.server.data.peaks.peakHeapUsed = this.convertToMb(this.server.data.peaks.peakHeapUsed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              this.server.data.peaks.peakHeapTotalDttm = new Date(this.server.data.peaks.peakHeapTotalDttm);
              this.server.data.peaks.peakHeapUsedDttm = new Date(this.server.data.peaks.peakHeapUsedDttm);

              for(let i=0; i<this.server.data.stats.length; i++){
                this.server.data.stats[i].memoryUsage.heapUsed = this.convertToMb(this.server.data.stats[i].memoryUsage.heapUsed);
                this.server.data.stats[i].memoryUsage.heapTotal = this.convertToMb(this.server.data.stats[i].memoryUsage.heapTotal);
                this.server.data.stats[i].memoryUsage.rss = this.convertToMb(this.server.data.stats[i].memoryUsage.rss);
              }

              this.heapUsed = []
              for(let i=0; i<this.server.data.stats.length; i++){
                this.heapUsed.push(Number(this.server.data.stats[i].memoryUsage.heapUsed));
              }
              this.buildChart();

            }
        }
      }
      catch(error){
        console.log('HTTP.inner.error', error);
      }
    }).catch(error => {
      console.log('HTTP.outer.error ---', error);
      console.log(this.server)
      this.server.data = {status:error.status, statusText:'Unknown error'};
      if(error.status === 0) this.server.data.statusText = "Unable to connect to the target server.";
      console.log('SERVER', this.server)
    });
  }


  segmentChanged($event){
    window.localStorage.setItem("lastChartType", this.chartType);
  }


  editServer(event, server){
    clearInterval(this.timer);
    let modal = this.modalCtrl.create(ServerSetupModal, {server:Object.assign({}, server)});
    modal.onDidDismiss(data => {
      if(server){
        this.serverName = server.name;
      }
      this.load();
      var self = this;
      this.timer = setInterval(function(){ self.load(); }, 7000);
     });
    modal.present();
  }

}
