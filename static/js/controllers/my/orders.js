'use strict';

stareal
    .controller("OrdersController", function ($scope, $lazyLoader, $api, $state,$alert,$stateParams,$timeout,$interval,$window,localStorageService) {
        $scope.status = $stateParams.status;
        $scope.orders = new $lazyLoader("app/order/list/retrieve", {status:$scope.status}, true);
        //取消订单
        $scope.cancelOrder = function (order_id,order) {
            if($scope.orders.items.indexOf(order)!=-1){
                var index = $scope.orders.items.indexOf(order);
                $api.post("app/order/cancel", {orderId:order_id}, true)
                    .then(function (ret) {
                        $scope.orders.items[index].new_state='已取消'
                        $alert.show('取消成功')
                    }, function (err) {
                        $alert.show(err)
                    });
            }
        };
        //删除订单
        $scope.deleteOrder = function (order_id,order) {
            if($scope.orders.items.indexOf(order)!=-1){
                var index = $scope.orders.items.indexOf(order);
                $api.post("app/order/delete",{orderId:order_id},true)
                    .then(function (ret) {
                        $scope.orders.items.splice(index,1)
                        $alert.show('删除成功')
                    },function (err) {
                        $alert.show(err)
                    })
            }
        }
        //确认收货
        $scope.donelOrder = function (order_id,order) {
            if($scope.orders.items.indexOf(order)!=-1){
                var index = $scope.orders.items.indexOf(order);
                $api.post("app/order/done", {orderId:order_id}, true)
                    .then(function (ret) {
                        $scope.orders.items[index].new_state='已完成'
                    }, function (err) {
                        $alert.show(err)
                    });
            }
        };
        // 开始弹窗
        var timer=null;
        $scope.verify = function (order_id,time) {
            //校验通过
            $scope.orderId = order_id;
            $scope.create_time = Date.parse(new Date(time.replace(/-/gi,'/')))//兼容ios问题
            var expiredTime =  $scope.create_time+15*60*1000;//过期时间戳
            var nowDate =  Date.parse(new Date());//现在时间戳
            $scope.date = expiredTime-nowDate;
            timer = $interval(updateTime,1000)
            updateTime()
            function updateTime() {
                $scope.date -= 1000;
                if($scope.date<=0){
                    $interval.cancel(timer);
                    $alert.show('商品已过期');
                    $scope.close();
                    $window.location.reload();
                }
            }
            var h = document.body.scrollHeight;
            $(".mask_pay").css({"height":h,"display":"block"}
            );
            $(".pay_box").css({"display":"block"});
        }
        $scope.close = function () {
            $(".mask_pay").fadeOut();
            $interval.cancel(timer);//关闭定时器
        }
        //冒泡
        $scope.bubble = function ($event){
            $event.stopPropagation()
        }

        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger' || typeof WeixinJSBridge != "undefined") {
            $scope.showPay = true;
            $scope.payType = 0
        } else {
            $scope.payType = 4
        }
        //支付订单
        $scope.pay = function () {
            console.log($scope.orderId)
            ///支付宝
            if($scope.payType==4){
                //支付
                $api.post("app/pay/gateway/create", {
                    orderId: $scope.orderId,
                    tradeType: 0,
                    payType: 4
                }, true)
                    .then(function (ret) {
                        document.forms['alipaysubmit']._input_charset.value = ret.data._input_charset;
                        document.forms['alipaysubmit'].subject.value = ret.data.subject;
                        // document.forms['alipaysubmit'].it_b_pay.value = ret.data.it_b_pay;
                        document.forms['alipaysubmit'].sign.value = ret.data.sign;
                        document.forms['alipaysubmit'].notify_url.value = ret.data.notify_url;
                        document.forms['alipaysubmit'].body.value = ret.data.body;
                        document.forms['alipaysubmit'].payment_type.value = ret.data.payment_type;
                        document.forms['alipaysubmit'].out_trade_no.value = ret.data.out_trade_no;
                        document.forms['alipaysubmit'].partner.value = ret.data.partner;
                        document.forms['alipaysubmit'].service.value = ret.data.service;
                        document.forms['alipaysubmit'].total_fee.value = ret.data.total_fee;
                        document.forms['alipaysubmit'].return_url.value = ret.data.return_url;
                        document.forms['alipaysubmit'].app_pay.value = ret.data.app_pay;
                        document.forms['alipaysubmit'].sign_type.value = ret.data.sign_type;
                        document.forms['alipaysubmit'].seller_id.value = ret.data.seller_id;
                        document.forms['alipaysubmit'].show_url.value = ret.data.show_url;
                        document.forms['alipaysubmit'].submit();
                    }, function (err) {
                        $alert.show(err);
                        $state.go("my.orders", {})
                    })
            }
            //微信支付
            if($scope.payType==0){
                $api.post("app/pay/gateway/create",{
                    orderId: $scope.orderId,
                    tradeType: 0,
                    payType: 0,
                    openid: localStorageService.get('openid')
                },true)
                    .then(function (ret) {
                        function onBridgeReady() {
                            WeixinJSBridge.invoke(
                                'getBrandWCPayRequest',
                                {
                                    "appId": ret.data.appId,                  //公众号名称，由商户传入wxd39f7e740343d507
                                    "timeStamp": ret.data.timeStamp,          //时间戳，自1970年以来的秒数
                                    "nonceStr": ret.data.nonceStr,            //随机串
                                    "package": ret.data.package,
                                    "signType": ret.data.signType,            //微信签名方式：
                                    "paySign": ret.data.paySign                  //微信签名
                                }, function (res) {
                                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                                        // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                                        alert("支付成功!");
                                    } else if (res.err_msg == "get_brand_wcpay_request:cancel") {
                                        alert("您已取消支付,订单将在15分钟后取消!");
                                        $state.go("my.orders", {});
                                    } else {
                                        alert("支付失败: [" + res.err_code + "] " + res.err_desc);
                                        $state.go("my.orders", {});
                                    }
                                }
                            );
                        }

                        if (typeof WeixinJSBridge == "undefined") {
                            if (document.addEventListener) {
                                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                            } else if (document.attachEvent) {
                                document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                                document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                            }
                        } else {
                            onBridgeReady();
                        }
                    },function (err) {
                        $alert.show(err)
                    })
            }
        }
    });