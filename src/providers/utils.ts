import { Injectable } from '@angular/core';


@Injectable()


/**
 * Common functions
 */
export class UTILS {


  /**
   * Returns a "time ago" string repersenting the difference between now and
     * a dttm passsed.
   * @param  {string} dttm timestamp string
   * @return {string}      timestamp converted to seconds, minutes, etc as a string
   */
  timeAgo = function (dttm:string):string {
      let dttmSeconds = new Date(dttm).getTime()/1000;
      let nowSeconds = new Date().getTime()/1000;

      var seconds = Math.floor(((nowSeconds) - dttmSeconds )),
      interval = Math.floor(seconds / 31536000);

      if (interval > 1) return interval + "y";

      interval = Math.floor(seconds / 2592000);
      if (interval > 1) return interval + "mm";

      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval + "d";

      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval + "h";

      interval = Math.floor(seconds / 60);
      if (interval > 1) return interval + "m";

      return Math.floor(seconds) + "s";
  }


  /**
   * Converts the memory values to MB.
   * @param  {number} data [description]
   * @return {string}      MB
   */
  convertToMB = function(data):string {
    try{
      return (data/1024/1024).toFixed(2);
    }
    catch(err){
      throw err;
    }
  };


  /**
   * Converts the memory values to GB.
   * @param  {number} data [description]
   * @return {string}      MB
   */
  convertToGB = function(data):string {
    try{
      return (data/1024/1024/1024).toFixed(2);
    }
    catch(err){
      throw err;
    }
  };


  /**
   * Converts milliseconds to minutes:secs as a formatted time display.
   * @param  {number} millis milliseconds
   * @return {number}        MB
   */
  convertTimestamp = function(millis):string {
    try{
      millis =1000*Math.round(millis/1000); // round to nearest second
      var d = new Date(millis);

      var minutes = ("0" + d.getUTCMinutes()).slice(-2);
      var seconds = ("0" + d.getUTCSeconds()).slice(-2);
      return String(minutes + ':' + seconds);
    }
    catch(err){
      throw err;
    }
  }




}
