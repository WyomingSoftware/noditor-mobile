import { Component } from '@angular/core';
import { ViewController, NavParams, ActionSheetController, Events,
  LoadingController } from 'ionic-angular';
import { MessageComponent } from '../../components/message';
import { HttpService } from '../../providers/httpService';
import { ServersService } from '../../providers/serversService';


@Component({
  template: `
    <ion-header>
      <ion-toolbar color="light">
        <!-- CANCEL -->
        <ion-buttons start>
          <button ion-button clear (click)="cancel($event)">
            <span ion-text color="primary">
                Cancel
            </span>
          </button>
        </ion-buttons>
        <ion-title>
          Server Setup
        </ion-title>
        <ion-buttons end>
          <button ion-button clear (click)="save($event)" [disabled]="canSubmit == false">
            <span ion-text color="primary">
                Save
            </span>
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>


    <ion-content>
      <ion-list>

        <ion-item>
          <ion-label floating class="_primary">Name</ion-label>
          <ion-input type="text" [(ngModel)]="theServer.name" (ngModelChange)="validate()"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label floating class="_primary">URL</ion-label>
          <ion-input type="text" [(ngModel)]="theServer.url" (ngModelChange)="validate()"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label floating class="_primary">Passcode (optional)</ion-label>
          <ion-input type="text" [(ngModel)]="theServer.passcode" (ngModelChange)="validate()"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label floating class="_primary">Path (optional)</ion-label>
          <ion-input type="text" [(ngModel)]="theServer.path" (ngModelChange)="validate()"></ion-input>
        </ion-item>

      </ion-list>


      <div class="_center">
        <button ion-button round small outline [disabled]="!theServer.url" (click)="testConnection($event)">
          Test Connection
        </button>
      </div>
      <div *ngIf="testMsg" class="_center _bold _green">
        <br/>{{testMsg}}
      </div>


      <div class="_gray" style="padding:0px 20px 20px 20px" *ngIf="showHints === true">
        <p>
          <b>Name:</b> A descriptive name for the server. For display purposes only.
        </p>
        <p>
          <b>URL:</b> The full URL to the server including the communication protocol (http or https).
          Include the port if not 80 or 443. Do not include any part of the URI or a query string.
          <br/><br/><span style="margin-left:20px">Example: https://www.noditor.com:8443</span>
        </p>
        <p>
          <b>Passcode:</b> If you started the Noditor Node Module with a passcode you
          will need to place it here.
        </p>
        <p>
          <b>Path:</b> This is a placeholder for your load balancer to use and direct the URL to the
          proper server. It is ignored by the Noditor Node Module.
          If you are not directing the URL with a load balancer leave this empty.
        </p>
      </div>


    </ion-content>
  `
})


export class ServerSetupModal {

  /*{ "key":"noditor-server-1",
      "name":"Demo Server #1",
      "path":null,
      "passcode":null,
      "url":"http://www.noditor.com"}
  */


  theServer:any;
  theServerCopy:any;
  name:string = "https"; // http or https
  url:string;
  path:string;
  passcode:string;
  canSubmit:boolean = false;
  testMsg:string;
  testError:boolean = false;
  showHints:boolean;


  constructor(public viewCtrl: ViewController,
        navParams:NavParams,
        public actionSheetCtrl:ActionSheetController,
        public msg:MessageComponent,
        public httpService:HttpService,
        public events:Events,
        public serversService:ServersService,
        public loadingCtrl:LoadingController) {

    this.theServer = navParams.get("server");
    // A server was passed, EDIT
    if(this.theServer){
      if(this.theServer.url && this.theServer.name ){
        //this.canSubmit = true;
        this.theServerCopy= Object.assign({}, this.theServer);

      }
    }
    // No server passed, ADD
    else{
      this.theServer = {key:Date.now().toString(), name:null, url:null, path:null, passcode:null};
      this.theServerCopy= Object.assign({}, this.theServer);
    }
    this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');
  }


  validate(){
    this.canSubmit = false;
    if( (this.theServer.name && this.theServer.url) &&
      (this.theServer.name != this.theServerCopy.name ||
      this.theServer.url != this.theServerCopy.url ||
      this.theServer.path != this.theServerCopy.path ||
      this.theServer.passcode != this.theServerCopy.passcode) ){
      this.canSubmit = true;
    }
  }


  save(){
    let errorMsg = 'Problem saving the server please try again.';
    try{
      this.serversService.set(this.theServer);
      this.events.publish('server:changed', this.theServer);
      this.viewCtrl.dismiss(this.theServer);
    }
    catch(error){
      this.msg.showError('ServerSetupModal.testConnection', errorMsg, error);
    }
  }


  cancel(event) {
    if(this.canSubmit){//if(this.theServer.url || this.theServer.name ){
      let actionSheet = this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'Discard Changes',
            role: 'destructive',
            handler: () => {
              this.viewCtrl.dismiss(null);
            }
          },{
            text: 'Continue',
            role: 'cancel'
          }
        ]
      });
      actionSheet.present();
    }
    else{
      this.viewCtrl.dismiss();
    }
  }


  testConnection(event){
    this.testMsg = null;
    let loader = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loader.present();

    this.httpService.get(this.theServer.url+'/noditor/'+this.theServer.path+'/'+this.theServer.passcode+'/top', 5)
    .then((data: any) => {
      //console.log('ServerSetup.testConnection.DATA', data, data.status)
      loader.dismiss();
      this.testMsg = "Connected"; // 200, 409, 500
    }).catch(error => {
      loader.dismiss();
      if(error.status === 409){ // Noditor paused
        this.testMsg = "Connected";
      }
      else{
        this.msg.showError('ServerSetupModal.testConnection', "Connection test failed > "+error.toString(), error);
      }
    });
  }



}
