'use strict';

// Shared labels for interactions on the portfolio and blog.
const labels = {
  "openMenu": "Open menu",
  "closeMenu": "Close menu",
  "projectsCount": "PROJECTS",
  "projectsSingular": "PROJECT",
  "emailCopied": "Address copied. Talk soon!",
  "emailFallback": "Select and copy the address above, or click it to write to me.",
  "restaurantType": "WEB DEVELOPMENT · UNIVERSITY PROJECT",
  "restaurantDescription": "Building a restaurant application to explore how interfaces, APIs and databases work together.",
  "lendingType": "BLOCKCHAIN · UNIVERSITY PROJECT",
  "lendingDescription": "Exploring smart contracts, voting and upgradeability through an ETH lending system with a Python oracle.",
  "gameType": "DISTRIBUTED SYSTEMS · TEAM PROJECT",
  "gameDescription": "Learning how services work together through a team-built card game. My focus: game engine, integration support, tests and CI.",
  "musicType": "DATA MINING · TEAM PROJECT",
  "musicDescription": "Exploring the patterns in music data, from preprocessing to classification and model interpretation."
};
const projects = {
  restaurant: {
    title: 'Hildesheimer Geschmack', categoryKey: 'restaurantType', summaryKey: 'restaurantDescription',
    url: 'https://github.com/Marcop-00/Hildesheimer-Geschmack',
    tags: ['Angular', 'TypeScript', 'Node.js', 'Express', 'Prisma', 'MySQL', 'Jasmine / Karma', 'Cypress'],
    en: {
      context: 'A full-stack restaurant management application developed during my Erasmus in Hildesheim. It connects an Angular interface to a Node.js backend and a relational database, with authentication, roles and data visualisation.',
      contribution: 'Full-stack application development, authentication and role-based access control. Implementation of unit tests with Jasmine/Karma and end-to-end tests with Cypress.'
    }
  },
  lending: {
    title: 'Decentralised Lending Service', categoryKey: 'lendingType', summaryKey: 'lendingDescription',
    url: 'https://github.com/Marcop-00/Decentralised-Lending-Service',
    tags: ['Solidity', 'Python', 'Ethereum', 'UUPS', 'Hardhat', 'TypeScript', 'SQLite'],
    en: {
      context: 'An educational project where contributors deposit ETH and vote on loan proposals. A trusted oracle reads balances from historical Bitcoin blocks. BTC are not locked: this is a simplification of the course model, rather than a production lending protocol.',
      contribution: 'Implementation of smart contracts and the upgradeable UUPS proxy, Python oracle and voting services, and a demo on a private Ethereum network. Integration tests, reentrancy and upgrade scenarios, and gas consumption analysis.'
    }
  },
  game: {
    title: 'Microservices Card Game', categoryKey: 'gameType', summaryKey: 'gameDescription',
    url: 'https://github.com/ashleyspagnoli/ASE_project',
    tags: ['Python', 'Flask', 'FastAPI', 'Docker', 'RabbitMQ', 'MongoDB', 'GitHub Actions', 'Locust'],
    en: {
      context: 'A team-built card game with a microservices architecture. Separate services handle different responsibilities and communicate through APIs and messaging. The project includes tests and continuous integration workflows.',
      contribution: 'My main contribution was the game engine, alongside helping teammates integrate the architecture. I created the GitHub Actions workflows and the unit, functional and integration tests.'
    }
  },
  music: {
    title: 'Music Data Analysis', categoryKey: 'musicType', summaryKey: 'musicDescription',
    url: 'https://github.com/DGabri/data_mining_unipi',
    tags: ['Python', 'Pandas', 'NumPy', 'scikit-learn', 'Matplotlib', 'SHAP', 'LIME'],
    en: {
      context: 'A data mining project completed in a team of three. The workflow includes music data cleaning, exploratory analysis, feature engineering, clustering and classification, comparing models through F1 scores and confusion matrices.',
      contribution: 'Collaboration on the team’s analysis and modelling workflow. The project explores overfitting and prediction interpretation with SHAP and LIME, using metrics alongside a closer understanding of model behaviour.'
    }
  }
};

let activeProject = null;
let activeFilter = 'all';
let dialogTrigger = null;
const dialog = document.querySelector('.project-dialog');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const t = key => labels[key] ?? key;

function updateCount() {
  const count = [...document.querySelectorAll('.project-card')].filter(card => !card.hidden).length;
  document.querySelector('.project-count').textContent = `${String(count).padStart(2, '0')} ${t(count === 1 ? 'projectsSingular' : 'projectsCount')}`;
}
function renderProject(key) {
  const project = projects[key];
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-category').textContent = t(project.categoryKey);
  document.querySelector('#dialog-summary').textContent = t(project.summaryKey);
  document.querySelector('#dialog-context').textContent = project.en.context;
  document.querySelector('#dialog-contribution').textContent = project.en.contribution;
  document.querySelector('#dialog-source').href = project.url;
  document.querySelector('#dialog-tags').replaceChildren(...project.tags.map(tag => {
    const span = document.createElement('span');
    span.textContent = tag;
    return span;
  }));
}
function setMenu(open, restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', t(open ? 'closeMenu' : 'openMenu'));
  mobileNav.hidden = !open;
  if (restoreFocus) menuButton.focus();
}

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(filter => {
    const selected = filter.dataset.filter === activeFilter;
    filter.classList.toggle('is-active', selected);
    filter.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('.project-card').forEach(card => { card.hidden = activeFilter !== 'all' && card.dataset.category !== activeFilter; });
  updateCount();
}));
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  dialogTrigger = button;
  activeProject = button.dataset.project;
  renderProject(activeProject);
  dialog.showModal();
  document.body.classList.add('dialog-open');
}));
document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  activeProject = null;
  dialogTrigger?.focus({ preventScroll: true });
});
menuButton.addEventListener('click', () => setMenu(mobileNav.hidden));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) setMenu(false, true);
});
const desktopQuery = matchMedia('(min-width: 701px)');
desktopQuery.addEventListener('change', event => { if (event.matches) setMenu(false); });
document.addEventListener('click', event => {
  if (!mobileNav.hidden && !event.target.closest('.site-header')) setMenu(false);
});
document.querySelector('.copy-email')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('marcopernisco.work@gmail.com');
    document.querySelector('.copy-status').textContent = t('emailCopied');
  } catch {
    document.querySelector('.copy-status').textContent = t('emailFallback');
  }
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.desktop-nav a').forEach(link => {
        const active = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('#home, #projects, #about, #contact').forEach(section => observer.observe(section));
}
const year = document.querySelector('#current-year');
if (year) year.textContent = String(new Date().getFullYear());
