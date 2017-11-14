import {Component} from '@angular/core';
import { AlertController } from 'ionic-angular';
import { LoggerService } from '../providers/loggerService';

@Component({
  template: ''
})


/**
 * Displays alert boxes with info passed. In the case of showError the error is
 * also logged to the logger.
 * @param  {AlertController} alertCtrl     Ionic alert boxes
 * @param  {LoggerService}   loggerService Logger service to store messages
 */
export class MessageComponent{


  /** Class constructor.
    */
  constructor(
    public alertCtrl:AlertController,
    public loggerService:LoggerService
    ) {
  }


  /**
   * Logs an error to the logger and displays an alert message.
   * @param  {string} location code loaction, logger only
   * @param  {string} msg      message for the sub-title, brief
   * @param  {any}    error    error object
   */
  showError(location:string, msg:string, error:any):void{
    this.loggerService.set('error', location, msg, error);
    let alert = this.alertCtrl.create({
      title: 'Aw Snap...',
      subTitle: msg,
      message: error.toString(),
      buttons: ['Dismiss']
    });
    alert.present();
  }


  /**
   * Displays an alert message.
   * @param  {string} title alert box title
   * @param  {string} msg   message for the alert body
   */
  showMessage(title:string, msg:string):void{
    let alert = this.alertCtrl.create({
      title: title,
      message: msg,
      buttons: ['Dismiss']
    });
    alert.present();
  }


}
