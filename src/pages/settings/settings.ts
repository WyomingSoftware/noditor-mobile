import { Component } from '@angular/core';
import { NavController, Events, Platform } from 'ionic-angular';
import { HintsComponent } from '../../components/hints';
import { AppVersion } from '@ionic-native/app-version';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  providers:[HintsComponent]
})


/**
 * App settings view.
 * @type {View}
 */
export class SettingsPage {


  demoServers:boolean;
  showHints:boolean;
  listRefresh:number;
  statsRefresh:number;
  version:string = 'Cordova not available';


  /**
   * Class constructor.
   * @param  {NavController} navCtrl Ionic navigation controller
   * @param  {Events}        events  Ionic events
   * @param  {AppVersion}    appVersion  Ionic native plugin
   * @param  {Platform}      platform  Ionic platform/cordova info
   */
  constructor(
    public navCtrl: NavController,
    public events:Events,
    appVersion:AppVersion,
    platform:Platform
  ) {
    this.demoServers = (window.localStorage.getItem("noditor.demoServers") === 'true');
    this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');
    this.listRefresh = parseInt(window.localStorage.getItem("noditor.listRefresh")) || 7;
    this.statsRefresh = parseInt(window.localStorage.getItem("noditor.statsRefresh")) || 7;
    
    if(platform.is('cordova')){
      var self = this;
      appVersion.getVersionNumber().then(function (data) {
          self.version = data;
      });
    }
  }


  /**
   * Sets the value of the list refrersh flag and sends out an event.
   */
  setListRefresh():void{
    window.localStorage.setItem("noditor.listRefresh", this.listRefresh.toString());
    this.events.publish('listRefresh:changed', this.listRefresh);
  }


  /**
   * Sets the value of the stats refrersh flag and sends out an event.
   */
  setStatsRefresh():void{
    window.localStorage.setItem("noditor.statsRefresh", this.statsRefresh.toString());
    this.events.publish('statsRefresh:changed', this.statsRefresh);
  }


  /**
   * Sets the value of the show demos flag and sends out an event.
   */
  setDemoServers():void{
    window.localStorage.setItem("noditor.demoServers", this.demoServers.toString());
    this.events.publish('demoServers:changed', this.demoServers);
  }


  /**
   * Sets the value of the show hints flag and sends out an event.
   */
  setShowHints(){
    window.localStorage.setItem("noditor.showHints", this.showHints.toString());
    this.events.publish('showHints:changed', this.showHints);
  }


}
