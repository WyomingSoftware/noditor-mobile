import {Component, Input} from '@angular/core';


@Component({
  selector: 'hints-selector',
  template: `
  <div class="_hints">
    <div class="_bold _primary _center" style="margin-top:5px;">
      Hints
    </div>
    <hr/>
    <p *ngFor="let hint of hints" [innerHTML]="hint"></p>
  </div>`
})


/**
 * Component to display hints.
 * Page usage:
   <hints-selector
     [hints]='arrayOfHints'>
   </hints-selector>
 */
export class HintsComponent{

    // List of hints to diplay, passed in by the selector
    @Input() hints:any;


}
