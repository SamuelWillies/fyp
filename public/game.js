let cards = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'];
let suit = ['diamonds', 'hearts', 'spades', 'clubs'];

let capable3d = false; //Capable of 3D?
let slowInternet = false; //Internet fast enough?
let batteryAnimation = false; //Battery good enough for animation?
let battery3d = false; //Battery good enough for 3D?

let connection = null;

let inGame = false; //User ingame?

let is3d = false; //Is game in 3D?
let useImages = false; //Are images being used?

//Monitor Network Connection https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
let connTxt = document.getElementById('networkSpeed');
if ("connection" in navigator) {
    connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    connectionEnvironment(connection);
    connection.addEventListener('change', updateConnectionStatus);
    connTxt.textContent = `network effectivetype: ${connection.effectiveType}, downlink: ${connection.downlink}, rtt: ${connection.rtt}, slowint=${slowInternet}, useimages=${useImages}`
}

console.log(connection);

function updateConnectionStatus() {
    console.log('Connection changed');
    console.log(connection);
    connectionEnvironment(connection);
    connTxt.textContent = `network effectivetype: ${connection.effectiveType}, downlink: ${connection.downlink}, rtt: ${connection.rtt}, Slowint=${slowInternet}, useImages=${useImages}`
}

function connectionEnvironment(connection) {
    let slow = slowInternet;

    if (connection.effectiveType != '4g') {
        slowInternet = true;
    } else if (connection.downlink < 1.5) {
        slowInternet = true;
    } else if (connection.rtt > 100) {
        slowInternet = true;
    } else {
        slowInternet = false;
    }

    if (!slowInternet) {
        useImages = true;
    } else {
        useImages = false;
    }

    if (inGame) {
        goTo3d();
        if ((slow != slowInternet)) {
            console.log('redrawing');
            redrawCards(p1cards, p2cards);
        };
    }
}

window.addEventListener('offline', userOffline);
let offlineIndicator = document.getElementById('offlineIndicator');
function userOffline() {
    offlineIndicator.style.display = 'block';
}

window.addEventListener('online', userOnline);
function userOnline() {
    location.reload();
}

/* function loadImages() {
    cards.forEach(function(itemCard) {
        suit.forEach(function(itemSuit) {
            let image = new Image();
            image.src = `/assets/cards/${itemCard}_of_${itemSuit}.svg`
            images.push(image);
        })
    });

    let imageBack = new Image();
    imageBack.src = '/assets/cards/Card_back.svg';
    images.push(imageBack);
} */

//Battery Monitor https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API
let batteryCharging = true;
let batteryLevel = 100;

let batteryLevelTxt = document.getElementById('batteryLevel');
let batteryChargingTxt = document.getElementById('batteryCharging');

if ("getBattery" in navigator) {
    navigator.getBattery().then(function(battery) {
        console.log(battery);
        batteryCharging = battery.charging;
        batteryLevel = battery.level * 100;

        batteryEnvironment(batteryLevel, batteryCharging);
    
        batteryLevelTxt.textContent = `Battery Level: ${batteryLevel}%`;
        batteryChargingTxt.textContent = `Battery Charging: ${batteryCharging}, BatteryAnimation=${batteryAnimation}, Battery3d=${battery3d}, capable3d=${capable3d}`;

        console.log(`BatteryAnimation = ${batteryAnimation}`)
        console.log(`Battery3D= ${battery3d}`)
    
        battery.addEventListener('chargingchange', function() {
            batteryCharging = battery.charging;
            batteryEnvironment(batteryLevel, batteryCharging);
            batteryChargingTxt.textContent = `Battery Charging: ${batteryCharging}, BatteryAnimation=${batteryAnimation}, Battery3d=${battery3d}, capable3d=${capable3d}`;
        })
    
        battery.addEventListener('levelchange', function() {
            batteryLevel = battery.level * 100;
            //batteryLevel = ;
            batteryEnvironment(batteryLevel, batteryCharging);
            batteryLevelTxt.textContent = `Battery Level: ${batteryLevel}%`;
            
        })
    })
}

