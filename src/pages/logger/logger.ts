import { Component } from '@angular/core';
import { NavParams, Events } from 'ionic-angular';
import { MessageComponent } from '../../components/message';
import { UTILS } from '../../providers/utils';
import { HintsComponent } from '../../components/hints';


@Component({
  templateUrl: 'logger.html',
  providers:[HintsComponent]
})


/**
 * Displays a single log message.
 * @param  {NavParams}        navParams   Ionic navigation
 * @param  {MessageComponent} msg         Common message component
 * @param  {UTILS}            utils       Common timeago function
 * @param  {Events}           events      Ionic events
 */
export class LoggerPage{


  log:any;
  data:string;
  timer:any;
  showHints:boolean;


  /**
   * Class constructor.
   */
  constructor(
    navParams:NavParams,
    msg:MessageComponent,
    public utils:UTILS,
    private events:Events) {
    try{
      this.log = navParams.get('log');
      // A little cleanup on the string to remove \n and \
      if(this.log.data){
        this.data = this.log.data.replace(/\\n/g, '');
        this.data = this.data.replace(/\\/g, '');
        this.data = this.data.replace(/<--->/g, '\n---------------\n');
      }
      this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');
    }
    catch(err){
      msg.showMessage('Unable to display log details', err);
    }
  }


  /**
   * Fired only once when the page first opens. Starts an interval that changes the timeAgo
   * display every 3 seconds.
   */
  ionViewDidLoad():void {
    this.timer = setInterval(() => {
        this.log.timeAgo = this.utils.timeAgo(this.log.dttm);
    }, 3000);
    this.events.subscribe('showHints:changed', (flag) => {
      this.showHints = flag;
    });
  }


  /**
   * Fired when the page will be destroy (popped). Stops the timeAgo interval.
   */
  ionViewWillUnload():void{
    clearInterval(this.timer);
  }


}
