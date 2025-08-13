// Blackjack Game Logic

// ====== Variables ======
let deck = [];
let playerHand = [];
let dealerHand = [];

// ====== DOM Elements ======
const tableArea = document.querySelector(".table-area");
const hitBtn = document.querySelector("#hit");
const standBtn = document.querySelector("#stand");
const newGameBtn = document.querySelector("#new-game");

// ====== Functions ======

// Create a fresh deck
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
  ];
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
}

// Shuffle deck (Fisher-Yates shuffle)
function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Deal a card from the deck
function dealCard(hand) {
  if (deck.length === 0) {
    createDeck();
    shuffleDeck();
  }
  hand.push(deck.pop());
}

// Get total hand value
function getHandValue(hand) {
  let value = 0;
  let aceCount = 0;

  for (let card of hand) {
    if (["J", "Q", "K"].includes(card.value)) {
      value += 10;
    } else if (card.value === "A") {
      aceCount += 1;
      value += 11;
    } else {
      value += parseInt(card.value);
    }
  }

  // Adjust for Aces if bust
  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return value;
}

// Render hands to table
function renderHands(hideDealerCard = true) {
  let dealerDisplay = dealerHand.map((c, i) => {
    if (i === 0 && hideDealerCard) return "[ ? ]";
    return `[ ${c.suit} ${c.value} ]`;
  }).join(" ");

  let playerDisplay = playerHand.map(
    c => `[ ${c.suit} ${c.value} ]`
  ).join(" ");

  tableArea.innerHTML = `
<pre>
Dealer: ${dealerDisplay}
Player: ${playerDisplay}
</pre>
<p>Player total: ${getHandValue(playerHand)}</p>
`;
}

// Start a new game
function startGame() {
  createDeck();
  shuffleDeck();
  playerHand = [];
  dealerHand = [];

  dealCard(playerHand);
  dealCard(dealerHand);
  dealCard(playerHand);
  dealCard(dealerHand);

  renderHands(true);

  hitBtn.disabled = false;
  standBtn.disabled = false;
}

// Player hits
function playerHit() {
  dealCard(playerHand);
  renderHands(true);
  if (getHandValue(playerHand) > 21) {
    endGame("You bust! Dealer wins.");
  }
}

// Player stands
function playerStand() {
  // Dealer's turn
  while (getHandValue(dealerHand) < 17) {
    dealCard(dealerHand);
  }
  checkWinner();
}

// Check winner
function checkWinner() {
  const playerTotal = getHandValue(playerHand);
  const dealerTotal = getHandValue(dealerHand);

  renderHands(false);

  if (dealerTotal > 21) {
    endGame("Dealer busts! You win!");
  } else if (playerTotal > dealerTotal) {
    endGame("You win!");
  } else if (playerTotal < dealerTotal) {
    endGame("Dealer wins!");
  } else {
    endGame("It's a tie!");
  }
}

// End game
function endGame(message) {
  tableArea.innerHTML += `<p>${message}</p>`;
  hitBtn.disabled = true;
  standBtn.disabled = true;
}

// ====== Event Listeners ======
hitBtn.addEventListener("click", playerHit);
standBtn.addEventListener("click", playerStand);
newGameBtn.addEventListener("click", startGame);

// ====== Start First Game ======
startGame();