function batteryEnvironment(batteryLevel, batteryCharging) {
    if (batteryCharging) {
        batteryAnimation = true;
        battery3d = true;
    } else if (batteryLevel > 75) {
        batteryAnimation = true;
        battery3d = true;
    } else if (batteryLevel > 50) {
        batteryAnimation = true;
        battery3d = false;
    } else {
        batteryAnimation = false;
        battery3d = false;
    }

    if (inGame) {
        goTo3d();
    }
}

function goTo3d() {
    console.log('checking 3d');
    if (!is3d) {
        console.log('isnt currently 3d');
        if (capable3d && battery3d && useImages) {
            console.log('3d Featurs met');
            noCanvas.style.display = 'none';
            canvas.style.display = 'block';
            canvas.appendChild(renderer.domElement);
            animate();
            redrawCards(p1cards, p2cards);
            is3d = true;
        }
    } else { //is alredy 3d
        console.log('alredy 3d');
        if (!capable3d || !battery3d || !useImages) {
            noCanvas.style.display = 'block';
            canvas.style.display = 'none';
            canvas.removeChild(canvas.lastChild);
            redrawCards(p1cards, p2cards);
            is3d = false;
        }
    }
}

function updateLevelInfo(){
    console.log("Battery level: "+ battery.level * 100 + "%");
};

//Chat button
const chatBtn = document.getElementById('chat-hide');
const chatWindow = document.getElementById('chat');
chatBtn.addEventListener('click', showChat);

var chatVisible = false;

function showChat() {
    if (chatVisible == false) {
        chatWindow.style.display = "block";
        chatVisible = true;
    } else {
        chatWindow.style.display = "none";
        chatVisible = false;
    }
}

//Game Initialisation
const roomCode = document.getElementById('roomCode');
const lobby = document.getElementById('lobby');
const p1Name = document.getElementById('player1');
const p2Name = document.getElementById('player2');
const standBtn = document.getElementById('stand');
const hitBtn = document.getElementById('hit');
const noCanvas = document.getElementById('gameText');
const canvas = document.getElementById('game3d');
const cardImg = document.getElementById('card');
const resultsScreen = document.getElementById('results');
const resultsTxt = document.getElementById('gameResult');
const resultsBtn = document.getElementById('endGame');
const desiredX = 1280;
const desiredY = 720;

const playerTxt = document.getElementById('turn');
const scoreTxt = document.getElementById('score');
var p1score = 0;
var p1cards = [];
var p2score = 0;
var p2cards = [];

let rejoinForm = document.getElementById('reconnectDiv');
let rejoinBtn = document.getElementById('reconnectBtn');
let rejoinRoom = localStorage.getItem('rejoinRoom');
let rejoinId = localStorage.getItem('rejoinId');

if (rejoinRoom && rejoinId) {
    console.log(`Previous game found ${rejoinRoom} ${rejoinId}`);
    socket.emit('rejoin check', rejoinRoom, rejoinId);
}

rejoinBtn.addEventListener('click', function() {
    socket.emit('rejoin', rejoinRoom, usernameTxt.value);
})

socket.on('rejoin valid', () => {
    rejoinForm.style.display = 'block';
})

socket.on('rejoin failed', () => {
    rejoinForm.style.display = 'none';
    alert('Game no longer valid!')
})

socket.on("save", (socketId) => {
    localStorage.setItem('rejoinId', socketId);
});

let username = '';
if (localStorage.getItem('username')) {
    username = localStorage.getItem('username');
} else {
    username = ''
}

scoreTxt.textContent = `Your Total: ${p1score}`;

var cardHeight = 100;
var cardWidth = 65;

standBtn.addEventListener('click', stand);
hitBtn.addEventListener('click', hit);

function card(img, x, y) {
    ctx.drawImage(img, x, y, (65 * multiplierX), (100 * multiplierX));
}

function stand() {
    if (socket.connected) {
        socket.emit('stand', roomName);
        hitBtn.disabled = true;
        standBtn.disabled = true;
    } else {
        alert('You have lost connection');
    }
};

function hit() {
    if (socket.connected) {
        socket.emit('hit', roomName);
        hitBtn.disabled = true;
        standBtn.disabled = true;
        playerTxt.textContent = 'Waiting for other player!'
    } else {
        alert('You have lost connection');
    }
};

