(function blackjack() {
  // Empty arrays to store shuffled deck and dealt cards
  let playerHand = [];
  let houseHand = [];
  let shuffledDeck = [];

  // Buttons in HTML
  const $playButton = $('#play-button');
  const $playerButtons = $('.player.buttons');
  const $hitButton = $('.hit-button');
  const $standButton = $('.stand-button');

  // Deck objects in HTML
  const $deckDraw = $('.deck.draw');
  const $deckBottom = $('.deck.bottom');
  const $deckTop = $('.deck.top');

  // Play areas in HTML
  const $houseHand = $('.house.hand');
  const $houseDeal = $('.house.deal');
  const $playerHand = $('.player.hand');
  const $playerDeal = $('.player.deal');

  const $result = $('.result');

  $playButton.on('click', () => {
    $result.css('visibility', 'hidden');
    $playButton.css('visibility', 'hidden');
    gameStart();
  });

  $hitButton.on('click', () => {
    playerHit();
  });

  $standButton.on('click', () => {
    playerStand();
  });

  // Returns sorted deck of cards where [i][0] provides the value and [i][1] provides the suit
  function getDeck() {
    const sortedDeck = [[2, 'C'], [3, 'C'], [4, 'C'], [5, 'C'], [6, 'C'], [7, 'C'], [8, 'C'],
      [9, 'C'], [10, 'C'], ['J', 'C'], ['Q', 'C'], ['K', 'C'], ['A', 'C'], [2, 'S'], [3, 'S'],
      [4, 'S'], [5, 'S'], [6, 'S'], [7, 'S'], [8, 'S'], [9, 'S'], [10, 'S'], ['J', 'S'], ['Q', 'S'],
      ['K', 'S'], ['A', 'S'], [2, 'D'], [3, 'D'], [4, 'D'], [5, 'D'], [6, 'D'], [7, 'D'], [8, 'D'],
      [9, 'D'], [10, 'D'], ['J', 'D'], ['Q', 'D'], ['K', 'D'], ['A', 'D'], [2, 'H'], [3, 'H'],
      [4, 'H'], [5, 'H'], [6, 'H'], [7, 'H'], [8, 'H'], [9, 'H'], [10, 'H'], ['J', 'H'], ['Q', 'H'],
      ['K', 'H'], ['A', 'H']];
    return sortedDeck;
  }

  // Creates array of shuffled cards
  function shuffleDeck(deck) {
    shuffledDeck = [];
    const usedNums = [];
    while (shuffledDeck.length < deck.length) {
      const i = Math.floor(Math.random() * 52);
      if (usedNums.includes(i) === false) {
        usedNums.push(i);
        shuffledDeck.push(deck[i]);
      }
    }
    return shuffledDeck;
  }

  // Resets deck and hand from previous games, dealing 2 cards to player and 1 card to house
  function gameStart() {
    shuffledDeck = shuffleDeck(getDeck());
    playerHand = [];
    houseHand = [];
    const $clockwise = $('.clockwise');
    const $anticlockwise = $('.anticlockwise');

    $('.card').remove();
    $anticlockwise.removeClass('anticlockwise').addClass('clockwise');
    $clockwise.removeClass('clockwise').addClass('anticlockwise');
    const score = dealCards(shuffledDeck, playerHand, 2, $playerHand);
    dealCards(shuffledDeck, houseHand, 1, $houseHand);
    $playerButtons.css('visibility', 'visible');
    return score === 'blackjack' ? playerWins('blackjack') : score;
  }

  // Deals specified number of cards to specified hand, returning hand's total score
  function dealCards(deck, hand, num, location) {
    for (let i = num; i > 0; i -= 1) {
      const card = deck.pop();
      hand.push(card);
      $('<img>')
        .attr('src', `./images/${card.join('')}.png`)
        .attr('alt', `${card.join('')}`)
        .addClass('card')
        .appendTo(location);
    }
    return calcScore(hand);
  }

  // Returns hand's score, assigning value to face cards and adjusting Ace values if needed
  function calcScore(hand) {
    let score = 0;
    for (let i = 0; i < hand.length; i += 1) {
      if (Number.isNaN(Number(hand[i][0])) === true) {
        const value = hand[i][0] === 'A' ? 11 : 10;
        score += value;
      } else {
        score += hand[i][0];
      }
    }
    if (score > 21) {
      const aces = aceCount(hand);
      for (let i = aces; i > 0; i -= 1) {
        if (score > 21) {
          score -= 10;
        }
      }
    }
    if (isBJ(hand, score)) {
      return 'blackjack';
    }
    if (isBust(score)) {
      return 'bust';
    }
    return score;
  }

  // Returns if hand is blackjack
  function isBJ(hand, score) {
    if (score === 21 && hand.length === 2) {
      return true;
    }
    return false;
  }

  // Returns if hand is bust
  function isBust(score) {
    if (score > 21) {
      $playerButtons.css('visibility', 'hidden');
      return true;
    }
    return false;
  }

  // Returns number of aces in hand
  function aceCount(hand) {
    let aces = 0;
    for (let i = 0; i < hand.length; i += 1) {
      if (hand[i][0] === 'A') {
        aces += 1;
      }
    }
    return aces;
  }

  // Deals another card to player, calculating whether new score is bust
  function playerHit() {
    const score = dealCards(shuffledDeck, playerHand, 1, $playerDeal);
    if (score === 'bust') {
      return playerLoses('bust');
    }
    if (score === 21) {
      return playerStand();
    }
    return score;
  }

  // Player holds current score, waits for house to draw, then returns winner
  function playerStand() {
    $playerButtons.css('visibility', 'hidden');
    const playerScore = calcScore(playerHand);
    const houseScore = houseDraw(calcScore(houseHand));
    return calcWinner(playerScore, houseScore);
  }

  // House draws cards until score is bust, blackjack, or over 16
  function houseDraw(score) {
    let newScore = score;
    if (Number.isNaN(Number(newScore)) === true || newScore >= 17) {
      return newScore;
    }
    newScore = dealCards(shuffledDeck, houseHand, 1, $houseDeal);
    return houseDraw(newScore);
  }

  // Compares house and player scores to determine outcome
  function calcWinner(playerScore, houseScore) {
    if (houseScore === 'bust') {
      return playerWins('won');
    }
    if (houseScore === 'blackjack' && playerScore === 21) {
      return playerDraws();
    }
    if (houseScore === playerScore) {
      return playerDraws();
    }
    if (houseScore > playerScore) {
      return playerLoses('lost');
    }
    return playerWins('won');
  }

  // Player wins the game
  function playerWins(type) {
    if (type === 'blackjack') {
      $playerButtons.css('visibility', 'hidden');
      $result.html('BLACK<span>jack</span>!').css('visibility', 'visible');
    } else {
      $result.text('winner!').css('visibility', 'visible');
    }
    $playButton.text('play again').css('visibility', 'visible');
  }

  // Player and house draw
  function playerDraws() {
    $result.text('draw').css('visibility', 'visible');
    $playButton.text('play again').css('visibility', 'visible');
  }

  // Player loses the game
  function playerLoses(type) {
    if (type === 'bust') {
      $result.text('bust!').css('visibility', 'visible');
    } else {
      $result.text('loser!').css('visibility', 'visible');
    }
    $playButton.text('play again').css('visibility', 'visible');
  }
}());
