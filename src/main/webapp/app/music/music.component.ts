import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'jhi-music',
  templateUrl: './music.component.html',
  styleUrls: ['music.component.scss']
})
export class MusicComponent implements OnInit {
  message: string;

  constructor() {
    this.message = 'MusicComponent message';
  }

  ngOnInit() {}
}
