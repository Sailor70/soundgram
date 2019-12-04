import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IUserExtra } from 'app/shared/model/user-extra.model';

type EntityResponseType = HttpResponse<IUserExtra>;
type EntityArrayResponseType = HttpResponse<IUserExtra[]>;

@Injectable({ providedIn: 'root' })
export class UserExtraService {
  public resourceUrl = SERVER_API_URL + 'api/user-extras';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/user-extras';

  constructor(protected http: HttpClient) {}

  create(userExtra: IUserExtra): Observable<EntityResponseType> {
    return this.http.post<IUserExtra>(this.resourceUrl, userExtra, { observe: 'response' });
  }

  update(userExtra: IUserExtra): Observable<EntityResponseType> {
    return this.http.put<IUserExtra>(this.resourceUrl, userExtra, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IUserExtra>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IUserExtra[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IUserExtra[]>(this.resourceSearchUrl, { params: options, observe: 'response' });
  }
}
