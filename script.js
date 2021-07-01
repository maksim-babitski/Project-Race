    'use strict';

    var roadWidth = 400; //ширина дороги
    var numOfLines = 5; //число линий на разделительной полосе
    var roadLineHeight = 100; //высота одной линии на разделительной полосе
    var roadLineWidth = 10; //ширина линии
    var roadLineSpace = 50; //промежуток между линиями на разделительной полосе
    var score = 0; //счет игры, начальное значение
    var recordScore; //рекорд игры
    var level; //уровень игры
    var speedLevel = {easy: 6, normal: 10, difficult: 14}; //таблица скорости (в зависимости о уровня)
    var recordTable = {}; //хэш, куда будут подгружаться рекорды с сервера

    var carAngle = 4.2; //угол поворота главной машинки 
    var carWidth = 54; //ширина машинок
    var carHeight = 137; //длина машинок
    var numOfCars = 3; //число машин-соперников
    var carView = ["car1.png", "car2.png", "car3.png", "car4.png"]; // массив машин соперников
    var gameSpeed; //скорость игры

    var upPressed = false; //переменные для определения нажатых кнопок
    var downPressed = false; //используем для управления машинкой
    var leftPressed = false;
    var rightPressed = false;

    var clientSize = getWindowClientSize(); //размер клиенсткой области окна

    var startAudio = new Audio;
    startAudio.src = "assets/audio/sound1.mp3";

    var endAudio = new Audio;
    endAudio.src = "assets/audio/sound2.mp3";

    var crashAudio = new Audio;
    crashAudio.src = "assets/audio/sound3.mp3";

    var gameBox = document.querySelector('.gameBox');
    var scoreBoard = document.querySelector('.scoreBoard');
    var startBox = document.querySelector('.startBox');
    var buttonBox = document.getElementById('buttonBox');
    var startBoxText = document.getElementById('startBoxText');

    var road = document.createElement('div'); //дорога
    road.style.width = roadWidth + "px";
    road.className ='road';
    gameBox.appendChild(road);

    createRoadLines(numOfLines); //создаме разделительную полосу
    createOtherCar(numOfCars); //добавляем машинки соперников

    var mainCar = document.createElement('div'); //создаем главную машинку 
    mainCar.className ='mainCar';
    mainCar.style.height = carHeight + "px";
    mainCar.style.width = carWidth + "px";
    mainCar.style.backgroundImage = "url('assets/images/car11.png')";
    mainCar.style.backgroundPositionX = "center";
    road.appendChild(mainCar);

    var mainCarH = { //хэш, содержащий информацию о гланвой машинке
        posX: roadWidth/2 - carWidth/2, //начальное положение в центре
        posY: clientSize.height - carHeight - 10, //делаем отступ от нижнего края экрана 10px
        width: carWidth, //размеры машинки
        height: carHeight,
        angle: 0, //нулевой угол поворота, исходное состояние
        speedAngle : 0.7, //скорость изменения угла при пороте машинки
        score: 0, //счет, начальное значение

        update: function() {
            mainCar.style.transform="translateX("+this.posX+"px) translateY("+this.posY+"px) translateZ(0) rotate("+this.angle+"deg)";
        }
    }

    mainCarH.update();
    buttonBox.addEventListener('click', startGame);
    
    function startGame(EO) {
        EO = EO || window.event;
        EO.preventDefault();
        level = EO.target.id; //устанавливаем уровень 
        gameSpeed = speedLevel[level]; //устанваливаем скорость
        startBox.classList.add('hide'); //убираем стартовое меню     
        mainCarH.posX = roadWidth/2 - carWidth/2; //начальное положение машинки
        mainCarH.posY = clientSize.height - carHeight - 10; //делаем отступ от нижнего края экрана 10px

        mainCarH.score = 0; //обнуляем счетчик при каждом запуске игры

        endAudio.pause();
        endAudio.currentTime = 0;
        startAudio.play();
     
        requestAnimationFrame(tick);
    }

    function tick () {
        moveRoadLines(); //приводим в движение дорожную полосу
        moveOtherCar(); //приводим в движение машинки соперников

        //движение главной машинки
        if (upPressed && mainCarH.posY > 10) { //оставляем промежуток 10px от верхного края онка
            mainCarH.posY -= gameSpeed; //машинка движется вверх
        } else if (downPressed && mainCarH.posY + mainCarH.height < road.offsetHeight-5) { //оставляем промежуток 5px от нижнего края онка
            mainCarH.posY += gameSpeed; //машинка движется вниз
        }

        if (leftPressed && mainCarH.posX > 0) {
            mainCarH.posX -= gameSpeed; //машинка движется влево
            mainCar.style.backgroundPositionX = "right";
            if (mainCarH.angle >= -carAngle) {
                mainCarH.angle -= mainCarH.speedAngle;
            }
        } else if (rightPressed && mainCarH.posX + mainCarH.width < road.offsetWidth-14) { //учитываем толщину рамки дороги
            mainCarH.posX += gameSpeed; //машинка движется вправо
            mainCar.style.backgroundPositionX = "left";
            if (mainCarH.angle <= carAngle) {
                mainCarH.angle += mainCarH.speedAngle;
            }
        }

        if (!leftPressed && !rightPressed) {
            mainCar.style.backgroundPositionX = "center";
        }
        
        if (!leftPressed) {
            if (mainCarH.angle <= 0) {
                mainCarH.angle += mainCarH.speedAngle;
                if (mainCarH.angle > 0) {
                    mainCarH.angle = 0;
                }
            }
        }

        if (!rightPressed) {
            if (mainCarH.angle >= 0) {
                mainCarH.angle -= mainCarH.speedAngle;
                if (mainCarH.angle < 0) {
                    mainCarH.angle = 0;
                }
            }
        }

        // вылетела ли машинка правее дороги?
	    if (mainCarH.posX + mainCarH.width > road.offsetWidth-19) { //учитываем рамку дороги
		    mainCarH.posX = road.offsetWidth - mainCarH.width-19; //а также делаем отступ 5px от края дороги
	    }
   	    // вылетела ли машинка левее дороги?
	    if (mainCarH.posX < 5) {
		    mainCarH.posX = 5;
	    }

        //счет или пройденнное расстояние
        if (gameSpeed == speedLevel.easy) {
            mainCarH.score +=0.01;
        }
        if (gameSpeed == speedLevel.normal) {
            mainCarH.score +=0.015;
        }
        if (gameSpeed == speedLevel.difficult) {
            mainCarH.score +=0.02;
        }

        scoreBoard.innerHTML = "Вы проехали "+Math.round(mainCarH.score)+"км";

        mainCarH.update(); //обновляем состояние машинки 
        collision(); //проверяем столкнулась ли главная машинка с соперником
       
        if (gameSpeed !== 0) {
            requestAnimationFrame(tick);
        }          
    }

    function createRoadLines(n) { //разделительная полоса
        var roadHeight = road.offsetHeight; //высота дороги
        if (roadHeight > 700) { //увелечение числа линий для больших экранов
            numOfLines = 8;
            n = numOfLines; 
        } else if (roadHeight > 1100) {
            numOfLines = 10;
            n = numOfLines;
        }
        for(var i=0; i<n; i++){ 
            var roadLine = document.createElement('div');
            roadLine.style.height = roadLineHeight + "px";
            roadLine.style.width = roadLineWidth + "px";
            roadLine.className ='roadLine';
            roadLine.style.top = (i*(roadLineHeight + roadLineSpace)) + "px";
            roadLine.style.left = (roadWidth/2 - roadLineWidth/2) + "px";
            road.appendChild(roadLine);
        }
    }

    function moveRoadLines() { //движение разделительной полосы
        var roadLines = document.querySelectorAll('.roadLine');
        roadLines.forEach((elem)=> {
            var roadLinePosY = elem.offsetTop;
            if(roadLinePosY >= (roadLineHeight*numOfLines + roadLineSpace*(numOfLines-1))) { //5 полос + 4 прмежутка между ними
                roadLinePosY -= ((roadLineHeight + roadLineSpace)*numOfLines);
            }
            roadLinePosY += gameSpeed;
            elem.style.top = roadLinePosY + "px";
        });
    }

    function createOtherCar(n) { // функция создания других машинок, n - число машинок
        for(var i=0; i<n; i++){ //создаем другие машинки
            var otherCar = document.createElement('div');
            otherCar.className ='car';
            otherCar.style.height = carHeight + "px";
            otherCar.style.width = carWidth + "px";

            var backImage = String(carView[randomDiap(0,3)]); //случайное авто
            otherCar.style.backgroundImage = "url('assets/images/"+backImage+"')";
            
            var otherCarPosY = -((i+1) * carHeight*3); //расстояние между машинками 3 корпуса
            otherCar.style.top = otherCarPosY + "px";
            otherCar.style.left = Math.floor(Math.random() * (roadWidth - carWidth-19)) + "px"; //учитываем рамку дороги, а также делаем отступ 5px от края дороги
            road.appendChild(otherCar);
        }
    }

    function randomDiap(n,m) { //функция генерации случайного числа
        return Math.floor(Math.random()*(m-n+1))+n;
    }

    function moveOtherCar(){ //движение машинок
        var otherCars = document.querySelectorAll('.car'); //массив машинок
        var roadHeight = road.offsetHeight; //высота дороги (дорога на всю ширину рабочего окна) 
        if (document.body.offsetWidth < 500) { //для малых экранов (меньше 500)
            roadHeight *= 2; //используем удвоенное значение высоты дороги, чтобы уменьшить частоту появления машинок
        } 
        otherCars.forEach((item)=> {
            var otherCarPosY = item.offsetTop;
            if(otherCarPosY > roadHeight) {
                otherCarPosY = -carHeight*4;
                item.style.left = Math.floor(Math.random() * (roadWidth - carWidth-19)) + "px"; //учитываем рамку дороги, а также делаем отступ 5px от края дороги
                var backImage = carView[randomDiap(0,3)]; //меняем машинку (фон)
                item.style.backgroundImage = "url('assets/images/"+backImage+"')";
            }
            otherCarPosY += gameSpeed;
            item.style.top = otherCarPosY + "px";
        });
    }

    function updateOtherCars(){ //перезапуск машинок
        var otherCars = document.querySelectorAll('.car');
        otherCars.forEach((item)=> {
            var otherCarPosY = item.offsetTop;
            otherCarPosY -= carHeight*4;
            item.style.top = otherCarPosY + "px";
        });
    }

    function collision(){ //столкновение машинок
        var otherCars = document.querySelectorAll('.car');
        otherCars.forEach((item)=> {
            var otherCarPosY = item.offsetTop;
            var otherCarPosX = item.offsetLeft;
            
            if((mainCarH.posY + mainCarH.height > otherCarPosY && mainCarH.posY < otherCarPosY + carHeight) && (mainCarH.posX + mainCarH.width > otherCarPosX && mainCarH.posX < otherCarPosX + carWidth)){
                updateOtherCars();
                gameSpeed = 0;
                startAudio.pause();
                startAudio.currentTime = 0;
                crashAudio.play();

                if (navigator.vibrate) {
                    window.navigator.vibrate(100);
                }    

                setTimeout(gameOverAudio, 1000);
                gameOver();
            }   
        });
    }

    function gameOver() {
        var record = recordTable[level];
        var score = Math.round(mainCarH.score);

        if (score <= record) {
            startBoxText.innerHTML = "Игра окончена <br> Вы проехали " + score + " км <br> Рекорд " + record + " км <br> Вы не смогли побить рекорд. Попробуете еще раз?" 
        }

        if (score > record) {
            startBoxText.innerHTML = "Игра окончена <br> Вы проехали " + score + " км <br>Предыдущий рекорд: " + record + " км <br> Поздравляем, вы побили рекорд. Хотите улучшить результат?"
            recordTable[level] = score; //перезаписываем рекорд
            storeRecord(); 
        }

        startBox.classList.remove('hide');  
        
    }

    function gameOverAudio() {
        crashAudio.pause();
        crashAudio.currentTime = 0;
        endAudio.play();
    }

    
    //управление

    if (window.matchMedia("(max-width: 950px)").matches) {

        var elems = document.querySelectorAll('.controlButton'); //кнопки управления
        for ( var i=0; i<elems.length; i++ ) {
            var elem = elems[i];
            elem.classList.remove('hide');
        }

        var rightButton = document.querySelector('.right');
        var leftButton = document.querySelector('.left');
        var upButton = document.querySelector('.up');
        var downButton = document.querySelector('.down');

        rightButton.ontouchstart = moveRight;
        leftButton.ontouchstart = moveLeft;
        upButton.ontouchstart = moveUp;
        downButton.ontouchstart = moveDown;

        function moveRight() {
            rightPressed = true;
            rightButton.ontouchend = stopMoveRight;
    
            function stopMoveRight() {
                rightPressed = false;
                rightButton.ontouchend = null;
            }    
        }

        function moveLeft() {
            leftPressed = true;
            leftButton.ontouchend = stopMoveLeft;
    
            function stopMoveLeft() {
                leftPressed = false;
                leftButton.ontouchend = null;
            }    
        }

        function moveUp() {
            upPressed = true;
            upButton.ontouchend = stopMoveUp;
    
            function stopMoveUp() {
                upPressed = false;
                upButton.ontouchend = null;
            }    
        }

        function moveDown() {
            downPressed = true;
            downButton.ontouchend = stopMoveDown;
    
            function stopMoveDown() {
                downPressed = false;
                downButton.ontouchend = null;
            }    
        }       
    }

    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);
    
    function keyDown(EO) {
        EO = EO || window.event;
        EO.preventDefault();
    
        if(EO.keyCode == 38) {
           upPressed = true;
        }
        else if(EO.keyCode == 40) {
           downPressed = true;
        }
    
        if(EO.keyCode == 37) {
           leftPressed = true;
        }
        else if(EO.keyCode == 39) {
           rightPressed = true;   
        }
    }

    function keyUp(EO) {
        EO = EO || window.event;
        EO.preventDefault();
    
        if(EO.keyCode == 38) {
           upPressed = false;
        }
        else if(EO.keyCode == 40) {
           downPressed = false;
        }
    
        if(EO.keyCode == 37) {
            leftPressed = false;
        }
        else if(EO.keyCode == 39) {
            rightPressed = false;
        }
    }


    //работа с сервером
    
    var ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
    var updatePassword; //пароль для перезаписи счета и сохранении на сервере
    var stringName='BABITSKI_MAKSIM_RACING_RECORD'; //имя сохраненной на сервере строки со счетом

    function restoreRecord() { //заполнение хэша с рекордами
        $.ajax(
            {
                url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                data : { f : 'READ', n : stringName },
                success : readReady, error : errorHandler
            }
        );
    }

    function readReady(callresult) {
        if ( callresult.error!=undefined )
            alert(callresult.error);
        else if ( callresult.result!="" ) {
            var info = JSON.parse(callresult.result);
            recordTable.easy = info.easy;
            recordTable.normal = info.normal;
            recordTable.difficult = info.difficult;
        }
    }

    function errorHandler(jqXHR,statusStr,errorStr) {
        alert(statusStr+' '+errorStr);
    }


    function storeRecord() { //перезапись рекордов
        updatePassword=Math.random();
        $.ajax( {
                url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                data : { f : 'LOCKGET', n : stringName, p : updatePassword },
                success : lockGetReady, error : errorHandler
            }
        );
    }

    function lockGetReady(callresult) {
        if ( callresult.error!=undefined )
            alert(callresult.error);
        else {
            var info={
                easy : recordTable.easy,
                normal : recordTable.normal,
                difficult : recordTable.difficult
            };
            $.ajax( {
                    url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                    data : { f : 'UPDATE', n : stringName, v : JSON.stringify(info), p : updatePassword },
                    success : updateReady, error : errorHandler
                }
            );
        }
    }

    function updateReady(callresult) {
        if ( callresult.error!=undefined )
            alert(callresult.error);
    }

    restoreRecord(); //запрашиваем хэш с рекордами игры с сервера при загрузке страницы


    //предупреждения о несохранённых изменениях при уходе (перезагрузке) с сайта

    var gameChange = false; //изменения на сайте

    buttonBox.onclick = gameChanged;
    buttonBox.ontouchstart = gameChanged;

    function gameChanged(EO) {
        EO = EO||window.event;
        gameChange = true; // текст изменён
        buttonBox.onclick = null;
        buttonBox.ontouchstart = null;
    }

    window.onbeforeunload=befUnload;

    function befUnload(EO) {
        EO=EO||window.event;
        if (gameChange) {
          EO.returnValue='Имеются несохранённые измененияывыывыв!';
        }
    }

    function getWindowClientSize() {
        var uaB=navigator.userAgent.toLowerCase();
        var isOperaB = (uaB.indexOf('opera')  > -1);
        var isIEB=(!isOperaB && uaB.indexOf('msie') > -1);
      
        var clientWidth=((document.compatMode||isIEB)&&!isOperaB)?
          (document.compatMode=='CSS1Compat')?
          document.documentElement.clientWidth:
          document.body.clientWidth:
          (document.parentWindow||document.defaultView).innerWidth;
      
        var clientHeight=((document.compatMode||isIEB)&&!isOperaB)?
          (document.compatMode=='CSS1Compat')?
          document.documentElement.clientHeight:
          document.body.clientHeight:
          (document.parentWindow||document.defaultView).innerHeight;
      
        return {width:clientWidth, height:clientHeight};
    }