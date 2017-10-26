// Variaveis do jogo //

var canvas,
  ctx,
  width,
  height,
  fgpos = 0,
  frames = 0,
  score = 0,
  best = localStorage.getItem("best") || 0,
  // Variaveis de estado //

  currentstate,
  states = {
    Splash: 0,
    Game: 1,
    Score: 2
  },
  // Objetos do Jogo //
  //botão ok para reinicializar o jogo
  okbtn,
  /**
 * Passaro
 */
  bird = {
    x: 60,
    y: 0,

    frame: 0,
    velocity: 0,
    animation: [0, 1, 2, 1], //Sequencia das Animações

    rotation: 0,
    radius: 12,

    gravity: 0.25,
    _jump: 4.6,

    /**
	 * Pulo do Passaro
	 */
    jump: function() {
      this.velocity = -this._jump;
    },

    /**
	 * Função para atualizar a cada sprite
	 */
    update: function() {
      var n = currentstate === states.Splash ? 10 : 5;
      this.frame += frames % n === 0 ? 1 : 0;
      this.frame %= this.animation.length;

      // fazendo passaro levantar verticalmente ou abaixar de acoordo com os cliques na tela
      if (currentstate === states.Splash) {
        this.y = height - 280 + 5 * Math.cos(frames / 10);
        this.rotation = 0;
      } else {
        // Score do Jogo e seus Estados //

        this.velocity += this.gravity;
        this.y += this.velocity;

        // Mudando o estado do score quando o passaro tocar o chao
        if (this.y >= height - s_fg.height - 10) {
          this.y = height - s_fg.height - 10;
          if (currentstate === states.Game) {
            currentstate = states.Score;
          }
          // setando a velocidade para que o passaro levante de maneira correta
          this.velocity = this._jump;
        }

        // implementando a rotação
        // setando os angulos do passaro
        if (this.velocity >= this._jump) {
          this.frame = 1;
          this.rotation = Math.min(Math.PI / 2, this.rotation + 0.3);
        } else {
          this.rotation = -0.3;
        }
      }
    },

    /**
	 * Desenhando a Rotação do passaro
	 */
    draw: function(ctx) {
      ctx.save();
      // convertendo para os eixos x e y
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      var n = this.animation[this.frame];
      // desenhando o passaro no centro da tela
      s_bird[n].draw(ctx, -s_bird[n].width / 2, -s_bird[n].height / 2);

      ctx.restore();
    }
  },
  /**
 *  Canos
 */
  pipes = {
    _pipes: [],

    /**
	 * Definindo Array para os canos vazio
	 */
    reset: function() {
      this._pipes = [];
    },

    /**
	 * Criando e atualizando os canos dentro do array
	 */
    update: function() {
      // adicionando um novo cano a cada 100 frames
      if (frames % 100 === 0) {
        // calculando a posição y
        var _y =
          height -
          (s_pipeSouth.height + s_fg.height + 120 + 200 * Math.random());
        // criando cano dentro do array
        this._pipes.push({
          x: 500,
          y: _y,
          width: s_pipeSouth.width,
          height: s_pipeSouth.height
        });
      }
      for (var i = 0, len = this._pipes.length; i < len; i++) {
        var p = this._pipes[i];

        if (i === 0) {
          score += p.x === bird.x ? 1 : 0;

          // colocando colisao ao bater no cano, e calculando a diferença entre x e y
          // usando um vetor para calcular e definir a intersecção
          var cx = Math.min(Math.max(bird.x, p.x), p.x + p.width);
          var cy1 = Math.min(Math.max(bird.y, p.y), p.y + p.height);
          var cy2 = Math.min(
            Math.max(bird.y, p.y + p.height + 80),
            p.y + 2 * p.height + 80
          );
          var dx = bird.x - cx;
          var dy1 = bird.y - cy1;
          var dy2 = bird.y - cy2;
          // tamanho do vetor
          var d1 = dx * dx + dy1 * dy1;
          var d2 = dx * dx + dy2 * dy2;
          var r = bird.radius * bird.radius;
          // determinando a intersecção
          if (r > d1 || r > d2) {
            currentstate = states.Score;
          }
        }
        // movendo e removendo os canos da canvas
        p.x -= 2;
        if (p.x < -p.width) {
          this._pipes.splice(i, 1);
          i--;
          len--;
        }
      }
    },

    /**
	 * Desenhando todos os canos dentro do canvas
	 */
    draw: function(ctx) {
      for (var i = 0, len = this._pipes.length; i < len; i++) {
        var p = this._pipes[i];
        s_pipeSouth.draw(ctx, p.x, p.y);
        s_pipeNorth.draw(ctx, p.x, p.y + 80 + p.height);
      }
    }
  };

