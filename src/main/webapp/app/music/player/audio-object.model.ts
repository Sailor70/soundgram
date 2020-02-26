export interface IAudioObject {
  url?: string;
  title?: string;
  user?: string;
}

export class AudioObject implements IAudioObject {
  constructor(public url?: string, public title?: string, public user?: string) {}
}
