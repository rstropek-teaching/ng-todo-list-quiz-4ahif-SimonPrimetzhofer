import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatTableModule} from '@angular/material';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';

interface ITodoItem{
  id:number;
  description:string;
  assignedTo:string;
  done:boolean;
}
interface IPerson{
  name:string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  private http:HttpClient;
  public apiURL="http://localhost:8081/api/";
  
  public people:Observable<IPerson[]>;
  public todos:Observable<ITodoItem[]>;

  headline:string="Please select an option";
  hidePeople=true;
  hideTodos=true;

  //Inject http client for usage
  constructor(private httpClient: HttpClient){
    this.http=httpClient;
    //Load persons after http-client is available
    this.loadPersons();
  }

  //Load persons from api and display those
  loadPersons () {
    this.headline="People";
    this.people=this.http.get<IPerson[]>(this.apiURL+"people");
    this.hideTodos=true;
    this.hidePeople=false;
  }
  //Load todos from api and display those
  loadTodos(){
    this.headline="Todos"
    this.todos=this.http.get<ITodoItem[]>(this.apiURL+"todos");
    this.hidePeople=true;
    this.hideTodos=false;
  }
  //Set a todo item done
  setDone(id:number,flag:boolean){
    this.http.patch(this.apiURL+"todos/"+id,{
      done: !flag
    });
  }

}
