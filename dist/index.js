"use strict";
class ListenerState {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class State extends ListenerState {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance)
            return this.instance;
        this.instance = new State();
        return this.instance;
    }
    addProject(title, description, people) {
        const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = State.getInstance();
class Component {
    constructor(templateId, renderElemId, insertAtStart, newElemId) {
        this.templateElem = document.getElementById(templateId);
        this.renderElem = document.getElementById(renderElemId);
        const importedNode = document.importNode(this.templateElem.content, true);
        this.element = importedNode.firstElementChild;
        if (newElemId)
            this.element.id = newElemId;
        this.attach(insertAtStart);
    }
    attach(insert) {
        this.renderElem.insertAdjacentElement(insert ? 'afterbegin' : 'beforeend', this.element);
    }
}
class Input extends Component {
    constructor() {
        super('project', 'app', true, 'user-input');
        this.titleElem = (this.element.querySelector('#title'));
        this.descElem = (this.element.querySelector('#description'));
        this.peopleElem = (this.element.querySelector('#people'));
        this.configure();
    }
    configure() {
        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            let userInput = [
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
    contentRender() { }
}
class List extends Component {
    constructor(type) {
        super('list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.contentRender();
    }
    configure() {
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((project) => this.type === 'active'
                ? project.status === ProjectStatus.Active
                : project.status === ProjectStatus.Finished);
            this.assignedProjects = relevantProjects;
            this.projectsRender();
        });
    }
    projectsRender() {
        const listEl = (document.getElementById(`${this.type}-projects-list`));
        listEl.textContent = '';
        for (const project of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = project.title;
            listEl.appendChild(listItem);
        }
    }
    contentRender() {
        const listId = `${this.type}-projects-list`;
        const ul = this.element.querySelector('ul');
        ul.id = listId;
        const h2 = this.element.querySelector('h2');
        h2.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
}
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
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
