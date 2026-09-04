export class AnimalCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }
    static get observedAttributes() {
        return ['name', 'species', 'health', 'availability'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        const availability = this.getAttribute('availability') || 'closed';
        const name = this.getAttribute('name') || '';
        const species = this.getAttribute('species') || '';
        const health = this.getAttribute('health') || '';

        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                border: 1px solid #ccc;
                padding: 12px;
                margin: 8px 0;
                border-radius: 6px;
            }
            :host([availability="open"]) { border-color: #2E7D32; }
            :host([availability="closed"]) { border-color: #d32f2f; }
            .actions { margin-top: 10px; display: flex; gap: 8px; }
        `;
        const card = document.createElement('div');
        card.className = `animal-card ${availability}`;
        const title = document.createElement('h3');
        title.textContent = name;

        const speciesPara = document.createElement('p');
        const speciesLabel = document.createElement('strong');
        speciesLabel.textContent = "Species: ";
        speciesPara.append(speciesLabel, species);

        const healthPara = document.createElement('p');
        const healthLabel = document.createElement('strong');
        healthLabel.textContent = "Health: ";
        healthPara.append(healthLabel, health);
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Toggle Status';
        toggleBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('toggle-status', { bubbles: true, composed: true }));
        });

        const healthBtn = document.createElement('button');
        healthBtn.textContent = 'Update Health';
        healthBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('update-health', { bubbles: true, composed: true }));
        });

        actionsDiv.append(toggleBtn, healthBtn);
        card.append(title, speciesPara, healthPara, actionsDiv);

        this.shadowRoot.append(style, card);
    }
}

customElements.define('animal-card', AnimalCard);