//class player
class Player{
	constructor(query,left,top, size){
		this.self = query;

		this._left = left;
		this._top = top;
		
		this.setSize(size);
		this.updatePosition();
	}

	updatePosition(){
		this.self.css({
			'left': this._left + 'px',
			'top': this._top + 'px'
		});
	}

	setPosition(left,top){
		this._left = left;
		this._top = top;
		this.updatePosition();
	}
	setSize(size){
		this.self.css({
			'height': size + 'px',
			'width': size + 'px'
		});
	}
	setRotation(angle){
		this.self.css( 'transform','rotate(' + angle + 'deg)');
	}

	checkCollision(selector){
		var obj = $(selector);
		var playerQuerry = this.self;

		var result = false;

		obj.each(function(){
			if( isCollised($(this),playerQuerry) ){
				result = true;
				return false; //breaking
			}
		});

		function isCollised($div1, $div2) {
			var x1 = $div1.offset().left;
			var y1 = $div1.offset().top;
			var h1 = $div1.outerHeight(true);
			var w1 = $div1.outerWidth(true);
			var b1 = y1 + h1;
			var r1 = x1 + w1;
			var x2 = $div2.offset().left;
			var y2 = $div2.offset().top;
			var h2 = $div2.outerHeight(true);
			var w2 = $div2.outerWidth(true);
			var b2 = y2 + h2;
			var r2 = x2 + w2;

			return !(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2);
		}

		return result;

	}

	set left(left){
		this._left = left;
		this.updatePosition();
	}
	get left(){ return this._left;}
	set top(top){
		this._top = top;
		this.updatePosition();
	}
	get top(){ return this._top;}
}




$(window).ready(()=>{

	const GAME_HEIGHT = 600; //height of game window
	const PLAYER_SIZE = 40; //player css size
	const SPEED = 5;

	var player = new Player( $('#player'), 100, 250,PLAYER_SIZE);
	var level = $('.level');
	//background
	var bCont = $('.container');
	var bGreen = $('.container .green');

	var scores = 0;

	var isAlive = true;
	//game loop
	setInterval(()=>{
		if(isAlive){
			//level moving
			level.css('left', (parseInt(level.css('left')) - SPEED) + 'px');
			player.left += SPEED; //player always in one position 

			//settint position by volume
			player.top = (GAME_HEIGHT-PLAYER_SIZE) - limiter(volume*1.5,0,50)/50*(GAME_HEIGHT-PLAYER_SIZE);
			
			//background
			bCont.css('background-position', -player.left/4 +"px 0");
			bGreen.css('background-position', -player.left/2 +"px 400px");


			//rotatiion of bird
			var dx = 700;
		    var dy = 300 - player.top;
		    player.setRotation(Math.atan2(dy, dx) * 180/Math.PI);


		    
		    if(player.checkCollision('.bottom, .top')){
		    	isAlive = false;
		    	$('.lose').html("You have reached " + scores + " scores.<br/>"
		    		+ "Your record is " + scoreRecord(scores) + " scores.<br/><br/>"
		    		+"Press R to restart!")
		    	.show('fast');
		    }
		}

	}, 10);

	//tube spawner
	setInterval(()=>{
		if(isAlive){
			var rand = -1 * Math.random()*300;
			var tube = $('<div/>').addClass('tube').css({
	        	'top': rand + 'px',
	        	'left': (-parseInt(level.css('left')) + 750) + 'px'
	    	}).html(
	    		`<div class="top"></div>
	    		 <div class="bottom"></div>`
	    	)
			level.append(tube);
			setTimeout(()=>{
				if(isAlive){
					tube.remove();
					scores++;
					updateScores();
				}
			}, (10000/SPEED) );
		}
	}, 10000/SPEED);


	//restarting game
	$('body').keydown(function(e){
		if(e.keyCode == 82) RestartGame();
	});

	function RestartGame(){
		$('.tube').remove();
		level.css('left', 0);
		player.setPosition(100, 250);

		scores = 0;
		updateScores();
		$('.lose').hide();
		isAlive = true;
	}
	function updateScores(){
		$('#score').html('Score: ' + scores);
	}
	//bestResults
	function scoreRecord(count){
		//if undefined
		if( !(!!localStorage.getItem("FlappyRecord"))  ){
			localStorage.setItem("FlappyRecord", count);
			return count;
		} 

		if( count > +localStorage.getItem("FlappyRecord")){
			localStorage.setItem("FlappyRecord", count);
			return count;
		}
		else return +localStorage.getItem("FlappyRecord");
	}
});

function limiter(value,min,max){
    if(value <= min ) return min;
    if(value >= max ) return max;
    return value;
}