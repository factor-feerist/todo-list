function createElement(tag, attributes, children, callbacks=[]) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  for (let pair of callbacks) {
    element.addEventListener(pair.eventName, pair.callback);
  }

  return element;
}

class Component {
  constructor() {
  }

  update() {
    const parent = this._domNode.parentElement;
    parent.removeChild(this._domNode);
    parent.appendChild(this.getDomNode());
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }
}

class TodoList extends Component {
  constructor(TodoListId=0){
    super();
    this.addTask = new AddTask(this.createOnAddTask());
    this.localStorageFieldName = `TodoList_${TodoListId}_state`;
    try{
      const saved_state = JSON.parse(localStorage.getItem(this.localStorageFieldName));
      console.log(saved_state);
      if (saved_state !== null){
        this.state = saved_state;
        return;
      }
    } catch {

    }
    
    this.state = {
      tasks: [
        { title: "Сделать домашку", progress: false },
        { title: "Сделать практику", progress: false },
        { title: "Пойти домой", progress: false }
      ],
      newTaskName: ""
    };
    this.saveState();
  }

  saveState() {
    const stateString = JSON.stringify(this.state)
    localStorage.setItem(this.localStorageFieldName, stateString);
  }

  createOnAddTask() {
    return (function() {
      this.state.tasks.push({ title: this.state.newTaskName, progress: false });
      this.saveState();
      this.update();
    }).bind(this);
  }

  createOnAddInputChange() {
    return (function(event) {
      this.state.newTaskName = event.target.value;
      this.saveState();
    }).bind(this);
  }

  createOnDeleteTask(task){
    return (function() {
      var index = this.state.tasks.indexOf(task);
      if (index !== -1) {
        this.state.tasks.splice(index, 1);
      }
      this.saveState();
      this.update();
    }).bind(this);
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
          value: this.state.newTaskName
        },
        {},
          [
            { eventName: "change", callback: this.createOnAddInputChange() }
          ]
        ),
        createElement("button", { id: "add-btn" }, "+",
        [
          { eventName: "click", callback: this.addTask.OnAddTask }
        ]
        ),
      ]),
      createElement("ul", { id: "todos" }, this.state.tasks.map(
        v => (new Task(this.createOnDeleteTask.bind(this), this.saveState.bind(this), v)).render()) 
      ),
    ]);
  }
}

class AddTask extends Component {
  constructor(OnAddTask) {
    super();
    this.OnAddTask = OnAddTask;
  }
}

class Task extends Component {
  constructor(OnDelete, OnChange, state) {
    super();
    this.state = state;
    this.OnDelete = OnDelete(this.state);
    this.OnChange = OnChange;
  }

  render() {
    return createElement("li", {}, [
      createElement("input", this.state.progress ? { type: "checkbox", checked: "checked" } : { type: "checkbox" }, {}, [{eventName: "change", callback: this.createOnTaskChecked()}]),
      createElement("label", {}, this.state.title),
      createElement("button", {}, "🗑️", [{eventName: "click", callback: this.OnDelete}])
    ])
  }

  createOnTaskChecked(){
    return (function(event){
      this.state.progress = !this.state.progress;
      event.target.nextElementSibling.setAttribute('style', this.state.progress ? 'color:#aaa;' : '');
      this.OnChange();
    }).bind(this);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
