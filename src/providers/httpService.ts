import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/timeout';


@Injectable()


/**
 * Provider for Http services
 * @param  {Http}   http angular http access prvider
 */
export class HttpService {


    /** Class constructor.
      */
    constructor(public http: Http) {
    }

    /**
     * Generically performs a GET
     * @param  {string} url     complete target url
     * @param  {number} timeout request timeout in seconds
     * @return {Promise}        returns a promise
     */
    get = function(url:string, timeout:number) {
        var self = this;
        var header = new Headers();
        header.set('Content-Type', 'application/json');

        return new Promise(function(resolve, reject) {
            self.http.get(url, {headers:header})
            .timeout((timeout*1000))
            .subscribe(res => {
                  try{
                    var data = res.json(); // Add stats
                    // Add execution status and attrs
                    data.status = res.status;
                    data.statusText = res.statusText;
                    data.type = res.type;
                    data.url = res.url;
                    resolve(data);
                  }
                  catch(err){
                      reject( err );
                  }
              }, error => {
                  reject( error );
              }, () => {
              });
        }); // end return
    }


} // end class
