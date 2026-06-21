(function() {

  function getNotifs() {
    try { return JSON.parse(localStorage.getItem('sv-notifications')) || []; } catch(e) { return []; }
  }
  function saveNotifs(n) { localStorage.setItem('sv-notifications', JSON.stringify(n)); }
  function addNotif(title, text, icon, page) {
    var notifs = getNotifs();
    notifs.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      title: title,
      text: text,
      icon: icon || '&#128276;',
      page: page || 'general',
      time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      read: false
    });
    saveNotifs(notifs);
  }

  const savedTheme = localStorage.getItem('sv-theme') || 'light';
  const html = document.documentElement;
  html.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'dark') html.setAttribute('data-theme', 'dark');

  const savedPreset = localStorage.getItem('sv-preset') || 'default';
  if (savedPreset !== 'default') html.classList.add('color-preset-' + savedPreset);

  document.querySelectorAll('[data-theme]').forEach(el => {
    if (el.getAttribute('data-theme') === savedTheme) el.classList.add('active');
  });

  const userData = JSON.parse(localStorage.getItem('sv-user')) || {};

  function loadAccountData() {
    const fields = {
      sFullName: 'name', sUsername: 'username', sStudentId: 'studentId',
      sEmail: 'email', sPhone: 'phone', sUniversity: 'university',
      sDepartment: 'department', sSemester: 'semester', sBio: 'bio'
    };
    Object.entries(fields).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el && userData[key]) el.value = userData[key];
    });
  }
  loadAccountData();

  const sidebarLinks = document.querySelectorAll('.settings-nav a');
  const sections = document.querySelectorAll('.settings-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('href').replace('#', '');
      sidebarLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      sections.forEach(s => s.classList.remove('active'));
      const section = document.getElementById('section-' + target);
      if (section) section.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      this.classList.toggle('active');
      const key = this.id || 'toggle-' + Math.random();
      const state = this.classList.contains('active');
      localStorage.setItem('sv-' + key, state ? 'true' : 'false');

      if (this.id === 'animToggle') {
        document.querySelectorAll('.fade-in, .note-card, .settings-section').forEach(el => {
          el.style.animation = state ? '' : 'none';
        });
      }
      if (this.id === 'compactToggle') {
        document.body.classList.toggle('compact', state);
      }
      if (this.id === 'highContrastToggle') {
        document.body.classList.toggle('high-contrast', state);
      }
      if (this.id === 'dyslexiaToggle') {
        document.body.classList.toggle('dyslexia-font', state);
      }
      if (this.id === 'reducedMotionToggle') {
        document.body.classList.toggle('reduced-motion', state);
      }
      if (this.id === 'largeTextToggle') {
        document.body.classList.toggle('large-text', state);
      }
    });
  });

  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const theme = this.dataset.theme;
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', systemDark ? 'dark' : 'light');
        localStorage.setItem('sv-theme', 'light');
      } else {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('sv-theme', theme);
      }
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      } else {
      }
    });
  });

  document.querySelectorAll('.color-preset').forEach(preset => {
    preset.addEventListener('click', function() {
      document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const presetName = this.dataset.preset;
      document.querySelectorAll('[class*="color-preset-"]').forEach(el => {
        el.className = el.className.replace(/color-preset-\w+/g, '').trim();
      });
      if (presetName !== 'default') html.classList.add('color-preset-' + presetName);
      localStorage.setItem('sv-preset', presetName);
    });
  });

  document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      localStorage.setItem('sv-notif-freq', this.dataset.freq);
    });
  });

  document.querySelectorAll('.vis-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = this.closest('.setting-row') || this.parentElement;
      parent.querySelectorAll('.vis-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  document.querySelectorAll('.personality-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.personality-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      localStorage.setItem('sv-ai-personality', this.dataset.style);
    });
  });

  const saveAccountBtn = document.getElementById('saveAccountBtn');
  if (saveAccountBtn) {
    saveAccountBtn.addEventListener('click', function() {
      const updated = {
        name: document.getElementById('sFullName').value,
        username: document.getElementById('sUsername').value,
        studentId: document.getElementById('sStudentId').value,
        email: document.getElementById('sEmail').value,
        phone: document.getElementById('sPhone').value,
        university: document.getElementById('sUniversity').value,
        department: document.getElementById('sDepartment').value,
        semester: document.getElementById('sSemester').value,
        bio: document.getElementById('sBio').value
      };
      const existing = JSON.parse(localStorage.getItem('sv-user')) || {};
      Object.assign(existing, updated);
      localStorage.setItem('sv-user', JSON.stringify(existing));
      showToast('Account settings saved successfully!', 'success');
      addNotif('Account Updated', 'Your account information has been saved.', '&#128100;', 'general');
    });
  }

  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        if (confirm('All your data will be permanently removed. Continue?')) {
          localStorage.removeItem('sv-user');
          localStorage.removeItem('sv-saved-notes');
          localStorage.removeItem('sv-theme');
          addNotif('Account Deleted', 'Your account and all data have been removed.', '&#128465;', 'general');
          showToast('Account deleted. Redirecting...', 'error');
          setTimeout(() => window.location.href = 'index.html', 1500);
        }
      }
    });
  }

  const fontSizeSelect = document.getElementById('fontSizeSelect');
  if (fontSizeSelect) {
    const savedSize = localStorage.getItem('sv-font-size') || 'medium';
    fontSizeSelect.value = savedSize;
    applyFontSize(savedSize);
    fontSizeSelect.addEventListener('change', function() {
      applyFontSize(this.value);
      localStorage.setItem('sv-font-size', this.value);
    });
  }

  function applyFontSize(size) {
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.body.style.fontSize = sizes[size] || '16px';
  }

  function showToast(message, type) {
    const existing = document.querySelector('.settings-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'settings-toast';
    toast.style.cssText = 'position:fixed;bottom:30px;right:30px;background:var(--card);color:var(--text);border-left:5px solid ' + (type === 'success' ? '#057642' : '#CC1016') + ';padding:14px 22px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:9999;font-family:Segoe UI,sans-serif;font-weight:500;display:flex;align-items:center;gap:10px;animation:fadeIn 0.3s ease;max-width:360px;';
    toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-times-circle') + '" style="color:' + (type === 'success' ? '#057642' : '#CC1016') + '"></i> ' + message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  const saveAcademicBtn = document.getElementById('saveAcademicBtn');
  if (saveAcademicBtn) {
    saveAcademicBtn.addEventListener('click', function() {
      const prefs = {
        subjects: document.getElementById('prefSubjects').value,
        learningStyle: document.getElementById('learningStyle').value,
        goals: document.getElementById('semGoals').value,
        weeklyStudy: document.getElementById('weeklyStudyGoal').value,
        gpaTarget: document.getElementById('gpaTarget').value
      };
      localStorage.setItem('sv-academic', JSON.stringify(prefs));
      showToast('Academic preferences saved!', 'success');
      addNotif('Academic Saved', 'Your academic preferences have been updated.', '&#127891;', 'general');
    });
  }

  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    const savedLang = localStorage.getItem('sv-lang') || 'en';
    langSelect.value = savedLang;
    langSelect.addEventListener('change', function() {
      localStorage.setItem('sv-lang', this.value);
      showToast('Language preference saved!', 'success');
      addNotif('Language Changed', 'Language preference set to ' + this.value.toUpperCase(), '&#127760;', 'general');
    });
  }

  const saveLangBtn = document.getElementById('saveLangBtn');
  if (saveLangBtn) {
    saveLangBtn.addEventListener('click', function() {
      const region = {
        lang: document.getElementById('langSelect').value,
        timezone: document.getElementById('timezoneSelect').value,
        dateFormat: document.getElementById('dateFormat').value,
        timeFormat: document.getElementById('timeFormat').value
      };
      localStorage.setItem('sv-region', JSON.stringify(region));
      showToast('Language & region settings saved!', 'success');
      addNotif('Region Saved', 'Language and regional settings updated.', '&#127758;', 'general');
    });
  }

  const saveProductivityBtn = document.getElementById('saveProductivityBtn');
  if (saveProductivityBtn) {
    saveProductivityBtn.addEventListener('click', function() {
      const prod = {
        pomodoro: document.getElementById('pomodoroDuration').value,
        break: document.getElementById('breakDuration').value,
        daily: document.getElementById('dailyTarget').value,
        weekly: document.getElementById('weeklyProductivityGoal').value,
        autoStart: document.getElementById('autoStartToggle')?.classList.contains('active'),
        autoBreak: document.getElementById('autoBreakToggle')?.classList.contains('active'),
        focusMusic: document.getElementById('focusMusicToggle')?.classList.contains('active')
      };
      localStorage.setItem('sv-productivity', JSON.stringify(prod));
      if (prod.pomodoro) localStorage.setItem('sv-pomodoro-duration', prod.pomodoro);
      showToast('Productivity settings saved!', 'success');
      addNotif('Productivity Saved', 'Pomodoro and study preferences updated.', '&#9200;', 'general');
    });
  }

  const saveAiBtn = document.getElementById('saveAiBtn');
  if (saveAiBtn) {
    saveAiBtn.addEventListener('click', function() {
      const personality = document.querySelector('.personality-btn.active');
      const aiSettings = {
        personality: personality ? personality.dataset.style : 'professional',
        suggestions: document.querySelector('[data-ai="suggestions"]')?.classList.contains('active'),
        gpa: document.querySelector('[data-ai="gpa"]')?.classList.contains('active'),
        assignments: document.querySelector('[data-ai="assignments"]')?.classList.contains('active'),
        exams: document.querySelector('[data-ai="exams"]')?.classList.contains('active'),
        plans: document.querySelector('[data-ai="plans"]')?.classList.contains('active')
      };
      localStorage.setItem('sv-ai-settings', JSON.stringify(aiSettings));
      showToast('AI Assistant settings saved!', 'success');
      addNotif('AI Settings Saved', 'Your AI Assistant preferences have been updated.', '&#129302;', 'general');
    });
  }

  const clearCacheBtn = document.getElementById('clearCacheBtn');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', function() {
      const keysToKeep = ['sv-user', 'sv-theme', 'sv-preset'];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sv-') && !keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      addNotif('Cache Cleared', 'App cache has been cleared.', '&#128451;', 'general');
      showToast('Cache cleared successfully!', 'success');
    });
  }

  const resetPrefsBtn = document.getElementById('resetPrefsBtn');
  if (resetPrefsBtn) {
    resetPrefsBtn.addEventListener('click', function() {
      if (confirm('Reset all settings to default? This cannot be undone.')) {
        const keep = ['sv-user'];
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sv-') && !keep.includes(key)) localStorage.removeItem(key);
        });
        localStorage.setItem('sv-theme', 'light');
        html.setAttribute('data-theme', 'light');
        addNotif('Preferences Reset', 'All settings have been restored to defaults.', '&#128260;', 'general');
        showToast('All preferences reset to default!', 'success');
        setTimeout(() => location.reload(), 1000);
      }
    });
  }

  const changePassBtn = document.getElementById('changePassBtn');
  if (changePassBtn) {
    changePassBtn.addEventListener('click', function() {
      const current = prompt('Enter current password:');
      if (!current) return;
      const newPass = prompt('Enter new password (min 6 characters):');
      if (!newPass || newPass.length < 6) { alert('Password must be at least 6 characters.'); return; }
      const confirm = prompt('Confirm new password:');
      if (newPass !== confirm) { alert('Passwords do not match.'); return; }
      addNotif('Password Changed', 'Your account password has been updated successfully.', '&#128274;', 'general');
      showToast('Password changed successfully!', 'success');
    });
  }

  const twoFactorToggle = document.getElementById('twoFactorToggle');
  if (twoFactorToggle) {
    twoFactorToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      if (this.classList.contains('active')) {
        setTimeout(() => showToast('Two-factor authentication enabled', 'success'), 200);
        addNotif('2FA Enabled', 'Two-factor authentication is now active.', '&#128274;', 'general');
      } else {
        showToast('Two-factor authentication disabled', 'info');
        addNotif('2FA Disabled', 'Two-factor authentication has been turned off.', '&#128275;', 'general');
      }
    });
  }

  const experimentalToggle = document.getElementById('experimentalToggle');
  if (experimentalToggle) {
    const saved = localStorage.getItem('sv-experimentalToggle');
    if (saved === 'true') experimentalToggle.classList.add('active');
    experimentalToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      localStorage.setItem('sv-experimentalToggle', this.classList.contains('active'));
      showToast(this.classList.contains('active') ? 'Experimental features enabled' : 'Experimental features disabled', 'info');
      addNotif('Experimental ' + (this.classList.contains('active') ? 'Enabled' : 'Disabled'), 'Experimental features ' + (this.classList.contains('active') ? 'are now active.' : 'have been turned off.'), '&#129302;', 'general');
    });
  }

  const devModeToggle = document.getElementById('devModeToggle');
  if (devModeToggle) {
    const saved = localStorage.getItem('sv-devModeToggle');
    if (saved === 'true') devModeToggle.classList.add('active');
    devModeToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      localStorage.setItem('sv-devModeToggle', this.classList.contains('active'));
      showToast(this.classList.contains('active') ? 'Developer mode enabled' : 'Developer mode disabled', 'info');
      addNotif('Dev Mode ' + (this.classList.contains('active') ? 'Enabled' : 'Disabled'), 'Developer mode ' + (this.classList.contains('active') ? 'is now active.' : 'has been turned off.'), '&#128295;', 'general');
    });
  }

  function loadSavedToggles() {
    document.querySelectorAll('.toggle[id]').forEach(toggle => {
      const saved = localStorage.getItem('sv-' + toggle.id);
      if (saved === 'true') toggle.classList.add('active');
    });
  }
  loadSavedToggles();

  function getAssignments() {
    try { return JSON.parse(localStorage.getItem('sv-assignments')) || []; } catch(e) { return []; }
  }

  function getAttempts() {
    try { return JSON.parse(localStorage.getItem('sv-quiz-attempts')) || []; } catch(e) { return []; }
  }

  function updateSuccessCenter() {
    var userData = JSON.parse(localStorage.getItem('sv-user')) || {};
    var profileData;
    try { profileData = JSON.parse(localStorage.getItem('sv-profile-data')); } catch(e) {}

    /* GPA from user or profile data */
    var gpa = profileData && profileData.gpa ? profileData.gpa : (userData.gpa || '—');
    var sGpa = document.getElementById('sGpa');
    if (sGpa && gpa !== '—') sGpa.textContent = gpa;

    /* GPA Goal Progress */
    var gpaTarget = parseFloat(document.getElementById('gpaTarget')?.value || 4.0);
    var gpaVal = parseFloat(gpa) || 0;
    var goalPct = gpaTarget > 0 ? Math.min(Math.round((gpaVal / gpaTarget) * 100), 100) : 0;
    var sGoal = document.getElementById('sGoalProgress');
    if (sGoal) {
      sGoal.textContent = goalPct + '%';
      var fill = sGoal.nextElementSibling?.querySelector('.s-fill');
      if (fill) fill.style.width = goalPct + '%';
    }

    /* Weekly Study Hours from productivity settings */
    var productivity;
    try { productivity = JSON.parse(localStorage.getItem('sv-productivity')); } catch(e) {}
    var studyHrs = (productivity && productivity.weekly) ? productivity.weekly : 0;
    var sStudy = document.getElementById('sStudyHours');
    if (sStudy) {
      sStudy.textContent = studyHrs;
      var studyFill = sStudy.nextElementSibling?.querySelector('.s-fill');
      if (studyFill) studyFill.style.width = Math.min(studyHrs / 30 * 100, 100) + '%';
    }

    /* Assignment Rate */
    var assignments = getAssignments();
    var completed = assignments.filter(function(a) { return a.status === 'completed'; }).length;
    var total = assignments.length;
    var assignRate = total > 0 ? Math.round(completed / total * 100) : 0;
    var sAssign = document.getElementById('sAssignRate');
    if (sAssign) {
      sAssign.textContent = assignRate + '%';
      var aFill = sAssign.nextElementSibling?.querySelector('.s-fill');
      if (aFill) aFill.style.width = assignRate + '%';
    }

    /* Quiz Success Rate */
    var attempts = getAttempts();
    var totalScore = 0, totalMax = 0;
    attempts.forEach(function(a) {
      totalScore += a.score || 0;
      totalMax += a.total || 0;
    });
    var quizRate = totalMax > 0 ? Math.round(totalScore / totalMax * 100) : 0;
    var sQuiz = document.getElementById('sQuizRate');
    if (sQuiz) {
      sQuiz.textContent = quizRate + '%';
      var qFill = sQuiz.nextElementSibling?.querySelector('.s-fill');
      if (qFill) qFill.style.width = quizRate + '%';
    }

    /* Day Streak - compute from daily login tracking */
    var today = new Date().toDateString();
    var lastVisit = localStorage.getItem('sv-last-visit') || '';
    var streak = parseInt(localStorage.getItem('sv-streak') || '0', 10);
    var yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastVisit !== today) {
      if (lastVisit === yesterday) {
        streak += 1;
      } else if (lastVisit !== '') {
        streak = 1;
      } else {
        streak = 1;
      }
      localStorage.setItem('sv-last-visit', today);
      localStorage.setItem('sv-streak', streak.toString());
    }

    var sStreak = document.getElementById('sStreak');
    if (sStreak) {
      sStreak.textContent = streak;
      var streakFill = sStreak.nextElementSibling?.querySelector('.s-fill');
      if (streakFill) streakFill.style.width = Math.min(streak / 30 * 100, 100) + '%';
    }

    /* Also update GPA target listener to recalculate goal progress */
    var gpaTargetInput = document.getElementById('gpaTarget');
    if (gpaTargetInput && !gpaTargetInput._listenerAttached) {
      gpaTargetInput._listenerAttached = true;
      gpaTargetInput.addEventListener('input', function() {
        var tgt = parseFloat(this.value) || 4.0;
        var cur = parseFloat(document.getElementById('sGpa')?.textContent || '0');
        var pct = tgt > 0 ? Math.min(Math.round((cur / tgt) * 100), 100) : 0;
        var el = document.getElementById('sGoalProgress');
        if (el) {
          el.textContent = pct + '%';
          var f = el.nextElementSibling?.querySelector('.s-fill');
          if (f) f.style.width = pct + '%';
        }
      });
    }
  }

  updateSuccessCenter();

  const savedFreq = localStorage.getItem('sv-notif-freq');
  if (savedFreq) {
    const freqBtn = document.querySelector('.freq-btn[data-freq="' + savedFreq + '"]');
    if (freqBtn) {
      document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
      freqBtn.classList.add('active');
    }
  }

})();
