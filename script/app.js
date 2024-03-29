class Player {
  constructor(query, left, top, size) {
    this.self = query;

    this._left = left;
    this._top = top;

    this.setSize(size);
    this.updatePosition();
  }

  updatePosition() {
    this.self.css({
      left: this._left + "px",
      top: this._top + "px",
    });
  }

  setPosition(left, top) {
    this._left = left;
    this._top = top;
    this.updatePosition();
  }
  setSize(size) {
    this.self.css({
      height: size + "px",
      width: size + "px",
    });
  }
  setRotation(angle) {
    this.self.css("transform", "rotate(" + angle + "deg)");
  }

  checkCollision(selector) {

	const isCollised = ($div) => {
		const x1 = $div.offset().left;
		const y1 = $div.offset().top;
		const h1 = $div.outerHeight(true);
		const w1 = $div.outerWidth(true);
		const b1 = y1 + h1;
		const r1 = x1 + w1;
		const x2 = playerQuerry.offset().left;
		const y2 = playerQuerry.offset().top;
		const h2 = playerQuerry.outerHeight(true);
		const w2 = playerQuerry.outerWidth(true);
		const b2 = y2 + h2;
		const r2 = x2 + w2;
  
		return !(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2);
	  }

    const obj = $(selector);
    const playerQuerry = this.self;

    let result = false;

    obj.each(function () {
      if (isCollised($(this))) {
        result = true;
        return false; //breaking
      }
    });



    return result;
  }

  set left(left) {
    this._left = left;
    this.updatePosition();
  }
  get left() {
    return this._left;
  }
  set top(top) {
    this._top = top;
    this.updatePosition();
  }
  get top() {
    return this._top;
  }
}

$(window).ready(() => {
  const GAME_HEIGHT = 600;
  const PLAYER_SIZE = 40;
  const SPEED = 6;

  const player = new Player($("#player"), 100, 250, PLAYER_SIZE);
  const level = $(".level");

  //background
  const bCont = $(".container");
  const bGreen = $(".container .green");

  let scores = 0;

  let isAlive = true;

  //game loop
  setInterval(() => {
    if (isAlive) {
      // level moving
      level.css("left", parseInt(level.css("left")) - SPEED + "px");
      player.left += SPEED;

      //setting position by volume
      player.top =
        GAME_HEIGHT -
        PLAYER_SIZE -
        (limiter(volume * 1.5, 0, 50) / 50) * (GAME_HEIGHT - PLAYER_SIZE);

      //background
      bCont.css("background-position", -player.left / 4 + "px 0");
      bGreen.css("background-position", -player.left / 2 + "px 400px");

      // rotation of the bird
      const dx = 700;
      const dy = 300 - player.top;
      player.setRotation((Math.atan2(dy, dx) * 180) / Math.PI);

      if (player.checkCollision(".bottom, .top")) {
        isAlive = false;
        $(".lose")
          .html(
            "You have reached " +
              scores +
              " scores.<br/>" +
              "Your record is " +
              recordScore(scores) +
              " scores.<br/><br/>" +
              "Press R to restart!"
          )
          .show("fast");
      }
    }
  }, 10);

  // tube spawner
  setInterval(() => {
    if (isAlive) {
      const offset = -1 * Math.random() * 300;

      const tube = $("<div/>")
        .addClass("tube")
        .css({
          top: offset + "px",
          left: -parseInt(level.css("left")) + 750 + "px",
        })
        .html(
          `<div class="top"></div><div class="bottom"></div>`
        );

      level.append(tube);

      setTimeout(() => {
        if (isAlive) {
          tube.remove();
          scores++;
          updateScores();
        }
      }, 10000 / SPEED);
    }
  }, 10000 / SPEED);

  // restarting game
  $("body").keydown(function (e) {
    if (e.keyCode == 82) RestartGame();
  });

  function RestartGame() {
    $(".tube").remove();
    level.css("left", 0);
    player.setPosition(100, 250);

    scores = 0;
    updateScores();
    $(".lose").hide();
    isAlive = true;
  }
  function updateScores() {
    $("#score").html("Score: " + scores);
  }

  function recordScore(count) {
    if (!localStorage.getItem("FlappyRecord")) {
      localStorage.setItem("FlappyRecord", count);
      return count;
    }

    if (count > +localStorage.getItem("FlappyRecord")) {
      localStorage.setItem("FlappyRecord", count);
      return count;
    } else return +localStorage.getItem("FlappyRecord");
  }
});

function limiter(value, min, max) {
  if (value <= min) return min;
  if (value >= max) return max;

  return value;
}
