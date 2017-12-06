import { Component } from '@angular/core';
import { NavController, Events, ModalController, AlertController, LoadingController} from 'ionic-angular';
import { HttpService } from '../../providers/httpService';
import { ServersService } from '../../providers/serversService';
import { UTILS } from '../../providers/utils';
import { StatsDetailsPage } from '../stats/stats-details';
import { ServerSetupModal } from './server-setup';
import { MessageComponent } from '../../components/message';
import { HintsComponent } from '../../components/hints';


@Component({
  selector: 'page-servers',
  templateUrl: 'servers.html',
  providers:[HintsComponent]
})


/**
 * Diplays the list of servers known by hte serversService provider.
 * @type {View}
 */
export class ServersPage {


  servers = [];
  timer:any;
  timeoutValue:number = 7;
  showDemos:boolean;
  showHints:boolean;


  /**
   * Class constructor.
   * @param  {NavController}     navCtrl        Ionic naviagtion controller
   * @param  {HttpService}       httpService    Common http service
   * @param  {ServersService}    serversService Common servers service
   * @param  {Events}            events         Ionic events
   * @param  {ModalController}   modalCtrl      Ionic modals
   * @param  {MessageComponent}  msg            Common msg (alert) services
   * @param  {AlertController}   alertCtrl      Ionic alerts
   * @param  {LoadingController} loadingCtrl    Ionic loading controller
   * @param  {UTILS}             utils          Common functions
   */
  constructor(
    public navCtrl: NavController,
    public httpService:HttpService,
    public serversService:ServersService,
    public events:Events,
    public modalCtrl:ModalController,
    public msg:MessageComponent,
    private alertCtrl: AlertController,
    public loadingCtrl:LoadingController,
    private utils:UTILS) {

    try{
      // Load demo server flag
      if(window.localStorage.getItem("noditor.demoServers") == null){
        window.localStorage.setItem("noditor.demoServers", "true");
      }
      if(window.localStorage.getItem("noditor.showHints") == null){
        window.localStorage.setItem("noditor.showHints", "true");
      }
      this.showDemos = (window.localStorage.getItem("noditor.demoServers") === 'true');
      this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');
      this.timeoutValue = parseInt(window.localStorage.getItem("noditor.listRefresh")) || 7;
    }
    catch(error){
      this.msg.showError('ServersPage.constructor', 'Failed to construct view.', error);
    }
  }


  /**
   * Fires once for the life of the app. Loads teh server list, set up events.
   */
  ionViewDidLoad():void{
    try{
      this.loadServersFromStorage();

      this.events.subscribe('demoServers:changed', (flag) => {
        this.showDemos = flag;
        this.loadServersFromStorage();
      });
      this.events.subscribe('showHints:changed', (flag) => {
        this.showHints = flag;
      });
      this.events.subscribe('server:changed', this.serverChangedHandler);
      this.events.subscribe('listRefresh:changed', (val) => {
        this.timeoutValue = parseInt(val);
      });
    }
    catch(error){
      this.msg.showError('ServersPage.ionViewDidLoad', 'Failed to set view on load.', error);
    }
  }


  /**
   * Fires each time this view comes to the front. Starts the refresh timer
   * and refreshes the view.
   */
  ionViewDidEnter():void{
    try{
      var self = this;
      this.timer = setInterval(
        function(){self.refresh();
      }, this.timeoutValue * 1000);
      this.refresh();
    }
    catch(error){
      this.msg.showError('ServersPage.ionViewDidEnter', 'Failed to reset on re-enter.', error);
    }
  }


  /**
   * Fires each time the view is no longer active, goes to the background.
   * Clears the list refresh timer.
   */
  ionViewWillLeave():void{
    try{
      clearInterval(this.timer);
    }
    catch(error){
      this.msg.showError('ServersPage.ionViewWillLeave', 'Failed to clear interval timer.', error);
    }
  }


