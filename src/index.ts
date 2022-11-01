class Project {
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
  private type: ActiveOrFinished;

  constructor(type: ActiveOrFinished) {
    this.type = type;
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
    this.attach();
    this.renderContext();
  }

  private attach() {
    this.renderElem.insertAdjacentElement(
      'beforeend',
      this.sectionElem
    );
  }

  private renderContext() {
    const listId = `${this.type}-projects-list`;
    const ul = <HTMLUListElement>this.sectionElem.querySelector('ul');
    ul.id = listId;
    const h2 = <HTMLHeadingElement>(
      this.sectionElem.querySelector('h2')
    );
    h2.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

const project = new Project();
const activeList = new List('active');
const finishedList = new List('finished');
