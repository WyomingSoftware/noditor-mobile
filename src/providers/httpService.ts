import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/timeout';


@Injectable()


export class HttpService {


    /** Class constructor.
      */
    constructor(public http: Http) {
    }


    get = function(url:string, timeout:number) {
        //console.log('%c\n======================= HttpService GET =======================', this.styles)
        var self = this;
        var header = new Headers();
        header.set('Content-Type', 'application/json');

        return new Promise(function(resolve, reject) {
            self.http.get(url, {headers:header})
            .timeout((timeout*1000))
            .subscribe(res => {
                  try{
                      //console.log(res)
                      //if(res.status == 204){ // No data in the query
                      //    resolve({status:204});
                      //}
                      //else{
                          var data = res.json();
                          //console.log(data)
                          data.status = res.status;
                          resolve(data);
                      //}
                  }
                  catch(err){
                      console.log('HttpService.get.subscribe.catch  =======================')
                      console.log(err)
                      reject( err );
                  }
              }, error => {
                  //console.log('GET.error  =======================')
                  //console.log(error)
                  reject( error );
              }, () => {
                  //console.log('finally')
              });
        });
    }


}