  /**
   * Events handler to update a server in the servers list.
   * @param  {object} event payload with server info
   */
  serverChangedHandler = (server:any):void => {
    // Find the server in the servers array and update
    try{
      for(var i=0; i<this.servers.length; i++){
        if(this.servers[i].key == server.key){
          this.servers[i].name = server.name;
          this.servers[i].url = server.url;
          this.servers[i].path = server.path;
          this.servers[i].passcode = server.passcode;
        }
      }
    }
    catch(error){
      this.msg.showError('ServersPage.serverChangedHandler', 'Failed to update server attributes.', error);
    }
  }


  /**
   * Gets the servers from the serversService (including demos if required).
   */
  loadServersFromStorage():void{
    this.serversService.get()
    .then((data: any) => {
      try{
        if(this.showDemos){
          let demos = this.serversService.getDemos();
          this.servers = demos.concat(data);
        }
        else {
          this.servers = data;
        }
        this.refresh();
      }
      catch(error){
        this.msg.showError('ServersPage.loadServersFromStorage.inner.error', 'Failed to load servers from storage.', error);
      }
    }).catch(error => {
      this.msg.showError('ServersPage.loadServersFromStorage.outer.error', 'Failed to load servers from storage.', error);
    });
  }


  /**
   * Refreshes the servers list stats for each server.
   */
  refresh():void{
    try{
      for(var i=0; i<this.servers.length; i++){
        this.load(this.servers[i], null);
      }
    }
    catch(error){
      this.msg.showError('ServersPage.refresh', 'Failed to execute refresh.', error);
    }
  }


  /**
   * Gets the stats for a server.
   * @param {object} server the server to get stats for
   * @param {LoadingController} loader Ionic loading controller, only presented if not null
   */
  load(server:any, loader:any):void{
    if(loader){ loader.present(); }

    // The path or passcode cannot be null
    var path = server.path;
    if(!server.path) path = '-';
    var passcode = server.passcode;
    if(!server.passcode) passcode = '-';

    this.httpService.get(server.url+'/noditor/'+path+'/'+passcode+'/top', 5)
    .then((data: any) => {
      try{
        //console.log('ServersPage.load', 'Timeout > ', this.timeoutValue, data)
        if(loader) loader.dismiss();
        server.data = data;
        if(server.data.stats){ // stats may not have loaded at the server right at its startup
          server.data.stats.memoryUsage.heapUsed = this.utils.convertToMB(server.data.stats.memoryUsage.heapUsed);
          server.data.stats.memoryUsage.heapTotal = this.utils.convertToMB(server.data.stats.memoryUsage.heapTotal);
          server.data.stats.memoryUsage.rss = this.utils.convertToMB(server.data.stats.memoryUsage.rss);
          server.data.peaks.peakHeapTotal = this.utils.convertToMB(server.data.peaks.peakHeapTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          server.data.peaks.peakHeapUsed = this.utils.convertToMB(server.data.peaks.peakHeapUsed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          server.data.stats.uptime = ( ((server.data.stats.uptime/60)/60)/24 ).toFixed(2); // days
        }
      }
      catch(error){
        server.data = {status:-1, statusText:error};
      }
    }).catch(error => {
      if(loader) loader.dismiss();
      server.data = {status:error.status, statusText:error.statusText};
      if(error.name && error.name ==='TimeoutError'){
        server.data = {status:0, statusText:'Timeout trying to connect'};
      }
      else if(error.status === 0) server.data.statusText = "Unable to connect.";
      else if(error.status === 403 || error.status === 409) {
        server.data.statusText = JSON.parse(error._body).why;
      }
      else if(error.status === 500) {
        server.data.statusText = JSON.parse(error._body).why;
      }
    });
  }


  /**
   * Opens a dialog (ServerSetupModal) to add a new server.
   * @param {Event} event Ionic event data, ignored
   */
  addServer(event:Event):void{
    try{
      let modal = this.modalCtrl.create(ServerSetupModal);
      modal.onDidDismiss(data => { // Returns a server object
                                   // serverChangedHandler() will not see the new server
        try{
          if(data) {
            this.servers.push(data);
            this.load(data, null)
          };
        }
        catch(error){
          this.msg.showError('ServersPage.addServer', 'Failed to add server.', error);
        } // end try-catch
      });
      modal.present();
    }
    catch(error){
      this.msg.showError('ServersPage.addServer', 'Failed to open dialog.', error);
    }
  }


  /**
   * Opens a dialog (ServerSetupModal) to update a server.
   * @param {Event}  event Ionic event data, ignored
   * @param {object} server and object with the server info
   */
  editServer(event:Event, server:any):void{
    try{
      let modal = this.modalCtrl.create(ServerSetupModal, {server:Object.assign({}, server)});
      modal.onDidDismiss(data => { // Returns a server object
                                   // serverChangedHandler() updates the server attributes
        try{
          if(data){
            this.setAndRedrawServer(data);
          }
        }
        catch(error){
          this.msg.showError('ServersPage.editServer', 'Failed to edit server.', error);
        } // end try-catch
      });
      modal.present();
    }
    catch(error){
      this.msg.showError('ServersPage.editServer', 'Failed to open dialog.', error);
    }
  }


  /**
   * Opens a confirmation dialog to delete a server.
   * @param {Event}   event  Ionic event data, ignored
   * @param {object}  server an object with the server info
   */
  deleteServer(event:Event, server:any):void{
    try{
      let alert = this.alertCtrl.create({
        title: 'Confirm delete',
        message: 'Do you want delete the server ('+server.name+')?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'Delete',
            handler: () => {
              try{
                for(var i=0; i<this.servers.length; i++){
                  if(this.servers[i].key == server.key){
                    try{
                      this.serversService.remove(server.key);
                      this.servers.splice(i, 1);
                    }
                    catch(err){
                      this.msg.showError('ServersPage.deleteServer', 'Failure to remove.', err);
                    }
                  }
                }
              }
              catch(error){
                this.msg.showError('ServersPage.deleteServer', 'Failed delete server.', error);
              } // end try-catch
            } // end handler
          }
        ]
      });
      alert.present();
    }
    catch(err){
      this.msg.showError('ServersPage.deleteServer', 'Failed to open alert.', err);
    }
  }


