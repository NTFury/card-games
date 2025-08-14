// Texas Hold'em Poker with basic hand ranking

const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let opponentHand = [];
let communityCards = [];
let stage = 0;

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
    communityCards.push(deck.pop(), deck.pop(), deck.pop());
  } else if (stage === 1) {
    communityCards.push(deck.pop());
  } else if (stage === 2) {
    communityCards.push(deck.pop());
  } else {
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
  let playerBest = evaluateBestHand([...playerHand, ...communityCards]);
  let opponentBest = evaluateBestHand([...opponentHand, ...communityCards]);

  let winner;
  if (playerBest.score > opponentBest.score) {
    winner = "You win!";
  } else if (playerBest.score < opponentBest.score) {
    winner = "Opponent wins!";
  } else {
    winner = "It's a tie!";
  }

  display.textContent =
    `Your Hand: ${formatHand(playerHand)}\n` +
    `Community: ${formatHand(communityCards)}\n` +
    `Opponent: ${formatHand(opponentHand)}\n\n` +
    `--- Showdown ---\n` +
    `Your Best: ${playerBest.name}\n` +
    `Opponent Best: ${opponentBest.name}\n` +
    `Result: ${winner}`;
}

function formatHand(hand) {
  return hand.map(card => `[${card.suit} ${card.value}]`).join(' ');
}

function stageName(num) {
  return ['Pre-Flop', 'Flop', 'Turn', 'River', 'Showdown'][num] || '';
}

// ========== HAND EVALUATION ==========
function cardValueIndex(value) {
  return values.indexOf(value);
}

function evaluateBestHand(cards) {
  // Sort high → low by value
  cards.sort((a, b) => cardValueIndex(b.value) - cardValueIndex(a.value));

  let handCheckers = [
    { name: 'Royal Flush', score: 9000000, fn: isRoyalFlush },
    { name: 'Straight Flush', score: 8000000, fn: isStraightFlush },
    { name: 'Four of a Kind', score: 7000000, fn: isFourOfAKind },
    { name: 'Full House', score: 6000000, fn: isFullHouse },
    { name: 'Flush', score: 5000000, fn: isFlush },
    { name: 'Straight', score: 4000000, fn: isStraight },
    { name: 'Three of a Kind', score: 3000000, fn: isThreeOfAKind },
    { name: 'Two Pair', score: 2000000, fn: isTwoPair },
    { name: 'One Pair', score: 1000000, fn: isOnePair },
    { name: 'High Card', score: 0, fn: isHighCard }
  ];

  for (let checker of handCheckers) {
    let result = checker.fn(cards);
    if (result) {
      // Add kicker values for tie-breaking
      let kickerScore = result.kickers.reduce((acc, v) => acc * 15 + v, 0);
      return { name: checker.name, score: checker.score + kickerScore };
    }
  }
}

// ----- Hand Type Functions -----
function isRoyalFlush(cards) {
  let straightFlush = isStraightFlush(cards);
  if (straightFlush && straightFlush.kickers[0] === 12) { // Ace high
    return straightFlush;
  }
  return null;
}

function isStraightFlush(cards) {
  let flush = isFlush(cards);
  if (flush) {
    let straight = isStraight(flush.cards);
    if (straight) return straight;
  }
  return null;
}

function isFourOfAKind(cards) {
  let counts = valueCounts(cards);
  for (let v in counts) {
    if (counts[v] === 4) {
      let kicker = highestOther(cards, parseInt(v));
      return { kickers: [parseInt(v), kicker] };
    }
  }
  return null;
}

function isFullHouse(cards) {
  let counts = valueCounts(cards);
  let three = -1, two = -1;
  for (let v = 12; v >= 0; v--) {
    if (counts[v] >= 3 && three === -1) three = v;
    else if (counts[v] >= 2 && two === -1) two = v;
  }
  if (three !== -1 && two !== -1) return { kickers: [three, two] };
  return null;
}

function isFlush(cards) {
  let suitsCount = {};
  for (let card of cards) {
    suitsCount[card.suit] = suitsCount[card.suit] || [];
    suitsCount[card.suit].push(card);
  }
  for (let suit in suitsCount) {
    if (suitsCount[suit].length >= 5) {
      return { cards: suitsCount[suit].slice(0, 5), kickers: suitsCount[suit].slice(0, 5).map(c => cardValueIndex(c.value)) };
    }
  }
  return null;
}

function isStraight(cards) {
  let uniqueVals = [...new Set(cards.map(c => cardValueIndex(c.value)))].sort((a, b) => b - a);
  // Handle wheel straight (A-2-3-4-5)
  if (uniqueVals.includes(12)) uniqueVals.push(-1);
  let streak = 1;
  for (let i = 0; i < uniqueVals.length - 1; i++) {
    if (uniqueVals[i] - uniqueVals[i + 1] === 1) {
      streak++;
      if (streak >= 5) return { kickers: [uniqueVals[i - 3]] };
    } else streak = 1;
  }
  return null;
}

function isThreeOfAKind(cards) {
  let counts = valueCounts(cards);
  for (let v = 12; v >= 0; v--) {
    if (counts[v] === 3) {
      let kickers = topKickers(cards, parseInt(v), 2);
      return { kickers: [parseInt(v), ...kickers] };
    }
  }
  return null;
}

function isTwoPair(cards) {
  let counts = valueCounts(cards);
  let pairs = [];
  for (let v = 12; v >= 0; v--) {
    if (counts[v] === 2) pairs.push(v);
  }
  if (pairs.length >= 2) {
    let kicker = highestOther(cards, pairs[0], pairs[1]);
    return { kickers: [pairs[0], pairs[1], kicker] };
  }
  return null;
}

function isOnePair(cards) {
  let counts = valueCounts(cards);
  for (let v = 12; v >= 0; v--) {
    if (counts[v] === 2) {
      let kickers = topKickers(cards, parseInt(v), 3);
      return { kickers: [parseInt(v), ...kickers] };
    }
  }
  return null;
}

function isHighCard(cards) {
  return { kickers: cards.map(c => cardValueIndex(c.value)).slice(0, 5) };
}

// ===== Helper Functions =====
function valueCounts(cards) {
  let counts = {};
  for (let card of cards) {
    let idx = cardValueIndex(card.value);
    counts[idx] = (counts[idx] || 0) + 1;
  }
  return counts;
}

function highestOther(cards, ...exclude) {
  return cards.map(c => cardValueIndex(c.value)).filter(v => !exclude.includes(v))[0];
}

function topKickers(cards, exclude, count) {
  return cards.map(c => cardValueIndex(c.value)).filter(v => v !== exclude).slice(0, count);
}

dealBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextStage);
