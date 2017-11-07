import {Component} from '@angular/core';
import { AlertController } from 'ionic-angular';
import { LoggerService } from '../providers/loggerService';

@Component({
  template: ''
})


export class MessageComponent{


  /** Class constructor.
    */
  constructor(
    public alertCtrl:AlertController,
    public loggerService:LoggerService
    ) {
  }


  /** Displays and error alert and pushes an error to the logger
    *
    * location:string => identifies the caller's location (class.method.etc)
    * msg:string => user friendly summary message to displayed
    * error:object => error object from caller, pushed to logger
    */
  showError(location, msg, error){
    this.loggerService.set('error', location, msg, error);
    let alert = this.alertCtrl.create({
      title: 'Aw Snap...',
      subTitle: msg,
      message: error.toString(),
      buttons: ['Dismiss']
    });
    alert.present();
  }


  /** Displays a simple alert dialog
    *
    * title:string => title for the dialog
    * msg:string => message for the dialog
    */
  showMessage(title, msg){
    let alert = this.alertCtrl.create({
      title: title,
      message: msg,
      buttons: ['Dismiss']
    });
    alert.present();
  }


}