  /**
   * Pauses or resumes the Noditor Module at the server.
   * @param  {Event}  event  Ionic event data, ignored
   * @param  {object} server an object with the server info
   * @param  {string} command start or stop
   */
  pauseOrResume(event:Event, server:any, command:string):void{
    let loader = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loader.present();

    this.httpService.get(server.url+'/noditor/'+server.path+'/'+server.passcode+'/'+command, 5)
    .then((data: any) => {
      this.setAndRedrawServer(server);
      loader.dismiss();
    }).catch(error => {
      server.data = {status:error.status, statusText:error.statusText};
      if(error.status === 0) server.data.statusText = "Unable to connect.";
      if(error.status === 409) server.data.statusText = "Paused";
      loader.dismiss();
      this.msg.showError('ServersPage.pauseOrResume', 'Failed to execute the command.', error);
    });
  }


  /**
   * Updates the server object in the servers list (by key) and then orders a
   * reload of the server stats.
   * @param {object} server an object with the server info
   */
  setAndRedrawServer(server:any):void{
    try{
      for(var i=0; i<this.servers.length; i++){
        if(this.servers[i].key == server.key){
          let loader = this.loadingCtrl.create({
            content: 'Please wait...'
          });
          this.servers[i] = server;
          this.load(this.servers[i], loader);
        }
      }
    }
    catch(err){
      this.msg.showError('ServersPage.setRedrawServer', 'Failed to set server attributes.', err);
    }
  }


  /**
   * Moves to the StatsDetailsPage for the selected server.
   * @param {Event} event  Ionic event data, ignored
   * @param {any}   server an object with the server info
   */
  serverSelected(event:Event, server:any):void{
    // Pass deep copy because the stats view will populate with different data from
    // the stats command where here we used the top command
    this.navCtrl.push(StatsDetailsPage, {server:Object.assign({}, server)});
  }


}
