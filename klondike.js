/*windows纸牌

*author:liusaint1992
*email:841766635@qq.com
*date:20161028
*/

function Klondike(){
	//备份一个原始的数据
	this.baseBrand = this.createAll();

}
Klondike.prototype = {
	//初始操作
	init:function(){
		//发牌
		this.divBrand();
	},
	//生成原始的牌。52张牌
	createAll:function(){
		var numArr = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
		//红桃 黑桃 方块 梅花
		var typeArr = ['red-heart','black-spade','red-block','black-plum'];
		var pArr = [];
		var pItem;
		for (var i = numArr.length - 1; i >= 0; i--) {
			for (var j = typeArr.length - 1; j >= 0; j--) {
				pItem = {};
				pItem.num = numArr[i];
				pItem.type = typeArr[j];
				pItem.status = 'close';
				pArr.push(pItem);
			}
			
		}
		return pArr;
	},
	//从一个数组Arr中随机取出num个元素
	getRoundBrand:function(num,Arr){
		var resArr = [];
		// 乱序排列一下。洗牌。
		Arr.sort(function(){
			return Math.random()-0.5>0;
		})
		//获取返回的数组
		resArr = Arr.slice(0,num);
		//从原数组中删除
		Arr.splice(0,num);
		return resArr;

	},
	//发牌
	divBrand:function(){
		//用来发牌
		this.useBrand = this.baseBrand.slice();
		//左上角的24张牌
		this.upArr = this.getRoundBrand(24,this.useBrand);
		this.openBrand(this.upArr);
		//下面的28张牌-将再次分发
		this.downAllArr = this.getRoundBrand(28,this.useBrand);
		this.downArr = [];
		//下面七条。每条分别为1到7个。
		var downLen = 7;
		for (var i = 0; i < downLen; i++) {
			this.downArr[i] = this.getRoundBrand(i+1,this.downAllArr);
			//翻开第一张
			this.openBrand(this.downArr[i]);
			this.creatBottomDoms(this.downArr[i],i);
		}
		this.okObj = {
			'red-heart':[],
			'black-spade':[],
			'red-block':[],
			'black-plum':[]
		}
		//左上角下次打开的是哪一个，默认是0。
		this.topLeftIndex = 0;
	},
	//翻牌，打开一张牌。第二个参数不填就默认翻第一张
	openBrand:function(arr,index){
		index = index || 0;
		arr[index] && (arr[index].status = 'open');
	},
	//获取某张牌的index。用来比较大小。
	getIndex:function(obj){
		var num = obj.num;
		var index;
		switch(num){
			case 'A':
			index = 0;
			break;
			case 'J':
			index = 10;
			break;
			case 'Q':
			index = 11;
			break;
			case 'K':
			index = 12;
			break;
			default:
			index = num-1;
			break;
		}
	},
	//判断两张牌的颜色是否一样,不一样就返回true,一样就返回false;
	checkColor:function(obj1,obj2){
		return obj1.type.split("-")[0] !== obj2.type.split("-")[0]
	},
	//判断一张牌或一个数组是否可以移动到指定位置 规则
	checkMove:function(arrFrom,arrTo){
		//出发数组中最大值。
		var fromBig = arrFrom[arrFrom.length-1];
		//如果是空数组，可以接受'K';
		if(arrTo.length == 0){
			var fromLen = arrFrom.length;
			if(fromBig.num == 'K'){
				return true;
			}
			return false;
		}
		//目标数组中最小值
		var toLittle = arrTo[0];
		//出发数组中的最大值与目的数组中的最小值得比较。颜色不同。
		if((this.getIndex(toLittle.num) - this.getIndex(fromBig.num) == 1)&&this.checkColor(toLittle,fromBig)){
			return true;M
		}

		return false;

	},

	//数组移动。从左上移动。或下面的牌之间的移动。一张或几张。
	moveArr:function(arrFrom,arrTo){
		//检测是否可以移动
		if(!this.checkMove(arrFrom,arrTo)){
			return;
		}
		for (var i = arrFrom.length-1; i >=0; i--) {
			arrTo.push(arrFrom[i]);
		}

		arrFrom.length = 0;
	},

	//检测移动到右上的几个框里行不行。参数是这张牌对应的这个数组参数。
	checkMoveOk:function(obj,toDom){
		var num = obj.num;
		var index = this.getIndex(num);
		var acceptType = toDom.data('type');
		var type = obj.type;
		// 类型不合适
		if(type != acceptType){
			return false;
		}

		var toArr = this.okObj[type];
		var toLen = toArr.length;
		var bigIndex;
		if(toLen == 0){
			bigIndex = -1;
		}else{
			bigIndex = this.getIndex(toArr[toArr.length-1].num);
		}
		//检测是否与已有的最大值相关一个序号。
		if(index - bigIndex != 1){
			return false ;
		}

		return true;
		
	},
	//如果它符合条件。可以把它移动到okArr中去
	checkGoHome:function(obj){
		var type = obj.type;
		var toArr = this.okObj[type];
		var toLen = toArr.length;
		var theIndex = this.getIndex(obj.num);
		//目标数组是空的，则检测其index
		if( 0 == toLen && theIndex == 0){
			return true;
		}
		//如果这个值的index等于目的数组的长度。则可以。
		if(theIndex == toLen){
			return true;
		}
		return false;
	},
	//点两下自动回家。
	autoGoHome:function(fromArr,obj){
		//检测一下。
		if(!this.checkGoHome(obj)){
			return;
		}

		// 移动到目的数组
		var type = obj.type;
		var toArr = this.okObj[type];
		toArr.push(obj);
		fromArr.length = fromArr.length - 1;
	},
	//点开一个左上角的
	openTop:function(){

		this.upArr;
		this.upArr[this.topLeftIndex].status = open;
		var html = this.createBrandDom(this.upArr[this.topLeftIndex]);
		$(".left-open").append(html);
		this.changeLeftIndex();
		
	},
	changeLeftIndex:function(){
		this.topLeftIndex ++;
		if(this.topLeftIndex == this.upArr.length){
			this.topLeftIndex = 0;
			$(".left-close").removeClass('brand-close');
		}else{
			$(".left-close").addClass('brand-close');
		}
	},
	//左上移除一个
	leftDel:function(index){
		// var upLen = this.upArr.length;
		// if(upLen == 1){
		// 	this.upArr.length = 0;
		// }
		this.upArr.splice(this.topLeftIndex-1,1);
	},
	insertBrand:function(){

	},
	searchIndex:function(dom,arr){

	},
	createBrandDom:function(obj){

		var brandHtml = '';
		var type = obj.type;
		var num = obj.num;
		var status = obj.status;
		var cssClass = '';

		if(status == 'close'){
			cssClass = 'brand brand-close';
			brandHtml = '<div class="'+cssClass+'">'
			+'</div>';
		}else{
			cssClass = 'brand brand-open '+type;
			brandHtml = '<div class="'+cssClass+'">'
			+'<span class="txt">'+ num +'</span>'
			+'<i></i>'
			+'</div>';
		}

		return brandHtml;
	},
	//下面是一些dom方法。
	//创建下面的初始。
	creatBottomDoms:function(arr,index){
		var html = '';
		var brandHtml = '';
		var type;
		var num;
		var status;
		var cssClass;
		var jqObj = $('.bottom-brands').eq(index);
		for (var i = 0,len = arr.length; i < arr.length; i++) {
			type = arr[i].type;
			num = arr[i].num;
			status =arr[i].status;
			if(status == 'close'){
				cssClass = 'brand brand-close';
				brandHtml = '<div class="'+cssClass+'">'
				+ brandHtml
				+'</div>';

			}else{
				cssClass = 'brand brand-open '+type;

				brandHtml = '<div class="'+cssClass+'">'
				+'<span class="txt">'+ num +'</span>'
				+'<i></i>'
				+ brandHtml
				+'</div>';
			}
		}
		jqObj.append(brandHtml)
	},
	//左边打开一个
	openLeft:function(){

	},
	//移动牌。
	moveBrands:function(domObj,domE){
		var that = this;
		//创建一个用于移动的dom。放在body下面。
		var moveDomObj = $(domObj.prop('outerHTML')).addClass('MovingBrand');
		$("body").append(moveDomObj);
		// 给这个创建的dom设置一个正确的位置。
		moveDomObj.offset(domObj.offset());
		//移动过程中先隐藏原来的。要设置一个timer。不然会影响offset的计算
		setTimeout(function(){
			domObj.hide();
		}, 1);
		

		var oldX = domObj.offset().left;
		var oldY = domObj.offset().top;


		var eX = domE.pageX;
		var eY = domE.pageY;
		var drag = false;	
		var timer;
		that.moving = true;

		moveDomObj.mousemove(function(event) {
		
			if(that.moving == false) return;
			if(drag) return;

			drag = true;
			clearTimeout(timer);
			timer = setTimeout(function(){
				var nowX = event.pageX;
				var nowY = event.pageY;
				var disX = nowX - eX;
				var disY = nowY - eY;
				moveDomObj.offset({
					left:oldX + disX,
					top:oldY +disY
				})
	
				drag = false;
			}, 0);

			return false;
		});

		$("body").off('mouseup').on('mouseup',function(event) {		
			drag = false;
			clearTimeout(timer);
			that.moving = false;
			// $(".MovingBrand").remove();
			that.getHoverDoms();
			domObj.show();
			return false;
		});



	},
	//检测牌是否移动到了某个区域内。
	//检测这张在移动的牌，有一个顶点在其坐标范围内。
	getHoverDoms:function(domObj){
		//检测是否移动到了下面的牌的区域内
		var bottomDoms = $(".bottom-brands .brand-open");
		var bottomLen = bottomDoms.length;
var inDomsArr = [];
		for (var i = 0; i < bottomLen; i++) {
			if(this.checkHover(bottomDoms.eq(i),$(".MovingBrand"))){
				inDomsArr.push(i);
			}

		}
		console.log(inDomsArr);
	},
	//检测牌是否移动到了某个区域内。
	//检测这张在移动的牌，有一个顶点在其坐标范围内。
	//A移动到B上。
	checkHover:function(domAObj,domBObj){


		// 目标dom的左上和右下坐标。
		var BOffset = domBObj.offset();
		var BX = BOffset.left;
		var BY = BOffset.top;
		var BX1 = BX + domBObj[0].offsetWidth; 
		var BY1 = BY + domBObj[0].offsetHeight; 

		//移动者
		var AOffset = domAObj.offset();
		var height = domAObj[0].offsetHeight;
		var width = domAObj[0].offsetWidth;

		//
		var checkArr = [];
		// 左上角
		var AX = AOffset.left;
		var AY = AOffset.top;
		checkArr.push([AX,AY]);		

		// 右上
		var AX1 = AX + width;
		var AY1 = AY;
		checkArr.push([AX1,AY1]);			

		// 左下
		var AX2 = AX;
		var AY2 = AY + height;
		checkArr.push([AX2,AY2]);	

		//右下
		var AX3 = AX + width; 
		var AY3 = AY + height;
		checkArr.push([AX3,AY3]);

		for (var i = 0,checkLen = checkArr.length; i < checkLen; i++) {
			var checkRes = checkIn(checkArr[i][0],checkArr[i][1]);
			if(checkRes){
				return checkRes;
			}
		}	 

		//检测坐标是否在某区域内。
		function checkIn(x,y){

			if(x>BX && y>BY && x<BX1 && y<BY1){
				return true;
			}
			return false;
		}

	},
	//绑定事件
	bindEvent:function(){
		var that = this;
		//左上点击效果。
		$("body").on('click', '.left-close', function(event) {		
			that.openTop();
		});

		$("body").on('mousedown', '.brand-open:not(.MovingBrand)', function(event) {
			if(that.moving == true) return;
			that.moving == true;			
			that.moveBrands($(this),event);
		});

	}


}

var g = new Klondike();

g.init();
g.bindEvent();


/*完成步骤：
1.生成所有的牌。
2.发牌。左上24张。下面7组。分别为1到7张。
3.翻牌。左上，以及下面的7组的第一张牌翻开。
4.一些规则性的基本方法。
10月31日
5.初始界面。布局。
6.拖动。http://www.zhangxinxu.com/study/js/zxx.drag.1.0.js




*/