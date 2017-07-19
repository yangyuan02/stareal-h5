'use strict';

stareal
    .controller("MessagePraiseController", function ($scope, $api,$state,localStorageService,$lazyLoader) {
        $scope.goods = new $lazyLoader("app/notify/retrieve", {kind:2},true);
        //设为已读
        $scope.goComment = function (id,state,notify_id,index) {
            $state.go('my.comment_detail',{comment_id:id})
            if(state=='未读'){
                $api.get("app/notify/setRead",{notify_id:notify_id},true)
                    .then(function (ret) {
                        $scope.goods.items[index].state='已读';
                    })
            }
        }
    });