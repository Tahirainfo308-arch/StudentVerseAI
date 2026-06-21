(function() {

  /* ===== COURSE DATA ===== */
  var regCourses = [
    {courseId:"CS-101",name:"Data Structures & Algorithms",category:"Software Engineering"},
    {courseId:"CS-102",name:"Software Engineering",category:"Software Engineering"},
    {courseId:"CS-201",name:"Database Systems",category:"Databases"},
    {courseId:"CS-202",name:"Computer Networks",category:"Systems & Networking"},
    {courseId:"CS-301",name:"Artificial Intelligence",category:"Data Science & AI"},
    {courseId:"CS-302",name:"Machine Learning Fundamentals",category:"Data Science & AI"},
    {courseId:"WEB-101",name:"HTML & CSS Foundations",category:"Development (Frontend)"},
    {courseId:"WEB-201",name:"JavaScript & DOM Manipulation",category:"Development (Frontend)"},
    {courseId:"WEB-301",name:"React.js Development",category:"Development (Frontend)"},
    {courseId:"WEB-302",name:"TypeScript & Modern Frontend",category:"Development (Frontend)"},
    {courseId:"WEB-401",name:"Node.js & Express Backend",category:"Development (Backend)"},
    {courseId:"WEB-402",name:"Python & Django Backend",category:"Development (Backend)"},
    {courseId:"WEB-403",name:"API Design & GraphQL",category:"Development (Backend)"},
    {courseId:"CLD-201",name:"AWS Cloud Practitioner",category:"Cloud & DevOps"},
    {courseId:"CLD-301",name:"Docker & Containerization",category:"Cloud & DevOps"},
    {courseId:"CLD-302",name:"Kubernetes Orchestration",category:"Cloud & DevOps"},
    {courseId:"CLD-303",name:"CI/CD & DevOps Pipelines",category:"Cloud & DevOps"},
    {courseId:"SEC-301",name:"Cybersecurity Fundamentals",category:"Cybersecurity"},
    {courseId:"SEC-302",name:"Ethical Hacking & Penetration Testing",category:"Cybersecurity"},
    {courseId:"SEC-303",name:"Blockchain & Web3 Security",category:"Cybersecurity"},
    {courseId:"DS-101",name:"Python for Data Science",category:"Data Science & AI"},
    {courseId:"DS-201",name:"Deep Learning & Neural Networks",category:"Data Science & AI"},
    {courseId:"DS-301",name:"Natural Language Processing",category:"Data Science & AI"},
    {courseId:"MOB-201",name:"React Native Development",category:"Mobile Development"},
    {courseId:"MOB-301",name:"Flutter & Dart Development",category:"Mobile Development"},
    {courseId:"MOB-302",name:"iOS Development with Swift",category:"Mobile Development"},
    {courseId:"DB-301",name:"NoSQL & MongoDB",category:"Databases"},
    {courseId:"DB-302",name:"PostgreSQL & Advanced SQL",category:"Databases"},
    {courseId:"SYS-301",name:"Operating Systems",category:"Systems & Networking"},
    {courseId:"SYS-401",name:"System Design & Architecture",category:"Software Engineering"}
  ];

  /* ===== THEME ===== */
  var savedTheme = localStorage.getItem('sv-theme') || 'light';
  var html = document.documentElement;
  html.setAttribute('data-theme', savedTheme);

  var themeToggle = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');
  if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var cur = html.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('sv-theme', next);
      if (themeIcon) themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }

  /* ===== HELPERS ===== */
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('sv-user') || '{}');
  }

  function getEnrolledIds() {
    var u = getCurrentUser();
    var raw = u.enrolledCourses || [];
    return raw.map(function(x){ return typeof x === 'string' ? x : (x.id || x.courseId); });
  }

  function getEnrolledCourses() {
    var ids = getEnrolledIds();
    return ids.map(function(id){ return regCourses.find(function(c){ return c.courseId === id; }); }).filter(Boolean);
  }

  function getCourseName(courseId) {
    var c = regCourses.find(function(x){ return x.courseId === courseId; });
    return c ? c.name : courseId;
  }

  function getCourseCategory(courseId) {
    var c = regCourses.find(function(x){ return x.courseId === courseId; });
    return c ? c.category : '';
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function uid() {
    return Date.now() + Math.random().toString(36).substr(2,6);
  }

  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function dateTimeToISO(dateStr, timeStr) {
    if (!timeStr) return dateStr + 'T23:59:00';
    return dateStr + 'T' + timeStr + ':00';
  }

  function getTimeRemaining(isoStr) {
    var diff = new Date(isoStr).getTime() - Date.now();
    return Math.max(0, diff);
  }

  function getAllUsers() {
    return JSON.parse(localStorage.getItem('sv-users') || '[]');
  }

  /* ===== DATA ACCESS ===== */
  function getQuizzes() {
    return JSON.parse(localStorage.getItem('sv-quizzes') || '[]');
  }
  function saveQuizzes(arr) {
    localStorage.setItem('sv-quizzes', JSON.stringify(arr));
  }

  function getRequests() {
    return JSON.parse(localStorage.getItem('sv-quiz-requests') || '[]');
  }
  function saveRequests(arr) {
    localStorage.setItem('sv-quiz-requests', JSON.stringify(arr));
  }

  function getAttempts() {
    return JSON.parse(localStorage.getItem('sv-quiz-attempts') || '[]');
  }
  function saveAttempts(arr) {
    localStorage.setItem('sv-quiz-attempts', JSON.stringify(arr));
  }

  function getNotifs() {
    return JSON.parse(localStorage.getItem('sv-notifications') || '[]');
  }
  function saveNotifs(arr) {
    localStorage.setItem('sv-notifications', JSON.stringify(arr));
  }

  function addNotif(title, text, icon) {
    var notifs = getNotifs();
    notifs.unshift({
      id: uid(),
      title: title,
      text: text,
      icon: icon || 'fa-bell',
      page: 'quiz',
      time: nowISO(),
      read: false
    });
    saveNotifs(notifs);
  }

  function isAdmin() {
    return localStorage.getItem('sv-admin-mode') === 'true';
  }

  function toggleAdmin(on) {
    localStorage.setItem('sv-admin-mode', on ? 'true' : 'false');
  }

  /* ===== VIEWS ===== */
  function showView(viewId) {
    ['quizDashboardView','activeQuizView','resultView'].forEach(function(id){
      document.getElementById(id).classList.toggle('hidden', id !== viewId);
    });
  }

  /* ===== UPDATE QUIZ STATUSES ===== */
  function refreshQuizStatuses() {
    var quizzes = getQuizzes();
    var changed = false;
    quizzes.forEach(function(q) {
      if (q.status === 'upcoming' && q.scheduledDate && q.scheduledTime) {
        var start = new Date(dateTimeToISO(q.scheduledDate, q.scheduledTime));
        var end = new Date(start.getTime() + (q.duration || 10) * 60000);
        var now = new Date();
        if (now >= start && now < end) {
          q.status = 'active';
          changed = true;
          addNotif('Quiz Started: ' + q.title, 'Quiz "' + q.title + '" for ' + getCourseName(q.courseId) + ' is now active!', 'fa-play-circle');
        } else if (now >= end) {
          q.status = 'completed';
          changed = true;
          addNotif('Quiz Ended: ' + q.title, 'Quiz "' + q.title + '" for ' + getCourseName(q.courseId) + ' has ended.', 'fa-clock');
        }
      }
    });
    if (changed) saveQuizzes(quizzes);
    return quizzes;
  }

  /* ===== CATEGORY PILLS ===== */
  var currentFilter = 'All';

  function buildCategories() {
    var container = document.getElementById('categoryContainer');
    var courses = getEnrolledCourses();
    container.innerHTML = '';
    var allBtn = document.createElement('button');
    allBtn.className = 'category-btn active'; allBtn.textContent = 'All Quizzes';
    allBtn.addEventListener('click', function(){ setFilter('All'); });
    container.appendChild(allBtn);
    courses.forEach(function(c) {
      var btn = document.createElement('button');
      btn.className = 'category-btn'; btn.textContent = c.name;
      btn.addEventListener('click', function(){ setFilter(c.courseId); });
      container.appendChild(btn);
    });
  }

  function setFilter(val) {
    currentFilter = val;
    var btns = document.querySelectorAll('.category-btn');
    btns.forEach(function(b){ b.classList.remove('active'); });
    btns.forEach(function(b){
      if ((val === 'All' && b.textContent.trim() === 'All Quizzes') || b.textContent === getCourseName(val)) {
        b.classList.add('active');
      }
    });
    renderQuizzes();
  }

  function renderStatusBadge(status) {
    var labels = { upcoming:'Upcoming', active:'Active', completed:'Completed' };
    return '<span class="quiz-badge ' + status + '">' + (labels[status] || status) + '</span>';
  }

  /* ===== RENDER QUIZZES ===== */
  function renderQuizzes() {
    var grid = document.getElementById('quizGrid');
    var data = refreshQuizStatuses();
    var now = new Date();

    /* Check for reminders */
    data.forEach(function(q) {
      if (q.status === 'active' && q.scheduledDate === todayStr() && !q._notifiedToday) {
        addNotif('Quiz Active: ' + q.title, 'Quiz "' + q.title + '" for ' + getCourseName(q.courseId) + ' is now active!', 'fa-file-alt');
        q._notifiedToday = true;
      }
    });
    saveQuizzes(data);

    if (currentFilter !== 'All') {
      data = data.filter(function(q){ return q.courseId === currentFilter; });
    }

    if (data.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-file-alt"></i><p>No quizzes yet. Request a quiz from the admin!</p></div>';
      return;
    }

    grid.innerHTML = data.map(function(q) {
      var qCount = (q.questions || []).length;

      var timeInfo = '';
      if (q.scheduledDate) {
        timeInfo = '<i class="far fa-calendar-alt"></i> ' + q.scheduledDate;
        if (q.scheduledTime) timeInfo += ' ' + q.scheduledTime;
        timeInfo += ' (' + (q.duration || 10) + ' min)';
      }

      var actionBtn = '';
      if (q.status === 'upcoming') {
        var startISO = dateTimeToISO(q.scheduledDate, q.scheduledTime);
        var diff = getTimeRemaining(startISO);
        var mins = Math.ceil(diff / 60000);
        actionBtn = '<button class="btn btn-outline btn-sm" disabled><i class="fas fa-clock"></i> ' + mins + ' min</button>';
      } else if (q.status === 'active') {
        var enrolled = getEnrolledIds();
        if (enrolled.indexOf(q.courseId) > -1) {
          actionBtn = '<button class="btn btn-primary btn-sm take-quiz-btn" data-id="' + q.id + '"><i class="fas fa-play"></i> Take Quiz</button>';
        } else {
          actionBtn = '<button class="btn btn-outline btn-sm" disabled><i class="fas fa-lock"></i> Not Enrolled</button>';
        }
      } else if (q.status === 'completed') {
        actionBtn = '<button class="btn btn-outline btn-sm view-result-btn" data-id="' + q.id + '"><i class="fas fa-chart-bar"></i> Results</button>';
      }

      return '<div class="quiz-card">' +
        '<div class="quiz-card-header">' +
          '<div>' +
            '<h3>' + esc(q.title) + '</h3>' +
            '<div class="quiz-meta"><i class="fas fa-book"></i> ' + esc(getCourseName(q.courseId)) + '</div>' +
          '</div>' +
          renderStatusBadge(q.status) +
        '</div>' +
        '<div class="quiz-meta">' +
          '<div><i class="far fa-question-circle"></i> ' + qCount + ' questions</div>' +
          (timeInfo ? '<div>' + timeInfo + '</div>' : '') +
        '</div>' +
        '<div class="quiz-card-footer">' +
          actionBtn +
          (isAdmin() ? '<button class="btn btn-danger btn-sm delete-quiz-btn" data-id="' + q.id + '"><i class="fas fa-trash"></i></button>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ===== REQUESTS ===== */
  function renderRequests() {
    var list = document.getElementById('requestList');
    var empty = document.getElementById('requestEmpty');
    var requests = getRequests().filter(function(r){ return r.status === 'pending'; });

    if (requests.length === 0) {
      list.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    list.innerHTML = requests.map(function(r) {
      return '<div class="request-item">' +
        '<div class="request-info">' +
          '<strong>' + esc(r.title) + '</strong>' +
          '<div class="request-meta">' +
            '<span><i class="fas fa-book"></i> ' + esc(getCourseName(r.courseId)) + '</span>' +
            '<span><i class="fas fa-user"></i> ' + esc(r.userName) + '</span>' +
            '<span><i class="far fa-calendar"></i> ' + r.preferredDate + ' ' + r.preferredTime + '</span>' +
            '<span><i class="fas fa-tag"></i> ' + (r.type === 'group' ? 'Group' : 'Self') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="request-actions">' +
          '<button class="btn btn-primary btn-sm approve-request-btn" data-id="' + r.id + '"><i class="fas fa-check"></i> Approve</button>' +
          '<button class="btn btn-danger btn-sm reject-request-btn" data-id="' + r.id + '"><i class="fas fa-times"></i> Reject</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ===== RESULTS TABLE ===== */
  function renderCourseResults() {
    var sel = document.getElementById('resultsCourseSelect');
    var tbody = document.getElementById('resultsBody');
    var empty = document.getElementById('resultsEmpty');
    var courseId = sel.value;
    if (!courseId) {
      tbody.innerHTML = '';
      empty.style.display = '';
      return;
    }

    var users = getAllUsers();
    var enrolled = users.filter(function(u){
      return (u.enrolledCourses || []).indexOf(courseId) > -1;
    });

    var quizzes = getQuizzes().filter(function(q){
      return q.courseId === courseId && q.status === 'completed';
    });

    if (enrolled.length === 0 || quizzes.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = '';
      empty.querySelector('p').textContent = enrolled.length === 0
        ? 'No students enrolled in this course.'
        : 'No completed quizzes for this course yet.';
      return;
    }

    empty.style.display = 'none';

    var attempts = getAttempts().filter(function(a){ return a.courseId === courseId; });

    var rows = [];
    enrolled.forEach(function(u) {
      var userAttempts = attempts.filter(function(a){ return a.userId === u.email; });
      var totalScore = 0, totalMax = 0, attemptedQuizIds = [];
      userAttempts.forEach(function(a){
        totalScore += a.score;
        totalMax += a.total;
        attemptedQuizIds.push(a.quizId);
      });

      quizzes.forEach(function(q) {
        if (attemptedQuizIds.indexOf(q.id) === -1) {
          rows.push({
            userName: u.name,
            email: u.email,
            quizTitle: q.title,
            status: 'Missed',
            score: '-',
            pct: '-'
          });
        }
      });

      userAttempts.forEach(function(a) {
        var quiz = quizzes.find(function(q){ return q.id === a.quizId; });
        rows.push({
          userName: u.name,
          email: u.email,
          quizTitle: quiz ? quiz.title : a.quizTitle,
          status: 'Attempted',
          score: a.score + '/' + a.total,
          pct: a.total > 0 ? Math.round((a.score / a.total) * 100) + '%' : '-'
        });
      });
    });

    rows.sort(function(a,b){
      if (a.userName !== b.userName) return a.userName.localeCompare(b.userName);
      return a.quizTitle.localeCompare(b.quizTitle);
    });

    tbody.innerHTML = rows.map(function(r) {
      var cls = r.status === 'Attempted' ? 'status-attempted' : 'status-missed';
      return '<tr class="' + cls + '">' +
        '<td>' + esc(r.userName) + '</td>' +
        '<td>' + esc(r.quizTitle) + '</td>' +
        '<td>' + r.status + '</td>' +
        '<td>' + r.score + '</td>' +
        '<td>' + r.pct + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ===== QUIZ TAKING ===== */
  var activeQuiz = null;
  var currentQIndex = 0;
  var selectedAnswers = {};
  var timerInterval = null;
  var timeRemaining = 0;

  function startQuiz(quizId) {
    var quizzes = refreshQuizStatuses();
    var q = quizzes.find(function(x){ return x.id === quizId; });
    if (!q) { showToast('Quiz not found.', 'error'); return; }
    if (q.status !== 'active') { showToast('This quiz is not active yet.', 'warning'); return; }
    var enrolled = getEnrolledIds();
    if (enrolled.indexOf(q.courseId) === -1) { showToast('You are not enrolled in this course.', 'error'); return; }

    activeQuiz = q;
    currentQIndex = 0;
    selectedAnswers = {};
    showView('activeQuizView');

    document.getElementById('activeQuizSubject').textContent = getCourseName(q.courseId);
    timeRemaining = (q.duration || 10) * 60;
    renderQuestion();
    startTimer();
  }

  function renderQuestion() {
    if (!activeQuiz) return;
    var questions = activeQuiz.questions || [];
    var total = questions.length;
    if (currentQIndex >= total) {
      finishQuiz();
      return;
    }
    var q = questions[currentQIndex];
    document.getElementById('questionCountText').textContent = 'Question ' + (currentQIndex + 1) + ' of ' + total;
    document.getElementById('quizProgressBar').style.width = ((currentQIndex + 1) / total * 100) + '%';
    document.getElementById('questionText').textContent = q.text;

    var grid = document.getElementById('optionsGrid');
    var letters = ['A','B','C','D'];
    var selected = selectedAnswers[currentQIndex];
    grid.innerHTML = (q.options || []).map(function(opt, i) {
      return '<button class="option-btn' + (selected === i ? ' selected' : '') + '" data-index="' + i + '">' +
        '<span class="option-letter">' + letters[i] + '</span>' +
        '<span>' + esc(opt) + '</span>' +
      '</button>';
    }).join('');

    document.getElementById('nextBtn').innerHTML = currentQIndex === total - 1
      ? '<i class="fas fa-check"></i> Submit'
      : 'Next <i class="fas fa-arrow-right"></i>';
  }

  document.getElementById('optionsGrid').addEventListener('click', function(e) {
    var btn = e.target.closest('.option-btn');
    if (!btn) return;
    selectedAnswers[currentQIndex] = parseInt(btn.dataset.index);
    renderQuestion();
  });

  document.getElementById('nextBtn').addEventListener('click', function() {
    if (selectedAnswers[currentQIndex] === undefined) {
      showToast('Please select an answer first.', 'warning');
      return;
    }
    currentQIndex++;
    renderQuestion();
  });

  document.getElementById('quitQuizBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
      stopTimer();
      activeQuiz = null;
      currentQIndex = 0;
      selectedAnswers = {};
      showView('quizDashboardView');
      renderQuizzes();
    }
  });

  function finishQuiz() {
    stopTimer();
    if (!activeQuiz) return;
    var questions = activeQuiz.questions || [];
    var total = questions.length;
    var correct = 0;
    questions.forEach(function(q, i) {
      if (selectedAnswers[i] === q.correctIndex) correct++;
    });
    var wrong = total - correct;
    var pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    /* Save attempt */
    var user = getCurrentUser();
    var attempts = getAttempts();
    var existingAttempt = attempts.find(function(a){ return a.quizId === activeQuiz.id && a.userId === user.email; });
    if (!existingAttempt) {
      attempts.push({
        id: uid(),
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        courseId: activeQuiz.courseId,
        userId: user.email,
        userName: user.name || 'Student',
        score: correct,
        total: total,
        date: nowISO()
      });
      saveAttempts(attempts);
    }

    addNotif('Quiz Completed: ' + activeQuiz.title, 'You scored ' + correct + '/' + total + ' (' + pct + '%)', 'fa-check-circle');

    showView('resultView');
    document.getElementById('resultMsg').textContent = pct >= 70 ? 'Great job! Keep it up!' : pct >= 40 ? 'Good effort! Review the topics and try again.' : 'Keep practicing! Review the material and retake.';
    document.getElementById('scoreCircle').setAttribute('stroke-dasharray', pct + ', 100');
    document.getElementById('scoreText').textContent = pct + '%';
    document.getElementById('correctAnswers').textContent = correct;
    document.getElementById('wrongAnswers').textContent = wrong;
    document.getElementById('totalScore').textContent = correct + '/' + total;

    activeQuiz = null;
    renderQuizzes();
  }

  /* ===== TIMER ===== */
  function startTimer() {
    var timerEl = document.getElementById('timeText');
    var box = document.getElementById('timerBox');
    function tick() {
      var m = Math.floor(timeRemaining / 60);
      var s = timeRemaining % 60;
      timerEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      if (timeRemaining <= 60) { box.classList.add('warning'); }
      if (timeRemaining <= 0) {
        stopTimer();
        finishQuiz();
        return;
      }
      timeRemaining--;
    }
    tick();
    timerInterval = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    document.getElementById('timerBox').classList.remove('warning');
  }

  /* ===== REQUEST QUIZ ===== */
  function buildRequestCourseSelect() {
    var sel = document.getElementById('requestCourse');
    var courses = getEnrolledCourses();
    sel.innerHTML = '<option value="" disabled selected>Select Course</option>';
    courses.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.courseId;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }

  document.getElementById('openRequestModal').addEventListener('click', function() {
    buildRequestCourseSelect();
    document.getElementById('requestDate').value = todayStr();
    document.getElementById('requestTime').value = '10:00';
    document.getElementById('requestQuizModal').classList.add('open');
  });
  document.getElementById('closeRequestModal').addEventListener('click', function() {
    document.getElementById('requestQuizModal').classList.remove('open');
  });
  document.getElementById('requestQuizModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });

  document.getElementById('requestQuizForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var user = getCurrentUser();
    var req = {
      id: uid(),
      userId: user.email,
      userName: user.name || 'Student',
      courseId: document.getElementById('requestCourse').value,
      title: document.getElementById('requestTitle').value.trim(),
      preferredDate: document.getElementById('requestDate').value,
      preferredTime: document.getElementById('requestTime').value,
      type: document.getElementById('requestType').value,
      status: 'pending',
      createdAt: nowISO()
    };
    var requests = getRequests();
    requests.unshift(req);
    saveRequests(requests);

    addNotif('Quiz Request Submitted', req.title + ' for ' + getCourseName(req.courseId) + ' is pending admin approval.', 'fa-file-alt');

    document.getElementById('requestQuizModal').classList.remove('open');
    e.target.reset();
    showToast('Quiz request submitted! Admin will review it.');
  });

  /* ===== REQUEST ACTIONS (Approve/Reject) ===== */
  document.getElementById('requestList').addEventListener('click', function(e) {
    var approveBtn = e.target.closest('.approve-request-btn');
    if (approveBtn) {
      var reqId = approveBtn.dataset.id;
      var requests = getRequests();
      var req = requests.find(function(r){ return r.id === reqId; });
      if (!req) return;

      /* Pre-fill the create quiz modal from the request */
      document.getElementById('adminQuizTitle').value = req.title;
      document.getElementById('adminQuizCourse').value = req.courseId;
      document.getElementById('adminScheduledDate').value = req.preferredDate;
      document.getElementById('adminScheduledTime').value = req.preferredTime;
      document.getElementById('adminQuizDuration').value = '15';

      /* Clear old questions, add one */
      document.getElementById('adminQuestionList').innerHTML = '';
      adminQuestionCount = 0;
      addAdminQuestionBlock();

      document.getElementById('createQuizModal').dataset.requestId = reqId;
      document.getElementById('createQuizModal').classList.add('open');
      return;
    }
    var rejectBtn = e.target.closest('.reject-request-btn');
    if (rejectBtn) {
      if (!confirm('Reject this quiz request?')) return;
      var id = rejectBtn.dataset.id;
      var requests = getRequests();
      var req = requests.find(function(r){ return r.id === id; });
      if (req) req.status = 'rejected';
      saveRequests(requests);
      renderRequests();
      showToast('Request rejected.');
    }
  });

  /* ===== ADMIN CREATE QUIZ ===== */
  var adminQuestionCount = 0;

  function buildAdminCourseSelect() {
    var sel = document.getElementById('adminQuizCourse');
    var courses = getEnrolledCourses();
    sel.innerHTML = '<option value="" disabled selected>Select Course</option>';
    courses.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.courseId;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }

  function addAdminQuestionBlock() {
    var list = document.getElementById('adminQuestionList');
    var num = ++adminQuestionCount;
    var div = document.createElement('div');
    div.className = 'question-block';
    div.dataset.num = num;
    div.innerHTML =
      '<div class="q-header">' +
        '<h4>Question ' + num + '</h4>' +
        '<button type="button" class="remove-question-btn" data-num="' + num + '">&times;</button>' +
      '</div>' +
      '<div class="q-body">' +
        '<input type="text" class="q-text" placeholder="Enter question..." required>' +
        '<div class="options-inputs">' +
          '<div class="option-input-wrap"><input type="radio" name="adminCorrect' + num + '" value="0" checked><input type="text" class="q-opt" placeholder="Option A" required></div>' +
          '<div class="option-input-wrap"><input type="radio" name="adminCorrect' + num + '" value="1"><input type="text" class="q-opt" placeholder="Option B" required></div>' +
          '<div class="option-input-wrap"><input type="radio" name="adminCorrect' + num + '" value="2"><input type="text" class="q-opt" placeholder="Option C"></div>' +
          '<div class="option-input-wrap"><input type="radio" name="adminCorrect' + num + '" value="3"><input type="text" class="q-opt" placeholder="Option D"></div>' +
        '</div>' +
      '</div>';
    list.appendChild(div);
  }

  document.getElementById('addAdminQuestionBtn').addEventListener('click', addAdminQuestionBlock);

  document.getElementById('adminQuestionList').addEventListener('click', function(e) {
    var rmBtn = e.target.closest('.remove-question-btn');
    if (rmBtn) {
      rmBtn.closest('.question-block').remove();
    }
  });

  document.getElementById('closeCreateModal').addEventListener('click', function() {
    document.getElementById('createQuizModal').classList.remove('open');
  });
  document.getElementById('createQuizModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });

  document.getElementById('createQuizForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var title = document.getElementById('adminQuizTitle').value.trim();
    var courseId = document.getElementById('adminQuizCourse').value;
    var scheduledDate = document.getElementById('adminScheduledDate').value;
    var scheduledTime = document.getElementById('adminScheduledTime').value;
    var duration = parseInt(document.getElementById('adminQuizDuration').value) || 15;

    var blocks = document.querySelectorAll('#adminQuestionList .question-block');
    var questions = [];
    var valid = true;
    blocks.forEach(function(block) {
      var qText = block.querySelector('.q-text').value.trim();
      var opts = block.querySelectorAll('.q-opt');
      var correctRadio = block.querySelector('input[type="radio"]:checked');
      var correctIndex = correctRadio ? parseInt(correctRadio.value) : 0;
      if (!qText) { valid = false; return; }
      var optVals = [];
      opts.forEach(function(o) {
        var v = o.value.trim();
        if (v) optVals.push(v);
      });
      if (optVals.length < 2) { valid = false; return; }
      questions.push({ text: qText, options: optVals, correctIndex: Math.min(correctIndex, optVals.length - 1) });
    });

    if (!title || !courseId || !scheduledDate || !valid || questions.length === 0) {
      showToast('Please fill in all required fields and at least 2 options per question.', 'error');
      return;
    }

    var quiz = {
      id: uid(),
      title: title,
      courseId: courseId,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime || '10:00',
      duration: duration,
      questions: questions,
      status: 'upcoming',
      createdBy: (getCurrentUser().email) || 'admin',
      createdAt: nowISO(),
      _notifiedToday: false
    };

    var quizzes = getQuizzes();
    quizzes.unshift(quiz);
    saveQuizzes(quizzes);

    /* Mark the request as approved */
    var reqId = document.getElementById('createQuizModal').dataset.requestId;
    if (reqId) {
      var requests = getRequests();
      var req = requests.find(function(r){ return r.id === reqId; });
      if (req) req.status = 'approved';
      saveRequests(requests);
      renderRequests();
    }

    addNotif('Quiz Scheduled: ' + title, 'Quiz "' + title + '" for ' + getCourseName(courseId) + ' scheduled on ' + scheduledDate + ' at ' + scheduledTime, 'fa-calendar-check');

    document.getElementById('createQuizModal').classList.remove('open');
    e.target.reset();
    renderQuizzes();
    showToast('Quiz scheduled successfully!');
  });

  /* ===== LARGE CREATE QUIZ BUTTON (non-admin) ===== */
  document.getElementById('openCreateModal') && document.getElementById('openCreateModal').addEventListener('click', function() {
    toggleAdmin(true);
    document.getElementById('adminPanel').classList.remove('hidden');
    buildAdminCourseSelect();
    document.getElementById('adminQuestionList').innerHTML = '';
    adminQuestionCount = 0;
    addAdminQuestionBlock();
    document.getElementById('createQuizModal').dataset.requestId = '';
    document.getElementById('createQuizModal').classList.add('open');
  });

  /* ===== ADMIN TOGGLE ===== */
  var adminToggle = document.getElementById('adminToggle');
  var adminPanel = document.getElementById('adminPanel');

  if (adminToggle) {
    adminToggle.addEventListener('change', function() {
      toggleAdmin(this.checked);
      adminPanel.classList.toggle('hidden', !this.checked);
      if (this.checked) {
        renderRequests();
        buildAdminCourseSelect();
      }
      renderQuizzes();
    });
  }

  if (isAdmin()) {
    if (adminToggle) adminToggle.checked = true;
    if (adminPanel) adminPanel.classList.remove('hidden');
  }

  /* ===== QUIZ GRID EVENT DELEGATION ===== */
  document.getElementById('quizGrid').addEventListener('click', function(e) {
    var takeBtn = e.target.closest('.take-quiz-btn');
    if (takeBtn) {
      var quizId = takeBtn.dataset.id;
      var quiz = refreshQuizStatuses().find(function(q){ return q.id === quizId; });
      if (quiz && quiz.status === 'active') {
        document.getElementById('startQuizTitle').textContent = quiz.title;
        document.getElementById('startQuizInfo').innerHTML = (quiz.questions || []).length + ' questions &middot; ' + (quiz.duration || 10) + ' minutes';
        document.getElementById('startQuizModal').dataset.targetId = quizId;
        document.getElementById('startQuizModal').classList.add('open');
      } else {
        showToast('This quiz is not available right now.', 'warning');
      }
      return;
    }
    var deleteBtn = e.target.closest('.delete-quiz-btn');
    if (deleteBtn) {
      if (!confirm('Delete this quiz?')) return;
      var id = deleteBtn.dataset.id;
      var quizzes = getQuizzes().filter(function(q){ return q.id !== id; });
      saveQuizzes(quizzes);
      renderQuizzes();
      showToast('Quiz deleted.');
      return;
    }
    var viewBtn = e.target.closest('.view-result-btn');
    if (viewBtn) {
      var quizId = viewBtn.dataset.id;
      var attempts = getAttempts().filter(function(a){ return a.quizId === quizId; });
      if (attempts.length === 0) {
        showToast('No attempts yet for this quiz.', 'info');
      } else {
        var msg = attempts.map(function(a){ return a.userName + ': ' + a.score + '/' + a.total; }).join(', ');
        showToast(msg, 'info');
      }
    }
  });

  document.getElementById('confirmStartBtn').addEventListener('click', function() {
    var id = document.getElementById('startQuizModal').dataset.targetId;
    document.getElementById('startQuizModal').classList.remove('open');
    startQuiz(id);
  });
  document.getElementById('cancelStartBtn').addEventListener('click', function() {
    document.getElementById('startQuizModal').classList.remove('open');
  });
  document.getElementById('closeStartModal').addEventListener('click', function() {
    document.getElementById('startQuizModal').classList.remove('open');
  });
  document.getElementById('startQuizModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });

  document.getElementById('retakeBtn').addEventListener('click', function() {
    showView('quizDashboardView');
  });
  document.getElementById('goDashboardBtn').addEventListener('click', function() {
    showView('quizDashboardView');
    renderQuizzes();
  });

  /* ===== RESULTS COURSE SELECT ===== */
  document.getElementById('resultsCourseSelect').addEventListener('change', renderCourseResults);

  /* ===== TOAST ===== */
  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = 'toast';
    if (type === 'error') toast.classList.add('error');
    else if (type === 'warning') toast.classList.add('warning');
    var icon = type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = '<i class="fas ' + icon + '"></i> ' + message;
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 3000);
  }

  /* ===== INIT ===== */
  buildCategories();
  renderQuizzes();
  if (isAdmin()) renderRequests();

  /* Build results course dropdown */
  (function buildResultsCourseSelect() {
    var sel = document.getElementById('resultsCourseSelect');
    var courses = getEnrolledCourses();
    sel.innerHTML = '<option value="">Select a course to view results...</option>';
    courses.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.courseId;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  })();

})();
