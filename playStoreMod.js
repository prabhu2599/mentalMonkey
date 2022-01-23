// ==UserScript==
// @name         Direct download from Google Play
// @name:it      Download diretto dal Google Play Store
// @namespace    StephenP
// @version      2.9.9
// @description  Adds APK-DL, APKPure, APKCombo, APKPremier, APKMirror and Evozi download buttons to Google Play Store when browsing apps.
// @description:it  Aggiunge i tasti di download di APK-DL, APKPure, APKCombo, APKPremier, APKMirror e Evozi al Google Play Store quando si naviga tra le applicazioni.
// @author       StephenP
// @icon      data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAM1BMVEV2ZXLgIkzxMUf6OkN9f5v7ZTAOpP8OxP4myPsU1LkU1P4k4oAr3vwk7H1U41v+ziz92jIMI6b6AAAAAXRSTlMAQObYZgAAAKtJREFUOMul0ssSgyAMQNGAtCgv/f+vLcVCSCLiTLPL3MPAAoAn4/0EbP6eWDsRaxEx3gG7xe+MAIo4ABPhiIjXoBeCOCEiB0IkDphI+3EwQETaM+iIYyL3AhpxVKT3OSgCEeaFACgowiyLBE241WgE7ZEBhdFaVwA9CNi1vgQB+wCE1kcg1A4DQO6n5uxKleMgO/x6nrKKDrXX/eINpstV9D+G9SLIruCP+QAbnhEp2bGFogAAAABJRU5ErkJggg==
// @match        https://play.google.com/*
// @match        http://play.google.com/*
// @match        http://apkfind.com/store/captcha?app=*
// @grant        GM.xmlHttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @connect      self
// @connect      apkpure.com
// @connect      apkfind.com
// @connect      apk-cloud.com
// @connect      winudf.com
// @connect      apkcombo.com
// @connect      down-apk.com
// @connect      play.googleapis.com
// @connect      gvt1.com
// @connect      apkpremier.com
// @contributionURL https://nowpayments.io/donation/stephenpgreasyfork
// ==/UserScript==
var ui;
var wlButton;
var pageURL;
var title;
var appCwiz;
var done=[0];
var useGS;
(async function(){
  useGS=await GM.getValue("useGS", false);
  starter();
})();
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  window.trustedTypes.createPolicy('default', {
    createHTML: (string, sink) => string
  });
}
function starter() {
  if(document.location.href.includes("apkfind")===true){
    setInterval(unredirect,100);
  }
  else{
    try{
      'use strict';
      var site=window.location.href.toString();
      ui=checkUI();
      pageURL=location.href;
      if(ui>0){
      	title=document.getElementById("main-title").innerHTML;
      }
      if(ui>=3){
        var buttonsStyle=document.createElement("style");
        var styleString='.ddlButton:visited{color: white;} .ddlButton:hover{opacity: 0.8;} .ddlButton:active{opacity: 0.6;} .ddlButton{color: white; border-radius: 4px; border: 1px; font-size: 14px; height: 46px; padding: 9px 20px; font-weight: 500; font-family: "Roboto",sans-serif; position: relative; text-align: center; line-height: 46px;';
        if(ui==3){
          styleString+=' margin-right: 4px;}';
          buttonsStyle.textContent=styleString;
        }
        if(ui==4){
          styleString+=' margin-left: 4px;}';
          buttonsStyle.textContent=styleString;
        }
        document.body.appendChild(buttonsStyle);
      }
      if(pageURL.includes("details?id=")){
        addButtons();
      }
      setInterval(checkReload, 2000);
    }
    catch(err){
      console.log("main(): "+err);
    }
	}
}
function unredirect(){
    var tot=document.body.children.length-1;
    if(parseInt(document.body.children[tot].style.zIndex, 10)>2){
      if(document.body.children[tot].id==""){
        document.body.children[tot].style.zIndex="1";
        document.body.children[tot-1].style.zIndex="-1000";
      }
      else{
        document.body.children[tot].style.zIndex="-1000";
      }
    }
}
function waitForRemovingButtons(){
    //if(title!=document.getElementById("main-title").innerHTML){
  	if((pageURL!=location.href)||(isButtonVisible()===false)){
        title=document.getElementById("main-title").innerHTML;
        pageURL=location.href;
        wlButton=null;
        if(location.href.includes("details?id=")){
            if((ui>=3)&&(document.getElementsByClassName("ddlButton").length>0)){
              	try{
                	removePreviousCwiz();
                }
              	catch(err){
                  console.log(err+"; I was probably just trying to remove buttons that weren't there...");
                }
            }
            addButtons();
        }
    }
    else{
        setTimeout(waitForRemovingButtons, 1000);
    }
}
function checkReload(){
    if((pageURL!=location.href)||(isButtonVisible()===false)){
            waitForRemovingButtons();
    }
}
function isButtonVisible(){
  var allButtons=document.getElementsByClassName("ddlButton");
  //console.log("how many buttons: "+allButtons.length);
  if(allButtons.length>0){
    for(var i=0;i<allButtons.length;i++){
      if(allButtons[i].offsetParent!=null){
        //console.log(i+true);
        return true;
      }
    }
    //console.log(i+false);
    return false;
  }
  else{
    if(document.location.href.includes("play.google.com/store/apps/details")){
      console.log("apppage//"+false);
      return false;
    }
    //console.log("notapppage//"+false);
    return true;
  }
}
function addButtons(){
    var price=-1;
    var installButton=null;
    var instWishButtons=[];
    if((ui<=2)&&(ui>0)){
        installButton=document.getElementsByClassName("buy")[0];
      	try{
        	price=installButton.firstElementChild.firstElementChild.getElementsByTagName("META")[1].content;
          //alert("Price: "+price);
        }
        catch(err){
          console.error("Price not found. Maybe the app is already installed?");
          price=0;
        }
    }
    else if(ui>2){
        instWishButtons=getUglyUIButtons();
        if(ui==3){
        	installButton=instWishButtons[0];
        }
        else{
          installButton=instWishButtons[1];     
          if((typeof installButton==='undefined')||(!installButton.getAttribute("data-item-id").includes(location.search.match(/id=(.*)/)[1].split("&", 1)))){//Condition 1: if the app is installed, the whishlist button is absent, so the install button is the first and only.
            installButton=instWishButtons[0];              //Condition 2: if the app is not yet released, there is only a wishlist button.
          }
        }
        do{
            installButton=installButton.parentNode;
        }while(installButton.tagName!="C-WIZ");
        try{
      		price=installButton.firstElementChild.firstElementChild.getElementsByTagName("META")[1].content;
          //alert("Price: "+price);
        }
      	catch(err){
          console.error("Price not found. Maybe the app is already installed?");
          price=0;
        }
        //determina c-wiz dell'app per poterlo radere al suolo al cambio di pagina
        var currentNode;
        currentNode=installButton.parentNode;
        do{
            if(currentNode.tagName=="C-WIZ"){
                appCwiz=currentNode;
            }
            currentNode=currentNode.parentNode;
        }while(currentNode.tagName!="BODY");
    }
  	else{
      document.getElementById("search-section").lastChild.remove();
      let searchSection=document.getElementById("search-section");
      let x=document.createElement("SPAN");
      x.style="margin-top: 32px; float: left";
      x.textContent="or ";
      searchSection.appendChild(x);
      let y=document.createElement("SPAN");
      let z=document.createElement("A");
      z.style="background-color: #FF8B14; font-weight: bold; text-decoration: none; padding: 1em; margin: 17px; float: left; color: white; cursor: pointer;";
      z.textContent="Search on APKMirror";
      z.className="rounded";
      z.id="apkMirrorBtn";
      //z.href='https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s='+location.search.match(/id=(.*)/)[1].split("&", 1);
      let apkmirrorURL='https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s='+location.search.match(/id=(.*)/)[1].split("&", 1);
      z.addEventListener("click",function opn(){window.open(apkmirrorURL)});
      y.appendChild(z);
      searchSection.appendChild(y);
      let w=document.createElement("DIV");
      w.style="clear:both";
      searchSection.appendChild(w);
      GM.xmlHttpRequest({
        method: "GET",
        url: 'https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s='+location.search.match(/id=(.*)/)[1].split("&", 1),
        timeout: 5000,
        onload: function(response){
       		let parser = new DOMParser();
     			let doc = parser.parseFromString(response.responseText, "text/html");
          if(doc.getElementById("content").getElementsByClassName("appRow").length>0){
            z.textContent="Available on APKMirror";
          }
          else{
            let w=z.cloneNode(true);
            w.textContent="Not available on APKMirror";
            w.style.backgroundColor="#CCCCCC";
            w.style.cursor="not-allowed";
            z.parentNode.replaceChild(w, z);
          }
     		}
      });
    }
    if(price==0){
      var html;
      var buttonslist;
      var id=location.search.match(/id=(.*)/)[1].split("&", 1);
      var apkpureURL='https://m.apkpure.com/genericApp/'+id+'/download';
      var evoziURL='https://apps.evozi.com/apk-downloader/?id='+id;
      var apkdlURL='http://apkfind.com/store/download?id='+id;
      var apkmirrorURL='https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s='+id;
      var apkleecherURL='https://apkleecher.com/download/dl.php?dl='+id;
      var apkcomboURL='https://apkcombo.com/genericApp/'+id+'/download/apk';
      var apkpremierURL='https://apkpremier.com/download/'+id.toString().replace(/[.]/g,"-");
      wlButton = document.createDocumentFragment();
      var wishListButton;
      if(ui<=2){
        wishListButton=document.getElementsByClassName("id-wishlist-display")[0];
      }
      else{
        if(typeof instWishButtons[1]!=='undefined'){
          wishListButton=instWishButtons[0];
          do{
            wishListButton=wishListButton.parentNode;
          }while(wishListButton.tagName!="C-WIZ");
        }
      }
      var cn="";
      if(ui==1){
        buttonslist = document.getElementsByClassName("details-actions")[0];
        cn="medium play-button download-apk-button apps";
      }
      else if(ui==2){
        buttonslist = document.getElementsByClassName("details-actions-right")[0];
        cn="large play-button download-apk-button apps";
      }
      else{
        buttonslist = installButton.parentNode;
      	cn="ddlButton";
      }
      let b1=document.createElement("span");
      b1.id="apkdlbutton";
      let b1a=document.createElement("A");
      b1a.style.backgroundColor="#009688";
      b1a.className=cn;
      b1a.textContent="APK-DL";
      b1.appendChild(b1a);
      //
      let b2=document.createElement("span");
      b2.id="apkpurebutton";
      let b2a=document.createElement("A");
      b2a.style.backgroundColor="#24cd77";
      b2a.className=cn;
      b2a.textContent="APKPure";
      b2.appendChild(b2a);
      //
      let b3=document.createElement("span");
      b3.id="apkcombobutton";
      let b3a=document.createElement("A");
      b3a.style.backgroundColor="#00875f";
      b3a.className=cn;
      b3a.textContent="APKCombo";
      b3.appendChild(b3a);
      //
      let b4=document.createElement("span");
      b4.id="apkpremierbutton";
      let b4a=document.createElement("A");
      b4a.style.backgroundColor="#3740ff";
      b4a.className=cn;
      b4a.textContent="APKPremier";
      b4.appendChild(b4a);
      //
      let b5=document.createElement("span");
      let b5a=document.createElement("A");
      b5a.addEventListener("click",function(){window.open(evoziURL)});
      b5a.style.backgroundColor="#286090";
      b5a.className=cn;
      b5a.textContent="Evozi";
      b5.appendChild(b5a);
      //
      const svg = `<svg viewBox="0 0 512 512"><path d="M472,313v139c0,11.028-8.972,20-20,20H60c-11.028,0-20-8.972-20-20V313H0v139c0,33.084,26.916,60,60,60h392 c33.084,0,60-26.916,60-60V313H472z"></path></g></g><g><g><polygon points="352,235.716 276,311.716 276,0 236,0 236,311.716 160,235.716 131.716,264 256,388.284 380.284,264"></polygon></svg>`;

      let b6=document.createElement("span");
      let b6a=document.createElement("A");
      b6a.addEventListener("click",function(){window.open("google.com")});
      b6a.style.backgroundColor="#0A66EB";
      //b6a.innerHTML = svg;
      b6a.className=cn;
      b6a.textContent="Prabhu Gantayat Mirror";
      b6.appendChild(b6a);
      
      ////
      let b7=document.createElement("span");
      let elem_button = document.createElement("A"); //Anchor tag
      elem_button.addEventListener("click",function(){window.open("google.com")});
      //This is the icon. It's the easiest way to do this, and keep it shareable.
      elem_button.innerHTML = "<img style=\"max-width: 20px;\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjQzOC41MzNweCIgaGVpZ2h0PSI0MzguNTMzcHgiIHZpZXdCb3g9IjAgMCA0MzguNTMzIDQzOC41MzMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQzOC41MzMgNDM4LjUzMzsiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGQ9Ik00MDkuMTMzLDEwOS4yMDNjLTE5LjYwOC0zMy41OTItNDYuMjA1LTYwLjE4OS03OS43OTgtNzkuNzk2QzI5NS43MzYsOS44MDEsMjU5LjA1OCwwLDIxOS4yNzMsMA0KCQkJYy0zOS43ODEsMC03Ni40Nyw5LjgwMS0xMTAuMDYzLDI5LjQwN2MtMzMuNTk1LDE5LjYwNC02MC4xOTIsNDYuMjAxLTc5LjgsNzkuNzk2QzkuODAxLDE0Mi44LDAsMTc5LjQ4OSwwLDIxOS4yNjcNCgkJCWMwLDM5Ljc4LDkuODA0LDc2LjQ2MywyOS40MDcsMTEwLjA2MmMxOS42MDcsMzMuNTkyLDQ2LjIwNCw2MC4xODksNzkuNzk5LDc5Ljc5OGMzMy41OTcsMTkuNjA1LDcwLjI4MywyOS40MDcsMTEwLjA2MywyOS40MDcNCgkJCXM3Ni40Ny05LjgwMiwxMTAuMDY1LTI5LjQwN2MzMy41OTMtMTkuNjAyLDYwLjE4OS00Ni4yMDYsNzkuNzk1LTc5Ljc5OGMxOS42MDMtMzMuNTk2LDI5LjQwMy03MC4yODQsMjkuNDAzLTExMC4wNjINCgkJCUM0MzguNTMzLDE3OS40ODUsNDI4LjczMiwxNDIuNzk1LDQwOS4xMzMsMTA5LjIwM3ogTTM1My43NDIsMjk3LjIwOGMtMTMuODk0LDIzLjc5MS0zMi43MzYsNDIuNjMzLTU2LjUyNyw1Ni41MzQNCgkJCWMtMjMuNzkxLDEzLjg5NC00OS43NzEsMjAuODM0LTc3Ljk0NSwyMC44MzRjLTI4LjE2NywwLTU0LjE0OS02Ljk0LTc3Ljk0My0yMC44MzRjLTIzLjc5MS0xMy45MDEtNDIuNjMzLTMyLjc0My01Ni41MjctNTYuNTM0DQoJCQljLTEzLjg5Ny0yMy43OTEtMjAuODQzLTQ5Ljc3Mi0yMC44NDMtNzcuOTQxYzAtMjguMTcxLDYuOTQ5LTU0LjE1MiwyMC44NDMtNzcuOTQzYzEzLjg5MS0yMy43OTEsMzIuNzM4LTQyLjYzNyw1Ni41MjctNTYuNTMNCgkJCWMyMy43OTEtMTMuODk1LDQ5Ljc3Mi0yMC44NCw3Ny45NDMtMjAuODRjMjguMTczLDAsNTQuMTU0LDYuOTQ1LDc3Ljk0NSwyMC44NGMyMy43OTEsMTMuODk0LDQyLjYzNCwzMi43MzksNTYuNTI3LDU2LjUzDQoJCQljMTMuODk1LDIzLjc5MSwyMC44MzgsNDkuNzcyLDIwLjgzOCw3Ny45NDNDMzc0LjU4LDI0Ny40MzYsMzY3LjYzNywyNzMuNDE3LDM1My43NDIsMjk3LjIwOHoiLz4NCgkJPHBhdGggZD0iTTMxMC42MzMsMjE5LjI2N0gyNTUuODJWMTE4Ljc2M2MwLTIuNjY2LTAuODYyLTQuODUzLTIuNTczLTYuNTY3Yy0xLjcwNC0xLjcwOS0zLjg5NS0yLjU2OC02LjU1Ny0yLjU2OGgtNTQuODIzDQoJCQljLTIuNjY0LDAtNC44NTQsMC44NTktNi41NjcsMi41NjhjLTEuNzE0LDEuNzE1LTIuNTcsMy45MDEtMi41Nyw2LjU2N3YxMDAuNWgtNTQuODE5Yy00LjE4NiwwLTcuMDQyLDEuOTA1LTguNTY2LDUuNzA5DQoJCQljLTEuNTI0LDMuNjIxLTAuODU0LDYuOTQ3LDEuOTk5LDkuOTk2bDkxLjM2Myw5MS4zNjFjMi4wOTYsMS43MTEsNC4yODMsMi41NjcsNi41NjcsMi41NjdjMi4yODEsMCw0LjQ3MS0wLjg1Niw2LjU2OS0yLjU2Nw0KCQkJbDkxLjA3Ny05MS4wNzNjMS45MDItMi4yODMsMi44NTEtNC41NzYsMi44NTEtNi44NTJjMC0yLjY2Mi0wLjg1NS00Ljg1My0yLjU3My02LjU3DQoJCQlDMzE1LjQ4OSwyMjAuMTIyLDMxMy4yOTksMjE5LjI2NywzMTAuNjMzLDIxOS4yNjd6Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=\" />"; //This needs to be set to an svg download icon
      b7.appendChild(elem_button);
      ////
      buttonslist.appendChild(b1);
      buttonslist.appendChild(b2);
      buttonslist.appendChild(b3);
      buttonslist.appendChild(document.createElement("BR"));
      buttonslist.appendChild(b4);
      buttonslist.appendChild(b5);
      buttonslist.appendChild(document.createElement("BR"))
      buttonslist.appendChild(b6);
      buttonslist.appendChild(b7);
      if(ui<=2){
        wlButton.appendChild(wishListButton);
      }
      else{
        if(typeof wishListButton!=='undefined'){
          wlButton.appendChild(wishListButton.firstChild.firstChild);
        }
      }
      buttonslist.appendChild(wlButton);
      var ddlButton1=document.getElementById("apkdlbutton");
      ddlButton1.onclick=function(){ddl(this,apkdlURL);};
      var ddlButton2=document.getElementById("apkpurebutton");
      ddlButton2.onclick=function(){ddl(this,apkpureURL);};
      var ddlButton3=document.getElementById("apkcombobutton");
      ddlButton3.onclick=function(){ddl(this,apkcomboURL);};
      var ddlButton4=document.getElementById("apkpremierbutton");
      ddlButton4.onclick=function(){ddl(this,apkpremierURL);};
      //document.getElementById("useGoogleServers").checked=useGS;
      //document.getElementById("gsExpl").addEventListener("click",function(){alert("If you choose the option \"Use Google\'s servers when downloading from APKCombo\", packages are directly downloaded form Play Store servers, but file names are randomized. Otherwise files are downloaded from APKCombo\'s own servers, with correct names.")});
    }
}
function openLink(link){
  window.open(link.replace("http://","https://"),"_self");
}
function ddlFinalApk(link,ddlButton,i){
  if(link!=""){
     done[i]=0;
     GM.xmlHttpRequest({
        method: "GET",
        url: link,
        timeout: 5000,
        ontimeout: function(response) {
          if(done[i]==0){
            ddlButton.firstChild.textContent="Retry";
          }
          else{
            done[i]=0;
          }
        },
       onprogress: function(response){
          //console.log(response.finalUrl);
         if((response.finalUrl.includes("winudf.com"))||(response.finalUrl.includes("down-apk.com"))||(response.finalUrl.includes("/play-apps-download-default/"))){
           if(done[i]==0){
             console.log("downloading file n."+i);
             done[i]=1;
             if(link.includes("apkpure")){
               window.open(response.finalUrl,"_self");
               ddlButton.onclick=function(){openLink(response.finalUrl);};
               ddlButton.firstChild.textContent="Ready!";
             }
             else if(link.includes("apkpremier")){
               window.open(response.finalUrl,"_self");
               ddlButton.onclick=function(){openLink(response.finalUrl);};
               ddlButton.firstChild.textContent="Ready!";
             }
             else{
               window.open(response.finalUrl,i);
               ddlButton.firstChild.textContent="APKCombo";
             }
           }
         }
        },
       	onload: function(response){
       		if(done[i]==0){
            ddlButton.firstChild.textContent="Retry";
          }
          else{
            done[i]=0;
          }
     		},
      	onerror: function(){
           buttonError(ddlButton,"Offline!");
         }
      });
   }
   else{
     buttonError(ddlButton,"Failed!");
   }
}
function ddl(ddlButton,ddlURL){
    ddlButton.firstChild.textContent="Loading...";
  	if(ddlURL.includes("apkfind")){
      try {
        var apkDlRequest1=GM.xmlHttpRequest({
              method: "GET",
              url: ddlURL,
              onload: function(response) {
                  if(response.finalUrl.includes("/captcha?")){
                      ddlButton.firstChild.addEventListener("click",function(){window.open(response.finalUrl)});
                      //ddlButton.firstChild.setAttribute("href",response.finalUrl);
                      ddlButton.firstChild.textContent="CAPTCHA";
                      ddlButton.onclick=null;
                  }
                  else if(response.finalUrl.includes("app/removed")){
                      buttonError(ddlButton,"Removed!");
                  }
                  else{
                      try{
                        	let parser = new DOMParser();
													var linkIntermediary = parser.parseFromString(response.response, 'text/html');
                          var link="http:"+linkIntermediary.getElementsByClassName("mdl-button")[0].getAttribute("href");
                          ddlButton.firstChild.textContent="Ready!";
                          openLink(link);
                        	ddlButton.onclick=function(){openLink(link);};

                      }
                      catch(err){
                          buttonError(ddlButton,"Failed!");
                          console.log(err);
                      }
                  }
              },
          		onerror: function(){
                buttonError(ddlButton,"Offline!");
              }
        });
      }
      catch (err) {
        buttonError(ddlButton,"Failed!");
        console.log(err);
      }
    }
    else if(ddlURL.includes("apkpure")){
        try{
            GM.xmlHttpRequest({
                method: "GET",
                url: ddlURL,
                onload: function(response) {
                  switch (response.status) {
                      case 410:
                          buttonError(ddlButton, "Removed!");
                          break;
                      case 404:
                          buttonError(ddlButton, "Not found!");
                          break;
                      default:
                        var apklink=response.responseText.substr(response.responseText.indexOf('https://download.apkpure.com/b/'),response.responseText.length-1);
                        apklink=apklink.substr(0,apklink.indexOf('"'));
                        console.log(ddlURL);
                        ddlButton.firstChild.textContent="Wait...";
                        //ddlButton.onclick=function(){GM.openInTab(apklink,"open_in_background");};
                        ddlFinalApk(apklink,ddlButton,0);
                  }
                },
                onerror: function(){
                  buttonError(ddlButton,"Offline!");
                }
            });
        }
        catch(err){
          buttonError(ddlButton,"Failed!");
          console.log(err);
        }
    }
  	else if(ddlURL.includes("apkcombo")){
        try{
            GM.xmlHttpRequest({
                method: "GET",
                url: ddlURL,
                onload: function(response) {
                  switch (response.status) {
                      case 410:
                          buttonError(ddlButton, "Removed!");
                          break;
                      case 404:
                          buttonError(ddlButton, "Not found!");
                          break;
                      default:
                          try {
                              var i;
                              var parser = new DOMParser();
                              var resp = parser.parseFromString(response.responseText, 'text/html');
                              //var google = resp.getElementById("origin-server-tab");
                            	var google;
                              //var combo = resp.getElementById("apkcombo-server-tab");
                            	var combo = resp.getElementsByClassName("file-list")[0];
                              //var useGoogleServers=document.getElementById("useGoogleServers").checked;
                            	var useGoogleServers=false;
                              setUseGS(useGoogleServers);
                              if ((google !== undefined )&&((combo === undefined)||(useGoogleServers==true))) {
                                  var googlelinks = google.getElementsByTagName("a");
                                  for (i = 0; i < googlelinks.length; i++) {
                                      ddlFinalApk(googlelinks[i].getAttribute("href"), ddlButton, i);
                                  }
                              } else if ((combo !== undefined)&&(useGoogleServers==false)) {
                                  var combolinks = combo.getElementsByTagName("a");
                                  for (i = 0; i < combolinks.length; i++) {
                                      ddlFinalApk(combolinks[i].getAttribute("href"), ddlButton, i);
                                  }
                              }
                              else{ //if loading the main download page results in an empty list of apks, tries to read the token to request directly the urls from apkcombo server
                                    var tokenStart=response.responseText.indexOf("/dl?token=")+4;
                                    var tokenEnd=response.responseText.indexOf("\"",tokenStart);
                                    var token = response.responseText.substring(tokenStart,tokenEnd);
                                    ddlURL=response.finalUrl;
                                    GM.xmlHttpRequest({
                                        method: "POST",
                                        url: ddlURL.replace("/download/apk", "/dl")+"?"+token,
                                        onload: function(response) {
                                            var parser2 = new DOMParser();
                                            var resp2 = parser2.parseFromString(response.responseText, 'text/html');
                                            //google = resp2.getElementById("origin-server-tab");
                                            //combo = resp2.getElementById("apkcombo-server-tab");
                                            combo = resp2.getElementsByClassName("file-list")[0];
                                            if ((google !== null)&&((combo === null)||(useGoogleServers==true))) {//same as above
                                                var googlelinks = google.getElementsByTagName("a");
                                                for (i = 0; i < googlelinks.length; i++) {
                                                    ddlFinalApk(googlelinks[i].getAttribute("href"), ddlButton, i);
                                                }
                                            } else if ((combo !== null)&&(useGoogleServers==false)) {
                                                var combolinks = combo.getElementsByTagName("a");
                                                for (i = 0; i < combolinks.length; i++) {
                                                    ddlFinalApk(combolinks[i].getAttribute("href"), ddlButton, i);
                                                }
                                            } else {
                                                ddlButton.firstChild.addEventListener("click",function(){window.open(ddlURL)});
                                                //ddlButton.firstChild.setAttribute("href", ddlURL);
                                                ddlButton.firstChild.textContent = "New tab >";
                                                ddlButton.onclick = null;
                                            }
                                        },
                                        onerror: function(response) {
                                            buttonError(ddlButton, "Error!");
                                        }
                                    });
                                }
                          } catch (err) {
                              console.log(err);
                          }
                  }
              },
              	onerror: function(){
                  buttonError(ddlButton,"Offline!");
                }
            });
        }
        catch(err){
          buttonError(ddlButton,"Failed!");
          console.log(err);
        }
    }
  	else if(ddlURL.includes("apkpremier")){
      try{
            GM.xmlHttpRequest({
                method: "GET",
                url: ddlURL,
                onload: function(response) {
                  switch (response.status) {
                      case 410:
                          buttonError(ddlButton, "Removed!");
                          break;
                      case 404:
                          buttonError(ddlButton, "Not found!");
                          break;
                      default:
                      	let parser = new DOMParser();
                      	const respDom = parser.parseFromString(response.responseText, "text/html");
                      	let apklink=respDom.getElementById("iframe_download").getAttribute("src");
                        ddlButton.firstChild.textContent="Wait...";
                        //ddlButton.onclick=function(){GM.openInTab(apklink,"open_in_background");};
                        ddlFinalApk(apklink,ddlButton,0);
                        
                  }
                },
                onerror: function(){
                  buttonError(ddlButton,"Offline!");
                }
            });
        }
        catch(err){
          buttonError(ddlButton,"Failed!");
          console.log(err);
        }
    }
}
function getUglyUIButtons(){
  var matchingElements=[];
  var allElements = document.getElementsByTagName('button');
  for (element of allElements){
    if (element.getAttribute("data-item-id")!==null){
      if (element.getAttribute("data-item-id").startsWith("%.@.")===true){
          matchingElements.push(element);
      }
    }
  }
  //alert(matchingElements.length); shows how many buttons for installation and whishlist are in the page
  return matchingElements;
}
function checkUI(){
    //Different UIs:
    //1=Mobile HTML
    //2=Desktop HTML
    //3=Mobile UglyUI
    //4=Desktop UglyUI
    var check=0;
    try{
        if(document.getElementsByClassName("action-bar-menu-button").length>0){
            check=1;
        }
        else{
            if(document.getElementsByClassName("details-info").length>0){
                check=2;
            }
            else if(!document.getElementById("error-section")){
                check=4;
                var metaTags=document.head.getElementsByTagName("meta");
                for(var i=0;i<metaTags.length;i++){
                    if(metaTags[i].getAttribute("name")=="mobile-web-app-capable"){
                        check=3;
                    }
               }
            }
        }
    }
    catch(err){
        console.error('The user interface of Google Play Store was not recognized by "Direct Download from Google Play" script. This might result in unexpected behaviour of the page. Please report the error to the author on Greasyfork. Error: '+err);
    }
    return check;
}
function removePreviousCwiz(){
    appCwiz.parentNode.removeChild(appCwiz);
}
function buttonError(ddlButton,error){
  ddlButton.firstChild.textContent=error;
  ddlButton.firstChild.style.backgroundColor="#CCCCCC";
  ddlButton.onclick=null;
}
async function setUseGS(check){
  useGS=check;
  GM.setValue("useGS", check);
}
