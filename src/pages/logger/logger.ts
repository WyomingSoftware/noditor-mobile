import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { MessageComponent } from '../../components/message';
import { UTILS } from '../../providers/utils';


@Component({
  templateUrl: 'logger.html'
})


/** Page to display a simple log item passed as a parameter.
  */
export class LoggerPage{


  log:any;
  data:string;
  timer:any;


  /** Class constructor.
    *
    * log:object => any: log item to display
    */
  constructor(navParams:NavParams, msg:MessageComponent, public utils:UTILS) {
    try{
      this.log = navParams.get('log');
      //console.log('this.log', typeof this.log.error)
      //if(typeof this.log.data == 'object' || typeof this.log.data == 'string'){
        //this.log.data = JSON.stringify(this.log.data);
        // A little cleanup on the string to remove \n and \
        if(this.log.data){
          this.data = this.log.data.replace(/\\n/g, '');
          this.data = this.data.replace(/\\/g, '');
          this.data = this.data.replace(/<--->/g, '\n---------------\n');
        }
      //}
    }
    catch(err){
      msg.showMessage('Unable to display log details', err);
    }
  }


  /** Fired only once when the page first opens. Starts an interval that changes the timeAgo
    * display every 3 seconds.
    */
  ionViewDidLoad():void {
    this.timer = setInterval(() => {
        this.log.timeAgo = this.utils.timeAgo(this.log.dttm);
    }, 3000);
  }


  /** Fired when the page will be destroy (popped). Stops the timeAgo interval.
    */
  ionViewWillUnload(){
    clearInterval(this.timer);
  }


}
