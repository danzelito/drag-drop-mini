"use strict";
class Project {
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
            this.titleElem.value = '';
            this.descElem.value = '';
            this.peopleElem.value = '';
        });
    }
}
class List {
    constructor(type) {
        this.type = type;
        this.templateElem = (document.querySelector('#list'));
        this.renderElem = document.querySelector('#app');
        const imported = document.importNode(this.templateElem.content, true);
        this.sectionElem = imported.firstElementChild;
        this.sectionElem.id = `${this.type}-projects`;
        this.attach();
        this.renderContext();
    }
    attach() {
        this.renderElem.insertAdjacentElement('beforeend', this.sectionElem);
    }
    renderContext() {
        const listId = `${this.type}-projects-list`;
        const ul = this.sectionElem.querySelector('ul');
        ul.id = listId;
        const h2 = (this.sectionElem.querySelector('h2'));
        h2.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
}
const project = new Project();
const activeList = new List('active');
const finishedList = new List('finished');
