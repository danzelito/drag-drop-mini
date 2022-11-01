class State {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: State;

  private constructor() {}

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new State();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, people: number) {
    const newProject = {
      id: Math.random().toString(),
      title,
      description,
      people,
    };

    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = State.getInstance();

class Input {
  templateElem: HTMLTemplateElement;
  renderElem: HTMLDivElement;
  formElem: HTMLFormElement;
  titleElem: HTMLInputElement;
  descElem: HTMLInputElement;
  peopleElem: HTMLInputElement;

  constructor() {
    this.templateElem = <HTMLTemplateElement>(
      document.querySelector('#project')
    );
    this.renderElem = <HTMLDivElement>document.querySelector('#app');

    const imported = document.importNode(
      this.templateElem.content,
      true
    );
    this.formElem = <HTMLFormElement>imported.firstElementChild;
    this.formElem.id = 'user-input';
    this.titleElem = <HTMLInputElement>(
      this.formElem.querySelector('#title')
    );
    this.descElem = <HTMLInputElement>(
      this.formElem.querySelector('#description')
    );
    this.peopleElem = <HTMLInputElement>(
      this.formElem.querySelector('#people')
    );
    this.attach();
    this.config();
  }

  private attach() {
    this.renderElem.insertAdjacentElement(
      'afterbegin',
      this.formElem
    );
  }
  private config() {
    this.formElem.addEventListener('submit', (e) => {
      e.preventDefault();
      let userInput: [string, string, number] = [
        this.titleElem.value,
        this.descElem.value,
        +this.peopleElem.value,
      ];
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
      this.titleElem.value = '';
      this.descElem.value = '';
      this.peopleElem.value = '';
    });
  }
}

type ActiveOrFinished = 'active' | 'finished';

class List {
  templateElem: HTMLTemplateElement;
  renderElem: HTMLDivElement;
  sectionElem: HTMLElement;
  assignedProjects: any[];
  private type: ActiveOrFinished;

  constructor(type: ActiveOrFinished) {
    this.type = type;
    this.assignedProjects = [];

    this.templateElem = <HTMLTemplateElement>(
      document.querySelector('#list')
    );

    this.renderElem = <HTMLDivElement>document.querySelector('#app');
    const imported = document.importNode(
      this.templateElem.content,
      true
    );
    this.sectionElem = <HTMLElement>imported.firstElementChild;
    this.sectionElem.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.projectsRender();
    });

    this.attach();
    this.contentRender();
  }

  private projectsRender() {
    const listEl = <HTMLUListElement>(
      document.getElementById(`${this.type}-projects-list`)
    );
    for (const project of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = project.title;
      listEl.appendChild(listItem);
    }
  }

  private attach() {
    this.renderElem.insertAdjacentElement(
      'beforeend',
      this.sectionElem
    );
  }

  private contentRender() {
    const listId = `${this.type}-projects-list`;
    const ul = <HTMLUListElement>this.sectionElem.querySelector('ul');
    ul.id = listId;
    const h2 = <HTMLHeadingElement>(
      this.sectionElem.querySelector('h2')
    );
    h2.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

const project = new Input();
const activeList = new List('active');
const finishedList = new List('finished');
console.group(projectState);
