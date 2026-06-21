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

  var savedTheme = localStorage.getItem('sv-theme') || 'dark';
  var html = document.documentElement;
  html.setAttribute('data-theme', savedTheme);

  var themeBtn = document.getElementById('themeToggleBtn');
  var themeIcon = document.getElementById('themeIcon');
  if (themeIcon) themeIcon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';

  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      var cur = html.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('sv-theme', next);
      if (themeIcon) themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }

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

  function getEnrolledIds() {
    var u = JSON.parse(localStorage.getItem('sv-user') || '{}');
    var raw = u.enrolledCourses || [];
    return raw.map(function(x){ return typeof x === 'string' ? x : (x.id || x.courseId); });
  }

  function getEnrolledCourses() {
    var ids = getEnrolledIds();
    return ids.map(function(id){ return regCourses.find(function(c){ return c.courseId === id; }); }).filter(Boolean);
  }

  function getSchedule() {
    return JSON.parse(localStorage.getItem('sv-schedule') || '[]');
  }

  function saveSchedule(arr) {
    localStorage.setItem('sv-schedule', JSON.stringify(arr));
  }

  function getStudyBlocks() {
    return JSON.parse(localStorage.getItem('sv-study-blocks') || '[]');
  }

  function saveStudyBlocks(arr) {
    localStorage.setItem('sv-study-blocks', JSON.stringify(arr));
  }

  var timeSlots = ["08:00-09:00","09:00-10:00","10:00-11:00","11:00-12:00","12:00-01:00","01:00-02:00","02:00-03:00","03:00-04:00","04:00-05:00"];
  var days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  var currentViewDay = "All";

  var subjectColorMap = {
    html: { bg:"rgba(10,102,194,0.2)", border:"#0A66C2", color:"#0A66C2", icon:"fa-code" },
    css: { bg:"rgba(10,102,194,0.2)", border:"#0A66C2", color:"#0A66C2", icon:"fa-code" },
    javascript: { bg:"rgba(231,163,62,0.2)", border:"#E7A33E", color:"#E7A33E", icon:"fa-js" },
    js: { bg:"rgba(231,163,62,0.2)", border:"#E7A33E", color:"#E7A33E", icon:"fa-js" },
    python: { bg:"rgba(5,118,66,0.2)", border:"#057642", color:"#057642", icon:"fa-python" },
    data: { bg:"rgba(5,118,66,0.2)", border:"#057642", color:"#057642", icon:"fa-chart-bar" },
    database: { bg:"rgba(10,102,194,0.2)", border:"#0A66C2", color:"#0A66C2", icon:"fa-database" },
    network: { bg:"rgba(10,102,194,0.2)", border:"#0A66C2", color:"#0A66C2", icon:"fa-network-wired" },
    security: { bg:"rgba(204,16,22,0.2)", border:"#CC1016", color:"#CC1016", icon:"fa-shield-alt" },
    cloud: { bg:"rgba(10,102,194,0.2)", border:"#0A66C2", color:"#0A66C2", icon:"fa-cloud" },
    mobile: { bg:"rgba(10,102,194,0.2)", border:"#0A66C2", color:"#0A66C2", icon:"fa-mobile-alt" },
    react: { bg:"rgba(10,102,194,0.2)", border:"#0A66C2", color:"#0A66C2", icon:"fa-react" },
    node: { bg:"rgba(5,118,66,0.2)", border:"#057642", color:"#057642", icon:"fa-server" }
  };

  var extraCourseColors = [
    { bg:"rgba(253,121,168,0.2)", border:"#FD79A8", color:"#FD79A8", icon:"fa-star" },
    { bg:"rgba(255,165,2,0.2)", border:"#FFA502", color:"#FFA502", icon:"fa-bolt" },
    { bg:"rgba(85,239,196,0.2)", border:"#55EFC4", color:"#55EFC4", icon:"fa-leaf" },
    { bg:"rgba(116,185,255,0.2)", border:"#74B9FF", color:"#74B9FF", icon:"fa-water" },
    { bg:"rgba(255,118,117,0.2)", border:"#FF7675", color:"#FF7675", icon:"fa-heart" },
    { bg:"rgba(162,155,254,0.2)", border:"#A29BFE", color:"#A29BFE", icon:"fa-gem" }
  ];

  var extraColorIndex = 0;
  function getSubjectTheme(subject) {
    var s = (subject || '').toLowerCase();
    for (var key in subjectColorMap) {
      if (s.indexOf(key) > -1) return subjectColorMap[key];
    }
    var theme = extraCourseColors[extraColorIndex % extraCourseColors.length];
    extraColorIndex++;
    return theme || { bg:"rgba(108,92,231,0.1)", border:"#6C5CE7", color:"#6C5CE7", icon:"fa-book" };
  }

  var tableHead = document.getElementById('tableHead');
  var tableBody = document.getElementById('tableBody');
  var toggleViewBtn = document.getElementById('toggleViewBtn');

  function renderTimetable() {
    var scheduleData = getSchedule();

    tableHead.innerHTML = '<tr><th style="min-width:70px;"><i class="far fa-clock"></i> Time</th></tr>';
    var headerRow = tableHead.querySelector('tr');
    var daysToShow = currentViewDay === "All" ? days : [currentViewDay];

    daysToShow.forEach(function(day) {
      var th = document.createElement('th');
      th.className = 'day-header';
      th.innerHTML = '<i class="fas fa-calendar-day" style="margin-right:4px;"></i> ' + day;
      th.title = 'Click to view only this day';
      th.onclick = function() {
        currentViewDay = day;
        renderTimetable();
        updateViewButton();
      };
      headerRow.appendChild(th);
    });

    tableBody.innerHTML = '';
    timeSlots.forEach(function(slot) {
      var row = document.createElement('tr');
      row.innerHTML = '<td style="font-weight:600;font-size:0.78rem;"><i class="far fa-clock"></i> ' + slotDisplay(slot) + '</td>';
      daysToShow.forEach(function(day) {
        var cell = document.createElement('td');
        var classObj = scheduleData.find(function(s) { return s.day === day && s.timeSlot === slot; });
        if (classObj) {
          var theme = getSubjectTheme(classObj.subject);
          cell.innerHTML =
            '<div class="subject-card" style="background:' + theme.bg + ';border-left:3px solid ' + theme.border + ';">' +
              '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div style="flex:1;min-width:0;">' +
                  '<h4 style="color:' + theme.color + ';font-size:0.9rem;margin-bottom:4px;"><i class="fas ' + theme.icon + '" style="margin-right:4px;"></i> ' + classObj.subject + '</h4>' +
                  '<p style="font-size:0.75rem;color:var(--text-muted);margin:3px 0;"><i class="fas fa-user-tie" style="width:14px;opacity:0.6;"></i> ' + classObj.teacher + '</p>' +
                  '<p style="font-size:0.75rem;color:var(--text-muted);margin:3px 0;"><i class="fas fa-map-marker-alt" style="width:14px;opacity:0.6;"></i> ' + classObj.room + '</p>' +
                '</div>' +
                '<button class="delete-schedule-btn" data-id="' + classObj.id + '" title="Delete" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1rem;padding:2px 6px;opacity:0.5;transition:0.2s;">&#10005;</button>' +
              '</div>' +
            '</div>';
        } else {
          cell.innerHTML = '<span style="color:var(--text-muted);opacity:0.2;font-size:0.8rem;">—</span>';
        }
        row.appendChild(cell);
      });
      tableBody.appendChild(row);
    });

    updateNextClass();
  }

  function slotDisplay(slot) {
    var parts = slot.split('-');
    if (parts.length !== 2) return slot;
    function fmt(t) {
      var h = parseInt(t.split(':')[0]);
      var m = t.split(':')[1];
      var ampm = h >= 12 ? 'PM' : 'AM';
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return h + ':' + m + ' ' + ampm;
    }
    return fmt(parts[0]) + ' - ' + fmt(parts[1]);
  }

  function updateNextClass() {
    var scheduleData = getSchedule();
    var nextDiv = document.getElementById('nextClassContent');
    if (!nextDiv) return;

    if (scheduleData.length === 0) {
      nextDiv.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">No classes scheduled yet.</p>';
      return;
    }

    var today = new Date();
    var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var todayName = dayNames[today.getDay()];
    var currentHour = today.getHours();
    var currentMin = today.getMinutes();

    var upcoming = null;
    var sorted = scheduleData.filter(function(s){ return s.day === todayName; }).sort(function(a,b){ return a.timeSlot.localeCompare(b.timeSlot); });
    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i];
      var startH = parseInt(s.timeSlot.split(':')[0]);
      var startM = parseInt(s.timeSlot.split(':')[1] || '0');
      if (startH > currentHour || (startH === currentHour && startM >= currentMin)) {
        upcoming = s;
        break;
      }
    }
    if (!upcoming && sorted.length > 0) upcoming = sorted[0];

    if (upcoming) {
      var theme = getSubjectTheme(upcoming.subject);
      nextDiv.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
          '<div style="width:40px;height:40px;border-radius:10px;background:' + theme.bg + ';display:flex;align-items:center;justify-content:center;color:' + theme.color + ';font-size:1.1rem;"><i class="fas ' + theme.icon + '"></i></div>' +
          '<div><h4 style="font-size:1.1rem;font-weight:700;color:' + theme.color + ';">' + upcoming.subject + '</h4></div>' +
        '</div>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);margin:6px 0;"><i class="far fa-clock" style="width:18px;"></i> ' + slotDisplay(upcoming.timeSlot) + '</p>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);margin:6px 0;"><i class="fas fa-map-marker-alt" style="width:18px;"></i> ' + upcoming.room + '</p>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);margin:6px 0;"><i class="fas fa-user-tie" style="width:18px;"></i> ' + upcoming.teacher + '</p>';
    } else {
      nextDiv.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">No classes scheduled for today.</p>';
    }
  }

  function updateViewButton() {
    if (!toggleViewBtn) return;
    if (currentViewDay === "All") {
      toggleViewBtn.innerHTML = '<i class="far fa-calendar-alt"></i> Weekly View';
      toggleViewBtn.classList.remove('active');
    } else {
      toggleViewBtn.innerHTML = '<i class="fas fa-calendar-day"></i> Day: ' + currentViewDay;
      toggleViewBtn.classList.add('active');
    }
  }

  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', function() {
      currentViewDay = currentViewDay === "All" ? "Monday" : "All";
      renderTimetable();
      updateViewButton();
    });
  }

  function updateHeroCourse() {
    var courses = getEnrolledCourses();
    var title = document.getElementById('courseTitle');
    var sub = document.getElementById('courseSubtitle');
    var badge = document.getElementById('badgeCourseName');
    if (courses.length > 0) {
      var names = courses.map(function(c){ return c.name; });
      if (names.length === 1) {
        title.textContent = names[0];
        sub.textContent = 'Your personalized weekly schedule';
      } else {
        title.textContent = 'My Weekly Schedule';
        sub.textContent = names.length + ' enrolled courses';
      }
      badge.textContent = names.length > 1 ? names[0] + (names.length > 1 ? ' +' + (names.length - 1) : '') : names[0];
    } else {
      title.textContent = 'My Weekly Schedule';
      sub.textContent = 'Add your classes and study blocks';
      badge.textContent = 'No courses enrolled';
    }
  }

  function buildSubjectOptions() {
    var sel = document.getElementById('subName');
    if (!sel) return;
    var courses = getEnrolledCourses();
    sel.innerHTML = '<option value="" disabled selected>Select your enrolled course</option>';
    courses.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name + ' (' + c.courseId + ')';
      sel.appendChild(opt);
    });
    if (courses.length === 0) {
      sel.innerHTML = '<option value="" disabled>No enrolled courses. Register first.</option>';
    }
  }

  function renderStudyBlocks() {
    var blocksList = document.getElementById('studyBlocksList');
    if (!blocksList) return;
    var data = getStudyBlocks();
    if (data.length === 0) {
      blocksList.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:10px 0;">No study blocks yet.</p>';
      return;
    }
    blocksList.innerHTML = '';
    data.forEach(function(block) {
      var div = document.createElement('div');
      div.className = 'study-block';
      div.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div>' +
            '<h4 style="font-size:0.95rem;margin-bottom:4px;"><i class="fas fa-tasks" style="color:var(--accent2);margin-right:6px;"></i>' + block.title + '</h4>' +
            '<p style="font-size:0.82rem;color:var(--text-muted);"><i class="far fa-calendar-alt" style="margin-right:4px;"></i> ' + block.day + ' &bull; ' + block.time + '</p>' +
          '</div>' +
          '<button class="delete-block-btn" data-id="' + block.id + '" title="Delete" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1rem;padding:2px 6px;opacity:0.5;transition:0.2s;">&#10005;</button>' +
        '</div>';
      blocksList.appendChild(div);
    });
  }

  var schedModal = document.getElementById('scheduleModal');
  var blockModal = document.getElementById('blockModal');

  document.getElementById('openAddModal').onclick = function() { buildSubjectOptions(); schedModal.classList.add('active'); };
  document.getElementById('closeModal').onclick = function() { schedModal.classList.remove('active'); };
  document.getElementById('openBlockModal').onclick = function() { blockModal.classList.add('active'); };
  document.getElementById('closeBlockModal').onclick = function() { blockModal.classList.remove('active'); };

  window.onclick = function(e) {
    if (e.target === schedModal) schedModal.classList.remove('active');
    if (e.target === blockModal) blockModal.classList.remove('active');
  };

  var scheduleForm = document.getElementById('scheduleForm');
  if (scheduleForm) {
    scheduleForm.onsubmit = function(e) {
      e.preventDefault();
      var subName = document.getElementById('subName').value;
      var teacherName = document.getElementById('teacherName').value;
      var roomNum = document.getElementById('roomNum').value;
      var classDay = document.getElementById('classDay').value;
      var timeSlot = document.getElementById('timeSlot').value;

      var scheduleData = getSchedule();
      var isBooked = scheduleData.find(function(s) { return s.day === classDay && s.timeSlot === timeSlot; });
      if (isBooked) {
        alert('This time slot is already booked for ' + classDay + ' (' + isBooked.subject + ').');
        return;
      }

      scheduleData.push({
        id: Date.now(),
        subject: subName,
        day: classDay,
        timeSlot: timeSlot,
        teacher: teacherName,
        room: roomNum
      });
      saveSchedule(scheduleData);

      renderTimetable();
      schedModal.classList.remove('active');
      e.target.reset();
      showToast('Class added!');
      addNotif('Class Added', subName + ' scheduled on ' + classDay + ' at ' + timeSlot + ' by ' + teacherName, '&#128218;', 'general');
    };
  }

  var blockForm = document.getElementById('blockForm');
  if (blockForm) {
    blockForm.onsubmit = function(e) {
      e.preventDefault();
      var title = document.getElementById('blockTitle').value;
      var day = document.getElementById('blockDay').value;
      var time = document.getElementById('blockTime').value;

      var data = getStudyBlocks();
      data.push({ id: Date.now(), title: title, day: day, time: time });
      saveStudyBlocks(data);

      renderStudyBlocks();
      blockModal.classList.remove('active');
      e.target.reset();
      showToast('Study block added!');
      addNotif('Study Block Added', '"' + title + '" on ' + day + ' at ' + time, '&#9201;', 'general');
    };
  }

  document.addEventListener('click', function(e) {
    var delSched = e.target.closest('.delete-schedule-btn');
    if (delSched) {
      var id = parseInt(delSched.getAttribute('data-id'));
      var data = getSchedule().filter(function(s) { return s.id !== id; });
      saveSchedule(data);
      renderTimetable();
      showToast('Class deleted');
      addNotif('Class Deleted', 'A class has been removed from the timetable.', '&#128465;', 'general');
      return;
    }
    var delBlock = e.target.closest('.delete-block-btn');
    if (delBlock) {
      var bid = parseInt(delBlock.getAttribute('data-id'));
      var bdata = getStudyBlocks().filter(function(b) { return b.id !== bid; });
      saveStudyBlocks(bdata);
      renderStudyBlocks();
      showToast('Study block deleted');
      addNotif('Study Block Deleted', 'A study block has been removed.', '&#128465;', 'general');
      return;
    }
  });

  document.getElementById('downloadTimetableBtn').addEventListener('click', function() {
    var container = document.getElementById('timetableContainer');
    if (!container) return;
    var btn = this;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rendering...';
    btn.disabled = true;

    var isDark = html.getAttribute('data-theme') === 'dark';
    var bgColor = isDark ? '#0B0E1A' : '#F0F2F8';

    var clone = container.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = container.offsetWidth + 'px';
    clone.style.padding = '24px';
    clone.style.borderRadius = '0';
    clone.style.background = bgColor;
    clone.querySelectorAll('*').forEach(function(el) {
      var b = window.getComputedStyle(el).background;
      if (b && b.indexOf('rgba') > -1 && b.indexOf('linear-gradient') === -1) {
        el.style.background = b.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/g, 'rgb($1,$2,$3)');
      }
      if (el.style.backdropFilter) el.style.backdropFilter = 'none';
      el.style.backdropFilter = 'none';
      if (el.style.WebkitBackdropFilter) el.style.WebkitBackdropFilter = 'none';
    });
    document.body.appendChild(clone);

    html2canvas(clone, {
      scale: 3,
      useCORS: true,
      backgroundColor: bgColor,
      logging: false,
      allowTaint: false
    }).then(function(canvas) {
      document.body.removeChild(clone);
      var link = document.createElement('a');
      link.download = 'Timetable_' + new Date().toISOString().split('T')[0] + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      btn.innerHTML = '<i class="fas fa-download"></i> Download';
      btn.disabled = false;
      showToast('Timetable downloaded!');
      addNotif('Timetable Downloaded', 'Your timetable has been downloaded as PNG.', '&#128229;', 'general');
    }).catch(function(err) {
      if (clone.parentNode) document.body.removeChild(clone);
      console.error(err);
      btn.innerHTML = '<i class="fas fa-download"></i> Download';
      btn.disabled = false;
      showToast('Failed to render. Check console.');
    });
  });

  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = '<i class="fas fa-check-circle" style="color:var(--success);margin-right:8px;"></i> ' + msg;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 3000);
  }

  updateHeroCourse();
  renderTimetable();
  renderStudyBlocks();

})();