socket.on('rejoined', (p1score, p2score, currentRoom, id, isHost, currentTurn) => {
    inGame = true;
    localStorage.setItem('rejoinId', id);
    p1cards = p1score;
    p2cards = p2score;
    roomName = currentRoom.roomName;
    host = isHost;

    countingScore = 0;

    p1cards.forEach(element => countingScore += element.value)

    
    scoreTxt.textContent = `Your Total: ${countingScore}`;

    usernameForm.style.display = "none";
    joinForm.style.display = "none";
    roomForm.style.display = "none";
    rejoinForm.style.display = "none";

    showGame();
    redrawCards(p1score, p2score, currentTurn);
});

socket.on('turn', () => {
    hitBtn.disabled = false;
    standBtn.disabled = false;
    playerTxt.textContent = 'Your Turn!'
});

let countingScore = 0;

socket.on('new card', (card, currentTurn) => {
    if (host) {
        if (currentTurn == 1) {
            p1cards.push(card);
        } else {
            p2cards.push(card);
        }
    } else {
        if (currentTurn == 1) {
            p2cards.push(card);
        } else {
            p1cards.push(card);
        }
    }

    countingScore = 0;
    p1cards.forEach(element => countingScore += element.value)
    scoreTxt.textContent = `Your Total: ${countingScore}`;

    drawCards(card, currentTurn);
})

function getImage(card) {
    let img = new Image();
    img.src = `/assets/${card.resultNum}_of_${card.resultSuit}.svg`
    images.push(img);
}
let new3dreveal = null;
function showResults() {
    let revealCard = null;

    let cardNum = p2cards[0].resultNum;
    let cardSuit = p2cards[0].resultSuit;

    if (!is3d) {
        if (batteryAnimation) {
            if (useImages) {
                revealCard = topCards.firstChild.firstChild.lastChild;
                revealCard.removeChild(revealCard.lastChild);
                const imgReveal = new Image();
                imgReveal.src = `/assets/cards/${cardNum}_of_${cardSuit}.svg`;
                imgReveal.setAttribute('id', 'cardImg');
                revealCard.appendChild(imgReveal);
                topCards.firstChild.firstChild.classList.add('cardReveal');
            } else {
                revealCard = topCards.firstChild.firstChild.lastChild;
                revealCard.setAttribute('id', 'cardBackTextReveal');
                const newCardValue = document.createElement("p");
                const newCardSuit = document.createElement("p");
            
                newCardValue.setAttribute("id", "cardValue");
                newCardSuit.setAttribute("id", "cardValue");
            
                suitTxt = makeSuitTxt(cardSuit);
                numTxt = makeNumTxt(cardNum);
            
                let parsed = parseInt(cardNum);
            
                if (!isNaN(parsed)) {
                    newCardValue.textContent = cardNum;
                } else {
                    newCardValue.textContent = numTxt;
                };
                
                newCardSuit.textContent = suitTxt;
            
                revealCard.appendChild(newCardValue);
                revealCard.appendChild(newCardSuit);
                topCards.firstChild.firstChild.classList.add('cardReveal');
                topCards.firstChild.setAttribute('class', cardSuit);
            }
        } else {
            if (useImages) {
                revealCard = topCards.firstChild.firstChild.firstChild;
                revealCard.removeChild(revealCard.firstChild);
                const imgReveal = new Image();
                imgReveal.src = `/assets/cards/${cardNum}_of_${cardSuit}.svg`;
                imgReveal.setAttribute('id', 'cardImg');
                revealCard.appendChild(imgReveal);
            } else {
                revealCard = topCards.firstChild.firstChild.firstChild;
                revealCard.setAttribute('id', 'cardFrontText');
                const newCardValue = document.createElement("p");
                const newCardSuit = document.createElement("p");
            
                newCardValue.setAttribute("id", "cardValue");
                newCardSuit.setAttribute("id", "cardValue");
            
                suitTxt = makeSuitTxt(cardSuit);
                numTxt = makeNumTxt(cardNum);
            
                let parsed = parseInt(cardNum);
            
                if (!isNaN(parsed)) {
                    newCardValue.textContent = cardNum;
                } else {
                    newCardValue.textContent = numTxt;
                };
                
                newCardSuit.textContent = suitTxt;
            
                revealCard.appendChild(newCardValue);
                revealCard.appendChild(newCardSuit);
                topCards.firstChild.setAttribute('class', cardSuit);
            }
        }
    } else {
        let revealCard3d = p2cards[0];
        console.log(revealCard3d);
        new3dreveal = makeCard3D(x2Default, y2Default, revealCard3d.resultNum, revealCard3d.resultSuit, 5);
        scene.add(new3dreveal)
    }

    startBtn.disabled = true;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    controls.style.display = "none";
    p1cards = [];
    p2cards = [];

    chatWindow.style.display = "none";

    resultsScreen.style.display = "block";

    p2Name.textContent = 'Waiting for other player...'

    console.log('Removing from local storage');
    localStorage.removeItem('rejoinRoom');
    localStorage.removeItem('rejoinId');

    inGame = false;
};

