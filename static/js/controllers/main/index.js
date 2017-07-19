'use strict';

stareal
    .controller("IndexController", function ($scope, $api, $alert, $document, localStorageService, $state,$timeout,$compile) {
        $scope.mypage = 1;
        $scope.my_sing = 1;//我的页面隐藏gif图
        $api.get("app/main/latest/local",{},true) //本地最近五条信息
            .then(function (ret) {
                $scope.datasetData = ret.data.slice(0,5);
                console.log($scope.datasetData)
                $timeout(function(){
                    var className = $(".slideUl");
                    var i = 0,sh;
                    var liLength = className.children("li").length;
                    var liHeight = className.children("li").height() + parseInt(className.children("li").css('border-bottom-width'));
                    var html = className.html() + className.html()
                    var $html = $compile(html)($scope);
                    className.append($html);
                    sh = setInterval(slide,4000);
                    function slide(){
                        if (parseInt(className.css("margin-top")) > (-liLength *  liHeight)) {
                            i++;
                            className.animate({
                                marginTop : -liHeight * i + "px"
                            },"slow");
                        } else {
                            i = 0;
                            className.css("margin-top","0px");
                        }
                    }
                },0)
            },function (err) {
                $alert.show(err)
            })
        // return url 回挑
        var rs = localStorageService.get('rs');
        if (rs) {
            localStorageService.remove('rs');
            var _state = rs.substring(0, rs.indexOf('-'));
            var _param = rs.substring(rs.indexOf('-') + 1, rs.length);

            $state.go(_state, eval('(' + _param + ')'));
            return;
        }
        //首页轮播
        $api.get("app/main/ad/retrieve",{})
            .then(function (ret) {
                $scope.advs = ret.data; //首页轮播
                angular.element('#carousel-demo').height($document.width() * 29/ 50)
            })
        //列表
        $api.get("app/main/latest/good",{})
            .then(function (ret) {
                $scope.latest = ret.data  //列表
            })
        //导航分类
        $timeout(function () {
            var swiper = new Swiper('.nav', {
                slidesPerView: 4,
                slidesPerGroup : 4,
                spaceBetween:0,
                pagination: '.swiper-pagination',//分页容器
                observer:true//修改swiper自己或子元素时，自动初始化swiper
            })
        },0)
        //活动推荐
        $timeout(function () {
            var swiper = new Swiper('.activity', {
                effect: 'coverflow',  //切换效果
                centeredSlides: true,  //显示居中状态
                slidesPerView: 'auto',  //显示的多少个
                loop : true,  //循环
                coverflow: {
                    rotate: 50,//slide做3d旋转时Y轴的旋转角度。默认50。
                    stretch: 50,//每个slide之间的拉伸值，越大slide靠得越紧。 默认0。
                    depth:0,  //slide的位置深度。值越大z轴距离越远，看起来越小。 默认100。
                    modifier: 1,//depth和rotate和stretch的倍率，相当于depth*modifier、rotate*modifier、stretch*modifier，值越大这三个参数的效果越明显。默认1。
                    slideShadows : false //开启slide阴影。默认 true。
                }
            });
        },0)
        //点击跳转
        var _wrapper = document.getElementById("swiper-wrapper");
        _wrapper.addEventListener("click",function (e) {
            switch (e.target.id){
                case "activity-item-1":
                    $scope.$apply(function () {
                                $alert.show("活动暂未开启")
                            })
                    break;
                case "activity-item-2":
                    window.location.href='#/main/privilege'
                    break;
                case "activity-item-3":
                    window.location.href='#/my/share'
                    break;
            }
        },false)
    });