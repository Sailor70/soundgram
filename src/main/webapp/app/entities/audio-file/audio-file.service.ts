import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { map } from 'rxjs/operators';

type EntityResponseType = HttpResponse<IAudioFile>;
type EntityArrayResponseType = HttpResponse<IAudioFile[]>;

@Injectable({ providedIn: 'root' })
export class AudioFileService {
  public resourceUrl = SERVER_API_URL + 'api/audio-files';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/audio-files';

  constructor(protected http: HttpClient) {}

  create(file: File): Observable<EntityResponseType> {
    // audioFile: IAudioFile
    // audioFile: IAudioFile,
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    // formdata.append('icon', icon); //plik ikony do zapisu i utworzenia iconPath
    // formdata.append('postId', audioFile.post.id.toString()); // id posta
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

  getFile(id: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/json',
        responseType: 'arraybuffer'
      })
    };

    return this.http.get(`${this.resourceUrl + '-download'}/${id}`, { responseType: 'blob', observe: 'response' }).pipe(
      map((res: any) => {
        return new Blob([res.body], { type: 'audio/mpeg' });
      })
    ); // params: {responseType: "blob"}
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
