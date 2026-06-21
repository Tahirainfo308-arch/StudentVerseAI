(function() {
  const savedTheme = localStorage.getItem('sv-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sv-theme', theme);
  }

  const themeBtns = document.querySelectorAll('.theme-toggle, #dashThemeToggle');
  themeBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  });

  const userData = JSON.parse(localStorage.getItem('sv-user'));
  if (userData) {
    const welcomeName = document.getElementById('welcomeName');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const profileName = document.getElementById('profileName');

    if (welcomeName) welcomeName.textContent = userData.name || 'Student';
    if (userName) userName.textContent = userData.name || 'Student';
    if (userRole) userRole.textContent = userData.department || 'Student';
    if (profileName) profileName.textContent = userData.name || 'Student';

    /* Update active courses stat based on enrolled courses */
    var enrolledRaw = userData.enrolledCourses || [];
    var enrolledCount = enrolledRaw.length;
    var activeCoursesEl = document.getElementById('activeCourses');
    if (activeCoursesEl) activeCoursesEl.textContent = enrolledCount || '0';

    /* Update welcome message */
    var welcomeP = document.querySelector('.welcome-section p');
    if (welcomeP) {
      welcomeP.textContent = 'You are enrolled in ' + enrolledCount + ' course' + (enrolledCount !== 1 ? 's' : '') + '. Track your progress below.';
    }
  }

  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('collapseBtn');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  const pageLinks = document.querySelectorAll('.sidebar-nav a[data-page]');
  const pageSections = document.querySelectorAll('.page-section');

  function showPage(pageId) {
    pageSections.forEach(s => s.classList.remove('active'));
    pageLinks.forEach(l => l.classList.remove('active'));

    const targetSection = document.getElementById('page-' + pageId);
    if (targetSection) targetSection.classList.add('active');

    const targetLink = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
    if (targetLink) targetLink.classList.add('active');

    if (sidebar) sidebar.classList.remove('mobile-open');

    /* Mark notifications as read, auto-filter when visiting notifications page */
    if (pageId === 'notifications') {
      var notifs = getNotifs();
      notifs.forEach(function(n){ n.read = true; });
      saveNotifs(notifs);
      updateNotifBadge();
      /* Auto-filter based on last viewed page */
      var pageMap = { 'my-courses': 'general', 'assignments': 'assignments', 'study-groups': 'groups', 'notes-hub': 'notes', 'quiz': 'quiz', 'dashboard-home': 'all' };
      var fromPage = window._lastPageId || 'all';
      var matched = pageMap[fromPage] || 'all';
      /* Wait for DOM to render then apply filter */
      setTimeout(function(){ renderNotifs(matched); }, 50);
    }

    /* Show page navigation toast */
    var pageNames = {
      'dashboard-home': 'Home',
      'my-courses': 'My Courses',
      'assignments': 'Assignments',
      'study-groups': 'Study Groups',
      'notes-hub': 'Notes Hub',
      'quiz': 'Quiz Center',
      'ai-assistant': 'AI Assistant',
      'pomodoro': 'Pomodoro Timer',
      'gpa-calculator': 'GPA Calculator',
      'calendar': 'Calendar',
      'notifications': 'Notifications',
      'profile': 'Profile',
      'settings': 'Settings'
    };
    var niceName = pageNames[pageId] || pageId;
    if (pageId !== window._lastPageId) {
      showToast('Switched to ' + niceName, '&#128279;');
    }
    window._lastPageId = pageId;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.showPage = showPage;

  pageLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      showPage(page);
    });
  });

  /* Topbar notification bell -> go to notifications page */
  var bellBtn = document.querySelector('.topbar-btn[aria-label="Notifications"]');
  if (bellBtn) {
    bellBtn.addEventListener('click', function(){
      var notifLink = document.querySelector('.sidebar-nav a[data-page="notifications"]');
      if (notifLink) notifLink.click();
    });
  }

  /* Quick Action Cards - redirect to external pages */
  document.querySelectorAll('.quick-action-card').forEach(function(card) {
    function navigate() {
      var page = card.getAttribute('data-page');
      if (page) {
        if (page.includes('.html')) {
          window.location.href = page;
        } else {
          showPage(page);
        }
      }
    }
    card.addEventListener('click', navigate);
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
    });
  });

  function getAssignmentsData() {
    try { return JSON.parse(localStorage.getItem('sv-assignments')) || []; } catch(e) { return []; }
  }

  var dashboardGpaChart = null;
  var dashboardProgressChart = null;
  var dashboardAssignChart = null;
  var dashboardStudyChart = null;

  function buildCharts() {
    if (typeof Chart === 'undefined') return;

    /* Destroy existing charts if any */
    if (dashboardGpaChart) { dashboardGpaChart.destroy(); dashboardGpaChart = null; }
    if (dashboardProgressChart) { dashboardProgressChart.destroy(); dashboardProgressChart = null; }
    if (dashboardAssignChart) { dashboardAssignChart.destroy(); dashboardAssignChart = null; }
    if (dashboardStudyChart) { dashboardStudyChart.destroy(); dashboardStudyChart = null; }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#8B949E' : '#636E72';

    function createGradient(ctx, chartArea, color1, color2) {
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    }

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    /* GPA Chart - use current GPA from user/profile data */
    var currentGpaVal = 3.5;
    var chartUserData = getLatestUserData();
    if (chartUserData && chartUserData.gpa) currentGpaVal = parseFloat(chartUserData.gpa) || 3.5;
    else {
      try { var pd = JSON.parse(localStorage.getItem('sv-profile-data')); if (pd && pd.gpa) currentGpaVal = parseFloat(pd.gpa); } catch(e) {}
    }

    const gpaCtx = document.getElementById('gpaChart');
    if (gpaCtx) {
      dashboardGpaChart = new Chart(gpaCtx, {
        type: 'line',
        data: {
          labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Current'],
          datasets: [{
            label: 'CGPA',
            data: [3.2, 3.5, 3.7, currentGpaVal],
            borderColor: '#0F766E',
            backgroundColor: function(ctx) {
              if (!ctx.chart.chartArea) return 'rgba(15,118,110,0.1)';
              return createGradient(ctx.chart.ctx, ctx.chart.chartArea, 'rgba(15,118,110,0.3)', 'rgba(15,118,110,0.02)');
            },
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0F766E',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1200,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1C2333' : '#fff',
              titleColor: isDark ? '#E6EDF3' : '#2D3436',
              bodyColor: isDark ? '#8B949E' : '#636E72',
              borderColor: isDark ? '#30363D' : '#E0E4EA',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: { min: 2.0, max: 4.0, grid: { color: gridColor }, ticks: { color: textColor } },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }

    /* Progress Chart - calculate from assignments */
    var assignItems = getAssignmentsData();
    var completedCount = assignItems.filter(function(a){ return a.status === 'completed'; }).length;
    var inProgressCount = assignItems.filter(function(a){ return a.status === 'in-progress'; }).length;
    var notStartedCount = assignItems.filter(function(a){ return a.status === 'pending' || a.status === 'overdue'; }).length;
    var totalAssign = assignItems.length;
    if (totalAssign === 0) { completedCount = 0; inProgressCount = 0; notStartedCount = 100; }

    const progressCtx = document.getElementById('progressChart');
    if (progressCtx) {
      dashboardProgressChart = new Chart(progressCtx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'In Progress', 'Not Started'],
          datasets: [{
            data: [completedCount, inProgressCount, notStartedCount || 1],
            backgroundColor: ['#10B981', '#F59E0B', isDark ? '#30363D' : '#E0E4EA'],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          animation: {
            animateRotate: true,
            duration: 1000,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 16,
                usePointStyle: true,
                pointStyle: 'circle',
                color: textColor
              }
            },
            tooltip: {
              backgroundColor: isDark ? '#1C2333' : '#fff',
              titleColor: isDark ? '#E6EDF3' : '#2D3436',
              bodyColor: isDark ? '#8B949E' : '#636E72',
              borderColor: isDark ? '#30363D' : '#E0E4EA',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(ctx) {
                  return ctx.label + ': ' + ctx.parsed;
                }
              }
            }
          }
        }
      });
    }

    /* Assignment Chart - show completed vs pending from actual data */
    var completedAss = assignItems.filter(function(a){ return a.status === 'completed'; }).length;
    var pendingAss = assignItems.filter(function(a){ return a.status === 'pending' || a.status === 'overdue'; }).length;
    var inProgAss = assignItems.filter(function(a){ return a.status === 'in-progress'; }).length;

    const assignCtx = document.getElementById('assignmentChart');
    if (assignCtx) {
      dashboardAssignChart = new Chart(assignCtx, {
        type: 'bar',
        data: {
          labels: ['Assignments'],
          datasets: [{
            label: 'Completed',
            data: [completedAss],
            backgroundColor: '#10B981',
            borderRadius: 8,
            borderSkipped: false
          }, {
            label: 'In Progress',
            data: [inProgAss],
            backgroundColor: '#F59E0B',
            borderRadius: 8,
            borderSkipped: false
          }, {
            label: 'Pending',
            data: [pendingAss],
            backgroundColor: '#EF4444',
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 800,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 16,
                usePointStyle: true,
                pointStyle: 'rectRounded',
                color: textColor
              }
            },
            tooltip: {
              backgroundColor: isDark ? '#1C2333' : '#fff',
              titleColor: isDark ? '#E6EDF3' : '#2D3436',
              bodyColor: isDark ? '#8B949E' : '#636E72',
              borderColor: isDark ? '#30363D' : '#E0E4EA',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: gridColor },
              ticks: { color: textColor, stepSize: 1 }
            },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }

    /* Study Chart - read from sv-study-blocks and sv-schedule */
    var dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    var dayHours = { 'Monday':0,'Tuesday':0,'Wednesday':0,'Thursday':0,'Friday':0,'Saturday':0,'Sunday':0 };
    try {
      var sched = JSON.parse(localStorage.getItem('sv-schedule')) || [];
      sched.forEach(function(s){ if (dayHours[s.day] !== undefined) dayHours[s.day]++; });
    } catch(e) {}
    try {
      var blocks = JSON.parse(localStorage.getItem('sv-study-blocks')) || [];
      blocks.forEach(function(b){ if (dayHours[b.day] !== undefined) dayHours[b.day]++; });
    } catch(e) {}
    var studyData = dayNames.map(function(d){ return dayHours[d]; });

    const studyCtx = document.getElementById('studyChart');
    if (studyCtx) {
      dashboardStudyChart = new Chart(studyCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Activities',
            data: studyData,
            borderColor: '#14B8A6',
            backgroundColor: function(ctx) {
              if (!ctx.chart.chartArea) return 'rgba(20,184,166,0.1)';
              return createGradient(ctx.chart.ctx, ctx.chart.chartArea, 'rgba(20,184,166,0.3)', 'rgba(20,184,166,0.02)');
            },
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#14B8A6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1200,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1C2333' : '#fff',
              titleColor: isDark ? '#E6EDF3' : '#2D3436',
              bodyColor: isDark ? '#8B949E' : '#636E72',
              borderColor: isDark ? '#30363D' : '#E0E4EA',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: { min: 0, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }
  }

  const gpaCourses = document.getElementById('gpaCourses');
  const addGpaRow = document.getElementById('addGpaRow');
  const calcGpaBtn = document.getElementById('calcGpa');
  const resetGpaBtn = document.getElementById('resetGpa');
  const gpaDisplay = document.getElementById('gpaDisplay');
  const gpaStatus = document.getElementById('gpaStatus');

  if (addGpaRow && gpaCourses) {
    addGpaRow.addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'gpa-form-row';
      row.innerHTML = `
        <input type="text" placeholder="e.g. Data Structures" class="gpa-course-name">
        <input type="number" placeholder="Credits" class="gpa-credits" min="1" max="5" value="3">
        <select class="gpa-grade">
          <option value="4.0">4.00</option>
          <option value="3.7">3.70</option>
          <option value="3.3">3.30</option>
          <option value="3.0">3.00</option>
          <option value="2.7">2.70</option>
          <option value="2.3">2.30</option>
          <option value="2.0">2.00</option>
          <option value="1.7">1.70</option>
          <option value="1.3">1.30</option>
          <option value="1.0">1.00</option>
          <option value="0.0">0.00</option>
        </select>
        <button class="btn btn-outline btn-sm remove-gpa-row" style="padding:10px 12px;">&#10005;</button>
      `;
      gpaCourses.appendChild(row);
      row.querySelector('.remove-gpa-row').addEventListener('click', () => row.remove());
    });

    gpaCourses.querySelector('.remove-gpa-row')?.addEventListener('click', function() {
      this.closest('.gpa-form-row').remove();
    });
  }

  if (calcGpaBtn) {
    calcGpaBtn.addEventListener('click', () => {
      const rows = gpaCourses.querySelectorAll('.gpa-form-row');
      let totalCredits = 0;
      let totalGradePoints = 0;
      let valid = true;

      rows.forEach(row => {
        const credits = parseFloat(row.querySelector('.gpa-credits').value);
        const grade = parseFloat(row.querySelector('.gpa-grade').value);
        const name = row.querySelector('.gpa-course-name').value.trim();

        if (!name) { valid = false; return; }

        totalCredits += credits;
        totalGradePoints += grade * credits;
      });

      if (!valid || totalCredits === 0) {
        gpaDisplay.textContent = '--';
        gpaStatus.innerHTML = 'Please fill in all course names';
        return;
      }

      const gpa = totalGradePoints / totalCredits;
      var gpaStr = gpa.toFixed(2);
      gpaDisplay.textContent = gpaStr;

      /* Save GPA to user data for dashboard sync */
      if (userData) {
        userData.gpa = gpaStr;
        localStorage.setItem('sv-user', JSON.stringify(userData));
      }
      try {
        var profileData = JSON.parse(localStorage.getItem('sv-profile-data'));
        if (profileData) { profileData.gpa = gpaStr; localStorage.setItem('sv-profile-data', JSON.stringify(profileData)); }
      } catch(e) {}
      updateHomeStats();

      var pct = (gpa / 4.0 * 100).toFixed(1);

      gpaStatus.innerHTML = 'Total CGPA: ' + gpaStr + ' / 4.00 &nbsp;|&nbsp; Obtained: ' + pct + '%';
      gpaStatus.className = 'gpa-status good';
      if (gpa >= 3.7) gpaStatus.className = 'gpa-status excellent';
      else if (gpa >= 3.0) gpaStatus.className = 'gpa-status good';
      else if (gpa >= 2.0) gpaStatus.className = 'gpa-status average';
      else gpaStatus.className = 'gpa-status low';
      addNotif('GPA Calculated', 'Your CGPA is ' + gpaStr + ' / 4.00 (' + pct + '%)', '&#128202;', 'general');
    });
  }

  if (resetGpaBtn) {
    resetGpaBtn.addEventListener('click', () => {
      gpaDisplay.textContent = '0.00';
      gpaStatus.innerHTML = 'Add courses to calculate Total CGPA';
      gpaStatus.className = 'gpa-status';
    });
  }

  const GROQ_API_KEY = (typeof CONFIG !== 'undefined' && CONFIG.GROQ_API_KEY) || localStorage.getItem('GROQ_API_KEY') || '';
  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  let groqLoading = false;

  const groqMessages = document.getElementById('groqMessages');
  const groqInput = document.getElementById('groqInput');
  const groqSendBtn = document.getElementById('groqSendBtn');
  const groqModel = document.getElementById('groq-model');

  function escHtml(t) {
    if (!t) return '';
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function formatContent(text) {
    if (!text) return '';
    text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, function(m, lang, code) {
      return '<pre><code>' + escHtml(code.trim()) + '</code></pre>';
    });
    text = text.replace(/`([^`]+)`/g, function(m, code) {
      return '<code>' + escHtml(code) + '</code>';
    });
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*\*/g, '<em>$1</em>');
    return text;
  }

  function addGroqMessage(role, content, animate) {
    if (!groqMessages) return;
    var isUser = role === 'user';
    var div = document.createElement('div');
    div.className = 'ai-message' + (isUser ? ' user' : '');
    if (!animate) div.style.animation = 'none';
    div.innerHTML =
      '<div class="avatar">' + (isUser ? '👤' : '⚡') + '</div>' +
      '<div class="bubble">' + formatContent(content) + '</div>';
    groqMessages.appendChild(div);
    groqMessages.scrollTop = groqMessages.scrollHeight;
  }

  function addGroqTyping() {
    if (!groqMessages) return;
    var div = document.createElement('div');
    div.className = 'ai-message';
    div.id = 'groqTyping';
    div.innerHTML =
      '<div class="avatar">⚡</div>' +
      '<div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    groqMessages.appendChild(div);
    groqMessages.scrollTop = groqMessages.scrollHeight;
  }

  function removeGroqTyping() {
    var el = document.getElementById('groqTyping');
    if (el) el.remove();
  }

  async function askGroq(text) {
    if (groqLoading || !text.trim()) return;
    groqLoading = true;
    groqSendBtn.disabled = true;

    addGroqMessage('user', text, true);
    groqInput.value = '';
    groqInput.style.height = 'auto';
    addGroqTyping();

    try {
      var res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + GROQ_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: groqModel ? groqModel.value : 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a helpful, knowledgeable AI study assistant for students. Provide clear, concise answers with examples when helpful. Use markdown for code blocks and formatting.' },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      removeGroqTyping();
      var data = await res.json();

      if (data.choices && data.choices[0]) {
        addGroqMessage('assistant', data.choices[0].message.content, true);
      } else {
        var errMsg = data.error ? data.error.message : 'No response from Groq';
        addGroqMessage('assistant', '⚠️ Error: ' + errMsg, true);
      }
    } catch (err) {
      removeGroqTyping();
      addGroqMessage('assistant', '⚠️ Network error: ' + err.message, true);
    }

    groqLoading = false;
    groqSendBtn.disabled = false;
  }

  if (groqSendBtn && groqInput) {
    groqSendBtn.addEventListener('click', function() {
      askGroq(groqInput.value);
    });
    groqInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askGroq(groqInput.value);
      }
    });
  }

  function autoResizeGroq(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  // Suggestions
  document.addEventListener('click', function(e) {
    var sug = e.target.closest('.groq-suggestion');
    if (sug) {
      var prompt = sug.dataset.prompt;
      if (prompt) askGroq(prompt);
    }
  });

  let timerInterval = null;
  let timerSeconds = 25 * 60;
  let isTimerRunning = false;
  let pomodoroCount = parseInt(localStorage.getItem('sv-pomodoro') || '0');

  const timerDisplay = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('startTimer');
  const pauseBtn = document.getElementById('pauseTimer');
  const resetBtn = document.getElementById('resetTimer');
  const pomodoroCountEl = document.getElementById('pomodoroCount');

  if (pomodoroCountEl) pomodoroCountEl.textContent = pomodoroCount;

  function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    if (timerDisplay) timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerInterval = setInterval(() => {
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        pomodoroCount++;
        if (pomodoroCountEl) pomodoroCountEl.textContent = pomodoroCount;
        localStorage.setItem('sv-pomodoro', pomodoroCount);
        timerSeconds = 25 * 60;
        updateTimerDisplay();
        return;
      }
      timerSeconds--;
      updateTimerDisplay();
    }, 1000);
  }

  if (startBtn) {
    startBtn.addEventListener('click', startTimer);
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      isTimerRunning = false;
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      isTimerRunning = false;
      timerSeconds = 25 * 60;
      updateTimerDisplay();
    });
  }

  document.querySelectorAll('[data-pomodoro]').forEach(btn => {
    btn.addEventListener('click', function() {
      clearInterval(timerInterval);
      isTimerRunning = false;
      timerSeconds = parseInt(this.getAttribute('data-pomodoro')) * 60;
      updateTimerDisplay();
    });
  });

  let calendarDate = new Date();
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarTitle = document.getElementById('calendarTitle');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');

  const events = {};

  function loadCalendarEvents() {
    var assignments = getAssignments();
    Object.keys(events).forEach(function(k){ delete events[k]; });
    assignments.forEach(function(a){
      if (a.dueDate) {
        var label = a.title + (a.course ? ' (' + a.course + ')' : '') + ' Due';
        if (events[a.dueDate]) events[a.dueDate] += '; ' + label;
        else events[a.dueDate] = label;
      }
    });
  }

  function renderCalendar() {
    if (!calendarGrid || !calendarTitle) return;
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    calendarTitle.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    const dayHeaders = calendarGrid.querySelectorAll('.calendar-day-header');
    const existingDays = calendarGrid.querySelectorAll('.calendar-day');
    existingDays.forEach(d => d.remove());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = document.createElement('div');
      day.className = 'calendar-day other-month';
      day.textContent = daysInPrevMonth - i;
      calendarGrid.appendChild(day);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const day = document.createElement('div');
      day.className = 'calendar-day';
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (dateStr === todayStr) day.classList.add('today');
      if (events[dateStr]) day.classList.add('has-event');
      day.textContent = d;
      day.title = events[dateStr] || '';
      calendarGrid.appendChild(day);
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = 7 - (totalCells % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = d;
        calendarGrid.appendChild(day);
      }
    }
  }

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      calendarDate.setMonth(calendarDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      calendarDate.setMonth(calendarDate.getMonth() + 1);
      renderCalendar();
    });
  }

  loadCalendarEvents();
  renderCalendar();

  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') darkModeToggle.classList.add('active');

    darkModeToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      const isDark = this.classList.contains('active');
      applyTheme(isDark ? 'dark' : 'light');
    });
  }

  const coursesData = [
    {courseId:"CS-101",name:"Data Structures & Algorithms",category:"Software Engineering",skills:["Data Structures","Algorithms","Problem Solving","C++"],description:"Students practice coding interviews and solve algorithmic challenges together."},
    {courseId:"CS-102",name:"Software Engineering",category:"Software Engineering",skills:["Agile","Design Patterns","Version Control","Testing"],description:"Students collaborate on full-lifecycle software projects using industry best practices."},
    {courseId:"CS-201",name:"Database Systems",category:"Databases",skills:["SQL","Normalization","Query Optimization","Transactions"],description:"Students design relational schemas and optimize complex queries for real-world datasets."},
    {courseId:"CS-202",name:"Computer Networks",category:"Systems & Networking",skills:["TCP/IP","Routing","Network Security","OSI Model"],description:"Students simulate network topologies and troubleshoot packet-level communication issues."},
    {courseId:"CS-301",name:"Artificial Intelligence",category:"Data Science & AI",skills:["Search Algorithms","Knowledge Representation","Probabilistic Reasoning","NLP"],description:"Students build intelligent agents and compete in weekly AI challenge arenas."},
    {courseId:"CS-302",name:"Machine Learning Fundamentals",category:"Data Science & AI",skills:["Supervised Learning","Neural Networks","Model Evaluation","Python"],description:"Students train models on real datasets and participate in Kaggle-style competitions."},
    {courseId:"WEB-101",name:"HTML & CSS Foundations",category:"Development (Frontend)",skills:["HTML5","CSS3","Responsive Design","Flexbox"],description:"Students build responsive landing pages and review each other's markup in code reviews."},
    {courseId:"WEB-201",name:"JavaScript & DOM Manipulation",category:"Development (Frontend)",skills:["JavaScript","DOM","Event Handling","Async JS"],description:"Students create interactive browser applications and debug issues in live pair sessions."},
    {courseId:"WEB-301",name:"React.js Development",category:"Development (Frontend)",skills:["React","Hooks","State Management","JSX"],description:"Students build single-page applications and showcase their component libraries weekly."},
    {courseId:"WEB-302",name:"TypeScript & Modern Frontend",category:"Development (Frontend)",skills:["TypeScript","Next.js","Tailwind CSS","API Integration"],description:"Students architect type-safe frontends and perform collaborative code migrations."},
    {courseId:"WEB-401",name:"Node.js & Express Backend",category:"Development (Backend)",skills:["Node.js","Express","REST APIs","Authentication"],description:"Students design RESTful services and load-test each other's endpoints for performance."},
    {courseId:"WEB-402",name:"Python & Django Backend",category:"Development (Backend)",skills:["Python","Django","ORM","API Design"],description:"Students develop full-stack web apps and peer-review Django models and views."},
    {courseId:"WEB-403",name:"API Design & GraphQL",category:"Development (Backend)",skills:["GraphQL","REST","Apollo","Schema Design"],description:"Students build and consume GraphQL APIs in a shared sandbox playground environment."},
    {courseId:"CLD-201",name:"AWS Cloud Practitioner",category:"Cloud & DevOps",skills:["EC2","S3","IAM","Lambda"],description:"Students deploy serverless applications on AWS and troubleshoot cloud infrastructure together."},
    {courseId:"CLD-301",name:"Docker & Containerization",category:"Cloud & DevOps",skills:["Docker","Containers","Docker Compose","Image Optimization"],description:"Students containerize applications and run multi-service stacks in shared Docker Swarms."},
    {courseId:"CLD-302",name:"Kubernetes Orchestration",category:"Cloud & DevOps",skills:["Kubernetes","Pods","Helm","Service Mesh"],description:"Students manage production-grade clusters and simulate failure recovery scenarios."},
    {courseId:"CLD-303",name:"CI/CD & DevOps Pipelines",category:"Cloud & DevOps",skills:["GitHub Actions","Jenkins","Terraform","Monitoring"],description:"Students automate deployment pipelines and collaborate on infrastructure-as-code projects."},
    {courseId:"SEC-301",name:"Cybersecurity Fundamentals",category:"Cybersecurity",skills:["Cryptography","Network Security","Threat Modeling","Risk Assessment"],description:"Students defend virtual networks in capture-the-flag cybersecurity competitions."},
    {courseId:"SEC-302",name:"Ethical Hacking & Penetration Testing",category:"Cybersecurity",skills:["Pen Testing","Metasploit","Burp Suite","Exploit Development"],description:"Students identify vulnerabilities in sandboxed environments and document remediation strategies."},
    {courseId:"SEC-303",name:"Blockchain & Web3 Security",category:"Cybersecurity",skills:["Blockchain","Smart Contracts","Solidity","DeFi Security"],description:"Students audit smart contracts for vulnerabilities and participate in bug bounty simulations."},
    {courseId:"DS-101",name:"Python for Data Science",category:"Data Science & AI",skills:["Python","NumPy","Pandas","Matplotlib"],description:"Students analyze real-world datasets and present visual insights in weekly showcases."},
    {courseId:"DS-201",name:"Deep Learning & Neural Networks",category:"Data Science & AI",skills:["TensorFlow","CNNs","RNNs","PyTorch"],description:"Students train deep learning models on GPUs and compare architectures in leaderboards."},
    {courseId:"DS-301",name:"Natural Language Processing",category:"Data Science & AI",skills:["NLP","Transformers","BERT","Sentiment Analysis"],description:"Students build chatbots and language models that compete in weekly NLP challenges."},
    {courseId:"MOB-201",name:"React Native Development",category:"Mobile Development",skills:["React Native","Expo","Mobile UI","Push Notifications"],description:"Students cross-platform mobile apps and beta-test each other's builds on real devices."},
    {courseId:"MOB-301",name:"Flutter & Dart Development",category:"Mobile Development",skills:["Flutter","Dart","Widgets","Firebase"],description:"Students build pixel-perfect mobile UIs and share reusable widget libraries."},
    {courseId:"MOB-302",name:"iOS Development with Swift",category:"Mobile Development",skills:["Swift","Xcode","UIKit","Core Data"],description:"Students publish iOS apps to TestFlight and conduct structured code review sessions."},
    {courseId:"DB-301",name:"NoSQL & MongoDB",category:"Databases",skills:["MongoDB","Aggregation","Indexing","Replication"],description:"Students design document schemas and optimize read-heavy workloads in shared clusters."},
    {courseId:"DB-302",name:"PostgreSQL & Advanced SQL",category:"Databases",skills:["PostgreSQL","Window Functions","CTEs","Performance Tuning"],description:"Students tackle complex analytical queries and benchmark query plans collaboratively."},
    {courseId:"SYS-301",name:"Operating Systems",category:"Systems & Networking",skills:["Process Management","Memory Management","File Systems","Scheduling"],description:"Students implement mini-kernels and debug concurrency issues in simulated environments."},
    {courseId:"SYS-401",name:"System Design & Architecture",category:"Software Engineering",skills:["Distributed Systems","Microservices","Load Balancing","Caching"],description:"Students whiteboard scalable architectures and review each other's design documents."}
  ];

  /* Helper: get enrolled course IDs (handles both old string[] and new object[] format) */
  function getEnrolledIds() {
    var freshUserData = getLatestUserData();
    var raw = freshUserData ? (freshUserData.enrolledCourses || []) : [];
    return raw.map(function(e){ return typeof e === 'string' ? e : e.id; });
  }

  function renderCourses(filterCategory, searchQuery) {
    const container = document.getElementById('coursesContainer');
    if (!container) return;
    
    var enrolled = getEnrolledIds();
    
    var filtered = coursesData.filter(function(c) {
      if (filterCategory && filterCategory !== 'all' && c.category !== filterCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q)) || c.category.toLowerCase().includes(q);
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-search" style="font-size:3rem;color:var(--text-muted);"></i><h3 style="margin-top:16px;">No Courses Found</h3><p>Try adjusting your search or filter.</p></div>';
      return;
    }

    container.innerHTML = filtered.map(c => {
      var isEnrolled = enrolled.indexOf(c.courseId) > -1;
      return '<div class="course-card">' +
        '<div class="course-cover">' +
          '<i class="fas fa-code"></i>' +
        '</div>' +
        '<div class="course-card-body">' +
          '<h3>' + esc(c.name) + '</h3>' +
          '<div class="instructor">' + esc(c.category) + '</div>' +
          '<div class="skills-row">' + c.skills.map(function(s){ return '<span>' + esc(s) + '</span>'; }).join('') + '</div>' +
          '<div class="progress-bar">' +
            '<div class="progress-fill" style="width:' + (isEnrolled ? '65' : '0') + '%"></div>' +
          '</div>' +
          '<div class="course-card-stats">' +
            '<span><i class="far fa-file-alt"></i> ' + Math.floor(Math.random() * 8 + 3) + ' Assignments</span>' +
            '<span><i class="far fa-clock"></i> ' + Math.floor(Math.random() * 16 + 6) + 'h remaining</span>' +
          '</div>' +
          '<div class="course-card-actions">' +
            (isEnrolled ? '<button class="btn btn-primary btn-sm open-group-btn" data-cid="' + c.courseId + '">Open Group</button>' : '<button class="btn btn-primary btn-sm">Enroll</button>') +
            '<button class="btn btn-outline btn-sm detail-course-btn" data-cid="' + c.courseId + '">Details</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  const courseFilter = document.getElementById('courseFilter');
  if (courseFilter) {
    courseFilter.addEventListener('change', function() {
      renderCourses(this.value, document.getElementById('courseSearch')?.value || '');
    });
  }

  const courseSearch = document.getElementById('courseSearch');
  if (courseSearch) {
    courseSearch.addEventListener('input', function() {
      renderCourses(document.getElementById('courseFilter')?.value || 'all', this.value);
    });
  }

  renderCourses('all', '');

  /* ===== PROFILE SYNC ===== */
  function syncProfile() {
    var pData;
    try { pData = JSON.parse(localStorage.getItem('sv-profile-data')); } catch(e) {}
    var freshU = getLatestUserData();
    if (freshU) {
      document.getElementById('userName').textContent = freshU.name || 'Student';
      document.getElementById('userRole').textContent = freshU.department || 'Student';
      var pn = document.getElementById('profileName');
      if (pn) pn.textContent = freshU.name || 'Student';
      var welcome = document.getElementById('welcomeName');
      if (welcome) welcome.textContent = freshU.name || 'Student';
    }
    if (pData) {
      var avatar = document.getElementById('topbarAvatar');
      if (avatar) {
        if (pData.profilePhoto) { avatar.innerHTML = '<img src="' + pData.profilePhoto + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />'; }
        else { avatar.innerHTML = (freshU ? freshU.name : 'S').charAt(0).toUpperCase(); avatar.style.cssText = 'width:36px;height:36px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem;cursor:pointer;'; }
      }
      var pAvatar = document.getElementById('profileAvatar');
      if (pAvatar) {
        if (pData.profilePhoto) { pAvatar.innerHTML = '<img src="' + pData.profilePhoto + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />'; }
        else { pAvatar.innerHTML = (freshU ? freshU.name : 'S').charAt(0).toUpperCase(); pAvatar.style.cssText = 'width:80px;height:80px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:2rem;'; }
      }
      var skillsContainer = document.getElementById('profileSkills');
      if (skillsContainer && pData.skills && pData.skills.length > 0) {
        skillsContainer.innerHTML = pData.skills.map(function(s){ return '<span class="badge-item" style="padding:6px 14px;border-radius:50px;display:inline-flex;">' + esc(s) + '</span>'; }).join('');
      }
    } else {
      /* No profile data - show initial letter */
      var avatar = document.getElementById('topbarAvatar');
      if (avatar) { avatar.innerHTML = (freshU ? freshU.name : 'S').charAt(0).toUpperCase(); avatar.style.cssText = 'width:36px;height:36px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem;cursor:pointer;'; }
    }
  }
  syncProfile();

  /* ===== COURSE GROUPS ===== */
  var currentGroupId = null;

  function initCourseGroups() {
    var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
    var userEmail = userData ? userData.email : '';
    var enrolled = getEnrolledIds();

    enrolled.forEach(function(cid){
      if (!groups[cid]) {
        var c = coursesData.find(function(x){ return x.courseId === cid; });
        if (c) groups[cid] = { courseId: cid, courseName: c.name, category: c.category, members: [userEmail], messages: [], notes: [] };
      } else {
        if (groups[cid].members.indexOf(userEmail) === -1) groups[cid].members.push(userEmail);
      }
    });
    localStorage.setItem('sv-course-groups', JSON.stringify(groups));
    renderCourseGroups();
  }

  function renderCourseGroups() {
    var container = document.getElementById('courseGroupsContainer');
    if (!container) return;
    var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
    var userEmail = userData ? userData.email : '';
    var enrolled = getEnrolledIds();

    var myGroups = enrolled.map(function(cid){ return groups[cid]; }).filter(Boolean);

    if (myGroups.length === 0) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:60px 20px;"><div style="font-size:3rem;margin-bottom:16px;">&#128101;</div><h3>No Course Groups</h3><p>You haven\'t enrolled in any courses yet. Update your profile to add courses.</p></div>';
      return;
    }

    container.innerHTML = myGroups.map(function(g){
      var msgCount = (g.messages || []).length;
      var noteCount = (g.notes || []).length;
      var memberCount = (g.members || []).length;
      return '<div class="card group-card" data-cid="' + g.courseId + '" style="cursor:pointer;">' +
        '<div style="width:48px;height:48px;border-radius:12px;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:white;font-weight:700;margin-bottom:12px;">' + g.courseName.charAt(0) + '</div>' +
        '<h3>' + esc(g.courseName) + '</h3>' +
        '<div class="group-meta">' + esc(g.category) + ' &bull; ' + memberCount + ' members</div>' +
        '<div style="display:flex;gap:12px;margin:8px 0;font-size:0.8rem;color:var(--text-muted);">' +
          '<span>&#128172; ' + msgCount + ' messages</span>' +
          '<span>&#128196; ' + noteCount + ' notes</span>' +
        '</div>' +
        '<button class="btn btn-primary btn-sm open-group-btn" data-cid="' + g.courseId + '">Open Group</button>' +
      '</div>';
    }).join('');
  }

  function openGroup(courseId) {
    currentGroupId = courseId;
    var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
    var g = groups[courseId];
    if (!g) return;

    document.getElementById('groupDetailTitle').textContent = g.courseName;
    document.getElementById('groupDetailMeta').textContent = g.category + ' &bull; ' + (g.members||[]).length + ' members';
    showPage('group-detail');
    renderGroupChat();
    renderGroupNotes();
    renderGroupMembers();
  }

  document.addEventListener('click', function(e){
    var openBtn = e.target.closest('.open-group-btn');
    if (openBtn) { openGroup(openBtn.dataset.cid); return; }
    var detailBtn = e.target.closest('.detail-course-btn');
    if (detailBtn) { showCourseDetail(detailBtn.dataset.cid); return; }
  });

  function showCourseDetail(courseId) {
    var course = coursesData.find(function(c){ return c.courseId === courseId; });
    if (!course) return;
    var enrolled = getEnrolledIds();
    var isEnrolled = enrolled.indexOf(courseId) > -1;
    document.getElementById('detailModalTitle').textContent = course.name;
    document.getElementById('courseDetailBody').innerHTML =
      '<div style="margin-bottom:20px;">' +
        '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">' + course.courseId + ' &middot; ' + course.category + '</div>' +
        '<p style="color:var(--text);line-height:1.6;margin-bottom:16px;">' + esc(course.description) + '</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">' +
          course.skills.map(function(s){ return '<span style="background:var(--bg-alt);color:var(--text);padding:4px 12px;border-radius:20px;font-size:0.78rem;border:1px solid var(--border);">' + esc(s) + '</span>'; }).join('') +
        '</div>' +
        (isEnrolled ? '<div style="background:rgba(5,118,66,0.08);color:var(--success);padding:10px 14px;border-radius:var(--radius);font-size:0.85rem;font-weight:600;border:1px solid rgba(5,118,66,0.2);"><i class="fas fa-check-circle"></i> You are enrolled in this course</div>' : '') +
      '</div>';
    document.getElementById('courseDetailModal').classList.add('open');
  }

  document.getElementById('closeCourseDetail').addEventListener('click', function(){
    document.getElementById('courseDetailModal').classList.remove('open');
  });
  document.getElementById('courseDetailModal').addEventListener('click', function(e){
    if (e.target === this) this.classList.remove('open');
  });

  var backBtn = document.getElementById('backToGroups');
  if (backBtn) backBtn.addEventListener('click', function(){ showPage('course-groups'); });

  /* Group Tabs */
  document.querySelectorAll('[data-gtab]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var tab = this.dataset.gtab;
      document.querySelectorAll('[data-gtab]').forEach(function(b){ b.className = b.className.replace('btn-primary','btn-outline'); b.className = b.className.trim(); });
      this.className = 'btn btn-primary btn-sm';
      ['groupChatTab','groupNotesTab','groupMembersTab'].forEach(function(id){
        document.getElementById(id).style.display = id === 'groupChatTab' && tab === 'chat' || id === 'groupNotesTab' && tab === 'notes' || id === 'groupMembersTab' && tab === 'members' ? '' : 'none';
      });
    });
  });

  /* Group Chat */
  function renderGroupChat() {
    var container = document.getElementById('groupChatMessages');
    if (!container || !currentGroupId) return;
    var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
    var g = groups[currentGroupId];
    if (!g) return;
    var msgs = g.messages || [];
    if (msgs.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><div style="font-size:2.5rem;margin-bottom:8px;">&#128172;</div><p>No messages yet. Start the conversation!</p></div>';
      return;
    }
    var userEmail = userData ? userData.email : '';
    container.innerHTML = msgs.map(function(m){
      var isMe = m.sender === userEmail;
      var name = isMe ? 'You' : (m.senderName || m.sender.split('@')[0]);
      return '<div style="display:flex;flex-direction:column;align-items:' + (isMe ? 'flex-end' : 'flex-start') + ';">' +
        '<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px;">' + esc(name) + '</div>' +
        '<div style="max-width:75%;padding:8px 14px;border-radius:16px;background:' + (isMe ? 'var(--gradient)' : 'var(--card-hover)') + ';color:' + (isMe ? 'white' : 'var(--text)') + ';font-size:0.9rem;">' + esc(m.text) + '</div>' +
        '<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">' + (m.time || '') + '</div>' +
      '</div>';
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  var chatInput = document.getElementById('groupChatInput');
  var chatSend = document.getElementById('groupChatSend');
  function sendMessage() {
    if (!chatInput || !currentGroupId) return;
    var text = chatInput.value.trim();
    if (!text) return;
    var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
    var g = groups[currentGroupId];
    if (!g) return;
    if (!g.messages) g.messages = [];
    g.messages.push({
      sender: userData ? userData.email : 'anonymous',
      senderName: userData ? userData.name : 'Anonymous',
      text: text,
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    });
    groups[currentGroupId] = g;
    localStorage.setItem('sv-course-groups', JSON.stringify(groups));
    chatInput.value = '';
    renderGroupChat();
    renderCourseGroups();
    var courseName = g.courseName || currentGroupId;
    addNotif('New Message', 'New message in ' + courseName + ' group chat', '&#128172;', 'groups');
  }
  if (chatSend) chatSend.addEventListener('click', sendMessage);
  if (chatInput) chatInput.addEventListener('keypress', function(e){ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  /* Group Notes */
  function renderGroupNotes() {
    var container = document.getElementById('groupNotesList');
    if (!container || !currentGroupId) return;
    var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
    var g = groups[currentGroupId];
    if (!g) return;
    var notes = g.notes || [];
    if (notes.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:8px;">&#128196;</div><p>No notes shared yet. Click "Add Note" to upload one.</p></div>';
      return;
    }
    container.innerHTML = notes.map(function(n, i){
      return '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:var(--radius);background:var(--card-hover);">' +
        '<div style="font-size:1.5rem;">&#128196;</div>' +
        '<div style="flex:1;"><strong>' + esc(n.title || 'Untitled') + '</strong><div style="font-size:0.8rem;color:var(--text-muted);">' + (n.uploadedBy || 'Unknown') + ' &bull; ' + (n.date || '') + '</div></div>' +
        '<button class="btn btn-outline btn-sm download-group-note" data-idx="' + i + '" style="padding:6px 12px;">&#128229; Download</button>' +
      '</div>';
    }).join('');
  }

  document.addEventListener('click', function(e){
    var dlBtn = e.target.closest('.download-group-note');
    if (dlBtn && currentGroupId) {
      var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
      var g = groups[currentGroupId];
      if (g && g.notes) {
        var idx = parseInt(dlBtn.dataset.idx);
        var note = g.notes[idx];
        if (note && note.content) {
          var a = document.createElement('a');
          a.href = note.content;
          a.download = note.title || 'note.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          addNotif('Note Downloaded', '"' + (note.title || 'Untitled') + '" has been downloaded.', '&#128229;', 'notes');
        }
      }
      return;
    }
  });

  var uploadBtn = document.getElementById('btnUploadGroupNote');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', function(){
      var title = prompt('Enter note title:');
      if (!title) return;
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.pdf,.doc,.docx,.png,.jpg,.jpeg';
      input.onchange = function(e){
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev){
          var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
          var g = groups[currentGroupId];
          if (!g) return;
          if (!g.notes) g.notes = [];
          g.notes.push({
            title: title,
            fileName: file.name,
            content: ev.target.result,
            uploadedBy: userData ? userData.name : 'Unknown',
            date: new Date().toLocaleDateString()
          });
          groups[currentGroupId] = g;
          localStorage.setItem('sv-course-groups', JSON.stringify(groups));
          renderGroupNotes();
          renderCourseGroups();
          renderHubNotes();
          updateHomeStats();
          var courseName = g.courseName || currentGroupId;
          addNotif('Note Shared', '"' + title + '" uploaded in ' + courseName, '&#128196;', 'notes');
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }

  /* Group Members */
  function renderGroupMembers() {
    var container = document.getElementById('groupMembersList');
    if (!container || !currentGroupId) return;
    var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
    var g = groups[currentGroupId];
    if (!g) return;
    var members = g.members || [];
    if (members.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);">No members yet.</p>';
      return;
    }
    container.innerHTML = members.map(function(email){
      var name = email.split('@')[0].replace(/[^a-zA-Z]/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();}).trim() || email;
      var isYou = email === (userData ? userData.email : '');
      return '<div style="display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:var(--radius);background:var(--card-hover);">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:0.9rem;">' + name.charAt(0) + '</div>' +
        '<div style="flex:1;"><strong>' + esc(name) + '</strong>' + (isYou ? ' <span style="font-size:0.75rem;color:var(--accent);">(You)</span>' : '') + '</div>' +
      '</div>';
    }).join('');
  }

  /* Notes Hub - show all notes from all groups */
  function renderHubNotes() {
    var container = document.getElementById('hubNotesContainer');
    if (!container) return;
    var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
    var enrolled = getEnrolledIds();
    var allNotes = [];
    enrolled.forEach(function(cid){
      var g = groups[cid];
      if (g && g.notes) {
        g.notes.forEach(function(n){
          allNotes.push({ courseName: g.courseName, courseId: cid, title: n.title, fileName: n.fileName, content: n.content, uploadedBy: n.uploadedBy, date: n.date });
        });
      }
    });
    if (allNotes.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:8px;">&#128196;</div><p>Notes shared in your course groups will appear here.</p></div>';
      return;
    }
    container.innerHTML = allNotes.map(function(n, i){
      return '<div class="resource-item">' +
        '<div class="resource-icon" style="background:rgba(10,102,194,0.1);color:var(--primary);">&#128196;</div>' +
        '<div class="resource-info">' +
          '<h4>' + esc(n.title) + '</h4>' +
          '<p>' + esc(n.courseName) + ' &bull; ' + esc(n.uploadedBy || 'Unknown') + ' &bull; ' + (n.date || '') + '</p>' +
        '</div>' +
        '<div class="resource-actions">' +
          '<button class="btn btn-outline btn-sm hub-download-note" data-hub-idx="' + i + '" style="padding:6px 12px;">&#128229; Download</button>' +
        '</div>' +
      '</div>';
    }).join('');
    /* Store ref for download */
    window.__hubNotes = allNotes;
  }

  document.addEventListener('click', function(e){
    var hubBtn = e.target.closest('.hub-download-note');
    if (hubBtn && window.__hubNotes) {
      var idx = parseInt(hubBtn.dataset.hubIdx);
      var note = window.__hubNotes[idx];
      if (note && note.content) {
        var a = document.createElement('a');
        a.href = note.content;
        a.download = note.title || 'note.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addNotif('Note Downloaded', '"' + (note.title || 'Untitled') + '" has been downloaded.', '&#128229;', 'notes');
      }
      return;
    }
  });

  renderHubNotes();

  initCourseGroups();

  const notesSearch = document.getElementById('notesSearch');
  if (notesSearch) {
    notesSearch.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      document.querySelectorAll('.resource-item').forEach(item => {
        const title = item.querySelector('h4')?.textContent?.toLowerCase() || '';
        item.style.display = title.includes(query) ? '' : 'none';
      });
    });
  }

  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        const query = this.value.trim().toLowerCase();
        if (query.includes('group')) showPage('course-groups');
        else if (query.includes('course')) showPage('my-courses');
        else if (query.includes('assignment')) showPage('assignments');
        else if (query.includes('quiz')) showPage('quizzes');
        else if (query.includes('note') || query.includes('notes')) showPage('notes');
        else if (query.includes('gpa') || query.includes('cgpa')) showPage('gpa');
        else if (query.includes('ai') || query.includes('assistant')) showPage('ai-assistant');
        else if (query.includes('calendar')) showPage('calendar');
        else if (query.includes('profile')) showPage('profile');
        else if (query.includes('setting')) showPage('settings');
        else showPage('dashboard-home');
      }
    });
  }

  /* ===== NOTIFICATION SYSTEM ===== */
  var NOTIF_KEY = 'sv-notifications';

  function getNotifs() {
    try {
      var list = JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];
      list.forEach(function(n){
        if (!n.page) n.page = 'general';
        if (n.read === undefined) n.read = true;
      });
      return list;
    } catch(e) { return []; }
  }
  function saveNotifs(n) { localStorage.setItem(NOTIF_KEY, JSON.stringify(n)); }

  function addNotif(title, text, icon, page) {
    var notifs = getNotifs();
    notifs.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      title: title,
      text: text,
      icon: icon || '<i class="fas fa-bell"></i>',
      page: page || 'general',
      time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      read: false
    });
    saveNotifs(notifs);
    renderNotifs();
    updateNotifBadge();
    showToast(title);
  }

  function renderNotifs(filter) {
    var container = document.getElementById('notificationsList');
    if (!container) return;
    var notifs = getNotifs();
    var activeBtn = document.querySelector('.notif-filter-btn.active');
    var activeFilter = filter || (activeBtn ? activeBtn.dataset.filter : 'all');

    var filtered = activeFilter === 'all' ? notifs : notifs.filter(function(n){ return n.page === activeFilter; });

    var tabs = document.querySelectorAll('.notif-filter-btn');
    tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.filter === activeFilter); });

    if (filtered.length === 0) {
      container.innerHTML = '<div class="notif-empty-state" style="text-align:center;padding:60px 20px;"><i class="fas fa-bell" style="font-size:3rem;margin-bottom:16px;display:block;color:var(--text-muted);"></i><h3>No Notifications</h3><p style="color:var(--text-muted);">' + (activeFilter !== 'all' ? 'No notifications in this category.' : 'Notifications about assignments, deadlines, and group activity will appear here.') + '</p></div>';
      return;
    }
    container.innerHTML = filtered.map(function(n){
      var pageIcon = n.page === 'assignments' ? '<i class="fas fa-tasks"></i>' : n.page === 'quiz' ? '<i class="fas fa-question-circle"></i>' : n.page === 'groups' ? '<i class="fas fa-users"></i>' : n.page === 'notes' ? '<i class="fas fa-sticky-note"></i>' : n.icon || '<i class="fas fa-bell"></i>';
      return '<div class="notification-item' + (!n.read ? ' unread' : '') + '" data-id="' + n.id + '">' +
        '<div class="notif-icon" style="background:rgba(15,118,110,0.08);color:var(--primary);font-size:1.3rem;">' + pageIcon + '</div>' +
        '<div class="notif-content">' +
          '<h4>' + esc(n.title) + '</h4>' +
          '<p>' + esc(n.text) + '</p>' +
          '<div class="notif-time">' + esc(n.time) + '</div>' +
        '</div>' +
        '<button class="notif-close" data-id="' + n.id + '" title="Dismiss"><i class="fas fa-times"></i></button>' +
      '</div>';
    }).join('');
  }

  function updateNotifBadge() {
    var notifs = getNotifs();
    var unread = notifs.filter(function(n){ return !n.read; }).length;
    var badge = document.getElementById('notifBadge');
    if (badge) {
      if (unread > 0) { badge.textContent = unread; badge.style.display = ''; }
      else badge.style.display = 'none';
    }
  }

  function removeNotif(id) {
    var notifs = getNotifs().filter(function(n){ return n.id !== id; });
    saveNotifs(notifs);
    renderNotifs();
    updateNotifBadge();
  }

  function showToast(msg, icon) {
    var container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:380px;width:100%;';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = 'pointer-events:auto;display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 4px 20px rgba(0,0,0,0.15);animation:slideIn 0.35s ease;';
    toast.innerHTML = '<span style="font-size:1.2rem;flex-shrink:0;">' + (icon || '<i class="fas fa-bell"></i>') + '</span>' +
      '<div style="flex:1;min-width:0;"><strong style="font-size:0.82rem;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(msg) + '</strong></div>' +
      '<button class="toast-close" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;padding:2px;flex-shrink:0;line-height:1;">&times;</button>';
    toast.querySelector('.toast-close').addEventListener('click', function(){ toast.remove(); });
    container.appendChild(toast);
    setTimeout(function(){ if (toast.parentNode) { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all 0.3s ease'; setTimeout(function(){ toast.remove(); }, 300); } }, 4000);
  }

  /* Inject toast animation */
  var style = document.createElement('style');
  style.textContent = '@keyframes slideIn { from { transform:translateX(100%);opacity:0; } to { transform:translateX(0);opacity:1; } }';
  document.head.appendChild(style);

  /* Notification filter tabs */
  document.addEventListener('click', function(e){
    var filterBtn = e.target.closest('.notif-filter-btn');
    if (filterBtn) {
      renderNotifs(filterBtn.dataset.filter);
      return;
    }
    var markBtn = e.target.closest('#markAllRead');
    if (markBtn) {
      var notifs = getNotifs();
      notifs.forEach(function(n){ n.read = true; });
      saveNotifs(notifs);
      updateNotifBadge();
      renderNotifs();
      showToast('All notifications marked as read', '<i class="fas fa-check-circle"></i>');
      return;
    }
    var clearBtn = e.target.closest('#clearAllNotifs');
    if (clearBtn) {
      saveNotifs([]);
      updateNotifBadge();
      renderNotifs();
      showToast('All notifications cleared', '<i class="fas fa-trash-alt"></i>');
      return;
    }
    /* Click close button to remove notification */
    var closeBtn = e.target.closest('.notif-close');
    if (closeBtn) {
      e.stopPropagation();
      removeNotif(closeBtn.dataset.id);
      return;
    }
    /* Click notification to mark read */
    var item = e.target.closest('.notification-item.unread');
    if (item) {
      var id = item.dataset.id;
      var notifs = getNotifs();
      notifs.forEach(function(n){ if (n.id === id) n.read = true; });
      saveNotifs(notifs);
      item.classList.remove('unread');
      updateNotifBadge();
    }
  });

  renderNotifs();
  updateNotifBadge();

  /* ===== HOME STATS ===== */
  function getLatestUserData() {
    try { return JSON.parse(localStorage.getItem('sv-user')) || null; } catch(e) { return null; }
  }

  function updateHomeStats() {
    var freshUserData = getLatestUserData();
    var enrolledRaw = freshUserData ? (freshUserData.enrolledCourses || []) : [];
    var enrolledCount = enrolledRaw.length;
    var el = document.getElementById('activeCourses');
    if (el) el.textContent = enrolledCount || '0';

    var assignments = getAssignments();
    var pending = assignments.filter(function(a){ return a.status === 'pending' || a.status === 'overdue'; }).length;
    var pendingEl = document.getElementById('pendingAssignments');
    if (pendingEl) pendingEl.textContent = pending;

    /* Total assignments count */
    var totalAssign = assignments.length;
    var navBadge = document.getElementById('assignNavBadge');
    if (navBadge) {
      if (totalAssign > 0) { navBadge.textContent = totalAssign; navBadge.style.display = ''; }
      else navBadge.style.display = 'none';
    }

    /* Quizzes - check localStorage for upcoming/active quizzes */
    var allQuizzes = [];
    try { allQuizzes = JSON.parse(localStorage.getItem('sv-quizzes')) || []; } catch(e) {}
    var upcomingCount = allQuizzes.filter(function(q){ return q.status === 'upcoming' || q.status === 'active'; }).length;
    var upcomingQuizEl = document.getElementById('upcomingQuizzes');
    if (upcomingQuizEl) upcomingQuizEl.textContent = upcomingCount > 0 ? upcomingCount : '—';

    /* Current GPA - try to get from user data or profile */
    var currentGpa = '—';
    if (freshUserData && freshUserData.gpa) {
      currentGpa = freshUserData.gpa;
    } else {
      try {
        var pData = JSON.parse(localStorage.getItem('sv-profile-data'));
        if (pData && pData.gpa) currentGpa = pData.gpa;
      } catch(e) {}
    }
    var gpaEl = document.getElementById('currentGpa');
    if (gpaEl) gpaEl.textContent = currentGpa;

    /* Profile stats */
    var pc = document.getElementById('profileCourseCount');
    if (pc) pc.textContent = enrolledCount;
    var profileGpaEl = document.getElementById('profileGpa');
    if (profileGpaEl) profileGpaEl.textContent = currentGpa;
    var pnEl = document.getElementById('profileNotesCount');
    if (pnEl) {
      var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
      var totalNotes = 0;
      var enrolledIds = getEnrolledIds();
      enrolledIds.forEach(function(cid){
        if (groups[cid] && groups[cid].notes) totalNotes += groups[cid].notes.length;
      });
      pnEl.textContent = totalNotes;
    }

    var sidEl = document.getElementById('profileStudentId');
    if (sidEl && freshUserData) sidEl.textContent = 'Student ID: ' + (freshUserData.studentId || '—');
    var pdEl = document.getElementById('profileDetail');
    if (pdEl && freshUserData) pdEl.textContent = (freshUserData.department || '') + (freshUserData.semester ? ' &bull; ' + freshUserData.semester : '');

    /* Update welcome subtext */
    var welcomeP = document.querySelector('.welcome-section p');
    if (welcomeP) {
      welcomeP.textContent = 'You are enrolled in ' + enrolledCount + ' course' + (enrolledCount !== 1 ? 's' : '') + ' with ' + pending + ' pending assignment' + (pending !== 1 ? 's' : '') + '.';
    }

    /* Sync streak from settings storage */
    var streakEl = document.getElementById('streakCount');
    if (streakEl) {
      var streak = parseInt(localStorage.getItem('sv-streak') || '0', 10);
      streakEl.textContent = streak;
    }
  }

  function getCourseName(courseId) {
    var c = coursesData.find(function(x){ return x.courseId === courseId; });
    return c ? c.name : courseId;
  }

  function renderDashboardQuizzes() {
    var container = document.getElementById('quizContainer');
    if (!container) return;
    var allQuizzes = [];
    try { allQuizzes = JSON.parse(localStorage.getItem('sv-quizzes')) || []; } catch(e) {}
    var userEmail = userData ? userData.email : '';
    var filtered = allQuizzes.filter(function(q){ return q.status === 'upcoming' || q.status === 'active'; }).slice(0, 6);
    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;"><div style="font-size:3rem;margin-bottom:16px;">&#128221;</div><h3>No Quizzes Yet</h3><p style="color:var(--text-muted);">Quizzes will appear here once they are created on the Quiz Center page.</p></div>';
      return;
    }
    container.innerHTML = filtered.map(function(q) {
      var badge = q.status === 'active' ? '<span style="background:rgba(5,118,66,0.1);color:var(--accent);padding:2px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;">Active</span>' : '<span style="background:rgba(10,102,194,0.1);color:var(--primary);padding:2px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;">Upcoming</span>';
      return '<div class="card" style="padding:16px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">' +
          '<h4 style="margin:0;">' + esc(q.title) + '</h4>' + badge +
        '</div>' +
        '<div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:4px;"><i class="fas fa-book"></i> ' + esc(getCourseName(q.courseId) || q.courseId) + '</div>' +
        (q.scheduledDate ? '<div style="font-size:0.82rem;color:var(--text-muted);"><i class="far fa-calendar-alt"></i> ' + q.scheduledDate + (q.scheduledTime ? ' ' + q.scheduledTime : '') + ' (' + (q.duration || 10) + ' min)</div>' : '') +
        '<div style="margin-top:10px;"><span style="font-size:0.85rem;color:var(--text-muted);">' + (q.questions ? q.questions.length : 0) + ' questions</span></div>' +
      '</div>';
    }).join('');
  }

  buildCharts();
  updateHomeStats();
  renderDashboardQuizzes();

  /* Listen for storage changes from other tabs/pages */
  window.addEventListener('storage', function(e) {
    if (e.key && e.key.indexOf('sv-') === 0) {
      buildCharts();
      updateHomeStats();
      renderDashboardQuizzes();
      renderAssignments();
      loadCalendarEvents();
      renderCalendar();
    }
  });

  /* Also re-sync when page becomes visible (user returns from another page) */
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      syncProfile();
      buildCharts();
      updateHomeStats();
      renderDashboardQuizzes();
      renderAssignments();
      renderCourseGroups();
      renderHubNotes();
      loadCalendarEvents();
      renderCalendar();
    }
  });

  /* ===== ASSIGNMENTS ===== */
  var ASSIGN_KEY = 'sv-assignments';
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function formatDate(d) { if (!d) return ''; var parts = d.split('-'); var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return months[parseInt(parts[1])-1] + ' ' + parseInt(parts[2]) + ', ' + parts[0]; }
  function getAssignments() { try { return JSON.parse(localStorage.getItem(ASSIGN_KEY)) || []; } catch(e) { return []; } }
  function saveAssignments(a) { localStorage.setItem(ASSIGN_KEY, JSON.stringify(a)); }
  function getStatusClass(s) { return s === 'completed' ? 'completed' : s === 'in-progress' ? 'in-progress' : s === 'overdue' ? 'overdue' : 'pending'; }
  function nextStatus(s) { if (s === 'pending') return 'in-progress'; if (s === 'in-progress') return 'completed'; return 'pending'; }
  function nextStatusLabel(s) { if (s === 'pending') return 'In Progress'; if (s === 'in-progress') return 'Completed'; return 'Pending'; }

  function renderAssignments() {
    var items = getAssignments();
    var body = document.getElementById('assignBody');
    var empty = document.getElementById('assignEmpty');
    var wrap = document.getElementById('assignTableWrap');
    var stats = document.getElementById('assignStats');
    if (!body) return;

    var navBadge = document.getElementById('assignNavBadge');
    if (navBadge) {
      if (items.length > 0) { navBadge.textContent = items.length; navBadge.style.display = ''; }
      else navBadge.style.display = 'none';
    }

    if (items.length === 0) {
      body.innerHTML = '';
      empty.style.display = 'block';
      wrap.style.display = 'none';
      stats.innerHTML = '';
      return;
    }
    empty.style.display = 'none';
    wrap.style.display = '';
    body.innerHTML = items.map(function(a){
      var statusClass = getStatusClass(a.status);
      return '<tr>' +
        '<td>' + esc(a.title) + '</td>' +
        '<td>' + esc(a.course || '-') + '</td>' +
        '<td>' + formatDate(a.dueDate) + '</td>' +
        '<td><span class="status-badge ' + statusClass + '">' + esc(a.status.replace('-',' ').replace(/\b\w/g,function(c){return c.toUpperCase()})) + '</span></td>' +
        '<td><span class="priority-badge ' + (a.priority||'medium') + '">' + esc((a.priority||'medium').replace(/\b\w/g,function(c){return c.toUpperCase()})) + '</span></td>' +
        '<td><div class="table-actions">' +
        '<button class="btn-assign-edit" data-id="' + a.id + '">&#9998; Edit</button>' +
        '<button class="btn-assign-status" data-id="' + a.id + '">&#10003; ' + nextStatusLabel(a.status) + '</button>' +
        '<button class="btn-assign-delete" data-id="' + a.id + '">&#128465; Del</button>' +
        '</div></td></tr>';
    }).join('');

    var total = items.length;
    var completed = items.filter(function(a){ return a.status === 'completed'; }).length;
    var progress = items.filter(function(a){ return a.status === 'in-progress'; }).length;
    var pending = items.filter(function(a){ return a.status === 'pending' || a.status === 'overdue'; }).length;
    stats.innerHTML =
      '<div class="card"><h3 style="color:var(--primary)">' + total + '</h3><p>Total</p></div>' +
      '<div class="card"><h3 style="color:var(--accent)">' + completed + '</h3><p>Completed</p></div>' +
      '<div class="card"><h3 style="color:var(--primary)">' + progress + '</h3><p>In Progress</p></div>' +
      '<div class="card"><h3 style="color:#CC1016">' + pending + '</h3><p>Pending</p></div>';
  }

  function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function setupAssignments() {
    var addBtn = document.getElementById('btnAddAssignment');
    var addFirstBtn = document.getElementById('btnAddFirstAssign');
    var modal = document.getElementById('assignModal');
    var form = document.getElementById('formAssign');
    var titleInput = document.getElementById('assignTitle');
    var courseInput = document.getElementById('assignCourse');
    var dueInput = document.getElementById('assignDue');
    var priorityInput = document.getElementById('assignPriority');
    var editIdInput = document.getElementById('assignEditId');
    var modalTitle = document.getElementById('assignModalTitle');

    function openModal(editData) {
      if (editData) {
        modalTitle.textContent = 'Edit Assignment';
        editIdInput.value = editData.id;
        titleInput.value = editData.title || '';
        courseInput.value = editData.course || '';
        dueInput.value = editData.dueDate || '';
        priorityInput.value = editData.priority || 'medium';
      } else {
        modalTitle.textContent = 'Add Assignment';
        editIdInput.value = '';
        form.reset();
        priorityInput.value = 'medium';
      }
      modal.classList.add('open');
    }

    function closeModal() { modal.classList.remove('open'); }

    function addAssignment(data) {
      var items = getAssignments();
      data.id = uid();
      data.status = 'pending';
      items.push(data);
      saveAssignments(items);
      renderAssignments();
      buildCharts();
      updateHomeStats();
      loadCalendarEvents();
      renderCalendar();
      addNotif('New Assignment Added', '"' + data.title + '" has been added' + (data.course ? ' for ' + data.course : '') + '.', '&#128221;', 'assignments');
    }

    function updateAssignment(id, data) {
      var items = getAssignments();
      var idx = items.findIndex(function(a){ return a.id === id; });
      if (idx > -1) {
        var old = items[idx];
        items[idx] = Object.assign({}, items[idx], data);
        saveAssignments(items);
        renderAssignments();
        buildCharts();
        updateHomeStats();
        loadCalendarEvents();
        renderCalendar();
        addNotif('Assignment Updated', '"' + (data.title || old.title) + '" has been updated.', '&#128221;', 'assignments');
      }
    }

    function deleteAssignment(id) {
      var items = getAssignments();
      var deleted = items.find(function(a){ return a.id === id; });
      items = items.filter(function(a){ return a.id !== id; });
      saveAssignments(items);
      renderAssignments();
      buildCharts();
      updateHomeStats();
      loadCalendarEvents();
      renderCalendar();
      if (deleted) addNotif('Assignment Deleted', '"' + deleted.title + '" has been removed.', '&#128465;', 'assignments');
    }

    function toggleStatus(id) {
      var items = getAssignments();
      var idx = items.findIndex(function(a){ return a.id === id; });
      if (idx > -1) {
        items[idx].status = nextStatus(items[idx].status);
        saveAssignments(items);
        renderAssignments();
        buildCharts();
        updateHomeStats();
        loadCalendarEvents();
        renderCalendar();
        addNotif('Status Changed', '"' + items[idx].title + '" is now ' + items[idx].status + '.', '&#128204;', 'assignments');
      }
    }

    if (addBtn) addBtn.addEventListener('click', function(){ openModal(null); });
    if (addFirstBtn) addFirstBtn.addEventListener('click', function(){ openModal(null); });

    if (form) {
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var title = titleInput.value.trim();
        if (!title) return;
        var data = {
          title: title,
          course: courseInput.value.trim(),
          dueDate: dueInput.value,
          priority: priorityInput.value
        };
        var editId = editIdInput.value;
        if (editId) updateAssignment(editId, data);
        else addAssignment(data);
        closeModal();
      });
    }

    document.querySelectorAll('.modal-close').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = this.dataset.modal;
        if (id === 'assignModal') closeModal();
      });
    });
    var cancelBtn = document.getElementById('btnCancelAssign');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', function(e){
        if (e.target === this) closeModal();
      });
    }

    document.addEventListener('click', function(e){
      var editBtn = e.target.closest('.btn-assign-edit');
      var statusBtn = e.target.closest('.btn-assign-status');
      var deleteBtn = e.target.closest('.btn-assign-delete');

      if (editBtn) {
        var id = editBtn.dataset.id;
        var items = getAssignments();
        var item = items.find(function(a){ return a.id === id; });
        if (item) openModal(item);
        return;
      }
      if (statusBtn) {
        toggleStatus(statusBtn.dataset.id);
        return;
      }
      if (deleteBtn) {
        if (confirm('Delete this assignment?')) deleteAssignment(deleteBtn.dataset.id);
        return;
      }
    });
  }

  renderAssignments();
  setupAssignments();
})();
