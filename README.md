
## Noditor Mobile App
The Noditor Mobile App accesses Node.js instances that have installed the Noditor Module. The app will
display high-level and simple runtime statistics.

The app is available for free for iOS and Android. The Noditor Module is also free. Its all free.




### Error: Cannot find module '@angular/tsc-wrapped/src/tsc'

Error received after updating to Ionic version 3.8.0. See this post https://github.com/ionic-team/ionic/issues/12357.

Fix:
```
npm install '@angular/tsc-wrapped --save
```
