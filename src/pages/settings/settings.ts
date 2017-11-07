import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {


  demoServers:boolean;
  showHints:boolean;
  listRefresh:number;
  statsRefresh:number;


  constructor(public navCtrl: NavController, public events:Events) {
    this.demoServers = (window.localStorage.getItem("noditor.demoServers") === 'true');
    this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');
    this.listRefresh = parseInt(window.localStorage.getItem("noditor.listRefresh")) || 7;
    this.statsRefresh = parseInt(window.localStorage.getItem("noditor.statsRefresh")) || 7;
  }



  setListRefresh(){
    window.localStorage.setItem("noditor.listRefresh", this.listRefresh.toString());
    this.events.publish('listRefresh:changed', this.listRefresh);
  }


  setStatsRefresh(){
    window.localStorage.setItem("noditor.statsRefresh", this.statsRefresh.toString());
    this.events.publish('statsRefresh:changed', this.statsRefresh);
  }


  setDemoServers(){
    window.localStorage.setItem("noditor.demoServers", this.demoServers.toString());
    this.events.publish('demoServers:changed', this.demoServers);
  }


  setShowHints(){
    window.localStorage.setItem("noditor.showHints", this.showHints.toString());
    console.log(this.showHints, typeof this.showHints)
    this.events.publish('showHints:changed', this.showHints);
  }


}