resultsBtn.addEventListener('click', () => {
    p1cards3d.forEach((card) => {
        scene.remove(card.cardObject);
    });

    p2cards3d.forEach((card) => {
        scene.remove(card.cardObject);
    });

    scene.remove(new3dreveal);

    p1cards3d = [];
    p2cards3d = [];

    x = xDefault;
    y = yDefault;
    x2 = x2Default;
    y2 = y2Default;

    showStartMenu();
    noCanvas.style.display = "none";
    canvas.style.display = "none";

    resultsScreen.style.display = "none";

    roomTxt.value = '';

    joinTxt.value = '';

    countingScore = 0;
})

function showLobby() {
    roomForm.style.display = "none";
    joinForm.style.display = "none";
    usernameForm.style.display = "none";
    lobby.style.display = "block";
    startBtn.disabled = true;
    hitBtn.disabled = true;
    standBtn.disabled = true;
}

function showStartMenu() {
    canvas.style.display = "none";
    noCanvas.style.display = "none";
    createBtn.enabled = true;
    joinBtn.enabled = true;
    usernameForm.style.display = "block";
    roomForm.style.display = "block";
    joinForm.style.display = "block";
    lobby.style.display = "none";
    roomForm.style.display = "block";
    joinForm.style.display = "block";
    p2Name.textContent = 'Waiting for other player...'
}

function showGame() {
    clearBoard();
    goTo3d();
    lobby.style.display = "none";

    if (battery3d && capable3d && !slowInternet) {
        canvas.style.display = "block";
        canvas.appendChild(renderer.domElement);
        animate();
        is3d = true;
    } else if ((!battery3d || !capable3d) && !slowInternet) {
        noCanvas.style.display = "block";
        //useImages = true;
        is3d = false;
    } else {
        noCanvas.style.display = "block";
        //useImages = false;
        is3d = false;
    }

    lobby.style.display = "none";
    roomCode.style.display = "none";
    
    controls.style.display = "block";
    startBtn.style.display = "none";
}

//==================================================== Room Section ====================================================

socket.on('room created', (roomName) => {
    roomCode.style.display = "block";
    roomCode.textContent = `Room Code: ${roomName}`;
    showLobby();
    startBtn.style.display = "block";
    p1Name.textContent = `${username}`;
});

socket.on('room joined', (roomName, player1) => {
    roomCode.style.display = "block";
    roomCode.textContent = `Room Code: ${roomName}`;
    showLobby();
    p1Name.textContent = `${player1}`
});

socket.on('already exists', () => {
    alert("A room already exists with this ID!");
    createBtn.enabled = true;
    joinBtn.enabled = true;
});

socket.on('doesnt exist', () => {
    alert("No room exists with this ID!");
    createBtn.enabled = true;
    joinBtn.enabled = true;
});

socket.on('session full', () => {
    alert("This room is full!");
    createBtn.enabled = true;
    joinBtn.enabled = true;
});

socket.on('ready to begin', (username) => {
    startBtn.disabled = false;
    p2Name.textContent = `${username}`
});

socket.on('player left lobby', () => {
    startBtn.disabled = true;
    p2Name.textContent = 'Waiting for other player...'
})

socket.on('host left lobby', () => {
    showStartMenu();
    
    lobby.style.display = "none";
    p1Name.textContent = 'Player 1';
    p2Name.textContent = 'Waiting for other player...'
})

socket.on('player left game', () => {
    console.log('Player left');
    playerTxt.textContent = 'Other player has left the game!'
});

