import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IUser } from './user.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  public resourceUrl = SERVER_API_URL + 'api/users';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/users';

  constructor(private http: HttpClient) {}

  create(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.resourceUrl, user);
  }

  update(user: IUser): Observable<IUser> {
    return this.http.put<IUser>(this.resourceUrl, user);
  }

  find(login: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.resourceUrl}/${login}`);
  }

  getAvatarFilename(login: string): Observable<any> {
    return this.http.get(`${this.resourceUrl + '-avatar'}/${login}`, { observe: 'response', responseType: 'text' });
  }

  query(req?: any): Observable<HttpResponse<IUser[]>> {
    const options = createRequestOption(req);
    return this.http.get<IUser[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(login: string): Observable<any> {
    return this.http.delete(`${this.resourceUrl}/${login}`);
  }

  authorities(): Observable<string[]> {
    return this.http.get<string[]>(SERVER_API_URL + 'api/users/authorities');
  }

  search(req?: any): Observable<HttpResponse<IUser[]>> {
    const options = createRequestOption(req);
    return this.http.get<IUser[]>(`${this.resourceSearchUrl}/${options}`, { params: options, observe: 'response' });
    // .pipe(map((res: HttpResponse<IUser[]>) => this.convertDateArrayFromServer(res)));
  }

  saveImage(file: File, userLogin: string): Observable<any> {
    // Observable<any>
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    formdata.append('id', userLogin);
    return this.http.post(SERVER_API_URL + 'api/users/userAvatar', formdata, { observe: 'response', responseType: 'text' });
  }

  getAvatar(imageName: string): Observable<any> {
    return this.http.get(`${SERVER_API_URL + 'api/users/userAvatar'}/${imageName}`, { responseType: 'blob', observe: 'response' }).pipe(
      map((res: any) => {
        return new Blob([res.body], { type: 'image/jpeg' });
      })
    );
  }
}
