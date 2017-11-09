import { Component } from '@angular/core';
import { NavController, Events, ModalController, AlertController, LoadingController} from 'ionic-angular';
import { HttpService } from '../../providers/httpService';
import { ServersService } from '../../providers/serversService';
import { StatsDetailsPage } from '../stats/stats-details';
import { ServerSetupModal } from './server-setup';
import { MessageComponent } from '../../components/message';
import { HintsComponent } from '../../components/hints';


@Component({
  selector: 'page-servers',
  templateUrl: 'servers.html',
  providers:[HintsComponent]
})
export class ServersPage {

  servers = [];
  timer:any;
  timeoutValue:number = 7;
  showDemos:boolean;
  showHints:boolean;

  constructor(public navCtrl: NavController,
    public httpService:HttpService,
    public serversService:ServersService,
    public events:Events,
    public modalCtrl:ModalController,
    public msg:MessageComponent,
    private alertCtrl: AlertController,
    public loadingCtrl:LoadingController) {

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

      //console.log('>>>>>>> ServersPage');
    }
    catch(error){
      this.msg.showError('ServersPage.constructor', 'Failed to construct view.', error);
    }
  }


  ionViewDidLoad(){
    try{
      //console.log('ServersPage.ionViewDidLoad -----------------');
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


  ionViewDidEnter(){
    try{
      var self = this;
      //console.log('ServersPage.ionViewDidEnter -----------------');
      this.timer = setInterval(
        function(){self.refresh();
      }, this.timeoutValue * 1000);
      this.refresh();
    }
    catch(error){
      this.msg.showError('ServersPage.ionViewDidEnter', 'Failed to reset on re-enter.', error);
    }
  }


  ionViewWillLeave(){
    try{
      clearInterval(this.timer);
    }
    catch(error){
      this.msg.showError('ServersPage.ionViewWillLeave', 'Failed to clear interval timer.', error);
    }
  }


  serverChangedHandler = (server:any) => {
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


  loadServersFromStorage(){
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


  refresh(){
    try{
      for(var i=0; i<this.servers.length; i++){
        this.load(this.servers[i], null);
      }
    }
    catch(error){
      this.msg.showError('ServersPage.refresh', 'Failed to execute refresh.', error);
    }
  }


  convertToMb = function(data) {
    try{
      return (data/1024/1024).toFixed(2);
    }
    catch(err){
      throw err;
    }
  };


  load(server, loader){
    //console.log(server.url+'/noditor/'+server.path+'/'+server.passcode+'/top');
    if(loader){ loader.present(); }

    this.httpService.get(server.url+'/noditor/'+server.path+'/'+server.passcode+'/top', 5)
    .then((data: any) => {
      try{
        // console.log('ServersPage.load', data)
        if(loader) loader.dismiss();
        server.data = data;
        if(server.data.stats){ // stats may not have loaded at the server right at its startup
          server.data.stats.memoryUsage.heapUsed = this.convertToMb(server.data.stats.memoryUsage.heapUsed);
          server.data.stats.memoryUsage.heapTotal = this.convertToMb(server.data.stats.memoryUsage.heapTotal);
          server.data.stats.memoryUsage.rss = this.convertToMb(server.data.stats.memoryUsage.rss);
          server.data.peaks.peakHeapTotal = this.convertToMb(server.data.peaks.peakHeapTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          server.data.peaks.peakHeapUsed = this.convertToMb(server.data.peaks.peakHeapUsed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      }
      catch(error){
        server.data = {status:-1, statusText:error};
      }
    }).catch(error => {
      if(loader) loader.dismiss();
      server.data = {status:error.status, statusText:error.statusText};
      if(error.status === 0) server.data.statusText = "Unable to connect.";
      if(error.status === 409) server.data.statusText = "Paused";
    });
  }


  addServer(event){
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


  editServer(event, server){
    try{
      let modal = this.modalCtrl.create(ServerSetupModal, {server:Object.assign({}, server)});
      modal.onDidDismiss(data => { // Returns a server object
                                   // serverChangedHandler() updates the server attributes
        try{
          if(data){
            this.setRedrawServer(data)
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


  deleteServer(event, server){
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
                    this.servers.splice(i, 1);
                    this.serversService.remove(server.key);
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


  pauseOrResume(event, server, command){
    this.httpService.get(server.url+'/noditor/'+server.path+'/'+server.passcode+'/'+command, 5)
    .then((data: any) => {
      this.setRedrawServer(server);
    }).catch(error => {
      server.data = {status:error.status, statusText:error.statusText};
      if(error.status === 0) server.data.statusText = "Unable to connect.";
      if(error.status === 409) server.data.statusText = "Paused";
    });
  }



  /**
   * Finds a server by its key, set its attributes, and forces a redraw.
   * @param  string key [description]
   * @return none
   */
  setRedrawServer(server) {
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


  serverSelected(event, server){
    // Pass deep copy because the stats view will populate with different data from
    // the stats command where here we used th top command
    this.navCtrl.push(StatsDetailsPage, {server:Object.assign({}, server)});
  }


}
