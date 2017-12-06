import { Component } from '@angular/core';
import { ViewController, NavParams, ActionSheetController, Events,
  LoadingController } from 'ionic-angular';
import { MessageComponent } from '../../components/message';
import { HttpService } from '../../providers/httpService';
import { ServersService } from '../../providers/serversService';
import { HintsComponent } from '../../components/hints';


@Component({
  providers:[HintsComponent],
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


    <ion-content padding>
      <ion-list>

        <ion-item>
          <ion-label floating class="_primary">Name</ion-label>
          <ion-input type="text" [(ngModel)]="theServer.name" (ngModelChange)="validate()"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label floating class="_primary">URL</ion-label>
          <ion-input type="url" [(ngModel)]="theServer.url" (ngModelChange)="validate()"></ion-input>
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


    <!-- HINTS -->
    <br/><br/>
      <hints-selector *ngIf="showHints === true"
          [hints]="['<b>Name:</b> A descriptive name for the server. For display purposes only.',

          '<b>URL:</b> The full URL to the server including the communication protocol (http or https).
          Include the port if not 80 or 443. Do not include any part of an endpoint call or a query string.
          <br/><br/>&nbsp;&nbsp;&nbsp;Example: https://www.noditor.com:8443',

          '<b>Passcode:</b> If the Noditor Module was stated with a passcode, place it here.',

          '<b>Path:</b> This is a placeholder for a load balancer to use and direct the URL to the
          proper server. It is ignored by the Noditor Module.
          Leave this empty when not directing the URL via a load balancer.']">
      </hints-selector>

    </ion-content>
  `
})


/**
 * Creates or updates a new server.
 * @type {Modal}
 */
export class ServerSetupModal {

  /*
    { "key":"noditor-server-1",
      "name":"Demo Server #1",
      "path":null,
      "passcode":null,
      "url":"http://www.noditor.com"
    }
  */

  theServer:any; // server to update, or template for create server
  theServerCopy:any; // For diff comparison
  name:string = "https"; // http or https
  url:string;
  path:string;
  passcode:string;
  canSubmit:boolean = false;
  testMsg:string;
  testError:boolean = false;
  showHints:boolean;


  /**
   * Class constructor
   * @param  {ViewController}        viewCtrl        Ionic View Controller, to dismiss this view
   * @param  {NavParams}             navParams       Ionic nav parameters
   * @param  {ActionSheetController} actionSheetCtrl Ionic action sheet
   * @param  {MessageComponent}      msg             Common service for alerts
   * @param  {HttpService}           httpService     Common service for http calls
   * @param  {Events}                events          Ionic events
   * @param  {ServersService}        serversService  Common service for servers
   * @param  {LoadingController}     loadingCtrl     Ionic loading controller
   */
  constructor(
      public viewCtrl: ViewController,
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
        this.theServerCopy= Object.assign({}, this.theServer);
      }
    }
    // No server passed, ADD
    else{
      this.theServer = {key:Date.now().toString(), name:null, url:null, path:null, passcode:null};
      this.theServerCopy= Object.assign({}, this.theServer);
    }
    // No need to set event for changes @Setting when showHints changes
    // because this is a modal view.
    this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');
  }


  /**
   * Validates data entry and enables the Save button when conditions are right.
   */
  validate():void{
    this.canSubmit = false;
    if( (this.theServer.name && this.theServer.url) &&
      (this.theServer.name != this.theServerCopy.name ||
      this.theServer.url != this.theServerCopy.url ||
      this.theServer.path != this.theServerCopy.path ||
      this.theServer.passcode != this.theServerCopy.passcode) ){
      this.canSubmit = true;
    }
  }


  /**
   * Saves the server vis the serversService provider.
   */
  save():void{
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


  /**
   * Prompts the user to cancel if there are data changes.
   * If there are no data changes then closes the dialog.
   * @param {Event} event Ionic event data, ignored
   */
  cancel(event:Event):void{
    if(this.canSubmit){
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


  /**
   * Attempts to test the connection for the server.
   * @param {Event} event Ionic event data, ignored
   */
  testConnection(event):void{
    this.testMsg = null;
    let loader = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loader.present();

    // The path or passcode cannot be null
    var path = this.theServer.path;
    if(!this.theServer.path) path = '-';
    var passcode = this.theServer.passcode;
    if(!this.theServer.passcode) passcode = '-';

    this.httpService.get(this.theServer.url+'/noditor/'+path+'/'+passcode+'/top', 5)
    .then((data: any) => {
      loader.dismiss();
      this.testMsg = "Connected";
    }).catch(error => {
      loader.dismiss();
      if(error.status === 409){ // 409 - Noditor paused
        this.testMsg = "Connected";
      }
      else{
        this.msg.showError('ServerSetupModal.testConnection', "Connection test failed > "+error.toString(), error);
      }
    });
  }


}
