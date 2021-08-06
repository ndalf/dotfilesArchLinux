if ((typeof browser !== "undefined")) {

    // browser.proxy.register("assets/js/firefox/pac.js").then(function () {
    //     //console.log("REGISTER DONE");
    // }).catch(function (reason) {
    //     console.log("ERROR", reason);
    // });
    var enabled = false;
    var proxy =  {
        type: "direct",
        host: null,
        port: null
    };
    browser.runtime.onMessage.addListener(function (message, sender, response) {

        if (!message || typeof message !== 'object')
            return;
    
        if (message.proxy && typeof message.enabled !== "undefined") {
            enabled = message.enabled;
            proxy = message.proxy;

            if(enabled){
                browser.proxy.onRequest.addListener( handleProxyRequest , {urls: ["<all_urls>"]});
            }else{
                browser.proxy.onRequest.removeListener(  handleProxyRequest );
            }
           
        }
    
        response(
            {
                "enabled": enabled,
                "proxy": proxy
            }
        );
    });
    browser.proxy.onError.addListener( data => {
       console.log('-- fixed server error', data);
      }
    );
    // DEFINE THE HANDLER FOR FIREFOX PROXY
    function handleProxyRequest(requestInfo) {
           
        // don't know is this in corrent but witj {type:"direct"} nothing works
        // console.log("handleProxyRequest ", proxy);
        return proxy;
        //return {type: "direct"};
      }
}
