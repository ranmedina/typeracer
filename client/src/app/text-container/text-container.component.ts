import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'text-container',
  templateUrl: './text-container.component.html',
  styleUrls: ['./text-container.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TextContainerComponent implements OnInit {
  @ViewChild('completedWordsDiv') completedWordsDiv: ElementRef;
  @ViewChild('uncompletedWordsDiv') uncompletedWordsDiv: ElementRef;
  @ViewChild('hiddenWordsDiv') hiddenWordsDiv: ElementRef;

  private readonly CHARACTERS_PER_LINE = 100;
  private readonly SENTENCES_AMOUNT = 10;
  private readonly TIMER_SECONDS = 60;

  public timer = this.TIMER_SECONDS;
  public timerStarted: boolean = false;
  private interval;

  public inputField: string;

  public fullText: string = '';

  public completedWords: string[] = [];
  public completedLetters: number = 0;
  public uncompletedWords: string[][] = [];
  public correctWords: number = 0;
  public incorrectWords: number = 0;

  private linesPassed: number = 0;

  constructor(private httpClient: HttpClient) {}

  async ngOnInit() {
    await this.reloadWords();
  }

  private async reloadWords(): Promise<any> {
    return this.httpClient.get(`http://localhost:3000/getSentences?amount=${this.SENTENCES_AMOUNT}`).subscribe((e) => {
      const wordsArray: string[] = [];
      Object.assign(wordsArray, e);
      this.uncompletedWords = wordsArray.map((e: string) => {
        e = this.firstCharToUpperCase(e);
        return e.split(' ');
      });
      this.uncompletedWords.map((e) => {
        e[e.length - 1] += '. ';
        this.fullText += e.join(' ');
      });
    });
  }

  public onValueChanges(): void {
    if (!this.timerStarted && this.completedLetters === 0) {
      this.startTimer();
    }
  }

  public restart(): void {
    this.resetSettings();
    this.timerStarted = true;
  }

  private async startTimer(): Promise<any> {
    if (this.timerStarted) {
      return;
    }

    this.timerStarted = true;

    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        clearInterval(this.interval);
        this.finishTypingTest();
      }
    }, 1000);
  }

  private finishTypingTest() {
    this.timerStarted = false;
  }

  private async resetSettings(): Promise<any> {
    // This will only be called if the user pressed the restart button
    if (this.completedLetters > 0) {
      this.fullText = '';
      this.completedWords = [''];
      await this.reloadWords();
    }

    this.timer = this.TIMER_SECONDS;
    this.completedLetters = 0;
    this.timerStarted = false;
    this.linesPassed = 0;
    this.correctWords = 0;
    this.incorrectWords = 0;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public onSpaceBarPress(): void {
    if (!this.timerStarted) {
      return;
    }

    if (this.inputField.length > 0) {
      const wordMatch: boolean = this.uncompletedWords[0][0].trim() === this.inputField.slice(0, this.inputField.search(' '));
      wordMatch ? this.correctWords++ : this.incorrectWords++;
      this.completedWords.push(`<span class="${wordMatch ? 'correct' : 'incorrect'}">${this.uncompletedWords[0][0]} </span>`);
      this.completedLetters += this.uncompletedWords[0][0].length + 1;

      // Detect when new line break - on exact 93 letters
      if (this.completedLetters % this.CHARACTERS_PER_LINE >= 0 && this.completedLetters >= this.CHARACTERS_PER_LINE) {
        if (this.linesPassed !== Math.floor(this.completedLetters / this.CHARACTERS_PER_LINE)) {
          this.linesPassed++;
          document.getElementById('wrapper').scrollTop += 21;
        }
      }

      this.fullText = this.fullText.slice(
        this.uncompletedWords[0][0].length + (this.uncompletedWords[0].length === 1 ? 0 : 1),
        this.fullText.length
      );
      this.uncompletedWords[0].splice(0, 1);
      if (this.uncompletedWords[0].length === 0) {
        this.uncompletedWords.splice(0, 1);
      }

      // Due to a very slight delay, take the last character and push it into the next word
      const lastChar = this.inputField[this.inputField.length - 1];
      this.inputField = lastChar !== ' ' ? lastChar : '';
    }
  }

  private firstCharToUpperCase(string: string): string {
    return string[0].charAt(0).toUpperCase() + string.slice(1, string.length);
  }
}
