import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule, MatTabChangeEvent} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';

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
  hidePeople:boolean=true;
  hideTodos:boolean=true;

  showNameInput:boolean=false;
  
  //Variables for inserting a new todo item
  newDescription:string="";
  selectedPerson:string="";

  //Inject http client for usage
  constructor(private httpClient: HttpClient){
    this.http=httpClient;
    //Load persons after http-client is available
    this.loadPersons();
  }

  //Check, which tab is selected
  load(tabChangeEvent:MatTabChangeEvent){
    if(tabChangeEvent.index===0)
      this.loadPersons();
    else if(tabChangeEvent.index===1)
      this.loadTodos();
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
      "done": !flag
    }).subscribe();
  }

  addTodo(){
    //I had to change the api, because in demo.http, "Nobody" was needed as assignedTo, when there is no
    //person yet for the todo-item, so I added a few lines of code, to make this possible
    //Sooner, a todo item could only be added to an existing person in the api
    let data:any = {};
    this.http.post(this.apiURL+"todos",{
      "description" : this.newDescription,
      "assignedTo" : this.selectedPerson
    }).subscribe();
    this.newDescription="";
    this.selectedPerson="";
  }

  //Delete a todo item
  deleteTodo(id:number){
    this.http.delete(this.apiURL+"todos/"+id).subscribe();
  }

  //Gets undone todos into todo list
  getUndoneTodos(){
    this.todos=this.http.get<ITodoItem[]>(this.apiURL+"todos");
  }
}
