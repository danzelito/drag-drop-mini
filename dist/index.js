"use strict";
class State {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    static getInstance() {
        if (this.instance)
            return this.instance;
        this.instance = new State();
        return this.instance;
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
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
class Input {
    constructor() {
        this.templateElem = (document.querySelector('#project'));
        this.renderElem = document.querySelector('#app');
        const imported = document.importNode(this.templateElem.content, true);
        this.formElem = imported.firstElementChild;
        this.formElem.id = 'user-input';
        this.titleElem = (this.formElem.querySelector('#title'));
        this.descElem = (this.formElem.querySelector('#description'));
        this.peopleElem = (this.formElem.querySelector('#people'));
        this.attach();
        this.config();
    }
    attach() {
        this.renderElem.insertAdjacentElement('afterbegin', this.formElem);
    }
    config() {
        this.formElem.addEventListener('submit', (e) => {
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
}
class List {
    constructor(type) {
        this.type = type;
        this.assignedProjects = [];
        this.templateElem = (document.querySelector('#list'));
        this.renderElem = document.querySelector('#app');
        const imported = document.importNode(this.templateElem.content, true);
        this.sectionElem = imported.firstElementChild;
        this.sectionElem.id = `${this.type}-projects`;
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((project) => this.type === 'active'
                ? project.status === ProjectStatus.Active
                : project.status === ProjectStatus.Finished);
            this.assignedProjects = relevantProjects;
            this.projectsRender();
        });
        this.attach();
        this.contentRender();
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
    attach() {
        this.renderElem.insertAdjacentElement('beforeend', this.sectionElem);
    }
    contentRender() {
        const listId = `${this.type}-projects-list`;
        const ul = this.sectionElem.querySelector('ul');
        ul.id = listId;
        const h2 = (this.sectionElem.querySelector('h2'));
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
