/*windows纸牌

*author:liusaint1992
*email:841766635@qq.com
*date:20161028
*/


//整合一个工具类,把一些逻辑抽出来。一些与主要的业务逻辑关联不大的分出来。

var Tools = {
	//从一个数组Arr中随机取出num个元素。并从原数组中删除。 
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
		return index;
	},
	//获取一个arr在另一个arr中的次序。这里可以用判断对象相等。
	getArrIndex:function(arrSmall,arrBig){
		for (var i = 0,len=arrBig.length; i < len; i++) {
			if(arrSmall == arrBig[i]){
				return i;
			}
		}

	},	
	//检测元素A与元素B是否有重合部分，检测这张在移动的牌，有一个顶点在其坐标范围内。
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
	//生成原始的牌。52张牌。包括数字，花色。状态。
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
	//检测一个节点是位于哪个位置
	getWhere:function(domObj){
		//右上
		if(domObj.parents(".ok-brands").length>0){
			return 'in-ok-brands';
		}
		//下。
		if(domObj.parents(".bottom-brands").length>0){
			return 'in-bottom-brands';
		}
		//左上。
		if(domObj.parents(".left-open").length>0){
			return 'in-left-open';
		}
	},
	//发牌。左上。和下面。参数，要操作的这个对象。
	divBrand:function(that){
		//用来发牌
		that.useBrand = that.baseBrand.slice();
		//左上角的24张牌
		that.upArr = Tools.getRoundBrand(24,that.useBrand);
		that.openBrand(that.upArr);
		//下面的28张牌-将再次分发
		that.downAllArr = Tools.getRoundBrand(28,that.useBrand);
		that.downArr = [];
		//下面七条。每条分别为1到7个。
		var downLen = 7;
		for (var i = 0; i < downLen; i++) {
			that.downArr[i] = Tools.getRoundBrand(i+1,that.downAllArr);
			//翻开第一张
			that.openBrand(that.downArr[i]);
			Tools.creatBottomDoms(that.downArr[i],i);
		}
		that.okObj = {
			'red-heart':[],
			'black-spade':[],
			'red-block':[],
			'black-plum':[]
		}
		//左上角下次打开的是哪一个，默认是0。
		that.topLeftIndex = 0;
	},
	//判断两张牌的颜色是否一样,不一样就返回true,一样就返回false;
	checkColor:function(obj1,obj2){
		return obj1.type.split("-")[0] !== obj2.type.split("-")[0]
	},
	//判断一个数组是否可以移动到另一个数组中。针对移动到下面。
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
		if((Tools.getIndex(toLittle) - Tools.getIndex(fromBig) == 1)&&Tools.checkColor(toLittle,fromBig)){
			return true;
		}

		return false;

	},
	//根据obj创建一张牌
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

	//创建下面的初始牌
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

}