socket.on('host left game', () => {
    console.log('Host left');
    playerTxt.textContent = 'Other player has left the game!'
});

socket.on('start game', (roomName) => {
    showGame();

    localStorage.setItem('rejoinRoom', roomName);
    console.log(`Set room in local storage ${roomName}`);
    inGame = true;
});

socket.on('winner', () => {
    resultsTxt.textContent = `You win ${username}!`;
    showResults();
});

socket.on('loser', () => {
    resultsTxt.textContent = `You lose ${username}!`;
    showResults();
});

socket.on('draw', () => {
    resultsTxt.textContent = `It's a draw!`;
    showResults();
});

socket.on('no longer exists', () => {
    alert('Game no longer exists!');
    controls.style.display = "none";
    clearBoard();
    showStartMenu();
})

var usernameForm = document.getElementById('usernameForm');

usernameForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (usernameTxt.value) {
        username = usernameTxt.value;
        localStorage.setItem('username', username);
    }
})

var roomForm = document.getElementById('createForm');
var usernameTxt = document.getElementById('usernameId');

usernameTxt.value = username;

var roomTxt = document.getElementById('createGameId');
var startBtn = document.getElementById('startBtn');
var leaveLobbyBtn = document.getElementById('leaveLobbyBtn');

var joinForm = document.getElementById('joinForm');
var joinTxt = document.getElementById('joinGameId');

let createBtn = document.getElementById('createBtn');
let joinBtn = document.getElementById('joinBtn');

let roomName = '';

let host = false;

const controls = document.getElementById('controls');

roomForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (roomTxt.value) {
        roomName = roomTxt.value;
        createBtn.enabled = false;
        joinBtn.enabled = false;
        if (localStorage.getItem('rejoinRoom')) {
            localStorage.removeItem('rejoinRoom');
            localStorage.removeItem('rejoinId')
            rejoinForm.style.display = 'none';
        }
        
        socket.emit("create room", {username, roomName});
        host = true;
    }
});

joinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (joinTxt.value) {
        roomName = joinTxt.value;
        joinBtn.enabled = false;
        createBtn.enabled = false;
        socket.emit("join room", {username, roomName});
        host = false;
        p2Name.textContent = username;
    };
});

startBtn.addEventListener('click', function(e) {
    socket.emit('start game', roomName);
});

leaveLobbyBtn.addEventListener('click', function(e) {
    socket.emit('leave lobby', roomName);
    showStartMenu();
});

// Text Based Test
let cardContainer = document.getElementById('cardTest');
let topCards = document.getElementById('topCards');
let bottomCards = document.getElementById('bottomCards');

function clearBoard() {
    while (topCards.firstChild) {
        topCards.removeChild(topCards.lastChild);
    };

    while (bottomCards.firstChild) {
        bottomCards.removeChild(bottomCards.lastChild);
    };
}

let xDefault = -370
let yDefault = -50;
let x2Default = -370;
let y2Default = 140;

let x = xDefault;
let y = yDefault;
let x2 = x2Default;
let y2 = y2Default;

let p1cards3d = [];
let p2cards3d = [];

card = {
    'cardObject': card,
    'desiredX': x
};

