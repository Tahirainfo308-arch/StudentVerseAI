(function() {
  const savedTheme = localStorage.getItem('sv-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sv-theme', theme);
  }

  /* Notification helpers for login/register pages */
  function addNotif(title, text, icon, page) {
    var notifs = JSON.parse(localStorage.getItem('sv-notifications') || '[]');
    notifs.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      title: title,
      text: text,
      icon: icon || '&#128276;',
      page: page || 'general',
      time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      read: false
    });
    localStorage.setItem('sv-notifications', JSON.stringify(notifs));
  }

  const themeBtns = document.querySelectorAll('.theme-toggle');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  function togglePasswordVisibility(btn) {
    const input = btn.parentElement.querySelector('input');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      togglePasswordVisibility(this);
    });
  });

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      let valid = true;

      const email = document.getElementById('email');
      const password = document.getElementById('password');
      const emailGroup = email.closest('.form-group');
      const passGroup = password.closest('.form-group');

      emailGroup.classList.remove('error');
      passGroup.classList.remove('error');

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        emailGroup.classList.add('error');
        valid = false;
      }

      if (password.value.trim().length < 6) {
        passGroup.classList.add('error');
        valid = false;
      }

      if (valid) {
        var userData = {
          name: email.value.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); }).trim() || 'Student',
          email: email.value.trim(),
          department: 'Computer Science',
          semester: '',
          studentId: 'STU-' + Date.now().toString().slice(-6),
          enrolledCourses: ["CS-101","CS-201","CS-202","WEB-101","WEB-401","DS-101"]
        };
        localStorage.setItem('sv-user', JSON.stringify(userData));

        /* Save to sv-users registry */
        var allUsers = JSON.parse(localStorage.getItem('sv-users') || '[]');
        var existingIdx = allUsers.findIndex(function(u){ return u.email === userData.email; });
        if (existingIdx > -1) { allUsers[existingIdx] = userData; }
        else { allUsers.push(userData); }
        localStorage.setItem('sv-users', JSON.stringify(allUsers));

        var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
        var userId = userData.email;
        (userData.enrolledCourses || []).forEach(function(cid){
          if (!groups[cid]) {
            var c = regCourses.find(function(x){ return x.courseId === cid; });
            if (c) groups[cid] = { courseId: cid, courseName: c.name, category: c.category, members: [], messages: [], notes: [] };
          }
          if (groups[cid] && groups[cid].members.indexOf(userId) === -1) groups[cid].members.push(userId);
        });
        localStorage.setItem('sv-course-groups', JSON.stringify(groups));
        addNotif('Welcome Back!', 'You have successfully logged in to StudentVerseAI.', '&#128075;', 'general');
        window.location.href = 'dashboard.html';
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const regPassword = document.getElementById('regPassword');
    const strengthBars = document.querySelectorAll('#passwordStrength span');

    regPassword.addEventListener('input', function() {
      const val = this.value;
      let strength = 0;
      if (val.length >= 6) strength++;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
      if (/\d/.test(val)) strength++;
      if (/[^a-zA-Z0-9]/.test(val)) strength++;

      strengthBars.forEach((bar, i) => {
        bar.className = '';
        if (i < Math.min(strength, 3)) {
          bar.classList.add('active');
          if (strength <= 2) bar.classList.add('weak');
          else if (strength <= 3) bar.classList.add('medium');
          else bar.classList.add('strong');
        }
      });
    });

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

    /* ===== SEARCHABLE COURSE MULTISELECT ===== */
    var selectedCourses = [];
    var courseSearchInput = document.getElementById('courseSearchInput');
    var courseDropdown = document.getElementById('courseDropdown');
    var selectedTags = document.getElementById('selectedTags');
    var allCourses = regCourses.slice();

    function renderDropdown(filter) {
      var q = (filter || '').toLowerCase().trim();
      var visible = q ? allCourses.filter(function(c){ return c.name.toLowerCase().includes(q) || c.courseId.toLowerCase().includes(q) || c.category.toLowerCase().includes(q); }) : allCourses;
      if (visible.length === 0) {
        courseDropdown.innerHTML = '<div class="dropdown-empty">No courses found. Try a different search.</div>';
        courseDropdown.classList.add('open');
        return;
      }
      courseDropdown.innerHTML = visible.map(function(c){
        var isSel = selectedCourses.indexOf(c.courseId) > -1;
        return '<div class="dropdown-item' + (isSel ? ' selected' : '') + '" data-cid="' + c.courseId + '">' +
          '<span class="item-check">&#10003;</span>' +
          '<span>' + escHtml(c.name) + '</span>' +
          '<span class="item-category">' + escHtml(c.category) + '</span>' +
        '</div>';
      }).join('');
      courseDropdown.classList.add('open');
    }

    function selectCourse(cid) {
      var idx = selectedCourses.indexOf(cid);
      if (idx > -1) { selectedCourses.splice(idx, 1); }
      else { selectedCourses.push(cid); }
      renderTags();
      renderDropdown(courseSearchInput.value);
      var err = document.getElementById('courseError');
      if (selectedCourses.length > 0) err.style.display = 'none';
    }

    function renderTags() {
      selectedTags.innerHTML = selectedCourses.map(function(cid){
        var c = allCourses.find(function(x){ return x.courseId === cid; });
        return '<span class="course-tag">' + (c ? escHtml(c.name) : cid) + '<button type="button" class="tag-remove" data-cid="' + cid + '">&times;</button></span>';
      }).join('');
    }

    function escHtml(s) {
      if (!s) return '';
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    if (courseSearchInput) {
      courseSearchInput.addEventListener('input', function(){ renderDropdown(this.value); });
      courseSearchInput.addEventListener('focus', function(){ renderDropdown(this.value); });
      courseSearchInput.addEventListener('blur', function(){ setTimeout(function(){ courseDropdown.classList.remove('open'); }, 200); });
      courseSearchInput.addEventListener('keydown', function(e){
        if (e.key === 'Enter' && courseDropdown.classList.contains('open')) {
          var first = courseDropdown.querySelector('.dropdown-item:not(.selected)');
          if (first) { selectCourse(first.dataset.cid); e.preventDefault(); }
        }
        if (e.key === 'Backspace' && !this.value && selectedCourses.length > 0) {
          selectCourse(selectedCourses[selectedCourses.length - 1]);
        }
      });
    }

    document.addEventListener('click', function(e){
      var item = e.target.closest('.dropdown-item');
      if (item && courseDropdown.classList.contains('open')) { selectCourse(item.dataset.cid); return; }
      var removeBtn = e.target.closest('.tag-remove');
      if (removeBtn) { selectCourse(removeBtn.dataset.cid); e.preventDefault(); return; }
    });

    /* Close dropdown when clicking outside */
    document.addEventListener('click', function(e){
      var ms = document.getElementById('courseMultiselect');
      if (ms && !ms.contains(e.target)) courseDropdown.classList.remove('open');
    });

    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      let valid = true;

      const fields = {
        fullName: document.getElementById('fullName'),
        studentId: document.getElementById('studentId'),
        regEmail: document.getElementById('regEmail'),
        university: document.getElementById('university'),
        department: document.getElementById('department'),
        regPassword: document.getElementById('regPassword'),
        confirmPassword: document.getElementById('confirmPassword')
      };

      Object.values(fields).forEach(function(f){
        if (f) f.closest('.form-group')?.classList.remove('error');
      });

      if (!fields.fullName.value.trim()) {
        fields.fullName.closest('.form-group').classList.add('error');
        valid = false;
      }
      if (!fields.studentId.value.trim()) {
        fields.studentId.closest('.form-group').classList.add('error');
        valid = false;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(fields.regEmail.value.trim())) {
        fields.regEmail.closest('.form-group').classList.add('error');
        valid = false;
      }
      if (!fields.university.value.trim()) {
        fields.university.closest('.form-group').classList.add('error');
        valid = false;
      }
      if (!fields.department.value.trim()) {
        fields.department.closest('.form-group').classList.add('error');
        valid = false;
      }
      if (fields.regPassword.value.trim().length < 6) {
        fields.regPassword.closest('.form-group').classList.add('error');
        valid = false;
      }
      if (fields.confirmPassword.value.trim() !== fields.regPassword.value.trim()) {
        fields.confirmPassword.closest('.form-group').classList.add('error');
        valid = false;
      }

      var courseError = document.getElementById('courseError');
      if (selectedCourses.length === 0) {
        if (courseError) courseError.style.display = 'block';
        valid = false;
      } else {
        if (courseError) courseError.style.display = 'none';
      }

      if (valid) {
        var userData = {
          name: fields.fullName.value.trim(),
          studentId: fields.studentId.value.trim(),
          email: fields.regEmail.value.trim(),
          university: fields.university.value.trim(),
          department: fields.department.value.trim(),
          semester: '',
          enrolledCourses: selectedCourses
        };
        localStorage.setItem('sv-user', JSON.stringify(userData));

        /* Save to sv-users registry */
        var allUsers = JSON.parse(localStorage.getItem('sv-users') || '[]');
        var existingIdx = allUsers.findIndex(function(u){ return u.email === userData.email; });
        if (existingIdx > -1) { allUsers[existingIdx] = userData; }
        else { allUsers.push(userData); }
        localStorage.setItem('sv-users', JSON.stringify(allUsers));

        var groups = JSON.parse(localStorage.getItem('sv-course-groups')) || {};
        var userId = userData.email;
        selectedCourses.forEach(function(cid){
          if (!groups[cid]) {
            var c = regCourses.find(function(x){ return x.courseId === cid; });
            if (c) {
              groups[cid] = { courseId: cid, courseName: c.name, category: c.category, members: [], messages: [], notes: [] };
            }
          }
          if (groups[cid] && groups[cid].members.indexOf(userId) === -1) {
            groups[cid].members.push(userId);
          }
        });
        localStorage.setItem('sv-course-groups', JSON.stringify(groups));
        addNotif('Account Created!', 'Welcome to StudentVerseAI, ' + userData.name + '! Your account has been created successfully.', '&#127881;', 'general');
        window.location.href = 'dashboard.html';
      }
    });
  }
})();
