"use strict";var ApplicationConfiguration=function(){var applicationModuleName="hebrews",applicationModuleVendorDependencies=["ngResource","ngAnimate","ui.router","ui.bootstrap","ui.utils","googlechart"],registerModule=function(moduleName,dependencies){angular.module(moduleName,dependencies||[]),angular.module(applicationModuleName).requires.push(moduleName)};return{applicationModuleName:applicationModuleName,applicationModuleVendorDependencies:applicationModuleVendorDependencies,registerModule:registerModule}}(),hebrewUtils=hebrewUtils||{};hebrewUtils.utils={checkRole:function(user,role){if(null===user.roles)return!1;for(var k in user.roles)if(user.roles[k]==role)return!0;return!1}},Date.prototype.yyyymmdd=function(){var yyyy=this.getFullYear().toString(),mm=(this.getMonth()+1).toString(),dd=this.getDate().toString();return yyyy+(mm[1]?mm:"0"+mm[0])+(dd[1]?dd:"0"+dd[0])},angular.module(ApplicationConfiguration.applicationModuleName,ApplicationConfiguration.applicationModuleVendorDependencies),angular.module(ApplicationConfiguration.applicationModuleName).config(["$locationProvider",function($locationProvider){$locationProvider.hashPrefix("!")}]),angular.element(document).ready(function(){"#_=_"===window.location.hash&&(window.location.hash="#!"),angular.bootstrap(document,[ApplicationConfiguration.applicationModuleName])}),ApplicationConfiguration.registerModule("core"),ApplicationConfiguration.registerModule("users"),ApplicationConfiguration.registerModule("verses"),angular.module("core").config(["$stateProvider","$urlRouterProvider",function($stateProvider,$urlRouterProvider){$urlRouterProvider.otherwise("/"),$stateProvider.state("home",{url:"/",templateUrl:"modules/core/views/home.client.view.html"}).state("week",{url:"/week",templateUrl:"modules/core/views/week.client.view.html"})}]),angular.module("core").controller("HeaderController",["$scope","Authentication","Menus",function($scope,Authentication,Menus){$scope.checkRole=hebrewUtils.utils.checkRole,$scope.authentication=Authentication,$scope.isCollapsed=!1,$scope.menu=Menus.getMenu("topbar"),$scope.toggleCollapsibleMenu=function(){$scope.isCollapsed=!$scope.isCollapsed},$scope.$on("$stateChangeSuccess",function(){$scope.isCollapsed=!1})}]),angular.module("core").controller("HomeController",["$scope","datashare",function($scope,datashare){$scope.dailyReads=datashare,$scope.$watch("dailyReads",function(newVal){var rbd=$scope.dailyReads.readersByDate;$scope.chartObject.data.rows=[];for(var i=0;i<rbd.length;i++){var dat=rbd[i];$scope.chartObject.data.rows.push({c:[{v:dat.date},{v:dat.vcount},{v:dat.pcount}]})}},!0),$scope.chartObject={},$scope.chartObject.data={cols:[{id:"t",label:"日期",type:"date"},{id:"s",label:"经节数",type:"number"},{id:"s",label:"人数",type:"number"}],rows:[{c:[{v:new Date},{v:0}]}]},$scope.chartObject.type="LineChart",$scope.chartObject.options={title:"每日读者"}}]),angular.module("core").controller("WeekInfoController",["$scope","$stateParams","$location","Authentication","VersesDirect","datashare",function($scope,$stateParams,$location,Authentication,VersesDirect,datashare){function setScope(){$scope.curSchedule=VersesDirect.curSchedule,$scope.CurWeekMap=VersesDirect.CurWeekMap,$scope.CurWeekAry=VersesDirect.CurWeekAry,$scope.CurDay=VersesDirect.CurDay,$scope.allStats=VersesDirect.allStats,$scope.recordedHash=VersesDirect.recordedHash,datashare.readersByDate=VersesDirect.readersByDate,$scope.WeekMap={};for(var whichWeek=0;whichWeek<$scope.CurWeekAry.length;whichWeek++){var week=$scope.CurWeekAry[whichWeek],weekDay="";switch(whichWeek){case 0:weekDay="一";break;case 1:weekDay="二";break;case 2:weekDay="三";break;case 3:weekDay="四";break;case 4:weekDay="五";break;case 5:weekDay="六";break;case 6:weekDay="日"}$scope.WeekMap[week]={Week:whichWeek,MonthDay:$scope.CurWeekMap[week].substring(5)+"("+weekDay+")"}}}$scope.scheduleYear=(new Date).getFullYear(),$scope.scheduleYear%2?$scope.scheduleYear=""+$scope.scheduleYear+" - "+($scope.scheduleYear+1):$scope.scheduleYear=""+($scope.scheduleYear-1)+" - "+$scope.scheduleYear,$scope.recordedHash={},$scope.curSchedule=[],$scope.scheduleStarts=[],$scope.scheduleStartDate=null,$scope.scheduleStartSel={},$scope.allStats=[],$scope.email="*",$scope.hasAuth=!1,$scope.resetAll=function(){$scope.allStats=[],$scope.recordedHash={}},VersesDirect.scheduleDctf($scope.email,function(err,res){var scheduleStarts=res.scheduleStarts;$scope.scheduleStarts=scheduleStarts,scheduleStarts.length>0&&($scope.scheduleStartSel=scheduleStarts[0]),setScope()})}]),angular.module("core").service("Menus",[function(){this.defaultRoles=["*"],this.menus={};var shouldRender=function(user){if(!user)return this.isPublic;if(~this.roles.indexOf("*"))return!0;for(var userRoleIndex in user.roles)for(var roleIndex in this.roles)if(this.roles[roleIndex]===user.roles[userRoleIndex])return!0;return!1};this.validateMenuExistance=function(menuId){if(menuId&&menuId.length){if(this.menus[menuId])return!0;throw new Error("Menu does not exists")}throw new Error("MenuId was not provided")},this.getMenu=function(menuId){return this.validateMenuExistance(menuId),this.menus[menuId]},this.addMenu=function(menuId,isPublic,roles){return this.menus[menuId]={isPublic:isPublic||!1,roles:roles||this.defaultRoles,items:[],shouldRender:shouldRender},this.menus[menuId]},this.removeMenu=function(menuId){this.validateMenuExistance(menuId),delete this.menus[menuId]},this.addMenuItem=function(menuId,menuItemTitle,menuItemURL,menuItemType,menuItemUIRoute,isPublic,roles,position){return this.validateMenuExistance(menuId),this.menus[menuId].items.push({title:menuItemTitle,link:menuItemURL,menuItemType:menuItemType||"item",menuItemClass:menuItemType,uiRoute:menuItemUIRoute||"/"+menuItemURL,isPublic:null===isPublic||"undefined"==typeof isPublic?this.menus[menuId].isPublic:isPublic,roles:null===roles||"undefined"==typeof roles?this.menus[menuId].roles:roles,position:position||0,items:[],shouldRender:shouldRender}),this.menus[menuId]},this.addSubMenuItem=function(menuId,rootMenuItemURL,menuItemTitle,menuItemURL,menuItemUIRoute,isPublic,roles,position){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)this.menus[menuId].items[itemIndex].link===rootMenuItemURL&&this.menus[menuId].items[itemIndex].items.push({title:menuItemTitle,link:menuItemURL,uiRoute:menuItemUIRoute||"/"+menuItemURL,isPublic:null===isPublic||"undefined"==typeof isPublic?this.menus[menuId].items[itemIndex].isPublic:isPublic,roles:null===roles||"undefined"==typeof roles?this.menus[menuId].items[itemIndex].roles:roles,position:position||0,shouldRender:shouldRender});return this.menus[menuId]},this.removeMenuItem=function(menuId,menuItemURL){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)this.menus[menuId].items[itemIndex].link===menuItemURL&&this.menus[menuId].items.splice(itemIndex,1);return this.menus[menuId]},this.removeSubMenuItem=function(menuId,submenuItemURL){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)for(var subitemIndex in this.menus[menuId].items[itemIndex].items)this.menus[menuId].items[itemIndex].items[subitemIndex].link===submenuItemURL&&this.menus[menuId].items[itemIndex].items.splice(subitemIndex,1);return this.menus[menuId]},this.addMenu("topbar")}]),angular.module("users").config(["$httpProvider",function($httpProvider){$httpProvider.interceptors.push(["$q","$location","Authentication",function($q,$location,Authentication){return{responseError:function(rejection){switch(rejection.status){case 401:Authentication.user=null,$location.path("signin");break;case 403:}return $q.reject(rejection)}}}])}]),angular.module("users").config(["$stateProvider",function($stateProvider){$stateProvider.state("profile",{url:"/settings/profile",templateUrl:"modules/users/views/settings/edit-profile.client.view.html"}).state("password",{url:"/settings/password",templateUrl:"modules/users/views/settings/change-password.client.view.html"}).state("accounts",{url:"/settings/accounts",templateUrl:"modules/users/views/settings/social-accounts.client.view.html"}).state("signup",{url:"/signup",templateUrl:"modules/users/views/authentication/signup.client.view.html"}).state("signin",{url:"/signin",templateUrl:"modules/users/views/authentication/signin.client.view.html"}).state("forgot",{url:"/password/forgot",templateUrl:"modules/users/views/password/forgot-password.client.view.html"}).state("reset-invalid",{url:"/password/reset/invalid",templateUrl:"modules/users/views/password/reset-password-invalid.client.view.html"}).state("reset-success",{url:"/password/reset/success",templateUrl:"modules/users/views/password/reset-password-success.client.view.html"}).state("reset",{url:"/password/reset/:token",templateUrl:"modules/users/views/password/reset-password.client.view.html"}).state("userInfo",{url:"/user/info",templateUrl:"modules/users/views/password/userInfo.client.view.html"}).state("userSignReq",{url:"/user/requestSign",templateUrl:"modules/users/views/sign/requestSign.client.view.html"}).state("SignUserReq",{url:"/user/signRequest",templateUrl:"modules/users/views/sign/signRequest.client.view.html"})}]),angular.module("users").controller("AuthenticationController",["$scope","$http","$location","Authentication",function($scope,$http,$location,Authentication){$scope.authentication=Authentication,$scope.authentication.user&&$location.path("/"),$scope.signup=function(){$http.post("/auth/signup",$scope.credentials).success(function(response){$scope.authentication.user=response,$location.path("/")}).error(function(response){$scope.error=response.message})},$scope.signin=function(){$http.post("/auth/signin",$scope.credentials).success(function(response){$scope.authentication.user=response,$location.path("/")}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("PasswordController",["$scope","$stateParams","$http","$location","Authentication",function($scope,$stateParams,$http,$location,Authentication){$scope.authentication=Authentication,$scope.authentication.user&&$location.path("/"),$scope.askForPasswordReset=function(){$scope.success=$scope.error=null,$http.post("/auth/forgot",$scope.credentials).success(function(response){$scope.credentials=null,$scope.success=response.message}).error(function(response){$scope.credentials=null,$scope.error=response.message})},$scope.resetUserPassword=function(){$scope.success=$scope.error=null,$http.post("/auth/reset/"+$stateParams.token,$scope.passwordDetails).success(function(response){$scope.passwordDetails=null,Authentication.user=response,$location.path("/password/reset/success")}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("SettingsController",["$scope","$http","$location","Users","Authentication",function($scope,$http,$location,Users,Authentication){$scope.user=Authentication.user,$scope.user||$location.path("/"),$scope.hasConnectedAdditionalSocialAccounts=function(provider){for(var i in $scope.user.additionalProvidersData)return!0;return!1},$scope.isConnectedSocialAccount=function(provider){return $scope.user.provider===provider||$scope.user.additionalProvidersData&&$scope.user.additionalProvidersData[provider]},$scope.removeUserSocialAccount=function(provider){$scope.success=$scope.error=null,$http["delete"]("/users/accounts",{params:{provider:provider}}).success(function(response){$scope.success=!0,$scope.user=Authentication.user=response}).error(function(response){$scope.error=response.message})},$scope.updateUserProfile=function(isValid){if(isValid){$scope.success=$scope.error=null;var user=new Users($scope.user);user.$update(function(response){$scope.success=!0,Authentication.user=response},function(response){$scope.error=response.data.message})}else $scope.submitted=!0},$scope.changeUserPassword=function(){$scope.success=$scope.error=null,$http.post("/users/password",$scope.passwordDetails).success(function(response){$scope.success=!0,$scope.passwordDetails=null}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("SignRequestController",["$scope","Authentication","VersesDirect",function($scope,Authentication,VersesDirect){function setScope(err){$scope.curSchedule=VersesDirect.curSchedule,$scope.allStats=VersesDirect.allStats,null!==VersesDirect.allStats&&VersesDirect.allStats.length>0&&($scope.selectedUserId=VersesDirect.allStats[0].userId),$scope.recordedHash=VersesDirect.recordedHash,$scope.scheduleStarts=VersesDirect.scheduleStarts,$scope.signReqs=VersesDirect.signReqs;for(var i in $scope.signReqs)$scope.signReqs[i].SignedBy&&($scope.signReqs[i].checked=!0)}$scope.authentication=Authentication,$scope.email=null,$scope.recordedHash={},$scope.selectedUserId=null,$scope.curSchedule=[],$scope.scheduleStarts=[],$scope.scheduleStartSel={},$scope.allStats=[],$scope.signList=[],$scope.SetCurUserId=function(uid){$scope.selectedUserId=uid},VersesDirect.scheduleDctf("*",function(){setScope();var scheduleStarts=VersesDirect.scheduleStarts;$scope.scheduleStarts=scheduleStarts,scheduleStarts.length>0&&($scope.scheduleStartSel=scheduleStarts[0])}),$scope.scheduleChanged=function(){VersesDirect.setSchedule($scope.scheduleStartSel,setScope)},$scope.SignRequest=function(){var ids=$scope.signReqs.filter(function(x){return x.checked}).map(function(x){return x._id});new VersesDirect.lSignReqFunc({ids:ids}).success(function(response){$scope.message=response.message}).error(function(errorResponse){$scope.error=errorResponse.message})}}]),angular.module("users").controller("UserInfoController",["$scope","$stateParams","$http","$location","Authentication",function($scope,$stateParams,$http,$location,Authentication){$scope.authentication=Authentication,$scope.userInfo={},$scope.resetActive=!1,$scope.roles=[{name:"user",checked:!0},{name:"lead",checked:!1},{name:"admin",checked:!1}],$scope.UsrInfo=function(){$scope.success=$scope.error=null;var userInfo=this.userInfo;userInfo._id&&(userInfo.roles=this.roles.filter(function(itm){return itm.checked===!0}).map(function(itm){return itm.name})),$http.post("/userSetActive",$scope.userInfo).success(function(response){$scope.message="found "+response.email+" "+response.message,$scope.userInfo=response,response&&response._id&&response.roles&&$scope.roles.every(function(rr){return rr.checked=response.roles.indexOf(rr.name)>=0,!0})}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("UserSignController",["$scope","Authentication","VersesDirect","Verses",function($scope,Authentication,VersesDirect,Verses){function setScope(err){$scope.curSchedule=VersesDirect.curSchedule,$scope.allStats=VersesDirect.allStats,null!==VersesDirect.allStats&&VersesDirect.allStats.length>0&&($scope.selectedUserId=VersesDirect.allStats[0].userId),$scope.recordedHash=VersesDirect.recordedHash,$scope.scheduleStarts=VersesDirect.scheduleStarts}$scope.authentication=Authentication,$scope.email=null,$scope.selectedUserId=null,$scope.recordedHash={},$scope.curSchedule=[],$scope.scheduleStarts=[],$scope.scheduleStartSel={},$scope.allStats=[],VersesDirect.scheduleDctf($scope.authentication.user.email,function(){setScope();var scheduleStarts=VersesDirect.scheduleStarts;$scope.scheduleStarts=scheduleStarts,scheduleStarts.length>0&&($scope.scheduleStartSel=scheduleStarts[0])}),$scope.scheduleChanged=function(){VersesDirect.setSchedule($scope.scheduleStartSel,setScope)},$scope.RequestSign=function(){var sign=new VersesDirect.uReqSign($scope.scheduleStartSel);sign.email=this.email,sign.$save(function(response){$scope.message=response.message},function(errorResponse){$scope.error=errorResponse.message})},$scope.SubmitMultiVerse=function(){for(var titles=[],i=0;i<$scope.curSchedule.length;i++)for(var schLine=$scope.curSchedule[i],j=0;j<schLine.length;j++){var sch=schLine[j];$scope.recordedHash[sch]&&$scope.recordedHash[sch][$scope.selectedUserId].setNRead&&titles.push(sch)}console.log(titles.length+" titlefirst="+(titles.length>0?titles[0]:"null"));var verse=new Verses({titles:titles,group:this.group});verse.$save(function(response){$location.path("verses/"+response._id)},function(errorResponse){$scope.error=errorResponse.data.message})}}]),angular.module("users").factory("Authentication",[function(){var _this=this;return _this._data={user:window.user},_this._data}]),angular.module("users").factory("Users",["$resource",function($resource){return $resource("users",{},{update:{method:"PUT"}})}]),angular.module("verses").run(["Menus",function(Menus){Menus.addMenuItem("topbar","Verses","verses","dropdown","/verses(/create)?"),Menus.addSubMenuItem("topbar","verses","List","verses"),Menus.addSubMenuItem("topbar","verses","Record","verses/create")}]),angular.module("verses").config(["$stateProvider",function($stateProvider){$stateProvider.state("listVerses",{url:"/verses",templateUrl:"modules/verses/views/list-verses.client.view.html"}).state("createVerse",{url:"/verses/create",templateUrl:"modules/verses/views/create-verse.client.view.html"}).state("createSimpleVerse",{url:"/recordVerse",templateUrl:"modules/verses/views/record-verse.client.view.html"}).state("createMultiVerse",{url:"/recordVerses",templateUrl:"modules/verses/views/record-verses.client.view.html"}).state("viewVerse",{url:"/verses/:verseId",templateUrl:"modules/verses/views/view-verse.client.view.html"}).state("editVerse",{url:"/verses/:verseId/edit",templateUrl:"modules/verses/views/edit-verse.client.view.html"}).state("VerseInfo",{url:"/versesInfo",templateUrl:"modules/verses/views/versesInfo.client.view.html"})}]),angular.module("verses").controller("VersesController",["$scope","$stateParams","$location","Authentication","Verses","VersesDirect",function($scope,$stateParams,$location,Authentication,Verses,VersesDirect){function setCookie(cname,cvalue,exdays){var d=new Date;d.setTime(d.getTime()+24*exdays*60*60*1e3);var expires="expires="+d.toUTCString();document.cookie=cname+"="+cvalue+"; "+expires}function getCookie(cname){for(var name=cname+"=",ca=document.cookie.split(";"),i=0;i<ca.length;i++){for(var c=ca[i];" "===c.charAt(0);)c=c.substring(1);if(0===c.indexOf(name))return c.substring(name.length,c.length)}return""}if($scope.dateReadSel=null,$scope.authentication=Authentication,$scope.isAuthed=!1,$scope.email=getCookie("ckemail"),$scope.title=$location.search().title,$scope.group=$location.search().group,null!==(Authentication.user||null)){var email=Authentication.user.email||null;null!==email&&""!==email&&($scope.email=email,$scope.isAuthed=!0)}$scope.create=function(){var verse=new Verses({title:this.title,group:this.group});verse.$save(function(response){$location.path("verses/"+response._id)},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.createDirect=function(valid){if(!valid)return void($scope.error="Email not valid");var verse=new VersesDirect.rcdDct({title:this.title,email:this.email,group:this.group});setCookie("ckemail",this.email,3650),verse.$save(function(response){$location.path("verses/"+response._id)},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.remove=function(verse){if(verse){verse.$remove();for(var i in $scope.verses)$scope.verses[i]===verse&&$scope.verses.splice(i,1)}else $scope.verses.$remove(function(){$location.path("verses")})},$scope.update=function(){var verse=$scope.verse;verse.$update(function(){$location.path("verses/"+verse._id)},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.find=function(){$scope.verses=Verses.query()},$scope.findOne=function(){$scope.verse=Verses.get({verseId:$stateParams.verseId})},$scope.openDate=function($event){$event.preventDefault(),$event.stopPropagation(),$scope.opened=!0},$scope.dateOptions={formatYear:"yy",startingDay:1}}]),angular.module("verses").controller("VersesInfoController",["$scope","$stateParams","$location","Authentication","VersesDirect","datashare",function($scope,$stateParams,$location,Authentication,VersesDirect,datashare){function setScope(){$scope.curSchedule=VersesDirect.curSchedule,$scope.CurWeekMap=VersesDirect.CurWeekMap,$scope.CurWeekAry=VersesDirect.CurWeekAry,$scope.CurDay=VersesDirect.CurDay,$scope.allStats=VersesDirect.allStats,$scope.recordedHash=VersesDirect.recordedHash,datashare.readersByDate=VersesDirect.readersByDate,$scope.selectedUserId=VersesDirect.selectedUserId}$scope.scheduleYear=(new Date).getFullYear(),$scope.scheduleYear%2?$scope.scheduleYear=""+$scope.scheduleYear+" - "+($scope.scheduleYear+1):$scope.scheduleYear=""+($scope.scheduleYear-1)+" - "+$scope.scheduleYear,$scope.recordedHash={},$scope.curSchedule=[],$scope.scheduleStarts=[],$scope.scheduleStartDate=null,$scope.scheduleStartSel={},$scope.selectedUserId=null,$scope.allStats=[],null!==Authentication.user&&""!==Authentication.user?($scope.hasAuth=!0,$scope.email=Authentication.user.email):$scope.hasAuth=!1,$scope.resetAll=function(){$scope.allStats=[],$scope.recordedHash={}},$scope.emailChanged=function(){return $scope.resetAll(),VersesDirect.setEmail($scope.email,function(){setScope()}),!0},$scope.SetCurUserId=function(uid){$scope.selectedUserId=uid},$scope.scheduleChanged=function(){$scope.VersesInSchedule={},null!==($scope.scheduleStartSel||null)&&VersesDirect.setSchedule($scope.scheduleStartSel,setScope)},VersesDirect.scheduleDctf($scope.email,function(err,res){var scheduleStarts=res.scheduleStarts;$scope.scheduleStarts=scheduleStarts,scheduleStarts.length>0&&($scope.scheduleStartSel=scheduleStarts[0]),setScope()})}]),angular.module("verses").factory("datashare",["$rootScope",function($rootScope){return{curData:{},readersByDate:[]}}]),angular.module("verses").factory("Verses",["$resource",function($resource){return $resource("verses/:verseId",{verseId:"@_id"},{update:{method:"PUT"}})}]),angular.module("verses").factory("VersesDirect",["$resource","$http",function($resource,$http){function dateDiffInDays(a,b){var utc1=Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()),utc2=Date.UTC(b.getFullYear(),b.getMonth(),b.getDate());return Math.floor((utc2+_MS_PER_HALFDAY-utc1)/_MS_PER_DAY)}function dateDiffInDays728(a,b){var utc1=Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()),utc2=Date.UTC(b.getFullYear(),b.getMonth(),b.getDate());return(utc2-utc1)/_MS_PER_DAY%728}function yyyyMMdd(dt){var yyyy=dt.getFullYear().toString(),mm=(dt.getMonth()+1).toString(),dd=dt.getDate().toString();return yyyy+"/"+(mm[1]?mm:"0"+mm[0])+"/"+(dd[1]?dd:"0"+dd[0])}function getDay(a,days){var utc1=Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()),dt=new Date(utc1+days*_MS_PER_DAY+_MS_PER_HALFDAY);return yyyyMMdd(dt)}function getDateInt(d){return"string"==typeof d&&(d=new Date(d)),100*d.getFullYear()+10*d.getMonth()+d.getDate()}var _MS_PER_DAY=864e5,_MS_PER_HALFDAY=_MS_PER_DAY/2,res={fullSchedule:null,scheduleStartDate:null,scheduleStarts:[],selectedSchedule:null,verses:[],curSchedule:[],CurWeek:{},CurDay:null,VersesInSchedule:{},recordedHash:{},allStats:{},readersByDate:[],signReqs:[],selectedUserId:null,rcdDct:$resource("versesDirect/",{},{}),qryDct:$resource("versesQry/:email",{email:"@email"},{}),qryAll:$resource("versesQryAll",{},{}),scheduleDct:$resource("schedule.json",{},{}),uReqSign:$resource("/sign/requestSign",{},{}),lSignReqFunc:function(data){return $http.post("/sign/signRequest",data)},signListFunc:function(dta){return $http.post("/sign/list",dta)},AddDaysToYmd:getDay,dateDiffInDays728:dateDiffInDays728,getDateOnly:function(d){return"string"==typeof d&&(d=new Date(d)),new Date(d.getFullYear(),d.getMonth(),d.getDate())}};return res.createScheduleStarts=function(curDate){var startDate=res.scheduleStartDate,daysMax=dateDiffInDays(startDate,curDate),curDay=dateDiffInDays(startDate,new Date),isCurrentSch=curDay<7*(Math.floor(daysMax/7/13)+1)*13,days=daysMax%728,maxStart=13*Math.floor(daysMax/7/13),start=13*Math.floor(days/7/13);curDay=curDay%728-7*start;for(var scheduleStarts=[],i=0;i>=-1;i--){var desc=getDay(startDate,7*maxStart+7*i*13)+" - "+getDay(startDate,7*maxStart+7*(i+1)*13);scheduleStarts.push({Desc:desc,ScheduleStartDay:7*start+7*i*13,DaysPassed:isCurrentSch&&0===i?days-7*start+1:91,isCurrentSch:isCurrentSch,CurDay:curDay,CurWeek:Math.floor(curDay/7)})}res.scheduleStarts=scheduleStarts,scheduleStarts.length>0&&(res.selectedSchedule=scheduleStarts[0])},res.setEmail=function(email,done){res.getUserVerses(email,function(res){res.setSchedule(res.selectedSchedule,done)})},res.setSchedule=function(schedule,done){function doDone(xx){res.signReqs=xx,schedule&&res.statsByUserId(res.selectedSchedule.DaysPassed),done&&done(null,res)}return null!==schedule?(res.selectedSchedule=schedule,res.setCurSchedule(res.selectedSchedule.ScheduleStartDay),void res.signListFunc({ScheduleStartDay:schedule.ScheduleStartDay}).success(doDone).error(function(err){console.log(err),done(err)})):void doDone()},res.scheduleDctf=function(email,done){null===res.fullSchedule?$resource("schedule.json",{},{}).get(function(sch){var startDate=new Date(sch.startDate.y,sch.startDate.m,sch.startDate.d);res.fullSchedule=sch,res.scheduleStartDate=startDate,res.createScheduleStarts(new Date),res.setEmail(email,done)}):(res.createScheduleStarts(new Date),res.setEmail(email,done))},res.getUserVerses=function(email,done){var eml=email||null;(null===eml||""===eml.trim())&&(eml="*");var qry=res.qryDct;"*"===eml&&(qry=res.qryAll),qry.query({email:eml},function(data){res.verses=data,done&&done(res)})},res.statsByUserId=function(totalVersToDate){var allStats={},statsAry=[],svers=res.verses,i=0,stat=null,readersByDate={},recordedHash={};for(i=0;i<svers.length;i++){var v=svers[i];v.user||(v.user={});var vpos=res.VersesInSchedule[v.title]||null;if(null!==vpos){v.vpos=vpos;var diffDays=dateDiffInDays728(res.scheduleStartDate,new Date(v.dateRead)),dayOnly=getDateInt(v.dateRead),rbd=readersByDate[dayOnly]||{date:res.getDateOnly(v.dateRead),vcount:0,pcount:0,uids:{}};rbd.vcount++,null===(rbd.uids[v.user._id]||null)?(rbd.uids[v.user._id]=1,rbd.pcount++):rbd.uids[v.user._id]=rbd.uids[v.user._id]+1,readersByDate[dayOnly]=rbd,v.vpos.readPos=diffDays,v.vpos.diff=diffDays-vpos.pos,stat=allStats[v.user._id]||null,null===stat?(stat={userId:v.user._id,displayName:v.user.displayName||null,email:v.user.email,read:1,totalToDate:totalVersToDate,lates:0,latesByDay:{},dups:{}},stat.dups[v.title]=1,(null===stat.displayName||""===stat.displayName.trim())&&(stat.displayName=stat.email||"*********"),allStats[v.user._id]=stat,statsAry.push(stat)):stat.dups[v.title]||(stat.dups[v.title]=1,stat.read++),null===(recordedHash[v.title]||null)&&(recordedHash[v.title]={});var dayDsp=res.AddDaysToYmd(new Date(v.dateRead),0);v.vpos.diff>0?(stat.latesByDay[v.vpos.diff]=(stat.latesByDay[v.vpos.diff]||0)+1,stat.lates++,recordedHash[v.title][v.user._id]={valid:!0,late:v.vpos.diff,cls:"late",tip:"late for "+v.vpos.diff+" days",dateRead:dayDsp}):recordedHash[v.title][v.user._id]={valid:!0,late:0,cls:"green",tip:"Completed on "+v.dateRead,dateRead:dayDsp}}else recordedHash[v.title]={},recordedHash[v.title][v.user._id]={valid:!1,cls:"",tip:null}}res.recordedHash=recordedHash,statsAry.sort(function(a,b){return b.read-a.read});var signMap={};if(res.signReqs)for(i=0;i<res.signReqs.length;i++){var sReqI=res.signReqs[i];sReqI.user&&(signMap[sReqI.user._id]=sReqI)}for(i=0;i<statsAry.length;i++){stat=statsAry[i],0!==stat.totalToDate&&(stat.completePct=Math.round(100*stat.read/stat.totalToDate));var signReq=signMap[stat.userId];if(signReq&&(stat.signStatus="Requested",signReq.SignedBy)){stat.signStatus="Signed";var whoSigned=signReq.SignedBy.displayName||signReq.SignedBy.email;whoSigned&&(stat.signStatus="Signed by "+whoSigned)}}res.allStats=statsAry,statsAry.length>0&&(res.selectedUserId=statsAry[0].userId);var readersByDateAry=[];for(var rday in readersByDate)readersByDateAry.push(readersByDate[rday]);readersByDateAry.sort(function(a,b){return a.date>b.date}),res.readersByDate=readersByDateAry},res.setCurSchedule=function(scheduleStartDay){for(var start=13*Math.floor(scheduleStartDay/7/13),VersesInSchedule={},curSchedule=[],selSch=res.selectedSchedule,sch=res.fullSchedule.schedule,today=new Date,i=0;13>i;i++){var schLine=sch[start+i],isCurWeek=selSch.isCurrentSch&&selSch.CurWeek===i;isCurWeek&&(res.CurWeekMap={},res.CurWeekAry=schLine.slice(1));for(var j=1;j<schLine.length;j++){var title=schLine[j];isCurWeek&&(res.CurWeekMap[title]=getDay(today,j-selSch.CurDay%7-1)),isCurWeek&&j===selSch.CurDay%7+1&&(res.CurDay=title),VersesInSchedule[title]=res.fullSchedule.verses[title]}curSchedule.push(schLine)}res.curSchedule=curSchedule,res.VersesInSchedule=VersesInSchedule},res}]);