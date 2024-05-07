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
  constructor(){
    super();
    this.state = {
      tasks: [
        new Task("Сделать домашку", this.createOnDeleteTask.bind(this)),
        new Task("Сделать практику", this.createOnDeleteTask.bind(this)),
        new Task("Пойти домой", this.createOnDeleteTask.bind(this))
      ],
      newTaskName: ""
    };
    this.addTask = new AddTask(this.createOnAddTask());
  }

  createOnAddTask() {
    return (function() {
      this.state.tasks.push(new Task(this.state.newTaskName, this.createOnDeleteTask.bind(this)));
      this.update();
    }).bind(this);
  }

  createOnAddInputChange() {
    return (function(event) {
      this.state.newTaskName = event.target.value;
    }).bind(this);
  }

  createOnDeleteTask(task){
    return (function() {
      var index = this.state.tasks.indexOf(task);
      if (index !== -1) {
        this.state.tasks.splice(index, 1);
      }
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
          { eventName: "click", callback: this.addTask.state.OnAddTask }
        ]
        ),
      ]),
      createElement("ul", { id: "todos" }, this.state.tasks.map(
        v => createElement("li", {}, [
          createElement("input", { type: "checkbox" }, {}, [{eventName: "change", callback: v.createOnTaskChecked()}]),
          createElement("label", {}, v.state.title),
          createElement("button", {}, "🗑️", [{eventName: "click", callback: v.OnDelete}])
        ])) 
      ),
    ]);
  }
}

class AddTask extends Component {
  constructor(OnAddTask) {
    super();
    this.state = {
      OnAddTask: OnAddTask
    }
  }
}

class Task extends Component {
  constructor(title, OnDelete, progress=false) {
    super();
    this.state = {
      title: title,
      progress: progress
    }
    this.OnDelete = OnDelete(this);
  }

  createOnTaskChecked(){
    return (function(event){
      this.state.progress = !this.state.progress;
      event.target.nextElementSibling.setAttribute('style', this.state.progress ? 'color:#aaa;' : '');
    }).bind(this);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
