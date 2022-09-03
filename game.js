const KEY = {
	RIGHT: 'ArrowRight',
	DOWN: 'ArrowDown',
	LEFT: 'ArrowLeft',
	UP: 'ArrowUp',
};
const border = board.getBoundingClientRect().width;
const isMobile = border === 380;
const oneStep = isMobile ? 10 : 20;
const body = [head];

let isDead = false;
let direction = KEY.RIGHT;
let speed = 1000;

async function nextMove() {
	if (isDead) {
		return gameOver();
	}

	await move();
	nextMove();
}

async function move() {
	await delay(speed);

	const headPosition = head.getBoundingClientRect();
	const foodPosition = food.getBoundingClientRect();

	if (body.length > 1) {
		for (let i = 1; i < body.length; i += 1) {
			body[i].style.previousLeft = body[i].style.left || headPosition.x + 'px';
			body[i].style.previousTop = body[i].style.top || headPosition.y + 'px';

			if (i === 1) {
				body[i].style.left = headPosition.x + 'px';
				body[i].style.top = headPosition.y + 'px';
			} else {
				body[i].style.left = body[i - 1].style.previousLeft;
				body[i].style.top = body[i - 1].style.previousTop;
			}
		}
	}

	switch (direction) {
		case KEY.RIGHT:
			headPosition.x += oneStep;

			head.style.left = headPosition.x + 'px';
			break;
		case KEY.DOWN:
			headPosition.y += oneStep;

			head.style.top = headPosition.y + 'px';
			break;
		case KEY.LEFT:
			headPosition.x -= oneStep;

			head.style.left = headPosition.x + 'px';
			break;
		case KEY.UP:
			headPosition.y -= oneStep;

			head.style.top = headPosition.y + 'px';
			break;
	}

	if (checkIfEatFood(headPosition, foodPosition)) {
		nextLevel();
		positionFood();
		body.push(getNewBodyPart());
	}

	if (
		checkIfHitBorder(headPosition) ||
		checkIfEatSelf()
	) {
		isDead = true;
	}
}

function gameOver() {
	board.style.display = 'none';
	gameover.style.display = 'block';
	score.textContent = `Your score is: ${body.length - 1}`;
	console.log('Your score is: ', score);
	console.log('GAME OVER X_X');
}

function delay(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

function checkIfNotMinSpeed() {
	return speed !== 0;
}

function nextLevel() {
	if (checkIfNotMinSpeed()) {
		speed -= 100;
	}
}

function checkIfEatFood(headPosition, foodPosition) {
	return (
		headPosition.x === foodPosition.x &&
		headPosition.y === foodPosition.y
	);
}

function checkIfHitBorder(headPosition) {
	return (
		headPosition.x === border ||
		headPosition.y === border ||
		headPosition.x < 0 ||
		headPosition.y < 0
	);
}

function getRandomPoint() {
	return Math.trunc(Math.random() * border / oneStep) * oneStep;
}

function positionFood() {
	const top = getRandomPoint();
	const left = getRandomPoint();

	food.style.top = top + 'px';
	food.style.left = left + 'px';
}

function getNewBodyPart() {
	const newPart = document.createElement('div');

	newPart.style.width = isMobile ? '10px' : '20px';
	newPart.style.height = isMobile ? '10px' : '20px';
	newPart.style.background = 'black';
	newPart.style.position = 'absolute';
	newPart.style.border = '1px solid lightgreen';
	newPart.style.boxSizing = 'border-box';
	newPart.style.top = '-20px';
	newPart.style.left = '-20px';

	board.appendChild(newPart);

	return newPart;
}

function checkIfEatSelf() {
	for (let i = 1; i < body.length; i += 1) {
		if (
			body[0].style.top === body[i].style.top &&
			body[0].style.left === body[i].style.left
		) {
			return true;
		}
	}

	return false;
}

let touchstartX = 0;
let touchendX = 0;

let touchstartY = 0;
let touchendY = 0;

function checkSwipeDirection() {
	if (Math.abs(touchendX - touchstartX) > Math.abs(touchendY - touchstartY)) {
		if (
			touchendX > touchstartX && direction === KEY.LEFT || // swipe right
			touchendX < touchstartX && direction === KEY.RIGHT // swipe left
		) {
			return;
		}

		if (touchendX > touchstartX) {
			direction = KEY.RIGHT;
		} else {
			direction = KEY.LEFT;
		}
	} else {
		if (
			touchendY < touchstartY && direction === KEY.DOWN || // swipe up
			touchendY > touchstartY && direction === KEY.UP // swipe down
		) {
			return;
		}

		if (touchendY < touchstartY) {
			direction = KEY.UP;
		} else {
			direction = KEY.DOWN;
		}
	}
}

document.addEventListener('touchstart', e => {
	touchstartX = e.changedTouches[0].screenX;
	touchstartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
	touchendX = e.changedTouches[0].screenX;
	touchendY = e.changedTouches[0].screenY;

	checkSwipeDirection();
});

document.addEventListener('keyup', (event) => {
	if (
		event.key === direction ||
		event.key === KEY.RIGHT && direction === KEY.LEFT ||
		event.key === KEY.LEFT && direction === KEY.RIGHT ||
		event.key === KEY.UP && direction === KEY.DOWN ||
		event.key === KEY.DOWN && direction === KEY.UP
	) {
		return;
	};

	direction = event.key;
});

nextMove();
