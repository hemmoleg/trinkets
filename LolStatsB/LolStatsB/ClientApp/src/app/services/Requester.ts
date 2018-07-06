import {Injectable} from '@angular/core';
import { HttpClient, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import { catchError } from "rxjs/operators";
import { ErrorObservable } from "rxjs/observable/ErrorObservable";

@Injectable()
export class Requester {

  constructor(public client: HttpClient)
  {
  }

  GetAllPlayedChampions() : Observable<any> 
  {
    return this.client.get("https://localhost:5001/Main/GetAllPlayedChampions").pipe(catchError(this.handleError));
  }

  GetWinrateByChampID(champID: number) : Observable<any>
  {
    return this.client.get("https://localhost:5001/Main/GetWinrateByChampID/202").pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse)
  {
    if (error.error instanceof ErrorEvent)
    {
      //a client-side or network error occured. handle it accordingly
      console.error('An error occured:', error.error.message);
    } else
    {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error('Backend returned code ${error.status}, body was: ${error.error}');
    }
    // return an observable with a user-facing error message
    return new ErrorObservable('Something bad happened; please try again later...' + JSON.stringify(error));
  }

  /*GetWinrateById(championID: number): Observable<any> {
    //return this.client.get(this.address.concat(championID));
  }*/
}