/**
 * Definindo função ao clicar na tela para que o passaro pule
 */
function onpress(evt) {
  switch (currentstate) {
    // mundando o estado e adicionando velocidade ao passaro
    case states.Splash:
      currentstate = states.Game;
      bird.jump();
      break;

    // atualizando a velocidade do passaro
    case states.Game:
      bird.jump();
      break;

    case states.Score:
      // pegando o evento
      var mx = evt.offsetX,
        my = evt.offsetY;

      if (mx == null || my == null) {
        mx = evt.touches[0].clientX;
        my = evt.touches[0].clientY;
      }
      if (
        okbtn.x < mx &&
        mx < okbtn.x + okbtn.width &&
        okbtn.y < my &&
        my < okbtn.y + okbtn.height
      ) {
        pipes.reset();
        currentstate = states.Splash;
        score = 0;
      }
      break;
  }
}

/**
 * Iniciando o jogo
 */
function main() {
  // criando o canvas e setando a altura e a sua largura
  canvas = document.createElement("canvas");

  width = window.innerWidth;
  height = window.innerHeight;

  var evt = "touchstart";
  if (width >= 500) {
    width = 320;
    height = 480;
    canvas.style.border = "1px solid #000";
    evt = "mousedown";
  }

  // Pegando os dodos de entrada(toques)
  document.addEventListener(evt, onpress);

  canvas.width = width;
  canvas.height = height;
  if (!(!!canvas.getContext && canvas.getContext("2d"))) {
    alert(
      "Your browser doesn't support HTML5, please update to latest version"
    );
  }
  ctx = canvas.getContext("2d");

  currentstate = states.Splash;
  document.body.appendChild(canvas);

  var img = new Image();
  img.onload = function() {
    initSprites(this);
    ctx.fillStyle = s_bg.color;

    okbtn = {
      x: (width - s_buttons.Ok.width) / 2,
      y: height - 200,
      width: s_buttons.Ok.width,
      height: s_buttons.Ok.height
    };

    run();
  };
  img.src = "res/sheet.png";
}

/**
 * Iniciando o Loop do jogo
 */
function run() {
  var loop = function() {
    update();
    render();
    window.requestAnimationFrame(loop, canvas);
  };
  window.requestAnimationFrame(loop, canvas);
}

/**
 * Atualizando o chao e os canos aleatoriamente
 */
function update() {
  frames++;

  if (currentstate !== states.Score) {
    fgpos = (fgpos - 2) % 14;
  } else {
    // setando o "best score"
    best = Math.max(best, score);
    localStorage.setItem("best", best);
  }
  if (currentstate === states.Game) {
    pipes.update();
  }

  bird.update();
}

/**
 * Desenhando passaro e canos dentro da canvas
 */
function render() {
  // Setando a cor de fundo
  ctx.fillRect(0, 0, width, height);
  // desenhando os sprites de background
  s_bg.draw(ctx, 0, height - s_bg.height);
  s_bg.draw(ctx, s_bg.width, height - s_bg.height);

  pipes.draw(ctx);
  bird.draw(ctx);

  s_fg.draw(ctx, fgpos, height - s_fg.height);
  s_fg.draw(ctx, fgpos + s_fg.width, height - s_fg.height);

  var width2 = width / 2; // centro da canvas

  if (currentstate === states.Splash) {
    // desenhando o texto GetReady na tela
    s_splash.draw(ctx, width2 - s_splash.width / 2, height - 300);
    s_text.GetReady.draw(ctx, width2 - s_text.GetReady.width / 2, height - 380);
  }
  if (currentstate === states.Score) {
    // desenhando o gameover e os scores best e o atual
    s_text.GameOver.draw(ctx, width2 - s_text.GameOver.width / 2, height - 400);
    s_score.draw(ctx, width2 - s_score.width / 2, height - 340);
    s_buttons.Ok.draw(ctx, okbtn.x, okbtn.y);
    // desenhando o melhor score dentro do card
    s_numberS.draw(ctx, width2 - 47, height - 304, score, null, 10);
    s_numberS.draw(ctx, width2 - 47, height - 262, best, null, 10);
  } else {
    // desenhando o score no topo da canvas
    s_numberB.draw(ctx, null, 20, score, width2);
  }
}

// iniciando o jogo
main();
