type Listener = (items: Project[]) => void;

class State {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: State;

  private constructor() {}

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new State();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = State.getInstance();

abstract class Component<
  T extends HTMLElement,
  U extends HTMLElement
> {
  templateElem: HTMLTemplateElement;
  renderElem: T;
  element: U;

  constructor(
    templateId: string,
    renderElemId: string,
    insertAtStart: boolean,
    newElemId?: string
  ) {
    this.templateElem = document.getElementById(
      templateId
    ) as HTMLTemplateElement;

    this.renderElem = document.getElementById(renderElemId)! as T;

    const importedNode = document.importNode(
      this.templateElem.content,
      true
    );

    this.element = importedNode.firstElementChild as U;
    if (newElemId) this.element.id = newElemId;
    this.attach(insertAtStart);
  }

  private attach(insert: boolean) {
    this.renderElem.insertAdjacentElement(
      insert ? 'afterbegin' : 'beforeend',
      this.element
    );
  }
  abstract configure(): void;
  abstract contentRender(): void;
}

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
  assignedProjects: Project[];
  private type: ActiveOrFinished;

  constructor(type: ActiveOrFinished) {
    this.type = type;
    this.assignedProjects = [];
    this.templateElem = document.querySelector(
      '#list'
    ) as HTMLTemplateElement;
    this.renderElem = document.querySelector(
      '#app'
    ) as HTMLDivElement;

    const imported = document.importNode(
      this.templateElem.content,
      true
    );
    this.sectionElem = imported.firstElementChild as HTMLElement;
    this.sectionElem.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) =>
        this.type === 'active'
          ? project.status === ProjectStatus.Active
          : project.status === ProjectStatus.Finished
      );
      this.assignedProjects = relevantProjects;
      this.projectsRender();
    });
    this.attach();
    this.contentRender();
  }

  private projectsRender() {
    const listEl = <HTMLUListElement>(
      document.getElementById(`${this.type}-projects-list`)
    );
    listEl.textContent = '';
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

  contentRender() {
    const listId = `${this.type}-projects-list`;
    const ul = <HTMLUListElement>this.sectionElem.querySelector('ul');
    ul.id = listId;
    const h2 = <HTMLHeadingElement>(
      this.sectionElem.querySelector('h2')
    );
    h2.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  id: string;
  title: string;
  description: string;
  people: number;
  status: ProjectStatus;
  constructor(
    id: string,
    title: string,
    description: string,
    people: number,
    status: ProjectStatus
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.people = people;
    this.status = status;
  }
}

const project = new Input();
const activeList = new List('active');
const finishedList = new List('finished');
console.group(projectState);
