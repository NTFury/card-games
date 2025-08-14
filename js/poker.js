// Basic Texas Hold'em setup

const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let opponentHand = [];
let communityCards = [];
let stage = 0; // 0: pre-flop, 1: flop, 2: turn, 3: river

const display = document.getElementById('poker-display');
const dealBtn = document.getElementById('deal');
const nextBtn = document.getElementById('next-round');

// Create and shuffle deck
function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function startGame() {
  createDeck();
  shuffleDeck();

  playerHand = [deck.pop(), deck.pop()];
  opponentHand = [deck.pop(), deck.pop()];
  communityCards = [];
  stage = 0;

  displayGameState();
  nextBtn.disabled = false;
}

function nextStage() {
  if (stage === 0) {
    // Flop
    communityCards.push(deck.pop(), deck.pop(), deck.pop());
  } else if (stage === 1) {
    // Turn
    communityCards.push(deck.pop());
  } else if (stage === 2) {
    // River
    communityCards.push(deck.pop());
  } else {
    // Showdown
    displayShowdown();
    nextBtn.disabled = true;
    return;
  }
  stage++;
  displayGameState();
}

function displayGameState() {
  display.textContent =
    `Your Hand: ${formatHand(playerHand)}\n` +
    `Community: ${formatHand(communityCards)}\n` +
    `Opponent: [Hidden, Hidden]\n\n` +
    `Stage: ${stageName(stage)}`;
}

function displayShowdown() {
  display.textContent =
    `Your Hand: ${formatHand(playerHand)}\n` +
    `Community: ${formatHand(communityCards)}\n` +
    `Opponent: ${formatHand(opponentHand)}\n\n` +
    `--- Showdown ---\n` +
    `(Hand ranking logic coming soon)`;
}

function formatHand(hand) {
  return hand.map(card => `[${card.suit} ${card.value}]`).join(' ');
}

function stageName(num) {
  return ['Pre-Flop', 'Flop', 'Turn', 'River', 'Showdown'][num] || '';
}

dealBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextStage);
