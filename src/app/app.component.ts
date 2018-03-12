import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';

interface ITodoItem {
  id: number;
  description: string;
  assignedTo: string;
  done: boolean;
}
interface IPerson {
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private http: HttpClient;
  public apiURL = "http://localhost:8081/api/";

  public people: IPerson[];
  public todos: ITodoItem[];

  // Note RS: Avoid string constants in TypeScript
  // Note RS: Generally, no need for types if you assign a constant (implicit typing)
  headline: string = "";
  hidePeople: boolean = true;
  hideTodos: boolean = true;

  //Filter variables
  showOnlyUndone: boolean = false;
  showOnlyPerson: string = "";

  //Variables for inserting a new todo item
  newDescription: string = "";
  selectedPerson: string = "";

  //Name filter
  showNameInput: boolean = false;

  //Update variables
  update: boolean = false;

  //Inject http client for usage
  constructor(private httpClient: HttpClient) {
    this.http = httpClient;
    //Load persons after http-client is available
    this.loadPersons();
  }

  //Check, which tab is selected
  load(tabChangeEvent: MatTabChangeEvent) {

    if (tabChangeEvent.index === 0)
      this.loadPersons();
    else if (tabChangeEvent.index === 1) {
      this.showOnlyPerson = "";
      this.showOnlyUndone = false;
      this.loadTodos();
    }
  }

  //Load persons from api and display those
  loadPersons() {
    this.headline = "People";
    this.http.get<IPerson[]>(this.apiURL + "people").subscribe(allPeople => {
      this.people = allPeople;
    });
    this.hideTodos = true;
    this.hidePeople = false;
  }
  //Load todos from api and display those
  loadTodos() {
    this.headline = "Todos"
    this.http.get<ITodoItem[]>(this.apiURL + "todos").subscribe(allTodos => {
      this.todos = allTodos;
    });
    this.hidePeople = true;
    this.hideTodos = false;
  }
  //Set a todo item done
  setDone(id: number, flag: boolean) {
    this.http.patch(this.apiURL + "todos/" + id, {
      "done": !flag
    }).subscribe();
  }

  addTodo() {
    //I had to change the api, because in demo.http, "Nobody" was needed as assignedTo, when there is no
    //person yet for the todo-item, so I added a few lines of code, to make this possible
    //Sooner, a todo item could only be added to an existing person in the api

    // Note RS: That's not correct. You could create a todo item without an assignment. You just had to no set
    // the `assignedTo` field (falsy).

    let data: any = {};
    if (this.selectedPerson === "") {
      data = {
        "description": this.newDescription
      }
    } else {
      data = {
        "description": this.newDescription,
        "assignedTo": this.selectedPerson
      }
    }
    this.http.post(this.apiURL + "todos", data)
      .subscribe(() => {
        this.loadTodos();
      });
    this.newDescription = "";
    this.selectedPerson = "";
  }

  //Delete a todo item
  deleteTodo(id: number) {
    this.http.delete(this.apiURL + "todos/" + id).subscribe(() => {
      this.loadTodos();
    });
  }

  //Filter methods
  setUndoneFilter() {
    // Note RS: Please format the code. Like this, it is really hard to read
    if (this.showOnlyPerson !== "" && this.showOnlyUndone === true)
      this.setBothFilters();
    else if (this.showOnlyUndone === true) {
      //Clear array
      this.todos.splice(0, this.todos.length);
      //Filter undone todos
      this.http.get<ITodoItem[]>(this.apiURL + "todos").subscribe(todoItems => {
        for (const todoItem of todoItems) {
          //A todoitem is undone, when the done flag is not set or it is marked as false
          if (todoItem.done === undefined || todoItem.done === false)
            this.todos.push(todoItem);
        }
      });
    }
  }
  setNameFilter() {
    if (this.showOnlyPerson !== "" && this.showOnlyUndone === true)
      this.setBothFilters();
    else if (this.showOnlyPerson !== "") {
      this.todos.splice(0, this.todos.length);
      this.http.get<ITodoItem[]>(this.apiURL + "todos").subscribe(todoItems => {
        for (const todoItem of todoItems) {
          if (todoItem.assignedTo === undefined && this.showOnlyPerson === "Nobody") {
            this.todos.push(todoItem);
          } else if (todoItem.assignedTo === this.showOnlyPerson) {
            this.todos.push(todoItem);
          }
        }
      });
    }
  }
  setBothFilters() {
    this.todos.splice(0, this.todos.length);
    this.http.get<ITodoItem[]>(this.apiURL + "todos").subscribe(todoItems => {
      for (const todoItem of todoItems) {
        if (todoItem.assignedTo === this.showOnlyPerson && (todoItem.done === false || todoItem.done === undefined))
          this.todos.push(todoItem);
      }
    });
  }

  //Updates the description of a todo item
  updateTodoDescription(id: number) {
    const updatedDescription = (<HTMLInputElement>document.getElementById("descId" + id)).value;
    if (updatedDescription.length > 0) {
      this.http.patch(this.apiURL + "todos/" + id, {
        "description": updatedDescription
      }).subscribe(() => {
        this.loadTodos();
      });
    }
  }
  //Updated person to which the todo item is assigned tos
  updateTodoAssignedTo(data: string, id: number) {
    const updatedAssignedTo = data;
    if (updatedAssignedTo.length > 0) {
      this.http.patch(this.apiURL + "todos/" + id, {
        "assignedTo": updatedAssignedTo
      }).subscribe(() => {
        this.loadTodos();
      });
    }
  }

  //Get state of Person checkbox
  personCheckboxState() {
    if (this.showOnlyPerson === "" && this.showOnlyUndone === false)
      this.loadTodos();
    else if (this.showOnlyUndone === true && this.showOnlyPerson === "") {
      this.setUndoneFilter();
    }
  }
  //Get state of undone checkbox
  undoneCheckboxState() {
    if (this.showOnlyUndone === false && this.showOnlyPerson === "")
      this.loadTodos();
    else if (this.showOnlyPerson !== "" && this.showOnlyUndone === false)
      this.setNameFilter();
  }
}