function Klondike(){
	//备份一个原始的数据
	this.baseBrand = Tools.createAll();

}
//核心逻辑在下面
Klondike.prototype = {
	//初始操作
	init:function(){
		//发牌,把实例对象传递过去。
		Tools.divBrand(this);
	},
	//翻牌，打开一张牌。第二个参数不填就默认翻第一张
	openBrand:function(arr,index){
		index = index || 0;
		arr[index] && (arr[index].status = 'open');
	},


	//数组移动。从左上移动。或下面的牌之间的移动。一张或几张。
	moveArr:function(arrFrom,arrTo,domObj){
		//检测是否可以移动
		
		if(!Tools.checkMove(arrFrom,arrTo)){
			domObj.show();
			$(".MovingBrand").remove();
			return false;
		}
		// debugger;
		var fromLen = arrFrom.length;
		for (var i = fromLen-1; i >=0; i--) {
			arrTo.unshift(arrFrom[i]);
		}
		var fromArrIndex = domObj.parents('.bottom-brands').index();

		//判断是否在上面。是否是从上面移动。
		var isLeft = !!(domObj.parents('.left-open').length>0);

		var toArrIndex = Tools.getArrIndex(arrTo,this.downArr);
		console.log(fromArrIndex);

		//没有就直接添加，有就添加到最后一个里。
		if($(".bottom-brands:eq("+toArrIndex+") .brand").length>0){
			$(".MovingBrand").removeClass("MovingBrand").appendTo(".bottom-brands:eq("+toArrIndex+") .brand:last");
		}else{
			$(".MovingBrand").removeClass("MovingBrand").appendTo(".bottom-brands:eq("+toArrIndex+")");
		}
		

		domObj.remove();
		//删除第一个元素.后期可用splice进行多个的操作。
		if(isLeft){
			//注意这里的topLeftIndex会不会影响上面的逻辑。
			this.upArr.splice(this.topLeftIndex-1,1);
			this.topLeftIndex--;
		}else{
			this.downArr[fromArrIndex].splice(0,fromLen);
			this.downArr[fromArrIndex][0]
			&&(this.downArr[fromArrIndex][0].status = 'open')
			&&$(".bottom-brands:eq("+fromArrIndex+") .brand:last")
			.addClass('brand-open')
			.removeClass('brand-close')
			.addClass(this.downArr[fromArrIndex][0].type)
			.html('<span class="txt">'+this.downArr[fromArrIndex][0].num+'</span><i></i>');
			arrFrom.length = 0;
		}
		
		return true;
	},

	//检测移动到右上的几个框里行不行。参数是这张牌对应的这个obj参数。
	checkMoveOk:function(obj,domIndex){
		
		var index = Tools.getIndex(obj);
		var acceptDom = $(".ok-brands").eq(domIndex);

		// 类型不合适
		if(acceptDom.find("."+obj.type).length == 0 && acceptDom.find(".brand").length>0){
			return false;
		}
		var type = obj.type;
		debugger;
		var toArr = this.okObj[type];
		var toLen = toArr.length;
		var bigIndex;
		if(toLen == 0){
			bigIndex = -1;
		}else{
			bigIndex = Tools.getIndex(toArr[0]);
		}
		//检测是否与已有的最大值相关一个序号。
		if(index - bigIndex != 1){
			return false ;
		}

		return true;
		
	},
	// 移动到okArr
	moveOkArr:function(obj,toIndex,domObj){
		//检查是否可以移动。
		if(!this.checkMoveOk(obj,toIndex)){
			return false;
		}

		this.okObj[obj.type].unshift(obj);

		var fromArrIndex = domObj.parents('.bottom-brands').index();
		
		//判断是否在上面。是否是从上面移动。
		var isLeft = !!(domObj.parents('.left-open').length>0);

		$(".MovingBrand").removeClass("MovingBrand").appendTo(".ok-brands:eq("+toIndex+")");

		domObj.remove();
		//删除第一个元素.后期可用splice进行多个的操作。
		if(isLeft){
			//注意这里的topLeftIndex会不会影响上面的逻辑。
			this.upArr.splice(this.topLeftIndex-1,1);
			this.topLeftIndex--;
		}else{
			this.downArr[fromArrIndex].shift();
			this.downArr[fromArrIndex][0]
			&&(this.downArr[fromArrIndex][0].status = 'open')
			&&$(".bottom-brands:eq("+fromArrIndex+") .brand:last")
			.addClass('brand-open')
			.removeClass('brand-close')
			.addClass(this.downArr[fromArrIndex][0].type)
			.html('<span class="txt">'+this.downArr[fromArrIndex][0].num+'</span><i></i>');
		}
		


		
		return true;

	},
	//如果它符合条件。可以把它移动到okArr中去
	// checkGoHome:function(obj){
	// 	var type = obj.type;
	// 	var toArr = this.okObj[type];
	// 	var toLen = toArr.length;
	// 	var theIndex = this.getIndex(obj);
	// 	//目标数组是空的，则检测其index
	// 	if( 0 == toLen && theIndex == 0){
	// 		return true;
	// 	}
	// 	//如果这个值的index等于目的数组的长度。则可以。
	// 	if(theIndex == toLen){
	// 		return true;
	// 	}
	// 	return false;
	// },
	//点两下自动回家。
	// autoGoHome:function(fromArr){
	// 	var obj = fromArr[0];
	// 	//检测一下。
	// 	console.log(this.checkGoHome(obj));
	// 	if(!this.checkGoHome(obj)){
	// 		return;
	// 	}

	// 	// 移动到目的数组
	// 	var type = obj.type;
	// 	var toArr = this.okObj[type];
	// 	toArr.push(obj);
	// 	fromArr.length = fromArr.length - 1;
	// },
	//点开一个左上角的
	openTop:function(){

		this.upArr;
		this.upArr[this.topLeftIndex].status = open;
		var html = Tools.createBrandDom(this.upArr[this.topLeftIndex]);
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


	//下面是一些dom方法。


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
		// debugger;	
		drag = false;
		clearTimeout(timer);
		that.moving = false;
			// $(".MovingBrand").remove();
			that.getHoverDoms(domObj);
			// domObj.show();
			return false;
		});



	},
	//检测牌是否移动到了某个区域内。
	//检测这张在移动的牌，有一个顶点在其坐标范围内。
	getHoverDoms:function(domObj){

		if(this.getHoverBottom(domObj)){
			return;
		}
		this.getHoverOk(domObj);
		domObj.show();
		$(".MovingBrand").remove();
	},
	//移动到下面的
	getHoverBottom:function(domObj){
		//检测是否移动到了下面的牌的区域内
		var bottomDoms = $(".bottom-brands"); //.brand-open
		var bottomLen = bottomDoms.length;
		var inDomsArr = [];
		var domIndex = domObj.parents('.bottom-brands').index();
		for (var i = 0; i < bottomLen; i++) {
			//它本身那一列
			if(i == domIndex){
				continue;
			}
			if(Tools.checkHover(bottomDoms.eq(i),$(".MovingBrand"))){
				inDomsArr.push(i);
			}
		}
		//判断是否在上面。是否是从上面移动。
		var isLeft = !!(domObj.parents('.left-open').length>0);

		var inLen = inDomsArr.length;
		// 表示不在任何一个地方。则回到原地去。
		if(0 == inLen){
			return false;
		}else{
			//对于区域内的。进行检查。
			// debugger;
			//表示在移动的有几张牌
			var moveLen = domObj.parent().find('.brand-open').length;
			for (var j = 0; j < inDomsArr.length; j++) {
				//移动，两个都适合的情况移动第一个。
				//如果是左上移动下来的。
				if(isLeft){
					if(this.moveArr([this.upArr[this.topLeftIndex-1]],this.downArr[inDomsArr[j]],domObj)){
						break;
					};
					continue;
				}

				if(this.moveArr(this.downArr[domIndex].slice(0,moveLen),this.downArr[inDomsArr[j]],domObj)){
					break;
				};
			}
			return true;
		}
	},
	//移动到右上的
	getHoverOk:function(domObj){
		//检测是否移动到了下面的牌的区域内
		var okDoms = $(".ok-brands"); //.brand-open
		var okLen = okDoms.length;
		var inDomsArr = [];
		var domIndex = domObj.parents('.bottom-brands').index();
		for (var i = 0; i < okLen; i++) {

			if(Tools.checkHover(okDoms.eq(i),$(".MovingBrand"))){
				inDomsArr.push(i);
			}

		}
		//判断是否在上面。是否是从上面移动。
		var isLeft = !!(domObj.parents('.left-open').length>0);

		var inLen = inDomsArr.length;
		// 表示不在任何一个地方。则回到原地去。
		if(0 == inLen){
			domObj.show();
			$(".MovingBrand").remove();
		}else{
			//对于区域内的。进行检查。
			// debugger;
			//表示在移动的有几张牌
			var moveLen = domObj.parent().find('.brand-open').length;
			if(moveLen>1 && (!isLeft)){
				return;
			}
			for (var j = 0; j < inDomsArr.length; j++) {
				//移动，两个都适合的情况移动第一个。
				if(isLeft){

					if(this.moveOkArr(this.upArr[this.topLeftIndex-1],inDomsArr[j],domObj)){
						break;
					};
					continue;
				}
				if(this.moveOkArr(this.downArr[domIndex][0],inDomsArr[j],domObj)){
					break;
				};
			}
		}
	},

	//绑定事件
	bindEvent:function(){
		var that = this;
		//左上点击效果。
		$("body").on('click', '.left-close', function(event) {		
			that.openTop();
		});
		var timer;
		$("body").on('mousedown', '.brand-open:not(.MovingBrand)', function(event) {
			// console.log(1);
			var domObj = $(this);
			clearTimeout(timer);
			$("body").off('mouseup');
			timer = setTimeout(function(){
				if(that.moving == true) return;
				
				that.moving == true;			
				that.moveBrands(domObj,event);
			}, 0);
			return false;
		});
		//点两下回到正确的位置,这个先不做。
		// $("body").on('dblclick ', '.brand-open:not(.MovingBrand)', function(event) {
		// 	console.log(2);
		// 	clearTimeout(timer);
		// 	$(".brand-open:not(.MovingBrand)").show();
		// 	$(".MovingBrand").remove();
		// 	$("body").off('mouseup');

		// 	// debugger;
		// 	var where = that.getWhere($(this));
		// 	var moveObj;
		// 	var fromArr;

		// 	//如果它在右上，则不执行操作。
		// 	if(where == 'in-ok-brands'){
		// 		return;
		// 	}
		// 	//在下面
		// 	if(where == 'in-bottom-brands'){
		// 		var fromIndex = $(this).parents(".bottom-brands").index();
		// 		var fromArr = that.downArr[fromIndex];
		// 		that.autoGoHome(fromArr);

		// 	}
		// 	//在左上
		// 	if(where == 'in-left-open'){

		// 	}



		// });
	},



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