function drawCards(card, currentTurn) {
    let newCard = null;

    if (battery3d && capable3d && useImages) {
        if (host) {
            if (currentTurn == 1) {
                newCard = makeCard3D(-500, y, card.resultNum, card.resultSuit);
                scene.add(newCard);
                let card3d = {
                    'cardObject': newCard,
                    'desiredX': x
                };
                p1cards3d.push(card3d);
                x += 70;
            } else {
                if (x2 == x2Default) {
                    newCard = makeBlankCard3D(-500, y2);
                } else {
                    newCard = makeCard3D(-500, y2, card.resultNum, card.resultSuit);
                }
                scene.add(newCard);
                let card3d = {
                    'cardObject': newCard,
                    'desiredX': x2
                };
                p2cards3d.push(card3d);
                x2 += 70;
            }
        } else {
            if (currentTurn == 1) {
                if (x2 == x2Default) {
                    newCard = makeBlankCard3D(-500, y2);
                } else {
                    newCard = makeCard3D(-500, y2, card.resultNum, card.resultSuit);
                }
                scene.add(newCard);
                let card3d = {
                    'cardObject': newCard,
                    'desiredX': x2
                };
                p2cards3d.push(card3d);
                x2 += 70;
            } else {
                newCard = makeCard3D(-500, y, card.resultNum, card.resultSuit);
                scene.add(newCard);
                let card3d = {
                    'cardObject': newCard,
                    'desiredX': x
                };
                p1cards3d.push(card3d);
                x += 70
            }
        }

    } else if (useImages) {
        newCard = makeCardImg(card.resultSuit, card.resultNum);
        if (batteryAnimation) {
            newCard.classList.add('latestCard');
        } 
    } else {
        newCard = makeCardText(card.resultSuit, card.resultNum);
        if (batteryAnimation) {
            newCard.classList.add('latestCard');
        } 
    }

    if (!(battery3d && capable3d && useImages)) {
        if (host == true) {
            if (currentTurn == 1) {
                bottomCards.appendChild(newCard);
            } else {
                if (!topCards.children.length) {
                    newCard = makeBlankCard();
                    topCards.appendChild(newCard);
                }
                topCards.appendChild(newCard);
            }
        } else {
            if (currentTurn == 1) {
                if (!topCards.children.length) {
                    newCard = makeBlankCard();
                    topCards.appendChild(newCard);
                } else {
                    topCards.appendChild(newCard);
                }
            } else {
                bottomCards.appendChild(newCard);
            }
        }
    }

};

function redrawCards(p1cards, p2cards, currentTurn) {
    console.log(p1cards);
    console.log(p2cards);

    p1cards3d.forEach((card) => {
        scene.remove(card.cardObject);
    });

    p2cards3d.forEach((card) => {
        scene.remove(card.cardObject);
    });

    p1cards3d = [];
    p2cards3d = [];

    clearBoard();

    x = xDefault;
    x2 = x2Default;
    y = yDefault;
    y2 = y2Default;

    p1cards.forEach(function(item) {
        console.log('p1card');
        
        if (battery3d && capable3d && useImages) { //If Battery Good for 3D AND Capable of 3D and Fast Internet
            newCard = makeCard3D(-500, y, item.resultNum, item.resultSuit);
            scene.add(newCard);
            let card3d = {
                'cardObject': newCard,
                'desiredX': x
            };
            p1cards3d.push(card3d);
            x += 70;
        } else {

            if (useImages) {
                newCard = makeCardImg(item.resultSuit, item.resultNum);
            } else {
                newCard = makeCardText(item.resultSuit, item.resultNum);
            }
            bottomCards.appendChild(newCard);
        }
    });

    p2cards.forEach(function(item) {
        if (battery3d && capable3d && useImages) {
            if (x2 == x2Default) {
                newCard = makeBlankCard3D(-500, y2);
            } else {
                newCard = makeCard3D(-500, y2, item.resultNum, item.resultSuit);
            }
            scene.add(newCard);
            let card3d = {
                'cardObject': newCard,
                'desiredX': x2
            };
            p2cards3d.push(card3d);
            x2 += 70;
        } else {

            if (useImages) {
                newCard = makeCardImg(item.resultSuit, item.resultNum);
            } else {
                newCard = makeCardText(item.resultSuit, item.resultNum);
            }

            //if (host) {
                if (!topCards.children.length) {
                    newCard = makeBlankCard();
                    topCards.appendChild(newCard);
                } else {
                    topCards.appendChild(newCard);
                }
            } //else {
                //bottomCards.appendChild(newCard);
            //}
        //}
    })
}

function makeBlankCard() {
    if (slowInternet) {
        return makeBlankCardText();
    } else {
        return makeBlankCardImg();
    }
}

