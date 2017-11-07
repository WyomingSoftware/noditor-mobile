import { Injectable } from '@angular/core';


@Injectable()


/** Misc common functions
  */
export class UTILS {


  /** Returns a "time ago" string repersenting the difference between now and
    * a dttm passsed.
    *
    * dttm => timestamp: date/time to subtract from now
    */
  timeAgo = function (dttm) {
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


  /** Converts a unix timestamp to a human readable DTTM string.
    *
    * ts:number => unix timestamp
    */
  convertUnixTimestamp(ts){
    try{
      var date = new Date(ts*1000);
      var year = date.getFullYear();
      var month = ("0"+(date.getMonth()+1)).substr(-2);
      var day = ("0"+date.getDate()).substr(-2);
      var hour = ("0"+date.getHours()).substr(-2);
      var minutes = ("0"+date.getMinutes()).substr(-2);
      var seconds = ("0"+date.getSeconds()).substr(-2);

      var hours = date.getHours();
      var ampm = hours >= 12 ? 'PM' : 'AM'

      return month+"/"+day+"/"+year+" "+hour+":"+minutes+":"+seconds+" "+ampm;
    }
    catch(err){
      return 'UnixTimestamp not converted';
    }
  }

}
