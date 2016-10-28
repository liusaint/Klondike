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
		var numArr = [1,2,3,4,5,6,7,8,9,10,'J','Q','K'];
		var typeArr = ['red-heart','black-spade','red-block ','black-plum'];
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
		// 乱序排列一下
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
		//下面的28张牌-将再次分发
		this.downArr = this.getRoundBrand(28,this.useBrand);
		//下面七条。每条分别为1到7个。
		var downLen = 7;
		for (var i = 0; i < downLen; i++) {
			this[i] = this.getRoundBrand(i+1,this.downArr);
		}

	}


}

var g = new Klondike();

g.init();