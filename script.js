document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  /* Navegação móvel */
  const menuButton = $('.menu-button');
  const nav = $('.nav');

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  $$('.nav a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });

  /* Acessibilidade: tamanho de fonte e contraste persistentes */
  let fontScale = Number(localStorage.getItem('miopia-font-scale')) || 1;

  const applyFontScale = () => {
    document.documentElement.style.setProperty('--scale', fontScale);
    localStorage.setItem('miopia-font-scale', String(fontScale));
  };

  applyFontScale();
  $('#fontUp').addEventListener('click', () => {
    fontScale = Math.min(1.2, fontScale + 0.1);
    applyFontScale();
  });
  $('#fontDown').addEventListener('click', () => {
    fontScale = Math.max(0.9, fontScale - 0.1);
    applyFontScale();
  });

  const savedContrast = localStorage.getItem('miopia-high-contrast') === 'true';
  document.body.classList.toggle('high-contrast', savedContrast);

  $('#contrast').addEventListener('click', () => {
    const enabled = document.body.classList.toggle('high-contrast');
    localStorage.setItem('miopia-high-contrast', String(enabled));
  });

  /* Animações de entrada ao rolar */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = $$('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* Link ativo no menu conforme a seção visível */
  const navTargets = $$('.nav a')
    .map((link) => $(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          $$('.nav a').forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );

    navTargets.forEach((section) => sectionObserver.observe(section));
  }

  /* Uma câmera biológica */
  const eyeParts = {
    cornea: {
      number: '01',
      text: 'Primeira superfície que desvia a luz ao entrar no olho.'
    },
    cristalino: {
      number: '02',
      text: 'Lente natural que ajusta o foco para diferentes distâncias.'
    },
    retina: {
      number: '03',
      text: 'Camada sensível à luz onde a imagem deve chegar focalizada.'
    },
    cerebro: {
      number: '04',
      text: 'Interpreta os sinais enviados pelo olho e constrói a percepção visual.'
    }
  };

  const partDisplay = $('.part-display');
  $$('.part-buttons button').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = eyeParts[button.dataset.part];
      $$('.part-buttons button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      partDisplay.classList.add('changing');

      window.setTimeout(() => {
        $('#partNumber').textContent = selected.number;
        $('#partText').textContent = selected.text;
        partDisplay.classList.remove('changing');
      }, 180);
    });
  });

  /* Flashcards: conteúdo curto, virada, progresso e movimento 3D */
  const flashcards = [
    {
      category: 'MITO OU VERDADE',
      title: 'Miopia deixa tudo borrado?',
      answer: 'Mito. Ela afeta principalmente a visão de objetos distantes.',
      visual: 'visual-eye',
      extra: ''
    },
    {
      category: 'FOCO DA LUZ',
      title: 'Onde a imagem se forma?',
      answer: 'Na miopia, a luz converge antes de alcançar a retina.',
      visual: 'visual-focus',
      extra: '<span></span>'
    },
    {
      category: 'CORREÇÃO',
      title: 'Como a lente ajuda?',
      answer: 'Ela altera o caminho da luz para reposicionar o foco na retina.',
      visual: 'visual-glasses',
      extra: '<span></span>'
    },
    {
      category: 'TECNOLOGIA',
      title: 'O que os sensores medem?',
      answer: 'Equipamentos digitais medem estruturas do olho e apoiam exames mais precisos.',
      visual: 'visual-sensor',
      extra: ''
    },
    {
      category: 'ROBÓTICA',
      title: 'Como robôs podem ajudar?',
      answer: 'Podem auxiliar movimentos e medições repetíveis em exames, sempre com supervisão.',
      visual: 'visual-robot',
      extra: ''
    },
    {
      category: 'FUTURO DA VISÃO',
      title: 'O que uma lente adaptativa faria?',
      answer: 'Há potencial para ajustar a potência óptica conforme a necessidade de foco.',
      visual: 'visual-future',
      extra: ''
    }
  ];

  const flashcardGrid = $('#flashcardGrid');
  const exploredCards = new Set();
  const cardElements = [];

  const updateCardProgress = () => {
    const amount = exploredCards.size;
    $('#flashCount').textContent = `${amount} de ${flashcards.length} vistos`;
    $('#flashProgress').style.width = `${(amount / flashcards.length) * 100}%`;
  };

  flashcards.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'flashcard';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Virar card ${index + 1}: ${item.title}`);
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">
          <div class="card-visual ${item.visual}">${item.extra}</div>
          <h3>${item.title}</h3>
          <div class="card-meta"><span>${item.category}</span><b aria-hidden="true">↻</b></div>
        </div>
        <div class="card-face card-back">
          <span>${String(index + 1).padStart(2, '0')} · ${item.category}</span>
          <p>${item.answer}</p>
          <i aria-hidden="true"></i>
        </div>
      </div>
    `;

    const flipCard = () => {
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(flipped));

      if (flipped) {
        exploredCards.add(index);
        updateCardProgress();
      }
    };

    card.addEventListener('click', flipCard);
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      flipCard();
    });

    if (!prefersReducedMotion) {
      card.addEventListener('pointermove', (event) => {
        if (card.classList.contains('flipped')) return;
        const bounds = card.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty('--tilt-y', `${horizontal * 7}deg`);
        card.style.setProperty('--tilt-x', `${vertical * -7}deg`);
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--tilt-x', '0deg');
      });
    }

    cardElements.push(card);
    flashcardGrid.appendChild(card);
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    cardElements.forEach((card) => card.classList.add('visible'));
  } else {
    const cardObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = cardElements.indexOf(entry.target);
          window.setTimeout(() => entry.target.classList.add('visible'), index * 90);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );
    cardElements.forEach((card) => cardObserver.observe(card));
  }

  $('#resetCards').addEventListener('click', () => {
    cardElements.forEach((card) => {
      card.classList.remove('flipped');
      card.setAttribute('aria-pressed', 'false');
    });
  });

  /* Simulador de foco */
  let visionMode = 'normal';
  const distance = $('#distance');

  const updateSimulator = () => {
    const meters = Number(distance.value);
    const isMyopia = visionMode === 'myopia';
    const blur = isMyopia ? Math.max(0.25, (meters - 2) * 0.17) : 0;
    const clarity = isMyopia ? Math.max(22, Math.round(100 - blur * 16)) : 100;

    $('#distanceValue').textContent = `${meters} m`;
    $('#scene').style.filter = `blur(${blur.toFixed(1)}px)`;
    $('#sceneSign').style.transform = `scale(${Math.max(0.72, 1.12 - meters * 0.013)})`;
    $('#clarityValue').textContent = `${clarity}%`;
    $('#focusMeter').classList.toggle('myopia', isMyopia);
    $('#simulatorText').textContent = isMyopia
      ? 'A luz converge antes de alcançar a retina.'
      : 'A luz chega focalizada à retina.';
  };

  distance.addEventListener('input', updateSimulator);
  $$('.mode-switch button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.mode-switch button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      visionMode = button.dataset.mode;
      updateSimulator();
    });
  });
  updateSimulator();

  /* Desafio de identificação: mede o tempo até o clique no objeto */
  const challengeObject = $('#challengeObject');
  const challengeTime = $('#challengeTime');
  const challengeResult = $('#challengeResult');
  const challengeSymbols = ['⌂', '★', '✈', '◆'];
  let challengeTimer = null;
  let challengeStartedAt = 0;

  const finishChallenge = (found) => {
    if (!challengeTimer) return;
    window.clearInterval(challengeTimer);
    challengeTimer = null;
    challengeObject.classList.remove('running');
    const elapsed = Math.min(5, (performance.now() - challengeStartedAt) / 1000);
    challengeResult.textContent = found
      ? `Identificado em ${elapsed.toFixed(1).replace('.', ',')} s. O desfoque pode aumentar o esforço para reconhecer algo distante.`
      : 'Tempo encerrado. Na simulação de miopia, detalhes distantes podem ficar mais difíceis de reconhecer.';
    $('#startChallenge').textContent = 'Tentar de novo';
  };

  $('#startChallenge').addEventListener('click', () => {
    if (challengeTimer) window.clearInterval(challengeTimer);
    const symbol = challengeSymbols[Math.floor(Math.random() * challengeSymbols.length)];
    challengeObject.textContent = symbol;
    challengeObject.style.filter = visionMode === 'myopia' ? 'blur(3px)' : 'blur(0)';
    challengeObject.classList.add('running');
    challengeResult.textContent = 'Clique no símbolo assim que conseguir identificá-lo.';
    challengeStartedAt = performance.now();
    $('#startChallenge').textContent = 'Reiniciar';

    challengeTimer = window.setInterval(() => {
      const elapsed = (performance.now() - challengeStartedAt) / 1000;
      const remaining = Math.max(0, 5 - elapsed);
      challengeTime.textContent = `${remaining.toFixed(1).replace('.', ',')} s`;
      if (remaining <= 0) finishChallenge(false);
    }, 100);
  });

  challengeObject.addEventListener('click', () => finishChallenge(true));
  challengeObject.tabIndex = 0;
  challengeObject.setAttribute('role', 'button');
  challengeObject.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    finishChallenge(true);
  });

  /* Demonstração da lente regulável */
  const lensPower = $('#lensPower');

  const updateLens = () => {
    const power = Number(lensPower.value);
    const normalizedPower = power / 4;

    $('#lensPowerValue').textContent = power === 0
      ? '0,0 D'
      : `−${power.toFixed(1).replace('.', ',')} D`;
    $('#variableLens').style.width = `${8 + normalizedPower * 7}%`;
    $('#variableLens').style.left = `${27 - normalizedPower * 2}%`;
    $('#demoFocus').style.right = `${34 - power * 6.5}%`;

    if (power < 1.5) {
      $('#lensMessage').textContent = 'O ajuste ainda é insuficiente nesta demonstração.';
    } else if (power <= 2.5) {
      $('#lensMessage').textContent = 'O foco se aproxima do plano da retina.';
    } else {
      $('#lensMessage').textContent = 'Ajuste excessivo também pode produzir desfoque.';
    }
  };

  lensPower.addEventListener('input', updateLens);
  updateLens();

  /* Quiz final */
  const questions = [
    {
      question: 'Na miopia, onde a luz costuma convergir?',
      options: ['Antes da retina', 'Depois da retina', 'Na pupila', 'Fora do olho'],
      answer: 0,
      explanation: 'O foco se forma antes da retina, reduzindo a nitidez de longe.'
    },
    {
      question: 'Qual visão é geralmente mais afetada?',
      options: ['De longe', 'De perto', 'De cores', 'Somente a noturna'],
      answer: 0,
      explanation: 'A dificuldade típica da miopia aparece ao observar objetos distantes.'
    },
    {
      question: 'O que uma lente corretiva modifica?',
      options: ['A cor do olho', 'O caminho da luz', 'O tamanho da retina', 'O cérebro'],
      answer: 1,
      explanation: 'A lente refrata a luz para posicionar o foco corretamente.'
    },
    {
      question: 'O protótipo de lente regulável é uma cura?',
      options: ['Sim', 'Não, é um modelo educativo', 'Só para jovens', 'Só para adultos'],
      answer: 1,
      explanation: 'Ele demonstra um princípio de correção óptica; não substitui cuidado médico.'
    },
    {
      question: 'Como a robótica pode contribuir?',
      options: ['Substituindo toda avaliação', 'Apoiando precisão e repetibilidade', 'Eliminando exames', 'Definindo o grau sozinha'],
      answer: 1,
      explanation: 'Sensores e automação podem apoiar exames, sempre com responsabilidade e supervisão.'
    }
  ];

  let questionIndex = 0;
  let score = 0;
  let answered = false;

  const renderQuiz = () => {
    const quizContent = $('#quizContent');

    if (questionIndex >= questions.length) {
      $('#quizCounter').textContent = 'CONCLUÍDO';
      $('#quizBar').style.width = '100%';
      $('#quizScore').textContent = `${score} PONTOS`;
      quizContent.innerHTML = `
        <div class="quiz-finish">
          <span>RESULTADO</span>
          <strong>${score}/5</strong>
          <p>${score >= 3 ? 'Boa — o conteúdo ficou em foco.' : 'Vire os flashcards e tente outra vez.'}</p>
          <button class="quiz-button" id="restartQuiz" type="button">Refazer quiz</button>
        </div>
      `;
      $('#restartQuiz').addEventListener('click', () => {
        questionIndex = 0;
        score = 0;
        renderQuiz();
      });
      return;
    }

    answered = false;
    const current = questions[questionIndex];
    $('#quizCounter').textContent = `${questionIndex + 1} / ${questions.length}`;
    $('#quizScore').textContent = `${score} PONTOS`;
    $('#quizBar').style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
    quizContent.innerHTML = `
      <h3 class="quiz-question">${current.question}</h3>
      <div class="quiz-options">
        ${current.options
          .map((option, index) => `<button type="button" data-index="${index}">${String.fromCharCode(65 + index)} — ${option}</button>`)
          .join('')}
      </div>
      <div id="quizFeedback" aria-live="polite"></div>
    `;

    $$('.quiz-options button').forEach((button) => {
      button.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const selectedIndex = Number(button.dataset.index);
        const isCorrect = selectedIndex === current.answer;

        if (isCorrect) score += 1;

        $$('.quiz-options button').forEach((option, optionIndex) => {
          option.disabled = true;
          if (optionIndex === current.answer) option.classList.add('correct');
          if (optionIndex === selectedIndex && !isCorrect) option.classList.add('wrong');
        });

        $('#quizScore').textContent = `${score} PONTOS`;
        $('#quizFeedback').innerHTML = `
          <div class="quiz-feedback">
            <strong>${isCorrect ? 'Correto.' : 'Quase.'}</strong> ${current.explanation}<br />
            <button class="quiz-button" id="nextQuestion" type="button">
              ${questionIndex === questions.length - 1 ? 'Ver resultado' : 'Próxima'}
            </button>
          </div>
        `;

        $('#nextQuestion').addEventListener('click', () => {
          questionIndex += 1;
          renderQuiz();
        });
      });
    });
  };

  renderQuiz();
});
