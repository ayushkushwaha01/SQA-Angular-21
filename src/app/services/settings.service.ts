import { Injectable } from '@angular/core';

export class Settings {
  constructor(public name: string, 
              public loadingSpinner: boolean,
              public fixedHeader:boolean,
              public sidenavIsOpened: boolean,
              public sidenavIsPinned: boolean,
              public sidenavUserBlock: boolean,
              public menu: string,
              public menuType: string,
              public theme: string,
              public rtl: boolean,
              public hasFooter: boolean) { }
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public settings = new Settings(
    'SQA',       //theme name
    false,          //loadingSpinner
    true,           //fixedHeader
    true,           //sidenavIsOpened
    true,           //sidenavIsPinned  
    true,           //sidenavUserBlock 
    'horizontal',   //horizontal , vertical
    'default',      //default, compact, mini
    'indigo-light', //indigo-light, teal-light, red-light, blue-dark, green-dark, pink-dark
    false,          // true = rtl, false = ltr
    true            // true = has footer, false = no footer
  )

  constructor() { }
}
