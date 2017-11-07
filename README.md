
## Noditor Mobile



### Error: Cannot find module '@angular/tsc-wrapped/src/tsc'

Error received after updating to Ionic version 3.8.0. See this post https://github.com/ionic-team/ionic/issues/12357.

Fix:
```
npm install '@angular/tsc-wrapped --save
```
