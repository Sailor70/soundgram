import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IFollowedUser } from 'app/shared/model/followed-user.model';

type EntityResponseType = HttpResponse<IFollowedUser>;
type EntityArrayResponseType = HttpResponse<IFollowedUser[]>;

@Injectable({ providedIn: 'root' })
export class FollowedUserService {
  public resourceUrl = SERVER_API_URL + 'api/followed-users';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/followed-users';

  constructor(protected http: HttpClient) {}

  create(followedUser: IFollowedUser): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(followedUser);
    return this.http
      .post<IFollowedUser>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  createWithId(id: number): Observable<EntityResponseType> {
    // const copy = this.convertDateFromClient(followedUser);
    return this.http
      .post<IFollowedUser>(this.resourceUrl + '_id', id, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(followedUser: IFollowedUser): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(followedUser);
    return this.http
      .put<IFollowedUser>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IFollowedUser>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  findFollowed(): Observable<EntityArrayResponseType> {
    return this.http
      .get<IFollowedUser[]>(this.resourceUrl + '_get', { observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IFollowedUser[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  deleteFollowedId(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl + '_id'}/${id}`, { observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  onUserDelete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl + '-delete-user'}/${id}`, { observe: 'response' });
  }

  search(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IFollowedUser[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  protected convertDateFromClient(followedUser: IFollowedUser): IFollowedUser {
    const copy: IFollowedUser = Object.assign({}, followedUser, {
      dateFollowed: followedUser.dateFollowed != null && followedUser.dateFollowed.isValid() ? followedUser.dateFollowed.toJSON() : null
    });
    return copy;
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateFollowed = res.body.dateFollowed != null ? moment(res.body.dateFollowed) : null;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((followedUser: IFollowedUser) => {
        followedUser.dateFollowed = followedUser.dateFollowed != null ? moment(followedUser.dateFollowed) : null;
      });
    }
    return res;
  }
}
