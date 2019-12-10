import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IAudioFile } from 'app/shared/model/audio-file.model';

type EntityResponseType = HttpResponse<IAudioFile>;
type EntityArrayResponseType = HttpResponse<IAudioFile[]>;

@Injectable({ providedIn: 'root' })
export class AudioFileService {
  public resourceUrl = SERVER_API_URL + 'api/audio-files';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/audio-files';

  constructor(protected http: HttpClient) {}

  create(file: File): Observable<EntityResponseType> {
    // audioFile: IAudioFile,
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    return this.http.post<IAudioFile>(this.resourceUrl, formdata, { observe: 'response' });
  }

  /*  create(audioFile: IAudioFile): Observable<EntityResponseType> {
    return this.http.post<IAudioFile>(this.resourceUrl, audioFile, { observe: 'response' });
  }*/

  /*  update(audioFile: IAudioFile): Observable<EntityResponseType> {
    return this.http.put<IAudioFile>(this.resourceUrl, audioFile, { observe: 'response' });
  }*/

  update(audioFile: IAudioFile, file: File): Observable<EntityResponseType> {
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    return this.http.put<IAudioFile>(this.resourceUrl, { audioFile, formdata }, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IAudioFile>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAudioFile[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAudioFile[]>(this.resourceSearchUrl, { params: options, observe: 'response' });
  }
}
