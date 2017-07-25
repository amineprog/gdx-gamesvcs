/*! Copyright 2013 Amazon Digital Services, Inc. All rights reserved. */
TimePlayedHandler=(function(){var b=new TaskSynchronizer();var c=new TaskSynchronizer();var a=function(){var i="https://ags-ext.amazon.com/service/gamedata/";var u="TimePlayedRequest";var n=this;var m="timePlayed";var y="sessionStart";var h="cloudTimePlayed";var j="localTimePlayed";var p="lastTimePlayed";var d="localTimePlayedPendingUpload";var v="lastTimePlayedPendingUpload";var g=20000;var f=20000;var q=0;this["startSession"]=function(B){var z=$.Deferred();console.log("TimePlayed: Start");var A=B||n.getCurrentTimestamp();b.runTask(function(C){var D=$.Deferred();n.getLocalTimePlayedData().always(function(E){if(C.hasLock()){if(E[y]!=null){console.warn("onResume() called twice in a row: please call onPause()")}E[y]=A;t(E,A);n.setLocalTimePlayedData(E).always(function(){D.resolve();x().always(function(){z.resolve()})})}else{console.error("TimePlayed: lost lock, didn't record start at "+B);D.reject();z.reject()}});return D.promise()});return z.promise()};this["stopSession"]=function(A){var z=$.Deferred();console.log("TimePlayed: Stop");b.runTask(function(B){n.getLocalTimePlayedData().always(function(D){if(B.hasLock()){var C=A||n.getCurrentTimestamp();if(r(D[y],C)){var E=C-D[y];if(D[j]==null){D[j]=0}D[j]+=E}D[y]=null;t(D,C);n.setLocalTimePlayedData(D).always(function(){z.resolve()})}else{console.error("TimePlayed: lost lock, didn't record stop at "+A);z.reject()}});return z.promise()});return z.promise()};this["getTimePlayed"]=function(){var z=$.Deferred();n.getLocalTimePlayedData().always(function(C){var A={};if(C!=null){A.lastTimePlayed=C[p];var E=C[j]||0;var D=C[d]||0;var B=C[h]||0;A.totalTimePlayed=E+D+B}z.resolve(new Result(constants.NativeCallResultCode.SUCCESS,A))});return z.promise()};var o=function(){var z=$.Deferred();n.getPackageName().done(function(A){n.getGameTimePlayedFromService(A).always(function(B){if(B==null){z.resolve();return}b.runTask(function(C){n.getLocalTimePlayedData(A).always(function(D){if(C.hasLock()){D[h]=B.totalTimePlayed;t(D,B.lastTimePlayed);n.setLocalTimePlayedData(D).always(function(){console.log("TimePlayed: Synced from cloud, totalTimePlayed="+B.totalTimePlayed);z.resolve()})}else{console.error("TimePlayed: lost lock, skipping cloud update");z.reject()}});return z.promise()})})}).fail(function(){console.error("Unable to fetch time played from cloud: no package name");z.reject()});return z.promise()};var w=function(){var z=$.Deferred();c.runTask(function(A){s().always(function(){l().always(function(){z.resolve()})});return z.promise()});return z.promise()};var s=function(A){var z=$.Deferred();b.runTask(function(B){n.getLocalTimePlayedData().always(function(C){if(B.hasLock()){if(C==null){z.resolve()}else{if(e(C)){z.resolve()}else{if(C[j]==null||C[j]<g){z.resolve()}else{if(C[p]==null||C[p]<=0){z.resolve()}else{C[d]=C[j];C[j]=0;if(C[p]==C[v]){C[v]=C[p]+1}else{C[v]=C[p]}n.setLocalTimePlayedData(C).always(function(){z.resolve()})}}}}}else{console.error("TimePlayed: lost lock, skipping cloud update preparations");z.reject()}});return z.promise()});return z.promise()};var l=function(){var z=$.Deferred();n.getLocalTimePlayedData().always(function(A){if(!e(A)){z.resolve();return}n.getPackageName().done(function(C){var B=n.updateGameTimePlayedOnService(C,A[d],A[v]);B.done(function(D,E){if(E!=constants.NativeCallResultCode.SUCCESS||D&&D.message){console.warn("Failed to upload time played data: "+JSON.stringify(D));z.resolve()}else{k(A).always(function(){z.resolve()})}}).fail(function(){console.warn("Failed to upload time played data");z.resolve()})}).fail(function(){console.error("Unable to upload time played to cloud: no package name");z.reject()})});return z.promise()};var k=function(A){var z=$.Deferred();b.runTask(function(B){n.getLocalTimePlayedData().always(function(C){if(B.hasLock()){if(C[v]!=A[v]){console.error("Last time played uploaded no longer matches what is cached locally!");z.resolve();return}console.log("TimePlayed: uploaded "+C[d]+" to cloud.");C[h]+=C[d];C[d]=0;n.setLocalTimePlayedData(C).always(function(){z.resolve()})}else{console.error("TimePlayed: lost lock during sync cleanup");z.reject()}},2);return z.promise()});return z.promise()};var e=function(z){var A=z[d];return A!=null&&A>0};var x=function(){var z=$.Deferred();n.isNetworkOnline().always(function(B){if(B){var A=n.getCurrentTimestamp();if(!q||q<A-f||q>A){q=A;w().always(function(){o().always(function(){z.resolve()})})}else{z.resolve();console.log("TimePlayed: Skipping sync")}}else{z.resolve()}});return z.promise()};var t=function(A,z){if(A[p]==null||A[p]<z){A[p]=z}};var r=function(A,z){if(A==null){console.warn("onPause() called without first calling onResume()");return false}if(A<=0){console.warn("Bad start time "+A+", discarding this session's time tracking.");return false}if(A>z){console.warn("Start time is after end time, discarding this session's time tracking.");return false}return true};this["getCurrentTimestamp"]=function(){return new Date().getTime()};this["getLocalTimePlayedData"]=function(){var z={};z[constants.NativeCallKeys.PRIMARY_KEY]=m;return NativeTransport.callNative({nativeCall:constants.NativeCallTypes.GET_SETTING,args:z})};this["setLocalTimePlayedData"]=function(A){var z={};z[constants.NativeCallKeys.PRIMARY_KEY]=m;z[constants.NativeCallKeys.SECONDARY_KEY]=m;z[constants.NativeCallKeys.VALUE]=A;return NativeTransport.callNative({nativeCall:constants.NativeCallTypes.PUT_SETTING,args:z})};this["getPackageName"]=function(){var z=$.Deferred();NativeTransport.callNative({nativeCall:constants.NativeCallTypes.GET_PACKAGE_NAME}).always(function(A){if(A!=null){var B=A[constants.BindingKeys.PACKAGE_NAME_KEY];if(B!=null&&B!=""){z.resolve(B);return}}z.reject()});return z.promise()};this["isNetworkOnline"]=function(){var z=$.Deferred();NativeTransport.callNative({nativeCall:constants.NativeCallTypes.GET_NETWORK_INFO}).always(function(A){z.resolve(A!=null&&A[constants.NativeCallKeys.CONNECTED])});return z.promise()};this["getGameTimePlayedFromService"]=function(z){var A={packageName:z};return NativeTransport.serviceCall({target:"TimePlayedService",method:"getGameTimePlayed",httpMethod:"PUT",endPoint:i,args:A})};this["updateGameTimePlayedOnService"]=function(z,C,B){var A={packageName:z,totalTimePlayed:C,lastTimePlayed:B};return NativeTransport.serviceCall({target:"TimePlayedService",method:"updateGameTimePlayed",httpMethod:"PUT",endPoint:i,args:A})};this["getHandledType"]=function(){return u}};a.prototype=BaseHandler;return a}());console.log("TimePlayedHandler loaded.");