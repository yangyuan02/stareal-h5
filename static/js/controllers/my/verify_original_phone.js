'use strict';

stareal
    .controller("VerifyOriginalPhoneController", function ($scope, $api, $stateParams, $alert, $document, localStorageService, $state, $interval) {
        $scope.oldTelphone_no = localStorageService.get("telphone_no");
        $scope.telphone_no = "";
        $scope.accessToken = "";
        $scope.paracont = "获取验证码";
        $scope.code = "";
        $scope.login = {
            sendCode:function () {
                if($scope.telphone_no!=$scope.oldTelphone_no){
                    $alert.show("请输入原手机号");
                    return false;
                }
                var second = 60;
                var timerHandler = undefined;
                if (!this.validatemobile($scope.telphone_no)) {
                    return;
                }
                // 验证码
                $api.get("app/login/code/retrieve", {mobile:$scope.telphone_no, type: "0"})
                    .then(function (ret) {
                        if (ret.retCode == "0") {
                            $alert.show("验证码已发送!");
                            localStorageService.set('code_smsToken', ret.accessToken);
                            $scope.accessToken = ret.accessToken;
                        } else {
                            $alert.show("验证码发送失败，请稍后重试!");
                        }
                    });

                if (timerHandler) {
                    return;
                }
                timerHandler = $interval(function () {
                    if (second <= 0) {
                        $interval.cancel(timerHandler);
                        timerHandler = undefined;
                        second = 60;
                        $scope.paracont = "重发";
                    } else {
                        $scope.paracont = second + "秒";
                        second--;

                    }
                }, 1000, 100)
            },
            next:function (){
                if (!this.validatemobile($scope.telphone_no)) {
                    return;
                }
                if (!localStorageService.get('code_smsToken')) {
                    $alert.show("请先获取验证码！");
                    return false;
                }
                if (!$scope.code) {
                    $alert.show("验证码不能为空！");
                    return false;
                }
                $api.get("app/login/code/retrieve", {mobile:$scope.telphone_no, type: "1", code:$scope.code, smsAccessToken:$scope.accessToken})
                    .then(function (ret) {
                        if (ret.retCode == "0") {
                            $state.go('my.modify_binding',{});
                        }
                    },function (err) {
                        $alert.show(err)
                    });
            },
            validatemobile:function (mobile) {
                if(!mobile){
                    $alert.show("请输入手机号")
                    return false
                }
                if (mobile.toString().length == 0) {
                    $alert.show('请输入手机号码！');
                    return false;
                }
                if (mobile.toString().length != 11) {
                    $alert.show('请输入11位手机号码！');
                    return false;
                }
                var myreg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
                if (!myreg.test(mobile)) {
                    $alert.show('请输入有效的手机号码！');
                    return false;
                }
                return true;
            }
        }
    });