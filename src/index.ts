type Listener<T> = (items: T[]) => void;

class ListenerState<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class State extends ListenerState<Project> {
  private projects: Project[] = [];
  private static instance: State;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new State();
    return this.instance;
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

    this.renderElem = document.getElementById(renderElemId) as T;

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

class Input extends Component<HTMLDivElement, HTMLFormElement> {
  titleElem: HTMLInputElement;
  descElem: HTMLInputElement;
  peopleElem: HTMLInputElement;

  constructor() {
    super('project', 'app', true, 'user-input');
    this.titleElem = <HTMLInputElement>(
      this.element.querySelector('#title')
    );
    this.descElem = <HTMLInputElement>(
      this.element.querySelector('#description')
    );
    this.peopleElem = <HTMLInputElement>(
      this.element.querySelector('#people')
    );
    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', (e) => {
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

  contentRender(): void {}
}

type ActiveOrFinished = 'active' | 'finished';

class List extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];
  private type: ActiveOrFinished;

  constructor(type: ActiveOrFinished) {
    super('list', 'app', false, `${type}-projects`);
    this.type = type;
    this.assignedProjects = [];
    this.configure();
    this.contentRender();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) =>
        this.type === 'active'
          ? project.status === ProjectStatus.Active
          : project.status === ProjectStatus.Finished
      );
      this.assignedProjects = relevantProjects;
      this.projectsRender();
    });
  }

  projectsRender() {
    const listEl = <HTMLUListElement>(
      document.getElementById(`${this.type}-projects-list`)
    );
    listEl.textContent = '';
    for (const project of this.assignedProjects) {
      // const listItem = document.createElement('li');
      // listItem.textContent = project.title;
      // listEl.appendChild(listItem);
      new Item(this.element.querySelector('ul')!.id, project);
    }
  }

  contentRender() {
    const listId = `${this.type}-projects-list`;
    const ul = <HTMLUListElement>this.element.querySelector('ul');
    ul.id = listId;
    const h2 = <HTMLHeadingElement>this.element.querySelector('h2');
    h2.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

class Item extends Component<HTMLDivElement, HTMLLIElement> {
  private project: Project;

  constructor(hostId: string, project: Project) {
    super('single', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.contentRender();
  }

  get persons() {
    return this.project.people === 1
      ? '1 person'
      : `${this.project.people} persons`;
  }

  contentRender(): void {
    this.element.querySelector('h2')!.textContent =
      this.project.title;
    this.element.querySelector('h3')!.textContent =
      this.persons + ' assigned';
    this.element.querySelector('p')!.textContent =
      this.project.description;
  }
  configure() {}
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
