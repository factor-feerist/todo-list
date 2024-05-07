function createElement(tag, attributes, children, callbacks={}) {
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

  for (let [eventName, callback] in callbacks) {
    element.addEventListener(eventName, callback);
  }

  return element;
}

class Component {
  constructor() {
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
        {title: "Сделать домашку", progress: false},
        {title: "Сделать практику", progress: false},
        {title: "Пойти домой", progress: false}
      ],
      newTaskName: ""
    };
  }

  onAddTask() {
    this.state.tasks.push({ title: this.state.newTaskName, progress: false });
  }

  onAddInputChange(event) {
    this.state.newTaskName = event.target.value;
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          placeholder: "Задание"
        },
          [
            { eventName: "change", callback: this.onAddInputChange }
          ]
        ),
        createElement("button", { id: "add-btn" }, "+"),
      ]),
      createElement("ul", { id: "todos" }, this.state.tasks.map(
        v => createElement("li", {}, [
          createElement("input", { type: "checkbox" }),
          createElement("label", {}, v.title),
          createElement("button", {}, "🗑️", [
            { eventName: "click", callback: this.onAddTask }
          ])
        ])) 
      ),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
