import { Component } from '@angular/core';
import { Requester } from '../services/Requester';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'statsMain-component',
  templateUrl: './statsMain.component.html'
})
export class StatsMainComponent
{
  public AllPlayedChampions: Observable<any>;
  public AllPlayedChampionsError: Observable<any>;
  public WinrateByChampID : Observable<any>;

  constructor(private requester: Requester)
  {
    this.AllPlayedChampions = requester.GetAllPlayedChampions();
    /*this.AllPlayedChampions.subscribe
    (
      (next) => { },
      (error) => {
                   console.log(error);
                   this.AllPlayedChampionsError = error;
      }
    );*/
  }

  OnChampionSelected(champion)
  {
    console.log("aksing for winrate with: " + champion);
    this.WinrateByChampID = this.requester.GetWinrateByChampID(champion);
    this.WinrateByChampID.subscribe
    (
      (next) => { console.log(this.WinrateByChampID) },
      (error) => { console.log(this.WinrateByChampID) }
      //() => { console.log("complete? " + JSON.stringify(this.WinrateByChampID)) }
    );
  }


}
