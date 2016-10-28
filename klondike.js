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
		var numArr = [1,2,3,4,5,6,7,8,9,10,'J','Q','K'];
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
		}
	},
	//翻牌，打开一张牌。第二个参数不填就默认翻第一张
	openBrand:function(arr,index){
		index = index || 0;
		arr[index] && (arr[index].status = 'open');
	},
	//获取某张牌的index。用来比较大小。
	getIndex：function(obj){
		var num = obj.num;
		var index;
		switch(num){
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
			index = num;
			break;
		}
	},
	//判断两张牌的颜色是否一样,一样就返回true,不一样就返回false;
	checkColor:function(obj1,obj2){
		return obj1.type.split("-")[0] === obj2.type.split("-")[0]
	}

}

var g = new Klondike();

g.init();


/*完成步骤：
1.生成所有的牌。
2.发牌。左上24张。下面7组。分别为1到7张。
3.翻牌。左上，以及下面的7组的第一张牌翻开。
4.一些规则性的基本方法。