function makeCardText(suit, num) {
    const cardDiv = document.createElement('div');
    cardDiv.setAttribute('id', 'card');

    const cardContainerDiv = document.createElement('div');
    cardContainerDiv.setAttribute('id', 'cardContainer');

    const cardFrontDiv = document.createElement('div');
    cardFrontDiv.setAttribute('id', 'cardFrontText');

    const cardBackDiv = document.createElement('div');
    cardBackDiv.setAttribute('id', 'cardBackText');

    const newCardValue = document.createElement("p");
    const newCardSuit = document.createElement("p");

    newCardValue.setAttribute("id", "cardValue");
    newCardSuit.setAttribute("id", "cardValue");

    suitTxt = makeSuitTxt(suit);

    numTxt = makeNumTxt(num);

    let parsed = parseInt(num);

    if (!isNaN(parsed)) {
        newCardValue.textContent = num;
    } else {
        newCardValue.textContent = numTxt;
    };
    
    newCardSuit.textContent = suitTxt;

    cardFrontDiv.appendChild(newCardValue);
    cardFrontDiv.appendChild(newCardSuit);

    cardContainerDiv.appendChild(cardFrontDiv);
    cardContainerDiv.appendChild(cardBackDiv);

    cardDiv.appendChild(cardContainerDiv);
    cardDiv.setAttribute('class', suit);

    return cardDiv;
};

function makeSuitTxt(suit) {
    let suitTxt = '';
    if (suit == 'diamonds') {
        suitTxt = '♦'; 
    } else if (suit == 'spades') {
        suitTxt = '♠';
    } else if (suit == 'clubs') {
        suitTxt = '♣';
    } else if (suit == 'hearts') {
        suitTxt = '♥';
    } else {
        suitTxt = '';
    };

    return suitTxt;
}

function makeNumTxt(num) {
    let numTxt = '';
    if (num == 'jack') {
        numTxt = 'J';
    } else if (num == 'queen') {
        numTxt = 'Q';
    } else if (num == 'king') {
        numTxt = 'K';
    } else if (num == 'ace') {
        numTxt = 'A';
    } else {
        numTxt = ''
    };

    return numTxt;
}

function makeCardImg(suit, num) {
    const cardDiv = document.createElement('div');
    cardDiv.setAttribute('id', 'card');

    const cardContainerDiv = document.createElement('div');
    cardContainerDiv.setAttribute('id', 'cardContainer');

    const cardFrontDiv = document.createElement('div');
    cardFrontDiv.setAttribute('id', 'cardFront');

    const cardBackDiv = document.createElement('div');
    cardBackDiv.setAttribute('id', 'cardBack');

    const imgFront = new Image();
    imgFront.src = `/assets/cards/${num}_of_${suit}.svg`;
    imgFront.setAttribute('id', 'cardImg');

    const imgBack = new Image();
    imgBack.src = `/assets/cards/Card_back.svg`;
    imgBack.setAttribute('id', 'cardImg');

    cardFrontDiv.appendChild(imgFront);
    cardBackDiv.appendChild(imgBack);

    cardContainerDiv.appendChild(cardFrontDiv);
    cardContainerDiv.appendChild(cardBackDiv);

    cardDiv.appendChild(cardContainerDiv);

    return cardDiv;
}

function makeBlankCardText() {
    const cardDiv = document.createElement('div');
    cardDiv.setAttribute('id', 'card');

    const cardContainerDiv = document.createElement('div');
    cardContainerDiv.setAttribute('id', 'cardContainer');

    const cardFrontDiv = document.createElement('div');
    cardFrontDiv.setAttribute('id', 'cardFrontTextBlank');

    const cardBackDiv = document.createElement('div');
    cardBackDiv.setAttribute('id', 'cardBackText');

    cardContainerDiv.appendChild(cardFrontDiv);
    cardContainerDiv.appendChild(cardBackDiv);

    cardDiv.appendChild(cardContainerDiv);

    return cardDiv;
}

function makeBlankCardImg() {
    const cardDiv = document.createElement('div');
    cardDiv.setAttribute('id', 'card');

    const cardContainerDiv = document.createElement('div');
    cardContainerDiv.setAttribute('id', 'cardContainer');

    const cardFrontDiv = document.createElement('div');
    cardFrontDiv.setAttribute('id', 'cardFront');

    const cardBackDiv = document.createElement('div');
    cardBackDiv.setAttribute('id', 'cardBack');

    const imgFront = new Image();
    imgFront.src = `/assets/cards/Card_back.svg`;
    imgFront.setAttribute('id', 'cardImg');

    const imgBack = new Image();
    imgBack.src = `/assets/cards/Card_back.svg`;
    imgBack.setAttribute('id', 'cardImg');

    cardFrontDiv.appendChild(imgFront);
    cardBackDiv.appendChild(imgBack);

    cardContainerDiv.appendChild(cardFrontDiv);
    cardContainerDiv.appendChild(cardBackDiv);

    cardDiv.appendChild(cardContainerDiv);

    return cardDiv;
}

