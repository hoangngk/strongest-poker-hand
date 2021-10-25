import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public cardsOnHand: string[] = [];
  public fiveCards: string[] = [];
  public pokerHands: string[][] = [];
  public strongest!: string;

  private deck: string[] = [];
  // H = Heart, C = Club, D = Diamond, S = Spade
  private suits = ['H', 'C', 'D', 'S'];
  private faces = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'T',
    'J',
    'Q',
    'K',
    'A',
  ];

  private readonly order = '23456789TJQKA';

  public ngOnInit() {
    this.generateDeck();
  }

  public getYourCards(): void {
    this.cardsOnHand = [];
    this.cardsOnHand = this.getRandomCardsFromDeck(this.deck, 2);
  }

  public getFiveCards(): void {
    this.fiveCards = [];
    const excludedCardsOnHands = this.deck.filter(
      (c) => !this.cardsOnHand.includes(c)
    );
    this.fiveCards = this.getRandomCardsFromDeck(excludedCardsOnHands, 5);
  }

  public findStrongestPokerHand(): void {
    this.pokerHands = [];
    for (const ph of this.generatePokerHands()) {
      this.pokerHands.push(ph);
    }
    const pokerHandsWithRank = this.pokerHands.map((p) =>
      this.getPokerHandRank(p)
    );
    const sortedRanks = pokerHandsWithRank.sort((a, b) => {
      if (a.rank < b.rank) return 1;
      if (a.rank > b.rank) return -1;
      return 0;
    });

    this.strongest = sortedRanks[0]?.value ?? 'Not found';
  }

  private generatePokerHands(): string[][] {
    return this.combinationN([...this.cardsOnHand, ...this.fiveCards], 5);
  }

  private *combinationN(array: string[], n: number): any {
    if (n === 1) {
      for (const a of array) {
        yield [a];
      }
      return;
    }

    for (let i = 0; i <= array.length - n; i++) {
      for (const c of this.combinationN(array.slice(i + 1), n - 1)) {
        yield [array[i], ...c];
      }
    }
  }

  private getPokerHandRank(cards: string[]) {
    const faces = cards
      .map((a) => String.fromCharCode(...[77 - this.order.indexOf(a[0])]))
      .sort();

    const suits = cards.map((a) => a[1]).sort();
    const counts = faces.reduce(this.count, {});
    const duplicates: any = Object.values(counts).reduce(this.count, {});
    const flush = suits[0] === suits[4];
    const first = faces[0].charCodeAt(0);

    const lowStraight = faces.join('') === 'AJKLM';
    faces[0] = lowStraight ? 'N' : faces[0];
    const straight =
      lowStraight ||
      faces.every((f, index) => f.charCodeAt(0) - first === index);
    let rank =
      (flush && straight && 1) ||
      (duplicates[4] && 2) ||
      (duplicates[3] && duplicates[2] && 3) ||
      (flush && 4) ||
      (straight && 5) ||
      (duplicates[3] && 6) ||
      (duplicates[2] > 1 && 7) ||
      (duplicates[2] && 8) ||
      9;

    return {
      rank,
      value: faces
        .sort((a, b) => {
          const countDiff = counts[b] - counts[a];
          if (countDiff) return countDiff;
          return b > a ? -1 : b === a ? 0 : 1;
        })
        .join(''),
    };
  }

  private generateDeck(): void {
    this.deck = this.suits.flatMap((f) => this.faces.map((s) => s + f));
  }

  private getRandomCardsFromDeck(deck: string[], num: number): string[] {
    const randomCards = [];
    if (num > 0) {
      for (let index = 0; index < num; index++) {
        randomCards.push(deck[Math.floor(Math.random() * deck.length)]);
      }
    }
    return randomCards;
  }

  private count(c: Record<string, any>, a: string): Record<string, any> {
    c[a] = (c[a] || 0) + 1;
    return c;
  }
}
