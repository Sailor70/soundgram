import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IImage } from 'app/shared/model/image.model';
import { map } from 'rxjs/operators';

type EntityResponseType = HttpResponse<IImage>;
type EntityArrayResponseType = HttpResponse<IImage[]>;

@Injectable({ providedIn: 'root' })
export class ImageService {
  public resourceUrl = SERVER_API_URL + 'api/images';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/images';

  constructor(protected http: HttpClient) {}

  create(file: File, postId: number): Observable<EntityResponseType> {
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    formdata.append('id', postId.toString());
    return this.http.post<IImage>(this.resourceUrl, formdata, { observe: 'response' });
  }

  /*  create(image: IImage): Observable<EntityResponseType> {
    return this.http.post<IImage>(this.resourceUrl, image, { observe: 'response' });
  }*/

  update(image: IImage): Observable<EntityResponseType> {
    return this.http.put<IImage>(this.resourceUrl, image, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IImage>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getFile(id: number): Observable<any> {
    return this.http.get(`${this.resourceUrl + '-download'}/${id}`, { responseType: 'blob', observe: 'response' }).pipe(
      map((res: any) => {
        return new Blob([res.body], { type: 'image/jpeg' });
      })
    ); // params: {responseType: "blob"}
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IImage[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IImage[]>(this.resourceSearchUrl, { params: options, observe: 'response' });
  }
}