//Monitor Screen Stuff https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation------------------------------------
let orientation = screen.orientation;
let width = window.innerWidth;
let height = window.innerHeight;

let desiredWidth = window.innerWidth;
let desiredHeight = window.innerHeight;

let sizeMultiplier = height / desiredHeight;

var multiplierX = width / desiredX;
var multiplierY = height / desiredY;
let resolutionTxt = document.getElementById('resolution');
let orientationTxt = document.getElementById('orientation');
resolutionTxt.textContent = `Resolution of screen: ${width}x${height}`
orientationTxt.textContent = `Orientation: ${orientation.type}, ${orientation.angle}`

window.addEventListener('resize', resizeGame);

function resizeGame() {
    console.log(`From ${width} ${height} , ${multiplierX}, ${multiplierY}`)
    width = window.innerWidth;
    height = window.innerHeight;
    console.log(`To ${width} ${height} , ${multiplierX}, ${multiplierY}`)

    camera.aspect = width / height;
    //camera.updateProjectionMatrix();
    renderer.setSize( width, height );

    resolutionTxt.textContent = `Resolution of screen: ${width}x${height}`
    orientationTxt.textContent = ``
};

//===================================================================================================three.js====================================================================

let fov = 50;
let nearClippingPlane = 0.1;
let farClippingPane = 1000;
let aspectRatio = 16/9;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearClippingPlane, farClippingPane);

const renderer = new THREE.WebGLRenderer({alpha: true});

renderer.setSize( width, height );
renderer.setPixelRatio(window.devicePixelRatio);

const bgGeometry = new THREE.PlaneGeometry(1000, 500);
const bgMaterial = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
const bgModel = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(bgModel);

const cardGeometry = new THREE.PlaneGeometry(65, 100);
const cardMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
const cardModel = new THREE.Mesh(cardGeometry, cardMaterial);

const texture = new THREE.TextureLoader().load('/assets/cards/Card_back.svg');
const texMat = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});

cardModel.position.set(0, 0, 0);

//const axes = new THREE.AxesHelper(100);
//scene.add(axes);

//Lighting
const spotLight = new THREE.SpotLight(0xFFFFFF);
spotLight.position.set(20, 20, 400);
scene.add(spotLight);
renderer.shadowMap.enabled = true;
bgModel.receiveShadow = true;
spotLight.castShadow = true;

camera.position.z = 500;

function makeBlankCard3D(x = 0, y = 0) {
    const texture = new THREE.TextureLoader().load('/assets/cards/Card_back.svg');
    const textureMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide, transparent: true});
    const card = new THREE.Mesh(cardGeometry, textureMaterial);
    card.position.set(x, y, 5);
    card.castShadow = true;
    return card;
}

function makeCard3D(x = 0, y = 0, resultNum = 2, resultSuit = 'clubs', z = 5) {
    const texture = new THREE.TextureLoader().load(`/assets/cards/${resultNum}_of_${resultSuit}.svg`);
    const textureMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide, transparent: true});
    const card = new THREE.Mesh(cardGeometry, textureMaterial);
    card.position.set(x, y, z);
    card.castShadow = true;
    return card;
}

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function animate() {
    renderer.render(scene, camera);

    p1cards3d.forEach((card) => {
        if (card.cardObject.position.x != card.desiredX) {
            card.cardObject.position.x = lerp(card.cardObject.position.x, card.desiredX, 0.05);
        }
    })

    p2cards3d.forEach((card) => {
        if (card.cardObject.position.x != card.desiredX) {
            card.cardObject.position.x = lerp(card.cardObject.position.x, card.desiredX, 0.05);
        }
    })

    if (battery3d && !slowInternet) {
        requestAnimationFrame(animate);
    }
};

//Detect 3D Capabilities
if ((window.WebGLRenderingContext || window.WebGLRenderingContext) && (renderer.domElement.getContext('webgl') || renderer.domElement.getContext('experimental-webgl') || renderer.domElement.getContext('webgl2'))) {
    capable3d = true;
    console.log('3D Capable')
}
